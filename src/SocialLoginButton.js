import React from "react"
import {Text} from 'react-native'
import Icon from 'react-native-vector-icons/FontAwesome'
import {Box, Button} from "native-base"

class SocialLoginButton extends React.Component {
  render() {
    return (
      <Button
        onPress={this.props.onPress}
        color={'#60B497'}
        style={{elevation: 5, height: 51, width: '100%', borderRadius: 10, backgroundColor: '#fff', borderColor: '#000000', borderWidth: 1}}
      >
        <Box style={{display: 'flex', flexDirection: 'row'}}>
          <Icon style={{marginRight: 5, flexBasis: '20%'}} size={20} name={this.props.iconName} />
          <Text style={{flexBasis: '50%', textAlign: 'center'}}>{this.props.text}</Text>
          <Box style={{flexBasis: '20%'}}></Box>
        </Box>
      </Button>
    )
  }
}

export default SocialLoginButton