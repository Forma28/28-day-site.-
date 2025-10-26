/*********************************************************
 * ProgressFit X — Telegram Bot on Google Apps Script
 * v3.6 (stable, single-file)
 **********************************************************/

var _CONFIG_CACHE = null;
var _SHEET_CACHE = null;
var _ROWS_CACHE = {};

function config() {
  if (_CONFIG_CACHE) {
    return _CONFIG_CACHE;
  }

  var defaults = {
    BOT_TOKEN: '',
    BOT_USERNAME: '',
    SHEET_ID: '',
    ADMIN_IDS: [],
    CHANNEL_LINK: 'https://t.me/your_channel',
    CHAT_LINK: 'https://t.me/your_chat',
    SUPPORT_LINK: 'https://t.me/your_support',
    PAYMENTS_ENABLED: false,
    PROVIDER_TOKEN: '',
    CURRENCY: 'USD',
    CARD_NUMBER: '',
    CARD_HOLDER: '',
    CRYPTO_USDT: '',
    CRYPTO_BTC: '',
    DONATE_URL: '',
    WEBHOOK_SECRET: 'CHANGE_ME_SECRET',
    AI_ENABLED: true,
    OPENAI_API_KEY: '',
    AI_MODEL: 'gpt-4o-mini',
    AI_TIMEOUT_MS: 15000,
    AI_MAX_TOKENS: 900,
    LITE_PRICE_USD: 5,
    PRO_PRICE_USD: 10,
    SESSION_PRICE_USD: 20,
    SUPP_CONSULT_PRICE_USD: 9,
    USERS_SHEET: 'users',
    PLANS_SHEET: 'plans',
    NUTRITION_SHEET: 'nutrition',
    CONTENT_SHEET: 'content',
    PROGRESS_SHEET: 'progress',
    SESSIONS_SHEET: 'sessions',
    FAILURES_SHEET: 'failures',
    METRICS_SHEET: 'metrics_daily'
  };

  var props = (typeof PropertiesService !== 'undefined' &&
    PropertiesService.getScriptProperties)
    ? PropertiesService.getScriptProperties()
    : null;

  function readProp(key) {
    if (!props) return null;
    var value = props.getProperty(key);
    return value === undefined ? null : value;
  }

  function stringProp(key, fallback) {
    var value = readProp(key);
    if (value === null || value === '') return fallback;
    return String(value);
  }

  function boolProp(key, fallback) {
    var value = readProp(key);
    if (value === null) return fallback;
    if (typeof value === 'boolean') return value;
    var normalized = String(value).toLowerCase().trim();
    if (normalized === 'true') return true;
    if (normalized === 'false') return false;
    return fallback;
  }

  function numberProp(key, fallback) {
    var value = readProp(key);
    if (value === null) return fallback;
    var num = Number(value);
    return isNaN(num) ? fallback : num;
  }

  function listProp(key, fallback) {
    var value = readProp(key);
    if (value === null) return fallback;
    var list = null;
    try {
      var parsed = JSON.parse(value);
      if (Array.isArray(parsed)) {
        list = parsed;
      }
    } catch (e) {
      list = null;
    }
    if (!list) {
      list = String(value)
        .split(',')
        .map(function (item) { return String(item).trim(); })
        .filter(function (item) { return item.length > 0; });
    }
    return list.length ? list.map(String) : fallback;
  }

  var cfg = {
    BOT_TOKEN: stringProp('BOT_TOKEN', defaults.BOT_TOKEN),
    BOT_USERNAME: stringProp('BOT_USERNAME', defaults.BOT_USERNAME),
    SHEET_ID: stringProp('SHEET_ID', defaults.SHEET_ID),
    ADMIN_IDS: listProp('ADMIN_IDS', defaults.ADMIN_IDS),
    CHANNEL_LINK: stringProp('CHANNEL_LINK', defaults.CHANNEL_LINK),
    CHAT_LINK: stringProp('CHAT_LINK', defaults.CHAT_LINK),
    SUPPORT_LINK: stringProp('SUPPORT_LINK', defaults.SUPPORT_LINK),
    PAYMENTS_ENABLED: boolProp('PAYMENTS_ENABLED', defaults.PAYMENTS_ENABLED),
    PROVIDER_TOKEN: stringProp('PROVIDER_TOKEN', defaults.PROVIDER_TOKEN),
    CURRENCY: stringProp('CURRENCY', defaults.CURRENCY),
    CARD_NUMBER: stringProp('CARD_NUMBER', defaults.CARD_NUMBER),
    CARD_HOLDER: stringProp('CARD_HOLDER', defaults.CARD_HOLDER),
    CRYPTO_USDT: stringProp('CRYPTO_USDT', defaults.CRYPTO_USDT),
    CRYPTO_BTC: stringProp('CRYPTO_BTC', defaults.CRYPTO_BTC),
    DONATE_URL: stringProp('DONATE_URL', defaults.DONATE_URL),
    WEBHOOK_SECRET: stringProp('WEBHOOK_SECRET', defaults.WEBHOOK_SECRET),
    AI_ENABLED: boolProp('AI_ENABLED', defaults.AI_ENABLED),
    OPENAI_API_KEY: stringProp('OPENAI_API_KEY', defaults.OPENAI_API_KEY),
    AI_MODEL: stringProp('AI_MODEL', defaults.AI_MODEL),
    AI_TIMEOUT_MS: numberProp('AI_TIMEOUT_MS', defaults.AI_TIMEOUT_MS),
    AI_MAX_TOKENS: numberProp('AI_MAX_TOKENS', defaults.AI_MAX_TOKENS),
    LITE_PRICE_USD: numberProp('LITE_PRICE_USD', defaults.LITE_PRICE_USD),
    PRO_PRICE_USD: numberProp('PRO_PRICE_USD', defaults.PRO_PRICE_USD),
    SESSION_PRICE_USD: numberProp('SESSION_PRICE_USD', defaults.SESSION_PRICE_USD),
    SUPP_CONSULT_PRICE_USD: numberProp('SUPP_CONSULT_PRICE_USD', defaults.SUPP_CONSULT_PRICE_USD),
    USERS_SHEET: stringProp('USERS_SHEET', defaults.USERS_SHEET),
    PLANS_SHEET: stringProp('PLANS_SHEET', defaults.PLANS_SHEET),
    NUTRITION_SHEET: stringProp('NUTRITION_SHEET', defaults.NUTRITION_SHEET),
    CONTENT_SHEET: stringProp('CONTENT_SHEET', defaults.CONTENT_SHEET),
    PROGRESS_SHEET: stringProp('PROGRESS_SHEET', defaults.PROGRESS_SHEET),
    SESSIONS_SHEET: stringProp('SESSIONS_SHEET', defaults.SESSIONS_SHEET),
    FAILURES_SHEET: stringProp('FAILURES_SHEET', defaults.FAILURES_SHEET),
    METRICS_SHEET: stringProp('METRICS_SHEET', defaults.METRICS_SHEET)
  };

  if (!cfg.SHEET_ID) {
    throw new Error('SHEET_ID is not configured. Add it to script properties.');
  }

  _CONFIG_CACHE = cfg;
  return cfg;
}

function clearSheetCache() {
  _SHEET_CACHE = null;
  _ROWS_CACHE = {};
}

/* ====== utils ====== */
function J(o){return JSON.stringify(o);} function P(s){try{return JSON.parse(s);}catch(_){return null;}}
function TZ(){return 'Europe/Kyiv';} function todayStr(){return Utilities.formatDate(new Date(),TZ(),'yyyy-MM-dd');}
function dstr(d){return Utilities.formatDate(d,TZ(),'yyyy-MM-dd');} function safe(s){return (s==null)?'':String(s).trim();}
function parseISODate(str){const v=safe(str); if(!v)return null; const d=new Date(v); return isNaN(d.getTime())?null:d;}
function isSameDay(a,b){return a&&b&&a.getFullYear()===b.getFullYear()&&a.getMonth()===b.getMonth()&&a.getDate()===b.getDate();}
function isBeforeDay(a,b){if(!a||!b)return false; const da=new Date(a.getFullYear(),a.getMonth(),a.getDate()); const db=new Date(b.getFullYear(),b.getMonth(),b.getDate()); return da.getTime()<db.getTime();}
function logFail(ctx,err){try{const sh=getSheet(config().FAILURES_SHEET); sh.appendRow([new Date(),ctx&&ctx.type||'',ctx&&ctx.user&&ctx.user.id||'',(err&&err.message)||String(err),JSON.stringify(ctx&&ctx.raw||{})]);}catch(_){ }}

/* ====== sheets ====== */
function SS(){ if(!_SHEET_CACHE){ _SHEET_CACHE=SpreadsheetApp.openById(config().SHEET_ID);} return _SHEET_CACHE; }
function getSheet(name){return SS().getSheetByName(name)||SS().insertSheet(name);}
function ensureHeader(name,header){const sh=getSheet(name),v=sh.getDataRange().getValues(); if(v.length===0||v[0].join('|')!==header.join('|')){sh.clear(); sh.getRange(1,1,1,header.length).setValues([header]);} if(_ROWS_CACHE[name]) delete _ROWS_CACHE[name];}
function rows(name){ if(_ROWS_CACHE[name]) return _ROWS_CACHE[name]; const sh=getSheet(name),v=sh.getDataRange().getValues(); if(v.length<2){ _ROWS_CACHE[name]=[]; return _ROWS_CACHE[name]; } const h=v[0]; const data=v.slice(1).filter(r=>r.some(x=>x!=='' )).map(r=>{const o={}; h.forEach((k,i)=>o[k]=r[i]); return o;}); _ROWS_CACHE[name]=data; return data; }
function append(name,obj){const sh=getSheet(name),v=sh.getDataRange().getValues(); if(!v.length||!v[0].length) throw new Error('No header '+name); const h=v[0]; sh.appendRow(h.map(k=>obj.hasOwnProperty(k)?obj[k]:'')); if(_ROWS_CACHE[name]) delete _ROWS_CACHE[name];}
function upsert(name,keyField,keyValue,obj){const sh=getSheet(name),v=sh.getDataRange().getValues(); if(v.length===0)throw new Error('No header '+name); const h=v[0],idx=h.indexOf(keyField); if(idx<0)throw new Error('Key not found '+keyField); let row=-1; for(let i=1;i<v.length;i++){if(String(v[i][idx])===String(keyValue)){row=i;break;}} const data=h.map(k=>obj.hasOwnProperty(k)?obj[k]:''); if(row===-1)sh.appendRow(data); else sh.getRange(row+1,1,1,h.length).setValues([data]); if(_ROWS_CACHE[name]) delete _ROWS_CACHE[name];}
function setProgressStatus(userId,date,status){const name=config().PROGRESS_SHEET; const sh=getSheet(name); const data=sh.getDataRange().getValues(); if(!data.length) throw new Error('No header '+name); const header=data[0]; const idxUser=header.indexOf('user_id'); const idxDate=header.indexOf('date'); const idxStatus=header.indexOf('status'); if(idxUser<0||idxDate<0||idxStatus<0) throw new Error('progress sheet misconfigured'); let rowIndex=-1; for(let i=1;i<data.length;i++){if(String(data[i][idxUser])===String(userId)&&String(data[i][idxDate])===String(date)){rowIndex=i; break;}} if(rowIndex===-1){const row=header.map(k=>{if(k==='user_id')return userId; if(k==='date')return date; if(k==='status')return status; return '';}); sh.appendRow(row);} else {sh.getRange(rowIndex+1,idxStatus+1).setValue(status);} if(_ROWS_CACHE[name]) delete _ROWS_CACHE[name];}

/* ====== telegram ====== */
function tg(p){const token=config().BOT_TOKEN; if(!token) throw new Error('BOT_TOKEN is not configured.'); return 'https://api.telegram.org/bot'+token+'/'+p;}
function tgsend(chat_id,text,opts){const payload=Object.assign({chat_id,text,parse_mode:'HTML',disable_web_page_preview:true},opts||{}); return UrlFetchApp.fetch(tg('sendMessage'),{method:'post',contentType:'application/json',payload:J(payload),muteHttpExceptions:true});}
function tgedit(chat_id,msg_id,text,opts){const payload=Object.assign({chat_id,message_id:msg_id,text,parse_mode:'HTML',disable_web_page_preview:true},opts||{}); return UrlFetchApp.fetch(tg('editMessageText'),{method:'post',contentType:'application/json',payload:J(payload),muteHttpExceptions:true});}
function tgcb(id,text){return UrlFetchApp.fetch(tg('answerCallbackQuery'),{method:'post',payload:{callback_query_id:id,text:text||''}});}

/* ====== users & access ====== */
function ensureUser(id,username,first){const U=rows(config().USERS_SHEET).find(u=>String(u.user_id)===String(id)); if(U)return U; const u={user_id:String(id),username:username||'',first_name:first||'',lang:'ru',goal:'',level:'',weight_kg:'',remind_time:'09:00',tz:TZ(),access_until:'',pro_until:'',plan_type:'',referral_code:('U'+id).slice(-6),referred_by:'',streak_days:0,last_checkin_date:'',status:'active',user_state:'',equipment:'none',injury_mode:'off',injury_tags:'',glp1_mode:'no',xp:0,level_num:0,sprint_day:0,last_plan_minutes:0,joker_tokens:1}; upsert(config().USERS_SHEET,'user_id',u.user_id,u); return u;}
function getUser(id){return rows(config().USERS_SHEET).find(u=>String(u.user_id)===String(id))||null;}
function saveUser(u){upsert(config().USERS_SHEET,'user_id',u.user_id,u);}
function hasAccess(u){const t=todayStr(); return (safe(u.access_until)>=t)||(safe(u.pro_until)>=t);}
function grantAccessDays(u,days){const d=(u.access_until&&new Date(u.access_until)>new Date())?new Date(u.access_until):new Date(); d.setDate(d.getDate()+Number(days||0)); u.access_until=dstr(d); saveUser(u);}
function grantProDays(u,days){const d=(u.pro_until&&new Date(u.pro_until)>new Date())?new Date(u.pro_until):new Date(); d.setDate(d.getDate()+Number(days||0)); u.pro_until=dstr(d); u.plan_type='pro'; saveUser(u);}

/* ====== texts & keyboards ====== */
function T(k){const d={WELCOME:'👋 <b>ProgressFit X</b>. Научно, честно и с иронией. Делать — тебе. Экономить нервы — ко мне.',ASK_GOAL:'🎯 Цель? Напиши: fat_loss / strength / health',ASK_TIME:'⏱ Время сегодня? 30, 45 или 60 минут.',PLAN_READY:'План готов: достаточно умный, чтобы не умереть, и достаточно жёсткий, чтобы был смысл.',LOCKED:'🔒 Доступ закрыт. Оплати Pro/Lite или напиши в поддержку.'}; return d[k]||k;}
function kbTimes(){return {inline_keyboard:[[ {text:'30 мин',callback_data:'time:set:30'},{text:'45 мин',callback_data:'time:set:45'},{text:'60 мин',callback_data:'time:set:60'} ],[{text:'🫶 Слабый день',callback_data:'easy:go'}]]};}
function kbPlan(){return {inline_keyboard:[[ {text:'✓ Чек-ин',callback_data:'checkin:done'},{text:'⏭ Пропуск',callback_data:'checkin:skip'} ],[{text:'🃏 Джокер',callback_data:'joker:use'}]]};}
function kbPro(){return {inline_keyboard:[[ {text:'💡 Lite $5/нед',callback_data:'buy:LITE_WEEK'} ],[ {text:'💎 Pro $10/нед',callback_data:'buy:PRO_WEEK'} ]]};}
function kbManual(){const c=config(); const info=[c.CARD_NUMBER?('💳 Карта: '+c.CARD_NUMBER+(c.CARD_HOLDER?(' ('+c.CARD_HOLDER+')'):'')):'', c.CRYPTO_USDT?('💎 USDT (TRC20): '+c.CRYPTO_USDT):'', c.CRYPTO_BTC?('₿ BTC: '+c.CRYPTO_BTC):'', c.DONATE_URL?('☕️ Донат: '+c.DONATE_URL):''].filter(Boolean).join('\n'); return {info: info||('Свяжись с поддержкой: '+c.SUPPORT_LINK), markup:{inline_keyboard:[[ {text:'💳 Оплатить на карту',callback_data:'manual:card'} ],[ {text:'💎 Оплатить криптой',callback_data:'manual:crypto'} ], (c.DONATE_URL?[{text:'☕️ Донат',url:c.DONATE_URL}]:[]), [ {text:'✅ Я оплатил',callback_data:'manual:paid'} ]].filter(r=>r.length>0)}};}

function injuryKeyboard(u){const tags=new Set(safe(u.injury_tags).split(',').filter(Boolean)); return {inline_keyboard:[[ {text:(tags.has('knee')?'✅ ':'')+'Колено',callback_data:'inj:set:knee'},{text:(tags.has('back')?'✅ ':'')+'Спина',callback_data:'inj:set:back'},{text:(tags.has('shoulder')?'✅ ':'')+'Плечо',callback_data:'inj:set:shoulder'} ],[ {text:(u.injury_mode==='on'?'🔴 Выкл щадящий':'🟢 Вкл щадящий'),callback_data:'injury:toggle'} ],[ {text:'Готово',callback_data:'inj:done'} ]]};}
function injurySummary(u){const tags=safe(u.injury_tags).split(',').filter(Boolean); const mode=u.injury_mode==='on'?'🟢 Щадящий режим включен.':'⚪️ Щадящий режим выключен.'; return mode+'\n'+(tags.length?'Избегаем нагрузку на: '+tags.join(', '):'Ограничения не заданы.');}

/* ====== router ====== */
function doPost(e){
  const body=e && e.postData && e.postData.contents || '{}'; const up=P(body); if(!up) return ContentService.createTextOutput('ok');
  // мягкая проверка секрета (не блокируем пустой s)
  if(e && e.parameter && e.parameter.s && e.parameter.s!==config().WEBHOOK_SECRET) return ContentService.createTextOutput('ok');
  try{
    if(up.pre_checkout_query) return onPreCheckout(up.pre_checkout_query);
    if(up.message && up.message.successful_payment) return onSuccessfulPayment(up.message);
    if(up.message) return onMessage(up.message);
    if(up.callback_query) return onCallback(up.callback_query);
  }catch(err){ logFail({type:'exception',raw:up},err); }
  return ContentService.createTextOutput('ok');
}
function doGet(){ try{config(); return ContentService.createTextOutput('ProgressFit X: OK');}catch(err){ return ContentService.createTextOutput('ProgressFit X: CONFIG ERROR — '+err.message); }}

/* ====== handlers ====== */
function onMessage(m){
  const uinfo=m.from||{}; const ctx={type:'message',user:{id:String(uinfo.id),username:uinfo.username||'',first_name:uinfo.first_name||''},chat:{id:String(m.chat.id)},text:safe(m.text||''),raw:m};
  const u=ensureUser(ctx.user.id,ctx.user.username,ctx.user.first_name);
  if(processStates(ctx,u)) return ContentService.createTextOutput('ok');

  if(ctx.text.startsWith('/start')){ tgsend(ctx.chat.id,T('WELCOME')); tgsend(ctx.chat.id,T('ASK_GOAL')); return ContentService.createTextOutput('ok'); }
  if(ctx.text==='/plan'){ handlePlan(ctx,u); return ContentService.createTextOutput('ok'); }
  if(ctx.text==='/nutrition'){ handleNutrition(ctx,u); return ContentService.createTextOutput('ok'); }
  if(ctx.text==='/pro'){ handlePro(ctx,u); return ContentService.createTextOutput('ok'); }
  if(ctx.text==='/status'){ showStatus(ctx,u); return ContentService.createTextOutput('ok'); }
  if(ctx.text==='/testlevel'){ handleTestLevel(ctx,u); return ContentService.createTextOutput('ok'); }
  if(ctx.text==='/injury'){ handleInjury(ctx,u); return ContentService.createTextOutput('ok'); }

  const isAdmin=(config().ADMIN_IDS||[]).indexOf(String(u.user_id))>=0;
  if(isAdmin && ctx.text.startsWith('/grant ')){const p=ctx.text.split(' '); const target=getUser(p[1]); const days=Number(p[2]||7); if(target){ grantAccessDays(target,days); tgsend(ctx.chat.id,'Lite до '+target.access_until); tgsend(p[1],'✅ Доступ до '+target.access_until);} else tgsend(ctx.chat.id,'Нет пользователя '+p[1]); return ContentService.createTextOutput('ok');}
  if(isAdmin && ctx.text.startsWith('/progrant ')){const p=ctx.text.split(' '); const target=getUser(p[1]); const days=Number(p[2]||7); if(target){ grantProDays(target,days); tgsend(ctx.chat.id,'Pro до '+target.pro_until); tgsend(p[1],'💎 Pro до '+target.pro_until);} else tgsend(ctx.chat.id,'Нет пользователя '+p[1]); return ContentService.createTextOutput('ok');}
  return ContentService.createTextOutput('ok');
}
function onCallback(q){
  const m=q.message, uinfo=q.from||{}; const ctx={type:'callback',cb_id:q.id,user:{id:String(uinfo.id),username:uinfo.username||'',first_name=uinfo.first_name||''},chat:{id:String(m.chat.id)},message_id:String(m.message_id),data=q.data,raw=q};
  const u=ensureUser(ctx.user.id,ctx.user.username,ctx.user.first_name);
  const p=String(ctx.data||'').split(':'), v=p[0], a1=p[1], a2=p[2];

  if(v==='manual'){ if(a1==='card'){ tgcb(ctx.cb_id,'Ок'); const c=config(); tgsend(ctx.chat.id,'💳 Реквизиты:\n'+(c.CARD_NUMBER?('Карта: <b>'+c.CARD_NUMBER+'</b>'+(c.CARD_HOLDER?(' ('+c.CARD_HOLDER+')'):'')+'\n'):'')+(c.SUPPORT_LINK?('Нужна квитанция — пиши: '+c.SUPPORT_LINK):'')); return ContentService.createTextOutput('ok'); }
    if(a1==='crypto'){ tgcb(ctx.cb_id,'Ок'); const c=config(); tgsend(ctx.chat.id,'💎 Крипта:\n'+(c.CRYPTO_USDT?('USDT (TRC20): <b>'+c.CRYPTO_USDT+'</b>\n'):'')+(c.CRYPTO_BTC?('BTC: <b>'+c.CRYPTO_BTC+'</b>\n'):'')+(c.SUPPORT_LINK?('После оплаты пришли txid: '+c.SUPPORT_LINK):'')); return ContentService.createTextOutput('ok'); }
    if(a1==='paid'){ tgcb(ctx.cb_id,'Ок'); (config().ADMIN_IDS||[]).forEach(a=>{try{tgsend(a,'💬 '+u.first_name+' ('+u.user_id+') сообщил об оплате. Выдай доступ: /grant '+u.user_id+' 7 или /progrant '+u.user_id+' 7');}catch(e){}}); tgsend(ctx.chat.id,'Спасибо! Сообщение администратору отправлено.'); return ContentService.createTextOutput('ok'); } }
  try{
    if(v==='time'&&a1==='set'){ return generatePlanFor(u,Number(a2),ctx);}
    if(v==='easy'&&a1==='go'){ sendEasyDay(ctx,u); return; }
    if(v==='checkin'){ return cbCheckin(ctx,a1);}
    if(v==='joker'){ cbJoker(ctx); return; }
    if(v==='buy'){ return sendInvoiceFor(ctx,u,a1);}
    if(v==='inj'&&a1==='set'){tgcb(ctx.cb_id,'Ок'); toggleInjuryTag(u,a2); updateInjuryMessage(ctx,u); return;}
    if(v==='injury'&&a1==='toggle'){tgcb(ctx.cb_id,u.injury_mode==='on'?'Щадящий режим выключен':'Щадящий режим включен'); setInjuryMode(u,u.injury_mode==='on'?'off':'on'); updateInjuryMessage(ctx,u); return;}
    if(v==='inj'&&a1==='done'){tgcb(ctx.cb_id,'Готово'); tgsend(ctx.chat.id,'Учёл. '+injurySummary(u)); return;}
  }catch(err){ logFail(ctx,err); }
  return ContentService.createTextOutput('ok');
}

/* ====== payments (off) ====== */
function productCatalog(){return {LITE_WEEK:{code:'LITE_WEEK',title:'ProgressFit X — Lite (7 дн.)',description:'Планы 30–45 мин, питание, GLP-1 friendly.',price_usd:Number(config().LITE_PRICE_USD||5)}, PRO_WEEK:{code:'PRO_WEEK',title:'ProgressFit X — Pro (7 дн.)',description:'Всё из Lite + 60 мин, heavy/gym, чат.',price_usd:Number(config().PRO_PRICE_USD||10)}, SESSION_1H:{code:'SESSION_1H',title:'Индивидуальная тренировка (1 час)',description:'Созвон 60 мин: анализ + план.',price_usd:Number(config().SESSION_PRICE_USD||20)}, SUPP_CONSULT:{code:'SUPP_CONSULT',title:'Консультация по спортпиту',description:'Подбор добавок под цель.',price_usd:Number(config().SUPP_CONSULT_PRICE_USD||9)}};}
function cents(x){return Math.round(Number(x||0)*100);}
function onPreCheckout(q){return UrlFetchApp.fetch(tg('answerPreCheckoutQuery'),{method:'post',contentType:'application/json',payload:J({pre_checkout_query_id:q.id,ok:true})});}
function onSuccessfulPayment(m){const u=ensureUser(String(m.from.id),m.from.username,m.from.first_name); const sku=(P(m.successful_payment.invoice_payload)||{}).sku; if(sku==='LITE_WEEK'){u.plan_type='lite'; grantAccessDays(u,7); tgsend(u.user_id,'✅ Lite до '+u.access_until);} if(sku==='PRO_WEEK'){u.plan_type='pro'; grantProDays(u,7); tgsend(u.user_id,'✅ Pro до '+u.pro_until+' | Канал: '+config().CHANNEL_LINK+' | Чат: '+config().CHAT_LINK);} if(sku==='SESSION_1H'){append(config().SESSIONS_SHEET,{user_id:u.user_id,date:'',duration:'60',type:'coaching',paid:'paid',status:'await_time'}); u.user_state='await_session_time'; saveUser(u); tgsend(u.user_id,'✅ Оплачено. Напиши дату/время для сессии.');} if(sku==='SUPP_CONSULT'){tgsend(u.user_id,'✅ Консультация по спортпиту активирована. Опиши цель, рацион и добавки.');}}
function sendInvoiceFor(ctx,u,sku){if(!config().PAYMENTS_ENABLED){tgcb(ctx.cb_id,'Инвойсы отключены'); const k=kbManual(); tgsend(ctx.chat.id,'💰 Выбери способ оплаты\n\n'+k.info,{reply_markup:k.markup}); return;} const item=productCatalog()[sku]; if(!item){tgcb(ctx.cb_id,'Товар недоступен'); return;} const payload=J({sku,user_id:u.user_id,ts:Date.now()}); const inv={title:item.title,description:item.description,payload:payload,provider_token:config().PROVIDER_TOKEN,currency:config().CURRENCY,prices:[{label:item.title,amount:cents(item.price_usd)}]}; tgcb(ctx.cb_id,'Открываю оплату…'); UrlFetchApp.fetch(tg('sendInvoice'),{method:'post',contentType:'application/json',payload:J(Object.assign({chat_id:ctx.chat.id},inv))});}

/* ====== plan ====== */
function handlePlan(ctx,u){ if(!hasAccess(u)){ tgsend(ctx.chat.id,T('LOCKED')+'\nСвязь: '+config().SUPPORT_LINK); const k=kbManual(); tgsend(ctx.chat.id,k.info,{reply_markup:k.markup}); return;} tgsend(ctx.chat.id,T('ASK_TIME'),{reply_markup:kbTimes()});}
function generatePlanFor(u,minutes,ctx){ u.last_plan_minutes=minutes; saveUser(u); const seed=pickLocalPlan(u,minutes);
  if(config().AI_ENABLED && config().OPENAI_API_KEY && config().OPENAI_API_KEY.indexOf('sk-')===0){ try{ const ai=aiPlanJSON(u,minutes,seed); if(ai){ if(ctx&&ctx.cb_id){tgcb(ctx.cb_id,'Ок'); if(ctx.message_id)tgedit(ctx.chat.id,ctx.message_id,'Время: '+minutes+' мин.');} tgsend(ctx.chat.id,renderPlan(ai),{reply_markup:kbPlan()}); return; } }catch(e){ logFail(ctx,e);} }
  const p=seed||{title:'Тренировка '+minutes+' мин',content:'Круги: присед, отжимания, планка.',tips:'Темп по дыханию.'}; if(ctx&&ctx.cb_id){tgcb(ctx.cb_id,'Ок'); if(ctx.message_id)tgedit(ctx.chat.id,ctx.message_id,'Время: '+minutes+' мин.');}
  tgsend(String(u.user_id),'<b>'+T('PLAN_READY')+'</b>\n• <b>'+p.title+'</b>\n'+p.content+'\n\n<i>'+p.tips+'</i>',{reply_markup:kbPlan()});
}
function pickLocalPlan(u,minutes){const all=rows(config().PLANS_SHEET).filter(p=>Number(p.duration_min)===Number(minutes)); let cand=all; const g=safe(u.goal).toLowerCase(), lvl=safe(u.level).toLowerCase(); if(g)cand=cand.filter(p=>safe(p.goal).toLowerCase()===g); if(lvl)cand=cand.filter(p=>safe(p.level).toLowerCase()===lvl); if(u.plan_type==='lite'){cand=cand.filter(p=>Number(p.duration_min)<=45 && safe(p.equipment)!=='gym' && String(p.heavy||'0')!=='1');} if(u.equipment==='none')cand=cand.filter(p=>safe(p.equipment)!=='gym'); if(u.injury_mode==='on')cand=cand.filter(p=>String(p.low_impact||'')==='1'); if((u.glp1_mode||'no')==='yes')cand=cand.filter(p=>String(p.low_impact||'')==='1'); const tags=safe(u.injury_tags).split(',').filter(Boolean); if(tags.length){cand=cand.filter(p=>{const avoid=safe(p.avoid_tags).split(',').filter(Boolean); return !tags.some(t=>avoid.indexOf(t)>=0);});} const plan=cand[0]||all[0]||null; return plan&&{title:plan.title,content:plan.content,tips:plan.tips};}
function aiPlanJSON(u,minutes,seed){const sys="Ты — профи фитнес-коуч. Русский, стиль: научный с иронией. Учитывай травмы/GLP-1."; const usr=["Составь план на "+minutes+" минут.","Цель: "+(u.goal||'не задана')+", уровень: "+(u.level||'не задан'),"Оборудование: "+(u.equipment||'none')+", тариф: "+(u.plan_type||'free'),"GLP-1: "+(u.glp1_mode||'no')+", травмы: "+(u.injury_tags||'none'),"Ответ строго JSON: {\"title\":\"...\",\"blocks\":[{\"name\":\"Разминка\",\"time_min\":5,\"steps\":[\"...\"]}],\"tips\":[\"...\"],\"quote\":\"короткая цитата\"}"].join("\n"); const seedTxt=seed?("Seed:\nTITLE: "+seed.title+"\nCONTENT:\n"+seed.content+"\nTIPS:\n"+seed.tips):"Seed: none"; const body={model:config().AI_MODEL,messages:[{role:'system',content:sys},{role:'user',content:usr+"\n\n"+seedTxt}],temperature:0.6,max_tokens:config().AI_MAX_TOKENS||900}; const res=UrlFetchApp.fetch('https://api.openai.com/v1/chat/completions',{method:'post',contentType:'application/json',payload:J(body),headers:{Authorization:'Bearer '+config().OPENAI_API_KEY},muteHttpExceptions:true}); const code=res.getResponseCode(), js=P(res.getContentText()); if(code>=200&&code<300&&js&&js.choices&&js.choices.length){const c=js.choices[0].message&&js.choices[0].message.content; try{const o=P(c); if(o&&o.title&&o.blocks)return o;}catch(e){} } throw new Error('AI failed '+code);}
function renderPlan(o){let s='<b>'+T('PLAN_READY')+'</b>\n• <b>'+o.title+'</b>\n'; (o.blocks||[]).forEach(b=>{s+='\n<b>'+b.name+' ('+(b.time_min||'?')+' мин)</b>\n'; (b.steps||[]).forEach(x=>s+='• '+x+'\n');}); if(o.tips&&o.tips.length)s+='\n<i>'+o.tips.join(' • ')+'</i>\n'; if(o.quote)s+='\n🧠 “'+o.quote+'”'; return s;}

function easyDayPlan(u){const all=rows(config().PLANS_SHEET); const filtered=all.filter(p=>String(p.low_impact||'')==='1'); const suitable=filtered.filter(p=>{if(u.equipment==='none'&&safe(p.equipment)==='gym')return false; const avoid=safe(p.avoid_tags).split(',').filter(Boolean); const tags=safe(u.injury_tags).split(',').filter(Boolean); if(tags.some(t=>avoid.indexOf(t)>=0))return false; return true;}); const pick=suitable[0]||filtered[0]||null; return pick&&{title:pick.title||'Лёгкий день восстановления',content:pick.content||'Дыхание, мобилити, прогулка 30 мин.',tips:pick.tips||'Цель — восстановиться, а не страдать.'};}
function sendEasyDay(ctx,u){const plan=easyDayPlan(u); const text=plan?('<b>Переключаемся на восстановление</b>\n• <b>'+plan.title+'</b>\n'+plan.content+'\n\n<i>'+plan.tips+'</i>'):'<b>Переключаемся на восстановление</b>\nПройдись 20–30 минут, сделай дыхательную гимнастику и мягкую растяжку. Сегодня задача — дать телу восстановиться.'; const day=todayStr(); const existing=rows(config().PROGRESS_SHEET).find(r=>String(r.user_id)===String(u.user_id)&&String(r.date)===day); if(existing&&existing.status==='done'){tgcb(ctx.cb_id,'Сегодня уже зачтено как тренировка'); return;} setProgressStatus(u.user_id,day,'easy'); tgcb(ctx.cb_id,'Принято'); if(ctx.message_id){try{tgedit(ctx.chat.id,ctx.message_id,'Взяли лёгкий день.');}catch(e){}} try{tgsend(ctx.chat.id,text);}catch(e){logFail({type:'easy_day_send',user:u},e);}}

function toggleInjuryTag(u,tag){const tags=new Set(safe(u.injury_tags).split(',').filter(Boolean)); if(tags.has(tag))tags.delete(tag); else tags.add(tag); u.injury_tags=Array.from(tags).join(','); saveUser(u);}
function setInjuryMode(u,mode){u.injury_mode=mode; saveUser(u);}
function updateInjuryMessage(ctx,u){try{tgedit(ctx.chat.id,ctx.message_id,'Отметь проблемные зоны, я подстрою план.\n'+injurySummary(u),{reply_markup:injuryKeyboard(u)});}catch(e){tgsend(ctx.chat.id,'Обновил настройки травм.\n'+injurySummary(u),{reply_markup:injuryKeyboard(u)});}}

function jokerAvailable(u){return Number(u.joker_tokens||0)>0;}
function cbJoker(ctx){const u=getUser(ctx.user.id); if(!u){tgcb(ctx.cb_id,'Пользователь не найден'); return;} if(!hasAccess(u)){tgcb(ctx.cb_id,'Нужна активная подписка'); return;} if(!jokerAvailable(u)){tgcb(ctx.cb_id,'Джокеры закончились'); return;} const day=todayStr(); const existing=rows(config().PROGRESS_SHEET).find(r=>String(r.user_id)===String(u.user_id)&&String(r.date)===day); if(existing&&existing.status==='done'){tgcb(ctx.cb_id,'Сегодня уже отмечено'); return;} setProgressStatus(u.user_id,day,'joker'); u.joker_tokens=Number(u.joker_tokens||0)-1; if(u.joker_tokens<0)u.joker_tokens=0; u.last_checkin_date=day; saveUser(u); tgcb(ctx.cb_id,'Джокер сохранён'); try{tgsend(ctx.chat.id,'Береги себя. Джокер активирован, серия не обнулилась. Осталось: '+u.joker_tokens);}catch(e){logFail({type:'joker_ack',user:u},e);}}

/* ====== nutrition / status / test / injury ====== */
function handleNutrition(ctx,u){ if(!hasAccess(u)){ tgsend(ctx.chat.id,T('LOCKED')+'\nСвязь: '+config().SUPPORT_LINK); const k=kbManual(); tgsend(ctx.chat.id,k.info,{reply_markup:k.markup}); return;} if(!u.weight_kg){ u.user_state='await_weight'; saveUser(u); tgsend(ctx.chat.id,'Введи вес (кг), например 80.'); return;} const w=Number(u.weight_kg), Pm=Math.round(2*w), Fm=Math.round(0.8*w), Cm=Math.max(0,Math.round((2000-(Pm*4+Fm*9))/4)); tgsend(ctx.chat.id,'<b>🍽 Нормы (оценочно)</b>\nБ: <b>'+Pm+' г</b>  Ж: <b>'+Fm+' г</b>  У: <b>'+Cm+' г</b>\n\nКреатин 3–5 г/д; Омега-3; Vit D; протеин — если не добираешь белок.');}
function showStatus(ctx,u){tgsend(ctx.chat.id,'Статус: '+(hasAccess(u)?'активен ✅':'закрыт 🔒')+'\nДоступ до: '+(u.access_until||'—')+'\nPro до: '+(u.pro_until||'—')+'\nТип: '+(u.plan_type||'—')+'\nСерия: '+(u.streak_days||0));}
function handleTestLevel(ctx,u){u.user_state='test_q1'; saveUser(u); tgsend(ctx.chat.id,'🧪 Тест уровня\n1) Отжимания подряд? Введи число.');}
function handleInjury(ctx,u){saveUser(u); tgsend(ctx.chat.id,'Отметь проблемные зоны, я подстрою план.\n'+injurySummary(u),{reply_markup:injuryKeyboard(u)});}
function processStates(ctx,u){
  if(u.user_state==='await_weight'){const w=Number(safe(ctx.text).replace(',','.')); if(isNaN(w)||w<=0||w>400){tgsend(ctx.chat.id,'Введи вес в кг, например 80'); return true;} u.weight_kg=w; u.user_state=''; saveUser(u); tgsend(ctx.chat.id,'Принято. Теперь /plan или /nutrition.'); return true;}
  if(u.user_state==='await_session_time'){append(config().SESSIONS_SHEET,{user_id:u.user_id,date:ctx.text,duration:'60',type:'coaching',paid:'paid',status:'booked'}); u.user_state=''; saveUser(u); tgsend(ctx.chat.id,'Забронировал: <b>'+ctx.text+'</b>. Свяжемся: '+config().SUPPORT_LINK); return true;}
  if(u.user_state==='test_q1'){u._p=Number(safe(ctx.text)); u.user_state='test_q2'; saveUser(u); tgsend(ctx.chat.id,'2) Планка — секунды?'); return true;}
  if(u.user_state==='test_q2'){u._pl=Number(safe(ctx.text)); u.user_state='test_q3'; saveUser(u); tgsend(ctx.chat.id,'3) 2 км — минуты?'); return true;}
  if(u.user_state==='test_q3'){const p=Number(u._p||0), pl=Number(u._pl||0), t=Number(safe(ctx.text))||999; let s=0; if(p>=16)s++; if(pl>=60)s++; if(t<=12)s++; let lvl='beginner'; if(s===2)lvl='intermediate'; if(s===3)lvl='advanced'; u.level=lvl; u.user_state=''; delete u._p; delete u._pl; saveUser(u); tgsend(ctx.chat.id,'Результат: <b>'+lvl+'</b>. Теперь /plan — и поехали.'); return true;}
  if(!u.goal && ['fat_loss','strength','health'].indexOf(safe(ctx.text))>=0){u.goal=safe(ctx.text); saveUser(u); tgsend(ctx.chat.id,'Ок. /plan — выбери 30 / 45 / 60 минут.'); return true;}
  return false;
}
function cbCheckin(ctx,action){const u=getUser(ctx.user.id), day=todayStr(); const ex=rows(config().PROGRESS_SHEET).find(r=>String(r.user_id)===String(u.user_id)&&String(r.date)===day); let status=action; let refundJoker=false; if(ex){if(action==='done'&&(ex.status==='easy'||ex.status==='joker')){status='done'; if(ex.status==='joker')refundJoker=true;} else if(action==='skip'&&ex.status!=='done'){status='skip';} else {tgcb(ctx.cb_id,'Сегодня уже отмечено'); return;}} setProgressStatus(u.user_id,day,status); if(status==='done'){if(refundJoker){u.joker_tokens=Math.min(Number(u.joker_tokens||0)+1,3);} u.streak_days=Number(u.streak_days||0)+1; u.sprint_day=Math.min(14,Number(u.sprint_day||0)+1); u.xp=Number(u.xp||0)+(u.last_plan_minutes>=60?3:u.last_plan_minutes>=45?2:1); if(u.sprint_day===14){grantAccessDays(u,1); tgsend(String(u.user_id),'🏁 Спринт 14/14! Подарок: +1 день доступа.');} tgsend(ctx.chat.id,'Отлично. Адаптация идёт. 🔥');} else {u.streak_days=0; tgsend(ctx.chat.id,'Бывает. Завтра вернёмся.');} u.last_checkin_date=day; saveUser(u); tgcb(ctx.cb_id,'OK');}

/* ====== pro screen ====== */
function handlePro(ctx,u){ if(config().PAYMENTS_ENABLED){ tgsend(ctx.chat.id,'Выбери режим:',{reply_markup:kbPro()}); } else { const k=kbManual(); tgsend(ctx.chat.id,'💰 Выбери способ оплаты\n\n'+k.info,{reply_markup:k.markup}); }}

/* ====== install / webhook / triggers ====== */
function install(){
  const H={
    users:['user_id','username','first_name','lang','goal','level','weight_kg','remind_time','tz','access_until','pro_until','plan_type','referral_code','referred_by','streak_days','last_checkin_date','status','user_state','equipment','injury_mode','injury_tags','glp1_mode','xp','level_num','sprint_day','last_plan_minutes','joker_tokens'],
    plans:['plan_id','goal','level','duration_min','title','content','tips','equipment','low_impact','heavy','avoid_tags'],
    nutrition:['goal','meals','supplement_tips'], content:['content_id','type','lang','goal','level','text'],
    progress:['user_id','date','status'], sessions:['user_id','date','duration','type','paid','status'],
    failures:['ts','type','user_id','error','raw'], metrics_daily:['date','user_id','nps','notes']
  };
  Object.keys(H).forEach(k=>ensureHeader(k,H[k]));
  if(rows('plans').length===0){
    append('plans',{plan_id:'STR-60-ADV-GYM',goal:'strength',level:'advanced',duration_min:60,title:'Комбо-день: турник + штанга',content:'Разминка 5 мин (скакалка/гребля)\n21→15→12→9: подтягивания / рывок 40 кг\nПресс 5 мин\n2 гири 32 кг — ходьба 1 мин + 20 вращений блином ×5\nГребля 5 мин макс\nЗаминка + шея',tips:'Техника > темп.',equipment:'gym',low_impact:'0',heavy:'1',avoid_tags:'back,shoulder'});
    append('plans',{plan_id:'HLT-30-ALL-MOB',goal:'health',level:'beginner',duration_min:30,title:'Щадящий день восстановления',content:'Разминка 5 мин\n3 круга: присед 15×, планка 30с, мост 15×, планка локти 30с\nРастяжка и дыхание',tips:'Меньше героизма — больше системности.',equipment:'none',low_impact:'1',heavy:'0',avoid_tags:'knee'});
  }
  return 'OK';
}
function setWebhookSelf(){ const base=ScriptApp.getService().getUrl(); const url=base+'?s='+encodeURIComponent(config().WEBHOOK_SECRET); const r=UrlFetchApp.fetch('https://api.telegram.org/bot'+config().BOT_TOKEN+'/setWebhook?url='+encodeURIComponent(url),{muteHttpExceptions:true}); return r.getContentText();}
function deleteWebhook(){ return UrlFetchApp.fetch('https://api.telegram.org/bot'+config().BOT_TOKEN+'/deleteWebhook').getContentText(); }
function getWebhookInfo(){ return UrlFetchApp.fetch('https://api.telegram.org/bot'+config().BOT_TOKEN+'/getWebhookInfo').getContentText(); }
function createTriggers(){ ScriptApp.getProjectTriggers().forEach(t=>ScriptApp.deleteTrigger(t)); ScriptApp.newTrigger('morningPrompt').timeBased().atHour(9).nearMinute(0).everyDays(1).inTimezone(TZ()).create(); ScriptApp.newTrigger('proExpiryHint').timeBased().atHour(20).nearMinute(0).everyDays(1).inTimezone(TZ()).create(); ScriptApp.newTrigger('nightlyExpire').timeBased().atHour(23).nearMinute(55).everyDays(1).inTimezone(TZ()).create(); ScriptApp.newTrigger('weeklyJokerRefill').timeBased().onWeekDay(ScriptApp.WeekDay.MONDAY).atHour(6).inTimezone(TZ()).create(); return 'OK';}
function morningPrompt(){const users=rows(config().USERS_SHEET); users.filter(u=>hasAccess(u)&&safe(u.status)!=='inactive').forEach(u=>{const remind=safe(u.remind_time)||'09:00'; if(remind==='09:00'){try{tgsend(String(u.user_id),'Доброе утро! План на сегодня ждёт: /plan');}catch(e){logFail({type:'morning_prompt',user:u},e);}}});}
function proExpiryHint(){const users=rows(config().USERS_SHEET); const base=parseISODate(todayStr())||new Date(); const tomorrow=new Date(base.getTime()); tomorrow.setDate(tomorrow.getDate()+1); users.filter(u=>safe(u.plan_type)==='pro').forEach(u=>{const proUntil=parseISODate(u.pro_until); if(isSameDay(proUntil,tomorrow)){try{tgsend(String(u.user_id),'⚠️ Pro заканчивается завтра. Продлим? /pro');}catch(e){logFail({type:'pro_expiry_hint',user:u},e);}}});}
function nightlyExpire(){const users=rows(config().USERS_SHEET); const today=parseISODate(todayStr())||new Date(); users.forEach(u=>{const access=parseISODate(u.access_until); const pro=parseISODate(u.pro_until); let updated=false; if(isBeforeDay(access,today)&&safe(u.plan_type)!=='pro'){u.plan_type=''; updated=true;} if(isBeforeDay(pro,today)&&safe(u.plan_type)==='pro'){u.plan_type=''; updated=true; try{tgsend(String(u.user_id),'Lite/Pro закончился. Вернёмся? /pro');}catch(e){logFail({type:'expire_notify',user:u},e);}} if(updated){saveUser(u);}});}
function weeklyJokerRefill(){const users=rows(config().USERS_SHEET); users.forEach(u=>{const tokens=Number(u.joker_tokens||0); const cap=Math.min(tokens+1,3); if(cap!==tokens){u.joker_tokens=cap; saveUser(u); if(hasAccess(u)){try{tgsend(String(u.user_id),'🃏 Джокеры пополнены: '+cap);}catch(e){logFail({type:'joker_notify',user:u},e);}}}});}
