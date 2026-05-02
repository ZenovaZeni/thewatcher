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
      primaryFrequency: 112,
      secondaryFrequency: 176,
      primaryGain: 0.12,
      secondaryGain: 0.04,
    };
  }

  const pressure = clamp(threat);

  return {
    primaryFrequency: 82 + pressure * 46,
    secondaryFrequency: 138 + pressure * 58,
    primaryGain: 0.028 + pressure * 0.07,
    secondaryGain: 0.01 + pressure * 0.028,
  };
}
