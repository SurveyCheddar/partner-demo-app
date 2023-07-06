import React from "react"
import {Text, View} from 'react-native'

class DividerWithText extends React.Component {
  render() {
    return (
      <View style={{flexDirection: 'row', alignItems: 'center'}}>
        <View style={{flex: 1, height: 1, backgroundColor: '#BDBDBD'}} />
        <View>
          <Text style={{fontWeight: 'bold', width: this.props.text.length * 8 + 20, textAlign: 'center', fontSize: 18}}>{this.props.text}</Text>
        </View>
        <View style={{flex: 1, height: 1, backgroundColor: '#BDBDBD'}} />
      </View>
    )
  }
}

export default DividerWithText