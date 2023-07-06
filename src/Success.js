import API from './Api'
import anim from './confetti-anim.json'
import React from 'react'
import {connect} from 'react-redux'
import analytics from '@react-native-firebase/analytics'
import LottieView from 'lottie-react-native'
import queryString from 'querystring'
import {Animated, Easing, ScrollView} from 'react-native'
import {Button, Text, Box, ZStack, VStack} from 'native-base'

const config = require('./config')

const mapStateToProps = (state) => {
  return state
}

class Success extends React.Component {
  constructor(props) {
    super()

    this.api = new API()

    const search = props.location.search
    const query = queryString.parse(search)

    this.state = {
      reward: query.reward || .24,
      progress: new Animated.Value(0),
      hasLoaded: false,
    }
  }

  async componentDidMount() {

    this.setState({
      hasLoaded: true,
    })

    Animated.timing(this.state.progress, {
      easing: Easing.linear,
      toValue: 1,
      duration: 5000,
      useNativeDriver: true
    }).start()
  }

  async onSurveysPress() {
    this.props.history.push('/surveys')
  }

  render() {
    if (!this.state.hasLoaded || !this.props.user) {
      return null
    }

    const survey = this.state.survey || {meta: {}}

    const currencySymbol = this.props.user.currencySymbol || ''
    const currencyName = this.props.user.currencyName || ''
    const conversionFactor = this.props.user.pointsConversion || 1
    const currencyNameSpaced = currencyName && currencyName.length > 0 ? ` ${currencyName}` : ''
    const rawPayout = this.state.reward || survey.meta.payout
    const payout = conversionFactor * rawPayout

    return (
      <Box>
        <ScrollView
          style={{marginBottom: 0}}
          showsVerticalScrollIndicator={false}
        >

          <ZStack style={{margin: 20, alignItems: 'center'}}>
            <LottieView
              autoPlay
              loop={false}
              style={{width: '100%', minHeight: 800}}
              source={anim}
              // progress={this.state.progress}
            /> 
        
            <VStack space={70} justifyContent="space-between">
              <Text bold fontSize="xl" style={{textAlign: 'center', marginTop: 40}}>
                Nice work, you just earned {currencySymbol}{payout}{currencyNameSpaced}! 
              </Text>

              <Text style={{textAlign: 'center'}}>
                More surveys are waiting for you, claim your reward and keep earning!
              </Text>

              <Button
                onPress={this.onSurveysPress.bind(this)}
                // onPress={() => {this.onSurveysPress()}}
                // onPress={() => {console.log('pressed')}}
              >
                Take another survey
              </Button>            
            </VStack>
          </ZStack>
        </ScrollView>
      </Box>
    )
  }
}

// export default hook(Success)
export default connect(mapStateToProps)(Success)
