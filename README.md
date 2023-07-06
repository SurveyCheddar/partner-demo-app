# SurveyCheddar Partner App Demo

The partner demo app is a React Native application that demonstrates integration with our API, and one way to get surveys in front of users. Our partners can use it as a base for new applications.

## Installation

To install and run the Partner Demo App, please follow the instructions below:

### Prerequisites

Before you proceed, ensure that you have the following software installed on your system:

- Node.js (version 14+ recommended)
- yarn (Nodejs Package Manager)
- React Native CLI (npx)
- Xcode (for iOS development) or Android Studio (for Android development)
- Android SDK or iOS SDK, depending on your target platform
- AWS Cognito user pool and client (reach out to us if you need help)
- SurveyCheddar partner app, provisioned at https://partners.surveycheddar.com

### Setup

1. Clone the repository to your local machine

`git clone https://github.com/SurveyCheddar/partner-demo-app.git`

2. Navigate to the project directory:

`cd partner-demo-app`

3. Install the project dependencies

`yarn`

4. Run the app

Android:
```
npx react-native run-android
```

iOS:
```
npx react-native run-ios
```

### Configuration

1. Change the name of `stc/config.example.js` to `src/config.js`
2. Fill in details about your app and Cognito

# License

This repository is released under a partner license. It is for use only by approved SurveyCheddar partners.