import React from "react"
import {Input, FormControl, WarningOutlineIcon} from 'native-base'

class ValidatedInput extends React.Component {
  
  constructor() {
    super()
    this.state = {}
  }

  static getDerivedStateFromProps(props, state) {
    return props
  }


  render() {
    return (
      <FormControl isInvalid={this.state.isInvalid}>
        <Input
          size={'lg'}
          onChangeText={this.props.onChangeText}
          borderless
          value={this.state.value}
          type={this.props.type || 'text'}
          placeholder={this.props.placeholder}
          autoCapitalize={"none"}
          autoFocus={this.props.autoFocus}
          keyboardType={this.props.keyboardType}
        />
        <FormControl.ErrorMessage leftIcon={<WarningOutlineIcon size="xs" />}>
          {this.state.message}
        </FormControl.ErrorMessage>
      </FormControl>
    )
  }
}

export default ValidatedInput