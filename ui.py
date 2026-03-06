import pygame


class Menu:
    def __init__(self, screen):
        self.screen = screen
        self.font = pygame.font.SysFont(None, 60)

    def handle_event(self, event, game):
        if event.type == pygame.KEYDOWN and event.key == pygame.K_RETURN:
            game.state = "playing"

    def draw(self):
        self.screen.fill((0, 0, 50))
        title = self.font.render("Аурелия: Кристаллы Судьбы", True, (255, 255, 0))
        self.screen.blit(title, (200, 200))
        start = self.font.render("Нажмите ENTER чтобы начать", True, (255, 255, 255))
        self.screen.blit(start, (150, 400))


class InventoryUI:
    def __init__(self, screen, player):
        self.screen = screen
        self.player = player
        self.font = pygame.font.SysFont(None, 40)

    def draw(self):
        pygame.draw.rect(self.screen, (0, 0, 0), (10, 10, 250, 100))
        health_text = self.font.render(f"Здоровье: {self.player.health}", True, (255, 0, 0))
        mana_text = self.font.render(f"Мана: {self.player.mana}", True, (0, 0, 255))
        self.screen.blit(health_text, (20, 20))
        self.screen.blit(mana_text, (20, 60))
