import Container from "./Container";
export default function HeroContainerStack() {
  return (
    <div className="relative w-full select-none" style={{ filter: "drop-shadow(0 12px 28px rgba(0,0,0,0.5))" }}>
      {/* Row 3 — back, smallest */}
      <div style={{ display: "flex", gap: "5px", marginBottom: "4px", transform: "scale(0.78) translateY(6px)", transformOrigin: "bottom center", opacity: 0.6 }}>
        <Container width={185} height={78} colorScheme="rust" />
        <Container width={185} height={78} colorScheme="navy" />
        <Container width={185} height={78} colorScheme="teal" />
      </div>
      {/* Row 2 — middle */}
      <div style={{ display: "flex", gap: "5px", marginBottom: "4px", transform: "scale(0.88) translateY(3px)", transformOrigin: "bottom center", opacity: 0.8 }}>
        <Container width={195} height={86} colorScheme="navy" />
        <Container width={195} height={86} colorScheme="steel" />
        <Container width={195} height={86} colorScheme="teal" />
      </div>
      {/* Row 1 — front, largest */}
      <div style={{ display: "flex", gap: "6px" }}>
        <Container width={222} height={98} colorScheme="teal" />
        <Container width={222} height={98} colorScheme="steel" />
        <Container width={222} height={98} colorScheme="navy" />
      </div>
      {/* Ground shadow */}
      <div style={{
        width: "75%", height: "12px", margin: "3px auto 0",
        background: "radial-gradient(ellipse, rgba(0,0,0,0.5) 0%, transparent 70%)",
        filter: "blur(8px)",
      }} />
    </div>
  );
}
