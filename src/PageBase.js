import React from "react"
import FeatherIcon from 'react-native-vector-icons/Feather'
import {Box, Button} from "native-base"
import {Text, ScrollView, KeyboardAvoidingView, Platform} from 'react-native'

class PageBase extends React.Component {
  render() {
    return (
      <ScrollView showsVerticalScrollIndicator={true}>
        <Box>
          <Box style={{display: 'flex', flexDirection: 'row', marginTop: 20, marginBottom: 10,}}>
            <Button 
              onPress={this.props.onBackPress}
              style={{
                dispaly: 'flex',
                flexBasis: '20%',
                backgroundColor: 'white',
              }}
            >
              <FeatherIcon style={{marginRight: 5}} size={22} name='arrow-left' />
            </Button>
            <Text numberOfLines={1} style={{
              textAlign: 'center',
              color: '#4f4f4f',
              display: 'flex',
              fontSize: 18,
              flexWrap: 'wrap',
              alignSelf: 'center',
              flexBasis: '60%',
              fontWeight: 'bold',
            }}>
              {this.props.title}
            </Text>
          </Box>
          {this.props.subtitle ? (
            <Text style={{fontSize: 18, textAlign: 'center', marginTop: 10, marginBottom: 10}}>
              {this.props.subtitle}
            </Text>
          ) : null}
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

export default PageBase