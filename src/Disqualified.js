import API from './Api'
import anim from './disqual-anim.json'
import React from 'react'
import analytics from '@react-native-firebase/analytics'
import LottieView from 'lottie-react-native'
import {Animated, Easing, ScrollView} from 'react-native'

import { Button, Text, Center, Box} from 'native-base'

const config = require('./config')

class Disqualified extends React.Component {
  constructor(props) {
    super()

    this.api = new API()

    this.state = {
      surveyId: props.match.params.id,
      progress: new Animated.Value(0),
      hasLoaded: false,
    }
  }

  async componentDidMount() {
    await analytics().logEvent('survey_terminate', {})

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
    this.props.resources.updateBalanceAndHistory()
    this.props.resources.clear('surveys')
    this.props.history.push('/surveys')
  }

  render() {
    if (!this.state.hasLoaded) {
      return null
    }

    const survey = this.state.survey || {meta: {}}
    const textColor = config.ui.colors.text

    const WrappedBlock = wrap(Box)

    return (
      <WrappedBlock
        ref={this.props.generateTestHook(`Disqualified`)}
        style={{margin: 20}}
      >
        <ScrollView showsVerticalScrollIndicator={false}>
          <Text bold fontSize="2xl" style={{marginTop: 60}}>
            Disqualified
          </Text>
          <Text bold style={{marginTop: 20}}>
            It looks like our partner was looking for a different profile for this survey. Don't worry, there are plenty more surveys available.
          </Text>     
          <Text bold style={{marginTop: 20}}>
            Coming soon: you will be rewarded with tickets for our daily and weekly raffles upon disqualification. Keep an eye out!
          </Text>               
          <Center style={{marginBottom: 40}}>
            <LottieView
              autoPlay
              style={{height: 200, marginTop: 10}}
              source={anim}
              progress={this.state.progress}
            />
          </Center>
          <Button
            onPress={this.onSurveysPress.bind(this)}
          >
            Back to Surveys
          </Button>
        </ScrollView>
      </WrappedBlock>
    )
  }
}

export default Disqualified
