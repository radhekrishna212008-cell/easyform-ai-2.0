// Web Audio Procedural Instrumental Music Generator
// Generates studio-grade multi-layer backing tracks across 7 genres and custom tempos.
// Completely local, zero latency, runs offline on any browser.

export type MusicGenre =
  | "lofi"
  | "bollywood"
  | "pop"
  | "cinematic"
  | "chillhop"
  | "indian_fusion"
  | "synthwave";

export interface GenreDefinition {
  id: MusicGenre;
  nameEn: string;
  nameHi: string;
  defaultBpm: number;
  descriptionEn: string;
  descriptionHi: string;
  scale: number[]; // MIDI note intervals
  baseKeyName: string;
  mood: string;
}

export const MUSIC_GENRES: GenreDefinition[] = [
  {
    id: "lofi",
    nameEn: "Lo-Fi Chill Beats",
    nameHi: "लो-फाई चिल बीट्स",
    defaultBpm: 78,
    descriptionEn: "Dreamy vintage electric piano, mellow sub-bass, and relaxed tape groove.",
    descriptionHi: "विंटेज इलेक्ट्रिक पियानो, सब-बास और रिलैक्स्ड ड्रम बीट।",
    scale: [60, 63, 67, 70, 72, 75], // C minor pentatonic / dorian vibe
    baseKeyName: "C Minor",
    mood: "Relaxed & Mellow",
  },
  {
    id: "bollywood",
    nameEn: "Bollywood Acoustic Melodic",
    nameHi: "बॉलीवुड एकॉस्टिक मेलोडिक",
    defaultBpm: 88,
    descriptionEn: "Warm fingerpicked acoustic chords, melodic lead, and expressive rhythm.",
    descriptionHi: "एकॉस्टिक गिटार कॉर्ड्स, मेलोडी और भावनात्मक रिदम।",
    scale: [60, 62, 64, 67, 69, 72, 74], // C Major pentatonic / natural
    baseKeyName: "C Major",
    mood: "Romantic & Soulful",
  },
  {
    id: "pop",
    nameEn: "Upbeat Pop Anthem",
    nameHi: "अपबीट पॉप एंथम",
    defaultBpm: 120,
    descriptionEn: "Driving four-on-the-floor beat, bright synth chords, and energizing bass.",
    descriptionHi: "पॉप बीट, ब्राइट सिंथ कॉर्ड्स और ऊर्जावान बासलाइन।",
    scale: [65, 67, 69, 70, 72, 74, 76], // F Major
    baseKeyName: "F Major",
    mood: "Energetic & Driving",
  },
  {
    id: "cinematic",
    nameEn: "Cinematic Ambient Piano",
    nameHi: "सिनेमैटिक एम्बिएंट पियानो",
    defaultBpm: 72,
    descriptionEn: "Lush reverberant grand piano, swelling strings, and emotional atmosphere.",
    descriptionHi: "भव्य रिवर्ब पियानो और भावनात्मक स्ट्रिंग्स पैड।",
    scale: [62, 65, 67, 69, 72, 74, 77], // D Minor
    baseKeyName: "D Minor",
    mood: "Emotional & Majestic",
  },
  {
    id: "chillhop",
    nameEn: "Chillhop / Smooth R&B",
    nameHi: "चिलहॉप / आर एंड बी",
    defaultBpm: 84,
    descriptionEn: "Jazzy neo-soul chords, deep 808 bass, and crisp boom-bap groove.",
    descriptionHi: "जैज़ी नियो-सोल कॉर्ड्स, 808 बास और बूम-बैप ग्रूव।",
    scale: [57, 60, 62, 64, 67, 69, 72], // A Minor
    baseKeyName: "A Minor",
    mood: "Smooth & Groovy",
  },
  {
    id: "indian_fusion",
    nameEn: "Indian Classical Fusion",
    nameHi: "इंडियन क्लासिकल फ्यूजन",
    defaultBpm: 90,
    descriptionEn: "Tanpura drone harmonics, meditative flute/sitar motifs, and rhythmic beats.",
    descriptionHi: "तानपुरा ड्रोन, बांसुरी/सितार मेलोडी और तबला/ड्रम रिदम।",
    scale: [60, 61, 64, 65, 67, 68, 71, 72], // Bhairav scale (Sa re Ga ma Pa dha Ni Sa)
    baseKeyName: "C Bhairav",
    mood: "Meditative & Cultural",
  },
  {
    id: "synthwave",
    nameEn: "Synthwave / Retro Dream",
    nameHi: "सिंथवेव / 80s ड्रीम",
    defaultBpm: 110,
    descriptionEn: "Nostalgic 80s analog saw pads, rolling bassline, and electro drums.",
    descriptionHi: "80 के दशक के रेट्रो सिंथ पैड्स और रोलिंग बास।",
    scale: [58, 60, 62, 63, 65, 67, 70], // Bb Major / G Minor
    baseKeyName: "G Minor",
    mood: "Nostalgic & Futuristic",
  },
];

export interface MusicGeneratorOptions {
  genre: MusicGenre;
  bpm?: number;
  durationSeconds: number; // e.g. 30, 60, 90
  includeDrums?: boolean;
  includeBass?: boolean;
  includeChords?: boolean;
  includeMelody?: boolean;
}

function midiToFreq(midi: number): number {
  return 440 * Math.pow(2, (midi - 69) / 12);
}

/**
 * Generates an instrumental music backing track AudioBuffer using Web Audio API synthesis.
 */
export async function generateInstrumentalTrack(
  options: MusicGeneratorOptions
): Promise<AudioBuffer> {
  const genreDef = MUSIC_GENRES.find((g) => g.id === options.genre) || MUSIC_GENRES[0];
  const bpm = options.bpm ?? genreDef.defaultBpm;
  const durationSec = Math.max(15, Math.min(options.durationSeconds, 180));
  const sampleRate = 44100;
  const totalSamples = Math.ceil(durationSec * sampleRate);

  const ctx = new OfflineAudioContext(2, totalSamples, sampleRate);
  const masterGain = ctx.createGain();
  masterGain.gain.value = 0.85;

  // Master compressor to glue the instruments together smoothly
  const masterComp = ctx.createDynamicsCompressor();
  masterComp.threshold.value = -12;
  masterComp.ratio.value = 4;
  masterComp.attack.value = 0.02;
  masterComp.release.value = 0.15;

  masterGain.connect(masterComp);
  masterComp.connect(ctx.destination);

  const beatSec = 60 / bpm;
  const barSec = beatSec * 4;
  const totalBars = Math.floor(durationSec / barSec);

  const includeDrums = options.includeDrums ?? true;
  const includeBass = options.includeBass ?? true;
  const includeChords = options.includeChords ?? true;
  const includeMelody = options.includeMelody ?? true;

  // ----------------------------------------------------
  // DRUM LAYER (Synthesized Kick, Snare, Hi-Hat)
  // ----------------------------------------------------
  if (includeDrums) {
    const drumGain = ctx.createGain();
    drumGain.gain.value = options.genre === "cinematic" ? 0.4 : 0.75;
    drumGain.connect(masterGain);

    for (let bar = 0; bar < totalBars; bar++) {
      const barStart = bar * barSec;

      // 4 beats per bar
      for (let beat = 0; beat < 4; beat++) {
        const beatTime = barStart + beat * beatSec;
        if (beatTime >= durationSec - 0.2) break;

        // Kick Drum pattern
        const isKick =
          options.genre === "pop"
            ? true // 4-on-the-floor
            : beat === 0 || (beat === 2 && bar % 2 === 1) || (beat === 2.5 && options.genre === "chillhop");

        if (isKick) {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = "sine";
          // Pitch sweep 130Hz -> 45Hz
          osc.frequency.setValueAtTime(130, beatTime);
          osc.frequency.exponentialRampToValueAtTime(45, beatTime + 0.12);

          gain.gain.setValueAtTime(0.9, beatTime);
          gain.gain.exponentialRampToValueAtTime(0.001, beatTime + 0.25);

          osc.connect(gain);
          gain.connect(drumGain);
          osc.start(beatTime);
          osc.stop(beatTime + 0.26);
        }

        // Snare / Clap on beats 1 and 3 (0-indexed beats 1 and 3 = musical 2 and 4)
        if (beat === 1 || beat === 3) {
          // Noise burst
          const noiseBuffer = ctx.createBuffer(1, Math.floor(sampleRate * 0.18), sampleRate);
          const noiseData = noiseBuffer.getChannelData(0);
          for (let i = 0; i < noiseData.length; i++) {
            noiseData[i] = (Math.random() * 2 - 1) * Math.exp(-i / (sampleRate * 0.04));
          }
          const noiseSource = ctx.createBufferSource();
          noiseSource.buffer = noiseBuffer;

          const filter = ctx.createBiquadFilter();
          filter.type = "bandpass";
          filter.frequency.value = options.genre === "lofi" ? 1200 : 1800;
          filter.Q.value = 1.2;

          const sGain = ctx.createGain();
          sGain.gain.setValueAtTime(0.65, beatTime);
          sGain.gain.exponentialRampToValueAtTime(0.001, beatTime + 0.18);

          noiseSource.connect(filter);
          filter.connect(sGain);
          sGain.connect(drumGain);
          noiseSource.start(beatTime);
          noiseSource.stop(beatTime + 0.19);
        }

        // Hi-Hat / Shakers (8th or 16th notes)
        const subdivisions = options.genre === "synthwave" || options.genre === "lofi" ? 4 : 2;
        for (let sub = 0; sub < subdivisions; sub++) {
          const hatTime = beatTime + (sub * beatSec) / subdivisions;
          if (hatTime >= durationSec - 0.1) break;

          const hatBuf = ctx.createBuffer(1, Math.floor(sampleRate * 0.05), sampleRate);
          const hatData = hatBuf.getChannelData(0);
          for (let i = 0; i < hatData.length; i++) {
            hatData[i] = (Math.random() * 2 - 1) * Math.exp(-i / (sampleRate * 0.012));
          }
          const hatSource = ctx.createBufferSource();
          hatSource.buffer = hatBuf;

          const hatFilter = ctx.createBiquadFilter();
          hatFilter.type = "highpass";
          hatFilter.frequency.value = 7500;

          const hatGain = ctx.createGain();
          const vel = sub === 0 ? 0.35 : 0.18; // Velocity accent
          hatGain.gain.setValueAtTime(vel, hatTime);
          hatGain.gain.exponentialRampToValueAtTime(0.001, hatTime + 0.045);

          hatSource.connect(hatFilter);
          hatFilter.connect(hatGain);
          hatGain.connect(drumGain);
          hatSource.start(hatTime);
          hatSource.stop(hatTime + 0.05);
        }
      }
    }
  }

  // ----------------------------------------------------
  // HARMONY / CHORD LAYER (Rhodes, Acoustic Plucks, Pads)
  // ----------------------------------------------------
  if (includeChords) {
    const chordGain = ctx.createGain();
    chordGain.gain.value = 0.55;
    chordGain.connect(masterGain);

    const scale = genreDef.scale;
    // Build 4 chord progressions based on the genre scale
    const chordRoots = [
      [scale[0], scale[2], scale[4]],
      [scale[1] ?? scale[0], scale[3] ?? scale[2], scale[5] ?? scale[4]],
      [scale[3] ?? scale[2], scale[5] ?? scale[4], (scale[0] || 60) + 12],
      [scale[2] ?? scale[1], scale[4] ?? scale[3], (scale[1] || 62) + 12],
    ];

    for (let bar = 0; bar < totalBars; bar++) {
      const chord = chordRoots[bar % chordRoots.length];
      const barStart = bar * barSec;

      chord.forEach((note, noteIdx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const pan = ctx.createStereoPanner ? ctx.createStereoPanner() : null;

        // Sound character based on genre
        if (options.genre === "lofi" || options.genre === "chillhop") {
          osc.type = "sine";
        } else if (options.genre === "synthwave" || options.genre === "pop") {
          osc.type = "sawtooth";
        } else {
          osc.type = "triangle";
        }

        osc.frequency.setValueAtTime(midiToFreq(note), barStart);

        // Filter to give warm acoustic/electric tone
        const chordFilter = ctx.createBiquadFilter();
        chordFilter.type = "lowpass";
        chordFilter.frequency.value = options.genre === "synthwave" ? 3200 : 1800;

        // Envelope: soft attack, sustained body, gentle release
        gain.gain.setValueAtTime(0.001, barStart);
        gain.gain.linearRampToValueAtTime(0.18, barStart + 0.08);
        gain.gain.exponentialRampToValueAtTime(0.08, barStart + barSec * 0.75);
        gain.gain.exponentialRampToValueAtTime(0.001, barStart + barSec - 0.05);

        if (pan) {
          pan.pan.value = noteIdx === 0 ? -0.3 : noteIdx === 2 ? 0.3 : 0.0;
          osc.connect(chordFilter);
          chordFilter.connect(gain);
          gain.connect(pan);
          pan.connect(chordGain);
        } else {
          osc.connect(chordFilter);
          chordFilter.connect(gain);
          gain.connect(chordGain);
        }

        osc.start(barStart);
        osc.stop(barStart + barSec);
      });
    }
  }

  // ----------------------------------------------------
  // BASS LAYER (Sub-Bass / Synth Bass)
  // ----------------------------------------------------
  if (includeBass) {
    const bassGain = ctx.createGain();
    bassGain.gain.value = 0.65;
    bassGain.connect(masterGain);

    const scale = genreDef.scale;
    const bassNotes = [scale[0] - 24, (scale[1] ?? scale[0]) - 24, (scale[3] ?? scale[2]) - 24, (scale[2] ?? scale[1]) - 24];

    for (let bar = 0; bar < totalBars; bar++) {
      const root = bassNotes[bar % bassNotes.length];
      const barStart = bar * barSec;

      // Play 2 bass notes per bar
      for (let noteIdx = 0; noteIdx < 2; noteIdx++) {
        const noteTime = barStart + noteIdx * (barSec / 2);
        if (noteTime >= durationSec - 0.2) break;

        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = options.genre === "synthwave" ? "sawtooth" : "triangle";
        osc.frequency.setValueAtTime(midiToFreq(root), noteTime);

        const bassFilter = ctx.createBiquadFilter();
        bassFilter.type = "lowpass";
        bassFilter.frequency.value = 350;

        gain.gain.setValueAtTime(0.001, noteTime);
        gain.gain.linearRampToValueAtTime(0.5, noteTime + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.001, noteTime + barSec * 0.45);

        osc.connect(bassFilter);
        bassFilter.connect(gain);
        gain.connect(bassGain);

        osc.start(noteTime);
        osc.stop(noteTime + barSec * 0.46);
      }
    }
  }

  // ----------------------------------------------------
  // MELODIC MOTIF / LEAD ARPEGGIO
  // ----------------------------------------------------
  if (includeMelody) {
    const melodyGain = ctx.createGain();
    melodyGain.gain.value = 0.42;
    melodyGain.connect(masterGain);

    const scale = genreDef.scale;
    // Pleasant melodic pattern moving through the scale
    const melodyPattern = [0, 2, 4, 3, 1, 3, 2, 0];

    for (let bar = 0; bar < totalBars; bar++) {
      const barStart = bar * barSec;

      melodyPattern.forEach((scaleIdx, step) => {
        const noteTime = barStart + (step * barSec) / melodyPattern.length;
        if (noteTime >= durationSec - 0.2) return;

        const noteMidi = (scale[scaleIdx % scale.length] || 60) + 12; // 1 octave up
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = options.genre === "indian_fusion" ? "sine" : "triangle";
        osc.frequency.setValueAtTime(midiToFreq(noteMidi), noteTime);

        // Indian fusion pitch glide (meend)
        if (options.genre === "indian_fusion" && step % 2 === 1) {
          osc.frequency.exponentialRampToValueAtTime(
            midiToFreq(noteMidi + 2),
            noteTime + 0.12
          );
        }

        const noteFilter = ctx.createBiquadFilter();
        noteFilter.type = "lowpass";
        noteFilter.frequency.value = 2400;

        gain.gain.setValueAtTime(0.001, noteTime);
        gain.gain.linearRampToValueAtTime(0.22, noteTime + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, noteTime + 0.28);

        osc.connect(noteFilter);
        noteFilter.connect(gain);
        gain.connect(melodyGain);

        osc.start(noteTime);
        osc.stop(noteTime + 0.3);
      });
    }
  }

  // Render the offline context into complete stereo AudioBuffer
  const renderedBuffer = await ctx.startRendering();
  return renderedBuffer;
}
