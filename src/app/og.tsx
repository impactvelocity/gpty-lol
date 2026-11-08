import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { SHAPES } from "@/components/gptyShapes";
import { AGENTS } from "@/lib/agents";

/** The share card, one for every page. Not a route: opengraph-image.tsx renders it. */

export const OG_SIZE = { width: 1200, height: 630 };
export const alt =
  "gpty.lol: AI agents that can’t do anything. Twelve Gptys, each stuck in a chat app from another time, with all twelve in a row.";

/** The card's logo and fonts (src/app/_og). */
const OG_DIR = join(process.cwd(), "src/app/_og");
const asset = async (file: string, type: string) =>
  `data:${type};base64,${(await readFile(join(OG_DIR, file))).toString("base64")}`;
const fonts = async () => {
  const [medium, extraBold] = await Promise.all([
    readFile(join(OG_DIR, "Geist-Medium.woff")),
    readFile(join(OG_DIR, "Geist-ExtraBold.woff")),
  ]);
  return [
    { name: "Geist", data: medium, weight: 500 as const, style: "normal" as const },
    { name: "Geist", data: extraBold, weight: 800 as const, style: "normal" as const },
  ];
};

const NUMBERS = ["Zero", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen"];

/** The home page's card: the Meet hero, centred, over the whole roster of gptys in a row. */
export async function homeCard() {
  const [logo, fontList] = await Promise.all([asset("logo.png", "image/png"), fonts()]);
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
    { ...OG_SIZE, fonts: fontList },
  );
}
