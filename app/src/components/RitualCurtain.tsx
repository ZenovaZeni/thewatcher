import type { Ritual } from "../game/types";

type RitualCurtainProps = {
  ritual: Ritual;
  introCountdown: number;
};

export function RitualCurtain({ ritual, introCountdown }: RitualCurtainProps) {
  return (
    <section className="ritual-curtain" aria-live="polite">
      <p className="curtain-kicker">Ritual 01</p>
      <h2>{ritual.title}</h2>
      <p className="curtain-rule">{ritual.instruction}</p>
      <div className="curtain-count">{introCountdown}</div>
      <p className="curtain-warning">
        {ritual.kind === "smile" || ritual.kind === "stop-smiling"
          ? "The phone can read your mouth now."
          : "When the frame turns red, the first mistake counts."}
      </p>
    </section>
  );
}
