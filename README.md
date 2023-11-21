# SurveyCheddar Partner App Demo

The partner demo app is a React Native application that demonstrates integration with our API, and one way to get surveys in front of users. Our partners can use it as a base for new applications.

## Installation

To install and run the Partner Demo App, please follow the instructions below:

### Prerequisites

Before you proceed, ensure that you have the following software installed on your system:

- Node.js (version 14+ recommended)
- yarn (Nodejs Package Manager)
- Xcode (for iOS development) or Android Studio (for Android development)
- Android SDK or iOS SDK, depending on your target platform
- SurveyCheddar partner app, provisioned at https://partners.surveycheddar.com

### Local Development

1. Clone the repository to your local machine

`git clone https://github.com/SurveyCheddar/partner-demo-app.git`

2. Navigate to the project directory:

`cd partner-demo-app`

3. Install the project dependencies

`yarn`

4. Run the app

Android:
```
npx expo run:android
```

iOS:
```
npx expo run:ios
```

### Building for production

The recommended way to build, test, and publish your app is using Expo's EAS service. It's free to use at small scale, and we've had good experiences with it. Sign up here: https://expo.dev/

Once you have an account, you can follow the guide here: https://docs.expo.dev/build/setup/

The basic steps are:

#### EAS Install/setup
```
npm install -g eas-cli

eas login

eas build:configure
```

#### Building the app

You can choose which platform to target for the build. Your options are:

`eas build --platform all`
`eas build --platform ios`
`eas build --platform android`

### Publishing the app

Follow the guide at https://docs.expo.dev/submit/introduction/

Note: The project comes with an eas.json already in place

# License

This repository is released under a private commerical license. It is for use only by approved SurveyCheddar partners.