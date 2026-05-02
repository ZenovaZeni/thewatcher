import { useEffect, useRef } from "react";

type AudioWindow = Window &
  typeof globalThis & {
    webkitAudioContext?: typeof AudioContext;
  };

export function useTensionAudio(active: boolean, threat: number, failed: boolean) {
  const audioRef = useRef<AudioContext | null>(null);
  const oscillatorRef = useRef<OscillatorNode | null>(null);
  const gainRef = useRef<GainNode | null>(null);
  const failedRef = useRef(false);

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

    if (failed && !failedRef.current) {
      const stinger = audio.createOscillator();
      const stingerGain = audio.createGain();
      const noiseBuffer = audio.createBuffer(1, Math.floor(audio.sampleRate * 0.18), audio.sampleRate);
      const noiseData = noiseBuffer.getChannelData(0);
      const noise = audio.createBufferSource();
      const noiseGain = audio.createGain();

      for (let index = 0; index < noiseData.length; index += 1) {
        noiseData[index] = (Math.random() * 2 - 1) * (1 - index / noiseData.length);
      }

      stinger.type = "sawtooth";
      stinger.frequency.setValueAtTime(180, now);
      stinger.frequency.exponentialRampToValueAtTime(41, now + 0.32);
      stingerGain.gain.setValueAtTime(0.0001, now);
      stingerGain.gain.exponentialRampToValueAtTime(0.12, now + 0.025);
      stingerGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.36);

      noise.buffer = noiseBuffer;
      noiseGain.gain.setValueAtTime(0.0001, now);
      noiseGain.gain.exponentialRampToValueAtTime(0.075, now + 0.02);
      noiseGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.18);

      stinger.connect(stingerGain);
      stingerGain.connect(audio.destination);
      noise.connect(noiseGain);
      noiseGain.connect(audio.destination);
      stinger.start(now);
      stinger.stop(now + 0.38);
      noise.start(now);
      noise.stop(now + 0.2);
    }

    failedRef.current = failed;
  }, [failed, threat]);
}
