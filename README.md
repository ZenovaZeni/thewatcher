# The Watcher

Phone-first camera horror game where the player survives short rituals while the game watches their face.

The working product shape is a browser-first prototype that can later be wrapped for iOS and Android with Capacitor. The first entity pack is **The Watcher**: if the player blinks, looks away, moves too much, or leaves frame, the entity gets closer and the game creates a shareable caught card.

## Project Shape

- `docs/` - concept, design, monetization, and implementation planning.
- `app/` - web prototype source.
- `assets/` - audio, entity art, overlays, and share-card visuals.
- `store/` - app store copy, screenshots, ratings notes, and monetization notes.

## Core Loop

1. Player opens the game on a phone.
2. Player grants camera permission and calibrates their face.
3. The entity gives a simple rule: do not blink, do not look away, stay still, smile, stop smiling.
4. The game tracks the player locally in real time.
5. Failure freezes the moment and generates a caught card.
6. Player retries, shares, or unlocks the next ritual/entity pack.

## Run the Prototype

```bash
cd app
npm install
npm run dev
```

Open the Vite URL on a browser with camera support. The prototype is phone-first, so mobile portrait is the target shape.

## Checks

```bash
cd app
npm test
npm run build
```

## Privacy Shape

The prototype uses the browser camera and MediaPipe face tracking locally. Camera frames are not uploaded by the app. Caught cards are rendered in the browser from the current video frame and are shared only when the player taps Share.
