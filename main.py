import pygame
from game import Game


def main() -> None:
    pygame.init()
    screen = pygame.display.set_mode((1280, 720))
    pygame.display.set_caption("Аурелия: Кристаллы Судьбы")
    clock = pygame.time.Clock()

    game = Game(screen)

    running = True
    while running:
        clock.tick(60)
        for event in pygame.event.get():
            if event.type == pygame.QUIT:
                running = False
            game.handle_event(event)

        game.update()
        game.draw()
        pygame.display.flip()

    pygame.quit()


if __name__ == "__main__":
    main()
