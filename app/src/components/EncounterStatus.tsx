import type { EncounterStatus as EncounterStatusModel } from "../game/encounter";

type EncounterStatusProps = {
  status: EncounterStatusModel;
};

export function EncounterStatus({ status }: EncounterStatusProps) {
  return (
    <aside className="encounter-status" aria-label="Watcher encounter progress">
      <div className="encounter-status-row">
        <span>{status.label}</span>
        <span>{status.progressPercent}%</span>
      </div>
      <div className="encounter-progress" aria-hidden="true">
        <span style={{ width: `${status.progressPercent}%` }} />
      </div>
      <strong>{status.completedLabel}</strong>
      <p className="encounter-objective">{status.objective}</p>
      <p>{status.message}</p>
    </aside>
  );
}
