import type { Ritual } from "../game/types";

type RitualHudProps = {
  ritual: Ritual;
  secondsRemaining: number;
  threat: number;
};

export function RitualHud({ ritual, secondsRemaining, threat }: RitualHudProps) {
  return (
    <div className="ritual-hud">
      <div>
        <p className="eyebrow">{ritual.title}</p>
        <h2>{ritual.instruction}</h2>
      </div>
      <div className="hud-row">
        <span>{secondsRemaining}s</span>
        <span>Threat {Math.round(threat * 100)}%</span>
      </div>
      <div className="threat-meter" aria-hidden="true">
        <span style={{ width: `${Math.round(threat * 100)}%` }} />
      </div>
    </div>
  );
}
