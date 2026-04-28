"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useCart } from "@/hooks/useCart";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import { TRANSLATIONS, type Lang } from "@/lib/translations";
import { KazakhDivider } from "@/components/shared/KazakhOrnament";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

/* ─── Types ──────────────────────────────────────────────────────────────── */
interface Product {
  id: number;
  name: string;
  description: string;
  category: string;
  category_display: string;
  price: number;
  discounted_price: number;
  image_url: string;
  coming_soon: boolean;
}

interface LocalProductDef {
  id: number;
  names: Record<Lang, string>;
  descriptions: Record<Lang, string>;
  category: "chess" | "clothes";
  price: number;
  discounted_price: number;
  image_url: string;
}

type CategoryTab = "chess" | "clothes";

/* ─── Product emoji mapping (by Russian key — stays internal) ─────────────── */
const PRODUCT_EMOJIS: Record<string, string> = {
  chess_1:  "♔",
  chess_2:  "♞",
  chess_3:  "🎒",
  chess_4:  "⏱",
  chess_5:  "♟",
  clothes_1: "👕",
  clothes_2: "🧥",
  clothes_3: "🧢",
  clothes_4: "🏆",
  clothes_5: "🦅",
};

const CHESS_BG   = [
  "from-amber-900/40 to-zinc-900",
  "from-zinc-800 to-zinc-900",
  "from-sky-900/40 to-zinc-900",
  "from-emerald-900/30 to-zinc-900",
  "from-orange-900/30 to-zinc-900",
];
const CLOTHES_BG = [
  "from-indigo-900/40 to-zinc-900",
  "from-purple-900/30 to-zinc-900",
  "from-rose-900/30 to-zinc-900",
  "from-violet-900/30 to-zinc-900",
  "from-cyan-900/30 to-zinc-900",
];

/* ─── Local product definitions with multilingual content ────────────────── */
const CHESS_DEFS: LocalProductDef[] = [
  {
    id: -1,
    names: {
      RU: "Ханская доска",
      KZ: "Хан тақтасы",
      EN: "Khan's Board",
    },
    descriptions: {
      RU: "Премиальное дерево, ручная работа. Покрытие лаком, инкрустация национальным орнаментом.",
      KZ: "Сапалы ағаш, қолдан жасалған. Лакпен жабылған, ұлттық өрнекпен инкрустацияланған.",
      EN: "Premium wood, handcrafted. Lacquered finish with traditional Kazakh ornament inlay.",
    },
    category: "chess",
    price: 89900, discounted_price: 85405,
    image_url: "https://images.unsplash.com/photo-1529699211952-734e80c4d42b?auto=format&w=400&q=80",
  },
  {
    id: -2,
    names: {
      RU: "Фигурки Сарбазов",
      KZ: "Сарбаз мүсіндері",
      EN: "Sarbaz Figurines",
    },
    descriptions: {
      RU: "Литые металлические фигуры в казахском стиле. Набор из 32 фигур с матовой отделкой.",
      KZ: "Қазақ стилінде құйылған металл мүсіндер. Матты бетпен 32 мүсін жинағы.",
      EN: "Cast metal pieces in Kazakh style. Set of 32 pieces with matte finish.",
    },
    category: "chess",
    price: 45000, discounted_price: 42750,
    image_url: "https://images.unsplash.com/photo-1586165368502-1bad197a6461?auto=format&w=400&q=80",
  },
  {
    id: -3,
    names: {
      RU: "Рюкзак Кочевника",
      KZ: "Көшпелі рюкзак",
      EN: "Nomad Backpack",
    },
    descriptions: {
      RU: "Удобный рюкзак для переноски шахмат и ноутбука. Водоотталкивающий материал, объём 30 л.",
      KZ: "Шахмат пен ноутбук тасуға арналған ыңғайлы рюкзак. Суды итеретін материал, 30 л.",
      EN: "Comfortable backpack for carrying chess and a laptop. Water-resistant material, 30 L.",
    },
    category: "chess",
    price: 29900, discounted_price: 28405,
    image_url: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&w=400&q=80",
  },
  {
    id: -4,
    names: {
      RU: 'Электронные часы "Тулпар"',
      KZ: '"Тұлпар" электронды сағат',
      EN: '"Tulpar" Electronic Clock',
    },
    descriptions: {
      RU: "Профессиональный таймер с поддержкой режима Фишера. Подсветка, матовый алюминиевый корпус.",
      KZ: "Фишер режимін қолдайтын кәсіби таймер. Жарықтандыру, матты алюминий корпус.",
      EN: "Professional chess clock with Fischer mode. Backlit display, matte aluminium body.",
    },
    category: "chess",
    price: 38500, discounted_price: 36575,
    image_url: "https://images.unsplash.com/photo-1606167668584-78701c57f13d?auto=format&w=400&q=80",
  },
  {
    id: -5,
    names: {
      RU: 'Дорожный набор "Степь"',
      KZ: '"Дала" жол жинағы',
      EN: '"Steppe" Travel Set',
    },
    descriptions: {
      RU: "Магнитные шахматы в кожаном чехле. Идеально для путешествий по Великой Степи.",
      KZ: "Тері қапшықтағы магнитті шахмат. Ұлы Далада саяхатқа арналған.",
      EN: "Magnetic chess in a leather case. Perfect for travelling across the Great Steppe.",
    },
    category: "chess",
    price: 24900, discounted_price: 23655,
    image_url: "https://images.unsplash.com/photo-1611195974226-a6a9be9dd763?auto=format&w=400&q=80",
  },
];

const CLOTHES_DEFS: LocalProductDef[] = [
  {
    id: -6,
    names: {
      RU: 'Футболка "Steppe Minimalist"',
      KZ: '"Steppe Minimalist" футболка',
      EN: '"Steppe Minimalist" T-Shirt',
    },
    descriptions: {
      RU: "Однотонная база (чёрный / белый) с золотым логотипом на груди. 100% органический хлопок.",
      KZ: "Қара/ақ түсті негіз, кеудеде алтын логотип. 100% органикалық мақта.",
      EN: "Solid base (black / white) with gold chest logo. 100% organic cotton.",
    },
    category: "clothes",
    price: 12900, discounted_price: 12255,
    image_url: "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&w=400&q=80",
  },
  {
    id: -7,
    names: {
      RU: 'Худи "Focus Mode"',
      KZ: '"Focus Mode" худи',
      EN: '"Focus Mode" Hoodie',
    },
    descriptions: {
      RU: "Плотный хлопок, глубокий синий цвет, вышивка национального орнамента на рукавах.",
      KZ: "Тығыз мақта, терең көк түс, жеңдерде ұлттық өрнек кестесі.",
      EN: "Heavy cotton, deep blue, sleeve embroidery with traditional ornament.",
    },
    category: "clothes",
    price: 28900, discounted_price: 27455,
    image_url: "https://images.unsplash.com/photo-1556821840-3a63f15732ce?auto=format&w=400&q=80",
  },
  {
    id: -8,
    names: {
      RU: 'Кепка "Nomad"',
      KZ: '"Nomad" кепка',
      EN: '"Nomad" Cap',
    },
    descriptions: {
      RU: "Классический крой с изогнутым козырьком. Вышивка «Steppe Chess» на задней панели.",
      KZ: "Классикалық кесім, иілген козырек. Артқы панельде «Steppe Chess» кестесі.",
      EN: "Classic fit with curved brim. Steppe Chess embroidery on the back panel.",
    },
    category: "clothes",
    price: 8900, discounted_price: 8455,
    image_url: "https://images.unsplash.com/photo-1588850561407-ed78c282e89b?auto=format&w=400&q=80",
  },
  {
    id: -9,
    names: {
      RU: 'Свитшот "Grandmaster"',
      KZ: '"Grandmaster" свитшот',
      EN: '"Grandmaster" Sweatshirt',
    },
    descriptions: {
      RU: "Оверсайз модель с принтом шахматной доски в стиле петроглифов Центральной Азии.",
      KZ: "Орта Азия петроглиф стилінде шахмат тақтасы принтімен оверсайз модель.",
      EN: "Oversized model with chessboard print in Central Asian petroglyph style.",
    },
    category: "clothes",
    price: 22900, discounted_price: 21755,
    image_url: "https://images.unsplash.com/photo-1622445272461-c6580cab8755?auto=format&w=400&q=80",
  },
  {
    id: -10,
    names: {
      RU: 'Бомбер "Kaghanate"',
      KZ: '"Kaghanate" бомбер',
      EN: '"Kaghanate" Bomber Jacket',
    },
    descriptions: {
      RU: "Клубная куртка с гербом твоего региона. Эмблема Великого Каганата на груди.",
      KZ: "Аймағыңның елтаңбасы бар клубтық куртка. Кеудеде Ұлы Қағанат эмблемасы.",
      EN: "Club jacket with your region's emblem. Great Kaghanate badge on the chest.",
    },
    category: "clothes",
    price: 34900, discounted_price: 33155,
    image_url: "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&w=400&q=80",
  },
];

function toProduct(def: LocalProductDef, lang: Lang): Product {
  return {
    id:               def.id,
    name:             def.names[lang],
    description:      def.descriptions[lang],
    category:         def.category,
    category_display: def.category === "chess"
      ? (lang === "EN" ? "Chess" : lang === "KZ" ? "Шахмат" : "Шахматы")
      : (lang === "EN" ? "Clothing" : lang === "KZ" ? "Киім" : "Одежда"),
    price:            def.price,
    discounted_price: def.discounted_price,
    image_url:        def.image_url,
    coming_soon:      false,
  };
}

function getDemoProducts(category: CategoryTab, lang: Lang): Product[] {
  const defs = category === "chess" ? CHESS_DEFS : CLOTHES_DEFS;
  return defs.map((d) => toProduct(d, lang));
}

function getEmojiKey(idx: number, category: CategoryTab): string {
  return `${category}_${idx + 1}`;
}

/* ─── Product image ──────────────────────────────────────────────────────── */
function ProductImage({
  url, idx, category,
}: { url: string; idx: number; category: string }) {
  const [err, setErr] = useState(false);
  const bgs   = category === "clothes" ? CLOTHES_BG : CHESS_BG;
  const bg    = bgs[idx % bgs.length];
  const emoji = PRODUCT_EMOJIS[getEmojiKey(idx, category as CategoryTab)] ?? "♟";

  if (!url || err) {
    return (
      <div className={`w-full h-48 rounded-xl bg-gradient-to-br ${bg} flex items-center justify-center`}>
        <span className="text-7xl opacity-25 select-none">{emoji}</span>
      </div>
    );
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={url}
      alt=""
      onError={() => setErr(true)}
      className="w-full h-48 object-cover rounded-xl"
    />
  );
}

/* ─── Cart drawer ────────────────────────────────────────────────────────── */
function CartDrawer({ cart }: { cart: ReturnType<typeof useCart> }) {
  const { lang }    = useLanguage();
  const t           = TRANSLATIONS[lang];
  const { items, open, setOpen, removeItem, updateQty, subtotal, total, discount, count } = cart;

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40"
            style={{ backgroundColor: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}
            onClick={() => setOpen(false)}
          />
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 320, damping: 32 }}
            className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-md flex flex-col border-l"
            style={{ backgroundColor: "#0d1117", borderColor: "rgba(212,175,55,0.25)" }}
          >
            <div
              className="flex items-center justify-between px-6 py-4 border-b"
              style={{ borderColor: "rgba(212,175,55,0.15)" }}
            >
              <div className="flex items-center gap-2">
                <span className="text-xl">🛍️</span>
                <h2 className="font-black text-white">{t.store_cart}</h2>
                {count > 0 && (
                  <span
                    className="px-2 py-0.5 rounded-full text-xs font-black"
                    style={{ backgroundColor: "rgba(212,175,55,0.2)", color: "#D4AF37" }}
                  >
                    {count}
                  </span>
                )}
              </div>
              <button
                onClick={() => setOpen(false)}
                className="text-zinc-500 hover:text-white transition-colors p-1 rounded-lg hover:bg-zinc-800"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3">
              {items.length === 0 ? (
                <div className="text-center py-16 text-zinc-600">
                  <p className="text-5xl mb-3">🏕️</p>
                  <p className="text-sm">{t.store_empty_cart}</p>
                </div>
              ) : (
                items.map((item) => (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="flex gap-3 p-3 rounded-xl border"
                    style={{ backgroundColor: "#131920", borderColor: "rgba(212,175,55,0.12)" }}
                  >
                    <div
                      className="w-14 h-14 rounded-lg flex items-center justify-center shrink-0 text-3xl"
                      style={{ backgroundColor: "rgba(212,175,55,0.08)" }}
                    >
                      ♟
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-white text-sm truncate">{item.name}</p>
                      <p className="text-xs text-zinc-500 mt-0.5">
                        {item.originalPrice && item.originalPrice !== item.price && (
                          <span className="line-through mr-1 text-zinc-600">
                            {item.originalPrice.toLocaleString()}₸
                          </span>
                        )}
                        <span style={{ color: "#D4AF37" }}>{item.price.toLocaleString()}₸</span>
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <button
                          onClick={() => updateQty(item.id, item.quantity - 1)}
                          className="w-6 h-6 rounded-md text-sm font-bold flex items-center justify-center transition-all hover:bg-zinc-700"
                          style={{ backgroundColor: "#1e1e2e", color: "#D4AF37" }}
                        >−</button>
                        <span className="text-sm font-bold text-white w-5 text-center">{item.quantity}</span>
                        <button
                          onClick={() => updateQty(item.id, item.quantity + 1)}
                          className="w-6 h-6 rounded-md text-sm font-bold flex items-center justify-center transition-all hover:bg-zinc-700"
                          style={{ backgroundColor: "#1e1e2e", color: "#D4AF37" }}
                        >+</button>
                      </div>
                    </div>
                    <div className="text-right flex flex-col justify-between">
                      <button
                        onClick={() => removeItem(item.id)}
                        className="text-zinc-600 hover:text-red-400 transition-colors text-xs"
                      >✕</button>
                      <p className="font-black text-sm" style={{ color: "#D4AF37" }}>
                        {(item.price * item.quantity).toLocaleString()}₸
                      </p>
                    </div>
                  </motion.div>
                ))
              )}
            </div>

            {items.length > 0 && (
              <div className="px-6 py-4 border-t space-y-3" style={{ borderColor: "rgba(212,175,55,0.15)" }}>
                {discount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-zinc-400">{t.store_no_discount}</span>
                    <span className="line-through text-zinc-500">{subtotal.toLocaleString()}₸</span>
                  </div>
                )}
                {discount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-green-400">{t.store_discount}</span>
                    <span className="text-green-400">−{(subtotal - total).toLocaleString()}₸</span>
                  </div>
                )}
                <div className="flex justify-between items-center">
                  <span className="font-black text-white">{t.store_total}</span>
                  <span className="text-2xl font-black" style={{ color: "#D4AF37" }}>
                    {total.toLocaleString()}₸
                  </span>
                </div>
                <button
                  className="w-full py-3 rounded-xl font-black text-sm transition-all hover:opacity-90 active:scale-95"
                  style={{ background: "linear-gradient(135deg,#D4AF37,#b8962e)", color: "#09090b" }}
                >
                  {t.store_checkout}
                </button>
                <p className="text-center text-zinc-700 text-xs">{t.store_delivery}</p>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

/* ─── Product card ───────────────────────────────────────────────────────── */
function ProductCard({
  product, idx, isPro, onAdd,
}: {
  product: Product;
  idx: number;
  isPro: boolean;
  onAdd: (p: Product) => void;
}) {
  const { lang } = useLanguage();
  const addLabel = TRANSLATIONS[lang].store_add;
  const hasDiscount = isPro && product.discounted_price < product.price;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: idx * 0.08 }}
      className="relative rounded-2xl border overflow-hidden group transition-all hover:scale-[1.01]"
      style={{ backgroundColor: "#0d1117", borderColor: "rgba(212,175,55,0.15)" }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLElement).style.borderColor = "rgba(212,175,55,0.4)";
        (e.currentTarget as HTMLElement).style.boxShadow  = "0 0 24px rgba(212,175,55,0.08)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.borderColor = "rgba(212,175,55,0.15)";
        (e.currentTarget as HTMLElement).style.boxShadow  = "none";
      }}
    >
      <div
        className="absolute top-0 left-0 right-0 h-0.5 opacity-30"
        style={{ background: "linear-gradient(90deg,transparent,#D4AF37,transparent)" }}
      />

      {isPro && (
        <div
          className="absolute top-2 right-2 z-10 px-2 py-0.5 rounded-full text-xs font-black"
          style={{ backgroundColor: "rgba(34,197,94,0.15)", color: "#22c55e", border: "1px solid rgba(34,197,94,0.3)" }}
        >
          Sultan −5%
        </div>
      )}

      <div className="p-3">
        <ProductImage url={product.image_url} idx={idx} category={product.category} />
      </div>

      <div className="px-4 pb-4">
        <h3 className="font-black text-white mb-1">{product.name}</h3>
        <p className="text-zinc-500 text-xs leading-relaxed mb-3 line-clamp-2">{product.description}</p>

        <div className="flex items-center justify-between">
          <div>
            {hasDiscount ? (
              <>
                <span className="text-xs line-through text-zinc-600 mr-1">
                  {product.price.toLocaleString()}₸
                </span>
                <span className="text-lg font-black" style={{ color: "#D4AF37" }}>
                  {product.discounted_price.toLocaleString()}₸
                </span>
              </>
            ) : (
              <span className="text-lg font-black" style={{ color: "#D4AF37" }}>
                {product.price.toLocaleString()}₸
              </span>
            )}
          </div>
          <button
            onClick={() => onAdd(product)}
            className="px-4 py-2 rounded-xl text-sm font-black transition-all hover:opacity-90 active:scale-95"
            style={{ background: "linear-gradient(135deg,#D4AF37,#b8962e)", color: "#09090b" }}
          >
            {addLabel}
          </button>
        </div>
      </div>
    </motion.div>
  );
}

/* ─── Main page ──────────────────────────────────────────────────────────── */
export function StorePage() {
  const { user }    = useAuth();
  const { lang }    = useLanguage();
  const t           = TRANSLATIONS[lang];
  const isPro       = user?.is_pro ?? false;

  const [products, setProducts] = useState<Product[]>([]);
  const [category, setCategory] = useState<CategoryTab>("chess");
  const [loading,  setLoading]  = useState(true);

  const cart = useCart(isPro);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const token = localStorage.getItem("steppechess_access") ?? "";
        const res   = await fetch(`${API}/api/store/products/?category=${category}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        if (res.ok) {
          const data: Product[] = await res.json();
          setProducts(data.length > 0 ? data : getDemoProducts(category, lang));
        } else {
          setProducts(getDemoProducts(category, lang));
        }
      } catch {
        setProducts(getDemoProducts(category, lang));
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [category, lang]);

  function handleAdd(product: Product) {
    cart.addItem({
      id:            product.id,
      name:          product.name,
      price:         isPro ? product.discounted_price : product.price,
      originalPrice: product.price,
      image:         product.image_url,
    });
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        {/* Header */}
        <div className="flex items-start justify-between mb-2 flex-wrap gap-4">
          <div>
            <p className="text-xs font-bold tracking-widest uppercase mb-2" style={{ color: "#D4AF37" }}>
              {t.store_label}
            </p>
            <h1 className="text-4xl font-black">{t.store_heading}</h1>
          </div>

          <button
            onClick={() => cart.setOpen(true)}
            className="relative flex items-center gap-2 px-4 py-2.5 rounded-xl border font-bold text-sm transition-all hover:opacity-80"
            style={{ borderColor: "rgba(212,175,55,0.3)", backgroundColor: "rgba(212,175,55,0.06)", color: "#D4AF37" }}
          >
            {t.store_cart}
            {cart.count > 0 && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -top-2 -right-2 w-5 h-5 rounded-full text-xs font-black flex items-center justify-center"
                style={{ backgroundColor: "#D4AF37", color: "#09090b" }}
              >
                {cart.count}
              </motion.span>
            )}
          </button>
        </div>

        {isPro && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2 px-4 py-2 rounded-xl mb-4 text-sm font-bold w-fit"
            style={{ backgroundColor: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.2)", color: "#22c55e" }}
          >
            {t.store_pro_badge}
          </motion.div>
        )}

        <p className="text-zinc-400 text-sm mb-6">{t.store_desc}</p>

        <KazakhDivider color="#D4AF37" className="mb-8" />

        {/* Category tabs */}
        <div
          className="flex p-1 rounded-xl mb-8 w-fit"
          style={{ backgroundColor: "#0d1117", border: "1px solid rgba(212,175,55,0.2)" }}
        >
          {([
            { id: "chess",   label: t.store_chess_tab   },
            { id: "clothes", label: t.store_clothes_tab },
          ] as { id: CategoryTab; label: string }[]).map((tab) => (
            <button
              key={tab.id}
              onClick={() => setCategory(tab.id)}
              className="px-6 py-2 rounded-lg text-sm font-bold transition-all"
              style={{
                backgroundColor: category === tab.id ? "rgba(212,175,55,0.15)" : "transparent",
                color:           category === tab.id ? "#D4AF37" : "#71717a",
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Products grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="rounded-2xl border animate-pulse"
                style={{ backgroundColor: "#0d1117", borderColor: "rgba(212,175,55,0.1)", height: 340 }}
              />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {products.map((p, i) => (
              <ProductCard
                key={p.id}
                product={p}
                idx={i}
                isPro={isPro}
                onAdd={handleAdd}
              />
            ))}
          </div>
        )}

        {/* Banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-12 p-6 rounded-2xl border relative overflow-hidden text-center"
          style={{ backgroundColor: "#0d1117", borderColor: "rgba(212,175,55,0.2)" }}
        >
          <div
            className="absolute top-0 left-0 right-0 h-0.5"
            style={{ background: "linear-gradient(90deg,transparent,#D4AF37,transparent)" }}
          />
          <div
            className="absolute bottom-0 left-0 right-0 h-0.5"
            style={{ background: "linear-gradient(90deg,transparent,#D4AF37,transparent)" }}
          />
          <p className="text-3xl mb-2">👑</p>
          <p className="font-black text-lg text-white mb-1">{t.store_banner_title}</p>
          <p className="text-zinc-400 text-sm mb-4">{t.store_banner_desc}</p>
          <Link
            href="/upgrade"
            className="inline-block px-8 py-3 rounded-xl font-black text-sm transition-all hover:opacity-90"
            style={{ background: "linear-gradient(135deg,#D4AF37,#b8962e)", color: "#09090b" }}
          >
            {t.store_banner_cta}
          </Link>
        </motion.div>
      </motion.div>

      <CartDrawer cart={cart} />
    </div>
  );
}
