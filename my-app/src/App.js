import React, { Component } from 'react';
import './App.css';
import Slider from './widgets/Slider';
import Button from './widgets/Button';
import AcousticGuitarProfile from './synth/profiles/AcousticGuitarProfile'
import SynthibleFactory from './synth/core/SynthibleFactory';
import convert16BitDataToWav from './synth/util/ArrayToWav';

class App extends Component {
  hertz = 440
  completedWavData = null

  slider = <Slider onChange={(nhz) => {
    this.hertz = nhz.target.value
    this.completedWavData = null
    this.refreshCompleteState()
  }}/>

  renderPrepButton() {
    return <Button
      hertz={this.hertz}
      onClick={() => {
        var builder = new SynthibleFactory(new AcousticGuitarProfile())
        var sounds = builder.synthSound(this.hertz)
        console.log("finished creating sound at hz: " + this.hertz)

        console.log("length of sounds is: " + sounds.length)
        this.completedWavData = convert16BitDataToWav(sounds)
        console.log("finished conversion to wav. displaying button")

        this.refreshCompleteState()
      }}
      text={"Render at " + this.hertz + "Hz"}
    />
  }

  renderPlayButton() {
    console.log("rendering play button: " + this.completedWavData)
    if (!this.completedWavData)
      return null
    console.log("returning actual button. ")
    return <Button text={"Play Sound"} />
  }

  refreshCompleteState() {
    this.setState({
      prepareButton: this.renderPrepButton(),
      playButton: this.renderPlayButton()
    })
  }

  constructor(props) {
    super(props)
    this.state = {
      prepareButton: this.renderPrepButton(),
      playButton: this.renderPlayButton()
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
              {this.state.prepareButton}
              <br/><br/>
              {this.state.playButton}
            </td>
          </tr>
        </tbody>
      </table>

    );
  }
}

export default App;
