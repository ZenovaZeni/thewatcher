import { useEffect, useRef } from "react";
import type { WatcherAudioCue } from "./scareCues";

type AudioWindow = Window &
  typeof globalThis & {
    webkitAudioContext?: typeof AudioContext;
  };

function makeNoise(audio: AudioContext, durationSeconds: number) {
  const noiseBuffer = audio.createBuffer(1, Math.floor(audio.sampleRate * durationSeconds), audio.sampleRate);
  const noiseData = noiseBuffer.getChannelData(0);

  for (let index = 0; index < noiseData.length; index += 1) {
    noiseData[index] = (Math.random() * 2 - 1) * (1 - index / noiseData.length);
  }

  const noise = audio.createBufferSource();
  noise.buffer = noiseBuffer;
  return noise;
}

function playImpact(audio: AudioContext, intensity: number) {
  const now = audio.currentTime;
  const stinger = audio.createOscillator();
  const stingerGain = audio.createGain();
  const noise = makeNoise(audio, 0.18);
  const noiseGain = audio.createGain();

  stinger.type = "sawtooth";
  stinger.frequency.setValueAtTime(180, now);
  stinger.frequency.exponentialRampToValueAtTime(41, now + 0.32);
  stingerGain.gain.setValueAtTime(0.0001, now);
  stingerGain.gain.exponentialRampToValueAtTime(0.12 * intensity, now + 0.025);
  stingerGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.36);

  noiseGain.gain.setValueAtTime(0.0001, now);
  noiseGain.gain.exponentialRampToValueAtTime(0.075 * intensity, now + 0.02);
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

function playBreath(audio: AudioContext, intensity: number) {
  const now = audio.currentTime;
  const breath = makeNoise(audio, 0.72);
  const breathFilter = audio.createBiquadFilter();
  const breathGain = audio.createGain();
  const knock = audio.createOscillator();
  const knockGain = audio.createGain();

  breathFilter.type = "lowpass";
  breathFilter.frequency.setValueAtTime(360 + intensity * 180, now);
  breathGain.gain.setValueAtTime(0.0001, now);
  breathGain.gain.exponentialRampToValueAtTime(0.04 * intensity, now + 0.08);
  breathGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.72);

  knock.type = "sine";
  knock.frequency.setValueAtTime(74, now + 0.1);
  knock.frequency.exponentialRampToValueAtTime(39, now + 0.24);
  knockGain.gain.setValueAtTime(0.0001, now + 0.1);
  knockGain.gain.exponentialRampToValueAtTime(0.055 * intensity, now + 0.12);
  knockGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.3);

  breath.connect(breathFilter);
  breathFilter.connect(breathGain);
  breathGain.connect(audio.destination);
  knock.connect(knockGain);
  knockGain.connect(audio.destination);
  breath.start(now);
  breath.stop(now + 0.74);
  knock.start(now + 0.1);
  knock.stop(now + 0.32);
}

function playGlitch(audio: AudioContext, intensity: number) {
  const now = audio.currentTime;
  const glitch = makeNoise(audio, 0.13);
  const filter = audio.createBiquadFilter();
  const gain = audio.createGain();
  const tone = audio.createOscillator();
  const toneGain = audio.createGain();

  filter.type = "bandpass";
  filter.frequency.setValueAtTime(940 + intensity * 840, now);
  filter.Q.setValueAtTime(8, now);
  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.exponentialRampToValueAtTime(0.05 * intensity, now + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.12);

  tone.type = "square";
  tone.frequency.setValueAtTime(118, now);
  tone.frequency.exponentialRampToValueAtTime(402, now + 0.06);
  toneGain.gain.setValueAtTime(0.0001, now);
  toneGain.gain.exponentialRampToValueAtTime(0.028 * intensity, now + 0.01);
  toneGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.1);

  glitch.connect(filter);
  filter.connect(gain);
  gain.connect(audio.destination);
  tone.connect(toneGain);
  toneGain.connect(audio.destination);
  glitch.start(now);
  glitch.stop(now + 0.14);
  tone.start(now);
  tone.stop(now + 0.12);
}

export function useTensionAudio(active: boolean, threat: number, failed: boolean, cue: WatcherAudioCue | null = null) {
  const audioRef = useRef<AudioContext | null>(null);
  const oscillatorRef = useRef<OscillatorNode | null>(null);
  const gainRef = useRef<GainNode | null>(null);
  const cueIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (!active) return;

    const AudioContextClass = window.AudioContext || (window as AudioWindow).webkitAudioContext;
    if (!AudioContextClass) return;
    const audio = audioRef.current ?? new AudioContextClass();
    const oscillator = audio.createOscillator();
    const gain = audio.createGain();

    audioRef.current = audio;
    if (audio.state === "suspended") {
      void audio.resume();
    }
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

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !cue || cue.id === cueIdRef.current) return;

    if (audio.state === "suspended") {
      void audio.resume();
    }

    if (cue.type === "breath") {
      playBreath(audio, cue.intensity);
    } else if (cue.type === "glitch") {
      playGlitch(audio, cue.intensity);
    } else {
      playImpact(audio, cue.intensity);
    }

    cueIdRef.current = cue.id;
  }, [cue]);
}
