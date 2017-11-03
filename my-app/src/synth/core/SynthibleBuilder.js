import SynthSettings from './SynthSettings'

var makeLookup    = function(steps, waveFunction) {
  waveFunction = !waveFunction ? Math.sin : waveFunction;
  var table    = new Array(steps),
    ang      = 0,
    angStep  = (Math.PI * 2) / steps;
  for(var i = 0; i < steps; i++) {
    if((table[i] = waveFunction(ang)) > 1) {
      throw "ERROR! passed function goes above 1";
    }
    ang += angStep;
  }
  return table;
};

/*
* @Constructor
*
* @smoothvol transition volume smoothly between notes in this single synthible?
* @smoothNote same thing
* @waveFunction ex. Math.sin, or a user-defined function
*/
class SynthibleBuilder {


  constructor(smoothVol, smoothNote, waveFunction) {
    this.hz = [];
    this.lengths = [];
    this.volumes = [];
    if (waveFunction instanceof Array) {
      this.funcTable = waveFunction;
    } else {
      this.waveFunction = !waveFunction ? Math.sin : waveFunction;
      this.funcTable = makeLookup(8192, waveFunction);
    }
    this.smoothVol = typeof smoothVol == 'undefined' ? false : smoothVol; // smooth the different volumes together?
    this.smoothNote = typeof smoothNote == 'undefined' ? false : smoothNote; // smooth the different volumes together?
    this.harmonics = [];
    this.harmonicsVolume = [];
    this.cashedWave = false;

    // sets up a harmonic. the harmonic will follow the note
    // precisely in volume and changes in hz. harmonicVol is
    // the relative volume, eg .4, .3
    this.appendHarmonic = function (harmonic, harmonicVol) {
      if (!harmonic)
        throw "Error! need to specify harmonic!";
      this.harmonics.push(harmonic);
      this.harmonicsVolume.push(!harmonicVol ? .5 : harmonicVol);
      this.cashedWave = false;
    }
    // appends a note, which can be a different hz, or volume.
    // depending on settings, the note will be transitioned to
    // smoothly throughout the previous note's length, or not.
    this.appendNote = function (hz, length, volume) {
      if (!hz)
        throw "ERR! hz is undefined!";
      if (typeof length == 'undefined')
        throw "ERR! length (seconds) is undefined!";
      this.hz.push(hz);
      this.lengths.push(length);
      this.volumes.push(typeof volume == 'undefined' ? 1 : volume); // vol defaults to 1
      //console.log("vol: " + (typeof volume == 'undefined' ? 1 : volume));
      this.cashedWave = false;
    }
    // generates the uInt16Array
    this.toWaveForm = function () {
      if (this.hz.length == 0)
        throw "Err! appendHz was never called!";
      if (!this.cashedWave)
        this.cashedWave = this.toWaveFormInternal();
      return this.cashedWave;
    }

  }

  // every argument is a double. works same as
  // appendHarmonic, but sets all the harmonics at once.
  setHarmonics(harmonics, harmonicsVol) {
    if (!harmonics)
      throw "Error! need to specify harmonics!";
    this.harmonics = harmonics;
    this.harmonicsVolume = !this.harmonicsVolume ? [] : this.harmonicsVolume;
    this.cashedWave = false;
  }




  // duplicates the currect synthible
  branch() {
    var result = new SynthibleBuilder(this.smoothVol, this.smoothNote, this.funcTable);
    result.hz = !this.hz ? [] : this.hz.slice(0);
    result.lengths = !this.lengths ? [] : this.lengths.slice(0);
    result.volumes = !this.volumes ? [] : this.volumes.slice(0);
    result.waveFunction = this.waveFunction;
    result.harmonics = !this.harmonics ? [] : this.harmonics.slice(0);
    result.harmonicsVolume = !this.harmonicsVolume ? [] : this.harmonicsVolume.slice(0);
    result.cashedWave = this.cashedWave;
    return result;
  }
  toWaveFormInternal() {
    // sin repeats every 2 pi, so Math.PI*noteHz gives the change we need in x, if it were the case that sample rate were 1 hz.
    // since the sample rate is 44,100 HZ, we need to move along 44,100 times slower.
    var innerSinMultiplier = new Array(this.harmonics.length + 1);
    var outerSinMultiplier = new Array(this.harmonics.length + 1);
    // START level 5 synth
    // logmsg("Doing level 5 synth");
    //console.log("t");
    this.volumes.push(this.volumes[this.volumes.length - 1]);
    this.hz.push(this.hz[this.hz.length - 1]);
    var totalLengthInSec = 0;
    for (var i = 0; i < this.lengths.length; i++)
      totalLengthInSec += this.lengths[i];
    var totalSamples = Math.round(totalLengthInSec * SynthSettings.sampleRate);
    for (var i = 0; i < this.harmonics.length + 1; i++) {
      innerSinMultiplier[i] = new Float64Array(totalSamples + 1);
      outerSinMultiplier[i] = new Float64Array(totalSamples + 1);
    }
    // note: volumes are adjusted based on hz, since lower notes will need volume to be upped.
    for (var harmonic = 0; harmonic < this.harmonics.length + 1; harmonic++) {
      var totSamples = 0;
      var piTimesHarmonicDivSamplerate;
      if (harmonic == 0) {
        piTimesHarmonicDivSamplerate = 1 / (this.sampleRate * 2);
      } else {
        piTimesHarmonicDivSamplerate = this.harmonics[harmonic - 1] / (SynthSettings.sampleRate * 2);
      }
      var harmonicVol;
      if (harmonic == 0) {
        harmonicVol = SynthSettings.volMultiplier;
      } else {
        harmonicVol = this.harmonicsVolume[harmonic - 1] * SynthSettings.volMultiplier;
      }
      var lastSampleInner = innerSinMultiplier[harmonic][totSamples] = piTimesHarmonicDivSamplerate * this.hz[0];
      for (var i = 0; i < this.lengths.length; i++) {
        var numSamplesInRound = Math.round(SynthSettings.sampleRate * this.lengths[i]); // lengths is in seconds
        var amtVolChangePerStep = this.smoothVol ? (this.volumes[i + 1] - this.volumes[i]) / (numSamplesInRound) : 0;
        var amtHzChangePerStep = this.smoothNote ? (this.hz[i + 1] - this.hz[i]) / (numSamplesInRound) : 0;
        for (var j = 0; j < numSamplesInRound; j++) {
          var currentHZ = (this.hz[i] + amtHzChangePerStep * j);
          // volume should be modified based on hz, since lower hz=less energy. starting point will be 440HZ
          var volumeMultiplier = 440 / currentHZ;
          lastSampleInner = innerSinMultiplier[harmonic][j + totSamples + 1] = lastSampleInner + piTimesHarmonicDivSamplerate * currentHZ;
          outerSinMultiplier[harmonic][j + totSamples] = harmonicVol * volumeMultiplier * (this.volumes[i] + (amtVolChangePerStep * j));
        }
        totSamples += numSamplesInRound;
      }
    }
    var waveForm = new Int16Array(innerSinMultiplier[0].length).fill(0); // yes, it's an array
    for (var i = 0; i < innerSinMultiplier[0].length; i++) {
      for (var j = 0; j < innerSinMultiplier.length; j++) {
        waveForm[i] += outerSinMultiplier[j][i] * this.funcTable[(innerSinMultiplier[j][i] - (innerSinMultiplier[j][i] << 0)) * 8192 << 0];
      }
    }
    return waveForm;
    // END level 5 synth
  }
}

export default SynthibleBuilder