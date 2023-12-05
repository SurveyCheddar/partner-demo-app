# Survey Cheddar Partners Development and Testing Guide

This guide provides steps for local development and testing of your React Native app using Expo for Survey Cheddar partners

## Local Development

### Prerequisites Installation

1. **Node.js (version 16 or higher):**
   - Node.js can be installed via official packages available at [nodejs.org](https://nodejs.org/download/)
   - Using a package manager like `nvm` is recommended for easy version switching and managing multiple Node.js versions

2. **Yarn:**
   - Install Yarn through the npm package manager, which comes with Node.js
   - Use the command: `npm install --global yarn`

3. **Expo CLI:**
   - The global Expo CLI is superseded by 'npx expo' and eas-cli.
   - You don’t need to install Expo CLI globally. Use `npx expo` for running Expo commands

### Development Process

1. **Start Development Environment:**
   - Run `npx expo start` in the command line within your project directory
   - Follow the prompts to debug your app

2. **Using Emulators or Real Devices:**
   - If Android/iOS emulator tools are installed, they can be used for testing
   - Alternatively, use your phone with Expo Go. Add the `--tunnel` parameter if debugging on your phone (`npx expo start --tunnel`)

## Testing for Production

1. **Create a Production Build:**
   - Run `npx eas build` to initiate a production build
   - Use `--local` argument for a local build

2. **Testing on a Phone:**
   - Use Expo Go to test these builds on your phone before publishing

3. **Submit to Internal Testing:**
   - Run `eas submit` to submit your build to internal testing
   - Our project is set up to only submit to internal testing, allowing you to test builds as they would appear in production

4. **Further Production Release Steps:**
   - More detailed instructions for releasing production builds to the public are in the [Production Guide](docs/production.md)

Remember, this guide is a general overview, and you may encounter platform-specific quirks or requirements. Always refer to the official documentation for Node.js, Yarn, and Expo for the most up-to-date and detailed information
