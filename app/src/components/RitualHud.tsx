import type { Ritual } from "../game/types";

type RitualHudProps = {
  ritual: Ritual;
  activeRitual: Ritual;
  ritualNumber: number;
  totalRituals: number;
  timingStage: "intro" | "active";
  introCountdown: number;
  secondsRemaining: number;
  threat: number;
  violationProgress: number;
};

export function RitualHud({
  ritual,
  activeRitual,
  ritualNumber,
  totalRituals,
  timingStage,
  introCountdown,
  secondsRemaining,
  threat,
  violationProgress,
}: RitualHudProps) {
  const inIntro = timingStage === "intro";

  return (
    <div className={inIntro ? "ritual-hud ritual-hud-intro" : "ritual-hud"}>
      <div>
        <p className="eyebrow">
          Ritual {ritualNumber} of {totalRituals} - {ritual.title}
        </p>
        <h2>{inIntro ? "Get ready." : activeRitual.instruction}</h2>
        {inIntro ? <p>Command drops in {introCountdown}</p> : null}
        {!inIntro && activeRitual.kind === "smile" ? <p>Hold the smile.</p> : null}
        {!inIntro && activeRitual.kind === "stop-smiling" ? <p>Let your face go empty.</p> : null}
      </div>
      <div className="hud-row">
        <span>{inIntro ? "Stand by" : `${secondsRemaining}s command`}</span>
        <span>{inIntro ? "Safe" : `Mistake risk ${Math.round(threat * 100)}%`}</span>
      </div>
      <div className="threat-meter" aria-hidden="true">
        <span style={{ width: `${Math.round(threat * 100)}%` }} />
      </div>
      {!inIntro && violationProgress > 0 ? (
        <div className="violation-meter" aria-hidden="true">
          <span style={{ width: `${Math.round(violationProgress * 100)}%` }} />
        </div>
      ) : null}
    </div>
  );
}
