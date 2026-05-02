const watcherMessages = [
  "The phone has found your eyes.",
  "It only moves between frames.",
  "Your face is the lock.",
  "It wants proof you can obey.",
  "It does not like what you became.",
  "Now it changes the rules.",
];

export type EncounterStatus = {
  label: string;
  progressPercent: number;
  message: string;
};

export function getEncounterStatus(currentRitualIndex: number, totalRituals: number): EncounterStatus {
  const safeTotal = Math.max(1, totalRituals);
  const clampedIndex = Math.min(Math.max(0, currentRitualIndex), safeTotal - 1);

  return {
    label: `Ritual ${clampedIndex + 1} / ${safeTotal}`,
    progressPercent: Math.round(((clampedIndex + 1) / safeTotal) * 100),
    message: watcherMessages[clampedIndex] ?? watcherMessages[watcherMessages.length - 1],
  };
}
