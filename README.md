# ProgressFit X Telegram Bot

Русскоязычный фитнес-бот для Google Apps Script, который выдаёт планы тренировок, питание и управляет подписками через Google Sheets.

## Что входит в репозиторий
- `progressfit.gs` — основной скрипт Apps Script с логикой бота.
- `docs/progressfit_overview_ru.md` — подробное описание архитектуры и функций.
- `installer_ui.html` — HTML-панель администратора для диагностики и автонастройки.
- `index.html` — промо-страница (опционально для лендинга).

## Как запустить бота
1. **Подготовьте таблицу.** Создайте Google Spreadsheet, скопируйте её `SHEET_ID` (из URL после `/d/`).
2. **Создайте проект Apps Script.** Откройте [script.google.com](https://script.google.com), создайте пустой проект и вставьте в файл `Code.gs` содержимое `progressfit.gs`.
3. **Заполните Script Properties.** В интерфейсе Apps Script перейдите в `Project Settings → Script properties` и добавьте ключи:
   - `SHEET_ID` — ID таблицы.
   - `BOT_TOKEN` — токен Telegram-бота.
   - При необходимости: `BOT_USERNAME`, `CHANNEL_LINK`, `CHAT_LINK`, `SUPPORT_LINK`, реквизиты оплаты, `ADMIN_IDS`, `ADMIN_PIN`, `OPENAI_API_KEY`.
4. **Создайте листы и демо-данные.** В редакторе выберите функцию `install()` и нажмите «Run». Это создаст нужные листы (`users`, `plans` и т. д.) и добавит примерные планы.
5. **Опубликуйте веб-приложение.** `Deploy → Test deployments → Select type Web app`, доступ «Anyone», выполнять от имени владельца. Скопируйте получившийся URL.
6. **Привяжите вебхук.** В Apps Script выполните `setWebhookSelf()` — URL веб-приложения зарегистрируется в Telegram. Либо отправьте вручную `https://api.telegram.org/bot<Токен>/setWebhook?url=<URL>`.
7. **Проверьте команды.** В Telegram введите `/start`, затем протестируйте `/plan`, `/nutrition`, `/help`, `/pro`, чек-ин по кнопкам. Заполните лист `plans` собственными тренировками.
8. **Откройте панель администратора (опционально).** Перейдите по ссылке веб-приложения с параметрами `?admin=1&key=<ADMIN_PIN>`, чтобы запустить диагностику, автонастройку и сбор метрик.

> Подробнее о функциях и структуре смотрите в `docs/progressfit_overview_ru.md`.

## Совет по безопасности
Не храните реальные токены и ключи в репозитории. Заполняйте их только в Script Properties или через Secrets Manager.
