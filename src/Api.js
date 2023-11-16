import {Auth, Amplify} from 'aws-amplify'
import messaging from '@react-native-firebase/messaging'
import {Platform} from 'react-native'
import DeviceInfo from 'react-native-device-info'
import queryString from 'querystring'
import Geolocation from '@react-native-community/geolocation'
import {NetworkInfo} from 'react-native-network-info'

const config = require('../src/config')

const API_URL = config.api.url

class API {
  constructor() {
    const apiConfig = JSON.stringify({config: config.api, env: process.env.NODE_ENV})
  }

  async makeRequest(url, opts={}, params={}) {
    console.log("MAKE REQUEST", url)
    const method = opts.method ? opts.method.toUpperCase() : 'GET'
    const transform = params.transform || 'json'

    
    let token
    try {
      console.log("REQUEST IN PROGRESS", url, opts, Auth.currentSession.toString())
      const session = await Auth.currentSession()
      if (session && session.accessToken) {
        token = session.accessToken.jwtToken
      }
    } catch(err) {
      console.log("GET TOKEN ERR", err, err && err.stack)
      if (opts.noRedirects) {
        throw new Error("401 failed to login")
      } else {
        window.location = '/#/welcome'
      }
    }

    const headers = opts.headers || {}
    if (token) {
      headers['access-token'] = token
    }

    console.log("SENDING REQUEST WITH TOKEN", headers)

    headers['app'] = config.appName
    headers['x-app-id'] = config.appId
    opts.headers = headers

    try {
      if (opts.credentials === undefined) {
        opts.credentials = 'include'
      }

      if (['POST', 'PUT'].includes(method.toUpperCase())) {
        opts.headers = opts.headers || {}
        opts.headers['Content-Type'] = 'application/json'
      }

      const longReqTimeout = setTimeout(() => {
        console.log("LONG REQUEST", url)
      }, 5000)

      const res = await fetch(url, opts)


      if (res.status === 200) {
        clearTimeout(longReqTimeout)
        const results = await res[transform]()
        return results

      } else if (res.status === 401) {
        clearTimeout(longReqTimeout)
        if (opts.noRedirects) {
          throw new Error("401 failed to login")
        } else {
          window.location = '/#/welcome'
        }
      }
    } catch(err) {
      console.log("REQUEST ERR", url, err)
      // window.location = `${API_URL}/auth/slack`

      throw err
    }
  }

  async logout() {
    await Auth.signOut()
  }

  async login(email, password) {
    const url = `${API_URL}/login`
    const opts = {
      method: 'POST',
      body: JSON.stringify({username: email, password})
    }

    const results = await this.makeRequest(url, opts)
    return results
  }

  async getUser() {
    const url = `${API_URL}/v1/user/info`
    const results = await this.makeRequest(url, {}, {noRedirects: true})
    return results
  }

  async getAppManifest() {
    const url = `${API_URL}/v1/app/manifest`
    const results = await this.makeRequest(url, {}, {noRedirects: true})
    return results
  }

  async createAccounts(email, awsUserSub) {
    const ipAddress = await this.getIpAddress()

    const url = `${API_URL}/v1/signup`
    const opts = {
      method: 'POST',
      body: JSON.stringify({
        email: email,
        ipAddress: ipAddress,
        awsUserSub: awsUserSub,
      })
    }

    const results = await this.makeRequest(url, opts)
    return results
  }

  async getSurveys() {
    const url = `${API_URL}/v1/surveys`
    const results = await this.makeRequest(url)
    return results
  }

  async getIpAddress() {
    const url = `${API_URL}/v1/ipaddress`
    const results = await this.makeRequest(url)
    return results && results.ip
  }

  async submitErrorReport(urlHistory, screenshot, surveyId) {
    const url = `${API_URL}/v1/report/survey`
    const opts = {
      method: 'POST',
      body: JSON.stringify({
        history: urlHistory,
        screenshot: screenshot
      })
    }

    const results = await this.makeRequest(url, opts)
    return results
  }

  async reportSurveyLeave(surveyId, leaveType) {
    const url = `${API_URL}/v1/surveys/${surveyId}/leave`

    const opts = {
      method: 'POST',
      body: JSON.stringify({
        type: leaveType,
        time: new Date(),
      })
    }

    const results = await this.makeRequest(url, opts)
    return results
  }
}

export default API
