import React, { Component } from 'react';

class Slider extends Component {
  render() {
    return (
      <input className="Slider" type="range" min="200" max="700" defaultValue={440} onChange={this.props.onChange}/>
    )
  }
}

export default Slider