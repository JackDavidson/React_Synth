import React, { Component } from 'react';
import './App.css';
import Slider from './widgets/Slider';
import Button from './widgets/Button';
import AcousticGuitarProfile from './synth/profiles/AcousticGuitarProfile'
import SynthibleFactory from './synth/core/SynthibleFactory';
import convert16BitDataToWav from './synth/util/ArrayToWav';
import Sound from 'react-sound';

class App extends Component {
  hertz = 440
  completedWavData = null

  slider = <Slider onChange={(nhz) => {
    this.hertz = parseInt(nhz.target.value)
    //this.hertz =
    this.completedWavData = null
    this.playingSound = false
    this.refreshCompleteState()
  }}/>

  renderPrepButton() {
    return <Button
      hertz={this.hertz}
      onClick={() => {
        var builder = new SynthibleFactory(new AcousticGuitarProfile())
        var sounds = builder.synthSound(this.hertz)
        console.log("finished creating sound at hz: " + this.hertz)

        console.log("length of sounds is: " + sounds.length + " type of sounds is: " + typeof sounds)
        this.completedWavData = convert16BitDataToWav(sounds)
        console.log("finished conversion to wav. displaying button")

        this.refreshCompleteState()
      }}
      text={"Render at " + this.hertz + "Hz"}
    />
  }

  playingSound = false
  renderSound() {
    console.log("playing sound is: " + this.playingSound)
    if (!this.playingSound) {
      console.log("returning null sound.")
      return null
    }
    console.log("returning the playing sound: " + this.completedWavData.dataURI)
    console.log("length of the sound is: " + this.completedWavData.wav.length)
    return (
      <Sound
        url={this.completedWavData.dataURI}
        playStatus={Sound.status.PLAYING}
        playFromPosition={0 /* in milliseconds */}
        autoLoad={true}

      />
    );
  }

  renderPlayButton() {
    // var sound = <Sound url={this.completedWavData.dataURI} playStatus={Sound.status.PLAYING}/>

    console.log("rendering play button: " + this.completedWavData)
    if (!this.completedWavData)
      return null
    console.log("returning actual button. ")
    //var audioSRC = <source type='audio/wav;'/>

    //var audio    = <audio src={}>{audioSRC}</audio>
    //audio.append(audioSRC);
    //audioSRC.src = ;
    //audio.load();
    return <Button text={"Play Sound"} onClick={() => {
      this.playingSound = true
      this.refreshCompleteState()
    }}/>
  }

  refreshCompleteState() {
    this.setState({
      prepareButton: this.renderPrepButton(),
      playButton: this.renderPlayButton(),
      sound: this.renderSound()
    })
  }

  constructor(props) {
    super(props)
    this.state = {
      prepareButton: this.renderPrepButton(),
      playButton: this.renderPlayButton(),
      sound: this.renderSound()
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
              {this.state.sound}
            </td>
          </tr>
        </tbody>
      </table>

    );
  }
}

export default App;
