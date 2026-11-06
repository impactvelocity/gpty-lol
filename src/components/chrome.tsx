"use client";

/**
 * Window chrome primitives for each era. Purely decorative: the min/max
 * buttons don't do anything, the close button is decorative too.
 */

export function WinFlag({ className = "h-3.5 w-3.5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" className={className} aria-hidden>
      <path d="M1 3.2 7 2.3V7.5H1Z" fill="#f35325" />
      <path d="M8 2.1 15 1v6.5H8Z" fill="#81bc06" />
      <path d="M1 8.5h6v5.2l-6-.9Z" fill="#05a6f0" />
      <path d="M8 8.5h7V15l-7-1.1Z" fill="#ffba08" />
    </svg>
  );
}

export function IcqFlower({
  className = "h-4 w-4",
  status = "online",
}: {
  className?: string;
  status?: "online" | "offline" | "away" | "logo";
}) {
  const petal =
    status === "offline" ? "#e2231a" : status === "away" ? "#f2b705" : "#4cb848";
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden>
      {Array.from({ length: 8 }).map((_, i) => (
        <ellipse
          key={i}
          cx="16"
          cy="7.2"
          rx="4.3"
          ry="6.4"
          transform={`rotate(${i * 45} 16 16)`}
          fill={status === "logo" && i === 7 ? "#e2231a" : petal}
          stroke="rgba(0,0,0,.35)"
          strokeWidth="0.6"
        />
      ))}
      <circle cx="16" cy="16" r="4.6" fill="#ffd200" stroke="rgba(0,0,0,.35)" strokeWidth=".6" />
    </svg>
  );
}

/** The MSN "buddy" status icon. */
export function MsnBuddy({
  className = "h-4 w-4",
  status = "online",
}: {
  className?: string;
  status?: "online" | "offline" | "busy";
}) {
  const body = status === "offline" ? "#9aa7b8" : status === "busy" ? "#e2483d" : "#4fc22c";
  return (
    <svg viewBox="0 0 20 20" className={className} aria-hidden>
      <circle cx="13" cy="5.5" r="3.4" fill="#2f7fe0" stroke="#174b9a" strokeWidth=".8" />
      <path d="M8 18c.2-4.6 2.1-7.4 5-7.4s4.8 2.8 5 7.4Z" fill="#2f7fe0" stroke="#174b9a" strokeWidth=".8" />
      <circle cx="7" cy="6.5" r="3.6" fill={body} stroke="rgba(0,0,0,.4)" strokeWidth=".8" />
      <path d="M1.5 19c.2-4.9 2.3-7.8 5.5-7.8s5.3 2.9 5.5 7.8Z" fill={body} stroke="rgba(0,0,0,.4)" strokeWidth=".8" />
    </svg>
  );
}

/** Skype presence: green circle with a white tick. */
export function SkypeTick({ className = "h-3.5 w-3.5", away = false }: { className?: string; away?: boolean }) {
  return (
    <svg viewBox="0 0 16 16" className={className} aria-hidden>
      <circle cx="8" cy="8" r="7.2" fill={away ? "#f6b500" : "#5bb52b"} stroke="#fff" strokeWidth="1.2" />
      {away ? (
        <path d="M8 4.5V8l2.4 1.5" stroke="#fff" strokeWidth="1.6" fill="none" strokeLinecap="round" />
      ) : (
        <path d="m4.6 8.2 2.2 2.2 4.6-4.6" stroke="#fff" strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      )}
    </svg>
  );
}

/* ───────── Windows 98 / 2000 classic ───────── */

export function ClassicTitleBar({
  title,
  icon,
  gradient = "from-[#0a246a] to-[#a6caf0]",
}: {
  title: string;
  icon?: React.ReactNode;
  gradient?: string;
}) {
  return (
    <div
      className={`flex h-[22px] shrink-0 items-center gap-1.5 bg-gradient-to-r ${gradient} px-1 text-[12px] font-bold text-white`}
    >
      {icon}
      <span className="flex-1 truncate">{title}</span>
      <span className="flex gap-0.5">
        <ClassicCaption glyph="min" />
        <ClassicCaption glyph="max" />
        <span className="w-0.5" />
        <ClassicCaption glyph="close" />
      </span>
    </div>
  );
}

function ClassicCaption({ glyph }: { glyph: "min" | "max" | "close" }) {
  return (
    <span className="bevel-out grid h-[15px] w-[17px] place-items-center bg-[#d4d0c8] text-black">
      <svg viewBox="0 0 8 7" className="h-[7px] w-[8px]" aria-hidden>
        {glyph === "min" && <rect x="1" y="5" width="5" height="2" fill="#000" />}
        {glyph === "max" && (
          <path d="M0 0h8v7H0Z M1 2v4h6V2Z" fill="#000" fillRule="evenodd" />
        )}
        {glyph === "close" && (
          <path d="M0 0h2l2 2 2-2h2L5 3.5 8 7H6L4 5 2 7H0l3-3.5Z" fill="#000" />
        )}
      </svg>
    </span>
  );
}

export function ClassicMenu({ items }: { items: string[] }) {
  return (
    <div className="flex h-[19px] shrink-0 items-center px-0.5 text-[12px]">
      {items.map((m) => (
        <span key={m} className="px-1.5 hover:bg-[#0a246a] hover:text-white">
          <u>{m[0]}</u>
          {m.slice(1)}
        </span>
      ))}
    </div>
  );
}

/* ───────── Windows XP Luna ───────── */

export function XpTitleBar({ title, icon }: { title: string; icon?: React.ReactNode }) {
  return (
    <div className="xp-title flex h-[30px] shrink-0 items-center gap-1.5 rounded-t-[8px] pl-2 pr-1.5 text-[13px] font-bold text-white">
      {icon}
      <span className="flex-1 truncate [text-shadow:1px_1px_#0f1089]">{title}</span>
      <span className="xp-cap" aria-hidden>
        <svg viewBox="0 0 10 10" className="h-2.5 w-2.5"><rect x="1" y="7" width="6" height="2.4" fill="#fff" /></svg>
      </span>
      <span className="xp-cap" aria-hidden>
        <svg viewBox="0 0 10 10" className="h-2.5 w-2.5"><path d="M0 0h10v10H0Z M1.5 3v5.5h7V3Z" fill="#fff" fillRule="evenodd" /></svg>
      </span>
      <span className="xp-cap xp-close" aria-hidden>
        <svg viewBox="0 0 10 10" className="h-2.5 w-2.5"><path d="m1 1 8 8M9 1 1 9" stroke="#fff" strokeWidth="2" /></svg>
      </span>
    </div>
  );
}

/* ───────── Windows Vista Aero ───────── */

export function AeroTitleBar({ title, icon }: { title: string; icon?: React.ReactNode }) {
  return (
    <div className="flex h-[30px] shrink-0 items-start gap-2 pl-2.5 pt-1.5 text-[12px] text-black">
      {icon}
      <span className="flex-1 truncate [text-shadow:0_0_10px_#fff,0_0_6px_#fff]">{title}</span>
      <span className="flex overflow-hidden rounded-b-[5px] border border-t-0 border-black/50 shadow-[inset_0_1px_rgba(255,255,255,.5)]">
        <span className="aero-cap">
          <svg viewBox="0 0 10 10" className="h-2 w-2.5"><rect x="1" y="6" width="8" height="2.2" fill="#fff" stroke="#333" strokeWidth=".5" /></svg>
        </span>
        <span className="aero-cap border-x border-black/40">
          <svg viewBox="0 0 10 10" className="h-2 w-2.5"><path d="M.5.5h9v9h-9Z M2 3v5h6V3Z" fill="#fff" fillRule="evenodd" stroke="#333" strokeWidth=".5" /></svg>
        </span>
        <span className="aero-cap aero-close w-11">
          <svg viewBox="0 0 10 10" className="h-2.5 w-2.5"><path d="m1.5 1.5 7 7M8.5 1.5l-7 7" stroke="#fff" strokeWidth="2" /></svg>
        </span>
      </span>
    </div>
  );
}

/* ───────── macOS ───────── */

export function TrafficLights({ dim = false }: { dim?: boolean }) {
  const c = dim ? ["#5a5a5a", "#5a5a5a", "#5a5a5a"] : ["#ff5f57", "#febc2e", "#28c840"];
  return (
    <span className="flex gap-2" aria-hidden>
      {c.map((bg, i) => (
        <span
          key={i}
          className="h-3 w-3 rounded-full shadow-[inset_0_0_0_.5px_rgba(0,0,0,.25)]"
          style={{ background: bg }}
        />
      ))}
    </span>
  );
}

/* ───────── Chrome (2015) ───────── */

export function ChromeFrame({
  tab,
  favicon,
  url,
  children,
}: {
  tab: string;
  favicon: React.ReactNode;
  url: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-full w-full flex-col overflow-hidden rounded-[3px] border border-[#8a8f99] bg-[#d6d9de] shadow-[0_18px_60px_rgba(0,0,0,.55)]">
      <div className="relative flex h-[34px] shrink-0 items-end bg-gradient-to-b from-[#3d74d1] to-[#2d5fbb] pl-3">
        <div className="chrome-tab relative z-10 flex h-[27px] w-[220px] items-center gap-2 bg-[#f2f2f2] px-5 text-[12px] text-[#333]">
          {favicon}
          <span className="flex-1 truncate">{tab}</span>
          <span className="text-[#777]">×</span>
        </div>
        <div className="chrome-tab -ml-3 h-[22px] w-[34px] bg-[#7fa2df] opacity-70" />
        <span className="ml-auto flex self-stretch text-white">
          <span className="grid w-10 place-items-center">–</span>
          <span className="grid w-10 place-items-center">▢</span>
          <span className="grid w-11 place-items-center bg-[#c7392b]">✕</span>
        </span>
      </div>
      <div className="flex h-[36px] shrink-0 items-center gap-2 border-b border-[#c6c6c6] bg-[#f2f2f2] px-2 text-[#5f6368]">
        <span className="px-1 text-lg">←</span>
        <span className="px-1 text-lg opacity-40">→</span>
        <span className="px-1 text-base">↻</span>
        <div className="flex h-[26px] flex-1 items-center gap-1.5 rounded-[2px] border border-[#bdbdbd] bg-white px-2 text-[13px]">
          <span className="text-[#0b8043]">🔒</span>
          <span className="text-[#0b8043]">https://</span>
          <span className="truncate text-[#222]">{url}</span>
          <span className="ml-auto text-[#f4b400]">☆</span>
        </div>
        <span className="px-1 text-lg">≡</span>
      </div>
      <div className="min-h-0 flex-1 bg-white">{children}</div>
    </div>
  );
}

export function SkypeLogo({ small = false }: { small?: boolean }) {
  return (
    <span
      className={`inline-grid place-items-center rounded-[40%] bg-gradient-to-b from-[#4fc6f6] to-[#0094d9] font-['Segoe_UI',Tahoma,sans-serif] font-bold italic text-white shadow-[inset_0_1px_rgba(255,255,255,.6)] ${
        small ? "h-6 px-2 text-[13px]" : "h-10 px-4 text-xl"
      }`}
    >
      skype
    </span>
  );
}
