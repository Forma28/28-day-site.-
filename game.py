import pygame
from player import Player
from enemy import Enemy, Boss
from levels import Level
from ui import Menu, InventoryUI


class Game:
    def __init__(self, screen):
        self.screen = screen
        self.state = "menu"
        self.menu = Menu(screen)
        self.level_index = 0
        self.levels = [
            Level("Лес Луминаров", screen),
            Level("Пустыня Террамех", screen),
            Level("Логово Корона Теней", screen, boss=True),
        ]
        self.player = Player()
        self.inventory_ui = InventoryUI(screen, self.player)

    def handle_event(self, event):
        if self.state == "menu":
            self.menu.handle_event(event, self)
        else:
            self.player.handle_event(event)

    def update(self):
        if self.state == "playing":
            self.levels[self.level_index].update(self.player)
            if self.levels[self.level_index].completed:
                self.level_index += 1
                if self.level_index >= len(self.levels):
                    self.state = "win"

    def draw(self):
        if self.state == "menu":
            self.menu.draw()
        elif self.state == "playing":
            self.levels[self.level_index].draw(self.player)
            self.inventory_ui.draw()
        elif self.state == "win":
            self.screen.fill((0, 0, 0))
            font = pygame.font.SysFont(None, 80)
            text = font.render("Поздравляем! Вы победили!", True, (255, 255, 0))
            self.screen.blit(text, (200, 300))
