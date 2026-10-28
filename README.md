# Toilet Simulator

A self-contained, mobile-friendly browser game about making questionable menu choices, timing three bathroom quick-time events, and trying to turn a shift on the porcelain throne into a living.

## Play

Open `index.html` in a modern browser, or publish this repository with GitHub Pages. No build step, framework, account, or server is required. Game progress is saved locally in the browser with `localStorage`.

### Controls

- Choose up to four servings from the market; each item costs money immediately. Remove an item before starting to get its cost back.
- Press **TAKE A SEAT** (or skip the meal) to begin the day's shift.
- Stop the moving needle in the green zone three times using **HIT IT!**, **Space**, or **Enter**.
- Collect your pay and start the next day. Food changes the timing window, needle speed, poison odds, health, score potential, and payout.
- Customize your avatar, toggle sound effects, or listen to the linked YouTube soundtrack from the top bar.

## Features

- 10 food and drink choices with spice, fiber, diuretic, stimulant, taste, and food-poisoning attributes.
- Animated, original SVG bathroom scene; psychedelic color effects; responsive layout and large touchscreen controls.
- Persistent wallet, health, daily phase, avatar, career stats, and unlockable achievements.
- Keyboard controls, semantic buttons, reduced-motion support, and no account or tracking.
- Soundtrack is played through YouTube's official embedded player; the video remains visible while playing. Sound effects are synthesized locally with Web Audio.

## Publish to GitHub Pages

In repository settings, open **Pages → Build and deployment**. Select **Deploy from a branch**, choose `main` and `/(root)`, then save. GitHub will publish the static site automatically after each push.

## License

Game code and original vector artwork: MIT License. The embedded soundtrack remains the property of its creator and is streamed from YouTube; it is not bundled with this project.
