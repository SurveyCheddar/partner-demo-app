# Guide to Publishing Your Survey Cheddar Partner App in Production

This outlines the steps Survey Cheddar partners should take to publish their app to production, emphasizing the importance of app store optimization (ASO) and ethical practices.

## Setting Up Your Store Listing

1. **App Name**: Choose a simple, memorable name for your app. Ensure it's easy to spell and suggestive of your app's purpose (max. 30 characters on iOS, 50 on Android)

2. **App Store Icon**: Use a high-resolution 32-bit PNG, ideally 1024 x 1024 pixels. The design should account for automatic processing on different platforms (iOS automatically rounds corners, etc.)

3. **Bundle ID/App ID**: This is a unique reverse domain identifier and cannot be changed after the first upload

4. **SKU (iOS Only)**: A unique identifier for your app on the App Store

5. **App Screenshots/Previews**: Provide at least two screenshots in JPEG or PNG format. Localization of these images is recommended for a broader appeal

6. **Beta Testing**: Before going live, invite people to test your app. Utilize private and public testing via TestFlight on iOS and set up alpha or beta testing on Android

## App Store Optimization (ASO)

1. **Importance of Title and Description**: Your title is the most crucial keyword for your app, followed by the description. Be original in crafting these; copying from other apps can lead to penalties

2. **Keyword Research**: Identify words that describe your app and its functionality. Consider using tools like Google's Keyword Magic Tool to find relevant keywords

3. **Keyword Suggestions**: Focus on keywords related to surveys, earning money, market research, consumer feedback, rewards, and incentives. These should appeal to users interested in surveys or earning money through apps

4. **Writing Engaging Descriptions**: Your app's description should clearly outline its features and benefits. Use keywords effectively to improve visibility and ensure it resonates with potential users

5. **Regular Updates**: Both Apple App Store and Google Play consider app freshness and update regularity as ranking factors. Regular updates based on user feedback can enhance your app's appeal and ranking

6. **Ethical Practices**: Avoid paying for reviews or manipulating app marketplaces, as this can result in permanent bans

## Moving to Production

1. **Promote Internal Testing Release**: Use the internal testing release created earlier (details in [development.md](docs/development.md)) to move to production on the iOS App Store or Google Play

2. **Edit Release Notes**: Include friendly and informative comments about the update in your release notes before submitting for review

3. **Review and Submit**: Ensure your app complies with all store guidelines and submit it for review

4. **Monitor and Optimize**: Continuously monitor your app's performance in the store and optimize your listing based on user feedback and performance metrics

This guide provides an overview of the key steps in publishing your app. For more detailed instructions on releasing production builds to the public, refer to the `docs/production.md` file in your project repository. Remember, ASO is a vast field with significant potential for driving traffic to your app, and careful attention to these details can make a substantial difference in your app's success.