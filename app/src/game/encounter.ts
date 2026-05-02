const watcherMessages = [
  "The phone has found your eyes.",
  "It only moves between frames.",
  "Your face is the lock.",
  "It wants proof you can obey.",
  "It does not like what you became.",
  "Now it changes the rules.",
];

const watcherSuccessMessages = [
  "First stare survived.",
  "It did not move this time.",
  "Your outline held.",
  "It accepted the expression.",
  "The smile left no trace.",
  "The rules obeyed you back.",
];

export type EncounterStatus = {
  label: string;
  objective: string;
  progressPercent: number;
  completedLabel: string;
  message: string;
  successMessage: string;
};

export function getEncounterStatus(currentRitualIndex: number, totalRituals: number, completedRituals = currentRitualIndex): EncounterStatus {
  const safeTotal = Math.max(1, totalRituals);
  const clampedIndex = Math.min(Math.max(0, currentRitualIndex), safeTotal - 1);
  const clampedCompleted = Math.min(Math.max(0, completedRituals), safeTotal);

  return {
    label: `Ritual ${clampedIndex + 1} of ${safeTotal}`,
    objective: `Survive all ${safeTotal} rituals.`,
    progressPercent: Math.round((clampedCompleted / safeTotal) * 100),
    completedLabel: `${clampedCompleted} survived / ${safeTotal} required`,
    message: watcherMessages[clampedIndex] ?? watcherMessages[watcherMessages.length - 1],
    successMessage: watcherSuccessMessages[clampedIndex] ?? watcherSuccessMessages[watcherSuccessMessages.length - 1],
  };
}
