import React from "react"
import {Auth} from 'aws-amplify'
import LoginBase from "./LoginBase"
import SocialLoginButton from "./SocialLoginButton"
import {Box, Link, Stack} from "native-base"

const config = require('./config')

class Register extends React.Component {
  async onGooglePress() {
    await Auth.federatedSignIn({provider: 'Google'})
  }

  async onApplePress() {
    await Auth.federatedSignIn({provider: 'SignInWithApple'})
  }

  async onEmailPress() {
    this.props.history.push('/register/email')
  }

  render() {
    return (
      <LoginBase
        title="Sign Up"
        subtitle="Sign up to start earning!"
        onBackPress={() => {this.props.history.push('/welcome')}}
      >
        <Box style={{alignItems: 'center', padding: 20}}>
          <Stack w="100%" space={5}>
            <SocialLoginButton
              text="Sign up with Google"
              onPress={this.onGooglePress.bind(this)}
              iconName="google"
            />
            <SocialLoginButton
              text="Sign up with Apple"
              onPress={this.onApplePress.bind(this)}
              iconName="apple"
            />
            <SocialLoginButton
              text="Sign up with Email"
              onPress={this.onEmailPress.bind(this)}
              iconName="envelope"
            />
          </Stack>
        </Box>
        <Box style={{margin: 20}}>
          <Box style={{margin: 20, display: 'flex', flexDirection: 'row'}} _text={{fontSize: 10}}>
            By signing up you agree to our 
            <Link _text={{marginLeft: 1, fontSize: 10}} href="https://www.joincheddar.com/privacy-policy">Privacy Policy</Link> and 
            <Link _text={{marginLeft: 1, fontSize: 10}} href="https://www.joincheddar.com/terms-of-service">Terms of Service</Link>
          </Box>
        </Box>
      </LoginBase>
    )
  }
}

export default Register