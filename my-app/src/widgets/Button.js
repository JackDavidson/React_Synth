import React, { Component } from 'react';
import AcousticGuitarProfile from '../synth/profiles/AcousticGuitarProfile'
import SynthibleFactory from "../synth/core/SynthibleFactory";

class Button extends Component {
  render() {
    return (
      <button onClick={() => {
        var builder = new SynthibleFactory(new AcousticGuitarProfile())
        builder.synthSound(50)
      }}>
        {this.props.text}
      </button>
    )
  }
}

export default Button