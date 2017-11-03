import SoundProfile from './SoundProfile'
import SynthibleBuilder from '../core/SynthibleBuilder'

class AcousticGuitarProfile extends SoundProfile {
  apply(hertz) {
    var synthibleBuilder = new SynthibleBuilder(true, true);
    synthibleBuilder.appendHarmonic(2, .4);
    synthibleBuilder.appendHarmonic(3, .3);
    synthibleBuilder.appendHarmonic(4, .2);
    synthibleBuilder.appendHarmonic(5, .2);
    synthibleBuilder.appendNote(hertz, 2.2, 3);
    synthibleBuilder.appendNote(hertz, 3, 1);
    synthibleBuilder.appendNote(hertz, 0, 0);
    return synthibleBuilder.toWaveForm();
  }
}

export default AcousticGuitarProfile