# Do Not Look Away Design

## Product

**Do Not Look Away** is a phone-first camera horror game built around the feeling that the phone is watching the player. The player survives short rituals by obeying rules that are easy to understand but physically stressful: do not blink, do not look away, do not move, keep smiling, stop smiling, stay in frame.

The first version should be a browser-first prototype. If the core scare loop works, the same web app can be packaged for iOS and Android with Capacitor.

## Working Name

The game title is **Do Not Look Away**.

The first content pack is **The Watcher**.

## Target Session

The product should support a 3-minute first challenge and a 10-20 minute play session through retries, escalating rituals, caught-card sharing, and unlockable entity packs.

## Platform Strategy

Build web-first. Use a mobile browser as the primary target because link sharing is the lowest-friction viral path. After the loop is proven, wrap the app for iOS and Android with Capacitor for native sharing, store distribution, in-app purchases, and permission polish.

Do not start with Unity. Unity adds weight and slows iteration for a face-camera game whose core input, UI, and share loop can be built with web APIs.

## Technical Approach

Use a web app with:

- Camera capture through browser media APIs.
- MediaPipe Face Landmarker for face landmarks, expression blendshapes, blink/smile signals, and approximate head/gaze direction.
- Canvas or WebGL for camera overlays, entity effects, screen corruption, and caught cards.
- Web Audio for silence, whispers, stingers, and tension ramps.
- Local-first processing for privacy. The first prototype should not upload camera frames.

## First Entity: The Watcher

The Watcher uses one core rule: if the player blinks or looks away, it gets closer.

The first prototype should include these rituals:

1. **Calibration** - player centers their face and opens their eyes.
2. **Do Not Blink** - a short timer where blink detection causes failure or entity advance.
3. **Do Not Look Away** - head/gaze drift causes failure or entity advance.
4. **Stay Still** - large face movement increases threat.
5. **Final Stare** - combines blink, look-away, and stillness with escalating audio.

## Scare Design

The game should prefer personal dread over constant jumpscares.

Primary scare tools:

- The entity reacts to real behavior: blinking, looking away, moving, leaving frame, smiling.
- The game uses simple rule text that changes under pressure.
- Screen corruption and audio escalate quietly.
- Failure freezes the exact player frame and adds a horror overlay.
- Loud scares are rare so players do not become numb.

## Viral Hook

Failure creates a shareable caught card using a local still frame from the camera feed. The card includes:

- Failure reason.
- Timestamp.
- Entity name.
- Player frame with horror overlay.
- Short share caption.

Example captions:

- `BLINK DETECTED AT 02:13`
- `THE WATCHER MOVED WHEN YOU LOOKED AWAY`
- `YOU LEFT THE FRAME`

The caught card should feel creepy and funny enough to send to friends.

## Monetization

Launch with a free first pack and paid expansion packs.

Free:

- The Watcher.
- A small set of rituals.
- Basic caught cards.
- Daily challenge teaser.

Paid:

- Entity packs at roughly `$1.99-$2.99`.
- Bundle or season pass at roughly `$6.99-$9.99`.
- Cosmetic caught-card frames and effects.
- Optional ad removal only if ads are added later.

Avoid heavy ads in the first version. The game uses camera access and face screenshots, so trust matters.

## Privacy

The first prototype should process camera frames locally and say so clearly. Caught cards should be created on device. Sharing should happen only when the player taps a share action.

## App Store Considerations

The eventual mobile app should feel like a native game, not a thin website wrapper. It should include a polished onboarding flow, camera permission explanation, local privacy controls, native sharing, stable gameplay, store-compliant purchases, and enough content to provide lasting entertainment value.

## Success Criteria

- A new player understands the rule within 10 seconds.
- Camera calibration works on a typical phone in portrait orientation.
- Blink/look-away detection feels fair enough to retry.
- Failure creates a caught card that the player wants to show someone.
- The first challenge can be completed or failed in under 3 minutes.
- The loop has enough tension to support repeated attempts.

