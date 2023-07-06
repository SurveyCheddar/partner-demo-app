import Api from './Api'
import React from 'react'
import Theme from './Theme'
import ViewShot from 'react-native-view-shot'
import {connect} from 'react-redux'
import {WebView} from 'react-native-webview'
import {Box, Button, Text, Row, Column} from 'native-base'
// import smallIcon from '../../../../images/app-icon.png'
import {Overlay, LinearProgress} from 'react-native-elements'
// import {Block, theme, Text, Button} from 'galio-framework'
import {
  Image,
  Platform,
  StatusBar,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
} from 'react-native'

const config = require('./config')

const mapStateToProps = (state) => {
  return state
}

const {width, height} = Dimensions.get('window')

class SurveyView extends React.Component {
  constructor(props) {
    super()

    this.api = new Api()
    this.viewRef = React.createRef()

    const search = props.location.search
    console.log("LOCATION IS", props.location)
    const query = {}

    if (search && search.split('?')[1]) {
      const splitSearch = search.split('?')[1].split('&')
      for (let item of splitSearch) {
        let [key, val] = item.split('=')
        val = decodeURIComponent(val)
        query[key] = val
      }
    }

    console.log("SURVEY DETAILS QUERY PARAMS", query)

    this.state = {
      isBad: false,
      survey: {},
      isBroken: false,
      isLoading: true,
      urlHistory: [],
      showCancel: false,
      showReport: false,
      directLink: query.directLink,
      loadProgress: 1,
      hasSeenError: false,
      showPossibleIssue: false
    }
  }

  static getDerivedStateFromProps(props, state) {
    const search = props.location.search
    console.log("DERIVED LOCATION IS", props.location)
    const query = {}

    if (search && search.split('?')[1]) {
      const splitSearch = search.split('?')[1].split('&')
      for (let item of splitSearch) {
        let [key, val] = item.split('=')
        val = decodeURIComponent(val)
        query[key] = val
      }
    }

    const newState = {
      template: query.template,
      surveyId: props.match.params.id,
      provider: props.match.params.provider || query.provider,
      surveyType: props.match.params.type,
      directLink: props.match.params.directLink || query.directLink,
    }

    console.log("NEW STATE IS", newState, query)

    return newState
  }

  async componentDidMount() {
    this.unblock = this.props.history.block((location, action) => {
      if (action === 'POP') {
        return 'Leaving survey. Are you sure?'
      }
    })

    this.shotRef = React.createRef()

    this.setState({
      hasLoaded: true
    })
  }

  async componentWillUnmount() {
    if (this.unblock) {
      this.unblock()
    }
  }

  toggleCancelOverlay() {
    this.setState({
      showCancel: !this.state.showCancel
    })
  }

  toggleReportOverlay() {
    this.setState({
      showReport: !this.state.showReport
    })
  }

  togglePossibleErrorOverlay() {
    this.setState({
      showPossibleIssue: !this.state.showPossibleIssue
    })
  }

  getUrlHistory(url) {
    let historyItem = history[history.length - 1]
    if (!historyItem) {
      historyItem = {
        url: url,
        created: new Date().getTime()
      }
    }
  }

  addHistoryItem(url, finished, code) {
    const history = this.state.urlHistory
    if (finished) {
      let historyItem = history[history.length - 1]
      let hadItem = true
      if (!historyItem || historyItem.url !== url) {
        hadItem = false
        historyItem = {
          url: url,
        }
      }

      historyItem.code = code
      historyItem.finish = new Date().getTime()

      if (!hadItem) {
        history.push(historyItem)
      }
  
      const newState = {
        urlHistory: history
      }
  
      if (code && code !== 200) {
        console.log("SETTING HAS SEEN ERROR TRUE", code)
        newState.hasSeenError = true
      }

      this.setState(newState)
    } else {
      let historyItem = history[history.length - 1]
      let hadItem = true
      if (!historyItem || historyItem.url !== url) {
        hadItem = false
        historyItem = {
          url: url,
          code: code,
        }
      }

      historyItem.start = new Date().getTime()

      if (!hadItem) {
        history.push(historyItem)
      }
  
      const newState = {
        urlHistory: history
      }

      if (code && code !== 200) {
        console.log("SETTING HAS SEEN ERROR TRUE2", code)
        newState.hasSeenError = true
      }

      this.setState(newState)
    }
  }

  async onReportPress() {
    console.log("TAKING SCREENSHOT")
    
    const captureOpts = {
      result: 'base64',
      format: "jpg",
      quality: 0.7
    }

    const results = await ViewShot.captureRef(this.shotRef, captureOpts)

    // const results = await this.shotRef.current.capture(captureOpts)
    console.log("SCREENSHOT RESULTS", results.length)

    const surveyId = this.props.match.params.id
    console.log("FINAL HISTORY", this.state.urlHistory)
    await this.api.submitErrorReport(this.state.urlHistory, results, surveyId)
    await this.api.reportSurveyLeave(surveyId, 'error')

    this.setState({
      showReport: false,
    })

    this.props.history.push('/surveys')
  }

  async reportSurveyLeave(type) {
    const surveyId = this.props.match.params.id
    await this.api.reportSurveyLeave(surveyId, type)

    const errorTypes = [
      'NO_REDIRECT',
      'TECHNICAL_ERROR',
    ]

    if (errorTypes.includes(type)) {
      console.log("SUBMITTING ERROR REPORT")
      try {
        await this.submitErrorReport()
      } catch(err) {
        console.log("ERROR REPORT SUBMISSION ERROR", err)
      }
    }

    this.setState({
      isBad: false,
      isBroken: false,
      showReport: false,
    })

    this.props.history.push('/surveys')
  }

  async submitErrorReport() {
    const captureOpts = {
      result: 'base64',
      format: "jpg",
      quality: 0.7
    }

    const results = await ViewShot.captureRef(this.shotRef, captureOpts)
    const surveyId = this.props.match.params.id
    await this.api.submitErrorReport(this.state.urlHistory, results, surveyId)
  }

  async onExitPress() {
    const surveyId = this.props.match.params.id
    await this.api.reportSurveyLeave(surveyId)
    this.props.history.push('/surveys')
  }

  async onBrokenPress() {
    this.setState({
      isBroken: true
    })
  }

  async onBadPress() {
    this.setState({
      isBad: true
    })
  }

  render() {
    console.log("SURVEY DETAILS RENDER", this.state)
    const survey = this.state.survey || {}    
    let link = this.state.directLink || survey.meta && survey.meta.entry_link
    if (!survey || !link) {
      console.log("BAILING OUT, NO SURVEY INFO")
      return null
    }

    const headerHeight = 25
    const headerMarginTop = 0
    const platformOffset = Platform.OS === 'ios' ? 60 : 0
    const contentHeight = height - headerHeight - headerMarginTop - StatusBar.currentHeight - platformOffset

    const injectedJavascript = `(function() {
      window.postMessage = function(data) {
        window.ReactNativeWebView.postMessage(data);
      }

      document.querySelector("body").style.marginBottom = "80px"
    })()`

    const company = survey && survey.meta && survey.meta.company
    const shouldShowHeader = ['Pollfish'].includes(company) ? false : true

    console.log("FINAL WEBVIEW LINK", link, survey)

    if (link.indexOf('?') === -1) {
      link += `?responseType=message`
    } else {
      link += `&responseType=message`
    }

    const bgColor = '#fafafa'

    return (
      <Box>
        <ViewShot ref={this.shotRef} style={{height: '100%', width: '100%'}}>
          {shouldShowHeader ? (
            <Row style={{height: headerHeight, marginTop: headerMarginTop, display: 'flex', flexDirection: 'row'}}>
              {/* <Box>
                <Image source={smallIcon} style={{height: 30, width: 30, margin: 5}} />
              </Box> */}
              <Box style={{width: '50%', borderWidth: 0, display: this.state.hasSeenError ? null : 'none'}}>
                <Button
                  style={{backgroundColor: '#ff6666', height: 25, width: 120, shadowOpacity: 0}}
                  onPress={() => {
                    this.setState({
                      isBroken: true,
                      showReport: true,
                    })
                  }}
                >
                  <Text style={{color: 'black', height: 25}}>
                    Report Issue
                  </Text>
                </Button>
              </Box>
              <Box style={{width: '100%', flex: 1}}>
                <Box style={{borderWidth: 0, display: 'flex', alignSelf: 'flex-end'}}>
                  <Button
                    style={{backgroundColor: "#eee", height: 25, width: 50, shadowOpacity: 0}}
                    onPress={this.toggleCancelOverlay.bind(this)}
                    justifyContent={"center"}
                  >
                      {/* <ActivityIndicator style={{marginBottom: 10}} animating={this.state.isLoading} color="white" /> */}
                      <Text style={{color: 'black', fontSize: 15, height: 20, fontWeight: 'bold'}}>
                        X
                      </Text>
                  </Button>
                </Box>
              </Box>
            </Row>
          ) : null}
          <Box style={{height: contentHeight}}>
            <LinearProgress
              color={Theme.colors.secondary[600]}
              value={this.state.loadProgress}
              variant="determinate"
              animation={false}
            />
            <WebView
              javaScriptEnabled={true}
              injectedJavaScript={injectedJavascript}
              ref={this.viewRef}
              style={{width: '100%'}}
              source={{uri: link}}
              onLoadProgress={({ nativeEvent }) => {
                this.addHistoryItem(nativeEvent.url, false)
                console.log("ON LOAD PROGRESS", nativeEvent)
                this.setState({
                  isLoading: nativeEvent.progress !== 1,
                  loadProgress: nativeEvent.progress
                })
              }}
              onShouldStartLoadWithRequest={(request) => {
                console.log("ON SHOULD LOAD", request.url, request)
                const url = request.url
                return true
              }}
              onNavigationStateChange={(state) => {
                console.log("NAV STATE CHANGE", state)
                this.setState({
                  isLoading: state.loading
                })

                if (!state.loading) {
                  console.log("NAV STATE CHANGE", state)
                  this.addHistoryItem(state.url, true, 200)
                }
              }}
              onError={(err) => {
                console.log("WEBVIEW ON ERR", err.nativeEvent)
                this.addHistoryItem(err.nativeEvent.url, true, err.nativeEvent.statusCode)
              }}
              onHttpError={(err) => {
                console.log("WEBVIEW HTTP ERR", err.nativeEvent)
                this.addHistoryItem(err.nativeEvent.url, true, err.nativeEvent.statusCode)
              }}
              onMessage={(msg) => {
                console.log("ON MESSAGE", msg, survey.meta.company)
                if (survey && survey.meta && survey.meta.company === 'Pollfish') {
                  if (msg.nativeEvent.canGoBack) {
                    this.setState({
                      isBad: false,
                      isBroken: false,
                      showReport: false,
                    })

                    // this.props.history.push('/surveys')

                    if (msg.nativeEvent.data === 'userNotEligible') {
                      // this.props.history.push(`/surveys/${msg.nativeEvent.target}/disqualified`)
                    } else {
                      this.props.history.push('/surveys')
                    }                
                  }
                }
              }}
            />
          </Box>
          <Overlay
            isVisible={this.state.showCancel}
            overlayStyle={{backgroundColor: bgColor, width: '95%'}}
            onBackdropPress={this.toggleCancelOverlay.bind(this)}>
            <Box style={{padding: 20, backgroundColor: bgColor}}>
              <Text style={{fontSize: 30, marginBottom: 10, lineHeight: 40}}>Leaving Survey</Text>
              <Text style={{fontSize: 12, marginBottom: 10}}>You will lose your reward opportunity.</Text>
              <Text style={{fontSize: 16, marginBottom: 20}}>What makes you want to leave?</Text>
              {!this.state.isBad && !this.state.isBroken ? (
                <Column space={5}>
                  <Button
                    size="lg"
                    style={{backgroundColor: Theme.colors.primary[600], shadowOpacity: 0}}
                    onPress={this.onBrokenPress.bind(this)}
                  >
                    <Text style={{color: 'white'}}>
                      Broken Survey
                    </Text>
                  </Button>
                  <Button
                    size="lg"
                    style={{backgroundColor: Theme.colors.primary[600], shadowOpacity: 0}}
                    onPress={this.onBadPress.bind(this)}
                  >
                    <Text style={{color: 'white'}}>
                      Bad Survey
                    </Text>
                  </Button>
                </Column>
              ) : null}

              {this.state.isBad ? (
                <Column space={5}>
                  <Button
                    size="lg"
                    style={{backgroundColor: Theme.colors.primary[600], shadowOpacity: 0}}
                    onPress={() => {this.reportSurveyLeave('PRIVACY_INVASION')}}
                  >
                    <Text style={{color: 'white'}}>
                      Privacy Invasion
                    </Text>
                  </Button>
                  <Button
                    size="lg"
                    style={{backgroundColor: Theme.colors.primary[600], shadowOpacity: 0}}
                    onPress={() => {this.reportSurveyLeave('UNCOMFORTABLE_TOPICS')}}
                  >
                    <Text style={{color: 'white'}}>
                      Uncomfortable Topics
                    </Text>
                  </Button>
                  <Button
                    size="lg"
                    style={{backgroundColor: Theme.colors.primary[600], shadowOpacity: 0}}
                    onPress={() => {this.reportSurveyLeave('ASKED_FOR_NOT_ALLOWED_ACTION')}}
                  >
                    <Text style={{color: 'white'}}>
                      Required App Install, Logins, etc.
                    </Text>
                  </Button>
                  <Button
                    size="lg"
                    style={{backgroundColor: Theme.colors.primary[600], shadowOpacity: 0}}
                    onPress={() => {this.reportSurveyLeave('BAD_ON_MOBILE')}}
                  >
                    <Text style={{color: 'white'}}>
                      Not Mobile Friendly
                    </Text>
                  </Button>
                  <Button
                    size="lg"
                    style={{backgroundColor: Theme.colors.primary[600], shadowOpacity: 0}}
                    onPress={() => {this.reportSurveyLeave('DIDNT_LIKE')}}
                  >
                    <Text style={{color: 'white'}}>
                      Just Didn't Like It
                    </Text>
                  </Button>
                </Column>
              ) : null}

              {this.state.isBroken ? (
                <Column space={5}>
                  <Button
                    size="lg"
                    style={{backgroundColor: Theme.colors.primary[600], shadowOpacity: 0}}
                    onPress={() => {this.reportSurveyLeave('TECHNICAL_ERROR')}}
                  >
                    <Text style={{color: 'white'}}>
                      Technical Issue
                    </Text>
                  </Button>
                  <Button
                    size="lg"
                    style={{backgroundColor: Theme.colors.primary[600], shadowOpacity: 0}}
                    onPress={() => {this.reportSurveyLeave('NO_REDIRECT')}}
                  >
                    <Text style={{color: 'white'}}>
                      Failed to Redirect After Survey
                    </Text>
                  </Button>
                </Column>
              ) : null}

              {!this.state.isBad && !this.state.isBroken ? null : (
                <Text
                  style={{textDecorationLine: 'underline', marginTop: 5}}
                  onPress={() => {this.setState({isBad: false, isBroken: false})}}
                >
                  Back
                </Text>
              )}
            </Box>
          </Overlay>
          <Overlay
            overlayStyle={{backgroundColor: bgColor}}
            isVisible={this.state.showReport}
            onBackdropPress={this.toggleReportOverlay.bind(this)}
          >
            <Box center style={{backgroundColor: bgColor, padding: 20}}>
              <Text style={{fontSize: 30, marginBottom: 10, lineHeight: 40}}>
                Report a Problem
              </Text>
              <Text style={{fontSize: 14, marginBottom: 20}}>
                Sorry you're having issues!
              </Text>
              <Text style={{fontSize: 14, marginBottom: 20}}>
                Click below to submit an error report and screenshot.
                Our support team will get in touch.
              </Text>
              <Button
                style={{backgroundColor: Theme.colors.primary[600], shadowOpacity: 0}}
                onPress={this.onReportPress.bind(this)}
              >
                <Text style={{color: 'white'}}>
                  Report Issue
                </Text>
              </Button>
            </Box>
          </Overlay>
          <Overlay
            isVisible={this.state.showPossibleIssue}
            onBackdropPress={this.togglePossibleErrorOverlay.bind(this)}
          >
            <Box center style={{padding: 20}}>
              <Text style={{fontSize: 30, marginBottom: 10}}>
                Possible Survey Issue
              </Text>
              <Text style={{fontSize: 14, marginBottom: 20, textAlign: 'center'}}>
                We detected an issue with the survey. This is usually a broken survey or survey provider bug.
              </Text>
              <Text style={{fontSize: 14, marginBottom: 20, textAlign: 'center'}}>
                Sometimes we're still able to get you rewards from proviers for broken surveys. If so, they'll show up in your account within a few hours.
              </Text>
              <Text style={{fontSize: 14, marginBottom: 20, textAlign: 'center'}}>
                Would you like to submit an error report?
              </Text>
              <Button
                style={{backgroundColor: Theme.colors.primary[600], shadowOpacity: 0}}
                onPress={() => {
                  this.setState({
                    showReport: true,
                    showPossibleIssue: false
                  })
                }}
              >
                <Text style={{color: 'white'}}>
                  Report Issue
                </Text>
              </Button>
            </Box>
          </Overlay>
        </ViewShot>
      </Box>
    )
  }
}

export default connect(mapStateToProps)(SurveyView)
