// Studio Multi-Track Mixer & Audio Exporter
// Handles real-time synchronous dual-track playback (Vocal + Music backing track),
// interactive frequency visualization, and 16-bit PCM WAV export.

export interface MixerTrackState {
  vocalBuffer: AudioBuffer | null;
  musicBuffer: AudioBuffer | null;
  vocalVolume: number; // 0.0 to 1.5 (default 1.0)
  musicVolume: number; // 0.0 to 1.5 (default 0.8)
  masterVolume: number; // 0.0 to 1.0 (default 0.9)
  vocalPan: number; // -1.0 to 1.0 (default 0.0)
  loop: boolean;
}

export class StudioAudioMixer {
  private ctx: AudioContext | null = null;
  private vocalSource: AudioBufferSourceNode | null = null;
  private musicSource: AudioBufferSourceNode | null = null;
  private vocalGainNode: GainNode | null = null;
  private musicGainNode: GainNode | null = null;
  private vocalPannerNode: StereoPannerNode | null = null;
  private masterGainNode: GainNode | null = null;
  private analyserNode: AnalyserNode | null = null;

  private state: MixerTrackState = {
    vocalBuffer: null,
    musicBuffer: null,
    vocalVolume: 1.0,
    musicVolume: 0.8,
    masterVolume: 0.9,
    vocalPan: 0.0,
    loop: false,
  };

  private isPlaying: boolean = false;
  private startTime: number = 0;
  private pausedAt: number = 0;
  private onPlaybackEndCallback: (() => void) | null = null;

  constructor() {
    // AudioContext will be initialized on first user gesture
  }

  private initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === "suspended") {
      this.ctx.resume();
    }
  }

  public setVocalBuffer(buffer: AudioBuffer | null) {
    const wasPlaying = this.isPlaying;
    if (wasPlaying) this.pause();
    this.state.vocalBuffer = buffer;
    if (wasPlaying) this.play(this.pausedAt);
  }

  public setMusicBuffer(buffer: AudioBuffer | null) {
    const wasPlaying = this.isPlaying;
    if (wasPlaying) this.pause();
    this.state.musicBuffer = buffer;
    if (wasPlaying) this.play(this.pausedAt);
  }

  public setVolumes(vocal: number, music: number, master: number) {
    this.state.vocalVolume = vocal;
    this.state.musicVolume = music;
    this.state.masterVolume = master;

    if (this.vocalGainNode && this.ctx) {
      this.vocalGainNode.gain.setValueAtTime(vocal, this.ctx.currentTime);
    }
    if (this.musicGainNode && this.ctx) {
      this.musicGainNode.gain.setValueAtTime(music, this.ctx.currentTime);
    }
    if (this.masterGainNode && this.ctx) {
      this.masterGainNode.gain.setValueAtTime(master, this.ctx.currentTime);
    }
  }

  public setVocalPan(pan: number) {
    this.state.vocalPan = pan;
    if (this.vocalPannerNode && this.ctx) {
      this.vocalPannerNode.pan.setValueAtTime(pan, this.ctx.currentTime);
    }
  }

  public setLoop(loop: boolean) {
    this.state.loop = loop;
    if (this.vocalSource) this.vocalSource.loop = loop;
    if (this.musicSource) this.musicSource.loop = loop;
  }

  public getDuration(): number {
    const vDur = this.state.vocalBuffer?.duration || 0;
    const mDur = this.state.musicBuffer?.duration || 0;
    return Math.max(vDur, mDur);
  }

  public getCurrentTime(): number {
    if (!this.isPlaying || !this.ctx) {
      return this.pausedAt;
    }
    const elapsed = this.ctx.currentTime - this.startTime;
    const maxDur = this.getDuration();
    if (maxDur > 0 && elapsed >= maxDur) {
      return maxDur;
    }
    return Math.min(elapsed, maxDur);
  }

  public getAnalyser(): AnalyserNode | null {
    return this.analyserNode;
  }

  public play(offsetSec: number = 0) {
    this.initContext();
    if (!this.ctx) return;
    if (!this.state.vocalBuffer && !this.state.musicBuffer) return;

    // Stop current playing sources
    this.stopSources();

    const maxDur = this.getDuration();
    if (offsetSec >= maxDur) {
      offsetSec = 0;
    }
    this.pausedAt = offsetSec;

    // Build mixer graph
    this.masterGainNode = this.ctx.createGain();
    this.masterGainNode.gain.value = this.state.masterVolume;

    this.analyserNode = this.ctx.createAnalyser();
    this.analyserNode.fftSize = 256;
    this.analyserNode.smoothingTimeConstant = 0.8;

    this.masterGainNode.connect(this.analyserNode);
    this.analyserNode.connect(this.ctx.destination);

    // 1. Vocal Track setup
    if (this.state.vocalBuffer) {
      this.vocalSource = this.ctx.createBufferSource();
      this.vocalSource.buffer = this.state.vocalBuffer;
      this.vocalSource.loop = this.state.loop;

      this.vocalGainNode = this.ctx.createGain();
      this.vocalGainNode.gain.value = this.state.vocalVolume;

      if (this.ctx.createStereoPanner) {
        this.vocalPannerNode = this.ctx.createStereoPanner();
        this.vocalPannerNode.pan.value = this.state.vocalPan;
        this.vocalSource.connect(this.vocalGainNode);
        this.vocalGainNode.connect(this.vocalPannerNode);
        this.vocalPannerNode.connect(this.masterGainNode);
      } else {
        this.vocalSource.connect(this.vocalGainNode);
        this.vocalGainNode.connect(this.masterGainNode);
      }

      if (offsetSec < this.state.vocalBuffer.duration) {
        this.vocalSource.start(0, offsetSec);
      }
    }

    // 2. Music Track setup
    if (this.state.musicBuffer) {
      this.musicSource = this.ctx.createBufferSource();
      this.musicSource.buffer = this.state.musicBuffer;
      this.musicSource.loop = this.state.loop;

      this.musicGainNode = this.ctx.createGain();
      this.musicGainNode.gain.value = this.state.musicVolume;

      this.musicSource.connect(this.musicGainNode);
      this.musicGainNode.connect(this.masterGainNode);

      if (offsetSec < this.state.musicBuffer.duration) {
        this.musicSource.start(0, offsetSec);
      }
    }

    this.startTime = this.ctx.currentTime - offsetSec;
    this.isPlaying = true;

    // Track playback end
    const longestSource =
      (this.state.vocalBuffer?.duration || 0) >= (this.state.musicBuffer?.duration || 0)
        ? this.vocalSource
        : this.musicSource;

    if (longestSource && !this.state.loop) {
      longestSource.onended = () => {
        if (this.isPlaying && this.getCurrentTime() >= this.getDuration() - 0.1) {
          this.isPlaying = false;
          this.pausedAt = 0;
          this.onPlaybackEndCallback?.();
        }
      };
    }
  }

  public pause() {
    if (!this.isPlaying) return;
    this.pausedAt = this.getCurrentTime();
    this.stopSources();
    this.isPlaying = false;
  }

  public stop() {
    this.pausedAt = 0;
    this.stopSources();
    this.isPlaying = false;
  }

  public seek(timeSec: number) {
    const wasPlaying = this.isPlaying;
    this.pause();
    this.pausedAt = Math.max(0, Math.min(timeSec, this.getDuration()));
    if (wasPlaying) {
      this.play(this.pausedAt);
    }
  }

  public getIsPlaying(): boolean {
    return this.isPlaying;
  }

  public onPlaybackEnd(cb: () => void) {
    this.onPlaybackEndCallback = cb;
  }

  private stopSources() {
    try {
      if (this.vocalSource) {
        this.vocalSource.stop();
        this.vocalSource.disconnect();
        this.vocalSource = null;
      }
    } catch {}
    try {
      if (this.musicSource) {
        this.musicSource.stop();
        this.musicSource.disconnect();
        this.musicSource = null;
      }
    } catch {}
  }

  /**
   * Renders the mixed audio buffer offline into a unified stereo AudioBuffer.
   */
  public async renderMixBuffer(customState?: Partial<MixerTrackState>): Promise<AudioBuffer> {
    const vBuf = customState?.vocalBuffer ?? this.state.vocalBuffer;
    const mBuf = customState?.musicBuffer ?? this.state.musicBuffer;
    const vVol = customState?.vocalVolume ?? this.state.vocalVolume;
    const mVol = customState?.musicVolume ?? this.state.musicVolume;
    const vPan = customState?.vocalPan ?? this.state.vocalPan;

    const vDur = vBuf?.duration || 0;
    const mDur = mBuf?.duration || 0;
    const maxDur = Math.max(vDur, mDur, 1);
    const sampleRate = 44100;
    const totalSamples = Math.ceil(maxDur * sampleRate);

    const offlineCtx = new OfflineAudioContext(2, totalSamples, sampleRate);
    const master = offlineCtx.createGain();
    master.gain.value = 0.95;

    // Master limiter compressor to prevent distortion
    const limiter = offlineCtx.createDynamicsCompressor();
    limiter.threshold.value = -1.0;
    limiter.knee.value = 0.0;
    limiter.ratio.value = 20.0;
    limiter.attack.value = 0.001;
    limiter.release.value = 0.05;

    master.connect(limiter);
    limiter.connect(offlineCtx.destination);

    if (vBuf) {
      const vSource = offlineCtx.createBufferSource();
      vSource.buffer = vBuf;
      const vGain = offlineCtx.createGain();
      vGain.gain.value = vVol;

      if (offlineCtx.createStereoPanner) {
        const panner = offlineCtx.createStereoPanner();
        panner.pan.value = vPan;
        vSource.connect(vGain);
        vGain.connect(panner);
        panner.connect(master);
      } else {
        vSource.connect(vGain);
        vGain.connect(master);
      }
      vSource.start(0);
    }

    if (mBuf) {
      const mSource = offlineCtx.createBufferSource();
      mSource.buffer = mBuf;
      const mGain = offlineCtx.createGain();
      mGain.gain.value = mVol;
      mSource.connect(mGain);
      mGain.connect(master);
      mSource.start(0);
    }

    return await offlineCtx.startRendering();
  }
}

/**
 * Encodes an AudioBuffer into an industry-standard 16-bit PCM stereo WAV Blob.
 */
export function audioBufferToWavBlob(buffer: AudioBuffer): Blob {
  const numChannels = buffer.numberOfChannels;
  const sampleRate = buffer.sampleRate;
  const format = 1; // PCM
  const bitDepth = 16;
  const bytesPerSample = bitDepth / 8;
  const blockAlign = numChannels * bytesPerSample;
  const byteRate = sampleRate * blockAlign;
  const dataLength = buffer.length * blockAlign;
  const bufferLength = 44 + dataLength;

  const arrayBuffer = new ArrayBuffer(bufferLength);
  const view = new DataView(arrayBuffer);

  // RIFF header
  writeString(view, 0, "RIFF");
  view.setUint32(4, 36 + dataLength, true);
  writeString(view, 8, "WAVE");

  // fmt subchunk
  writeString(view, 12, "fmt ");
  view.setUint32(16, 16, true); // SubChunk1Size (16 for PCM)
  view.setUint16(20, format, true); // AudioFormat
  view.setUint16(22, numChannels, true); // NumChannels
  view.setUint32(24, sampleRate, true); // SampleRate
  view.setUint32(28, byteRate, true); // ByteRate
  view.setUint16(32, blockAlign, true); // BlockAlign
  view.setUint16(34, bitDepth, true); // BitsPerSample

  // data subchunk
  writeString(view, 36, "data");
  view.setUint32(40, dataLength, true);

  // Write interleaved PCM samples
  const channelData: Float32Array[] = [];
  for (let c = 0; c < numChannels; c++) {
    channelData.push(buffer.getChannelData(c));
  }

  let offset = 44;
  for (let i = 0; i < buffer.length; i++) {
    for (let c = 0; c < numChannels; c++) {
      let sample = channelData[c][i];
      // Hard clamp between -1.0 and 1.0 to prevent wrap-around distortion
      sample = Math.max(-1.0, Math.min(1.0, sample));
      // Convert to 16-bit signed integer (-32768 to 32767)
      const intSample = sample < 0 ? sample * 32768 : sample * 32767;
      view.setInt16(offset, intSample, true);
      offset += 2;
    }
  }

  return new Blob([view], { type: "audio/wav" });
}

function writeString(view: DataView, offset: number, string: string) {
  for (let i = 0; i < string.length; i++) {
    view.setUint8(offset + i, string.charCodeAt(i));
  }
}

/**
 * Triggers a browser file download of the audio blob.
 */
export function downloadAudioBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.style.display = "none";
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, 1000);
}
