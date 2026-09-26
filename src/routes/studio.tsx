import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell, SarthiAvatar } from "@/components/AppShell";
import {
  Music,
  Mic,
  Volume2,
  VolumeX,
  Play,
  Pause,
  RotateCcw,
  Download,
  Sparkles,
  Sliders,
  FileAudio,
  FileText,
  CheckCircle2,
  ShieldCheck,
  Layers,
  Radio,
  Trash2,
  Copy,
  Plus,
  Wand2,
  AudioWaveform as WaveformIcon,
  Upload,
  Headphones,
  Check,
} from "lucide-react";
import { useState, useRef, useEffect, useMemo } from "react";
import { useLang } from "@/lib/i18n";
import {
  MUSIC_GENRES,
  generateInstrumentalTrack,
  type MusicGenre,
} from "@/lib/audio/music-generator";
import {
  enhanceVocalAudio,
  DEFAULT_ENHANCEMENT_SETTINGS,
  type VocalEnhancementSettings,
} from "@/lib/audio/vocal-enhancer";
import {
  StudioAudioMixer,
  audioBufferToWavBlob,
  downloadAudioBlob,
} from "@/lib/audio/audio-mixer";
import {
  PRESET_LYRICS,
  estimateSyllables,
  formatLyricsText,
  parseLyricsText,
  type SongSection,
} from "@/lib/audio/lyrics-assistant";

export const Route = createFileRoute("/studio")({
  head: () => ({
    meta: [
      { title: "AI Music & Vocal Studio — EasyForm AI 2.0" },
      {
        name: "description",
        content:
          "Write lyrics, generate instrumental music, record or upload your own voice with 100% original voice preservation, enhance clarity, mix, preview, and export high quality WAV/MP3.",
      },
    ],
  }),
  component: StudioPage,
});

function StudioPage() {
  const [lang] = useLang();
  const [activeTab, setActiveTab] = useState<"lyrics" | "music" | "vocal" | "enhance" | "mixer">("mixer");

  // ------------------------------------------------------------------
  // 1. LYRICS WRITER STATE
  // ------------------------------------------------------------------
  const [selectedPresetId, setSelectedPresetId] = useState(PRESET_LYRICS[0].id);
  const [lyricsRaw, setLyricsRaw] = useState(() =>
    formatLyricsText(PRESET_LYRICS[0].sections)
  );
  const [copiedLyrics, setCopiedLyrics] = useState(false);

  const parsedSections = useMemo(() => parseLyricsText(lyricsRaw), [lyricsRaw]);

  const loadPresetLyrics = (id: string) => {
    const p = PRESET_LYRICS.find((item) => item.id === id);
    if (p) {
      setSelectedPresetId(id);
      setLyricsRaw(formatLyricsText(p.sections));
    }
  };

  const copyLyricsToClipboard = () => {
    navigator.clipboard.writeText(lyricsRaw);
    setCopiedLyrics(true);
    setTimeout(() => setCopiedLyrics(false), 2000);
  };

  const addSectionTemplate = (type: "verse" | "chorus" | "bridge" | "outro") => {
    const label = type.toUpperCase();
    const snippet = `\n\n[${label}]\nLine 1 of ${label}...\nLine 2 of ${label}...`;
    setLyricsRaw((prev) => prev + snippet);
  };

  // ------------------------------------------------------------------
  // 2. INSTRUMENTAL MUSIC GENERATOR STATE
  // ------------------------------------------------------------------
  const [selectedGenre, setSelectedGenre] = useState<MusicGenre>("lofi");
  const [musicBpm, setMusicBpm] = useState(78);
  const [musicDuration, setMusicDuration] = useState(30);
  const [isGeneratingMusic, setIsGeneratingMusic] = useState(false);
  const [musicBuffer, setMusicBuffer] = useState<AudioBuffer | null>(null);

  const activeGenreDef = useMemo(
    () => MUSIC_GENRES.find((g) => g.id === selectedGenre) || MUSIC_GENRES[0],
    [selectedGenre]
  );

  const handleSelectGenre = (genreId: MusicGenre) => {
    setSelectedGenre(genreId);
    const def = MUSIC_GENRES.find((g) => g.id === genreId);
    if (def) setMusicBpm(def.defaultBpm);
  };

  const handleGenerateMusic = async () => {
    try {
      setIsGeneratingMusic(true);
      const buffer = await generateInstrumentalTrack({
        genre: selectedGenre,
        bpm: musicBpm,
        durationSeconds: musicDuration,
      });
      setMusicBuffer(buffer);
      mixerRef.current.setMusicBuffer(buffer);
      setActiveTab("mixer");
    } catch (err) {
      console.error("Music generation failed:", err);
    } finally {
      setIsGeneratingMusic(false);
    }
  };

  // ------------------------------------------------------------------
  // 3. VOICE RECORDING & AUDIO UPLOAD (ORIGINAL VOICE KEPT 100%)
  // ------------------------------------------------------------------
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [rawVocalBuffer, setRawVocalBuffer] = useState<AudioBuffer | null>(null);
  const [vocalFileName, setVocalFileName] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordTimerRef = useRef<number | null>(null);

  const startMicrophoneRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: false, // Let our transparent DSP handle it
          autoGainControl: false,
        },
      });
      audioChunksRef.current = [];
      const mr = new MediaRecorder(stream);
      mediaRecorderRef.current = mr;

      mr.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      mr.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: mr.mimeType || "audio/webm" });
        const arrayBuf = await audioBlob.arrayBuffer();
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        const ctx = new AudioCtx();
        const decoded = await ctx.decodeAudioData(arrayBuf);
        setRawVocalBuffer(decoded);
        setEnhancedVocalBuffer(null);
        setVocalFileName("Mic_Recording_Original_Voice.wav");
        mixerRef.current.setVocalBuffer(decoded);
        stream.getTracks().forEach((t) => t.stop());
      };

      mr.start(100);
      setIsRecording(true);
      setRecordingSeconds(0);
      recordTimerRef.current = window.setInterval(() => {
        setRecordingSeconds((s) => s + 1);
      }, 1000);
    } catch (err) {
      alert("Microphone permission required to record your voice.");
    }
  };

  const stopMicrophoneRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (recordTimerRef.current) clearInterval(recordTimerRef.current);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const arrayBuf = await file.arrayBuffer();
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioCtx();
      const decoded = await ctx.decodeAudioData(arrayBuf);
      setRawVocalBuffer(decoded);
      setEnhancedVocalBuffer(null);
      setVocalFileName(file.name);
      mixerRef.current.setVocalBuffer(decoded);
    } catch (err) {
      alert("Could not decode audio file. Please try a WAV or MP3 file.");
    }
  };

  // ------------------------------------------------------------------
  // 4. VOCAL ENHANCER (NOISE REMOVAL, CLARITY EQ, NORMALIZER, REVERB)
  // ------------------------------------------------------------------
  const [enhanceSettings, setEnhanceSettings] = useState<VocalEnhancementSettings>(DEFAULT_ENHANCEMENT_SETTINGS);
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [enhancedVocalBuffer, setEnhancedVocalBuffer] = useState<AudioBuffer | null>(null);
  const [compareAB, setCompareAB] = useState<"enhanced" | "raw">("enhanced");

  const handleApplyEnhancement = async () => {
    if (!rawVocalBuffer) return;
    try {
      setIsEnhancing(true);
      const enhanced = await enhanceVocalAudio(rawVocalBuffer, enhanceSettings);
      setEnhancedVocalBuffer(enhanced);
      mixerRef.current.setVocalBuffer(enhanced);
      setCompareAB("enhanced");
    } catch (err) {
      console.error("Vocal enhancement failed:", err);
    } finally {
      setIsEnhancing(false);
    }
  };

  const toggleCompareAB = () => {
    if (!rawVocalBuffer) return;
    const next = compareAB === "enhanced" ? "raw" : "enhanced";
    setCompareAB(next);
    mixerRef.current.setVocalBuffer(next === "enhanced" && enhancedVocalBuffer ? enhancedVocalBuffer : rawVocalBuffer);
  };

  // ------------------------------------------------------------------
  // 5. STUDIO MIXER, REAL-TIME VISUALIZER & EXPORTER
  // ------------------------------------------------------------------
  const mixerRef = useRef<StudioAudioMixer>(new StudioAudioMixer());
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [vocalVolume, setVocalVolume] = useState(1.0);
  const [musicVolume, setMusicVolume] = useState(0.85);
  const [masterVolume, setMasterVolume] = useState(0.9);
  const [vocalPan, setVocalPan] = useState(0.0);
  const [isExporting, setIsExporting] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Sync mixer end of playback
  useEffect(() => {
    mixerRef.current.onPlaybackEnd(() => {
      setIsPlaying(false);
      setCurrentTime(0);
    });
  }, []);

  // Update volumes in mixer
  useEffect(() => {
    mixerRef.current.setVolumes(vocalVolume, musicVolume, masterVolume);
  }, [vocalVolume, musicVolume, masterVolume]);

  useEffect(() => {
    mixerRef.current.setVocalPan(vocalPan);
  }, [vocalPan]);

  // Animation frame for timeline scrubber & frequency spectrum visualizer
  useEffect(() => {
    let animId: number;

    const renderLoop = () => {
      if (mixerRef.current.getIsPlaying()) {
        setCurrentTime(mixerRef.current.getCurrentTime());
      }

      // Visualizer draw
      const canvas = canvasRef.current;
      const analyser = mixerRef.current.getAnalyser();
      if (canvas && analyser) {
        const ctx = canvas.getContext("2d");
        if (ctx) {
          const bufferLength = analyser.frequencyBinCount;
          const dataArray = new Uint8Array(bufferLength);
          analyser.getByteFrequencyData(dataArray);

          const width = canvas.width;
          const height = canvas.height;
          ctx.clearRect(0, 0, width, height);

          const barCount = 48;
          const barWidth = (width / barCount) - 1.5;
          const step = Math.floor(bufferLength / barCount);

          for (let i = 0; i < barCount; i++) {
            const val = dataArray[i * step] || 0;
            const percent = val / 255;
            const barHeight = Math.max(3, percent * height * 0.95);
            const x = i * (barWidth + 1.5);
            const y = height - barHeight;

            // Gradient fill based on amplitude
            const grad = ctx.createLinearGradient(0, height, 0, 0);
            grad.addColorStop(0, "rgba(99, 102, 241, 0.4)");
            grad.addColorStop(0.6, "rgba(168, 85, 247, 0.8)");
            grad.addColorStop(1, "rgba(236, 72, 153, 1)");

            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.roundRect(x, y, barWidth, barHeight, 3);
            ctx.fill();
          }
        }
      }

      animId = requestAnimationFrame(renderLoop);
    };

    animId = requestAnimationFrame(renderLoop);
    return () => cancelAnimationFrame(animId);
  }, []);

  const totalDuration = mixerRef.current.getDuration();

  const handlePlayPause = () => {
    if (isPlaying) {
      mixerRef.current.pause();
      setIsPlaying(false);
    } else {
      mixerRef.current.play(currentTime);
      setIsPlaying(true);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setCurrentTime(val);
    mixerRef.current.seek(val);
  };

  const handleRestart = () => {
    mixerRef.current.seek(0);
    setCurrentTime(0);
    if (!isPlaying) {
      mixerRef.current.play(0);
      setIsPlaying(true);
    }
  };

  // Export full mix as 16-bit stereo WAV
  const handleExportMixWav = async () => {
    try {
      setIsExporting(true);
      const mixedBuffer = await mixerRef.current.renderMixBuffer();
      const wavBlob = audioBufferToWavBlob(mixedBuffer);
      downloadAudioBlob(wavBlob, `EasyForm_Studio_Mix_${selectedGenre}_${Date.now()}.wav`);
    } catch (err) {
      alert("Failed to export audio mix. Please make sure audio is loaded.");
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportVocalOnly = async () => {
    const vBuf = enhancedVocalBuffer || rawVocalBuffer;
    if (!vBuf) {
      alert("No vocal track loaded.");
      return;
    }
    const wavBlob = audioBufferToWavBlob(vBuf);
    downloadAudioBlob(wavBlob, `Enhanced_Vocal_Original_Voice_${Date.now()}.wav`);
  };

  const handleExportMusicOnly = async () => {
    if (!musicBuffer) {
      alert("No instrumental music generated yet.");
      return;
    }
    const wavBlob = audioBufferToWavBlob(musicBuffer);
    downloadAudioBlob(wavBlob, `Instrumental_${selectedGenre}_${Date.now()}.wav`);
  };

  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  return (
    <AppShell title={lang === "hi" ? "म्यूजिक व वोकल स्टूडियो" : "Music & Vocal Studio"} back="/">
      <div className="space-y-6 animate-fade-in">
        {/* Studio Hero Banner */}
        <div className="rounded-3xl glass p-5 shadow-card border border-border/60 flex items-start gap-4">
          <div className="grid h-12 w-12 place-items-center rounded-2xl gradient-hero text-primary-foreground shadow-glow shrink-0">
            <Headphones className="h-6 w-6" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-[10px] font-bold text-primary uppercase tracking-wider">
                Studio Suite 2.0
              </span>
              <span className="rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                <ShieldCheck className="h-3 w-3" />
                Original Voice Preserved
              </span>
            </div>
            <h1 className="text-lg font-bold text-foreground mt-1">
              AI Music & Vocal Studio
            </h1>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Write lyrics, generate multi-genre instrumental backing tracks, record or upload your own voice (100% original speaker identity kept intact), enhance clarity & EQ, mix, preview, and export high quality audio.
            </p>
          </div>
        </div>

        {/* 5-Tab Navigation Bar */}
        <div className="grid grid-cols-5 gap-1.5 p-1 rounded-2xl glass border border-border/60">
          <button
            type="button"
            onClick={() => setActiveTab("lyrics")}
            className={`flex flex-col items-center justify-center py-2 px-1 rounded-xl text-[11px] font-semibold transition-all ${
              activeTab === "lyrics"
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
            }`}
          >
            <FileText className="h-4 w-4 mb-0.5" />
            <span>Lyrics</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("music")}
            className={`flex flex-col items-center justify-center py-2 px-1 rounded-xl text-[11px] font-semibold transition-all ${
              activeTab === "music"
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
            }`}
          >
            <Music className="h-4 w-4 mb-0.5" />
            <span>Music</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("vocal")}
            className={`flex flex-col items-center justify-center py-2 px-1 rounded-xl text-[11px] font-semibold transition-all ${
              activeTab === "vocal"
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
            }`}
          >
            <Mic className="h-4 w-4 mb-0.5" />
            <span>Voice</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("enhance")}
            className={`flex flex-col items-center justify-center py-2 px-1 rounded-xl text-[11px] font-semibold transition-all ${
              activeTab === "enhance"
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
            }`}
          >
            <Sliders className="h-4 w-4 mb-0.5" />
            <span>Enhance</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("mixer")}
            className={`flex flex-col items-center justify-center py-2 px-1 rounded-xl text-[11px] font-semibold transition-all ${
              activeTab === "mixer"
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
            }`}
          >
            <Layers className="h-4 w-4 mb-0.5" />
            <span>Mixer</span>
          </button>
        </div>

        {/* ========================================================== */}
        {/* TAB 1: LYRICS WRITER & SONGWRITING ASSISTANT */}
        {/* ========================================================== */}
        {activeTab === "lyrics" && (
          <div className="space-y-4 animate-fade-in">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <div>
                <h2 className="text-sm font-bold text-foreground">Song Lyrics Writer</h2>
                <p className="text-[11px] text-muted-foreground">
                  Draft sectional lyrics, choose song themes, or align syllable meter.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={copyLyricsToClipboard}
                  className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full border border-border bg-card hover:bg-muted transition-colors shadow-xs"
                >
                  {copiedLyrics ? <Check className="h-3.5 w-3.5 text-success" /> : <Copy className="h-3.5 w-3.5" />}
                  <span>{copiedLyrics ? "Copied" : "Copy"}</span>
                </button>
              </div>
            </div>

            {/* Song Theme Presets */}
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
              {PRESET_LYRICS.map((preset) => (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => loadPresetLyrics(preset.id)}
                  className={`text-xs px-3 py-1.5 rounded-full border whitespace-nowrap transition-colors ${
                    selectedPresetId === preset.id
                      ? "border-primary bg-primary/10 text-primary font-bold"
                      : "border-border/70 bg-card text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {preset.title}
                </button>
              ))}
            </div>

            {/* Interactive Lyric Editor */}
            <div className="rounded-2xl glass p-4 border border-border/70 space-y-3">
              <div className="flex items-center justify-between text-xs text-muted-foreground border-b border-border/40 pb-2">
                <span className="font-semibold text-foreground">Lyric Sheet Editor</span>
                <span>{parsedSections.length} sections · {lyricsRaw.split("\n").filter(Boolean).length} lines</span>
              </div>

              <textarea
                value={lyricsRaw}
                onChange={(e) => setLyricsRaw(e.target.value)}
                rows={12}
                className="w-full bg-background/50 rounded-xl p-3 text-xs font-mono text-foreground border border-border/60 focus:border-primary focus:outline-none leading-relaxed resize-y"
                placeholder="Write your lyrics here or use [Verse], [Chorus], [Bridge] tags..."
              />

              {/* Add Section Shortcuts */}
              <div className="flex items-center gap-1.5 flex-wrap pt-1">
                <span className="text-[11px] font-semibold text-muted-foreground mr-1">Add:</span>
                {(["verse", "chorus", "bridge", "outro"] as const).map((sec) => (
                  <button
                    key={sec}
                    type="button"
                    onClick={() => addSectionTemplate(sec)}
                    className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-lg border border-border/60 bg-muted/40 hover:bg-muted transition-colors"
                  >
                    + {sec}
                  </button>
                ))}
              </div>
            </div>

            {/* Syllable Meter Inspector */}
            <div className="rounded-2xl glass p-4 border border-border/60 space-y-2">
              <h3 className="text-xs font-bold text-foreground flex items-center gap-1.5">
                <Wand2 className="h-3.5 w-3.5 text-primary" />
                <span>Line Meter & Syllable Analyzer</span>
              </h3>
              <p className="text-[11px] text-muted-foreground">
                Aim for 8–12 syllables per line to comfortably match standard 4/4 musical bars.
              </p>
              <div className="space-y-1 max-h-48 overflow-y-auto pr-1">
                {lyricsRaw
                  .split("\n")
                  .filter((l) => l.trim() && !l.startsWith("["))
                  .slice(0, 8)
                  .map((line, idx) => {
                    const syl = estimateSyllables(line);
                    return (
                      <div
                        key={idx}
                        className="flex items-center justify-between text-[11px] p-2 rounded-lg bg-card/60 border border-border/40"
                      >
                        <span className="truncate pr-2 text-foreground font-medium">{line}</span>
                        <span className="shrink-0 font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-primary/10 text-primary">
                          {syl} syl
                        </span>
                      </div>
                    );
                  })}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================== */}
        {/* TAB 2: INSTRUMENTAL MUSIC GENERATOR */}
        {/* ========================================================== */}
        {activeTab === "music" && (
          <div className="space-y-4 animate-fade-in">
            <div>
              <h2 className="text-sm font-bold text-foreground">Instrumental Music Generator</h2>
              <p className="text-[11px] text-muted-foreground">
                Generate procedural multi-instrument backing tracks directly in your browser.
              </p>
            </div>

            {/* Genre Selection Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {MUSIC_GENRES.map((genre) => {
                const isSelected = selectedGenre === genre.id;
                return (
                  <button
                    key={genre.id}
                    type="button"
                    onClick={() => handleSelectGenre(genre.id)}
                    className={`text-left p-3.5 rounded-2xl border transition-all ${
                      isSelected
                        ? "border-primary bg-primary/10 shadow-glow"
                        : "border-border/70 glass hover:border-primary/40"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-foreground">
                        {lang === "hi" ? genre.nameHi : genre.nameEn}
                      </span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-muted font-semibold text-muted-foreground">
                        {genre.defaultBpm} BPM
                      </span>
                    </div>
                    <p className="text-[11px] text-muted-foreground mt-1 line-clamp-2">
                      {lang === "hi" ? genre.descriptionHi : genre.descriptionEn}
                    </p>
                    <div className="mt-2 flex items-center gap-2 text-[10px] text-primary font-medium">
                      <span>Scale: {genre.baseKeyName}</span>
                      <span>•</span>
                      <span>{genre.mood}</span>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Generator Settings */}
            <div className="rounded-2xl glass p-4 border border-border/70 space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-foreground">Tempo (BPM):</span>
                  <span className="font-mono font-bold text-primary">{musicBpm} BPM</span>
                </div>
                <input
                  type="range"
                  min="60"
                  max="140"
                  value={musicBpm}
                  onChange={(e) => setMusicBpm(parseInt(e.target.value))}
                  className="w-full accent-primary cursor-pointer"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-foreground">Track Duration:</span>
                  <span className="font-mono font-bold text-primary">{musicDuration}s</span>
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {[15, 30, 60, 90].map((sec) => (
                    <button
                      key={sec}
                      type="button"
                      onClick={() => setMusicDuration(sec)}
                      className={`text-xs py-1.5 rounded-xl border font-semibold transition-colors ${
                        musicDuration === sec
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border bg-card text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {sec}s
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="button"
                onClick={handleGenerateMusic}
                disabled={isGeneratingMusic}
                className="w-full py-3 rounded-2xl gradient-hero text-primary-foreground font-bold text-xs flex items-center justify-center gap-2 shadow-glow hover:opacity-95 transition-opacity disabled:opacity-50"
              >
                {isGeneratingMusic ? (
                  <>
                    <Sparkles className="h-4 w-4 animate-spin" />
                    <span>Synthesizing {activeGenreDef.nameEn} Track…</span>
                  </>
                ) : (
                  <>
                    <Music className="h-4 w-4" />
                    <span>Generate Instrumental Backing Track</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* ========================================================== */}
        {/* TAB 3: RECORD OR UPLOAD OWN VOICE (IDENTITY PRESERVED) */}
        {/* ========================================================== */}
        {activeTab === "vocal" && (
          <div className="space-y-4 animate-fade-in">
            {/* Identity Protection Guarantee Alert */}
            <div className="rounded-2xl border border-emerald-500/40 bg-emerald-500/10 p-4 text-xs space-y-1.5">
              <div className="flex items-center gap-1.5 font-bold text-emerald-700 dark:text-emerald-300">
                <ShieldCheck className="h-4 w-4 shrink-0" />
                <span>Original Voice Identity Guaranteed</span>
              </div>
              <p className="text-emerald-800 dark:text-emerald-200/90 leading-relaxed text-[11px]">
                Your authentic vocal tone, natural pitch, and personal speaker identity are preserved 100%. The studio strictly applies professional cleaning (noise removal, clarity EQ, volume leveling, and natural room reverb) without voice conversion or cloning.
              </p>
            </div>

            {/* Live Microphone Recording */}
            <div className="rounded-2xl glass p-5 border border-border/70 text-center space-y-4">
              <div className="grid h-16 w-16 place-items-center rounded-full mx-auto gradient-primary text-primary-foreground shadow-glow">
                <Mic className={`h-7 w-7 ${isRecording ? "animate-pulse" : ""}`} />
              </div>

              <div>
                <h3 className="text-sm font-bold text-foreground">
                  {isRecording ? "Recording your original voice…" : "Record with Microphone"}
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {isRecording
                    ? `Duration: ${recordingSeconds}s · Sing or speak into your mic`
                    : "Tap to record your vocal track live in studio quality"}
                </p>
              </div>

              <div className="flex items-center justify-center gap-3">
                {!isRecording ? (
                  <button
                    type="button"
                    onClick={startMicrophoneRecording}
                    className="px-6 py-2.5 rounded-full gradient-primary text-primary-foreground font-bold text-xs shadow-glow hover:scale-105 active:scale-95 transition-transform"
                  >
                    Start Recording
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={stopMicrophoneRecording}
                    className="px-6 py-2.5 rounded-full bg-destructive text-destructive-foreground font-bold text-xs shadow-sm hover:opacity-95 transition-opacity"
                  >
                    Stop Recording
                  </button>
                )}
              </div>
            </div>

            {/* Audio File Upload */}
            <div className="rounded-2xl glass p-5 border border-border/70 space-y-3">
              <div className="flex items-center gap-2">
                <Upload className="h-4 w-4 text-primary" />
                <h3 className="text-xs font-bold text-foreground">Or Upload Voice File</h3>
              </div>
              <p className="text-[11px] text-muted-foreground">
                Upload your recorded singing or speech (MP3, WAV, M4A, OGG).
              </p>
              <input
                type="file"
                accept="audio/*"
                onChange={handleFileUpload}
                className="w-full text-xs text-muted-foreground file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-primary file:text-primary-foreground hover:file:opacity-90 cursor-pointer"
              />
            </div>

            {/* Current Loaded Vocal Status */}
            {rawVocalBuffer && (
              <div className="rounded-2xl glass p-4 border border-border/70 flex items-center justify-between">
                <div className="flex items-center gap-2.5 min-w-0">
                  <CheckCircle2 className="h-5 w-5 text-success shrink-0" />
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-foreground truncate">
                      {vocalFileName || "Vocal Track Loaded"}
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      Length: {formatTime(rawVocalBuffer.duration)} · Original Voice Intact
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setActiveTab("enhance")}
                  className="px-3 py-1.5 rounded-xl bg-primary text-primary-foreground text-xs font-semibold shadow-xs hover:opacity-90"
                >
                  Enhance Clarity →
                </button>
              </div>
            )}
          </div>
        )}

        {/* ========================================================== */}
        {/* TAB 4: VOCAL ENHANCER (NOISE, EQ, NORMALIZER, REVERB) */}
        {/* ========================================================== */}
        {activeTab === "enhance" && (
          <div className="space-y-4 animate-fade-in">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-foreground">AI Audio Vocal Enhancer</h2>
                <p className="text-[11px] text-muted-foreground">
                  Polish audio quality while strictly retaining 100% of your voice identity.
                </p>
              </div>

              {enhancedVocalBuffer && (
                <button
                  type="button"
                  onClick={toggleCompareAB}
                  className={`text-xs font-bold px-3 py-1.5 rounded-full border transition-colors ${
                    compareAB === "enhanced"
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-warning bg-warning/10 text-warning"
                  }`}
                >
                  Listening to: {compareAB.toUpperCase()}
                </button>
              )}
            </div>

            {!rawVocalBuffer ? (
              <div className="rounded-2xl glass p-6 text-center border border-border/60 text-xs text-muted-foreground">
                <p>No vocal track recorded or uploaded yet.</p>
                <button
                  type="button"
                  onClick={() => setActiveTab("vocal")}
                  className="mt-3 px-4 py-1.5 rounded-full bg-primary text-primary-foreground font-semibold text-xs"
                >
                  Go to Voice Tab →
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {/* 1. Background Noise Removal */}
                <div className="rounded-2xl glass p-4 border border-border/70 flex items-center justify-between gap-3">
                  <div>
                    <h3 className="text-xs font-bold text-foreground">1. Background Noise Removal</h3>
                    <p className="text-[11px] text-muted-foreground">
                      82Hz high-pass filter cuts desk rumble, wind pops, and high hiss.
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={enhanceSettings.removeNoise}
                    onChange={(e) =>
                      setEnhanceSettings((s) => ({ ...s, removeNoise: e.target.checked }))
                    }
                    className="h-4 w-4 accent-primary cursor-pointer"
                  />
                </div>

                {/* 2. Vocal Clarity & Studio EQ */}
                <div className="rounded-2xl glass p-4 border border-border/70 flex items-center justify-between gap-3">
                  <div>
                    <h3 className="text-xs font-bold text-foreground">2. Vocal Clarity & Presence EQ</h3>
                    <p className="text-[11px] text-muted-foreground">
                      +3.5dB presence boost at 3.4kHz & 10kHz air for crystal clean articulation.
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={enhanceSettings.improveClarity}
                    onChange={(e) =>
                      setEnhanceSettings((s) => ({ ...s, improveClarity: e.target.checked }))
                    }
                    className="h-4 w-4 accent-primary cursor-pointer"
                  />
                </div>

                {/* 3. Volume Normalization */}
                <div className="rounded-2xl glass p-4 border border-border/70 flex items-center justify-between gap-3">
                  <div>
                    <h3 className="text-xs font-bold text-foreground">3. Studio Volume Normalizer</h3>
                    <p className="text-[11px] text-muted-foreground">
                      Smooth dynamic compressor levels loud and quiet passages cleanly.
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={enhanceSettings.normalizeVolume}
                    onChange={(e) =>
                      setEnhanceSettings((s) => ({ ...s, normalizeVolume: e.target.checked }))
                    }
                    className="h-4 w-4 accent-primary cursor-pointer"
                  />
                </div>

                {/* 4. Natural Studio Reverb */}
                <div className="rounded-2xl glass p-4 border border-border/70 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-foreground">4. Natural Studio Reverb:</span>
                    <span className="font-mono text-primary font-bold">
                      {Math.round(enhanceSettings.reverbWet * 100)}%
                    </span>
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    Acoustic room space to make your voice blend naturally with backing music.
                  </p>
                  <input
                    type="range"
                    min="0"
                    max="0.6"
                    step="0.02"
                    value={enhanceSettings.reverbWet}
                    onChange={(e) =>
                      setEnhanceSettings((s) => ({
                        ...s,
                        applyReverb: true,
                        reverbWet: parseFloat(e.target.value),
                      }))
                    }
                    className="w-full accent-primary cursor-pointer"
                  />
                </div>

                {/* Apply Enhancement Action Button */}
                <button
                  type="button"
                  onClick={handleApplyEnhancement}
                  disabled={isEnhancing}
                  className="w-full py-3 rounded-2xl gradient-hero text-primary-foreground font-bold text-xs flex items-center justify-center gap-2 shadow-glow hover:opacity-95 transition-opacity disabled:opacity-50"
                >
                  {isEnhancing ? (
                    <>
                      <Sparkles className="h-4 w-4 animate-spin" />
                      <span>Processing Audio DSP…</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4" />
                      <span>{enhancedVocalBuffer ? "Re-apply Audio Enhancements" : "Apply AI Vocal Enhancement"}</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        )}

        {/* ========================================================== */}
        {/* TAB 5: MULTI-TRACK MIXER, VISUALIZER & EXPORTER */}
        {/* ========================================================== */}
        {activeTab === "mixer" && (
          <div className="space-y-4 animate-fade-in">
            {/* Visualizer Canvas Card */}
            <div className="rounded-3xl glass p-4 border border-border/70 space-y-3 shadow-card">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                  <span className="font-bold text-foreground">Master Studio Visualizer</span>
                </div>
                <span className="font-mono text-[11px] text-muted-foreground">
                  {formatTime(currentTime)} / {formatTime(totalDuration)}
                </span>
              </div>

              {/* Glowing Canvas Visualizer */}
              <div className="h-24 w-full rounded-2xl bg-black/40 overflow-hidden flex items-center justify-center p-2 relative">
                <canvas
                  ref={canvasRef}
                  width={480}
                  height={96}
                  className="w-full h-full object-cover"
                />
                {!isPlaying && currentTime === 0 && (
                  <span className="absolute text-[11px] text-muted-foreground pointer-events-none">
                    {totalDuration > 0 ? "Ready to play" : "Load vocal or generate music to begin"}
                  </span>
                )}
              </div>

              {/* Timeline Scrubber */}
              <div className="space-y-1">
                <input
                  type="range"
                  min="0"
                  max={Math.max(totalDuration, 1)}
                  step="0.1"
                  value={currentTime}
                  onChange={handleSeek}
                  className="w-full accent-primary cursor-pointer"
                />
              </div>

              {/* Transport Controls */}
              <div className="flex items-center justify-center gap-4 pt-1">
                <button
                  type="button"
                  onClick={handleRestart}
                  className="p-2.5 rounded-full border border-border bg-card text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                  title="Restart track"
                >
                  <RotateCcw className="h-4 w-4" />
                </button>

                <button
                  type="button"
                  onClick={handlePlayPause}
                  disabled={totalDuration === 0}
                  className="grid h-12 w-12 place-items-center rounded-full gradient-hero text-primary-foreground shadow-glow hover:scale-105 active:scale-95 transition-transform disabled:opacity-40"
                  title={isPlaying ? "Pause" : "Play"}
                >
                  {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5 ml-0.5" />}
                </button>
              </div>
            </div>

            {/* Dual Track Faders */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Track 1: Vocal Track */}
              <div className="rounded-2xl glass p-4 border border-border/70 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Mic className="h-4 w-4 text-primary" />
                    <span className="font-bold text-xs text-foreground">Vocal Track</span>
                  </div>
                  <span className="font-mono text-[11px] text-muted-foreground font-semibold">
                    {Math.round(vocalVolume * 100)}%
                  </span>
                </div>

                <input
                  type="range"
                  min="0"
                  max="1.5"
                  step="0.05"
                  value={vocalVolume}
                  onChange={(e) => setVocalVolume(parseFloat(e.target.value))}
                  className="w-full accent-primary cursor-pointer"
                />

                <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                  <span>Pan: {vocalPan < 0 ? `L ${Math.abs(Math.round(vocalPan * 100))}` : vocalPan > 0 ? `R ${Math.round(vocalPan * 100)}` : "Center"}</span>
                  <input
                    type="range"
                    min="-1"
                    max="1"
                    step="0.1"
                    value={vocalPan}
                    onChange={(e) => setVocalPan(parseFloat(e.target.value))}
                    className="w-20 accent-primary cursor-pointer"
                  />
                </div>

                <div className="text-[10px] text-muted-foreground">
                  Status: {enhancedVocalBuffer ? "✨ Enhanced (Original Voice)" : rawVocalBuffer ? "🎙️ Raw Original Voice" : "No vocal track"}
                </div>
              </div>

              {/* Track 2: Music Track */}
              <div className="rounded-2xl glass p-4 border border-border/70 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Music className="h-4 w-4 text-primary" />
                    <span className="font-bold text-xs text-foreground">Music Backing</span>
                  </div>
                  <span className="font-mono text-[11px] text-muted-foreground font-semibold">
                    {Math.round(musicVolume * 100)}%
                  </span>
                </div>

                <input
                  type="range"
                  min="0"
                  max="1.5"
                  step="0.05"
                  value={musicVolume}
                  onChange={(e) => setMusicVolume(parseFloat(e.target.value))}
                  className="w-full accent-primary cursor-pointer"
                />

                <div className="text-[10px] text-muted-foreground flex items-center justify-between">
                  <span>Genre: {activeGenreDef.nameEn}</span>
                  <span className="font-mono">{musicBpm} BPM</span>
                </div>

                <div className="text-[10px] text-muted-foreground">
                  Status: {musicBuffer ? `🎵 ${formatTime(musicBuffer.duration)} Backing Track` : "No music generated"}
                </div>
              </div>
            </div>

            {/* Master Volume Slider */}
            <div className="rounded-2xl glass p-4 border border-border/70 flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <Volume2 className="h-4 w-4 text-primary" />
                <span className="text-xs font-bold text-foreground">Master Volume:</span>
              </div>
              <input
                type="range"
                min="0"
                max="1.0"
                step="0.05"
                value={masterVolume}
                onChange={(e) => setMasterVolume(parseFloat(e.target.value))}
                className="flex-1 accent-primary cursor-pointer"
              />
              <span className="font-mono text-xs font-semibold text-primary w-10 text-right">
                {Math.round(masterVolume * 100)}%
              </span>
            </div>

            {/* 3 Studio Export Buttons */}
            <div className="space-y-2 pt-2">
              <button
                type="button"
                onClick={handleExportMixWav}
                disabled={isExporting || totalDuration === 0}
                className="w-full py-3.5 rounded-2xl gradient-hero text-primary-foreground font-bold text-xs flex items-center justify-center gap-2 shadow-glow hover:opacity-95 transition-opacity disabled:opacity-50"
              >
                {isExporting ? (
                  <>
                    <Sparkles className="h-4 w-4 animate-spin" />
                    <span>Rendering 16-bit Master WAV Mix…</span>
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4" />
                    <span>Export Mixed Track (Vocal + Music WAV)</span>
                  </>
                )}
              </button>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={handleExportVocalOnly}
                  disabled={!rawVocalBuffer}
                  className="py-2.5 px-3 rounded-xl border border-border/70 bg-card hover:bg-muted text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors disabled:opacity-40"
                >
                  <Download className="h-3.5 w-3.5 text-primary" />
                  <span>Export Vocal Only</span>
                </button>

                <button
                  type="button"
                  onClick={handleExportMusicOnly}
                  disabled={!musicBuffer}
                  className="py-2.5 px-3 rounded-xl border border-border/70 bg-card hover:bg-muted text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors disabled:opacity-40"
                >
                  <Download className="h-3.5 w-3.5 text-primary" />
                  <span>Export Music Only</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
