import React from 'react'
import API from './Api'
import {Auth} from 'aws-amplify'

class AuthReturn extends React.Component {
  constructor(props) {
    super()

    console.log("AUTH DISPATCH", props.dispatch)

    this.api = new API()

    this.state = {}
  }

  async componentDidMount() {
    console.log("AUTH RETURN", this.props)

    let finalRedirect = '/'

    let user
    try {
      user = await this.api.getUser()
      console.log("USER DOES EXIST", user._id)
      const currentUser = await Auth.currentAuthenticatedUser()
      if (!user || user && user.user && !user.user.userId) {
        console.log("RETURN CURRENT AUTHD", currentUser)
        if (currentUser && currentUser.signInUserSession && currentUser.signInUserSession.idToken) {
          const email = currentUser.signInUserSession.idToken.payload.email
          const awsEmailSub = currentUser.signInUserSession.idToken.payload.sub
          const accountsResults = await this.api.createAccounts(email, awsEmailSub)
          user = await this.api.getUser()
        }
      }
    } catch(err) {
      console.log("USER DOES NOT EXIST", err)
      let currentUser
      try {
        currentUser = await Auth.currentAuthenticatedUser()
        console.log("RETURN CURRENT AUTHD", currentUser)
        if (currentUser) {
          if (currentUser && currentUser.signInUserSession && currentUser.signInUserSession.idToken) {
            const email = currentUser.signInUserSession.idToken.payload.email
            const awsEmailSub = currentUser.signInUserSession.idToken.payload.sub
            console.log("CALLING CREATE ACCOUNTS", this.api.createAccounts)
            const accountsResults = await this.api.createAccounts(email, awsEmailSub)
            console.log("GETTING FINAL USER", accountsResults)
            user = await this.api.getUser()
          }
        }
      } catch(err) {
        console.log("COGNITO ERROR", err)
        // If we get here, it means both the API and Cognito
        // think we're logged out, which means we should
        // redirect back to the login screen
        finalRedirect = '/surveys'
      }
    }

    console.log("AUTH RETURN GOT USER", user)
    

    console.log("DISPATCHING USER", user && user.user, this.props.dispatch)
    this.props.dispatch({type: 'set', user: user && user.user})

    this.setState({
      user: user && user.user,
      loading: false,
    })

    console.log("DONE MOUNTING AUTH")

    this.props.history.replace(finalRedirect)
  }


  render() {
    console.log("AUTH RETURN RENDER")
    return null
  }
}

export default AuthReturn
