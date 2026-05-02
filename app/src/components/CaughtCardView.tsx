import { dataUrlToFile } from "../share/caughtCard";

type CaughtCardViewProps = {
  cardUrl: string;
  caption: string;
  onRetry: () => void;
};

export function CaughtCardView({ cardUrl, caption, onRetry }: CaughtCardViewProps) {
  const share = async () => {
    const file = await dataUrlToFile(cardUrl, "the-watcher-caught.png");

    if (navigator.canShare?.({ files: [file] }) && navigator.share) {
      await navigator.share({
        title: "The Watcher caught me",
        text: caption,
        files: [file],
      });
      return;
    }

    const link = document.createElement("a");
    link.href = cardUrl;
    link.download = "the-watcher-caught.png";
    link.click();
  };

  return (
    <section className="caught-card-view">
      <img src={cardUrl} alt={caption} />
      <div className="caught-actions">
        <div>
          <p className="eyebrow">Caught</p>
          <h2>{caption}</h2>
        </div>
        <div className="button-row">
          <button type="button" onClick={onRetry}>
            Retry
          </button>
          <button type="button" className="secondary-button" onClick={share}>
            Share
          </button>
        </div>
      </div>
    </section>
  );
}
