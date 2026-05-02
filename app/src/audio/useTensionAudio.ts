import { useEffect, useRef } from "react";

type AudioWindow = Window &
  typeof globalThis & {
    webkitAudioContext?: typeof AudioContext;
  };

export function useTensionAudio(active: boolean, threat: number, failed: boolean) {
  const audioRef = useRef<AudioContext | null>(null);
  const oscillatorRef = useRef<OscillatorNode | null>(null);
  const gainRef = useRef<GainNode | null>(null);

  useEffect(() => {
    if (!active) return;

    const AudioContextClass = window.AudioContext || (window as AudioWindow).webkitAudioContext;
    if (!AudioContextClass) return;
    const audio = audioRef.current ?? new AudioContextClass();
    const oscillator = audio.createOscillator();
    const gain = audio.createGain();

    audioRef.current = audio;
    oscillator.type = "sine";
    oscillator.frequency.value = 44;
    gain.gain.value = 0.0001;
    oscillator.connect(gain);
    gain.connect(audio.destination);
    oscillator.start();

    oscillatorRef.current = oscillator;
    gainRef.current = gain;

    return () => {
      oscillator.stop();
      oscillator.disconnect();
      gain.disconnect();
      oscillatorRef.current = null;
      gainRef.current = null;
    };
  }, [active]);

  useEffect(() => {
    const audio = audioRef.current;
    const oscillator = oscillatorRef.current;
    const gain = gainRef.current;
    if (!audio || !oscillator || !gain) return;

    const now = audio.currentTime;
    oscillator.frequency.setTargetAtTime(failed ? 92 : 44 + threat * 36, now, 0.08);
    gain.gain.setTargetAtTime(failed ? 0.08 : 0.012 + threat * 0.035, now, 0.12);
  }, [failed, threat]);
}
