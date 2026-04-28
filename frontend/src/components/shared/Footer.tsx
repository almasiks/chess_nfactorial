"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

// ── Social icon SVG paths (24×24 viewBox) ────────────────────────────────────
const ICONS: Record<string, string> = {
  X:         "M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.747l7.73-8.835L1.254 2.25H8.08l4.253 5.622 5.908-5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z",
  YouTube:   "M21.593 7.203a2.506 2.506 0 0 0-1.762-1.766C18.265 5.007 12 5 12 5s-6.264-.007-7.831.404a2.56 2.56 0 0 0-1.766 1.778C2 8.753 2 12 2 12s0 3.246.416 4.797A2.506 2.506 0 0 0 4.19 18.57C5.773 19 12 19 12 19s6.265 0 7.831-.43a2.51 2.51 0 0 0 1.768-1.804C22 15.247 22 12 22 12s0-3.246-.407-4.797zM10 15V9l5.196 3z",
  Instagram: "M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z",
  Discord:   "M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z",
  Twitch:    "M11.571 4.714h1.715v5.143H11.57zm4.715 0H18v5.143h-1.714zM6 0L1.714 4.286v15.428h5.143V24l4.286-4.286h3.428L22.286 12V0zm14.571 11.143l-3.428 3.428h-3.429l-3 3v-3H6.857V1.714h13.714z",
  TikTok:    "M12.53.02C13.84 0 15.14.01 16.44 0a6.09 6.09 0 0 0 1.75 4.17 6.3 6.3 0 0 0 4.24 1.79v4.03a10.17 10.17 0 0 1-4.2-.97 10.5 10.5 0 0 1-1.62-.93c0 2.92.01 5.84-.02 8.75a7.68 7.68 0 0 1-1.35 3.94 7.8 7.8 0 0 1-5.92 3.21 7.62 7.62 0 0 1-4.08-1.03 7.86 7.86 0 0 1-3.65-5.71 13.7 13.7 0 0 1-.01-1.49 7.67 7.67 0 0 1 2.58-4.96c1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37a3.33 3.33 0 0 0-1.36 1.75c-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87a3.46 3.46 0 0 0 2.77-1.61c.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36z",
  VK:        "M15.684 0H8.316C1.592 0 0 1.592 0 8.316v7.368C0 22.408 1.592 24 8.316 24h7.368C22.408 24 24 22.408 24 15.684V8.316C24 1.592 22.408 0 15.684 0zm3.692 17.123h-1.744c-.66 0-.864-.525-2.05-1.727-1.033-1-1.49-1.135-1.744-1.135-.356 0-.458.102-.458.593v1.575c0 .424-.135.678-1.253.678-1.846 0-3.896-1.118-5.335-3.202C5.016 10.799 4.48 8.57 4.48 8.096c0-.254.102-.491.593-.491h1.744c.441 0 .61.203.78.677.864 2.49 2.303 4.675 2.896 4.675.22 0 .322-.102.322-.66V9.721c-.068-1.186-.695-1.287-.695-1.71 0-.204.17-.407.44-.407h2.744c.373 0 .508.203.508.643v3.473c0 .372.17.508.271.508.22 0 .407-.136.813-.542 1.27-1.422 2.17-3.608 2.17-3.608.119-.254.322-.491.763-.491h1.744c.525 0 .644.27.525.643-.22 1.017-2.354 4.031-2.354 4.031-.186.305-.254.44 0 .78.186.254.796.779 1.203 1.253.745.847 1.32 1.558 1.473 2.05.17.491-.085.745-.576.745z",
  Apple:     "M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z",
  Android:   "M17.523 15.341a.999.999 0 1 1 0-1.998.999.999 0 0 1 0 1.998m-11.046 0a.999.999 0 1 1 0-1.998.999.999 0 0 1 0 1.998m11.405-6.02l1.997-3.459a.416.416 0 0 0-.68-.482l-2.022 3.503A11.927 11.927 0 0 0 12 7.851c-1.853 0-3.59.393-5.137 1.099L4.841 5.447a.416.416 0 0 0-.72.428l1.997 3.459C3.45 10.725 1.7 13.134 1.7 16h20.6c0-2.866-1.75-5.275-4.418-6.679",
};

const SOCIAL = [
  { name: "Apple",     href: "#" },
  { name: "Android",   href: "#" },
  { name: "TikTok",    href: "#" },
  { name: "X",         href: "#" },
  { name: "YouTube",   href: "#" },
  { name: "Twitch",    href: "#" },
  { name: "Instagram", href: "#" },
  { name: "Discord",   href: "#" },
  { name: "VK",        href: "#" },
];

type ModalKey = "dictionary" | "vacancies" | "partners" | null;

// ── Chess dictionary terms ────────────────────────────────────────────────────
const DICTIONARY = [
  { term: "Мат",               def: "Положение, при котором король атакован и не может избежать взятия — конец игры." },
  { term: "Пат",               def: "Сторона, чья очередь ходить, не может сделать ни одного хода, не подставив короля. Ничья." },
  { term: "Шах",               def: "Ситуация, когда король находится под атакой фигуры противника." },
  { term: "Рокировка",         def: "Особый ход: король перемещается на два поля к ладье, ладья перепрыгивает через него." },
  { term: "Вилка",             def: "Тактический удар: одна фигура одновременно атакует две и более фигуры противника." },
  { term: "Связка",            def: "Фигура не может ходить, не подставив под удар более ценную фигуру позади неё." },
  { term: "Гамбит",            def: "Жертва материала в дебюте ради позиционного или темпового преимущества." },
  { term: "Дебют",             def: "Начальная стадия партии, где стороны мобилизуют фигуры и борются за центр." },
  { term: "Миттельшпиль",      def: "Средняя стадия партии после окончания дебюта — основная тактическая борьба." },
  { term: "Эндшпиль",          def: "Заключительная стадия партии, когда на доске осталось мало фигур." },
];

// ── Reusable modal shell ──────────────────────────────────────────────────────
function FooterModal({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: "rgba(0,0,0,0.75)", backdropFilter: "blur(6px)" }}
          onClick={(e) => e.target === e.currentTarget && onClose()}
        >
          <motion.div
            initial={{ scale: 0.92, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.92, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="w-full max-w-lg rounded-2xl border overflow-hidden"
            style={{ backgroundColor: "#0d1117", borderColor: "rgba(0,175,202,0.3)" }}
          >
            {/* Modal header */}
            <div
              className="flex items-center justify-between px-6 py-4 border-b"
              style={{ borderColor: "rgba(0,175,202,0.15)" }}
            >
              <h2 className="text-lg font-black text-white">{title}</h2>
              <button onClick={onClose} className="text-zinc-500 hover:text-white text-xl transition-colors">×</button>
            </div>
            <div className="p-6 max-h-[70vh] overflow-y-auto">
              {children}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ── Dictionary modal ──────────────────────────────────────────────────────────
function DictionaryContent() {
  return (
    <div className="space-y-4">
      <p className="text-xs text-zinc-500 mb-4">
        Основные термины шахматной игры на русском языке.
      </p>
      {DICTIONARY.map((d) => (
        <div key={d.term} className="border-b pb-3" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
          <p className="font-black text-sm mb-1" style={{ color: "#D4AF37" }}>{d.term}</p>
          <p className="text-xs text-zinc-400 leading-relaxed">{d.def}</p>
        </div>
      ))}
    </div>
  );
}

// ── Vacancies modal ───────────────────────────────────────────────────────────
function VacanciesContent({ onClose }: { onClose: () => void }) {
  const [sent, setSent]       = useState(false);
  const [name, setName]       = useState("");
  const [role, setRole]       = useState("");
  const [portfolio, setPortfolio] = useState("");

  function handleSubmit(e: { preventDefault(): void }) {
    e.preventDefault();
    if (!name.trim() || !role.trim()) return;
    setSent(true);
  }

  if (sent) {
    return (
      <div className="text-center py-8">
        <p className="text-4xl mb-4">🏹</p>
        <p className="text-lg font-black text-white mb-2">Заявка отправлена!</p>
        <p className="text-sm text-zinc-500 mb-6">Мы свяжемся с тобой в течение 3 рабочих дней.</p>
        <button
          onClick={onClose}
          className="px-6 py-2.5 rounded-xl text-sm font-bold text-white transition-all"
          style={{ background: "linear-gradient(135deg,#00AFCA,#0088a0)" }}
        >
          Закрыть
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <p className="text-xs text-zinc-500 mb-2">
        Хочешь строить шахматную платформу для Казахстана? Расскажи о себе.
      </p>
      <div>
        <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest block mb-1.5">
          Имя *
        </label>
        <input
          type="text"
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="Твоё имя"
          required
          className="w-full px-4 py-3 rounded-xl bg-zinc-900 border text-white text-sm outline-none focus:border-sky-500 transition-colors"
          style={{ borderColor: "rgba(0,175,202,0.25)" }}
        />
      </div>
      <div>
        <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest block mb-1.5">
          Желаемая роль *
        </label>
        <input
          type="text"
          value={role}
          onChange={e => setRole(e.target.value)}
          placeholder="Frontend, Backend, Designer, Marketing..."
          required
          className="w-full px-4 py-3 rounded-xl bg-zinc-900 border text-white text-sm outline-none focus:border-sky-500 transition-colors"
          style={{ borderColor: "rgba(0,175,202,0.25)" }}
        />
      </div>
      <div>
        <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest block mb-1.5">
          Ссылка на портфолио
        </label>
        <input
          type="url"
          value={portfolio}
          onChange={e => setPortfolio(e.target.value)}
          placeholder="https://github.com/..."
          className="w-full px-4 py-3 rounded-xl bg-zinc-900 border text-white text-sm outline-none focus:border-sky-500 transition-colors"
          style={{ borderColor: "rgba(0,175,202,0.25)" }}
        />
      </div>
      <button
        type="submit"
        disabled={!name.trim() || !role.trim()}
        className="w-full py-3 rounded-xl font-bold text-white text-sm transition-all hover:opacity-90 disabled:opacity-40"
        style={{ background: "linear-gradient(135deg,#00AFCA,#0088a0)" }}
      >
        Отправить заявку →
      </button>
    </form>
  );
}

// ── Partners modal ────────────────────────────────────────────────────────────
function PartnersContent({ onClose }: { onClose: () => void }) {
  const [sent, setSent]         = useState(false);
  const [company, setCompany]   = useState("");
  const [contact, setContact]   = useState("");
  const [message, setMessage]   = useState("");

  function handleSubmit(e: { preventDefault(): void }) {
    e.preventDefault();
    if (!company.trim() || !contact.trim()) return;
    setSent(true);
  }

  if (sent) {
    return (
      <div className="text-center py-8">
        <p className="text-4xl mb-4">🤝</p>
        <p className="text-lg font-black text-white mb-2">Запрос получен!</p>
        <p className="text-sm text-zinc-500 mb-6">Мы рассмотрим партнёрство и свяжемся с вами.</p>
        <button
          onClick={onClose}
          className="px-6 py-2.5 rounded-xl text-sm font-bold text-white transition-all"
          style={{ background: "linear-gradient(135deg,#D4AF37,#b8962e)" }}
        >
          Закрыть
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <p className="text-xs text-zinc-500 mb-2">
        Хотите сотрудничать со Steppe Chess? Расскажите о вашей компании.
      </p>
      <div>
        <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest block mb-1.5">
          Компания / Организация *
        </label>
        <input
          type="text"
          value={company}
          onChange={e => setCompany(e.target.value)}
          placeholder="Название организации"
          required
          className="w-full px-4 py-3 rounded-xl bg-zinc-900 border text-white text-sm outline-none focus:border-sky-500 transition-colors"
          style={{ borderColor: "rgba(212,175,55,0.25)" }}
        />
      </div>
      <div>
        <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest block mb-1.5">
          Контактное лицо / Email *
        </label>
        <input
          type="text"
          value={contact}
          onChange={e => setContact(e.target.value)}
          placeholder="Имя или email"
          required
          className="w-full px-4 py-3 rounded-xl bg-zinc-900 border text-white text-sm outline-none focus:border-sky-500 transition-colors"
          style={{ borderColor: "rgba(212,175,55,0.25)" }}
        />
      </div>
      <div>
        <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest block mb-1.5">
          Предложение о сотрудничестве
        </label>
        <textarea
          value={message}
          onChange={e => setMessage(e.target.value)}
          placeholder="Опишите суть партнёрства..."
          rows={3}
          className="w-full px-4 py-3 rounded-xl bg-zinc-900 border text-white text-sm outline-none focus:border-yellow-500 resize-none transition-colors"
          style={{ borderColor: "rgba(212,175,55,0.25)" }}
        />
      </div>
      <button
        type="submit"
        disabled={!company.trim() || !contact.trim()}
        className="w-full py-3 rounded-xl font-bold text-white text-sm transition-all hover:opacity-90 disabled:opacity-40"
        style={{ background: "linear-gradient(135deg,#D4AF37,#b8962e)" }}
      >
        Стать партнёром →
      </button>
    </form>
  );
}

// ── Social button ─────────────────────────────────────────────────────────────
function SocialBtn({ name, href }: { name: string; href: string }) {
  const path = ICONS[name];
  return (
    <a
      href={href}
      aria-label={name}
      className="w-7 h-7 flex items-center justify-center rounded-md transition-all opacity-40 hover:opacity-100"
      style={{ color: "#a1a1aa" }}
      onMouseEnter={e => (e.currentTarget.style.color = "#D4AF37")}
      onMouseLeave={e => (e.currentTarget.style.color = "#a1a1aa")}
    >
      <svg viewBox="0 0 24 24" fill="currentColor" width="15" height="15">
        <path d={path} />
      </svg>
    </a>
  );
}

// ── Footer ────────────────────────────────────────────────────────────────────
export function Footer() {
  const [modal, setModal] = useState<ModalKey>(null);

  const open  = (m: NonNullable<ModalKey>) => setModal(m);
  const close = () => setModal(null);

  // Link definitions — some open modals, others are real hrefs
  const links: { label: string; onClick?: () => void; href?: string; external?: boolean }[] = [
    { label: "Служба поддержки",           href: "https://t.me/almas_magrupov", external: true },
    { label: "Шахматный словарь",           onClick: () => open("dictionary") },
    { label: "Вакансии",                    onClick: () => open("vacancies") },
    { label: "Разработчики",                href: "#" },
    { label: "Пользовательское соглашение", href: "#" },
    { label: "Политика конфиденциальности", href: "#" },
    { label: "Правила честной игры",        href: "#" },
    { label: "Партнёры",                    onClick: () => open("partners") },
  ];

  return (
    <>
      {/* Modals */}
      <FooterModal open={modal === "dictionary"} onClose={close} title="Шахматный словарь">
        <DictionaryContent />
      </FooterModal>
      <FooterModal open={modal === "vacancies"} onClose={close} title="Вакансии">
        <VacanciesContent onClose={close} />
      </FooterModal>
      <FooterModal open={modal === "partners"} onClose={close} title="Стать партнёром">
        <PartnersContent onClose={close} />
      </FooterModal>

      <footer
        className="border-t mt-auto"
        style={{ backgroundColor: "#080b10", borderColor: "rgba(0,175,202,0.08)" }}
      >
        <div className="max-w-6xl mx-auto px-6 py-5">

          {/* Row 1: logo + links */}
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 mb-3">
            <div className="flex items-center gap-1.5 shrink-0 mr-2">
              <span className="text-base">♟</span>
              <span className="font-black text-sm tracking-tight">
                Steppe<span style={{ color: "#00AFCA" }}>Chess</span>
              </span>
            </div>

            {links.map(l =>
              l.onClick ? (
                <button
                  key={l.label}
                  onClick={l.onClick}
                  className="text-[11px] text-zinc-500 hover:text-[#D4AF37] transition-colors whitespace-nowrap"
                >
                  {l.label}
                </button>
              ) : l.external ? (
                <a
                  key={l.label}
                  href={l.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[11px] text-zinc-500 hover:text-[#D4AF37] transition-colors whitespace-nowrap"
                >
                  {l.label}
                </a>
              ) : (
                <Link
                  key={l.label}
                  href={l.href!}
                  className="text-[11px] text-zinc-500 hover:text-[#D4AF37] transition-colors whitespace-nowrap"
                >
                  {l.label}
                </Link>
              )
            )}
          </div>

          {/* Row 2: social + copyright */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-0.5">
              {SOCIAL.map(s => <SocialBtn key={s.name} {...s} />)}
            </div>
            <p className="text-zinc-700 text-[11px]">
              <span className="font-semibold" style={{ color: "#00AFCA" }}>Steppe Chess</span>
              {" "}© 2026 · Астана, Казахстан · Все права защищены
            </p>
          </div>

        </div>
      </footer>
    </>
  );
}
