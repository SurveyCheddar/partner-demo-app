import API from "./Api"
import React from "react"
import {connect} from 'react-redux'
import LottieView from 'lottie-react-native'
import Carousel, {Pagination} from 'react-native-new-snap-carousel'
import {Box, Button, Link, Text, Flex} from "native-base"
import {Platform, Image, Dimensions, ScrollView} from "react-native"

const config = require('./config')

const {width, height} = Dimensions.get('screen')

const generateBoxShadowStyle = (
  xOffset,
  yOffset,
  shadowColorIos,
  shadowOpacity,
  shadowRadius,
  elevation,
  shadowColorAndroid,
) => {
  if (Platform.OS === 'ios') {
    return {
      shadowColor: shadowColorIos,
      shadowOffset: {width: xOffset, height: yOffset},
      shadowOpacity,
      shadowRadius,
    }
  } else if (Platform.OS === 'android') {
    return {
      elevation,
      shadowOpacity,
      shadowRadius,
      shadowColor: shadowColorAndroid,
    }
  }
}

class Welcome extends React.Component {
  constructor() {
    super()

    this.api = new API
    this.carousel = React.createRef()

    this.state = {
      activeItem: 0,
      items: [
        {
          title: 'first',
          text: 'Earn points to spend on gift cards and prizes!',
          renderImage: () => {
            return (
              <Box key="welcome-card-first">
                <Image 
                  source={require('./images/coin-reward-confetti.png')}
                  style={{margin: 10, alignSelf: 'center'}}
                />  
              </Box>
            )
          }
        },
        {
          title: 'second',
          text: 'Link a credit or debit card to access exclusive dealts from your favorite brands',
          renderImage: () => {
            return (
              <Box key="welcome-card-first">
                <Image 
                  source={require('./images/card-and-coin.png')}
                  style={{margin: 10, alignSelf: 'center'}}
                />  
              </Box>
            )
          }
        },
        {
          title: 'third',
          text: 'Earn by sharing your opinion in our surveys',
          renderImage: () => {
            return (
              <Box>
                <Image 
                  source={require('./images/speech-bubble.png')}
                  style={{margin: 10, alignSelf: 'center'}}
                />  
              </Box>
            )
          }
        },
      ]
    }
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

    this.props.dispatch({type: 'set', user: user && user.user})
    return user || {}
  }

  async componentDidMount() {
    console.log("WELCOME DID MOUNT")
    
    console.log("APP MOUNTING")

    const {user} = await this.loadUser()
    console.log("WELCOME GOT USER", user)
    if (this.props.user) {
      this.props.history.push('/surveys')
    }
  }

  renderItem(pageInfo) {
    const {item, index} = pageInfo
    const {text, title} = item

    return (
      <Box
        style={{
          height: 250,
          backgroundColor: 'white',
          borderRadius: 8,
          elevation: 2,
          margin: 5,
          padding: 20,
          minWidth: 180
        }}
      >
        {item.renderImage()}
        <Text style={{textAlign: 'center', fontSize: 18, color: '#4F4F4F'}}>{text}</Text>
      </Box>
    )
  }

  render() {
    return (      
      <ScrollView>
        <Flex alignItems="center">
          <Text bold style={{fontSize: 36, lineHeight: 40, marginTop: 40, marginBottom: 10, color: '#4F4F4F'}}>Welcome</Text>
          <Text style={{fontSize: 20, textAlign: 'center', paddingLeft: 20, paddingRight: 20, color: '#4F4F4F'}}>
            Hello there, welcome
          </Text>
          <Text style={{fontSize: 20, lineHeight: 35, textAlign: 'center', paddingLeft: 20, paddingRight: 20, marginBottom: 20}}>
          to {config.appTitle}!
          </Text>
          <Box style={{height: 260, width: '100%'}}>
            <Carousel
              ref={this.carousel}
              data={this.state.items}
              layout={'default'}
              itemWidth={width - 40}
              sliderWidth={width}
              renderItem={this.renderItem.bind(this)}
              inactiveSlideScale={1}
              inactiveSlideOpacity={1}
              onSnapToItem={(index) => this.setState({activeItem: index})}
            />
          </Box>
          <Box>
            <Pagination
              dotsLength={this.state.items.length}
              activeDotIndex={this.state.activeItem}
              dotColor={'#60B497'}
              inactiveDotColor={'#aaa'}
              dotContainerStyle={{alignItems: 'flex-start'}}
              dotStyle={{
                  width: 10,
                  height: 10,
                  borderRadius: 5,
                  marginHorizontal: 1,
                  backgroundColor: 'rgba(255, 255, 255, 0.92)'
              }}
              inactiveDotStyle={{
                width: 10,
                height: 10,
                borderRadius: 5,
                marginHorizontal: 1,
              }}
              inactiveDotOpacity={0.4}
              inactiveDotScale={0.6}
            />
            <Button
              onPress={() => {this.props.history.push('/register')}}
              style={{elevation: 1, height: 51, width: 300, borderRadius: 10, marginTop: 20}}
              _text={{fontSize: 18}}
            >
              Sign Up
            </Button>
            <Button
              variant="outline"
              onPress={() => {this.props.history.push('/login')}}
              style={{height: 51, width: 300, borderRadius: 10, marginTop: 20}}
              _text={{fontSize: 18}}
            >
              Log In
            </Button>
          </Box>
          <Box style={{margin: 20, display: 'flex', flexDirection: 'row'}} _text={{fontSize: 10}}>
            By signing up you agree to our 
            <Link _text={{marginLeft: 1, fontSize: 10}} href="https://www.joincheddar.com/privacy-policy">Privacy Policy</Link> and 
            <Link _text={{marginLeft: 1, fontSize: 10}} href="https://www.joincheddar.com/terms-of-service">Terms of Service</Link>
          </Box>
        </Flex>
      </ScrollView>
    )
  }
}

const mapStateToProps = (state) => {
  return  {
    user: state.user,
  }
}

export default connect(mapStateToProps)(Welcome)
