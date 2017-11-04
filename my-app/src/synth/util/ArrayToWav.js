
import SynthSettings from "../core/SynthSettings";

var convert16BitDataToWav = function(dataArray) {
  return new WavData(dataArray)
}

class WavData {
  constructor(data) {
    this.data = [];        // Array containing audio samples
    this.wav = [];         // Array containing the generated wave file
    this.dataURI = '';     // http://en.wikipedia.org/wiki/Data_URI_scheme
    this.header = {                         // OFFS SIZE NOTES
      chunkId:       new Uint8Array([0x52, 0x49, 0x46, 0x46]), // 0    4    "RIFF" = 0x52494646
      chunkSize:     0,                     // 4    4    36+SubChunk2Size = 4+(8+SubChunk1Size)+(8+SubChunk2Size)
      format:        new Uint8Array([0x57, 0x41, 0x56, 0x45]), // 8    4    "WAVE" = 0x57415645
      subChunk1Id:   new Uint8Array([0x66, 0x6d, 0x74, 0x20]), // 12   4    "fmt " = 0x666d7420
      subChunk1Size: 16,                    // 16   4    16 for PCM
      audioFormat:   1,                     // 20   2    PCM = 1
      numChannels:   1,                     // 22   2    Mono = 1, Stereo = 2...
      sampleRate:    SynthSettings.sampleRate,                  // 24   4    8000, 44100...
      byteRate:      0,                     // 28   4    SampleRate*NumChannels*BitsPerSample/8
      blockAlign:    0,                     // 32   2    NumChannels*BitsPerSample/8
      bitsPerSample: 16,                     // 34   2    8 bits = 8, 16 bits = 16
      subChunk2Id:   new Uint8Array([0x64, 0x61, 0x74, 0x61]), // 36   4    "data" = 0x64617461
      subChunk2Size: 0                      // 40   4    data size = NumSamples*NumChannels*BitsPerSample/8
    }

    if(data instanceof Array) {
      console.log("data is an array.")
    } else {
      console.log("data is not an array.")
    }
    this.Make(data);
  }

  u32ToArray(i) {
    return new Uint8Array([i & 0xFF, (i >> 8) & 0xFF, (i >> 16) & 0xFF, (i >> 24) & 0xFF]);
  }

  u16ToArray(i) {
    return new Uint8Array([i & 0xFF, (i >> 8) & 0xFF]);
  }

  split16bitArray(data) {
    var r   = new Uint8Array(data.length * 2);
    var j   = 0;
    var len = data.length;
    for(var i = 0; i < len; i++) {
      r[j++] = data[i] & 0xFF;
      r[j++] = (data[i] >> 8) & 0xFF;
    }
    return r;
  }

  Make(data) {
    this.data                 = data;
    this.header.blockAlign    = (this.header.numChannels * this.header.bitsPerSample) >> 3;
    this.header.byteRate      = this.header.blockAlign * this.sampleRate;
    this.header.subChunk2Size = this.data.length * (this.header.bitsPerSample >> 3);
    this.header.chunkSize     = 36 + this.header.subChunk2Size;
    var lengthInBytes         = 44;
    lengthInBytes += this.data.length * 2;
    //logmsg("total length in bytes: " + lengthInBytes);
    this.wav = new Uint8Array(lengthInBytes);
    this.wav.set(this.header.chunkId);
    this.wav.set(this.u32ToArray(this.header.chunkSize), 4);
    this.wav.set(this.header.format, 8);
    this.wav.set(this.header.subChunk1Id, 12);
    this.wav.set(this.u32ToArray(this.header.subChunk1Size), 16);
    this.wav.set(this.u16ToArray(this.header.audioFormat), 20);
    this.wav.set(this.u16ToArray(this.header.numChannels), 22);
    this.wav.set(this.u32ToArray(this.header.sampleRate), 24);
    this.wav.set(this.u32ToArray(this.header.byteRate), 28);
    this.wav.set(this.u16ToArray(this.header.blockAlign), 32);
    this.wav.set(this.u16ToArray(this.header.bitsPerSample), 34);
    this.wav.set(this.header.subChunk2Id, 36);
    this.wav.set(this.u32ToArray(this.header.subChunk2Size), 40);
    this.wav.set(this.split16bitArray(this.data), 44);
    var urlCreator = window.URL || window.webkitURL;
    console.log("setting data uri.")
    this.dataURI   = urlCreator.createObjectURL(new Blob([this.wav], {type: "audio/wav"}));
  }
}

export default convert16BitDataToWav