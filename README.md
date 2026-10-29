# Toilet Simulator

A ridiculous bathroom economy game drawn and played entirely on a responsive HTML canvas. Choose questionable food, time three pushes, watch the porcelain react, and try to make a living.

## Play

Open `index.html` in a modern browser, or use the GitHub Pages build. No framework, build step, account, or game server is required. Progress is saved locally with `localStorage`.

- Tap/click food cards to buy up to four servings. Tap `−` to return a serving and get its cost back.
- Press **TAKE A SEAT** (or skip an empty meal) to start the day's shift.
- Tap **HIT IT!**, press **Space**, or press **Enter** to stop the moving needle in the green zone three times. Each push gets a custom animated reaction and synthesized sound effect.
- Collect your pay, then start the next day. Food changes the timing window, needle speed, poison odds, health, score potential, volume, consistency, and payout.
- Swipe/scroll the market list on mobile. Use the in-canvas character and achievement icons to customize your avatar and inspect progress.
- Sound effects are on by default; tap the speaker icon to mute. The music note opens the linked track in YouTube's visible embedded player.

## Features

- Ten food and drink choices with spice, fiber, diuretic, stimulant, taste, and food-poisoning attributes.
- Custom canvas-rendered bathroom scene, animated character, per-push outcomes, psychedelic effects, and responsive touch controls.
- Persistent wallet, health, daily phase, avatar, stats, and eight unlockable achievements.
- Keyboard QTE controls, reduced-motion-aware canvas presentation, no account, and no tracking.
- Original comic sound effects synthesized locally with Web Audio. The optional YouTube soundtrack is streamed, not bundled.

## GitHub Pages

The repository is published from the `main` branch root using GitHub Pages. To recreate the deployment, select **Settings → Pages → Deploy from a branch → `main` → `/(root)**.

## License

Game code and original canvas artwork: MIT License. The optional embedded soundtrack remains the property of its creator and is served by YouTube.
