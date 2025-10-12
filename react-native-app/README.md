# Bill Split - React Native App

A cross-platform bill splitting application built with React Native and Expo, featuring AI-powered receipt scanning, group management, and Venmo integration.

## Features

- 🤖 **AI Receipt Scanning**: Uses Google Gemini AI to extract bill items, tax, and tip from receipt photos
- 📱 **Cross-Platform**: Runs on iOS, Android, and Web
- 👥 **People Management**: Add people with Venmo IDs, save friends list to Firebase
- 💰 **Fair Splitting**: Proportional tax and tip distribution based on assigned items
- 📊 **Groups**: Organize bills by groups (roommates, trips, events)
- 💳 **Venmo Integration**: Direct deep linking to Venmo app for payments
- 🔐 **Firebase Auth**: Google OAuth authentication
- ☁️ **Cloud Sync**: Firestore for user profiles, friends, and groups

## Tech Stack

- **Framework**: React Native 0.81 + Expo 54
- **Language**: TypeScript
- **Navigation**: React Navigation (Stack + Bottom Tabs)
- **Styling**: React Native StyleSheet API with centralized theme
- **State Management**: Custom hooks architecture (no Redux)
- **Backend**: Firebase (Auth + Firestore)
- **AI**: Google Gemini 2.5 Flash
- **Image Picker**: expo-image-picker (camera + gallery)

## Project Structure

```
src/
├── components/
│   ├── ui/              # Reusable UI components (Button, Card, Input)
│   ├── bill/            # Bill management components
│   ├── people/          # People management components
│   ├── groups/          # Groups components
│   └── receipt/         # Receipt uploader
├── screens/             # Page-level components
│   ├── AIScanScreen.tsx
│   ├── GroupsScreen.tsx
│   ├── GroupDetailScreen.tsx
│   └── AuthScreen.tsx
├── navigation/          # Navigation configuration
├── logic/
│   ├── hooks/           # Custom hooks for business logic
│   ├── utils/           # Helper functions
│   ├── types/           # TypeScript types
│   └── services/        # External services (Gemini AI)
├── contexts/            # React contexts (Auth)
├── config/              # Firebase configuration
└── theme/               # Design system (colors, spacing, typography)
```

## Getting Started

### Prerequisites

- Node.js 20.x
- npm or yarn
- Expo CLI (`npm install -g expo-cli`)
- For iOS: Mac with Xcode
- For Android: Android Studio

### Installation

1. Clone the repository:
```bash
cd Bill-Split/react-native-app
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file:
```
EXPO_PUBLIC_GEMINI_API_KEY=your_gemini_api_key
EXPO_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
EXPO_PUBLIC_FIREBASE_PROJECT_ID=your_firebase_project_id
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id
EXPO_PUBLIC_FIREBASE_APP_ID=your_firebase_app_id
```

### Running the App

```bash
# Start Expo dev server
npm start

# Run on iOS simulator (Mac only)
npm run ios

# Run on Android emulator
npm run android

# Run on web browser
npm run web
```

## Custom Hooks Architecture

The app uses a custom hooks architecture for state management:

- **useBillSplitter**: Core bill state, item assignments, calculations
- **usePeopleManager**: People state, friends list integration
- **useItemEditor**: Item editing and adding state
- **useReceiptAnalyzer**: Gemini AI integration for receipt analysis
- **useFileUpload**: Image picker integration (camera + gallery)
- **useUserProfile**: Firebase user profile and friends management
- **useGroupManager**: Groups CRUD operations with Firestore

## Key Features Explained

### AI Receipt Analysis

1. User takes photo or selects from gallery
2. Image sent to Google Gemini 2.5 Flash with structured prompt
3. AI extracts: restaurant name, items (name + price), tax, tip
4. Results populate bill automatically with smart defaults

### Proportional Bill Splitting

Tax and tip are distributed proportionally based on each person's item subtotal:

```
personSubtotal = sum of (item.price / peopleSharing)
proportion = personSubtotal / totalSubtotal
personTax = billTax × proportion
personTip = billTip × proportion
personTotal = personSubtotal + personTax + personTip
```

### Groups Feature

- Create groups for recurring expenses (roommates, trips)
- Each group has its own bill history
- Members can be added once and reused across bills
- Groups sync in real-time via Firestore

### Venmo Integration

- Users can add Venmo IDs to people
- "Charge on Venmo" button generates deep link
- Deep link includes: amount, itemized note, recipient ID
- Falls back to web URL if app not installed

## Building for Production

### iOS

```bash
# Install EAS CLI
npm install -g eas-cli

# Build for iOS
eas build --platform ios

# Submit to App Store
eas submit --platform ios
```

### Android

```bash
# Build for Android
eas build --platform android

# Submit to Google Play
eas submit --platform android
```

### Configuration

App configuration is in `app.json`:
- Bundle IDs: `com.billsplit.app`
- Permissions: Camera, Photo Library
- App name: "Bill Split"

## Firebase Setup

1. Create Firebase project at https://console.firebase.google.com
2. Enable Google Authentication
3. Create Firestore database with these collections:
   - `users/{uid}`: User profiles with friends list
   - `groups/{groupId}`: Groups with members
4. Set up Firestore security rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth.uid == userId;
    }
    match /groups/{groupId} {
      allow read, write: if request.auth.uid == resource.data.ownerId;
    }
  }
}
```

## Troubleshooting

### Common Issues

**Image picker not working on iOS:**
- Ensure Info.plist has camera/photo permissions (configured in app.json)

**Firebase auth not working:**
- Check that Firebase config in `.env` is correct
- Verify Firebase project has Google OAuth enabled

**Build errors on Android:**
- Run `cd android && ./gradlew clean && cd ..`
- Clear Metro bundler cache: `expo start --clear`

**TypeScript errors:**
- Run `npm install` to ensure all types are installed
- Check that `tsconfig.json` is properly configured

## Migration from Web

This app was migrated from a React web application. Key changes:

- ✅ Reused all business logic (hooks, utils, types)
- ✅ Replaced TailwindCSS + shadcn/ui with StyleSheet API
- ✅ Converted React Router → React Navigation
- ✅ Updated File API → expo-image-picker
- ✅ Kept Firebase web SDK (works in React Native)

## License

Private project - All rights reserved

## Support

For issues or questions, please create an issue in the GitHub repository.
