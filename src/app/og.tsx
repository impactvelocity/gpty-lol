import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { SHAPES } from "@/components/gptyShapes";
import { AGENTS } from "@/lib/agents";
import { SAMPLE_QUESTION, type Costume } from "@/lib/costumes";

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

/** The home card's logo and fonts (src/app/_og). */
const OG_DIR = join(process.cwd(), "src/app/_og");
const asset = async (file: string, type: string) =>
  `data:${type};base64,${(await readFile(join(OG_DIR, file))).toString("base64")}`;

const NUMBERS = ["Zero", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen"];

/** The home page's card: the Meet hero, centred, over the whole roster of gptys in a row. */
export async function homeCard() {
  const [logo, medium, extraBold] = await Promise.all([
    asset("logo.png", "image/png"),
    readFile(join(OG_DIR, "Geist-Medium.woff")),
    readFile(join(OG_DIR, "Geist-ExtraBold.woff")),
  ]);
  const roster = AGENTS.filter((a) => !a.hidden);
  const count = roster.length;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
          overflow: "hidden",
          backgroundColor: "#f4effc",
          backgroundImage: "linear-gradient(180deg, #e9e0fb 0%, #f4effd 48%, #fbf0f5 100%)",
          fontFamily: "Geist",
          color: "#15131f",
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element -- rendered by ImageResponse, not the browser */}
        <img src={logo} alt="" width={80} height={32} />
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            marginTop: 18,
            fontSize: 74,
            fontWeight: 800,
            letterSpacing: -3.2,
            lineHeight: 0.98,
          }}
        >
          <span>AI agents that</span>
          <span>can’t do anything</span>
        </div>
        <div style={{ display: "flex", marginTop: 18, fontSize: 25, fontWeight: 500, color: "#5b5870" }}>
          {`${NUMBERS[count] ?? count} Gptys, each stuck in a chat app from another time`}
        </div>

        {/* Every gpty, in two rows of six, as on the Meet page */}
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "center",
            alignItems: "flex-end",
            columnGap: 18,
            rowGap: 14,
            width: 6 * 64 + 5 * 18,
            marginTop: 40,
          }}
        >
          {roster.map((a, i) => {
            const shape = SHAPES[a.look.shape];
            const size = 64;
            return (
              <svg
                key={a.id}
                viewBox="0 0 48 48"
                width={size}
                height={size}
                style={{ marginBottom: i % 2 ? 8 : 0, overflow: "visible" }}
              >
                <path d={shape.d} fill={a.look.color} />
                <ellipse cx="19" cy={shape.eyes} rx="2.7" ry="3.7" fill={a.look.eyes ?? "#ffffff"} />
                <ellipse cx="29" cy={shape.eyes} rx="2.7" ry="3.7" fill={a.look.eyes ?? "#ffffff"} />
              </svg>
            );
          })}
        </div>
      </div>
    ),
    {
      ...OG_SIZE,
      fonts: [
        { name: "Geist", data: medium, weight: 500, style: "normal" },
        { name: "Geist", data: extraBold, weight: 800, style: "normal" },
      ],
    },
  );
}
