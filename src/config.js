import {Platform, Linking} from 'react-native'
import InAppBrowser from 'react-native-inappbrowser-reborn';

const isDevEnv = process.env.NODE_ENV === 'development'
console.log("DEFAULT CONFIG", isDevEnv, process.env.NODE_ENV)

async function urlOpener(url, redirectUrl) {
  console.log('urlOpener...', url, redirectUrl, Platform.OS)
  const platofrm = Platform.OS

  if (platofrm === 'android') {
    Linking.openURL(url)
  } else {
    await InAppBrowser.isAvailable();
    console.log('InAppBrowser available...')

    const { type, url: newUrl } = await InAppBrowser.openAuth(url, redirectUrl)
    console.log('TYPE', type)
    console.log('newUrl', newUrl)

    if (type === 'success') {
      Linking.openURL(newUrl)
    }
  }
}

const localUrl = Platform.OS === 'android' ? 'http://10.0.2.2:7777' : 'http://localhost:7777'
const baseUrl = 'yourapp://yourdomain.com'

module.exports = {
  appId: 'bafd1dbb-90de-40f2-a255-0e132baf05a8',
  appName: 'YourApp',
  appTitle: 'YourApp',
  appleAppId: '1663342432',
  packageName: 'your.package.name',
  hasEarningsReview: false,
  isDevEnv: isDevEnv,
  popOutAndroidLinks: true,
  api: {
    url: isDevEnv ? localUrl : 'https://api.justsurveys.co'
  },
  app: {
    url: baseUrl
  },
  amplify: {
    Auth: {
      region: 'us-west-2',
      userPoolId: 'us-west-2_3ECw8UVRz',
      identityPoolId: 'us-west-2:2c237cf3-3ab7-4f01-8db1-abb69b044b41',
      mandatorySignIn: false,
      userPoolWebClientId: '1hjavo2mob2q0l23uft6tdtqrl',
      oauth: {
        scope: ['email', 'openid'],
        domain: 'surveycheddar-partners.auth.us-west-2.amazoncognito.com',
        clientId: '1hjavo2mob2q0l23uft6tdtqrl',
        urlOpener: urlOpener,
        responseType: 'code', 
        redirectSignIn: 'surveyapp://return',
        redirectSignOut: 'surveyapp://return'
      },               
    }
  }
}