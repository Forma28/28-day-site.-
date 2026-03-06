import pygame
from enemy import Enemy, Boss


class Level:
    def __init__(self, name, screen, boss=False):
        self.name = name
        self.screen = screen
        self.enemies = [Enemy(200, 200), Enemy(400, 400)]
        if boss:
            self.enemies.append(Boss(600, 300))
        self.completed = False

    def update(self, player):
        keys = pygame.key.get_pressed()
        player.move(keys)
        self.enemies = [e for e in self.enemies if e.health > 0]
        if not self.enemies:
            self.completed = True

    def draw(self, player):
        self.screen.fill((50, 50, 100))
        player.draw(self.screen)
        for enemy in self.enemies:
            enemy.draw(self.screen)
