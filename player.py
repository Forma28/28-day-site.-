import pygame


class Player:
    def __init__(self):
        self.x, self.y = 640, 360
        self.speed = 5
        self.health = 100
        self.mana = 100
        self.image = pygame.Surface((50, 50))
        self.image.fill((0, 255, 255))

    def handle_event(self, event):
        pass

    def move(self, keys):
        if keys[pygame.K_w]:
            self.y -= self.speed
        if keys[pygame.K_s]:
            self.y += self.speed
        if keys[pygame.K_a]:
            self.x -= self.speed
        if keys[pygame.K_d]:
            self.x += self.speed

    def draw(self, screen):
        screen.blit(self.image, (self.x, self.y))
