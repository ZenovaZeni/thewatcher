import type { EncounterStatus as EncounterStatusModel } from "../game/encounter";
import type { RunScore } from "../game/runScore";

type EncounterStatusProps = {
  status: EncounterStatusModel;
  runScore: RunScore;
};

export function EncounterStatus({ status, runScore }: EncounterStatusProps) {
  return (
    <aside className="encounter-status" aria-label="Watcher encounter progress">
      <div className="encounter-status-row">
        <span>{status.label}</span>
        <span>{status.progressPercent}%</span>
      </div>
      <div className="encounter-progress" aria-hidden="true">
        <span style={{ width: `${status.progressPercent}%` }} />
      </div>
      <div className="run-score">
        <span>{runScore.streakLabel}</span>
        <span>{runScore.paceLabel}</span>
      </div>
      <strong>{status.completedLabel}</strong>
      <p className="encounter-objective">{status.objective}</p>
      <p>{status.message}</p>
    </aside>
  );
}
