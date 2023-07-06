import React from "react"
import FeatherIcon from 'react-native-vector-icons/Feather'
import {Box, Button} from "native-base"
import {Text, ScrollView, KeyboardAvoidingView, Platform} from 'react-native'

class LoginBase extends React.Component {
  render() {
    return (
      <ScrollView showsVerticalScrollIndicator={true}>
        <Box>
          <Box style={{display: 'flex', flexDirection: 'row', marginTop: 20}}>
            <Button 
              onPress={this.props.onBackPress}
              style={{
                dispaly: 'flex',
                flexBasis: '20%',
                backgroundColor: 'white',
                marginTop: 10
              }}
            >
              <FeatherIcon style={{marginRight: 5}} size={22} name='arrow-left' />
            </Button>
            <Text style={{
              textAlign: 'center',
              color: '#4f4f4f',
              display: 'flex',
              fontSize: 36,
              flexWrap: 'wrap',
              alignSelf: 'center',
              marginTop: 10,
              flexBasis: '60%',
              fontWeight: 'bold',
            }}>
              {this.props.title}
            </Text>
          </Box>
          <Text style={{fontSize: 18, textAlign: 'center', marginTop: 10, marginBottom: 10}}>{this.props.subtitle}</Text>
            <KeyboardAvoidingView
              behavior={Platform.OS === "ios" ? "padding" : "height"}
            >          
              {this.props.children}
            </KeyboardAvoidingView>
        </Box>
      </ScrollView>
    )
  }
}

export default LoginBase