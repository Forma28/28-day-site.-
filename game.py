from __future__ import annotations

import pygame


class Game:
    def __init__(self, screen: pygame.Surface) -> None:
        self.screen = screen
        self.background_color = (20, 24, 42)
        self.text_color = (220, 230, 255)
        self.font = pygame.font.SysFont("arial", 42)
        self.subtitle_font = pygame.font.SysFont("arial", 24)

    def handle_event(self, event: pygame.event.Event) -> None:
        _ = event

    def update(self) -> None:
        return

    def draw(self) -> None:
        self.screen.fill(self.background_color)

        title = self.font.render("Аурелия: Кристаллы Судьбы", True, self.text_color)
        subtitle = self.subtitle_font.render(
            "Стартовый экран. Нажмите X, чтобы закрыть окно.",
            True,
            self.text_color,
        )

        title_rect = title.get_rect(center=(self.screen.get_width() // 2, 300))
        subtitle_rect = subtitle.get_rect(center=(self.screen.get_width() // 2, 360))

        self.screen.blit(title, title_rect)
        self.screen.blit(subtitle, subtitle_rect)
