"use client";

import Image from "next/image";

const mosaicCards = [
  { bg: "from-[#1e1b4b] to-[#312e81]", emoji: "🎮" },
  { bg: "from-[#14532d] to-[#166534]", emoji: "📚" },
  { bg: "from-[#450a0a] to-[#7f1d1d]", emoji: "🎸" },
  { bg: "from-[#1c1917] to-[#292524]", emoji: "📷" },
  { bg: "from-[#0c4a6e] to-[#075985]", emoji: "👟" },
  { bg: "from-[#4a044e] to-[#701a75]", emoji: "🏆" },
  { bg: "from-[#1e3a5f] to-[#1d4ed8]", emoji: "🎨" },
  { bg: "from-[#14532d] to-[#15803d]", emoji: "💿" },
  { bg: "from-[#431407] to-[#7c2d12]", emoji: "🕹" },
  { bg: "from-[#0f0f1a] to-[#1e1b4b]", emoji: "📼" },
  { bg: "from-[#1f1f1f] to-[#374151]", emoji: "🪆" },
  { bg: "from-[#1a1a2e] to-[#16213e]", emoji: "🃏" },
];

export function AnimatedBackground({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen w-full font-sans">

      {/* LEFT PANEL — desktop only */}
      <div className="relative hidden w-[55%] flex-col justify-end overflow-hidden bg-[#09090f] p-12 lg:flex xl:p-14">
        {/* Radial gradient orbs */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-[20%] top-1/2 h-[500px] w-[500px] -translate-y-1/2 rounded-full bg-indigo-500/20 blur-[100px]" />
          <div className="absolute right-[10%] top-[20%] h-[350px] w-[350px] rounded-full bg-violet-500/14 blur-[80px]" />
          <div className="absolute bottom-[15%] left-[60%] h-[300px] w-[300px] rounded-full bg-blue-500/10 blur-[80px]" />
        </div>

        {/* Mosaic grid */}
        <div
          className="pointer-events-none absolute inset-0 grid opacity-[0.32]"
          style={{
            gridTemplateColumns: "repeat(4, 1fr)",
            gridTemplateRows: "repeat(3, 1fr)",
            gap: "8px",
            padding: "40px",
            transform: "rotate(-3deg) scale(1.08)",
          }}
        >
          {mosaicCards.map((card, i) => (
            <div
              key={i}
              className={`flex items-center justify-center rounded-[10px] border border-white/8 bg-gradient-to-br text-3xl ${card.bg}`}
            >
              {card.emoji}
            </div>
          ))}
        </div>

        {/* Brand copy — bottom */}
        <div className="relative z-10 space-y-6">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl overflow-hidden shadow-[0_8px_24px_rgba(99,102,241,0.4)]">
              <Image src="/icons/icon-192.png" alt="Minhas Coleções" width={44} height={44} className="h-11 w-11 object-cover" />
            </div>
            <span className="font-display text-xl font-bold tracking-tight text-white">
              Minhas Coleções
            </span>
          </div>

          <div>
            <h1 className="font-display text-[2.6rem] font-extrabold leading-[1.12] tracking-tight text-white xl:text-[3rem]">
              Tudo que você<br />
              <span className="text-indigo-400">coleciona</span>, em<br />
              um só lugar.
            </h1>
            <p className="mt-4 max-w-sm text-[15px] leading-[1.7] text-slate-400">
              Catalogue livros, discos, games, calçados, cards ou qualquer coisa que importe para você. Sua coleção, organizada com precisão.
            </p>
          </div>

          <ul className="space-y-3">
            {[
              "Categorias personalizadas para qualquer tipo de item",
              "Fotos, descrições e dados customizados por item",
              "Acesso rápido, busca e filtros para encontrar qualquer coisa",
            ].map((feat) => (
              <li key={feat} className="flex items-center gap-3 text-[13px] text-slate-300/80">
                <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-indigo-400" />
                {feat}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* RIGHT PANEL — form */}
      <div className="relative flex flex-1 items-center justify-center bg-[#0f0f1a] px-6 py-10 sm:px-10">
        {/* Left border gradient line (desktop only) */}
        <div className="pointer-events-none absolute inset-y-0 left-0 hidden w-px bg-gradient-to-b from-transparent via-indigo-500/30 to-transparent lg:block" />

        {/* Mobile background orbs */}
        <div className="pointer-events-none absolute inset-0 lg:hidden">
          <div className="absolute left-0 top-0 h-72 w-72 rounded-full bg-indigo-600/15 blur-[80px]" />
          <div className="absolute bottom-0 right-0 h-64 w-64 rounded-full bg-violet-600/12 blur-[70px]" />
        </div>

        <div className="relative z-10 w-full max-w-md">
          {children}
        </div>
      </div>
    </div>
  );
}
