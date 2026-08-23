# CycleWise — React Native (Expo) app

This is a full conversion of your Figma Make export into a real React Native
app. The original zip was **not** React Native — it was a plain React 19 +
Vite + Tailwind CSS web app (`div`/`span`/`svg` rendered to the DOM). This
project rebuilds every screen with actual React Native components
(`View`/`Text`/`Pressable`), real navigation, and vector icons instead of
emoji.

## Running it

```bash
npm install
npx expo start
```

Then either scan the QR code with the **Expo Go** app on your phone, or press
`i` / `a` in the terminal for the iOS Simulator / Android Emulator.

`npm install` also runs `patch-package` automatically (see "About the
patch" below) — you don't need to do anything extra for that.

## What's in here

- **Auth**: `SignIn` / `SignUp` screens (email + password, plus a "Continue
  with Google" button) gate the rest of the app. See **"Wiring up real
  auth"** below — right now this is a fully working *UI* with local
  validation only, not connected to a backend.
- **11 app screens**, converted 1:1 from your Figma design: Home, Calendar,
  Symptoms Log, Statistics, Profile, Cycle Info, Log Period, Widgets, Lock
  App, Export Report, and the Language picker modal.
- **Navigation**: React Navigation — a bottom tab bar (Home / Calendar / a
  floating "+" that opens Symptoms Log / Statistics / Profile) plus a stack
  for everything pushed on top.
- **Icons**: every emoji from the original design was replaced with a real
  vector icon (Ionicons, via `@expo/vector-icons`, which ships with Expo —
  no extra native setup needed). All icon choices live in one file:
  `src/theme/icon-map.ts`, so re-theming later is a one-file change.
- **Styling**: NativeWind (Tailwind for React Native), so most of your
  original `className` strings carry over almost unchanged.

## Project structure

```
App.tsx                     — entry point, wraps the app in AuthProvider + NavigationContainer
src/
  components/                — Icon, Mascot, Chip, SectionCard, StatCard
  context/AuthContext.tsx    — local sign-in state (see below)
  navigation/                — RootNavigator, CustomTabBar, typed param lists
  screens/                   — one file per screen
  theme/                     — colors.ts, icon-map.ts
```

## Wiring up real auth

Right now `src/context/AuthContext.tsx` only validates the form fields
locally (non-empty, valid email shape, password length/match) and then
flips a boolean — there's no backend or persistence yet. That's the one
piece I couldn't wire up for you, since it needs credentials only you can
create (a backend project, a Google OAuth client ID, etc.).

**Email + password** — the easiest options:
- [Firebase Auth](https://docs.expo.dev/guides/using-firebase/) — free tier,
  well-documented Expo guide, minimal setup.
- [Supabase Auth](https://supabase.com/docs/guides/auth) — similar, if you'd
  rather have a Postgres backend behind it too.
- Your own API — replace the body of `signIn`/`signUp` in `AuthContext.tsx`
  with a `fetch`/`axios` call to your endpoint, store the returned token
  (e.g. with `expo-secure-store`), and set `isAuthenticated` on success.

**Google sign-in**:
- [`expo-auth-session`](https://docs.expo.dev/guides/google-authentication/)
  — Expo's own guide, works well if you're already on Expo.
- [`@react-native-google-signin/google-signin`](https://github.com/react-native-google-signin/google-signin)
  — the native SDK, if you eventually eject from Expo Go.

Either way you'll need a Google Cloud OAuth client ID (Google Cloud Console
→ APIs & Services → Credentials). Once you have one, replace
`signInWithGoogle` in `AuthContext.tsx` with the real sign-in call.

I'd also recommend persisting `isAuthenticated` (e.g. with
`expo-secure-store` or `AsyncStorage`) so users don't have to sign in every
time they reopen the app — right now it resets on every app restart.

## About the patch (`patches/react-native+0.86.0.patch`)

React Native 0.86.0 (the version paired with the current Expo SDK) has a
known upstream bug in an internal experimental file
(`VirtualViewExperimentalNativeComponent.js`) that breaks Metro's bundler —
see [facebook/react-native#56269](https://github.com/facebook/react-native/issues/56269).
It's unrelated to anything in this app; `patch-package` fixes it
automatically on `npm install` via the `postinstall` script. You can delete
`patches/` and the `postinstall` script once Expo/React Native ship a fix
upstream.

## Data is currently mock data

All the numbers you see (cycle day, symptoms, weight/temperature/sleep
stats, calendar history, etc.) are hardcoded, same as they were in the
original Figma design — there's no backend or local database wired up yet.
Natural next steps once auth is real:
- A backend (or local database like `expo-sqlite` / WatermelonDB) to persist
  logged symptoms, period dates, etc.
- Replace the hardcoded arrays in each screen (e.g. `PERIOD_DAYS`,
  `MOOD` items' selected state) with real user data.

## Known simplifications from the original design

- A few very specific icon concepts (e.g. "tender breasts", "faint line"
  pregnancy test) don't have a perfect one-to-one vector icon, so I picked
  the closest reasonable Ionicon — the chip's selected/unselected color is
  still the primary signal, same as before. Search `src/theme/icon-map.ts`
  if you want to swap any of these for a custom icon later.
- CSS grid layouts (`grid-cols-N`) were rebuilt with Flexbox, since React
  Native has no CSS grid.
- The original's browser-frame decorative wrapper (border-radius, shadow,
  status-bar padding) was removed — real devices provide their own frame,
  and safe-area insets now handle the notch/status bar automatically.
