# Privacy Notes

## Prototype Behavior

The Watcher browser prototype processes camera input locally on the player's device.

- Face tracking uses MediaPipe in the browser.
- Camera frames are not uploaded by the app.
- Caught cards are rendered locally from the live video element.
- Sharing is user-initiated through the Share button.
- The first playable prototype does not use live AI API calls during gameplay.

## Store Direction

Future iOS and Android builds should keep the same trust model. Permission copy should explain why the camera is needed before the system prompt appears, and any future cloud feature should be optional, explicit, and separate from the core ritual loop.
