/**
 * Created by jack on 11/12/15.
 */

class SynthibleFactory {
  constructor(profile) {
    // returns a new Synthible
    this.profile = profile
  }
  synthSound(hertz) {
    return this.profile.apply(hertz)
  }
}

export default SynthibleFactory