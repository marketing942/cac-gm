import { useState, useMemo, useEffect, useRef } from "react";

// ════════════════════════════════════════════════════════════
// GM EDUCAÇÃO — CONTROLE DE CAC 2026
// Fonte: Aba "CAC" da planilha [2026] Meta Anual _ GM Educação
// ════════════════════════════════════════════════════════════

const MO = ["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"];

const INITIAL = {
  cppem: {
    maxCAC:   [180, 180, 210, 195, 180, 180, 225, 210, 180, 180, 150, 150],
    custoMkt: [7011, 13853, 18202, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    custoCom: [5899, 9150, 12924, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    clientes: [177, 122, 188, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  },
  unicv: {
    maxCAC:   [700, 840, 1050, 1015, 910, 700, 630, 1400, 840, 910, 1610, 770],
    custoMkt: [5153, 6675, 8521, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    custoCom: [5010, 7800, 11115, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    clientes: [220, 121, 168, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  },
};

const fmt = v => v == null ? "—" : "R$ " + Math.round(v).toLocaleString("pt-BR");
const fmtK = v => v >= 1000 ? `R$ ${(v/1000).toFixed(1).replace(".",",")}k` : fmt(v);
const pct = v => v == null ? "—" : (v > 0 ? "+" : "") + (v * 100).toFixed(0) + "%";

// ── Editable input ──
function Input({ value, onChange, w = 82 }) {
  const [ed, setEd] = useState(false);
  const [tmp, setTmp] = useState(String(value));
  const ref = useRef(null);
  useEffect(() => { setTmp(String(value)); }, [value]);
  useEffect(() => { if (ed && ref.current) ref.current.select(); }, [ed]);

  if (ed) return (
    <input ref={ref} autoFocus type="number" value={tmp}
      onChange={e => setTmp(e.target.value)}
      onBlur={() => { setEd(false); onChange(Number(tmp) || 0); }}
      onKeyDown={e => e.key === "Enter" && (setEd(false), onChange(Number(tmp) || 0))}
      style={{
        width: w, background: "rgba(251,191,36,0.12)", border: "1.5px solid #fbbf24",
        borderRadius: 5, padding: "5px 8px", color: "#fafafa", fontSize: 13,
        textAlign: "right", outline: "none", fontFamily: "inherit",
        fontFeatureSettings: "'tnum'",
      }}
    />
  );

  return (
    <div onClick={() => setEd(true)} title="Clique para editar" style={{
      width: w, padding: "5px 8px", borderRadius: 5, textAlign: "right",
      cursor: "pointer", fontSize: 13, color: "#fafafa",
      background: "rgba(251,191,36,0.06)", border: "1px dashed rgba(251,191,36,0.25)",
      fontFeatureSettings: "'tnum'", transition: "border-color .2s",
    }}>
      {value ? value.toLocaleString("pt-BR") : "0"}
    </div>
  );
}

// ── Badge ──
function Tag({ children, color, bg }) {
  return <span style={{
    display: "inline-flex", alignItems: "center", padding: "2px 9px",
    borderRadius: 20, fontSize: 11, fontWeight: 700, letterSpacing: .3,
    color, background: bg, whiteSpace: "nowrap",
  }}>{children}</span>;
}

// ── Bar chart column ──
function BarCol({ maxV, realV, ceiling, label, idx, total }) {
  const h = 160;
  const top = ceiling || 1;
  const mH = Math.min((maxV / top) * h, h);
  const rH = realV != null ? Math.min((realV / top) * h, h) : 0;
  const over = realV != null && realV > maxV;
  const delay = idx * 60;
  return (
    <div style={{
      display: "flex", flexDirection: "column", alignItems: "center", flex: 1,
      minWidth: 42, animation: `fadeSlideUp .5s ease ${delay}ms both`,
    }}>
      <div style={{ fontSize: 10, color: over ? "#f87171" : realV ? "#a3e635" : "#52525b",
        fontWeight: 700, marginBottom: 4, fontFeatureSettings: "'tnum'", height: 14,
      }}>
        {realV != null ? fmtK(realV) : ""}
      </div>
      <div style={{
        width: "100%", height: h, position: "relative",
        display: "flex", alignItems: "flex-end", justifyContent: "center", gap: 3,
      }}>
        {/* max bar */}
        <div style={{
          width: "40%", height: mH, borderRadius: "4px 4px 2px 2px",
          background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)",
          transition: "height .6s cubic-bezier(.4,0,.2,1)",
        }} />
        {/* real bar */}
        <div style={{
          width: "40%", height: rH || 2, borderRadius: "4px 4px 2px 2px",
          background: over
            ? "linear-gradient(180deg, #f87171 0%, #b91c1c 100%)"
            : realV
              ? "linear-gradient(180deg, #a3e635 0%, #65a30d 100%)"
              : "rgba(255,255,255,0.03)",
          transition: "height .6s cubic-bezier(.4,0,.2,1)",
          boxShadow: realV && !over ? "0 0 12px rgba(163,230,53,0.15)" : over ? "0 0 12px rgba(248,113,113,0.2)" : "none",
        }} />
      </div>
      <div style={{ fontSize: 11, color: "#71717a", marginTop: 6, fontWeight: 600 }}>{label}</div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════
// MAIN
// ════════════════════════════════════════════════════════════
export default function CACDashboard() {
  const [data, setData] = useState(INITIAL);
  const [prod, setProd] = useState("cppem");

  const d = data[prod];

  // computed
  const comp = useMemo(() => {
    const realCAC = d.clientes.map((c, i) =>
      c > 0 ? (d.custoMkt[i] + d.custoCom[i]) / c : null
    );
    const diff = realCAC.map((r, i) =>
      r != null ? (r - d.maxCAC[i]) / d.maxCAC[i] : null
    );
    const active = realCAC.filter(v => v != null);
    const avgCAC = active.length ? active.reduce((a, b) => a + b, 0) / active.length : null;
    const avgMax = d.maxCAC.reduce((a, b) => a + b, 0) / 12;
    const totalCli = d.clientes.reduce((a, b) => a + b, 0);
    const totalMkt = d.custoMkt.reduce((a, b) => a + b, 0);
    const totalCom = d.custoCom.reduce((a, b) => a + b, 0);
    const totalInv = totalMkt + totalCom;
    const overCount = realCAC.filter((r, i) => r != null && r > d.maxCAC[i]).length;
    const okCount = active.length - overCount;
    const ceiling = Math.max(...d.maxCAC, ...active) * 1.1;

    return { realCAC, diff, avgCAC, avgMax, totalCli, totalMkt, totalCom, totalInv, overCount, okCount, ceiling, activeMonths: active.length };
  }, [d]);

  const upd = (field, i, v) => {
    setData(prev => {
      const next = JSON.parse(JSON.stringify(prev));
      next[prod][field][i] = v;
      return next;
    });
  };

  const label = prod === "cppem" ? "CPPEM" : "UNICV";
  const accent = prod === "cppem" ? "#3b82f6" : "#a78bfa";

  return (
    <div style={{
      minHeight: "100vh", background: "#09090b", color: "#fafafa",
      fontFamily: "'Outfit', 'Sora', system-ui, sans-serif",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 5px; height: 5px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #27272a; border-radius: 4px; }
        input[type=number]::-webkit-inner-spin-button { opacity: 0; }
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: .6; }
        }
      `}</style>

      {/* ── HEADER ── */}
      <header style={{
        padding: "20px 28px", display: "flex", alignItems: "center",
        justifyContent: "space-between", flexWrap: "wrap", gap: 16,
        borderBottom: "1px solid #18181b",
        background: "linear-gradient(180deg, rgba(255,255,255,0.015) 0%, transparent 100%)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{
            width: 38, height: 38, borderRadius: 8,
            background: `linear-gradient(135deg, ${accent}, ${accent}88)`,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 13, fontWeight: 900, color: "#fff", letterSpacing: -0.5,
          }}>CAC</div>
          <div>
            <div style={{ fontSize: 17, fontWeight: 800, letterSpacing: -0.5 }}>Controle de CAC</div>
            <div style={{ fontSize: 11, color: "#52525b", fontWeight: 500 }}>GM Educação · 2026</div>
          </div>
        </div>

        {/* Product switch */}
        <div style={{
          display: "flex", background: "#18181b", borderRadius: 8, padding: 3,
          border: "1px solid #27272a",
        }}>
          {["cppem", "unicv"].map(p => (
            <button key={p} onClick={() => setProd(p)} style={{
              padding: "7px 20px", borderRadius: 6, border: "none", cursor: "pointer",
              fontSize: 13, fontWeight: 700, fontFamily: "inherit", letterSpacing: .3,
              background: prod === p ? (p === "cppem" ? "#3b82f6" : "#a78bfa") : "transparent",
              color: prod === p ? "#fff" : "#71717a",
              transition: "all .25s ease",
            }}>
              {p === "cppem" ? "CPPEM" : "UNICV"}
            </button>
          ))}
        </div>
      </header>

      <main style={{ padding: "24px 28px", maxWidth: 1200, margin: "0 auto" }}>

        {/* ── KPI ROW ── */}
        <div style={{
          display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          gap: 12, marginBottom: 28, animation: "fadeIn .4s ease",
        }}>
          {[
            {
              label: "CAC MÉDIO REAL", value: comp.avgCAC != null ? fmt(comp.avgCAC) : "—",
              sub: `Teto médio: ${fmt(comp.avgMax)}`,
              color: comp.avgCAC && comp.avgCAC <= comp.avgMax ? "#a3e635" : "#f87171",
            },
            {
              label: "INVESTIMENTO TOTAL", value: fmtK(comp.totalInv),
              sub: `MKT ${fmtK(comp.totalMkt)} · COM ${fmtK(comp.totalCom)}`,
              color: accent,
            },
            {
              label: "CLIENTES ADQUIRIDOS", value: comp.totalCli.toLocaleString("pt-BR"),
              sub: `${comp.activeMonths} ${comp.activeMonths === 1 ? "mês" : "meses"} preenchidos`,
              color: "#fbbf24",
            },
            {
              label: "STATUS", value: comp.overCount > 0 ? `${comp.overCount} estouro${comp.overCount > 1 ? "s" : ""}` : "Dentro do teto",
              sub: `${comp.okCount} meses OK`,
              color: comp.overCount > 0 ? "#f87171" : "#a3e635",
            },
          ].map((k, i) => (
            <div key={i} style={{
              background: "#111113", borderRadius: 10, padding: "18px 20px",
              border: "1px solid #1c1c1f",
              animation: `fadeSlideUp .45s ease ${i * 70}ms both`,
            }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: "#52525b", letterSpacing: 1.2, textTransform: "uppercase" }}>{k.label}</div>
              <div style={{ fontSize: 26, fontWeight: 900, color: k.color, marginTop: 6, fontFeatureSettings: "'tnum'", letterSpacing: -1 }}>{k.value}</div>
              <div style={{ fontSize: 11, color: "#52525b", marginTop: 4, fontWeight: 500 }}>{k.sub}</div>
            </div>
          ))}
        </div>

        {/* ── CHART ── */}
        <div style={{
          background: "#111113", borderRadius: 12, padding: "24px 20px",
          border: "1px solid #1c1c1f", marginBottom: 24,
        }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20, flexWrap: "wrap", gap: 8 }}>
            <div>
              <div style={{ fontSize: 15, fontWeight: 800, letterSpacing: -0.3 }}>CAC Máximo vs Real — {label}</div>
              <div style={{ fontSize: 11, color: "#52525b", marginTop: 2 }}>Comparativo mensal de custo de aquisição</div>
            </div>
            <div style={{ display: "flex", gap: 14, fontSize: 11, color: "#71717a" }}>
              <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
                <span style={{ width: 10, height: 10, borderRadius: 2, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)" }} /> Teto
              </span>
              <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
                <span style={{ width: 10, height: 10, borderRadius: 2, background: "linear-gradient(180deg, #a3e635, #65a30d)" }} /> Real OK
              </span>
              <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
                <span style={{ width: 10, height: 10, borderRadius: 2, background: "linear-gradient(180deg, #f87171, #b91c1c)" }} /> Estourou
              </span>
            </div>
          </div>

          <div style={{ display: "flex", gap: 4, alignItems: "flex-end" }}>
            {MO.map((m, i) => (
              <BarCol key={`${prod}-${i}`} maxV={d.maxCAC[i]} realV={comp.realCAC[i]}
                ceiling={comp.ceiling} label={m} idx={i} total={12} />
            ))}
          </div>
        </div>

        {/* ── ALERTS ── */}
        {comp.overCount > 0 && (
          <div style={{
            display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 24,
            padding: "14px 18px", borderRadius: 10,
            background: "rgba(248,113,113,0.04)", border: "1px solid rgba(248,113,113,0.1)",
            animation: "fadeIn .5s ease",
          }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: "#f87171", marginRight: 4 }}>⚠ ALERTAS</span>
            {comp.realCAC.map((r, i) => {
              if (r == null || r <= d.maxCAC[i]) return null;
              return (
                <Tag key={i} color="#fca5a5" bg="rgba(248,113,113,0.12)">
                  {MO[i]}: {fmt(r)} (teto {fmt(d.maxCAC[i])})
                </Tag>
              );
            })}
          </div>
        )}

        {/* ── TABLE ── */}
        <div style={{
          background: "#111113", borderRadius: 12, border: "1px solid #1c1c1f",
          overflow: "hidden", marginBottom: 24,
        }}>
          <div style={{ padding: "18px 20px 0", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div>
              <div style={{ fontSize: 15, fontWeight: 800, letterSpacing: -0.3 }}>Detalhamento Mensal</div>
              <div style={{ fontSize: 11, color: "#52525b", marginTop: 2 }}>Linhas calculadas automaticamente · campos amarelos são editáveis</div>
            </div>
            <Tag color="#fbbf24" bg="rgba(251,191,36,0.1)">✎ Editável</Tag>
          </div>

          <div style={{ overflowX: "auto", padding: "16px 0 0" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13, minWidth: 900 }}>
              <thead>
                <tr>
                  <th style={thStyle}>Indicador</th>
                  {MO.map(m => <th key={m} style={{ ...thStyle, textAlign: "right", minWidth: 80 }}>{m}</th>)}
                  <th style={{ ...thStyle, textAlign: "right", minWidth: 90 }}>Média</th>
                </tr>
              </thead>
              <tbody>
                {/* Max CAC — read only */}
                <tr>
                  <td style={tdLabel}>Máximo CAC</td>
                  {d.maxCAC.map((v, i) => <td key={i} style={tdVal}>{fmt(v)}</td>)}
                  <td style={{ ...tdVal, fontWeight: 700, color: "#a1a1aa" }}>{fmt(d.maxCAC.reduce((a, b) => a + b, 0) / 12)}</td>
                </tr>

                {/* Real CAC — calculated */}
                <tr style={{ background: "rgba(255,255,255,0.01)" }}>
                  <td style={{ ...tdLabel, fontWeight: 700, color: "#fafafa" }}>Real CAC</td>
                  {comp.realCAC.map((v, i) => {
                    const over = v != null && v > d.maxCAC[i];
                    return (
                      <td key={i} style={{
                        ...tdVal, fontWeight: 800,
                        color: v != null ? (over ? "#f87171" : "#a3e635") : "#3f3f46",
                      }}>
                        {v != null ? fmt(v) : "—"}
                      </td>
                    );
                  })}
                  <td style={{ ...tdVal, fontWeight: 800, color: accent }}>
                    {comp.avgCAC != null ? fmt(comp.avgCAC) : "—"}
                  </td>
                </tr>

                {/* Comparativo */}
                <tr>
                  <td style={tdLabel}>Comparativo</td>
                  {comp.diff.map((v, i) => (
                    <td key={i} style={{
                      ...tdVal, fontSize: 12, fontWeight: 700,
                      color: v != null ? (v <= 0 ? "#a3e635" : "#f87171") : "#3f3f46",
                    }}>
                      {v != null ? pct(v) : "—"}
                    </td>
                  ))}
                  <td style={tdVal}>—</td>
                </tr>

                {/* Separator */}
                <tr><td colSpan={14} style={{ height: 1, background: "#1c1c1f" }} /></tr>

                {/* Custo MKT — editable */}
                <tr>
                  <td style={tdLabel}>
                    Custo MKT
                    <span style={{ marginLeft: 6, fontSize: 9, color: "#fbbf24", opacity: .7 }}>●</span>
                  </td>
                  {d.custoMkt.map((v, i) => (
                    <td key={i} style={{ ...tdVal, padding: "6px 4px" }}>
                      <Input value={v} onChange={val => upd("custoMkt", i, val)} />
                    </td>
                  ))}
                  <td style={{ ...tdVal, fontWeight: 600 }}>{fmtK(comp.totalMkt)}</td>
                </tr>

                {/* Custo Comercial — editable */}
                <tr style={{ background: "rgba(255,255,255,0.01)" }}>
                  <td style={tdLabel}>
                    Custo Comercial
                    <span style={{ marginLeft: 6, fontSize: 9, color: "#fbbf24", opacity: .7 }}>●</span>
                  </td>
                  {d.custoCom.map((v, i) => (
                    <td key={i} style={{ ...tdVal, padding: "6px 4px" }}>
                      <Input value={v} onChange={val => upd("custoCom", i, val)} />
                    </td>
                  ))}
                  <td style={{ ...tdVal, fontWeight: 600 }}>{fmtK(comp.totalCom)}</td>
                </tr>

                {/* Clientes — editable */}
                <tr>
                  <td style={tdLabel}>
                    Clientes Adquiridos
                    <span style={{ marginLeft: 6, fontSize: 9, color: "#fbbf24", opacity: .7 }}>●</span>
                  </td>
                  {d.clientes.map((v, i) => (
                    <td key={i} style={{ ...tdVal, padding: "6px 4px" }}>
                      <Input value={v} onChange={val => upd("clientes", i, val)} w={66} />
                    </td>
                  ))}
                  <td style={{ ...tdVal, fontWeight: 800, color: "#fafafa", fontSize: 15 }}>{comp.totalCli.toLocaleString("pt-BR")}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* ── MKT vs COMERCIAL SPLIT ── */}
        <div style={{
          display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 24,
        }}>
          <div style={{
            background: "#111113", borderRadius: 12, padding: 20,
            border: "1px solid #1c1c1f",
          }}>
            <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 14, color: "#a1a1aa" }}>Distribuição do Investimento</div>
            {comp.totalInv > 0 ? (
              <>
                <div style={{ display: "flex", height: 8, borderRadius: 4, overflow: "hidden", marginBottom: 14 }}>
                  <div style={{ width: `${(comp.totalMkt / comp.totalInv) * 100}%`, background: accent, transition: "width .5s" }} />
                  <div style={{ flex: 1, background: "#fbbf24" }} />
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12 }}>
                  <div>
                    <span style={{ color: accent, fontWeight: 700 }}>● Marketing</span>
                    <span style={{ color: "#71717a", marginLeft: 8 }}>{fmt(comp.totalMkt)}</span>
                    <span style={{ color: "#52525b", marginLeft: 6 }}>({((comp.totalMkt / comp.totalInv) * 100).toFixed(0)}%)</span>
                  </div>
                  <div>
                    <span style={{ color: "#fbbf24", fontWeight: 700 }}>● Comercial</span>
                    <span style={{ color: "#71717a", marginLeft: 8 }}>{fmt(comp.totalCom)}</span>
                    <span style={{ color: "#52525b", marginLeft: 6 }}>({((comp.totalCom / comp.totalInv) * 100).toFixed(0)}%)</span>
                  </div>
                </div>
              </>
            ) : (
              <div style={{ color: "#3f3f46", fontSize: 12 }}>Sem dados</div>
            )}
          </div>

          <div style={{
            background: "#111113", borderRadius: 12, padding: 20,
            border: "1px solid #1c1c1f",
          }}>
            <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 14, color: "#a1a1aa" }}>Eficiência por Mês</div>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {MO.map((m, i) => {
                const r = comp.realCAC[i];
                const over = r != null && r > d.maxCAC[i];
                const ok = r != null && !over;
                return (
                  <div key={i} style={{
                    width: 50, height: 50, borderRadius: 8,
                    display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                    background: ok ? "rgba(163,230,53,0.08)" : over ? "rgba(248,113,113,0.08)" : "#18181b",
                    border: `1px solid ${ok ? "rgba(163,230,53,0.15)" : over ? "rgba(248,113,113,0.15)" : "#27272a"}`,
                    transition: "all .3s",
                  }}>
                    <span style={{ fontSize: 10, fontWeight: 700, color: ok ? "#a3e635" : over ? "#f87171" : "#3f3f46" }}>{m}</span>
                    <span style={{ fontSize: 14, marginTop: 2 }}>
                      {ok ? "✓" : over ? "✗" : "·"}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* ── PROJEÇÃO ── */}
        {comp.activeMonths >= 2 && (
          <div style={{
            background: "#111113", borderRadius: 12, padding: 20,
            border: "1px solid #1c1c1f", marginBottom: 24,
          }}>
            <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 14, color: "#a1a1aa" }}>Projeção 12 Meses (com base no ritmo atual)</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 16 }}>
              {[
                { l: "Clientes projetados", v: Math.round((comp.totalCli / comp.activeMonths) * 12).toLocaleString("pt-BR"), c: "#fbbf24" },
                { l: "Investimento projetado", v: fmtK(Math.round((comp.totalInv / comp.activeMonths) * 12)), c: accent },
                { l: "CAC projetado", v: comp.avgCAC ? fmt(comp.avgCAC) : "—", c: comp.avgCAC && comp.avgCAC <= comp.avgMax ? "#a3e635" : "#f87171" },
                { l: "Economia vs teto", v: comp.avgCAC ? fmt(comp.avgMax - comp.avgCAC) : "—", c: comp.avgCAC && comp.avgCAC <= comp.avgMax ? "#a3e635" : "#f87171" },
              ].map((p, i) => (
                <div key={i} style={{ padding: "12px 16px", background: "#18181b", borderRadius: 8, border: "1px solid #27272a" }}>
                  <div style={{ fontSize: 10, color: "#52525b", fontWeight: 600, textTransform: "uppercase", letterSpacing: 1 }}>{p.l}</div>
                  <div style={{ fontSize: 22, fontWeight: 900, color: p.c, marginTop: 4, fontFeatureSettings: "'tnum'", letterSpacing: -0.5 }}>{p.v}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      <footer style={{
        padding: "14px 28px", borderTop: "1px solid #18181b",
        display: "flex", justifyContent: "space-between", fontSize: 10, color: "#3f3f46",
      }}>
        <span>GM Educação · Controle de CAC 2026</span>
        <span>Cálculos em tempo real</span>
      </footer>
    </div>
  );
}

// ── Table styles ──
const thStyle = {
  padding: "10px 12px", textAlign: "left", fontSize: 10, fontWeight: 700,
  color: "#52525b", letterSpacing: 1, textTransform: "uppercase",
  borderBottom: "1px solid #1c1c1f", position: "sticky", top: 0, background: "#111113",
};

const tdLabel = {
  padding: "10px 12px", fontSize: 13, fontWeight: 600, color: "#a1a1aa",
  borderBottom: "1px solid #18181b", whiteSpace: "nowrap",
};

const tdVal = {
  padding: "10px 8px", textAlign: "right", fontSize: 13,
  borderBottom: "1px solid #18181b", color: "#d4d4d8",
  fontFeatureSettings: "'tnum'",
};
