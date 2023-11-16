import Api from './Api'
import Rate from 'react-native-rate'
import React from 'react'
import Theme from './Theme'
import moment from 'moment'
import Avatar from 'react-native-boring-avatars'
import inbrain from 'inbrain-surveys'
import PageBase from './PageBase'
import {connect} from 'react-redux'
import messaging from '@react-native-firebase/messaging'
import analytics from '@react-native-firebase/analytics'
import {Tab, Icon} from 'react-native-elements'
import {hook, wrap} from 'cavy'
import InAppBrowser from 'react-native-inappbrowser-reborn'
import {Image, Linking, StyleSheet, Dimensions, ScrollView, RefreshControl, ActivityIndicator} from 'react-native'
import {Box, Text, Flex, Badge, Button, Center, HStack, VStack, ZStack, FlatList, Skeleton, Progress, Pressable} from 'native-base'

const loadingSurveys = [
  {
    _id: 1,
    key: 1,
  },
  {
    _id: 2,
    key: 2,
  } 
]
 

const config = require('./config')

const {width} = Dimensions.get('screen')

const MAX_SURVEYS = 6
const DEFAULT_SURVEY_ID = 'default-survey-id'

const mapStateToProps = (state) => {
  return state
}

const tabIndexes = ['surveys']

class Surveys extends React.Component {
  constructor(props) {
    super()

    this.api = new Api()

    const tab = props.match.params.tab
    let startIndex = tabIndexes.indexOf(tab)
    if (startIndex === -1) {
      startIndex = 0
    }

    this.state = {
      user: null,
      // history: null,
      index: startIndex,
      offers: [],
      surveys: [],
      transactions: [],
      hasLoaded: false,
      refreshing: false,
      selectedType: null,
      isLoadinSurvey: false,
    }
  }

  static getDerivedStateFromProps(nextProps, state) {
    const tab = nextProps.match.params.tab
    let startIndex = tabIndexes.indexOf(tab) || 0
    if (startIndex === -1) {
      startIndex = 0
    }

    return Object.assign({}, nextProps, {
      index: startIndex
    })
  }

  generateSurvey(index) {
    const lois = [3, 6, 4, 3, 5, 12, 4, 9]
    const payouts = [1280, 960, 1290, 940, 50, 910, 400, 240]
    const maxPayout = payouts[index]
    // const maxPayout = (6 * Math.random()).toFixed(2)
    const payout = (maxPayout / 4).toFixed(2)
    return {
      meta: {
        loi: lois[index],
        created_at: new Date().toISOString(),
        company: 'Inbrain',
        entry_link: 'https://justsurveys.co',
        max_payout: maxPayout,
        payout: payout,
        potential_bonus: (maxPayout - payout).toFixed(2)
      },
      _id: DEFAULT_SURVEY_ID
    }
  }

  async componentDidMount() {
    console.log("COMPONENT DID MOUINT")
    this.setState({refreshing: true})

    console.log('LOCATION', this.state.location)

    // await this.props.resources.refreshUser()
    // this.props.resources.updateBalanceAndHistory()

    const userId = this.state.user && this.state.user._id
    let user = this.state.user

    if (!user) {
      return this.props.history.push('/login')
    }

    console.log("INITIALIZING INBRAIN", this.props.manifest)

    const {clientId, clientSecret} = this.props.manifest.inbrain

    await inbrain.init(clientId, clientSecret, {
      title: "Top Rated Surveys",
      isS2S: false,
      userId: userId,
      statusBar: {
        lightStatusBar: true
      },
      navigationBar: {
        hasShadow: false,
        titleColor: '#fafafa',
        buttonsColor: '#FFA900',
        backgroundColor: '#121212',
      },
    })

    await this.reloadSurveys()

    const nowTime = new Date().getTime()
    const oneWeekAgo = nowTime - 1000 * 60 * 60 * 24 * 7

    if (this.state.user) {
      const userCreatedTime = new Date(this.state.user.date).getTime()

      // If this user has been around for at least a week, ask them to rate the app
      if (userCreatedTime < oneWeekAgo) {
        new Promise(async (resolve, reject) => {
          if (!this.state.user.preventRatePrompt) {
            console.log("RUNNING RATE.RATE")
            try {
              const options = {
                AppleAppID: config.appleAppId,
                GooglePackageName: config.packageName,
                preferInApp: true,
                inAppDelay: 5.0,
                openAppStoreIfInAppFails: false,
              }
  
              await Rate.rate(options, async (success, err) => {
                console.log("RATE RESULTS", success, err)
                if (success) {
                  await analytics().logEvent('user_review_success', {})
                }
              })
            } catch(err) {
              console.log("RATE ERROR", err)
            }
          }
        })
      }
    }

    this.setState({refreshing: false, hasLoaded: true, isLoadinSurvey: false})
  }

  async reloadSurveys() {
    console.log("RELOADING SURVEYS")
    try {
      if (this.state.user) {
        const [apiSurveys, nativeSurveys] = await Promise.all([
          this.getSurveys(),
          inbrain.getNativeSurveys()
        ])
        
        console.log("GOT NATIVE SURVEYS", nativeSurveys)

        const surveys = []

        const manifest = this.props.manifest
        const introRewardCents = manifest.inbrain.introRewardCents || 15

        const hasNativeIntro = nativeSurveys.length === 1 && nativeSurveys[0].value === introRewardCents

        for (let survey of nativeSurveys) {
          const directLink = `${config.app.url}/surveys/native/inbrain/${survey.id}`
          surveys.push({
            _id: survey.id,
            directLink: directLink,
            inBrainNative: true,
            provider: 'inbrain',
            meta: {
              exernal_survey_id: survey.id,
              loi: survey.time,
              company: 'Inbrain Native',
              conversion_rate: .5,
              rank: survey.rank,
              payout: (survey.value / 100).toFixed(2),
              title: 'InBrain Native'
            }
          })
        }

        // If we have the native intro survey, we want users to complete it before they take
        // API surveys, because they may have completed the API intro studies, meaning the
        // API will send back a bunch of surveys, drowning out the single native intro.
        if (!hasNativeIntro) {
          for (let survey of apiSurveys) {
            surveys.push(survey)
          }
        }

        const newState = {
          surveys: surveys
        }

        this.setState(newState)
      } else {
        const defaultSurveys = []
        for (let iSurvey=0; iSurvey<MAX_SURVEYS; ++iSurvey) {
          defaultSurveys.push(this.generateSurvey(iSurvey))
        }
  
        this.setState({
          surveys: defaultSurveys
        })
      }
    } catch(err) {
      console.log("GET SURVEY ERR", err)
    }
  }

  async getSurveys() {
    console.log("GETTING SURVEYS")
    const surveys = []

    const results = await this.api.getSurveys()
    console.log("GOT SURVEY RESULTS")
    for (let survey of (results && results.surveys || [])) {
      if (survey) {
        surveys.push(survey)
      }
    }

    console.log("DONE GETTING SURVEYS", surveys.length)
    return surveys
  }

  async getOffers() {
    const offers = []
    const results = await this.api.getOffers()
    for (let survey of (results && results.offers || [])) {
      offers.push(survey)
    }

    console.log("GOT OFFERS", offers.length)

    return offers
  }

  async getAds() {
    const offers = []
    const results = await this.api.getAds()
    for (let survey of (results && results.offers || [])) {
      offers.push(survey)
    }

    return offers
  }

  async getInbrainSurveys() {
    let nativeSurveys
    try {
      nativeSurveys = await inbrain.getNativeSurveys()
    } catch(err) {
      console.log("INBRAIN ERR", err)
    }

    const surveys = []
    for (let survey of nativeSurveys) {
      const directLink = `${config.app.url}/surveys/native/inbrain/${survey.id}`
      surveys.push({
        _id: survey.id,
        directLink: directLink,
        inBrainNative: true,
        provider: 'inbrain',
        meta: {
          exernal_survey_id: survey.id,
          loi: survey.time,
          company: 'Inbrain Native',
          conversion_rate: .5,
          payout: (survey.value / 100).toFixed(2),
          title: 'InBrain Native'
        }
      })
    }

    return surveys
  }

  async onRefresh(event) {
    this.setState({refreshing: true})
    // await this.props.resources.clear('surveys')
    await this.reloadSurveys()
    this.setState({refreshing: false})
  }

  ratingDiamonds(survey) {
    const items = []
    
    const conversionRate = survey.meta.conversion_rate

    let rating = 4
    if (conversionRate >= 0.05 && conversionRate < 0.15) {rating = 1}
    if (conversionRate >= 0.15 && conversionRate < 0.25) {rating = 2}
    if (conversionRate >= 0.25 && conversionRate < 0.5) {rating = 3}
    if (conversionRate > 0.5) {rating = 4}

    for (let iHeart=0; iHeart<rating; ++iHeart) {
      items.push((
        <Box key={`rating_heart_${survey._id}_${iHeart}`} style={{}}>
           <Text style={{fontSize: 8, textAlign: 'center'}}>⭐</Text>{/*<Icon name="diamond" family="ArgonExtra" style={{paddingRight: 8}} /> */}
        </Box>
      ))
    }

    return items
  }

  async onStartPress(survey) {
    console.log("PRESSED SURVEY", survey)
    if (this.state.isLoadinSurvey) {
      return
    } else {
      this.setState({
        isLoadinSurvey: true
      })
    }

  
    const extId = survey.meta.exernal_survey_id
    let surveyUrl = survey.directLink || `${config.app.url}/surveys/${survey._id}?extId=${encodeURIComponent(extId)}&provider=${survey.provider}`
    
    if (survey.meta.template) {
      surveyUrl += '&stateless=true'
      surveyUrl += `&template=${encodeURIComponent(JSON.stringify(survey.meta.template))}`
    }

    if (survey._id === DEFAULT_SURVEY_ID) {
      this.props.history.push(`/welcome`)
    } else {
      // No study waiting, so we go straight to the survey
      let finalPath = `/surveys/${survey._id}?extId=${encodeURIComponent(extId)}&provider=${survey.provider}`
        
      if (survey.meta.template) {
        finalPath += '&stateless=true'
        finalPath += `&template=${encodeURIComponent(JSON.stringify(survey.meta.template))}`
      }
      console.log("REGULAR SURVEY DETAILS", finalPath)
  
      this.props.history.push(`/survey?directLink=${encodeURIComponent(survey.meta.entry_link)}`)
    }
  }

  async onStartOfferPress(offer) {
    console.log("PRESSED OFFER", offer.meta.entry_link, offer)
    await Promise.allSettled([
      this.api.setIpAddress(),
      this.api.setSystemInfo(offer.meta.exernal_survey_id),
    ])
    
    if (offer._id === DEFAULT_SURVEY_ID) {
      this.props.history.push(`/welcome`)
    } else {
      Linking.openURL(offer.meta.entry_link)
    }
  }

  onShowAllPress(type) {
    console.log("SHOW ALL", type)
    this.setState({
      selectedType: type
    })
  }

  surveyBlock(type, surveys, title, description, color, opts={}) {
    if (!surveys || surveys.length === 0) {
      return (<Box key={`empty_surveys_block_${type}`}></Box>)
    }

    const maxBlocks = opts.limit === undefined || opts.limit === null ? Infinity : opts.limit

    // Make sure we have at least 4 "real" surveys to display
    surveys[1] = surveys[1] || surveys[0]
    surveys[2] = surveys[2] || surveys[0]
    surveys[3] = surveys[3] || surveys[0]

    const blockRows = []
    for (let iSurvey=0; iSurvey<surveys.length; iSurvey += 2) {
      if (iSurvey >= maxBlocks && maxBlocks !== 0) {
        break
      }

    blockRows.push((
        <Box key={`block_row_box_${title}_${iSurvey}`}>
          <Flex direction='row' key={`block_row_${title}_${iSurvey}`} style={{marginTop: -40, marginBottom: 40}}>
            {this.surveyCard(surveys[iSurvey], iSurvey)}
            {this.surveyCard(surveys[iSurvey + 1], iSurvey + 1)}
          </Flex>
        </Box>
      ))
    }


    return (
      <Box
        style={{width: '100%', marginTop: 50, padding: 10}} 
        key={`survey_block_${surveys[0]._id}_${Math.random()}`}
      >
        {blockRows}
      </Box>
    )
  }

  surveyCard(survey, index) {
    if (!survey || !this.props.user) {return null}

    const navigation = this.props.navigation
    const surveyId = survey._id === DEFAULT_SURVEY_ID ? index : survey._id
    
    const pointsConversion = this.props.user.pointsConversion
    const payout = Number(survey.meta.payout || 0)
    const payoutPoints = Math.floor(payout * pointsConversion)

    const user = this.props.user || {}

    const currencySymbol = user.currencySymbol || ''
    const currencyName = user.currencyName || ''
    const conversionFactor = user.pointsConversion || 1
    const convertedPayout = (survey.meta.payout * conversionFactor).toFixed(0)


    let potentialBonus = survey.meta.potential_bonus
    if (potentialBonus && potentialBonus.toFixed) {
      potentialBonus = potentialBonus.toFixed(2)
    }

    return (


      <Box
        style={{backgroundColor: 'white', borderRadius: 20, margin: 10, padding: 10, minWidth: '45%', borderColor: '#D3D3D3', borderWidth: 1}}
        // borderWidth="1" 
        // _dark={{borderColor: "gray.600"}} 
        // borderColor="coolGray.200" pl="4" pr="5" py="2"
      >
        <Pressable onPress={() => {this.onStartPress(survey)}}>
        {/*<Pressable onPress={() => {console.log('PRESSED')}}>*/}
          <Center>
            <HStack space={3} justifyContent="space-between">
              <VStack justifyContent="space-between" >
                <Box>
                  <Center>
                    <Text fontSize="xs" color="#366EB3">
                      earn up to
                    </Text> 
                  </Center>                 
                </Box>


              
                <Box>
                  <ZStack style={{height: 90}} alignItems="center" justifyContent="center">
                    <Box>
                      {/* <Avatar
                        name={JSON.stringify(index)}
                        variant={'ring'}
                        size={80}
                        colors={['#8BA6AC', '#D7D7B8', '#E5E6C9', '#F8F8EC', '#BDCDD0']}
                        // colors={['#B5F4BC', '#FFF19E', '#FFDC8A', '#FFBA6B', '#FF6543']}
                      /> */}
                      <Image 
                        source={require('./images/blob-green-1.png')}
                        style={{height: 100, width: 100}}
                      />                  
                      {/* <Image
                        source={{uri: 'https://source.boringavatars.com/marble/120/Maria%20Mitchell?square'}}
                        style={{height: 80, width: 80, borderWidth: 1, borderColor: 'red'}}
                      /> */}
                    </Box>  

                    <Center>
                      <Text fontSize="3xl" color="#366EB3" bold style={{marginLeft: 5}}>
                        {convertedPayout}{currencySymbol}
                      </Text>
                    </Center>
                  </ZStack>
                </Box>


                <Box>
                  <Center>
                    <Flex direction="row">
                      {/*<Center>
                        <Icon color="#366EB3" name="hourglass-half" type="font-awesome-5" size={15} style={{marginRight: 5}}/>
                      </Center>  */}          
                      <Text fontSize="sm" color="#366EB3" bold>
                        {survey.meta.loi} minutes
                      </Text>
                    </Flex>
                  </Center>
                </Box>            

                {/* high payout surveys */}
                {survey.meta.payout > 1 &&
                  <Box>
                    <Center>
                      <Badge style={{backgroundColor: '#91B9A3', borderRadius: 20, marginTop: 5}}>
                        <Flex direction="row">
                          <Center>
                            <Icon color="#FFFFFF" name="university" type="font-awesome-5" size={15} style={{marginRight: 5}}/>
                          </Center>            
                          <Text fontSize="sm" color="#FFFFFF" bold>
                            Make Bank
                          </Text>
                        </Flex>
                      </Badge>
                    </Center>
                  </Box>                  
                }


                {/* high converting surveys */}
                {survey.meta.conversion_rate > .75 &&
                  <Box>
                    <Center>
                      <Badge style={{backgroundColor: '#EB9003', borderRadius: 20, marginTop: 5}}>
                        <Flex direction="row">
                          <Center>
                            <Icon color="#FFFFFF" name="fire" type="font-awesome-5" size={15} style={{marginRight: 5}}/>
                          </Center>            
                          <Text fontSize="sm" color="#FFFFFF" bold>
                            Hot Survey
                          </Text>
                        </Flex>
                      </Badge>
                    </Center>
                  </Box>                  
                }    


                {/* boosted */}
                {survey.meta.boosted &&
                  <Box>
                    <Center>
                      <Badge style={{backgroundColor: '#2B64A8', borderRadius: 20, marginTop: 5}}>
                        <Flex direction="row">
                          <Center>
                            <Icon color="#FFFFFF" name="arrow-circle-up" type="font-awesome-5" size={15} style={{marginRight: 5}}/>
                          </Center>            
                          <Text fontSize="sm" color="#FFFFFF" bold>
                            Boosted
                          </Text>
                        </Flex>
                      </Badge>
                    </Center>
                  </Box>                  
                }    


                {/* top rated */}
                {survey.meta.rank === 1 &&
                  <Box>
                    <Center>
                      <Badge style={{backgroundColor: '#F8D06B', borderRadius: 20, marginTop: 5}}>
                        <Flex direction="row">
                          <Center>
                            <Icon color="#FFFFFF" name="gem" type="font-awesome-5" size={15} style={{marginRight: 5}}/>
                          </Center>            
                          <Text fontSize="sm" color="#FFFFFF" bold>
                            Top Rated
                          </Text>
                        </Flex>
                      </Badge>
                    </Center>
                  </Box>                  
                }                                                


              </VStack>
            </HStack>

          </Center>
        </Pressable>
      </Box>
    )
  }


  onContactPress() {
    const user = this.props.user || {}
    const subject = `${user._id} Help Request`
    Linking.openURL(`mailto:support@surveycheddar.com?subject=${subject}`)
  }

  renderLoadingItem = (item) => {

      return (

        <Flex direction='row'>
          <Box
            style={{backgroundColor: 'white', borderRadius: 20, margin: 10, padding: 10, minWidth: '44%', borderColor: '#D3D3D3', borderWidth: 1, borderRadius: 20 }}
          >
              <VStack flex="3" space="4">
                <Center>
                  <Skeleton height="3" w="10" rounded="full" startColor="#366EB3" />
                </Center>
                <Skeleton height="16" startColor="#73FFB3" rounded="full" />
                <HStack space="2" alignItems="center">
                  <Skeleton size="5" rounded="full" />
                  <Skeleton h="3" flex="2" rounded="full" startColor="#366EB3" />
                  <Skeleton h="3" flex="1" rounded="full" />
                </HStack>
              </VStack>
          </Box>    

          <Box
            style={{backgroundColor: 'white', borderRadius: 20, margin: 10, padding: 10, minWidth: '44%', borderColor: '#D3D3D3', borderWidth: 1, borderRadius: 20 }}
          >
              <VStack flex="3" space="4">
                <Center>
                  <Skeleton height="3" w="10" rounded="full" startColor="#366EB3" />
                </Center>
                <Skeleton height="16" startColor="#73FFB3" rounded="full" />
                <HStack space="2" alignItems="center">
                  <Skeleton size="5" rounded="full" />
                  <Skeleton h="3" flex="2" rounded="full" startColor="#366EB3" />
                  <Skeleton h="3" flex="1" rounded="full" />
                </HStack>
              </VStack>
          </Box>    
        </Flex>
    )
  }

  renderSurveys() {
    if (this.props.history.location.pathname === '/reloadSurveys') {
      this.props.history.push('/surveys')
      return null
    }

    const primaryColor = Theme.colors.primary[600]
    const buttonTextColor = 'white'

    const surveys = this.state.surveys || []

    if (!surveys) {
      console.log("NO SURVEYS FOR RENDERING")
      return
    } else {
      console.log("RENDER SURVEYS", surveys.length)
    }

    const surveyBlocks = []
    const providerOrder = ['inbrain', 'lucid', 'sayso', 'precision', 'tapresearch', undefined]

    const sortedByProviders = surveys.sort((a, b) => {
      const aIndex = providerOrder.indexOf(a.provider) === -1 ? 1 : providerOrder.indexOf(a.provider)
      const bIndex = providerOrder.indexOf(b.provider) === -1 ? 1 : providerOrder.indexOf(b.provider)
      return aIndex - bIndex
    })

    // I genuinely don't know why this is necessary, but it works and I don't have time to understand
    const correctlySorted = []
    for (let item of sortedByProviders) {
      correctlySorted.push(item)
    }

    const surveyTypes = {
      best: [correctlySorted, 'Recommended', 'Surveys for you', '#F8D06B'],
      speed: [surveys.sort((a, b) => {return a.meta.loi - b.meta.loi}), 'Speedy Surveys', 'Our fastest surveys', '#B0E5B4'],
      reward: [surveys.sort((a, b) => {return Number(b.meta.payout) - Number(a.meta.payout)}), 'High Rewards', 'Surveys that pay the most', '#F8D06B'],
      all: [surveys, 'All Surveys', 'Everything we have for you', '#91B9A3', {limit: 0}]
    }

    if (this.state.selectedType) {
      surveyBlocks.push(this.surveyBlock(this.state.selectedType, ...surveyTypes[this.state.selectedType], {limit: null}))
    } else {
      surveyBlocks.push(this.surveyBlock('best', ...surveyTypes.best, {limit: 0}))
    }

    if (surveys.length === 0) {
      surveyBlocks.push(
        <Box key={`empty_survey_list`} style={{margin: 40}}>
          <Text fontSize="xl" style={{marginTop: 50, marginBottom: 50, textAlign: 'center'}}>
            Oops, we didn't find any surveys for you. Let's try that again.
          </Text>
          <Box>
            <Button color={primaryColor} onPress={this.onRefresh.bind(this)}>
              <Text style={{color: buttonTextColor}}>
                Try Again
              </Text>
            </Button>
          </Box>
        </Box>
      )
    }

    return (
      <Box center style={{width: '100%'}}>
        <ScrollView
          style={{width: '100%'}}
          // style={{width: '100%', position: 'absolute', borderWidth: 2}}
          refreshControl={
            <RefreshControl
              onRefresh={this.onRefresh.bind(this)}
              refreshing={this.state.refreshing}
            />
          }
          showsVerticalScrollIndicator={false}
          // contentContainerStyle={styles.articles}
        >
          <Box>
            {surveyBlocks}
          </Box>
        </ScrollView>
      </Box>
    )
  }

  onSetIndex(tabIndex) {
    const tab = tabIndexes[tabIndex]
    console.log("SET INDEX", tabIndex, tabIndexes, tab, this.props.location)
    this.props.history.push(`/surveys/tab/${tab}`)
  }

  async onCashOut() {  
    console.log('onCashout clicked', this.props.user.earnings, this.state.current)
    const redeemable = this.props.user.earnings
    const results = await this.api.cashOut()
    console.log('RESULTS', results)
  }

  getTransactionItems() {
    const statusLabels = {
      CARD: 'Earn on Everything Card Reward',
      TASK: 'Survey Reward',
      REWARD: 'Reward',
      CASHOUT: 'Cash Out',
      SUBLABEL: 'Successfully completed survey',
      'REFERRAL-SENT': 'Referral Code Used',
      'REFERRAL-REDEEMED': 'Redeemed Referral Code',
    }

    const statusSublabels = {
      TASK: 'You earned rewards for successfully completing a survey.',
      CASHOUT: 'You cashed in your rewards!',
      'REFERRAL-SENT': 'A user who you referred just earned',
      'REFERRAL-REDEEMED': 'You redeemed a rewarded referral code',
    }

    const prizeItems = []
    const surveyItems = []
    const cashoutItems = []

    const user = this.props.user || {}

    console.log('TRANSACTIONS', this.state.transactions)

    this.state.transactions.sort((a, b) => {
      a.timestamp > b.timestamp ? -1 : 1
    })
    
    const primaryColor = Theme.colors.primary[600]

    let lastDay
    for (let iTransaction in this.state.transactions) {
      const transaction = this.state.transactions[iTransaction]
      const nextTransaction = this.state.transactions[Number(iTransaction) + 1]

      let statusLabel = transaction.label || statusLabels[transaction.type]
      let statusSubLabel = statusSublabels[transaction.type]
      let currencyName = transaction.currencyName || user.currencyName || ''
      const directionSymbol = transaction.amount >= 0 ? '+' : '-'
      const currencySymbol = transaction.currencySymbol || user.currencySymbol || ''
      const conversionFactor = transaction.pointsConversion || user.pointsConversion || 1
      const rewardAmount = conversionFactor * transaction.amount / 100
      const payoutLink = transaction.payout_link

      // console.log('GOT HERE...', currencyName, directionSymbol, currencySymbol, conversionFactor, rewardAmount)

      if (currencyName === 'points') {
        currencyName = 'pts'
      }

      if (transaction.status !== 'COMPLETE') {
        statusLabel += ' (pending)'
      }

      const currentDay = moment(transaction.timestamp).format('MMM DD')
      let nextDay
      if (nextTransaction) {
        nextDay = moment(nextTransaction.timestamp).format('MMM DD')
      }

      let dayHeader = null
      if (currentDay !== lastDay) {
        lastDay = currentDay
        dayHeader = (
          <Box bg="#73FFB3" key={`day_header_${currentDay}`} style={{padding: 5, borderRadius: 10, width: 80, marginBottom: 15}}>
            <Text bold style={{color: '#366EB3', fontWeight: 'bold', marginLeft: 5, textAlign: 'center'}}>{currentDay}</Text>
          </Box>
        )
      }

      const newItem = (
        <Pressable key={`history_item_${transaction._id}`} onPress={() => { 
          if (payoutLink) {
            console.log('PRESSED')   
            InAppBrowser.open(payoutLink)
          }
        }}>
          <Box style={{margin: 10}} key={`transaction_block_${iTransaction}`}>
            <Box>
              {dayHeader}
            </Box>

            <Flex direction='row' justifyContent="space-between" style={{marginLeft: 15}}>
              {nextDay && nextDay === currentDay ? (
                <Box style={{borderLeftWidth: 2, position: 'absolute', width: '100%', height: 50, marginLeft: 9, marginTop: 9, borderColor: '#73FFB3'}} />
              ) : null}
              <Flex direction='row'>
                {statusLabel === 'Cash Out' &&
                  <Center>
                    <Box style={{backgroundColor: '#73FFB3', width: 20, height: 20, borderRadius: 20, marginRight: 10}}></Box>
                  </Center>
                }

                {statusLabel !== 'Cash Out' &&
                  <Center>
                    <Box style={{backgroundColor: '#73FFB3', width: 20, height: 20, borderRadius: 20, marginRight: 10}}></Box>
                  </Center>
                }              

                <Flex direction='column'>
                  {statusLabel === 'Cash Out' &&
                    <Text style={{color: '#4F4F4F'}} bold>{statusLabel} <Icon color={primaryColor} name="external-link-alt" type="font-awesome-5" size={13} style={{marginTop: 2, marginLeft: 5}} /></Text>
                  }
                  {statusLabel !== 'Cash Out' &&
                    <Text style={{color: '#4F4F4F'}} bold>{statusLabel}</Text>
                  }                
                </Flex>
              </Flex>

              <Flex direction='row'>
                {statusLabel === 'Cash Out' &&
                  <Center>
                    <Box style={{backgroundColor: '#73FFB3', width: 10, height: 10, borderRadius: 10, marginRight: 5}}></Box>
                  </Center>
                }

                {statusLabel !== 'Cash Out' &&
                  <Center>
                    <Box style={{backgroundColor: '#73FFB3', width: 10, height: 10, borderRadius: 10, marginRight: 5}}></Box>
                  </Center>
                }

                <Box>
                  <Text bold style={{color: '#4F4F4F'}}>{rewardAmount}{currencyName && currencyName.length > 0 ? ` ${currencyName}` : ''}</Text>            
                </Box>

              </Flex>
            </Flex>
          </Box>
        </Pressable>
      )

      if (['TASK', 'REFERRAL-REDEEMED', 'REFERRAL-SENT', 'CASHOUT', 'CARD', 'REWARD'].includes(transaction.type)) {
        surveyItems.push(newItem)
      } else if (transaction.type === 'BONUS') {
        prizeItems.push(newItem)
      } else {
        cashoutItems.push(newItem)
      }
    }

    return {prizeItems, cashoutItems, surveyItems}
  }  

  render() {
    // surveyItems = []

    const WrappedBlock = wrap(Box)

    if (this.state.isLoadinSurvey) {
      return (
        <ActivityIndicator color={'black'} size="large" style={{marginTop: 250}} />
      )
    }

    const secondaryColor = Theme.colors.secondary[600]

    if (!this.state.hasLoaded) {
    // if (true) {
      return (
        <PageBase
          title="earn instant cash"
          onBackPress={() => {this.props.history.goBack()}}
        >

          <WrappedBlock
            center
            // style={styles.home}
            style={{width: '100%'}}
            user={this.props.user}
            history={this.props.history}
            ref={this.props.generateTestHook(`Surveys`)}
          >

            <Box w='90%' style={{marginBottom: 20}}>
              <Skeleton h="20" rounded="full"/>
            </Box>          
            
            <FlatList
              data={loadingSurveys}
              showsVerticalScrollIndicator={false} 
              renderItem={({item}) => this.renderLoadingItem(item)}
              keyExtractor={item => `dashboard_loading_item_${item.key}`}
            />
          

            <Box w='90%' style={{marginTop: 60, marginBottom: 40, paddingTop: 20, paddingBottom: 20, borderColor: '#D3D3D3', borderWidth: 1, borderRadius: 20}}>      
              <HStack space="2" alignItems="center" style={{margin: 30}}>
                <Skeleton size="5" rounded="full" startColor="#73FFB3"/>
                <Skeleton h="3" flex="2" rounded="full" />
                <Skeleton h="3" flex="2" rounded="full" />
                <Skeleton h="3" flex="1" rounded="full" startColor="#73FFB3" />
              </HStack>
            </Box>

          </WrappedBlock>
        </PageBase>
      )
    }

    const {surveyItems} = this.getTransactionItems()    

    const indicatorStyle = {
      backgroundColor: secondaryColor,
    }

    const tabs = []
    tabs.push(
      <Tab.Item key='tab-surveys' tabStyle={{color: 'white'}} containerStyle={{}} title={(
        <Box style={{paddingTop: 0}} center>
          <Text style={{fontSize: 18}}>Surveys</Text>
        </Box>
      )} />
    )

    return (
      <PageBase
        title="earn instant cash"
        onBackPress={() => {this.props.history.push('/')}}
      >
        <WrappedBlock
          center
          // style={styles.home}
          style={{width: '100%'}}
          user={this.props.user}
          history={this.props.history}
          ref={this.props.generateTestHook(`Surveys`)}
        >
          <Box w="80%">
            <Box style={{marginBottom: 10}}>
              <Text bold fontSize="3xl" style={{textAlign: 'center'}}>${this.props.user.earnings} <Text fontSize="sm">/ ${this.props.user.minimumCashout}</Text></Text> 
            </Box>

            <Progress value={(this.props.user.earnings / 5) * 100} bg="coolGray.100" _filledTrack={{bg: "#366EB3"}} />
          </Box>

          {tabs.length > 1 ? (
            <Tab
              // variant="primary"
              indicatorStyle={indicatorStyle}
              value={this.state.index}
              onChange={this.onSetIndex.bind(this)}
              theme={{
                colors: {
                  primary: Theme.colors.primary[600],
                  secondary: bgColor,
                  disabled: bgColor,
                  divider: bgColor,
                }
              }}
            >
              {tabs}
            </Tab>
          ) : null}
          <Box style={{width: '100%'}}>
            {tabIndexes[this.state.index] === 'surveys' ? this.renderSurveys() : null}
          </Box>

          <Box w="90%" p="15" style={{borderColor: '#D3D3D3', borderWidth: 1, borderRadius: 20}}>


            <Text bold style={{textAlign: 'center'}}>get paid your way</Text>

            <ScrollView horizontal={true} showsHorizontalScrollIndicator={false}>

              <Box style={{margin: 10}}>
                <Image 
                  source={require('./images/paypal.png')}
                  style={{height: 64, width: 64}}
                />                   
              </Box>

              <Box style={{margin: 10}}>
                <Image 
                  source={require('./images/venmo.png')}
                  style={{height: 64, width: 64}}
                />                   
              </Box>

              <Box style={{margin: 10}}>
                <Image 
                  source={require('./images/amazon.png')}
                  style={{height: 64, width: 64}}
                />                   
              </Box>

              <Box style={{margin: 10}}>
                <Image 
                  source={require('./images/walmart.png')}
                  style={{height: 64, width: 64}}
                />                   
              </Box>                                          

            </ScrollView>

            <Button isDisabled={this.props.user.earnings < this.props.user.minimumCashout} onPress={this.onCashOut.bind(this)}><Text color="white">cashout @ <Text>${this.props.user.minimumCashout}</Text></Text></Button>

          </Box>

          <Box style={{marginTop: 60, marginBottom: 40, paddingTop: 20, paddingBottom: 20, width: '90%', borderColor: '#D3D3D3', borderWidth: 1, borderRadius: 20}}>
            <Text bold style={{textAlign: 'center'}}>your earnings</Text>
            

            {!this.state.hasLoaded &&
              <Box style={{margin: 30}}>
                {[1,2,3,4,5,6,7,8,9].map(n =>   
                  <HStack space="2" alignItems="center" style={{marginBottom: 30}}>
                    <Skeleton size="5" rounded="full" startColor="#F8D06B"/>
                    <Skeleton h="3" flex="2" rounded="full" />
                    <Skeleton h="3" flex="2" rounded="full" />
                    <Skeleton h="3" flex="1" rounded="full" startColor="#60B497" />
                  </HStack>
                  )
                }
              </Box>            
            }

            {
              this.state.hasLoaded ? (
                <Box>
                  {surveyItems}
                </Box>
              ) : null
            }            
          </Box>                    
        </WrappedBlock>
      </PageBase>
    )
  }
}

export default connect(mapStateToProps)(hook(Surveys))
