import pygame


class Enemy:
    def __init__(self, x, y):
        self.x, self.y = x, y
        self.health = 50
        self.image = pygame.Surface((40, 40))
        self.image.fill((255, 0, 0))

    def update(self):
        pass

    def draw(self, screen):
        screen.blit(self.image, (self.x, self.y))


class Boss(Enemy):
    def __init__(self, x, y):
        super().__init__(x, y)
        self.health = 300
        self.image = pygame.Surface((80, 80))
        self.image.fill((128, 0, 128))
