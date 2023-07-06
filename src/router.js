import React from 'react'
import Login from './Login'
import Theme from './Theme'
import {Box} from 'native-base'
import Header from './Header'
import Footer from './Footer'
import Success from './Success'
import Welcome from './Welcome'
import Surveys from './Surveys'
import Register from './Register'
import SurveyView from './SurveyView'
import AuthReturn from './AuthReturn'
import Disqualified from './Disqualified'
import {Linking, Dimensions} from 'react-native'
import {NativeRouter, Route, withRouter, Switch, BackButton} from 'react-router-native'
import Animated, { SlideInRight, SlideOutRight, SlideInDown, SlideOutDown } from 'react-native-reanimated';

const config = require('../src/config')

const {width, height} = Dimensions.get('window')

class Navigator extends React.Component {
  constructor() {
    super()
    this.state = {
      baseUrl: config.app.url,
    }
  }

  componentDidMount() {
    Linking
      .getInitialURL()
      .then(url => this.onUrlChange({ url }))
      .catch(console.error);

    Linking.addEventListener('url', this.onUrlChange.bind(this))
  }

  componentWillUnmount() {
    Linking.removeEventListener && Linking.removeEventListener('url', this.onUrlChange.bind(this))
  }

  onUrlChange(event) {
    const baseUrl = this.state.baseUrl
    if (event.url && event.url.indexOf(baseUrl) === 0) {
      const path = event.url.replace(baseUrl, '')

      this.setState({
        path: path
      })

      this.props.history.push(path)
    } else {
      // console.log("NO PARSE", baseUrl)
    }
  }

  render() {
    return null
  }
}

const RouterNavigator = withRouter(Navigator)

const TheLayout = (props) => {
  const Contents = props.contents

  console.log("LAYING OUT WITH CONTENTS", Contents.constructor)

  const headerHeight = 40
  const footerHeight = 10
  const contentHeight = height - headerHeight - footerHeight

  // const colors = config.ui.colors || {}
  // const textColor = colors.text
  // const headerTextColor = colors.headerText || textColor
  
  // const background = colors.background
  // const headerBackground = colors.header || background

  const FooterClass = props.footer === undefined ? Footer : props.footer
  const HeaderClass = props.header === undefined ? Header : props.header

  return (
    <Box style={{}}>
      <HeaderClass
        // title={config.ui.title || config.ui.appName}
        // bgColor={headerBackground}
        // titleColor={headerTextColor}
        {...props}
      />
      <Box>
        <Contents {...props} />
      </Box>
      <FooterClass {...props} />
    </Box>
  )
}

class AppRouter extends React.Component {

  constructor(props) {
    super()
    this.state = {}
  }

  static getDerivedStateFromProps(nextProps) {
    return {}
  }

  onBackUrlChange(event) {
    
  }

  getUserConfirmation(event) {
    
  }

  shouldComponentUpdate(prevState, nextState) {
    return false
  }

  render() {
    console.log("ROUTER RENDER")
    const withLayout = (Component) => {
      return (props) => {
        return (
          <TheLayout {...this.props} {...props} contents={Component} />
        )
      }
    }

    const withProps = (Component) => {
      return (props) => {
        return (
          <Component {...this.props} {...props} />
        )
      }
    }

    const withSurveyLayout = (Component) => {
      return (props) => {
        return (
          <TheSurveyLayout {...this.props} {...props} contents={Component} />
        )
      }
    }

    const referralCode = this.props.user && this.props.user.meta && !this.props.user.meta.referralCode
    console.log("REFERRAL CODE IS", referralCode)
    const overlay = referralCode ? (<ReferralOverlay {...this.props} />) : null    
    // const overlay = null

    const dynamicRoutes = []
    if (this.props.routes) {
      for (let defs of this.props.routes) {
        let wrapperFn
        switch (defs.wrapper) {
          case 'withLayout':
            wrapperFn = withLayout.bind(this)
            break
          case 'withProps':
            wrapperFn = withProps.bind(this)
            break
          default:
            wrapperFn = (Component) => {return Component}
            break
        }

        dynamicRoutes.push((
          <Route key={`route_${defs.route}`} exact path={defs.route} component={wrapperFn(defs.view)} />
        ))
      }
    }

    return (
      <NativeRouter getUserConfirmation={this.getUserConfirmation.bind(this)}>
        {overlay}
        <BackButton onUrlChange={this.onBackUrlChange.bind(this)}>
          <RouterNavigator />
          <Switch>
            {dynamicRoutes}
            <Route exact path='/login' component={withProps(Login)} />
            <Route exact path='/return' component={withProps(AuthReturn)} />
            <Route exact path='/survey' component={withProps(SurveyView)} />
            <Route exact path='/welcome' component={withProps(Welcome)} />
            <Route exact path='/surveys' component={withProps(Surveys)} />
            <Route exact path='/register' component={withProps(Register)} />
            <Route exact path='/success' component={withProps(Success)} />
            <Route exact path='/disqualified' component={withProps(Disqualified)} />
            {/*<Route component={Loading} />*/}
            <Route component={withProps(Welcome)} />
          </Switch>
        </BackButton>
      </NativeRouter>
    )
  }
}

export default AppRouter
// export default connect(mapStateToProps)(AppRouter)
