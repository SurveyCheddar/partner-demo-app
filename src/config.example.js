import {Platform, Linking} from 'react-native'
import InAppBrowser from 'react-native-inappbrowser-reborn'

async function urlOpener(url, redirectUrl) {
  const platofrm = Platform.OS

  if (platofrm === 'android') {
    Linking.openURL(url)
  } else {
    await InAppBrowser.isAvailable();
    const { type, url: newUrl } = await InAppBrowser.openAuth(url, redirectUrl)
    if (type === 'success') {
      Linking.openURL(newUrl)
    }
  }
}

const baseUrl = 'yourapp://yourdomain.com'

module.exports = {
  appId: '...your cheddar app ID...',
  appName: 'PartnerDemoApp',
  appleAppId: '1321977976',
  packageName: 'your.package.name',
  api: {
    url: 'https://api.justsurveys.co'
  },
  app: {
    url: baseUrl
  },
  amplify: {
    Auth: {
      region: 'us-west-2',
      userPoolId: '...your user pool ID...',
      identityPoolId: '...your identity pool ID...',
      mandatorySignIn: false,
      userPoolWebClientId: '...your user pool client ID...',
      oauth: {
        scope: ['email', 'openid'],
        domain: '...your cognito domain',
        clientId: '...your user pool client ID...',
        urlOpener: urlOpener,
        responseType: 'code', 
        redirectSignIn: `${baseUrl}/return`,
        redirectSignOut: `${baseUrl}/return`,
      },               
    }      
  }
}