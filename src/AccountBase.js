import React from "react"
import {Text, ScrollView, KeyboardAvoidingView, Platform} from 'react-native'
import FeatherIcon from 'react-native-vector-icons/Feather'
import {Box, Button} from "native-base"

class AccountBase extends React.Component {
  render() {
    return (
      <Box style={{marginBottom: 100, backgroundColor: 'white', height: '100%'}}>
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
          <Text size="xl" style={{
            textAlign: 'center',
            color: '#4f4f4f',
            display: 'flex',
            fontSize: 26,
            flexWrap: 'wrap',
            alignSelf: 'center',
            marginTop: 10,
            flexBasis: '60%',
            fontWeight: 'bold',
          }}>
            {this.props.title}
          </Text>
        </Box>
        {/*<Text style={{fontSize: 18, textAlign: 'center', marginTop: 10, marginBottom: 10}}>{this.props.subtitle}</Text>*/}
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
        >             
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{flexGrow: 1}}>
            {this.props.children}
          </ScrollView>
        </KeyboardAvoidingView>
      </Box>
    )
  }
}

export default AccountBase