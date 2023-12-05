import API from './src/Api.js'
import React from 'react'
import store from './src/store.js'
import {connect} from 'react-redux'
import AppRouter from './src/router'
import SplashScreen from 'react-native-splash-screen'
import {Auth, Amplify} from 'aws-amplify'
import {View, StatusBar, SafeAreaView} from 'react-native'
import {NativeBaseProvider, extendTheme} from 'native-base'

const config = require('./src/config')
console.log("AMPLIFY CONFIG IS", config.amplify)
Amplify.configure(config.amplify)

const theme = extendTheme({
  colors: {
    // Add new color
    primary: {
      50: '#9ab6d9',
      100: '#86a8d1',
      200: '#7299c9',
      300: '#5e8bc2',
      400: '#4a7cba',
      500: '#366EB3',
      600: '#3063a1',
      700: '#2b588f',
      800: '#254d7d',
      900: '#20426b',
    },
    // Redefining only one shade, rest of the color will remain same.
    amber: {
      600: '#ffffff',
    },
  }
})

class App extends React.Component {

  constructor() {
    super()
    
    this.api = new API()
  }

  async componentDidMount() {
    console.log("APP MOUNTING")
    SplashScreen.hide()

    const {user} = await this.loadUser()

    this.setState({
      user: user && user.user,
      loading: false,
    })
  }

  async loadUser() {
    let user
    try {
      user = await this.api.getUser()
    } catch(err) {
      console.log("FAILED TO FETCH USER", err)
    }

    console.log("USER IS", user)

    if (user && user.user && !user.user.userId) {
      console.log("SETTING UP USER")
      const currentUser = await Auth.currentAuthenticatedUser()
      if (currentUser && currentUser.signInUserSession && currentUser.signInUserSession.idToken) {
        const email = currentUser.signInUserSession.idToken.payload.email
        const awsEmailSub = currentUser.signInUserSession.idToken.payload.sub
        const accountsResults = await this.api.createAccounts(email, awsEmailSub)
        user = await this.api.getUser()
      }
    }

    const manifest = await this.api.getAppManifest()
    this.props.dispatch({type: 'set', user: user && user.user, manifest})
    return user || {}
  }

  render() {
    console.log("APP RENDER WITH", this.props.dispatch)
    return (
      <NativeBaseProvider theme={theme}>
        <SafeAreaView style={{backgroundColor: 'white'}}>
          <StatusBar barStyle={'dark-content'} />
          <View style={{backgroundColor: 'white', height: '100%'}}>
            <AppRouter
              footer={this.props.footer}
              dispatch={this.props.dispatch}
            />
          </View>
        </SafeAreaView>
      </NativeBaseProvider>
    )
  }
}

const mapStateToProps = (state) => {
  return  {
    user: state.user,
  }
}

export default connect(mapStateToProps)(App)