export function Taotao({ mood = "idle", compact = false }) {
  const assetByMood = {
    idle: "waiting",
    thinking: "listening",
    generating: "waiting",
    awake: "welcome",
    happy: "happy",
    memory: "memory",
  };
  const asset = assetByMood[mood] ?? "welcome";

  return (
    <div className={`taotao ${mood} ${compact ? "compact" : ""}`} aria-label="桃桃">
      <span className="taotao-aura" />
      <img src={`/assets/v2/taotao/${asset}.png`} alt="" draggable="false" />
    </div>
  );
}
