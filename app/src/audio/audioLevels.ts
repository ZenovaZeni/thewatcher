export type TensionAudioLevels = {
  primaryFrequency: number;
  secondaryFrequency: number;
  primaryGain: number;
  secondaryGain: number;
};

function clamp(value: number, min = 0, max = 1) {
  return Math.min(max, Math.max(min, value));
}

export function getTensionAudioLevels(threat: number, failed: boolean): TensionAudioLevels {
  if (failed) {
    return {
      primaryFrequency: 74,
      secondaryFrequency: 210,
      primaryGain: 0.035,
      secondaryGain: 0.014,
    };
  }

  const pressure = clamp(threat);

  return {
    primaryFrequency: 52 + pressure * 42,
    secondaryFrequency: 168 + pressure * 76,
    primaryGain: 0.009 + pressure * 0.028,
    secondaryGain: 0.003 + pressure * 0.016,
  };
}
