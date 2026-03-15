import Container from "./Container";
export default function ContainerMarquee() {
  const items = [
    { w: 275, h: 120, scheme: "teal"  },
    { w: 242, h: 106, scheme: "navy"  },
    { w: 258, h: 114, scheme: "steel" },
    { w: 225, h: 98,  scheme: "teal"  },
    { w: 270, h: 118, scheme: "navy"  },
    { w: 242, h: 106, scheme: "rust"  },
    { w: 258, h: 114, scheme: "teal"  },
    { w: 225, h: 98,  scheme: "steel" },
  ];
  const doubled = [...items, ...items];
  return (
    <div style={{
      overflow: "hidden",
      maskImage: "linear-gradient(to right, transparent, black 6%, black 94%, transparent)",
      WebkitMaskImage: "linear-gradient(to right, transparent, black 6%, black 94%, transparent)",
    }}>
      <p style={{ textAlign: "center", fontSize: "0.7rem", fontWeight: 900, letterSpacing: "0.2em", textTransform: "uppercase", color: "rgba(160,233,229,0.4)", marginBottom: "1.25rem" }}>
        Our Fleet · Sailing from Tuticorin
      </p>
      <div style={{ display: "flex", alignItems: "flex-end", gap: "14px", width: "max-content", paddingBottom: "16px", animation: "sxplMarquee 42s linear infinite" }}>
        {doubled.map((c, i) => (
          <div key={i} style={{ flexShrink: 0, transform: `rotate(${i % 5 === 1 ? -1.3 : i % 5 === 3 ? 1.1 : 0}deg)`, filter: "drop-shadow(0 6px 18px rgba(0,0,0,0.45))" }}>
            <Container width={c.w} height={c.h} colorScheme={c.scheme} />
          </div>
        ))}
      </div>
    </div>
  );
}
