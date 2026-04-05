import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  Camera,
  Check,
  Gamepad2,
  Heart,
  LayoutGrid,
  Search,
  Shield,
  Sparkles,
  Star,
} from "lucide-react";

const highlights = [
  "Categorias flexíveis para qualquer tipo de coleção",
  "Busca rápida, favoritos e visão organizada dos itens",
  "Fotos, descrições e contexto em uma experiência premium",
];

const statCards = [
  { value: "148", label: "itens mapeados", accent: "text-white" },
  { value: "12", label: "categorias ativas", accent: "text-indigo-300" },
  { value: "23", label: "favoritos em destaque", accent: "text-rose-400" },
  { value: "<1s", label: "para encontrar um item", accent: "text-cyan-300" },
];

const showcaseCards = [
  {
    title: "Games raros",
    description: "Visualize consoles, cartuchos e edições especiais com contexto e fotos.",
    icon: Gamepad2,
    tone: "from-[#1e1b4b] to-[#4c1d95]",
  },
  {
    title: "Livros e HQs",
    description: "Monte prateleiras digitais com volumes, estados e observações.",
    icon: BookOpen,
    tone: "from-[#052e16] to-[#166534]",
  },
  {
    title: "Fotos e memorabilia",
    description: "Guarde registros visuais e detalhes que valorizam cada peça.",
    icon: Camera,
    tone: "from-[#082f49] to-[#075985]",
  },
];

const previewStats = [
  { label: "Itens", value: "148", accent: "text-white" },
  { label: "Categorias", value: "12", accent: "text-indigo-300" },
  { label: "Favoritos", value: "23", accent: "text-rose-400" },
  { label: "Wishlist", value: "17", accent: "text-emerald-400" },
];

const previewFilters = ["Todos", "Games", "Livros", "Cards", "Sneakers"];

const previewItems = [
  {
    emoji: "🎮",
    title: "Gameboy SP",
    meta: "Prata · 2 fotos · ativo",
    chip: "Games",
    gradient: "from-[#1e1b4b] to-[#4c1d95]",
  },
  {
    emoji: "📚",
    title: "Duna 1ª edição",
    meta: "Capa dura · 1 foto · ativo",
    chip: "Livros",
    gradient: "from-[#14532d] to-[#166534]",
  },
  {
    emoji: "👟",
    title: "Jordan 1 OG",
    meta: "Colecionável · 3 fotos · favorito",
    chip: "Sneakers",
    gradient: "from-[#450a0a] to-[#7f1d1d]",
  },
];

export function LandingHome() {
  return (
    <main className="vault-app-shell relative isolate min-h-screen text-white">
      <div className="vault-orb vault-orb-1" />
      <div className="vault-orb vault-orb-2" />
      <div className="vault-orb vault-orb-3" />

      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-7xl flex-col px-5 py-5 sm:px-6 lg:px-8">
        <header className="vault-app-panel sticky top-4 z-20 rounded-[1.75rem] px-4 py-4 backdrop-blur-xl sm:px-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 via-indigo-400 to-violet-500 shadow-[0_14px_32px_rgba(79,70,229,0.35)]">
                <span className="text-xl">📦</span>
              </div>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.26em] text-indigo-200/80">
                  Vault Experience
                </p>
                <h1 className="font-display text-xl font-semibold tracking-[-0.04em] text-white sm:text-2xl">
                  Minhas Coleções
                </h1>
              </div>
            </div>

            <nav className="flex flex-wrap items-center gap-3 text-sm text-slate-300">
              <a href="#beneficios" className="transition hover:text-white">
                Benefícios
              </a>
              <a href="#preview" className="transition hover:text-white">
                Preview
              </a>
              <Link
                href="/auth/login"
                className="rounded-full border border-white/12 bg-white/5 px-4 py-2 font-medium text-slate-100 transition hover:border-indigo-300/40 hover:bg-white/8"
              >
                Entrar
              </Link>
            </nav>
          </div>
        </header>

        <section className="grid flex-1 items-center gap-8 py-8 lg:grid-cols-[1.05fr_0.95fr] lg:py-12">
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 rounded-full border border-indigo-300/20 bg-indigo-400/10 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.24em] text-indigo-100">
              <Sparkles className="h-3.5 w-3.5" />
              Seu acervo com presença de produto
            </div>

            <div className="max-w-2xl">
              <h2 className="font-display text-5xl leading-[0.92] font-semibold tracking-[-0.06em] text-white sm:text-6xl xl:text-7xl">
                Organize tudo o que você <span className="vault-text-gradient">coleciona</span> em uma home que já transmite valor.
              </h2>
              <p className="mt-6 max-w-xl text-base leading-8 text-slate-300 sm:text-lg">
                Uma vitrine pública elegante para apresentar o serviço e uma experiência interna pensada para quem leva coleção a sério.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                href="/auth/login"
                className="vault-button-primary inline-flex min-h-14 items-center justify-center gap-2 rounded-2xl px-6 text-base font-semibold text-white transition hover:-translate-y-0.5"
              >
                Entrar na conta
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/auth/register"
                className="inline-flex min-h-14 items-center justify-center rounded-2xl border border-white/12 bg-white/4 px-6 text-base font-semibold text-slate-100 transition hover:border-indigo-300/40 hover:bg-white/8"
              >
                Criar conta grátis
              </Link>
            </div>

            <div className="grid gap-3 text-sm text-slate-300 sm:grid-cols-3">
              {highlights.map((highlight) => (
                <div
                  key={highlight}
                  className="vault-mosaic-card rounded-[1.5rem] px-4 py-4 leading-6"
                >
                  <div className="mb-3 flex h-8 w-8 items-center justify-center rounded-full bg-indigo-400/14 text-indigo-200">
                    <Check className="h-4 w-4" />
                  </div>
                  {highlight}
                </div>
              ))}
            </div>
          </div>

          <div className="vault-panel relative overflow-hidden rounded-[2rem] p-4 sm:p-5">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(99,102,241,0.22),transparent_30%),radial-gradient(circle_at_bottom_left,rgba(236,72,153,0.14),transparent_24%)]" />
            <div className="relative grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
              <article className="relative min-h-[26rem] overflow-hidden rounded-[1.75rem] border border-indigo-300/18 bg-gradient-to-br from-[#1e1b4b] via-[#312e81] to-[#581c87] p-5 shadow-[0_24px_60px_rgba(15,23,42,0.35)]">
                <div className="flex items-center justify-between text-xs uppercase tracking-[0.18em] text-indigo-100/80">
                  <span className="rounded-full border border-indigo-200/20 bg-white/10 px-3 py-1">
                    Item em destaque
                  </span>
                  <Heart className="h-4 w-4 fill-rose-400 text-rose-400" />
                </div>

                <div className="mt-10 flex justify-center text-[7rem] leading-none">🎮</div>

                <div className="absolute inset-x-5 bottom-5 rounded-[1.5rem] border border-white/10 bg-black/25 p-4 backdrop-blur">
                  <p className="font-display text-2xl font-semibold tracking-[-0.04em] text-white">
                    Gameboy SP
                  </p>
                  <p className="mt-2 text-sm leading-6 text-slate-200/80">
                    Coleções visuais com fotos, status, favoritos e contexto para cada peça.
                  </p>
                </div>
              </article>

              <div className="grid gap-4">
                {showcaseCards.map((card) => {
                  const Icon = card.icon;

                  return (
                    <article
                      key={card.title}
                      className="vault-mosaic-card relative overflow-hidden rounded-[1.5rem] p-4"
                    >
                      <div className={`absolute inset-0 bg-gradient-to-br opacity-80 ${card.tone}`} />
                      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(2,6,23,0.1),rgba(2,6,23,0.78))]" />
                      <div className="relative flex min-h-36 flex-col justify-between">
                        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/12 text-white shadow-inner">
                          <Icon className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="font-display text-xl font-semibold tracking-[-0.04em] text-white">
                            {card.title}
                          </p>
                          <p className="mt-2 max-w-[18rem] text-sm leading-6 text-slate-200/78">
                            {card.description}
                          </p>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        <section
          id="beneficios"
          className="grid gap-4 pb-8 md:grid-cols-2 xl:grid-cols-4"
        >
          {statCards.map((stat) => (
            <article
              key={stat.label}
              className="vault-app-panel rounded-[1.75rem] p-5"
            >
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">
                {stat.label}
              </p>
              <p className={`mt-3 font-display text-4xl font-semibold tracking-[-0.05em] ${stat.accent}`}>
                {stat.value}
              </p>
            </article>
          ))}
        </section>

        <section
          id="preview"
          className="grid gap-6 pb-10 lg:grid-cols-[0.72fr_1.28fr]"
        >
          <div className="vault-app-panel rounded-[2rem] p-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-indigo-100">
              <Shield className="h-3.5 w-3.5" />
              Experiência interna
            </div>

            <h3 className="mt-5 font-display text-3xl font-semibold tracking-[-0.05em] text-white">
              A home apresenta o serviço. O dashboard faz o resto.
            </h3>
            <p className="mt-4 text-sm leading-7 text-slate-300">
              A proposta visual conecta a vitrine pública com a interface logada: busca, filtros, visão por cards e leitura rápida dos indicadores mais importantes.
            </p>

            <div className="mt-6 space-y-3">
              {[
                {
                  icon: LayoutGrid,
                  title: "Painéis consistentes",
                  copy: "A mesma linguagem premium aparece na landing, login e área autenticada.",
                },
                {
                  icon: Search,
                  title: "Descoberta rápida",
                  copy: "Busca e categorias ajudam o usuário a entender o valor antes mesmo do cadastro.",
                },
                {
                  icon: Star,
                  title: "Itens em destaque",
                  copy: "Coleções favoritas ganham espaço visual e elevam a percepção do produto.",
                },
              ].map((item) => {
                const Icon = item.icon;

                return (
                  <div
                    key={item.title}
                    className="rounded-[1.4rem] border border-white/8 bg-white/4 p-4"
                  >
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5 flex h-10 w-10 items-center justify-center rounded-2xl bg-indigo-400/12 text-indigo-200">
                        <Icon className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="font-medium text-white">{item.title}</p>
                        <p className="mt-1 text-sm leading-6 text-slate-400">{item.copy}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="vault-app-panel overflow-hidden rounded-[2rem] p-4 sm:p-6">
            <div className="relative overflow-hidden rounded-[1.75rem] border border-white/8 bg-[#0a0a14]/90 p-4 sm:p-5">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(99,102,241,0.16),transparent_26%),radial-gradient(circle_at_left,rgba(56,189,248,0.12),transparent_24%)]" />

              <div className="relative">
                <div className="grid gap-3 sm:grid-cols-4">
                  {previewStats.map((stat) => (
                    <div
                      key={stat.label}
                      className="rounded-[1.3rem] border border-white/8 bg-white/[0.03] p-4"
                    >
                      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                        {stat.label}
                      </p>
                      <p className={`mt-2 text-2xl font-semibold ${stat.accent}`}>{stat.value}</p>
                    </div>
                  ))}
                </div>

                <div className="mt-4 grid gap-3 rounded-[1.5rem] border border-white/8 bg-black/25 p-3 sm:grid-cols-[1.2fr_auto] sm:items-center">
                  <div className="flex items-center gap-3 rounded-2xl border border-white/8 bg-[#090912] px-4 py-3 text-sm text-slate-400">
                    <Search className="h-4 w-4" />
                    Buscar na coleção...
                  </div>
                  <div className="flex gap-2">
                    <div className="rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-slate-900">
                      Grade
                    </div>
                    <div className="rounded-2xl border border-white/8 bg-white/5 px-4 py-3 text-sm font-semibold text-slate-300">
                      + Novo item
                    </div>
                  </div>
                </div>

                <div className="mt-4 flex gap-2 overflow-x-auto pb-1 mobile-scrollbar">
                  {previewFilters.map((filter, index) => (
                    <div
                      key={filter}
                      className={`rounded-full px-4 py-2 text-sm font-medium ${
                        index === 0
                          ? "bg-indigo-400/16 text-indigo-100 ring-1 ring-indigo-300/25"
                          : "border border-white/8 bg-white/4 text-slate-300"
                      }`}
                    >
                      {filter}
                    </div>
                  ))}
                </div>

                <div className="mt-5 grid gap-4 xl:grid-cols-3">
                  {previewItems.map((item) => (
                    <article
                      key={item.title}
                      className="overflow-hidden rounded-[1.5rem] border border-white/8 bg-white/[0.03]"
                    >
                      <div className={`relative flex min-h-44 items-center justify-center bg-gradient-to-br text-6xl ${item.gradient}`}>
                        <span className="absolute left-3 top-3 rounded-full border border-white/12 bg-black/20 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-100">
                          {item.chip}
                        </span>
                        <span className="absolute right-3 top-3 text-xl text-rose-400">♥</span>
                        {item.emoji}
                      </div>
                      <div className="space-y-3 p-4">
                        <div>
                          <h4 className="font-display text-xl font-semibold tracking-[-0.04em] text-white">
                            {item.title}
                          </h4>
                          <p className="mt-1 text-sm text-slate-400">{item.meta}</p>
                        </div>
                        <div className="flex gap-2">
                          <div className="rounded-2xl border border-indigo-300/18 bg-indigo-400/10 px-3 py-2 text-xs font-semibold text-indigo-100">
                            Editar
                          </div>
                          <div className="rounded-2xl border border-white/8 bg-white/5 px-3 py-2 text-xs font-semibold text-slate-300">
                            Detalhes
                          </div>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
