# Digital Visiting Card — Build Instructions

## Project Structure
```
DigitalVisitingCard/
├── App.js              ← Main app (form + QR generator)
├── app.json            ← Expo config
├── eas.json            ← EAS build config (APK)
├── package.json        ← Dependencies
└── assets/             ← Icons and splash screen
```

## Features
- Fill in: Name, Title, Company, Email, Mobile, Phone, Website, LinkedIn, Address
- Generates QR code containing full vCard 3.0 data
- Business card preview with initials avatar
- Share card via any app (WhatsApp, Email etc)
- All data stays on device — no server/internet needed
- QR can be scanned by any Android/iPhone camera app

---

## Method 1: Build APK using EAS (Recommended — Free)

### Prerequisites
- Node.js installed (https://nodejs.org)
- Expo account (free) at https://expo.dev

### Steps

```bash
# 1. Install EAS CLI
npm install -g eas-cli

# 2. Login to Expo
eas login

# 3. Go into project folder
cd DigitalVisitingCard

# 4. Install dependencies
npm install

# 5. Build APK (cloud build — no Android Studio needed!)
eas build --platform android --profile preview

# 6. Download APK from the link shown after build completes
```
Build takes ~5-10 minutes. You'll get a direct APK download link.

---

## Method 2: Build APK locally (Android Studio)

### Prerequisites
- Android Studio installed
- Java JDK 17+
- Node.js

### Steps

```bash
# 1. Install dependencies
npm install

# 2. Generate native Android project
npx expo prebuild --platform android

# 3. Build APK
cd android
./gradlew assembleRelease

# 4. Find APK at:
# android/app/build/outputs/apk/release/app-release.apk
```

---

## Method 3: Test instantly (No build needed)

```bash
# 1. Install Expo Go on your Android phone from Play Store

# 2. On your PC, run:
npm install
npx expo start

# 3. Scan the QR code shown in terminal with Expo Go app
```

---

## Install APK on Android Phone

1. Copy APK to your phone
2. Go to Settings → Security → Enable "Unknown Sources" / "Install Unknown Apps"
3. Open the APK file and tap Install
4. Open "Digital Visiting Card" app

---

## How the QR Code Works

The QR code encodes a **vCard 3.0** format:
```
BEGIN:VCARD
VERSION:3.0
FN:Karthikeyan S
TITLE:IT Manager
ORG:Hanon Systems
EMAIL:skarthi4@haanonsystems.com
TEL;TYPE=CELL:+91 98765 43210
URL:https://yoursite.com
END:VCARD
```

When someone scans it with their phone camera → it automatically prompts to **save as contact** — no app needed on the scanner's phone!

