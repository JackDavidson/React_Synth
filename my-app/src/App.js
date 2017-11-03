import React, { Component } from 'react';
import './App.css';
import Slider from './widgets/Slider';
import Button from './widgets/Button';
import AcousticGuitarProfile from './synth/profiles/AcousticGuitarProfile'
import SynthibleFactory from './synth/core/SynthibleFactory';
import convert16BitDataToWav from './synth/util/ArrayToWav';

class App extends Component {
  hertz = 5

  slider = <Slider onChange={(nhz) => {
    this.hertz = nhz.target.value
    this.setState ({button: <Button
      hertz={this.hertz}
      onClick={() => {
        var builder = new SynthibleFactory(new AcousticGuitarProfile())
        var sounds = builder.synthSound(this.hertz)
        console.log("finished creating sound at hz: " + this.hertz)

        console.log("length of sounds is: " + sounds.length)
        var wavData = convert16BitDataToWav(sounds)
        console.log("finished conversion to wav.")
      }}
      text={"Render at " + this.hertz + "Hz"}
    />})


    console.log("hertz is " + nhz.target.value)
  }}/>

  constructor(props) {
    super(props)
    this.state = {
      button: <Button
        hertz={this.hertz}
        onClick={() => {
          var builder = new SynthibleFactory(new AcousticGuitarProfile())
          builder.synthSound(this.hertz)
          console.log("finished creating sound at hz: " + this.hertz)
        }}
        text={"Render at " + this.hertz + "Hz"}
      />
    }
  }

  renderSlider() {
    return this.slider
  }


  render() {
    return (
      <table className="Main-container">
        <tbody>
          <tr>
            <td>
              <div className="App">
                <p className="App-intro">
                  How to use:<br/>
                  1. drag slider to select the hertz<br/>
                  2. click 'Render'<br/>
                  3. click 'play' after generation is complete<br/>
                </p>
              </div>
            </td>
          </tr>
          <tr>
            <td>
              {this.renderSlider()}
              <br/>
              {this.state.button}
            </td>
          </tr>
        </tbody>
      </table>

    );
  }
}

export default App;
