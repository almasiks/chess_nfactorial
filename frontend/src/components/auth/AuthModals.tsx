"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import type { RegisterData } from "@/context/AuthContext";

const CITIES = [
  { value: "almaty",          label: "Алматы" },
  { value: "astana",          label: "Астана" },
  { value: "shymkent",        label: "Шымкент" },
  { value: "karaganda",       label: "Қарағанды" },
  { value: "aktobe",          label: "Ақтөбе" },
  { value: "taraz",           label: "Тараз" },
  { value: "pavlodar",        label: "Павлодар" },
  { value: "ust_kamenogorsk", label: "Өскемен" },
  { value: "semey",           label: "Семей" },
  { value: "atyrau",          label: "Атырау" },
  { value: "other",           label: "Другой город" },
];

interface Props {
  mode: "login" | "register" | null;
  onClose: () => void;
  onSwitchMode: (mode: "login" | "register") => void;
}

export function AuthModals({ mode, onClose, onSwitchMode }: Props) {
  return (
    <AnimatePresence>
      {mode !== null && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          style={{ backgroundColor: "rgba(0,0,0,0.75)" }}
          onClick={(e) => e.target === e.currentTarget && onClose()}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 8 }}
            transition={{ duration: 0.2 }}
            className="w-full max-w-md rounded-2xl border relative"
            style={{ backgroundColor: "#0d1117", borderColor: "rgba(0,175,202,0.25)" }}
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-zinc-500 hover:text-white transition-colors text-lg"
            >
              ✕
            </button>

            {/* Tab bar */}
            <div className="flex border-b" style={{ borderColor: "rgba(0,175,202,0.1)" }}>
              {(["login", "register"] as const).map((m) => (
                <button
                  key={m}
                  onClick={() => onSwitchMode(m)}
                  className="flex-1 py-3.5 text-sm font-semibold transition-all"
                  style={{
                    color: mode === m ? "#00AFCA" : "#71717a",
                    borderBottom: mode === m ? "2px solid #00AFCA" : "2px solid transparent",
                  }}
                >
                  {m === "login" ? "Войти" : "Регистрация"}
                </button>
              ))}
            </div>

            <div className="p-8">
              <AnimatePresence mode="wait">
                {mode === "login" ? (
                  <motion.div key="login" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} transition={{ duration: 0.15 }}>
                    <LoginForm onClose={onClose} />
                  </motion.div>
                ) : (
                  <motion.div key="register" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} transition={{ duration: 0.15 }}>
                    <RegisterForm onClose={onClose} />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function LoginForm({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
      onClose();
      router.push("/profile");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Ошибка входа");
    } finally {
      setLoading(false);
    }
  };

  const inputCls = "w-full px-4 py-2.5 rounded-lg text-sm outline-none focus:ring-1 focus:ring-[#00AFCA] transition-all";
  const inputStyle = { backgroundColor: "#161b27", border: "1px solid rgba(0,175,202,0.2)", color: "white" };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-xs font-medium text-zinc-400 mb-1.5">Email</label>
        <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
          className={inputCls} style={inputStyle} placeholder="your@email.com" />
      </div>
      <div>
        <label className="block text-xs font-medium text-zinc-400 mb-1.5">Пароль</label>
        <input type="password" value={password} onChange={e => setPassword(e.target.value)} required
          className={inputCls} style={inputStyle} placeholder="••••••••" />
      </div>

      {error && (
        <p className="text-red-400 text-xs bg-red-400/10 border border-red-400/20 rounded-lg px-3 py-2">{error}</p>
      )}

      <button type="submit" disabled={loading}
        className="w-full py-3 rounded-xl font-bold text-white transition-all hover:opacity-90 disabled:opacity-50 mt-2"
        style={{ background: "linear-gradient(135deg,#00AFCA,#0088a0)" }}>
        {loading ? "Вход..." : "Войти в аккаунт"}
      </button>
    </form>
  );
}

function RegisterForm({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const { register } = useAuth();
  const [form, setForm] = useState<RegisterData>({
    username: "", email: "", password: "", password2: "", city: "almaty",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const set = (k: keyof RegisterData) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setForm(f => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password !== form.password2) { setError("Пароли не совпадают"); return; }
    setError("");
    setLoading(true);
    try {
      await register(form);
      onClose();
      router.push("/profile");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Ошибка регистрации");
    } finally {
      setLoading(false);
    }
  };

  const inputCls = "w-full px-4 py-2.5 rounded-lg text-sm outline-none focus:ring-1 focus:ring-[#00AFCA] transition-all";
  const inputStyle = { backgroundColor: "#161b27", border: "1px solid rgba(0,175,202,0.2)", color: "white" };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div className="col-span-2">
          <label className="block text-xs font-medium text-zinc-400 mb-1.5">Имя пользователя</label>
          <input type="text" value={form.username} onChange={set("username")} required
            className={inputCls} style={inputStyle} placeholder="batyr_chess" />
        </div>
        <div className="col-span-2">
          <label className="block text-xs font-medium text-zinc-400 mb-1.5">Email</label>
          <input type="email" value={form.email} onChange={set("email")} required
            className={inputCls} style={inputStyle} placeholder="your@email.com" />
        </div>
        <div className="col-span-2">
          <label className="block text-xs font-medium text-zinc-400 mb-1.5">Город</label>
          <select value={form.city} onChange={set("city")}
            className={inputCls} style={inputStyle}>
            {CITIES.map(c => <option key={c.value} value={c.value} style={{ backgroundColor: "#0d1117" }}>{c.label}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-zinc-400 mb-1.5">Пароль</label>
          <input type="password" value={form.password} onChange={set("password")} required
            className={inputCls} style={inputStyle} placeholder="Мин. 8 символов" />
        </div>
        <div>
          <label className="block text-xs font-medium text-zinc-400 mb-1.5">Подтверждение</label>
          <input type="password" value={form.password2} onChange={set("password2")} required
            className={inputCls} style={inputStyle} placeholder="••••••••" />
        </div>
      </div>

      {error && (
        <p className="text-red-400 text-xs bg-red-400/10 border border-red-400/20 rounded-lg px-3 py-2">{error}</p>
      )}

      <button type="submit" disabled={loading}
        className="w-full py-3 rounded-xl font-bold text-white transition-all hover:opacity-90 disabled:opacity-50"
        style={{ background: "linear-gradient(135deg,#D4AF37,#b8962e)" }}>
        {loading ? "Создание аккаунта..." : "Создать аккаунт →"}
      </button>

      <p className="text-zinc-600 text-xs text-center">
        Начни путь от Номада до Великого Кагана
      </p>
    </form>
  );
}
