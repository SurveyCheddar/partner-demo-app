import App from './App'
import store from './src/store.js'
import React from 'react'
import {Provider} from 'react-redux'
import {AppRegistry} from 'react-native'
import {name as appName} from './app.json'

class ConnectWrapper extends React.Component {
  render() {
    return (
      <Provider store={store}>
        <App />
      </Provider>
    )
  }
}

AppRegistry.registerComponent(appName, () => ConnectWrapper);
