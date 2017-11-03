import React, { Component } from 'react';
import AcousticGuitarProfile from '../synth/profiles/AcousticGuitarProfile'
import SynthibleFactory from "../synth/core/SynthibleFactory";

class Button extends Component {
  render() {
    return (
      <button onClick={this.props.onClick}>
        {this.props.text}
      </button>
    )
  }
}

export default Button