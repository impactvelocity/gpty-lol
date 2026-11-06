import { ImageResponse } from "next/og";
import { COSTUMES, SAMPLE_QUESTION, type Costume } from "@/lib/costumes";

/** Share cards. Not a route: the opengraph-image files render these. */

export const OG_SIZE = { width: 1200, height: 630 };

const BG = "#121214";

/** The card font has no "❯"; everything else is emoji, which renders as Twemoji. */
const glyph = (avatar: string) => avatar.replace("❯", ">");

function glow(accent: string) {
  return `radial-gradient(ellipse 90% 70% at 30% -10%, ${accent}66, ${BG} 70%)`;
}

export function costumeCard(c: Costume) {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 64,
          background: glow(c.accent),
          backgroundColor: BG,
          color: "white",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", gap: 56 }}>
          <div style={{ display: "flex", flexDirection: "column", width: 470 }}>
            <div style={{ fontSize: 110, lineHeight: 1 }}>{glyph(c.avatar)}</div>
            <div style={{ fontSize: 70, fontWeight: 700, marginTop: 24, letterSpacing: -2 }}>{c.name}</div>
            <div style={{ fontSize: 30, color: "rgba(255,255,255,.55)", marginTop: 6 }}>{c.year}</div>
            <div style={{ fontSize: 28, color: "rgba(255,255,255,.8)", marginTop: 22, lineHeight: 1.3 }}>
              {c.tagline}
            </div>
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              flex: 1,
              gap: 18,
              padding: 32,
              borderRadius: 28,
              background: "rgba(255,255,255,.06)",
              border: "1px solid rgba(255,255,255,.12)",
            }}
          >
            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <div
                style={{
                  display: "flex",
                  padding: "14px 22px",
                  borderRadius: 22,
                  background: "rgba(255,255,255,.14)",
                  fontSize: 28,
                }}
              >
                {SAMPLE_QUESTION}
              </div>
            </div>
            <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
              <div style={{ fontSize: 38 }}>{glyph(c.avatar)}</div>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  padding: "16px 22px",
                  borderRadius: 22,
                  background: `${c.accent}33`,
                  border: `1px solid ${c.accent}88`,
                  fontSize: 27,
                  lineHeight: 1.35,
                  whiteSpace: "pre-wrap",
                }}
              >
                <div style={{ fontSize: 20, color: "rgba(255,255,255,.6)", marginBottom: 6 }}>{c.assistant}</div>
                {c.sample}
              </div>
            </div>
          </div>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 26, color: "rgba(255,255,255,.55)" }}>
          <div style={{ display: "flex", color: "white", fontWeight: 600 }}>
            🎭 gpty.lol<span style={{ color: "rgba(255,255,255,.45)", fontWeight: 400 }}>/{c.id}</span>
          </div>
          <div style={{ display: "flex" }}>a chatbot in costume</div>
        </div>
      </div>
    ),
    OG_SIZE,
  );
}

export function homeCard() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: 72,
          background: glow("#fb923c"),
          backgroundColor: BG,
          color: "white",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ fontSize: 96, fontWeight: 700, letterSpacing: -3, display: "flex" }}>
          🎭 gpty<span style={{ color: "rgba(255,255,255,.4)" }}>.lol</span>
        </div>
        <div style={{ fontSize: 38, color: "rgba(255,255,255,.75)", marginTop: 12 }}>
          What if your AI chatbot shipped in 10,000 BC? Or 1993? One chatbot, 13 costumes.
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 14, marginTop: 52 }}>
          {COSTUMES.map((c) => (
            <div
              key={c.id}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "10px 20px",
                borderRadius: 999,
                fontSize: 26,
                background: `${c.accent}2e`,
                border: `1px solid ${c.accent}99`,
              }}
            >
              <span>{glyph(c.avatar)}</span>
              {c.name}
              <span style={{ color: "rgba(255,255,255,.5)" }}>{c.year}</span>
            </div>
          ))}
        </div>
      </div>
    ),
    OG_SIZE,
  );
}
