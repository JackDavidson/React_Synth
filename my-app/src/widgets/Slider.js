import React, { Component } from 'react';

class Slider extends Component {
  render() {
    return (
      <input className="Slider" type="range" min="1" max="100" defaultValue={5} onChange={this.props.onChange}/>
    )
  }
}

export default Slider