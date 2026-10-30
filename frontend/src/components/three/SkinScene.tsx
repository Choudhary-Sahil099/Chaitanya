
export default function SkinScene() {
  return (
    <div
      className="skin-scene"
      role="img"
      aria-label="SkinSight skin lesion visualization"
    >
      <div className="scene-glow scene-glow-one" />
      <div className="scene-glow scene-glow-two" />

      <img
        src="/images/Main.png"
        alt="SkinSight skin lesion visualization"
        className="skin-scene-image"
      />
    </div>
  );
}
