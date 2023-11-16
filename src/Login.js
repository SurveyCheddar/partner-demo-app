import API from './Api'
import React from "react"
import theme from './Theme'
import {Auth} from 'aws-amplify'
import LoginBase from "./LoginBase"
import ValidatedInput from './ValidatedInput'
import DividerWithText from './DividerWithText'
import SocialLoginButton from './SocialLoginButton'
import {Text, ActivityIndicator} from 'react-native'
import {Box, Button, Stack, Link} from "native-base"

const config = require('./config')

class Login extends React.Component {
  constructor() {
    super()

    this.api = new API

    this.state = {
      email: null,
      validate: false,
      isLoading: false,
    }
  }

  async onGooglePress() {
    const results = await Auth.federatedSignIn({provider: 'Google'})
  }

  async onApplePress() {
    await Auth.federatedSignIn({provider: 'SignInWithApple'})
  }

  validateEmail(email) {
    return String(email)
    .toLowerCase()
    .match(
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    )
  }

  async onLoginPress() {
    const validEmail = this.validateEmail(this.state.email)
    const validPassword = this.state.password

    if (!validEmail || !validPassword) {
      this.setState({
        validate: true
      })
    } else {
      this.setState({isLoading: true})

      try {
        const loginResults = await Auth.signIn(this.state.email, this.state.password)
        await this.props.resources.refreshUser()
    
        this.props.history.push('/dashboard')
      } catch(err) {
        console.log("LOGIN ERR", err)
        const {message} = err
        this.setState({
          message: err.message,
          isLoading: false,
        })
      }
    }
  }

  render() {
    if (this.state.isLoading) {
      return (
        <ActivityIndicator color="black" size={"large"} style={{marginTop: 250}} />
      )
    }

    const primaryColor = theme.colors.primary[600]

    return (
      <LoginBase
        title="Login"
        subtitle="Welcome back!"
        onBackPress={() => {this.props.history.push('/welcome')}}
      >
        <Box style={{alignItems: 'center', padding: 20}}>
          <Stack w="100%" space={5}>
            <SocialLoginButton
              text="Continue with Google"
              onPress={this.onGooglePress.bind(this)}
              iconName="google"
            />
            <SocialLoginButton
              text="Continue with Apple"
              onPress={this.onApplePress.bind(this)}
              iconName="apple"
            />
            <DividerWithText text="Or" />
            <ValidatedInput
              id="email"
              placeholder="Email"
              onChangeText={(value) => {this.setState({email: value})}}
              isInvalid={this.state.validate && !this.validateEmail(this.state.email)}
              message="Valid email required"
            />
            <ValidatedInput
              id="password"
              type="password"
              placeholder="Password"
              onChangeText={(value) => {this.setState({password: value})}}
              isInvalid={this.state.validate && !this.state.password}
              message="Password required"
            />
            {this.state.message ? (
              <Text style={{color: 'red', display: this.state.message ? null : 'none'}}>{this.state.message}</Text>
            ) : null}
            <Link onPress={() => {this.props.history.push('/login/forgot')}}>
              <Text style={{color: primaryColor, fontWeight: 'bold'}}>Forgot Password?</Text>
            </Link>
            <Button
              onPress={this.onLoginPress.bind(this)}
              backgroundColor={primaryColor}
              style={{elevation: 5, height: 51, width: '100%', borderRadius: 10, borderColor: primaryColor, borderWidth: 1}}
            >
              <Box style={{display: 'flex', flexDirection: 'row'}}>
                <Text style={{fontSize: 18, color: '#fff', fontWeight: 'bold'}}>Login</Text>
              </Box>
            </Button>
          </Stack>
        </Box>
      </LoginBase>
    )
  }
}

export default Login