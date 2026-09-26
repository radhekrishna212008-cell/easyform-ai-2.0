import { useCallback, useEffect, useRef, useState } from "react";
import { createRecognizer, speak as speakRaw, speakBilingual as speakBilingualRaw, stopSpeaking } from "@/lib/voice";

type VoiceResult = {
  isFinal: boolean;
  0: { transcript: string };
};

type VoiceResultEvent = {
  resultIndex: number;
  results: ArrayLike<VoiceResult>;
};

type VoiceErrorEvent = {
  error?: string;
  message?: string;
};

type VoiceRecognizer = {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onstart: (() => void) | null;
  onend: (() => void) | null;
  onerror: ((event: VoiceErrorEvent) => void) | null;
  onresult: ((event: VoiceResultEvent) => void) | null;
  start: () => void;
  stop: () => void;
  abort?: () => void;
};

export function useVoice() {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState<string>("");
  const [interim, setInterim] = useState<string>("");
  const [noSpeechTick, setNoSpeechTick] = useState(0);
  const recogRef = useRef<VoiceRecognizer | null>(null);
  const supported = typeof window !== "undefined" && "speechSynthesis" in window;

  const speak = useCallback((text: string) => {
    speakRaw(text, {
      onStart: () => setIsSpeaking(true),
      onEnd: () => setIsSpeaking(false),
    });
  }, []);

  const speakBilingual = useCallback((en: string, hi: string) => {
    speakBilingualRaw(en, hi, {
      onStart: () => setIsSpeaking(true),
      onEnd: () => setIsSpeaking(false),
    });
  }, []);

  const stop = useCallback(() => {
    stopSpeaking();
    setIsSpeaking(false);
  }, []);

  const finalBufRef = useRef<string>("");
  const interimBufRef = useRef<string>("");
  const silenceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const noInputTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const emittedRef = useRef(false);

  const clearTimers = useCallback(() => {
    if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
    if (noInputTimerRef.current) clearTimeout(noInputTimerRef.current);
    silenceTimerRef.current = null;
    noInputTimerRef.current = null;
  }, []);

  const finishListening = useCallback(() => {
    if (emittedRef.current) return;
    emittedRef.current = true;
    clearTimers();
    setIsListening(false);
    const finalText = (finalBufRef.current || interimBufRef.current).trim();
    finalBufRef.current = "";
    interimBufRef.current = "";
    setInterim("");
    if (finalText) setTranscript(finalText);
    else setNoSpeechTick((n) => n + 1);
  }, [clearTimers]);

  const startListening = useCallback(() => {
    stopSpeaking();
    setIsSpeaking(false);
    const r = (recogRef.current ?? createRecognizer()) as VoiceRecognizer | null;
    if (!r) {
      setIsListening(true);
      setTimeout(() => setIsListening(false), 1500);
      return;
    }
    recogRef.current = r;
    emittedRef.current = false;
    finalBufRef.current = "";
    interimBufRef.current = "";
    clearTimers();
    r.continuous = false;
    r.interimResults = true;
    r.lang = "hi-IN";
    r.onstart = () => {
      setIsListening(true);
      setInterim("");
      noInputTimerRef.current = setTimeout(() => {
        try {
          recogRef.current?.stop();
        } catch {
          finishListening();
        }
      }, 6500);
    };
    r.onend = () => {
      finishListening();
    };
    r.onerror = () => {
      finishListening();
    };
    r.onresult = (e: VoiceResultEvent) => {
      let interimText = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const res = e.results[i];
        if (res.isFinal) {
          finalBufRef.current += res[0].transcript + " ";
        } else {
          interimText += res[0].transcript;
        }
      }
      interimBufRef.current = interimText || interimBufRef.current;
      setInterim(interimText);
      clearTimers();
      silenceTimerRef.current = setTimeout(
        () => {
          try {
            recogRef.current?.stop();
          } catch {
            finishListening();
          }
        },
        finalBufRef.current ? 450 : 1000,
      );
    };
    setInterim("");
    setIsListening(true);
    try {
      r.start();
    } catch {
      try {
        r.stop();
        setTimeout(() => {
          try {
            r.start();
          } catch {
            // Browser rejected the retry start.
          }
        }, 150);
      } catch {
        // Browser rejected stop while restarting.
      }
    }
  }, [clearTimers, finishListening]);

  const stopListening = useCallback(() => {
    try {
      recogRef.current?.stop();
    } catch {
      finishListening();
    }
    setTimeout(finishListening, 450);
  }, [finishListening]);

  useEffect(() => {
    return () => {
      stopSpeaking();
      clearTimers();
      try {
        recogRef.current?.abort?.();
      } catch {
        // Ignore cleanup errors from the browser API.
      }
    };
  }, [clearTimers]);

  return {
    speak,
    speakBilingual,
    stopSpeaking: stop,
    isSpeaking,
    isListening,
    startListening,
    stopListening,
    transcript,
    interim,
    clearTranscript: () => setTranscript(""),
    noSpeechTick,
    supported,
  };
}
