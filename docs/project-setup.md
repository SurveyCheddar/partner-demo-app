# Survey Cheddar Partners App Setup Guide

This guide provides a step-by-step process for Survey Cheddar partners to set up their React Native app using Expo's EAS service. It covers everything from app registration to creating an EAS build.

## Prerequisites
- Registered company (as per previous guide)
- Signed partnership agreement with Survey Cheddar
- Computer with Git, Node.js, and Expo CLI installed

## Steps

### 1. Register a New App
   - **Google Play Store**: Create a new app in the Google Play Developer Console
   - **iOS App Store**: Set up a new app on Apple Developer

### 2. Clone the App
   - Use Git to clone the app repository
   - Change the app's package name, title, and icon in the `app.json` file

### 3. Create a Google Cloud Console Account
   - Sign up for a Google Cloud Console account
   - Link your Google Play Developer Account to a new or existing Google Cloud Project

### 4. Configure Service Accounts
   - In Google Cloud Console, create a new service account
   - Name your service account and provide a description
   - Add a new key to the service account, select JSON as the key type, and download it
   - Store this JSON file securely, as it will be used in development

### 5. Enable Google Play Developer API
   - In Google Cloud Console, enable the Google Play Android Developer API
   - This is essential for your app to interact with Google Play services

### 6. Invite Service Account to Google Play
   - Use the email address of the service account and invite it as an Admin user in Google Play
   - This step allows EAS to push builds to the Google Play Store

### 7. Create an EAS Project
   - Initialize an EAS project for your app using the Expo CLI
   - Run the command `eas build:configure` to configure the project for EAS Build

### 8. Create an EAS Build
   - Execute `eas build` to create a build for your app
   - Follow the on-screen instructions to choose the platform and build type

### 9. Submit Your App
   - After the build, use `eas submit` to submit your app to the app stores
   - Ensure that your app meets all the guidelines and requirements of each app store

## Additional Notes
- Ensure your app complies with all legal and platform-specific guidelines
- Keep your service account details and keys secure.
- Regularly update your app to align with the latest OS and Expo SDK updates

This guide is intended to provide a clear pathway for setting up your survey app with Expo's EAS service. For any specific issues or advanced configurations, refer to the official Expo and React Native documentation, or contact Survey Cheddar support.