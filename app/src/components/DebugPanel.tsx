import { buildTrackingDebugRows } from "../debug/trackingDebug";
import type { GameState } from "../game/gameMachine";
import { watcherRituals } from "../game/rituals";
import type { TrackingSample } from "../game/types";

type DebugPanelProps = {
  gameState: GameState;
  sample: TrackingSample;
  threat: number;
  trackerStatus: string;
};

export function DebugPanel({ gameState, sample, threat, trackerStatus }: DebugPanelProps) {
  const ritual = watcherRituals[gameState.currentRitualIndex];
  const rows = buildTrackingDebugRows(sample);

  return (
    <aside className="debug-panel" aria-label="Tracking debug panel">
      <div className="debug-panel-header">
        <span>Tracking</span>
        <span>{gameState.phase}</span>
      </div>
      <dl>
        {rows.map((row) => (
          <div key={row.label}>
            <dt>{row.label}</dt>
            <dd>{row.value}</dd>
          </div>
        ))}
        <div>
          <dt>Threat</dt>
          <dd>{Math.round(threat * 100)}%</dd>
        </div>
        <div>
          <dt>Rule</dt>
          <dd>{ritual?.kind ?? "none"}</dd>
        </div>
        <div>
          <dt>Limit</dt>
          <dd>{ritual ? `${Math.round(ritual.threshold * 100)}%` : "n/a"}</dd>
        </div>
      </dl>
      <p>{trackerStatus}</p>
    </aside>
  );
}
