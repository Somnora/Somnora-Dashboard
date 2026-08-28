# Somnora Web Design Mapping

This document translates the canonical iOS design rules from the existing Somnora repository into the Desktop Workbench. The source rules remain `Somnora/docs/design-system.md`.

## Backgrounds

- Full destinations use the corresponding pre-existing Somnora image asset.
- Home and Eureka use the Eureka background.
- Conversations use the background associated with Dream, Daily, or Eureka.
- Analytics uses the Insights background.
- Settings and pairing use the Settings background.
- Partial sheets use glass over the current image.
- The old blue-to-tan gradient is prohibited.
- No CSS variable may recreate `DS.Colors.backgroundGradient` or `DS.Colors.background`.

## Glass

- Cards use transparent material with a light rim.
- Rim light appears before shadow.
- Corners use 16px for cards and 24px for large sheets.
- One solid coral action is permitted when a clear primary action is necessary.

## Typography

- Nora's voice and major headings use the serif stack.
- Navigation, labels, status, and body copy use the system sans-serif stack.
- Secondary white text remains near 78 percent opacity.
- Artwork always receives a scrim before text.

## Motion

- Motion uses spring-like easing.
- Only the smallest relevant element moves.
- Reduced motion removes ambient graph drift, parallax, particles, and combustion effects.

## Asset Disclosure

The background images and launch logo copied into `public/assets` are pre-existing Somnora assets. They are reused to make the new Workbench feel like an authentic extension of the existing product and must not be described as newly created hackathon artwork.
