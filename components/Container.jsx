export default function Container({ width = 320, height = 140, colorScheme = "teal" }) {
  const schemes = {
    teal:  { body: "#0B7B74", dark: "#064E4A", stripe: "#A0E9E5", text: "#ffffff", sub: "rgba(255,255,255,0.55)" },
    navy:  { body: "#1A365D", dark: "#0D1F3C", stripe: "#4A90C4", text: "#ffffff", sub: "rgba(255,255,255,0.5)"  },
    steel: { body: "#2C5282", dark: "#1A365D", stripe: "#A0E9E5", text: "#ffffff", sub: "rgba(255,255,255,0.5)"  },
    rust:  { body: "#7B341E", dark: "#4A1E0D", stripe: "#F6AD55", text: "#ffffff", sub: "rgba(255,255,255,0.5)"  },
  };
  const s = schemes[colorScheme];
  const W = width, H = height;
  const RAIL = Math.round(H * 0.1);
  const POST = Math.round(W * 0.05);
  const ribCount = 10;
  const ribStep = (W - POST * 2) / ribCount;

  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} fill="none" xmlns="http://www.w3.org/2000/svg" style={{ display: "block" }}>
      <rect x={0} y={0} width={W} height={H} rx="5" fill={s.body} />
      {Array.from({ length: ribCount }).map((_, i) => {
        const x = POST + i * ribStep;
        return (
          <g key={i}>
            <rect x={x} y={RAIL} width={ribStep} height={H - RAIL * 2} fill={i % 2 === 0 ? "rgba(0,0,0,0.07)" : "rgba(255,255,255,0.03)"} />
            <line x1={x} y1={RAIL} x2={x} y2={H - RAIL} stroke="rgba(0,0,0,0.18)" strokeWidth="1.5" />
          </g>
        );
      })}
      <rect x={0} y={0} width={W} height={RAIL} rx="4" fill={s.dark} />
      <rect x={POST} y={RAIL - 3} width={W - POST * 2} height={3} fill={s.stripe} opacity="0.55" />
      <rect x={0} y={H - RAIL} width={W} height={RAIL} rx="4" fill={s.dark} />
      <rect x={POST} y={H - RAIL} width={W - POST * 2} height={3} fill={s.stripe} opacity="0.55" />
      <rect x={0} y={0} width={POST} height={H} rx="4" fill={s.dark} />
      <rect x={W - POST} y={0} width={POST} height={H} rx="4" fill={s.dark} />
      {[[2, 2], [W - POST + 1, 2], [2, H - RAIL + 1], [W - POST + 1, H - RAIL + 1]].map(([cx, cy], i) => (
        <g key={i}>
          <rect x={cx} y={cy} width={POST - 2} height={RAIL - 2} rx="2" fill={s.stripe} opacity="0.65" />
          <ellipse cx={cx + (POST - 2) / 2} cy={cy + (RAIL - 2) / 2} rx={2.5} ry={2.5} fill={s.dark} opacity="0.8" />
        </g>
      ))}
      <line x1={W / 2} y1={RAIL} x2={W / 2} y2={H - RAIL} stroke={s.dark} strokeWidth="2" />
      {[0.28, 0.5, 0.72].map((r, i) => (
        <rect key={i} x={W / 2 - 12} y={H * r - 4} width={24} height={8} rx="2.5" fill={s.dark} opacity="0.7" />
      ))}
      <rect x={POST + 6} y={RAIL + 6} width={W / 2 - POST - 12} height={H - RAIL * 2 - 12} rx="3" fill="rgba(0,0,0,0.18)" />
      <rect x={W / 2 + 6} y={RAIL + 6} width={W / 2 - POST - 12} height={H - RAIL * 2 - 12} rx="3" fill="rgba(0,0,0,0.18)" />
      <text x={W / 4} y={H / 2 - (W > 220 ? 10 : 6)} textAnchor="middle" fill={s.text}
        fontFamily="'Arial Black', Arial, sans-serif" fontWeight="900"
        fontSize={W > 260 ? 13 : W > 180 ? 10 : 7} letterSpacing="2">SUN XPRESS</text>
      <text x={W / 4} y={H / 2 + (W > 220 ? 7 : 5)} textAnchor="middle" fill={s.stripe}
        fontFamily="'Arial Black', Arial, sans-serif" fontWeight="900"
        fontSize={W > 260 ? 13 : W > 180 ? 10 : 7} letterSpacing="2">LINE</text>
      {W > 200 && (
        <text x={W / 4} y={H / 2 + 22} textAnchor="middle" fill={s.sub}
          fontFamily="Arial, sans-serif" fontWeight="600" fontSize="6.5" letterSpacing="1.5">PVT. LTD.</text>
      )}
      <text x={W * 0.75} y={H / 2 + (W > 220 ? 6 : 4)} textAnchor="middle" fill={s.stripe}
        fontFamily="serif" fontWeight="900" fontSize={W > 260 ? 24 : W > 180 ? 18 : 12} opacity="0.9">⚓</text>
      {W > 200 && (
        <text x={W * 0.75} y={H / 2 + 22} textAnchor="middle" fill={s.sub}
          fontFamily="monospace" fontWeight="700" fontSize="6" letterSpacing="1">TUTICORIN</text>
      )}
      {W > 190 && (
        <text x={POST + 8} y={H - RAIL - 4} fill={s.sub} fontFamily="monospace" fontSize="6" fontWeight="600" letterSpacing="0.5">
          SXPL 204 7{Math.floor(100 + (width * 31) % 900)}
        </text>
      )}
      {W > 190 && (
        <>
          <rect x={W - POST - 44} y={H - RAIL - 14} width={36} height={10} rx="2" fill={s.dark} opacity="0.55" />
          <text x={W - POST - 26} y={H - RAIL - 6} textAnchor="middle" fill={s.stripe}
            fontFamily="monospace" fontSize="6" fontWeight="700" letterSpacing="0.5">20FT ISO</text>
        </>
      )}
      <rect x="0.5" y="0.5" width={W - 1} height={H - 1} rx="5" fill="none" stroke={s.dark} strokeWidth="1.5" />
    </svg>
  );
}
