import { useState, useEffect, useRef } from "react";
import Icon from "@/components/ui/icon";

type TabId = "keywords" | "meta" | "monitoring" | "ai" | "reports" | "settings";

const TABS: { id: TabId; label: string; icon: string; color: string }[] = [
  { id: "keywords", label: "Ключевые слова", icon: "Search", color: "#22f5a0" },
  { id: "meta", label: "Мета-теги и контент", icon: "FileText", color: "#38bdf8" },
  { id: "monitoring", label: "Мониторинг", icon: "BarChart3", color: "#a855f7" },
  { id: "ai", label: "ИИ-рекомендации", icon: "Sparkles", color: "#fb923c" },
  { id: "reports", label: "Отчёты", icon: "PieChart", color: "#f43f5e" },
  { id: "settings", label: "Настройки", icon: "Settings2", color: "#facc15" },
];

const SEO_API_URL = "https://functions.poehali.dev/ed59248c-f917-4d0f-b7ee-19b763ea4e61";

const KEYWORDS_DATA = [
  { kw: "купить квартиру москва", pos: 3, prev: 7, vol: 42000, diff: 62 },
  { kw: "аренда офиса центр", pos: 8, prev: 15, vol: 18500, diff: 44 },
  { kw: "недвижимость онлайн", pos: 12, prev: 11, vol: 9800, diff: 51 },
  { kw: "коммерческая недвижимость", pos: 5, prev: 9, vol: 27300, diff: 58 },
  { kw: "снять склад подмосковье", pos: 1, prev: 2, vol: 7200, diff: 33 },
  { kw: "новостройки 2025", pos: 18, prev: 24, vol: 54000, diff: 71 },
];

const META_PAGES = [
  { url: "/catalog", title: "Каталог квартир | Лучшие предложения 2025", desc: "", score: 45 },
  { url: "/about", title: "О компании", desc: "Мы работаем с 2010 года на рынке недвижимости.", score: 72 },
  { url: "/contacts", title: "", desc: "", score: 18 },
  { url: "/blog/kak-kupit", title: "Как купить квартиру в ипотеку: полное руководство", desc: "Пошаговая инструкция по оформлению ипотеки в 2025 году. Банки, документы, нюансы.", score: 91 },
];

const AI_TIPS = [
  {
    priority: "критично",
    color: "#f43f5e",
    bg: "rgba(244,63,94,0.08)",
    border: "rgba(244,63,94,0.2)",
    icon: "AlertCircle",
    title: "Отсутствует meta description на 14 страницах",
    desc: "Поисковики генерируют сниппеты автоматически — это снижает CTR на 23-40%. ИИ готов сгенерировать описания.",
    action: "Сгенерировать всё"
  },
  {
    priority: "важно",
    color: "#fb923c",
    bg: "rgba(251,146,60,0.08)",
    border: "rgba(251,146,60,0.2)",
    icon: "TrendingUp",
    title: "3 страницы могут войти в ТОП-3 при доработке",
    desc: "Небольшое расширение контента на /catalog, /mortgage, /faq поднимет позиции по кластерам с высокой конкуренцией.",
    action: "Показать страницы"
  },
  {
    priority: "улучшение",
    color: "#22f5a0",
    bg: "rgba(34,245,160,0.08)",
    border: "rgba(34,245,160,0.2)",
    icon: "Link",
    title: "Внутренняя перелинковка ниже нормы",
    desc: "Среднее число внутренних ссылок: 2.1. Рекомендуется 5-7. ИИ предложит анкоры и целевые страницы.",
    action: "Анализировать"
  },
  {
    priority: "улучшение",
    color: "#38bdf8",
    bg: "rgba(56,189,248,0.08)",
    border: "rgba(56,189,248,0.2)",
    icon: "Image",
    title: "Alt-теги у изображений заполнены только на 31%",
    desc: "238 из 768 картинок не имеют alt-описания — это упущенный трафик из Google Images.",
    action: "Заполнить с ИИ"
  },
];

const REPORTS = [
  { name: "Еженедельный SEO-отчёт", date: "28 мая 2025", size: "2.4 MB", type: "PDF" },
  { name: "Анализ позиций — май 2025", date: "01 мая 2025", size: "1.8 MB", type: "XLSX" },
  { name: "Технический аудит сайта", date: "15 апр 2025", size: "4.1 MB", type: "PDF" },
  { name: "Конкурентный анализ Q1", date: "01 апр 2025", size: "3.3 MB", type: "PDF" },
];

function AnimatedNumber({ target, suffix = "" }: { target: number; suffix?: string }) {
  const [val, setVal] = useState(0);
  const ref = useRef(false);
  useEffect(() => {
    if (ref.current) return;
    ref.current = true;
    const step = target / 60;
    let cur = 0;
    const timer = setInterval(() => {
      cur += step;
      if (cur >= target) { setVal(target); clearInterval(timer); }
      else setVal(Math.floor(cur));
    }, 16);
    return () => clearInterval(timer);
  }, [target]);
  return <span>{val.toLocaleString("ru")}{suffix}</span>;
}

function ScoreRing({ score, size = 64 }: { score: number; size?: number }) {
  const r = (size - 10) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (score / 100) * circ;
  const color = score >= 80 ? "#22f5a0" : score >= 50 ? "#fb923c" : "#f43f5e";
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={5} />
      <circle
        cx={size/2} cy={size/2} r={r} fill="none"
        stroke={color} strokeWidth={5}
        strokeDasharray={circ}
        strokeDashoffset={offset}
        strokeLinecap="round"
        style={{ transform: "rotate(-90deg)", transformOrigin: "center", transition: "stroke-dashoffset 1s ease" }}
      />
      <text x="50%" y="50%" textAnchor="middle" dominantBaseline="central" fill={color} fontSize={size / 4} fontWeight="700" fontFamily="Golos Text">
        {score}
      </text>
    </svg>
  );
}

interface AICluster {
  name: string;
  keywords: string[];
  volume_estimate: string;
  competition: string;
}

interface AIKeywordsResult {
  clusters: AICluster[];
  top_opportunities: string[];
  summary: string;
}

function KeywordsTab() {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [aiResult, setAiResult] = useState<AIKeywordsResult | null>(null);
  const [aiError, setAiError] = useState("");
  const [topic, setTopic] = useState("недвижимость москва");

  const filtered = KEYWORDS_DATA.filter(k => k.kw.includes(query.toLowerCase()));

  const handleAI = async () => {
    setLoading(true);
    setAiResult(null);
    setAiError("");
    try {
      const resp = await fetch(SEO_API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode: "keywords", topic }),
      });
      const json = await resp.json();
      if (json.ok) {
        setAiResult(json.data as AIKeywordsResult);
      } else {
        setAiError(json.error || "Ошибка генерации");
      }
    } catch {
      setAiError("Не удалось подключиться к ИИ");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-fade-in space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Отслеживается", val: 847, suf: "", icon: "Target", color: "#22f5a0" },
          { label: "В ТОП-10", val: 312, suf: "", icon: "TrendingUp", color: "#38bdf8" },
          { label: "Новых запросов", val: 48, suf: "", icon: "Plus", color: "#a855f7" },
          { label: "Средняя позиция", val: 8, suf: ".4", icon: "BarChart2", color: "#fb923c" },
        ].map((s, i) => (
          <div key={i} className="glass-card rounded-2xl p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-white/40 font-medium uppercase tracking-wider">{s.label}</span>
              <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: `${s.color}18` }}>
                <Icon name={s.icon } size={16} style={{ color: s.color }} />
              </div>
            </div>
            <div className="text-3xl font-montserrat font-bold" style={{ color: s.color }}>
              <AnimatedNumber target={s.val} suffix={s.suf} />
            </div>
          </div>
        ))}
      </div>

      <div className="glass rounded-2xl p-5">
        <div className="flex flex-col sm:flex-row gap-3 mb-5">
          <div className="relative flex-1">
            <Icon name="Search" size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
            <input
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Поиск по ключевым словам..."
              className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm outline-none focus:border-[#22f5a0]/40 transition-colors text-white placeholder:text-white/30"
            />
          </div>
          <div className="flex gap-2">
            <input
              value={topic}
              onChange={e => setTopic(e.target.value)}
              placeholder="Тематика сайта..."
              className="bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-[#a855f7]/40 transition-colors text-white placeholder:text-white/30 w-40"
            />
            <button onClick={handleAI} disabled={loading} className="btn-neon px-5 py-2.5 rounded-xl text-sm flex items-center gap-2 whitespace-nowrap disabled:opacity-60">
              <Icon name="Sparkles" size={15} />
              {loading ? "Анализирует..." : "ИИ-кластеры"}
            </button>
          </div>
        </div>

        {aiError && (
          <div className="mb-4 p-3 rounded-xl border text-sm" style={{ background: "rgba(244,63,94,0.08)", borderColor: "rgba(244,63,94,0.2)", color: "#f43f5e" }}>
            {aiError}
          </div>
        )}

        {loading && (
          <div className="mb-4 space-y-2">
            {[80, 60, 70, 50, 65].map((w, i) => (
              <div key={i} className="h-3 rounded-lg shimmer" style={{ width: `${w}%`, background: "rgba(255,255,255,0.08)" }} />
            ))}
          </div>
        )}

        {aiResult && (
          <div className="mb-5 space-y-3 animate-fade-in">
            <div className="p-4 rounded-xl border" style={{ background: "rgba(168,85,247,0.08)", borderColor: "rgba(168,85,247,0.2)" }}>
              <div className="flex gap-2 mb-3">
                <Icon name="Sparkles" size={14} className="mt-0.5 flex-shrink-0" style={{ color: "#a855f7" }} />
                <p className="text-sm text-white/80 leading-relaxed">{aiResult.summary}</p>
              </div>
              {aiResult.top_opportunities?.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  <span className="text-xs text-white/40">ТОП возможности:</span>
                  {aiResult.top_opportunities.map((kw, i) => (
                    <span key={i} className="tag-badge">{kw}</span>
                  ))}
                </div>
              )}
            </div>
            {aiResult.clusters?.map((cl, i) => (
              <div key={i} className="p-3 rounded-xl border" style={{ background: "rgba(34,245,160,0.04)", borderColor: "rgba(34,245,160,0.12)" }}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold" style={{ color: "#22f5a0" }}>{cl.name}</span>
                  <div className="flex gap-2 text-xs text-white/40">
                    <span>📊 {cl.volume_estimate}</span>
                    <span>⚡ {cl.competition}</span>
                  </div>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {cl.keywords?.map((kw, j) => (
                    <span key={j} className="text-xs px-2 py-0.5 rounded-full" style={{ background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.6)" }}>{kw}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-white/30 text-xs uppercase tracking-wider">
                <th className="text-left pb-3 pr-4">Ключевое слово</th>
                <th className="text-center pb-3 pr-4">Позиция</th>
                <th className="text-center pb-3 pr-4">Изм.</th>
                <th className="text-right pb-3 pr-4">Объём</th>
                <th className="text-right pb-3">Сложность</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filtered.map((row, i) => {
                const diff = row.prev - row.pos;
                return (
                  <tr key={i} className="hover:bg-white/3 transition-colors">
                    <td className="py-3 pr-4 font-medium text-white/80">{row.kw}</td>
                    <td className="py-3 pr-4 text-center">
                      <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg font-bold text-sm" style={{ background: row.pos <= 3 ? "rgba(34,245,160,0.15)" : row.pos <= 10 ? "rgba(56,189,248,0.15)" : "rgba(255,255,255,0.06)", color: row.pos <= 3 ? "#22f5a0" : row.pos <= 10 ? "#38bdf8" : "#ffffff80" }}>
                        {row.pos}
                      </span>
                    </td>
                    <td className="py-3 pr-4 text-center">
                      <span className="flex items-center justify-center gap-1 text-xs font-semibold" style={{ color: diff > 0 ? "#22f5a0" : diff < 0 ? "#f43f5e" : "#ffffff50" }}>
                        <Icon name={diff > 0 ? "TrendingUp" : diff < 0 ? "TrendingDown" : "Minus"} size={12} />
                        {Math.abs(diff) > 0 ? Math.abs(diff) : "—"}
                      </span>
                    </td>
                    <td className="py-3 pr-4 text-right text-white/60">{row.vol.toLocaleString("ru")}</td>
                    <td className="py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <div className="w-16 h-1.5 rounded-full bg-white/10 overflow-hidden">
                          <div className="h-full rounded-full progress-bar" style={{ width: `${row.diff}%` }} />
                        </div>
                        <span className="text-xs text-white/40 w-6">{row.diff}</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

interface MetaResult {
  title: string;
  description: string;
  keywords: string;
  score: number;
  tips: string[];
}

function MetaTab() {
  const [selected, setSelected] = useState<number | null>(null);
  const [generating, setGenerating] = useState(false);
  const [metaResult, setMetaResult] = useState<MetaResult | null>(null);
  const [metaError, setMetaError] = useState("");

  const handleGenerate = async (i: number, page?: { url: string; title: string; desc: string }) => {
    setSelected(i);
    setGenerating(true);
    setMetaResult(null);
    setMetaError("");
    const p = page || META_PAGES[i] || { url: "/", title: "", desc: "" };
    try {
      const resp = await fetch(SEO_API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode: "meta", url: p.url, title: p.title, description: p.desc }),
      });
      const json = await resp.json();
      if (json.ok) {
        setMetaResult(json.data as MetaResult);
      } else {
        setMetaError(json.error || "Ошибка генерации");
      }
    } catch {
      setMetaError("Не удалось подключиться к ИИ");
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="animate-fade-in space-y-4">
      <div className="glass rounded-2xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-white/80">Страницы сайта</h3>
          <button onClick={() => handleGenerate(99)} className="btn-neon px-4 py-2 rounded-xl text-xs flex items-center gap-1.5">
            <Icon name="Sparkles" size={13} />
            Сгенерировать всё
          </button>
        </div>
        <div className="space-y-3">
          {META_PAGES.map((page, i) => (
            <div
              key={i}
              onClick={() => setSelected(selected === i ? null : i)}
              className="p-4 rounded-xl border cursor-pointer transition-all"
              style={{
                background: selected === i ? "rgba(34,245,160,0.05)" : "rgba(255,255,255,0.03)",
                borderColor: selected === i ? "rgba(34,245,160,0.3)" : "rgba(255,255,255,0.07)"
              }}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <code className="text-xs text-white/40 bg-white/5 px-2 py-0.5 rounded">{page.url}</code>
                    <ScoreRing score={page.score} size={36} />
                  </div>
                  <p className="text-sm font-medium truncate text-white/80">
                    {page.title || <span className="text-white/25 italic">Заголовок отсутствует</span>}
                  </p>
                  <p className="text-xs text-white/40 truncate mt-0.5">
                    {page.desc || <span className="italic">Описание отсутствует</span>}
                  </p>
                </div>
                <button
                  onClick={e => { e.stopPropagation(); handleGenerate(i); }}
                  className="flex-shrink-0 btn-ghost-neon px-3 py-1.5 rounded-lg text-xs flex items-center gap-1"
                >
                  <Icon name="Wand2" size={12} />
                  ИИ
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {(metaResult || generating || metaError) && (
        <div className="glass rounded-2xl p-5 animate-fade-in">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center ai-pulse" style={{ background: "rgba(168,85,247,0.2)" }}>
              <Icon name="Sparkles" size={14} style={{ color: "#a855f7" }} />
            </div>
            <span className="text-sm font-semibold" style={{ color: "#a855f7" }}>
              {generating ? "ИИ генерирует мета-теги..." : "Результат от ИИ"}
            </span>
          </div>

          {metaError && (
            <div className="p-3 rounded-xl text-sm" style={{ background: "rgba(244,63,94,0.1)", color: "#f43f5e" }}>{metaError}</div>
          )}

          {generating && (
            <div className="space-y-3">
              {[70, 90, 55, 40].map((w, i) => (
                <div key={i} className="h-4 rounded-lg shimmer" style={{ width: `${w}%`, background: "rgba(255,255,255,0.08)" }} />
              ))}
            </div>
          )}

          {metaResult && !generating && (
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs text-white/40 uppercase tracking-wider">Title тег</label>
                  <span className="text-xs font-semibold" style={{ color: metaResult.title.length <= 60 ? "#22f5a0" : "#fb923c" }}>
                    {metaResult.title.length} / 60
                  </span>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-xl p-3 text-sm font-medium" style={{ color: "#22f5a0" }}>{metaResult.title}</div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs text-white/40 uppercase tracking-wider">Meta Description</label>
                  <span className="text-xs font-semibold" style={{ color: metaResult.description.length <= 160 ? "#22f5a0" : "#fb923c" }}>
                    {metaResult.description.length} / 160
                  </span>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-xl p-3 text-sm text-white/70 leading-relaxed">{metaResult.description}</div>
              </div>
              {metaResult.keywords && (
                <div>
                  <label className="text-xs text-white/40 uppercase tracking-wider mb-1.5 block">Ключевые слова</label>
                  <div className="flex flex-wrap gap-1.5">
                    {metaResult.keywords.split(",").map((kw, i) => (
                      <span key={i} className="tag-badge">{kw.trim()}</span>
                    ))}
                  </div>
                </div>
              )}
              {metaResult.score && (
                <div className="flex items-center gap-3 p-3 rounded-xl" style={{ background: "rgba(34,245,160,0.06)" }}>
                  <ScoreRing score={metaResult.score} size={48} />
                  <div>
                    <div className="text-sm font-semibold text-white/80">SEO Score после оптимизации</div>
                    {metaResult.tips?.length > 0 && (
                      <ul className="mt-1 space-y-0.5">
                        {metaResult.tips.map((tip, i) => (
                          <li key={i} className="text-xs text-white/45 flex gap-1.5"><span style={{ color: "#22f5a0" }}>•</span>{tip}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              )}
              <div className="flex gap-2 pt-1">
                <button className="btn-neon px-4 py-2 rounded-xl text-sm flex items-center gap-1.5">
                  <Icon name="Check" size={14} />
                  Применить
                </button>
                <button
                  onClick={() => selected !== null && handleGenerate(selected, META_PAGES[selected])}
                  className="btn-ghost-neon px-4 py-2 rounded-xl text-sm"
                >
                  Перегенерировать
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function MonitoringTab() {
  const metrics = [
    { label: "Видимость сайта", val: 73, color: "#22f5a0", change: "+5.2%" },
    { label: "CTR (ср.)", val: 4, color: "#38bdf8", change: "+0.3%", suffix: "%" },
    { label: "Показы / день", val: 12400, color: "#a855f7", change: "+1.2K" },
    { label: "Клики / день", val: 595, color: "#fb923c", change: "+47" },
  ];

  const weekData = [42, 58, 51, 73, 65, 80, 73];
  const maxVal = Math.max(...weekData);

  return (
    <div className="animate-fade-in space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {metrics.map((m, i) => (
          <div key={i} className="glass-card rounded-2xl p-5">
            <div className="text-xs text-white/40 uppercase tracking-wider mb-3">{m.label}</div>
            <div className="text-3xl font-montserrat font-bold mb-1" style={{ color: m.color }}>
              <AnimatedNumber target={m.val} suffix={m.suffix || ""} />
            </div>
            <div className="text-xs font-semibold" style={{ color: "#22f5a0" }}>{m.change} за неделю</div>
          </div>
        ))}
      </div>

      <div className="glass rounded-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-semibold">Видимость за 7 дней</h3>
          <span className="tag-badge">Обновлено сейчас</span>
        </div>
        <div className="flex items-end gap-3 h-36">
          {weekData.map((v, i) => {
            const days = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];
            const h = (v / maxVal) * 100;
            const isToday = i === 6;
            return (
              <div key={i} className="flex-1 flex flex-col items-center gap-2">
                <div className="text-xs text-white/40 font-medium">{v}%</div>
                <div className="w-full rounded-t-lg relative overflow-hidden" style={{ height: `${h}%`, minHeight: 8, background: isToday ? "linear-gradient(0deg,#22f5a0,#38bdf8)" : "rgba(34,245,160,0.2)", transition: "height 1s ease", boxShadow: isToday ? "0 0 20px rgba(34,245,160,0.4)" : "none" }}>
                  {isToday && <div className="absolute inset-0 shimmer" />}
                </div>
                <div className="text-xs text-white/30">{days[i]}</div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="glass rounded-2xl p-5">
        <h3 className="font-semibold mb-4">Конкуренты в ТОП-10</h3>
        <div className="space-y-3">
          {[
            { domain: "cian.ru", vis: 94, color: "#f43f5e" },
            { domain: "avito.ru/nedvizhimost", vis: 88, color: "#fb923c" },
            { domain: "yoursite.ru", vis: 73, color: "#22f5a0", isYou: true },
            { domain: "bn.ru", vis: 61, color: "#38bdf8" },
            { domain: "realty.yandex.ru", vis: 55, color: "#a855f7" },
          ].map((c, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="w-36 text-sm truncate" style={{ color: c.isYou ? "#22f5a0" : "rgba(255,255,255,0.6)" }}>
                {c.domain} {c.isYou && <span className="text-xs">(вы)</span>}
              </div>
              <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.08)" }}>
                <div className="h-full rounded-full transition-all" style={{ width: `${c.vis}%`, background: c.color, boxShadow: c.isYou ? `0 0 8px ${c.color}80` : "none" }} />
              </div>
              <div className="w-10 text-right text-sm font-bold" style={{ color: c.color }}>{c.vis}%</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function AITab() {
  return (
    <div className="animate-fade-in space-y-4">
      <div className="glass rounded-2xl p-5 mb-2" style={{ background: "linear-gradient(135deg, rgba(168,85,247,0.1), rgba(34,245,160,0.05))", borderColor: "rgba(168,85,247,0.2)" }}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl flex items-center justify-center ai-pulse" style={{ background: "rgba(168,85,247,0.2)" }}>
            <Icon name="Brain" size={20} style={{ color: "#a855f7" }} />
          </div>
          <div>
            <div className="font-semibold text-white">ИИ-ассистент SEO</div>
            <div className="text-xs text-white/40">Проанализировал сайт 2 часа назад · Найдено 7 проблем</div>
          </div>
          <div className="ml-auto">
            <span className="tag-badge" style={{ background: "rgba(168,85,247,0.15)", borderColor: "rgba(168,85,247,0.3)", color: "#a855f7" }}>Онлайн</span>
          </div>
        </div>
      </div>

      {AI_TIPS.map((tip, i) => (
        <div
          key={i}
          className="rounded-2xl p-5 border animate-fade-in"
          style={{ background: tip.bg, borderColor: tip.border, animationDelay: `${i * 0.1}s` }}
        >
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5" style={{ background: `${tip.color}20` }}>
              <Icon name={tip.icon } size={16} style={{ color: tip.color }} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-1.5">
                <span className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded-full" style={{ background: `${tip.color}20`, color: tip.color }}>
                  {tip.priority}
                </span>
                <span className="font-semibold text-sm text-white/90">{tip.title}</span>
              </div>
              <p className="text-sm text-white/55 leading-relaxed mb-3">{tip.desc}</p>
              <button className="px-4 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all hover:opacity-90" style={{ background: `${tip.color}20`, color: tip.color, border: `1px solid ${tip.color}30` }}>
                <Icon name="Sparkles" size={12} />
                {tip.action}
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function ReportsTab() {
  return (
    <div className="animate-fade-in space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: "Позиции выросли", val: 127, icon: "TrendingUp", color: "#22f5a0" },
          { label: "Потеряли позиции", val: 34, icon: "TrendingDown", color: "#f43f5e" },
          { label: "Новых в ТОП-100", val: 58, icon: "Target", color: "#a855f7" },
        ].map((s, i) => (
          <div key={i} className="glass-card rounded-2xl p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0" style={{ background: `${s.color}18` }}>
              <Icon name={s.icon } size={22} style={{ color: s.color }} />
            </div>
            <div>
              <div className="text-2xl font-montserrat font-bold" style={{ color: s.color }}><AnimatedNumber target={s.val} /></div>
              <div className="text-xs text-white/40">{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="glass rounded-2xl p-5">
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-semibold">Автоматические отчёты</h3>
          <button className="btn-neon px-4 py-2 rounded-xl text-sm flex items-center gap-1.5">
            <Icon name="Plus" size={14} />
            Создать отчёт
          </button>
        </div>
        <div className="space-y-2">
          {REPORTS.map((r, i) => (
            <div key={i} className="flex items-center gap-4 p-3.5 rounded-xl hover:bg-white/4 transition-colors cursor-pointer border border-transparent hover:border-white/8">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: r.type === "PDF" ? "rgba(244,63,94,0.12)" : "rgba(34,245,160,0.12)" }}>
                <Icon name={r.type === "PDF" ? "FileText" : "FileSpreadsheet"} size={18} style={{ color: r.type === "PDF" ? "#f43f5e" : "#22f5a0" }} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-white/80">{r.name}</div>
                <div className="text-xs text-white/35">{r.date} · {r.size}</div>
              </div>
              <span className="text-xs font-bold px-2 py-1 rounded-lg" style={{ background: r.type === "PDF" ? "rgba(244,63,94,0.12)" : "rgba(34,245,160,0.12)", color: r.type === "PDF" ? "#f43f5e" : "#22f5a0" }}>{r.type}</span>
              <button className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-white/10 transition-colors">
                <Icon name="Download" size={15} className="text-white/40" />
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="glass rounded-2xl p-5">
        <h3 className="font-semibold mb-4">Расписание автоотчётов</h3>
        <div className="space-y-3">
          {[
            { name: "Еженедельный", time: "Понедельник, 09:00", active: true },
            { name: "Ежемесячный", time: "1-е число, 10:00", active: true },
            { name: "После аудита", time: "По запросу", active: false },
          ].map((s, i) => (
            <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-white/3">
              <div>
                <div className="text-sm font-medium text-white/80">{s.name}</div>
                <div className="text-xs text-white/35">{s.time}</div>
              </div>
              <div className="relative w-10 h-5 rounded-full cursor-pointer" style={{ background: s.active ? "#22f5a0" : "rgba(255,255,255,0.1)" }}>
                <div className="absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm" style={{ left: s.active ? "22px" : "2px" }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function SettingsTab() {
  return (
    <div className="animate-fade-in space-y-5">
      {[
        {
          title: "Основные параметры",
          icon: "Globe",
          color: "#22f5a0",
          fields: [
            { label: "URL сайта", val: "https://yoursite.ru" },
            { label: "Регион продвижения", val: "Москва и МО" },
            { label: "Поисковая система", val: "Яндекс + Google" },
          ]
        },
        {
          title: "Настройки ИИ",
          icon: "Brain",
          color: "#a855f7",
          fields: [
            { label: "OpenAI API ключ", val: "sk-•••••••••••••••••••••", secret: true },
            { label: "Модель ИИ", val: "GPT-4o" },
            { label: "Язык генерации", val: "Русский" },
          ]
        },
        {
          title: "Уведомления",
          icon: "Bell",
          color: "#38bdf8",
          fields: [
            { label: "Email для отчётов", val: "admin@yoursite.ru" },
            { label: "Telegram Bot Token", val: "" },
          ]
        }
      ].map((section, si) => (
        <div key={si} className="glass rounded-2xl p-5">
          <div className="flex items-center gap-2.5 mb-5">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: `${section.color}18` }}>
              <Icon name={section.icon } size={16} style={{ color: section.color }} />
            </div>
            <h3 className="font-semibold">{section.title}</h3>
          </div>
          <div className="space-y-4">
            {section.fields.map((f, fi) => (
              <div key={fi}>
                <label className="text-xs text-white/40 uppercase tracking-wider mb-1.5 block">{f.label}</label>
                <input
                  type={f.secret ? "password" : "text"}
                  defaultValue={f.val}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#22f5a0]/40 transition-colors text-white placeholder:text-white/25"
                />
              </div>
            ))}
          </div>
        </div>
      ))}

      <div className="flex gap-3">
        <button className="btn-neon px-6 py-2.5 rounded-xl text-sm flex items-center gap-2">
          <Icon name="Save" size={15} />
          Сохранить настройки
        </button>
        <button className="btn-ghost-neon px-5 py-2.5 rounded-xl text-sm">Сбросить</button>
      </div>
    </div>
  );
}

const TAB_COMPONENTS: Record<TabId, React.FC> = {
  keywords: KeywordsTab,
  meta: MetaTab,
  monitoring: MonitoringTab,
  ai: AITab,
  reports: ReportsTab,
  settings: SettingsTab,
};

export default function Index() {
  const [activeTab, setActiveTab] = useState<TabId>("keywords");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const ActiveComponent = TAB_COMPONENTS[activeTab];

  return (
    <div className="min-h-screen grid-bg font-golos">
      <div className="flex min-h-screen">
        <aside
          className={`fixed inset-y-0 left-0 z-50 w-64 flex flex-col transition-transform duration-300 md:static md:translate-x-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}
          style={{ background: "rgba(8,12,22,0.97)", borderRight: "1px solid rgba(255,255,255,0.07)", backdropFilter: "blur(20px)" }}
        >
          <div className="p-6 pb-4 border-b border-white/6">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center glow-green" style={{ background: "linear-gradient(135deg,#22f5a0,#38bdf8)" }}>
                <Icon name="Zap" size={18} style={{ color: "#0a1020" }} />
              </div>
              <div>
                <div className="font-montserrat font-bold text-sm gradient-text">SEO AI Module</div>
                <div className="text-xs text-white/30">для Битрикс</div>
              </div>
            </div>
          </div>

          <div className="mx-4 my-4 p-4 rounded-2xl border" style={{ background: "rgba(34,245,160,0.05)", borderColor: "rgba(34,245,160,0.15)" }}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-white/40 uppercase tracking-wider">SEO Score</span>
              <span className="text-xs font-semibold text-white/40">73 / 100</span>
            </div>
            <div className="w-full h-2 rounded-full bg-white/8 overflow-hidden">
              <div className="progress-bar h-full rounded-full" style={{ width: "73%" }} />
            </div>
            <p className="text-xs text-white/35 mt-2">Хорошо — есть точки роста</p>
          </div>

          <nav className="flex-1 px-3 space-y-1 overflow-y-auto scrollbar-thin">
            {TABS.map(tab => (
              <button
                key={tab.id}
                onClick={() => { setActiveTab(tab.id); setSidebarOpen(false); }}
                className={`nav-item w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${activeTab === tab.id ? "active" : "text-white/50"}`}
              >
                <Icon name={tab.icon } size={17} style={{ color: activeTab === tab.id ? tab.color : undefined }} />
                {tab.label}
                {tab.id === "ai" && (
                  <span className="ml-auto text-xs px-1.5 py-0.5 rounded-full font-bold" style={{ background: "rgba(251,146,60,0.2)", color: "#fb923c" }}>7</span>
                )}
              </button>
            ))}
          </nav>

          <div className="p-4 border-t border-white/6">
            <div className="flex items-center gap-2 px-2">
              <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold" style={{ background: "linear-gradient(135deg,#a855f7,#38bdf8)", color: "#fff" }}>А</div>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-medium truncate text-white/80">Администратор</div>
                <div className="text-xs text-white/30">Битрикс Admin</div>
              </div>
              <Icon name="LogOut" size={14} className="text-white/25 cursor-pointer hover:text-white/60 transition-colors" />
            </div>
          </div>
        </aside>

        {sidebarOpen && (
          <div className="fixed inset-0 bg-black/60 z-40 md:hidden" onClick={() => setSidebarOpen(false)} />
        )}

        <main className="flex-1 flex flex-col min-w-0">
          <header className="sticky top-0 z-30 flex items-center justify-between px-6 py-4 border-b border-white/6" style={{ background: "rgba(8,12,22,0.85)", backdropFilter: "blur(20px)" }}>
            <div className="flex items-center gap-3">
              <button onClick={() => setSidebarOpen(true)} className="md:hidden w-9 h-9 rounded-xl flex items-center justify-center hover:bg-white/8 transition-colors">
                <Icon name="Menu" size={18} className="text-white/60" />
              </button>
              <div>
                <h1 className="font-montserrat font-bold text-lg text-white">
                  {TABS.find(t => t.id === activeTab)?.label}
                </h1>
                <p className="text-xs text-white/30">Обновлено: только что</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button className="w-9 h-9 rounded-xl flex items-center justify-center hover:bg-white/8 transition-colors relative">
                <Icon name="Bell" size={17} className="text-white/50" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full" style={{ background: "#fb923c" }} />
              </button>
              <button className="btn-neon px-4 py-2 rounded-xl text-sm flex items-center gap-1.5">
                <Icon name="RefreshCw" size={14} />
                <span className="hidden sm:inline">Обновить данные</span>
              </button>
            </div>
          </header>

          <div className="flex-1 p-6 overflow-y-auto scrollbar-thin">
            <ActiveComponent key={activeTab} />
          </div>
        </main>
      </div>
    </div>
  );
}