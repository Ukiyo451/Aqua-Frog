# Lily — a frog water tracker

A WaterLlama-style hydration tracker starring **Lily**, a frog who fills up with water as you drink. Built with Expo (React Native) for iOS first; it also runs on Android and the web.

Every illustration and animation is drawn in code — SVG shapes from `react-native-svg`, motion from `react-native-reanimated`. There are no image, GIF or Lottie assets for characters or effects.

## Run it

```bash
npm install
npx expo start        # scan the QR code with Expo Go on your iPhone
npx expo start --web  # or preview in a browser
```

On web you can jump to any screen with a query string: `?step=welcome`, `firstSip`, `reminders`, `goal`, `feelBest`, `analyzing`, `paywall` or `home`.

## What's in it

| Screen | Motion |
| --- | --- |
| Splash | Rainbow frog-head logo layers drop in and stack, then squash-bounce |
| Welcome — "Track your intake" | Lily pops in and hops, confetti falls, water drops wiggle |
| Units sheet | Bottom sheet springs up over the dimmed silhouette |
| Add your first sip | Pulsing ring on the cup; the glass zooms up full-screen with sloshing waves and rising bubbles; drag to change the amount; "+ WATER" shrinks it back down and Lily's silhouette fills from her toes |
| Smart Reminders | Notification banner slides in; Lily leaps out of the bushes flinging leaves; schedules real local reminders every 2h (9:00–21:00) on device |
| Water wipe → Calculate your goal | A wave floods the screen; ice cubes bob, Lily floats past on a lily pad, rows pulse, iOS-style wheel pickers, goal counts up with a splash burst |
| Feel your best | Cards fly in from both sides, checkmarks pop, dizzy stars orbit the sad frog, cool frog bobs |
| Analyzing | Three rings of dots spin and sweep teal → blue → pink; progress bars fill one after another with pop-in checks |
| Paywall | Drinks hop, rotating feature captions (preview only — no purchases are wired up) |
| Home | Lily's silhouette fills with a wavy water level; tap the number to flip to "Remaining" and see Lily in colour; water, green tea, coffee and juice; streak badge unrolls; daily tips; confetti when you hit your goal; goal/units/undo menu |

## Layout

```
App.tsx                      fonts, providers, onboarding vs home
src/theme.ts                 colours + Nunito font names
src/lib/                     store (AsyncStorage), goal maths, drinks, reminders
src/components/Lily.tsx      Lily in colour (moods: happy, sad, cool, wow) or as a filling silhouette
src/components/              cup, sip overlay, sheets, wheel picker, effects (confetti, waves, ice, splash)
src/screens/onboarding/      the eight onboarding pages + the flow
src/screens/Home.tsx         the main tracker
```

The daily goal estimate is ~26 ml per kg of body weight, adjusted for activity, climate and sex (`src/lib/hydration.ts`).
