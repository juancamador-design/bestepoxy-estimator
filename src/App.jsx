import { useState, useEffect } from "react";

// ============================================================
// INTERNAL PRICING ENGINE — OWNER-CONFIGURABLE DEFAULTS
// ============================================================
const DEFAULT_SETTINGS = {
  global: {
    currency: "USD",
    taxEnabled: false,
    taxRate: 0.08,
    wasteFactor: 1.1,
    contingency: 0.05,
    minimumMargin: 0.35,
    minimumJobCharge: 850,
    rushMultiplier: 1.25,
    commercialThresholdSqFt: 3000,
    lowEstimateMultiplier: 0.95,
    highEstimateMultiplier: 1.12,
    ownerEmail: "contact@bestepoxypro.com",
    ownerPhone: "702-710-9010",
    webhookUrl: "",
    notifyEmail: true,
    notifySMS: false,
    notifyWebhook: false,
  },
  packages: {
    garage_normal: { label: "Garage – Essential", pricePerSqFt: 4.5, materialCostPerSqFt: 1.2, laborCostPerSqFt: 1.8, prepAllowancePerSqFt: 0.4, warrantyYears: 3, turnaroundDays: "2–3", hiddenBaseSystem: "XPS Epoxy Flake System", hiddenTopCoat: "XPS AHP85 Polyaspartic", estimatorNotes: "Standard residential flake system.", ownerFollowUpNotes: "Confirm floor condition. Check for moisture." },
    garage_premium: { label: "Garage – Premium", pricePerSqFt: 7.5, materialCostPerSqFt: 2.2, laborCostPerSqFt: 2.8, prepAllowancePerSqFt: 0.6, warrantyYears: 7, turnaroundDays: "3–4", hiddenBaseSystem: "Sherwin Resuflor Deco Flake BC", hiddenTopCoat: "Sherwin Accelera EXT", estimatorNotes: "Premium UV-stable system.", ownerFollowUpNotes: "Upsell steam cleaning prep. Confirm UV exposure." },
    patio_normal: { label: "Patio – Essential", pricePerSqFt: 5.5, materialCostPerSqFt: 1.5, laborCostPerSqFt: 2.2, prepAllowancePerSqFt: 0.5, warrantyYears: 3, turnaroundDays: "2–3", hiddenBaseSystem: "XPS Exterior-Grade Epoxy", hiddenTopCoat: "XPS AHP85 Polyaspartic", estimatorNotes: "Exterior-capable UV protection.", ownerFollowUpNotes: "Check substrate integrity. Confirm drain slope." },
    patio_premium: { label: "Patio – Premium", pricePerSqFt: 8.5, materialCostPerSqFt: 2.5, laborCostPerSqFt: 3.0, prepAllowancePerSqFt: 0.7, warrantyYears: 7, turnaroundDays: "3–5", hiddenBaseSystem: "Sherwin Resuflor Exterior System", hiddenTopCoat: "Sherwin Accelera EXT", estimatorNotes: "Best UV and weather resistance.", ownerFollowUpNotes: "Confirm direct sun exposure hours." },
    countertop_normal: { label: "Countertop – Essential", pricePerSqFt: 85, materialCostPerSqFt: 22, laborCostPerSqFt: 35, prepAllowancePerSqFt: 8, warrantyYears: 2, turnaroundDays: "3–5", hiddenBaseSystem: "XPS Self-Leveling Decorative Epoxy", hiddenTopCoat: "XPS Clear Countertop Topcoat", estimatorNotes: "Self-leveling decorative system.", ownerFollowUpNotes: "Confirm substrate. Measure carefully." },
    countertop_premium: { label: "Countertop – Premium", pricePerSqFt: 140, materialCostPerSqFt: 38, laborCostPerSqFt: 55, prepAllowancePerSqFt: 12, warrantyYears: 5, turnaroundDays: "5–7", hiddenBaseSystem: "Premium countertop system (owner-configurable)", hiddenTopCoat: "Premium topcoat (owner-configurable)", estimatorNotes: "OWNER-CONFIGURABLE.", ownerFollowUpNotes: "Confirm desired finish: marble, solid, metallic." },
    commercial_normal: { label: "Commercial – Essential", pricePerSqFt: 5.0, materialCostPerSqFt: 1.4, laborCostPerSqFt: 2.0, prepAllowancePerSqFt: 0.5, warrantyYears: 3, turnaroundDays: "3–5", hiddenBaseSystem: "Durable Decorative Epoxy System", hiddenTopCoat: "XPS AHP85 Polyaspartic", estimatorNotes: "Commercial-grade decorative.", ownerFollowUpNotes: "Confirm traffic type." },
    commercial_premium: { label: "Commercial – Premium", pricePerSqFt: 9.0, materialCostPerSqFt: 2.8, laborCostPerSqFt: 3.5, prepAllowancePerSqFt: 0.8, warrantyYears: 7, turnaroundDays: "5–10", hiddenBaseSystem: "Sherwin Premium High-Performance System", hiddenTopCoat: "Sherwin Accelera EXT or 4850", estimatorNotes: "High-performance commercial.", ownerFollowUpNotes: "Full spec review required." },
    recoat_normal: { label: "Recoat – Essential", pricePerSqFt: 3.0, materialCostPerSqFt: 0.9, laborCostPerSqFt: 1.4, prepAllowancePerSqFt: 0.3, warrantyYears: 2, turnaroundDays: "1–2", hiddenBaseSystem: "Lower-build refresh system", hiddenTopCoat: "XPS AHP85 Refresh Coat", estimatorNotes: "Light prep refresh.", ownerFollowUpNotes: "Verify existing coat adhesion." },
    recoat_premium: { label: "Recoat – Premium", pricePerSqFt: 5.0, materialCostPerSqFt: 1.5, laborCostPerSqFt: 2.0, prepAllowancePerSqFt: 0.5, warrantyYears: 5, turnaroundDays: "2–3", hiddenBaseSystem: "Premium refresh system", hiddenTopCoat: "Sherwin Accelera EXT", estimatorNotes: "Full refresh with premium UV topcoat.", ownerFollowUpNotes: "Check if full removal is needed instead." },
    other_normal: { label: "Other – Essential", pricePerSqFt: 5.0, materialCostPerSqFt: 1.4, laborCostPerSqFt: 2.0, prepAllowancePerSqFt: 0.5, warrantyYears: 3, turnaroundDays: "2–4", hiddenBaseSystem: "TBD – requires site review", hiddenTopCoat: "TBD – requires site review", estimatorNotes: "Manual review required.", ownerFollowUpNotes: "Full assessment needed." },
    other_premium: { label: "Other – Premium", pricePerSqFt: 8.0, materialCostPerSqFt: 2.3, laborCostPerSqFt: 3.0, prepAllowancePerSqFt: 0.7, warrantyYears: 5, turnaroundDays: "3–6", hiddenBaseSystem: "TBD – requires site review", hiddenTopCoat: "TBD – requires site review", estimatorNotes: "Manual review required.", ownerFollowUpNotes: "Full assessment needed." },
  },
  addons: {
    crackRepairPerSqFt: 2.5, heavyPrepPerSqFt: 1.8, moistureMitigationPerSqFt: 2.2,
    stemWallsPerLinFt: 12, outdoorUVUpgradePerSqFt: 1.2, oldCoatingRemovalPerSqFt: 2.0,
    rushJobMultiplier: 1.25, unknownConditionBuffer: 0.15,
  },
  packageLabels: {
    normal: { name: "Essential", tagline: "Refined protection. Lasting beauty.", features: ["Decorative flake or solid-color finish", "Strong everyday protection", "UV-stable protective topcoat", "Professional prep and application", "3-year craftsmanship warranty"] },
    premium: { name: "Signature", tagline: "Elevated performance. Uncompromising finish.", features: ["Enhanced gloss and color depth", "Superior stain and wear resistance", "Advanced UV and weather stability", "Ideal for premium spaces", "Extended 7-year craftsmanship warranty"] },
  },
};

const STORAGE_KEY_QUOTES = "bestepoxy_quotes";
const STORAGE_KEY_SETTINGS = "bestepoxy_settings";
const ADMIN_PASSWORD = "epoxy2024";

function loadSettings() { try { const s = localStorage.getItem(STORAGE_KEY_SETTINGS); if (s) return JSON.parse(s); } catch {} return DEFAULT_SETTINGS; }
function saveSettings(s) { localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(s)); }
function loadQuotes() { try { const q = localStorage.getItem(STORAGE_KEY_QUOTES); if (q) return JSON.parse(q); } catch {} return []; }
function saveQuotes(q) { localStorage.setItem(STORAGE_KEY_QUOTES, JSON.stringify(q)); }

function calculateQuote(formData, settings) {
  const { serviceType, packageType, squareFeet, addons } = formData;
  const key = `${serviceType}_${packageType}`;
  const pkg = settings.packages[key] || settings.packages["other_normal"];
  const g = settings.global;
  const ao = settings.addons;
  const sqft = parseFloat(squareFeet) || 0;
  if (sqft < 1) return null;
  let baseSelling = sqft * pkg.pricePerSqFt;
  let internalMaterial = sqft * pkg.materialCostPerSqFt * g.wasteFactor;
  let internalLabor = sqft * pkg.laborCostPerSqFt;
  let internalPrep = sqft * pkg.prepAllowancePerSqFt;
  let addonCost = 0;
  if (addons.crackRepair) addonCost += sqft * ao.crackRepairPerSqFt;
  if (addons.heavyPrep) addonCost += sqft * ao.heavyPrepPerSqFt;
  if (addons.moisture) addonCost += sqft * ao.moistureMitigationPerSqFt;
  if (addons.stemWalls) addonCost += sqft * 0.2 * ao.stemWallsPerLinFt;
  if (addons.outdoorUV) addonCost += sqft * ao.outdoorUVUpgradePerSqFt;
  if (addons.oldCoating) addonCost += sqft * ao.oldCoatingRemovalPerSqFt;
  if (addons.unknownCondition) addonCost += baseSelling * ao.unknownConditionBuffer;
  let total = baseSelling + addonCost;
  if (addons.rush) total *= ao.rushJobMultiplier;
  if (total < g.minimumJobCharge) total = g.minimumJobCharge;
  const low = Math.round(total * g.lowEstimateMultiplier);
  const high = Math.round(total * g.highEstimateMultiplier);
  const totalInternal = internalMaterial + internalLabor + internalPrep + addonCost;
  const margin = Math.round(((total - totalInternal) / total) * 100);
  return { low, high, estimated: Math.round(total), internalMaterialCost: Math.round(internalMaterial), internalLaborCost: Math.round(internalLabor), internalPrepCost: Math.round(internalPrep), internalTotalCost: Math.round(totalInternal), margin, hiddenBaseSystem: pkg.hiddenBaseSystem, hiddenTopCoat: pkg.hiddenTopCoat, warrantyYears: pkg.warrantyYears, turnaroundDays: pkg.turnaroundDays, packageKey: key, sqft, isCommercialReview: sqft >= g.commercialThresholdSqFt, estimatorNotes: pkg.estimatorNotes, ownerFollowUpNotes: pkg.ownerFollowUpNotes };
}

function exportToCSV(quotes) {
  const headers = ["ID","Date","Status","Name","Phone","Email","ZIP","ServiceType","Package","SqFt","AddOns","EstLow","EstHigh","HiddenSystem","HiddenTopCoat","InternalMaterialCost","InternalLaborCost","InternalTotalCost","Margin%"];
  const rows = quotes.map(q => [q.id, q.timestamp, q.status, q.name, q.phone, q.email, q.zip, q.serviceType, q.packageType, q.squareFeet, (q.addonsSelected||[]).join("; "), q.calc?.low, q.calc?.high, q.calc?.hiddenBaseSystem, q.calc?.hiddenTopCoat, q.calc?.internalMaterialCost, q.calc?.internalLaborCost, q.calc?.internalTotalCost, q.calc?.margin]);
  const csv = [headers, ...rows].map(r => r.map(c => `"${String(c||"").replace(/"/g,'""')}"`).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a"); a.href = url; a.download = `bestepoxy-quotes-${new Date().toISOString().slice(0,10)}.csv`; a.click();
}

// ── Brand tokens ──────────────────────────────────────────
const NAVY = "#1B2A4A";
const NAVY2 = "#243459";
const GOLD = "#C9A041";
const GOLD2 = "#E8C96A";
const GOLD_LIGHT = "#F5E9C8";
const WHITE = "#FFFFFF";
const OFF_WHITE = "#FAFAF8";
const GRAY_LIGHT = "#F2F0EB";
const GRAY_MID = "#8A8A90";
const GRAY_DARK = "#3A3A3E";

const F_SCRIPT = "'Dancing Script', cursive";
const F_SERIF = "'Cormorant Garamond', Georgia, serif";
const F_SANS = "'DM Sans', 'Helvetica Neue', sans-serif";

const SERVICE_OPTIONS = [
  { id: "garage", label: "Garage Floor", icon: "⬡", sub: "Interior garage coating" },
  { id: "patio", label: "Patio / Exterior", icon: "◈", sub: "Outdoor surfaces" },
  { id: "countertop", label: "Countertop", icon: "✦", sub: "Kitchen & bath" },
  { id: "commercial", label: "Commercial Floor", icon: "◉", sub: "Business & retail" },
  { id: "recoat", label: "Recoat / Refresh", icon: "↺", sub: "Existing coated surface" },
  { id: "other", label: "Not Sure", icon: "◌", sub: "We'll help you choose" },
];

const ADDON_OPTIONS = [
  { id: "crackRepair", label: "Crack repair needed", hint: "Visible cracks in concrete" },
  { id: "heavyPrep", label: "Heavy surface prep", hint: "Grinding or shot blasting" },
  { id: "moisture", label: "Moisture concerns", hint: "Wet spots or efflorescence" },
  { id: "stemWalls", label: "Stem walls / verticals", hint: "Coating goes up the walls" },
  { id: "outdoorUV", label: "Direct sun / UV exposure", hint: "South-facing or open sky" },
  { id: "oldCoating", label: "Remove existing coating", hint: "Old paint or epoxy present" },
  { id: "rush", label: "Rush scheduling", hint: "Need it done quickly" },
  { id: "unknownCondition", label: "Unsure of floor condition", hint: "No info on prior treatments" },
];

const SIZE_PRESETS = [
  { label: "1-Car Garage", sqft: 250 },
  { label: "2-Car Garage", sqft: 480 },
  { label: "3-Car Garage", sqft: 720 },
];

const STEP_LABELS = ["Service", "Package", "Size", "Conditions", "Estimate", "Contact"];
const STATUS_OPTIONS = ["new","reviewed","called","visit","quoted","won","lost"];

// ── Logo SVG (text-based, matches brand) ──────────────────
function BrandLogo({ size = "md" }) {
  const logoUrl = "https://assets.zyrosite.com/cdn-cgi/image/format=auto,w=768,fit=crop/m6LZ8R8JRNcKED5v/logo-transparente-mnlW46VPJpuMXbXP.png";
  const h = size === "sm" ? 48 : size === "lg" ? 80 : 64;
  return (
    <img src={logoUrl} alt="Best Epoxy" style={{ height: h, width: "auto", display: "block" }} />
  );
}

// ── Global styles ─────────────────────────────────────────
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,300;1,400&family=Dancing+Script:wght@600&family=DM+Sans:wght@300;400;500&display=swap');

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

.be2-root {
  font-family: ${F_SANS};
  font-weight: 300;
  background: ${WHITE};
  color: ${NAVY};
  -webkit-font-smoothing: antialiased;
  min-height: 100vh;
}

/* ── Page header ── */
.be2-page-header {
  background: ${WHITE};
  border-bottom: 1px solid ${GOLD_LIGHT};
  padding: 1rem 2rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: sticky; top: 0; z-index: 50;
}
.be2-header-tagline {
  font-size: 0.7rem;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: ${GOLD};
}
.be2-nav-admin {
  font-size: 0.7rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: ${GRAY_MID};
  background: none;
  border: none;
  cursor: pointer;
  transition: color 0.2s;
  padding: 0.3rem 0.6rem;
}
.be2-nav-admin:hover { color: ${GOLD}; }

/* ── Hero section ── */
.be2-hero {
  text-align: center;
  padding: 3.5rem 1.5rem 2.5rem;
  background: ${WHITE};
  position: relative;
}
.be2-hero::after {
  content: '';
  position: absolute;
  bottom: 0; left: 50%; transform: translateX(-50%);
  width: 60px; height: 1px;
  background: ${GOLD};
}
.be2-hero-eyebrow {
  font-size: 0.68rem;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: ${GOLD};
  margin-bottom: 1rem;
}
.be2-hero-title {
  font-family: ${F_SERIF};
  font-size: clamp(1.8rem, 4vw, 2.8rem);
  font-weight: 300;
  color: ${NAVY};
  line-height: 1.2;
  margin-bottom: 0.75rem;
}
.be2-hero-title em { font-style: italic; color: ${GOLD}; }
.be2-hero-sub {
  font-size: 0.88rem;
  color: ${GRAY_MID};
  line-height: 1.7;
  max-width: 480px;
  margin: 0 auto;
}

/* ── Trust bar ── */
.be2-trust {
  display: flex;
  justify-content: center;
  gap: 2.5rem;
  padding: 1.5rem 1rem 2rem;
  flex-wrap: wrap;
}
.be2-trust-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.75rem;
  letter-spacing: 0.06em;
  color: ${GRAY_MID};
}
.be2-trust-dot {
  width: 5px; height: 5px;
  border-radius: 50%;
  background: ${GOLD};
  flex-shrink: 0;
}

/* ── Progress ── */
.be2-progress-wrap {
  padding: 0 1.5rem;
  max-width: 700px;
  margin: 0 auto 2rem;
}
.be2-progress {
  display: flex;
  align-items: center;
}
.be2-pdot {
  width: 26px; height: 26px;
  border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  font-size: 0.68rem; font-weight: 500;
  flex-shrink: 0;
  transition: all 0.3s;
}
.be2-pdot.done { background: ${NAVY}; color: ${WHITE}; }
.be2-pdot.active { background: ${GOLD}; color: ${WHITE}; }
.be2-pdot.pending { background: ${GRAY_LIGHT}; color: ${GRAY_MID}; border: 1px solid #DDD9D0; }
.be2-pline { flex: 1; height: 1px; background: #DDD9D0; }
.be2-pline.done { background: ${NAVY}; }
.be2-step-name {
  text-align: center;
  font-size: 0.65rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: ${GOLD};
  margin-top: 0.5rem;
}

/* ── Card ── */
.be2-card {
  background: ${WHITE};
  border: 1px solid #E8E3D8;
  border-radius: 3px;
  padding: 2rem;
  max-width: 700px;
  margin: 0 auto 1rem;
}
.be2-card-title {
  font-family: ${F_SERIF};
  font-size: 1.45rem;
  font-weight: 400;
  color: ${NAVY};
  margin-bottom: 0.3rem;
}
.be2-card-sub {
  font-size: 0.83rem;
  color: ${GRAY_MID};
  margin-bottom: 1.5rem;
  line-height: 1.6;
}

/* ── Service grid ── */
.be2-service-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.65rem;
}
@media (max-width: 560px) {
  .be2-service-grid { grid-template-columns: repeat(2, 1fr); }
}
.be2-svc-btn {
  background: ${WHITE};
  border: 1px solid #E8E3D8;
  border-radius: 3px;
  padding: 1.1rem 0.85rem;
  cursor: pointer;
  text-align: left;
  transition: all 0.22s;
}
.be2-svc-btn:hover { border-color: ${GOLD}; background: #FDFCF8; }
.be2-svc-btn.sel { border-color: ${GOLD}; background: #FDFCF8; box-shadow: inset 0 0 0 1px ${GOLD}; }
.be2-svc-icon { font-size: 1.1rem; color: ${GOLD}; margin-bottom: 0.45rem; }
.be2-svc-label { font-size: 0.82rem; font-weight: 500; color: ${NAVY}; margin-bottom: 0.15rem; }
.be2-svc-sub { font-size: 0.7rem; color: ${GRAY_MID}; }

/* ── Package cards ── */
.be2-pkg-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}
@media (max-width: 520px) { .be2-pkg-grid { grid-template-columns: 1fr; } }

.be2-pkg {
  border: 1px solid #E8E3D8;
  border-radius: 3px;
  padding: 1.5rem;
  cursor: pointer;
  transition: all 0.22s;
}
.be2-pkg:hover { border-color: ${GOLD}; }
.be2-pkg.sel { border-color: ${GOLD}; box-shadow: inset 0 0 0 1px ${GOLD}; }
.be2-pkg.dark { background: ${NAVY}; border-color: ${NAVY2}; }
.be2-pkg.dark:hover { border-color: ${GOLD}; }
.be2-pkg.dark.sel { box-shadow: inset 0 0 0 1px ${GOLD}; }
.be2-pkg-badge {
  font-size: 0.58rem;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: ${GOLD};
  border: 1px solid ${GOLD};
  padding: 0.18rem 0.55rem;
  display: inline-block;
  border-radius: 2px;
  margin-bottom: 0.7rem;
}
.be2-pkg-name {
  font-family: ${F_SERIF};
  font-size: 1.3rem;
  font-weight: 400;
  color: ${NAVY};
  margin-bottom: 0.25rem;
}
.be2-pkg.dark .be2-pkg-name { color: #F0EDE6; }
.be2-pkg-line {
  font-size: 0.75rem;
  font-style: italic;
  color: ${GRAY_MID};
  margin-bottom: 1rem;
}
.be2-pkg.dark .be2-pkg-line { color: #7A7A84; }
.be2-pkg-features { list-style: none; display: flex; flex-direction: column; gap: 0.4rem; }
.be2-pkg-features li {
  font-size: 0.78rem;
  display: flex; align-items: flex-start; gap: 0.45rem;
  color: #4A4A52; line-height: 1.4;
}
.be2-pkg.dark .be2-pkg-features li { color: #9A9AA8; }
.be2-pkg-features li::before { content: "–"; color: ${GOLD}; flex-shrink: 0; }

/* ── Size helpers ── */
.be2-size-chips { display: flex; flex-wrap: wrap; gap: 0.45rem; margin-bottom: 1rem; }
.be2-chip {
  font-size: 0.74rem; padding: 0.32rem 0.85rem;
  border: 1px solid #E8E3D8; border-radius: 2px;
  cursor: pointer; background: ${WHITE}; color: ${GRAY_MID};
  transition: all 0.2s; letter-spacing: 0.03em;
}
.be2-chip:hover { border-color: ${GOLD}; color: ${GOLD}; }

/* ── Inputs ── */
.be2-field { margin-bottom: 1.1rem; }
.be2-label {
  display: block; font-size: 0.68rem; letter-spacing: 0.1em;
  text-transform: uppercase; color: ${GRAY_MID}; margin-bottom: 0.35rem;
}
.be2-input {
  width: 100%; border: 1px solid #DDD8CE; border-radius: 2px;
  padding: 0.75rem 0.9rem; font-family: ${F_SANS}; font-size: 0.88rem;
  font-weight: 300; color: ${NAVY}; background: ${WHITE};
  outline: none; transition: border-color 0.2s; -webkit-appearance: none;
}
.be2-input:focus { border-color: ${GOLD}; }
.be2-input::placeholder { color: #BDBAB2; }
.be2-sqft-wrap { position: relative; }
.be2-sqft-unit {
  position: absolute; right: 0.9rem; top: 50%;
  transform: translateY(-50%); font-size: 0.75rem;
  color: ${GRAY_MID}; pointer-events: none;
}
.be2-two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
@media (max-width: 480px) { .be2-two-col { grid-template-columns: 1fr; } }

/* ── Addons ── */
.be2-addons { display: grid; grid-template-columns: 1fr 1fr; gap: 0.6rem; }
@media (max-width: 480px) { .be2-addons { grid-template-columns: 1fr; } }
.be2-addon {
  display: flex; align-items: flex-start; gap: 0.55rem;
  padding: 0.75rem 0.8rem; border: 1px solid #E8E3D8;
  border-radius: 2px; cursor: pointer; transition: all 0.2s; background: ${WHITE};
}
.be2-addon:hover { border-color: ${GOLD_LIGHT}; }
.be2-addon.chk { border-color: ${GOLD}; background: #FEFCF7; }
.be2-addon-box {
  width: 15px; height: 15px; border: 1px solid #DDD8CE;
  border-radius: 2px; flex-shrink: 0; display: flex;
  align-items: center; justify-content: center;
  font-size: 9px; margin-top: 1px; transition: all 0.2s;
}
.be2-addon.chk .be2-addon-box { background: ${GOLD}; border-color: ${GOLD}; color: white; }
.be2-addon-text { font-size: 0.78rem; color: ${NAVY}; line-height: 1.3; }
.be2-addon-hint { font-size: 0.68rem; color: ${GRAY_MID}; }

/* ── Estimate box ── */
.be2-est-box {
  background: ${NAVY};
  border-radius: 3px;
  padding: 2.5rem 1.5rem;
  text-align: center;
  margin-bottom: 1.25rem;
  position: relative;
  overflow: hidden;
}
.be2-est-box::before {
  content: '';
  position: absolute;
  top: 0; left: 0; right: 0;
  height: 2px;
  background: linear-gradient(90deg, transparent, ${GOLD}, transparent);
}
.be2-est-eyebrow {
  font-size: 0.62rem; letter-spacing: 0.18em;
  text-transform: uppercase; color: ${GOLD}; margin-bottom: 0.5rem;
}
.be2-est-range {
  font-family: ${F_SERIF};
  font-size: clamp(2rem, 6vw, 3.2rem);
  font-weight: 300; color: #F0EDE6; line-height: 1.1;
  margin-bottom: 0.5rem;
}
.be2-est-note { font-size: 0.72rem; color: #6A6A74; font-style: italic; }

.be2-meta {
  display: grid; grid-template-columns: 1fr 1fr 1fr;
  gap: 1px; background: #E8E3D8;
  border: 1px solid #E8E3D8; border-radius: 2px;
  overflow: hidden; margin-bottom: 1.25rem;
}
@media (max-width: 440px) { .be2-meta { grid-template-columns: 1fr 1fr; } }
.be2-meta-item { background: ${WHITE}; padding: 0.9rem; text-align: center; }
.be2-meta-lbl { font-size: 0.6rem; letter-spacing: 0.1em; text-transform: uppercase; color: ${GRAY_MID}; margin-bottom: 0.25rem; }
.be2-meta-val { font-size: 0.88rem; font-weight: 500; color: ${NAVY}; }

/* ── Buttons ── */
.be2-btn-row { display: flex; gap: 0.7rem; margin-top: 1.5rem; }
.be2-btn-back {
  padding: 0.82rem 1.4rem; border: 1px solid #DDD8CE;
  border-radius: 2px; background: ${WHITE}; color: ${GRAY_MID};
  font-family: ${F_SANS}; font-size: 0.78rem; font-weight: 400;
  letter-spacing: 0.08em; text-transform: uppercase;
  cursor: pointer; transition: all 0.2s; flex-shrink: 0;
}
.be2-btn-back:hover { border-color: ${GOLD}; color: ${GOLD}; }
.be2-btn-primary {
  flex: 1; padding: 0.85rem 1.5rem;
  background: ${GOLD}; color: ${WHITE}; border: none;
  border-radius: 2px; font-family: ${F_SANS}; font-size: 0.8rem;
  font-weight: 500; letter-spacing: 0.1em; text-transform: uppercase;
  cursor: pointer; transition: all 0.22s;
}
.be2-btn-primary:hover { background: #B8902E; }
.be2-btn-primary:disabled { opacity: 0.45; cursor: not-allowed; }
.be2-btn-full { width: 100%; }

/* ── Disclaimer ── */
.be2-disclaimer {
  font-size: 0.72rem; color: ${GRAY_MID}; line-height: 1.65;
  text-align: center; border-top: 1px solid #E8E3D8;
  padding-top: 1rem; font-style: italic;
}

/* ── Confirmation ── */
.be2-confirm {
  text-align: center; padding: 4rem 1.5rem;
  max-width: 480px; margin: 0 auto;
}
.be2-confirm-icon {
  width: 60px; height: 60px; border-radius: 50%;
  background: ${GOLD_LIGHT}; display: flex;
  align-items: center; justify-content: center;
  margin: 0 auto 1.5rem; font-size: 1.4rem; color: ${GOLD};
}
.be2-confirm-title {
  font-family: ${F_SERIF}; font-size: 2rem; font-weight: 400;
  color: ${NAVY}; margin-bottom: 0.75rem;
}
.be2-confirm-sub { font-size: 0.86rem; color: ${GRAY_MID}; line-height: 1.7; }
.be2-confirm-range {
  display: inline-block; margin: 1.75rem auto;
  padding: 1rem 2.5rem; background: ${GRAY_LIGHT};
  border-radius: 3px; border: 1px solid #E8E3D8;
}
.be2-confirm-range-lbl { font-size: 0.6rem; letter-spacing: 0.14em; text-transform: uppercase; color: ${GOLD}; margin-bottom: 0.3rem; }
.be2-confirm-range-val { font-family: ${F_SERIF}; font-size: 1.7rem; font-weight: 300; color: ${NAVY}; }

/* ── Footer ── */
.be2-footer {
  text-align: center;
  padding: 2.5rem 1rem;
  border-top: 1px solid ${GOLD_LIGHT};
  margin-top: 3rem;
}
.be2-footer-logo { margin-bottom: 0.75rem; display: flex; justify-content: center; }
.be2-footer-links { display: flex; justify-content: center; gap: 1.5rem; flex-wrap: wrap; }
.be2-footer-link { font-size: 0.72rem; letter-spacing: 0.08em; color: ${GRAY_MID}; text-decoration: none; }
.be2-footer-link:hover { color: ${GOLD}; }
.be2-footer-copy { font-size: 0.68rem; color: #C0BDB6; margin-top: 1rem; }

/* ── Admin ── */
.be2-admin-root { font-family: ${F_SANS}; font-weight: 300; min-height: 100vh; background: #F2F0EB; color: ${NAVY}; -webkit-font-smoothing: antialiased; }
.be2-admin-sidebar { position: fixed; left: 0; top: 0; bottom: 0; width: 210px; background: ${NAVY}; color: #F0EDE6; padding: 1.5rem 0; display: flex; flex-direction: column; z-index: 200; overflow-y: auto; }
.be2-admin-logo { font-family: ${F_SERIF}; font-size: 1.1rem; font-weight: 400; color: #F0EDE6; padding: 0 1.5rem 1.25rem; border-bottom: 1px solid #2A3A5A; }
.be2-admin-logo small { display: block; font-family: ${F_SANS}; font-size: 0.58rem; letter-spacing: 0.14em; text-transform: uppercase; color: ${GOLD}; margin-top: 0.2rem; }
.be2-admin-nav { flex: 1; padding: 0.75rem 0; }
.be2-admin-nav-item { display: flex; align-items: center; gap: 0.6rem; padding: 0.65rem 1.5rem; font-size: 0.78rem; letter-spacing: 0.03em; color: #6A7A9A; cursor: pointer; transition: all 0.2s; background: none; border: none; width: 100%; text-align: left; }
.be2-admin-nav-item:hover { color: #F0EDE6; background: #243459; }
.be2-admin-nav-item.active { color: ${GOLD}; background: #1F3054; }
.be2-admin-content { margin-left: 210px; padding: 2rem; min-height: 100vh; }
.be2-admin-hdr { display: flex; align-items: center; justify-content: space-between; margin-bottom: 1.75rem; padding-bottom: 1rem; border-bottom: 1px solid #E8E3D8; }
.be2-admin-title { font-family: ${F_SERIF}; font-size: 1.4rem; font-weight: 400; color: ${NAVY}; }
.be2-table-wrap { overflow-x: auto; }
.be2-table { width: 100%; border-collapse: collapse; font-size: 0.78rem; background: ${WHITE}; border-radius: 3px; overflow: hidden; border: 1px solid #E8E3D8; }
.be2-table th { background: ${GRAY_LIGHT}; font-size: 0.62rem; letter-spacing: 0.1em; text-transform: uppercase; color: ${GRAY_MID}; padding: 0.7rem 1rem; text-align: left; font-weight: 500; border-bottom: 1px solid #E8E3D8; white-space: nowrap; }
.be2-table td { padding: 0.75rem 1rem; border-bottom: 1px solid #F2EFE8; vertical-align: middle; color: ${NAVY}; }
.be2-table tr:last-child td { border-bottom: none; }
.be2-table tr:hover td { background: #FDFCF9; }
.be2-settings-section { background: ${WHITE}; border: 1px solid #E8E3D8; border-radius: 3px; padding: 1.5rem; margin-bottom: 1.25rem; }
.be2-settings-title { font-size: 0.65rem; letter-spacing: 0.14em; text-transform: uppercase; color: ${GOLD}; margin-bottom: 0.9rem; padding-bottom: 0.5rem; border-bottom: 1px solid #F2EFE8; }
.be2-settings-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(190px, 1fr)); gap: 0.9rem; }
.be2-admin-field { margin-bottom: 0.65rem; }
.be2-admin-label { display: block; font-size: 0.64rem; letter-spacing: 0.08em; text-transform: uppercase; color: ${GRAY_MID}; margin-bottom: 0.28rem; }
.be2-admin-input { width: 100%; border: 1px solid #DDD8CE; border-radius: 2px; padding: 0.52rem 0.7rem; font-family: ${F_SANS}; font-size: 0.8rem; font-weight: 300; color: ${NAVY}; background: ${WHITE}; outline: none; transition: border-color 0.2s; }
.be2-admin-input:focus { border-color: ${GOLD}; }
.be2-modal-overlay { position: fixed; inset: 0; background: rgba(27,42,74,0.55); z-index: 500; display: flex; align-items: center; justify-content: center; padding: 1rem; }
.be2-modal { background: ${WHITE}; border-radius: 4px; width: 100%; max-width: 660px; max-height: 88vh; overflow-y: auto; padding: 2rem; }
.be2-internal-box { background: ${NAVY}; color: #F0EDE6; border-radius: 3px; padding: 1.25rem; margin: 1rem 0; font-size: 0.8rem; line-height: 1.6; }
.be2-internal-box .ilabel { font-size: 0.58rem; letter-spacing: 0.14em; text-transform: uppercase; color: ${GOLD}; margin-bottom: 0.7rem; display: block; }
.be2-irow { display: flex; justify-content: space-between; padding: 0.28rem 0; border-bottom: 1px solid #2A3A5A; }
.be2-irow:last-child { border-bottom: none; }
.be2-irow span:first-child { color: #6A7A9A; }
.be2-status-new { background: #EBF4FB; color: #1A5A8A; }
.be2-status-reviewed { background: #EAF4EC; color: #1D7A3B; }
.be2-status-called { background: #FEF9E7; color: #8A6010; }
.be2-status-visit { background: #F4ECF7; color: #7D3C98; }
.be2-status-quoted { background: #EAFAF8; color: #148F77; }
.be2-status-won { background: ${NAVY}; color: ${GOLD}; }
.be2-status-lost { background: #FDEDEC; color: #A93226; }
.be2-badge { display: inline-block; font-size: 0.6rem; letter-spacing: 0.08em; text-transform: uppercase; padding: 0.18rem 0.55rem; border-radius: 2px; font-weight: 500; }
.be2-login-wrap { min-height: 100vh; display: flex; align-items: center; justify-content: center; background: ${NAVY}; }
.be2-login-card { background: ${WHITE}; border-radius: 4px; padding: 2.5rem; width: 100%; max-width: 340px; text-align: center; }
select.be2-admin-input { appearance: none; -webkit-appearance: none; }
select.be2-input { appearance: none; -webkit-appearance: none; }
textarea.be2-input { resize: vertical; min-height: 80px; }
@media (max-width: 768px) { .be2-admin-sidebar { display: none; } .be2-admin-content { margin-left: 0; } }
`;

// ─────────────────────────────────────────────────────────────
export default function App() {
  const [mode, setMode] = useState("estimator");
  const [adminPw, setAdminPw] = useState("");
  const [adminAuth, setAdminAuth] = useState(false);
  const [adminTab, setAdminTab] = useState("quotes");
  const [settings, setSettings] = useState(loadSettings());
  const [quotes, setQuotes] = useState(loadQuotes());
  const [selectedQuote, setSelectedQuote] = useState(null);
  const [settingsChanged, setSettingsChanged] = useState(false);

  const [step, setStep] = useState(1);
  const [serviceType, setServiceType] = useState("");
  const [packageType, setPackageType] = useState("");
  const [squareFeet, setSquareFeet] = useState("");
  const [addons, setAddons] = useState({});
  const [calc, setCalc] = useState(null);
  const [lead, setLead] = useState({ name: "", phone: "", email: "", zip: "", contactMethod: "Phone call", notes: "" });
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => { if (step === 5) setCalc(calculateQuote({ serviceType, packageType, squareFeet, addons }, settings)); }, [step]);

  const toggleAddon = id => setAddons(a => ({ ...a, [id]: !a[id] }));

  const canProceed = () => {
    if (step === 1) return !!serviceType;
    if (step === 2) return !!packageType;
    if (step === 3) return parseFloat(squareFeet) >= 1;
    if (step === 6) return lead.name && lead.phone && lead.email && lead.zip;
    return true;
  };

  const handleSubmit = async () => {
    if (!canProceed()) return;
    setSubmitting(true);
    const addonsSelected = Object.keys(addons).filter(k => addons[k]);
    const quote = { id: `BE-${Date.now()}`, timestamp: new Date().toISOString(), status: "new", name: lead.name, phone: lead.phone, email: lead.email, zip: lead.zip, contactMethod: lead.contactMethod, serviceType, packageType, squareFeet, addonsSelected, calc, notes: lead.notes };
    const updated = [quote, ...quotes];
    setQuotes(updated);
    saveQuotes(updated);
    if (settings.global.webhookUrl) { try { await fetch(settings.global.webhookUrl, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(quote) }); } catch {} }
    setTimeout(() => { setSubmitting(false); setSubmitted(true); }, 900);
  };

  const reset = () => { setStep(1); setServiceType(""); setPackageType(""); setSquareFeet(""); setAddons({}); setCalc(null); setLead({ name: "", phone: "", email: "", zip: "", contactMethod: "Phone call", notes: "" }); setSubmitted(false); };

  const updateQuoteStatus = (id, status) => {
    const updated = quotes.map(q => q.id === id ? { ...q, status } : q);
    setQuotes(updated); saveQuotes(updated);
    if (selectedQuote?.id === id) setSelectedQuote({ ...selectedQuote, status });
  };

  const updateSettings = (path, value) => {
    const parts = path.split(".");
    setSettings(prev => {
      const next = JSON.parse(JSON.stringify(prev));
      let obj = next;
      for (let i = 0; i < parts.length - 1; i++) obj = obj[parts[i]];
      obj[parts[parts.length - 1]] = value;
      return next;
    });
    setSettingsChanged(true);
  };

  const saveSettingsLocal = () => { saveSettings(settings); setSettingsChanged(false); alert("Settings saved."); };

  const pkgLabel = t => t === "premium" ? settings.packageLabels.premium.name : settings.packageLabels.normal.name;

  // ── Progress bar ──
  const ProgressBar = () => {
    const items = [];
    for (let i = 1; i <= 6; i++) {
      const cls = i < step ? "done" : i === step ? "active" : "pending";
      items.push(<div key={i} className={`be2-pdot ${cls}`}>{i < step ? "✓" : i}</div>);
      if (i < 6) items.push(<div key={`l${i}`} className={`be2-pline${i < step ? " done" : ""}`} />);
    }
    return (
      <div className="be2-progress-wrap">
        <div className="be2-progress">{items}</div>
        <div className="be2-step-name">Step {step} of 6 — {STEP_LABELS[step - 1]}</div>
      </div>
    );
  };

  // ── ADMIN ──
  if (mode === "login") return (
    <div className="be2-admin-root">
      <style>{CSS}</style>
      <div className="be2-login-wrap">
        <div className="be2-login-card">
          <div style={{ display: "flex", justifyContent: "center", marginBottom: "1.25rem" }}><BrandLogo size="sm" /></div>
          <p style={{ fontSize: "0.68rem", letterSpacing: "0.14em", textTransform: "uppercase", color: GRAY_MID, marginBottom: "1.5rem" }}>Owner Portal</p>
          <input className="be2-input" type="password" placeholder="Admin password" value={adminPw}
            onChange={e => setAdminPw(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter") { if (adminPw === ADMIN_PASSWORD) { setAdminAuth(true); setMode("admin"); } else alert("Incorrect password."); } }}
          />
          <br /><br />
          <button className="be2-btn-primary be2-btn-full" onClick={() => { if (adminPw === ADMIN_PASSWORD) { setAdminAuth(true); setMode("admin"); } else alert("Incorrect password."); }}>Sign In</button>
          <br /><br />
          <button style={{ background: "none", border: "none", color: GRAY_MID, fontSize: "0.75rem", cursor: "pointer" }} onClick={() => setMode("estimator")}>← Back to Estimator</button>
          <p style={{ fontSize: "0.65rem", color: "#BBB", marginTop: "1rem" }}>Default: epoxy2024</p>
        </div>
      </div>
    </div>
  );

  if (mode === "admin" && adminAuth) return (
    <div className="be2-admin-root">
      <style>{CSS}</style>
      <aside className="be2-admin-sidebar">
        <div className="be2-admin-logo">Best Epoxy<small>Admin Dashboard</small></div>
        <nav className="be2-admin-nav">
          {[["quotes","Quote Requests"],["pricing","Pricing & Packages"],["addons","Add-On Pricing"],["global","Global Settings"],["labels","Package Labels"]].map(([id, lbl]) => (
            <button key={id} className={`be2-admin-nav-item${adminTab === id ? " active" : ""}`} onClick={() => setAdminTab(id)}>{lbl}</button>
          ))}
          <div style={{ borderTop: "1px solid #2A3A5A", marginTop: "1rem", paddingTop: "0.5rem" }}>
            <button className="be2-admin-nav-item" style={{ color: GOLD }} onClick={() => exportToCSV(quotes)}>Export CSV</button>
            <button className="be2-admin-nav-item" onClick={() => setMode("estimator")}>← Estimator</button>
            <button className="be2-admin-nav-item" onClick={() => { setAdminAuth(false); setMode("login"); }}>Sign Out</button>
          </div>
        </nav>
      </aside>
      <main className="be2-admin-content">
        {adminTab === "quotes" && <AdminQuotes quotes={quotes} onSelect={setSelectedQuote} onStatusChange={updateQuoteStatus} />}
        {adminTab === "pricing" && <AdminPricing settings={settings} updateSettings={updateSettings} onSave={saveSettingsLocal} changed={settingsChanged} />}
        {adminTab === "addons" && <AdminAddons settings={settings} updateSettings={updateSettings} onSave={saveSettingsLocal} changed={settingsChanged} />}
        {adminTab === "global" && <AdminGlobal settings={settings} updateSettings={updateSettings} onSave={saveSettingsLocal} changed={settingsChanged} />}
        {adminTab === "labels" && <AdminLabels settings={settings} updateSettings={updateSettings} onSave={saveSettingsLocal} changed={settingsChanged} />}
      </main>
      {selectedQuote && <QuoteModal quote={selectedQuote} onClose={() => setSelectedQuote(null)} onStatusChange={updateQuoteStatus} />}
    </div>
  );

  // ── ESTIMATOR ──
  return (
    <div className="be2-root">
      <style>{CSS}</style>

      {/* Header */}
      <header className="be2-page-header">
        <BrandLogo size="sm" />
        <span className="be2-header-tagline">Luxury Floors & Countertops — Las Vegas</span>
        <button className="be2-nav-admin" onClick={() => setMode("login")}>Owner</button>
      </header>

      {/* Hero */}
      {step === 1 && !submitted && (
        <div className="be2-hero">
          <div className="be2-hero-eyebrow">Instant Quote Estimator</div>
          <h1 className="be2-hero-title">What will your<br /><em>transformation</em> cost?</h1>
          <p className="be2-hero-sub">Answer a few simple questions and receive a refined preliminary estimate — no pressure, no obligations.</p>
        </div>
      )}

      {/* Trust bar */}
      {step === 1 && !submitted && (
        <div className="be2-trust">
          {["Licensed & Insured in Nevada", "No-Obligation Estimate", "Same-Day Response", "Luxury Results Guaranteed"].map(t => (
            <div className="be2-trust-item" key={t}><div className="be2-trust-dot" />{t}</div>
          ))}
        </div>
      )}

      <div style={{ padding: "0 1.5rem 4rem" }}>
        {!submitted ? (
          <>
            <ProgressBar />

            {/* STEP 1 */}
            {step === 1 && (
              <div className="be2-card">
                <div className="be2-card-title">What type of surface?</div>
                <p className="be2-card-sub">Select the area you'd like transformed.</p>
                <div className="be2-service-grid">
                  {SERVICE_OPTIONS.map(s => (
                    <button key={s.id} className={`be2-svc-btn${serviceType === s.id ? " sel" : ""}`} onClick={() => setServiceType(s.id)}>
                      <div className="be2-svc-icon">{s.icon}</div>
                      <div className="be2-svc-label">{s.label}</div>
                      <div className="be2-svc-sub">{s.sub}</div>
                    </button>
                  ))}
                </div>
                <div className="be2-btn-row">
                  <button className="be2-btn-primary" disabled={!canProceed()} onClick={() => setStep(2)}>Continue →</button>
                </div>
              </div>
            )}

            {/* STEP 2 */}
            {step === 2 && (
              <div className="be2-card">
                <div className="be2-card-title">Choose your finish level</div>
                <p className="be2-card-sub">Both packages deliver stunning, durable results — the difference is in performance and longevity.</p>
                <div className="be2-pkg-grid">
                  <div className={`be2-pkg${packageType === "normal" ? " sel" : ""}`} onClick={() => setPackageType("normal")}>
                    <div className="be2-pkg-badge">{settings.packageLabels.normal.name}</div>
                    <div className="be2-pkg-name">{settings.packageLabels.normal.name}</div>
                    <div className="be2-pkg-line">{settings.packageLabels.normal.tagline}</div>
                    <ul className="be2-pkg-features">{settings.packageLabels.normal.features.map((f, i) => <li key={i}>{f}</li>)}</ul>
                  </div>
                  <div className={`be2-pkg dark${packageType === "premium" ? " sel" : ""}`} onClick={() => setPackageType("premium")}>
                    <div className="be2-pkg-badge">{settings.packageLabels.premium.name}</div>
                    <div className="be2-pkg-name">{settings.packageLabels.premium.name}</div>
                    <div className="be2-pkg-line">{settings.packageLabels.premium.tagline}</div>
                    <ul className="be2-pkg-features">{settings.packageLabels.premium.features.map((f, i) => <li key={i}>{f}</li>)}</ul>
                  </div>
                </div>
                <div className="be2-btn-row">
                  <button className="be2-btn-back" onClick={() => setStep(1)}>Back</button>
                  <button className="be2-btn-primary" disabled={!canProceed()} onClick={() => setStep(3)}>Continue →</button>
                </div>
              </div>
            )}

            {/* STEP 3 */}
            {step === 3 && (
              <div className="be2-card">
                <div className="be2-card-title">Approximate size</div>
                <p className="be2-card-sub">Enter square footage or select a common size below.</p>
                <div className="be2-size-chips">
                  {SIZE_PRESETS.map(p => (
                    <button key={p.label} className="be2-chip" onClick={() => setSquareFeet(String(p.sqft))}>{p.label} (~{p.sqft} sq ft)</button>
                  ))}
                </div>
                <div className="be2-field">
                  <label className="be2-label">Square Footage</label>
                  <div className="be2-sqft-wrap">
                    <input className="be2-input" type="number" placeholder="e.g. 500" value={squareFeet} min="1" onChange={e => setSquareFeet(e.target.value)} />
                    <span className="be2-sqft-unit">sq ft</span>
                  </div>
                </div>
                {squareFeet && parseFloat(squareFeet) >= settings.global.commercialThresholdSqFt && (
                  <div style={{ padding: "0.7rem 0.9rem", background: "#FEF9E7", border: "1px solid #FAD7A0", borderRadius: "2px", fontSize: "0.78rem", color: "#8A6010", marginBottom: "1rem" }}>
                    Projects of this scale receive a custom commercial proposal.
                  </div>
                )}
                <div className="be2-btn-row">
                  <button className="be2-btn-back" onClick={() => setStep(2)}>Back</button>
                  <button className="be2-btn-primary" disabled={!canProceed()} onClick={() => setStep(4)}>Continue →</button>
                </div>
              </div>
            )}

            {/* STEP 4 */}
            {step === 4 && (
              <div className="be2-card">
                <div className="be2-card-title">Any special conditions?</div>
                <p className="be2-card-sub">Select anything that applies — this helps us refine your estimate. Skip if nothing applies.</p>
                <div className="be2-addons">
                  {ADDON_OPTIONS.map(a => (
                    <div key={a.id} className={`be2-addon${addons[a.id] ? " chk" : ""}`} onClick={() => toggleAddon(a.id)}>
                      <div className="be2-addon-box">{addons[a.id] ? "✓" : ""}</div>
                      <div><div className="be2-addon-text">{a.label}</div><div className="be2-addon-hint">{a.hint}</div></div>
                    </div>
                  ))}
                </div>
                <div className="be2-btn-row">
                  <button className="be2-btn-back" onClick={() => setStep(3)}>Back</button>
                  <button className="be2-btn-primary" onClick={() => setStep(5)}>See My Estimate →</button>
                </div>
              </div>
            )}

            {/* STEP 5 */}
            {step === 5 && calc && (
              <div className="be2-card">
                <div className="be2-card-title">Your preliminary estimate</div>
                <p className="be2-card-sub">Based on your selections, here is your refined starting estimate.</p>
                {calc.isCommercialReview ? (
                  <div style={{ padding: "2rem", background: GRAY_LIGHT, borderRadius: "3px", textAlign: "center", marginBottom: "1.25rem" }}>
                    <div style={{ fontFamily: F_SERIF, fontSize: "1.3rem", color: NAVY, marginBottom: "0.5rem" }}>Custom Commercial Review</div>
                    <p style={{ fontSize: "0.83rem", color: GRAY_MID }}>Projects of this scale receive a detailed custom proposal. Our team will reach out promptly.</p>
                  </div>
                ) : (
                  <>
                    <div className="be2-est-box">
                      <div className="be2-est-eyebrow">Estimated Investment</div>
                      <div className="be2-est-range">${calc.low.toLocaleString()} – ${calc.high.toLocaleString()}</div>
                      <div className="be2-est-note">Final price confirmed after complimentary site review</div>
                    </div>
                    <div className="be2-meta">
                      <div className="be2-meta-item"><div className="be2-meta-lbl">Package</div><div className="be2-meta-val" style={{ fontFamily: F_SERIF }}>{pkgLabel(packageType)}</div></div>
                      <div className="be2-meta-item"><div className="be2-meta-lbl">Turnaround</div><div className="be2-meta-val">{calc.turnaroundDays} days</div></div>
                      <div className="be2-meta-item"><div className="be2-meta-lbl">Warranty</div><div className="be2-meta-val">{calc.warrantyYears} Years</div></div>
                    </div>
                  </>
                )}
                <p className="be2-disclaimer">This is a preliminary estimate based on your inputs. Actual pricing is confirmed after a complimentary on-site assessment. Prices may vary based on surface condition, access, and preparation requirements.</p>
                <div className="be2-btn-row">
                  <button className="be2-btn-back" onClick={() => setStep(4)}>Back</button>
                  <button className="be2-btn-primary" onClick={() => setStep(6)}>Request My Quote →</button>
                </div>
              </div>
            )}

            {/* STEP 6 */}
            {step === 6 && (
              <div className="be2-card">
                <div className="be2-card-title">Reserve your consultation</div>
                <p className="be2-card-sub">A Best Epoxy specialist will review your project and reach out within one business day.</p>
                <div className="be2-field"><label className="be2-label">Full Name</label><input className="be2-input" placeholder="Your name" value={lead.name} onChange={e => setLead(l => ({ ...l, name: e.target.value }))} /></div>
                <div className="be2-field"><label className="be2-label">Phone</label><input className="be2-input" placeholder="(702) 555-0100" type="tel" value={lead.phone} onChange={e => setLead(l => ({ ...l, phone: e.target.value }))} /></div>
                <div className="be2-field"><label className="be2-label">Email</label><input className="be2-input" placeholder="you@email.com" type="email" value={lead.email} onChange={e => setLead(l => ({ ...l, email: e.target.value }))} /></div>
                <div className="be2-two-col">
                  <div className="be2-field"><label className="be2-label">ZIP Code</label><input className="be2-input" placeholder="89101" value={lead.zip} onChange={e => setLead(l => ({ ...l, zip: e.target.value }))} /></div>
                  <div className="be2-field"><label className="be2-label">Preferred Contact</label>
                    <select className="be2-input" value={lead.contactMethod} onChange={e => setLead(l => ({ ...l, contactMethod: e.target.value }))}>
                      {["Phone call","Text message","Email"].map(m => <option key={m}>{m}</option>)}
                    </select>
                  </div>
                </div>
                <div className="be2-field"><label className="be2-label">Additional Notes (optional)</label><textarea className="be2-input" placeholder="Any details about your project..." value={lead.notes} onChange={e => setLead(l => ({ ...l, notes: e.target.value }))} /></div>
                <div style={{ padding: "0.7rem 0.9rem", background: GRAY_LIGHT, borderRadius: "2px", fontSize: "0.74rem", color: GRAY_MID, marginBottom: "1rem" }}>
                  Have a photo of the space? Email it to <strong>contact@bestepoxypro.com</strong> after submitting.
                </div>
                <div className="be2-btn-row">
                  <button className="be2-btn-back" onClick={() => setStep(5)}>Back</button>
                  <button className="be2-btn-primary" disabled={!canProceed() || submitting} onClick={handleSubmit}>
                    {submitting ? "Sending…" : "Submit My Request ✓"}
                  </button>
                </div>
                <p style={{ fontSize: "0.68rem", color: GRAY_MID, textAlign: "center", marginTop: "0.85rem" }}>We never share your information. No spam, ever.</p>
              </div>
            )}
          </>
        ) : (
          /* Confirmation */
          <div className="be2-confirm">
            <div className="be2-confirm-icon">✓</div>
            <div className="be2-confirm-title">You're all set, {lead.name.split(" ")[0]}.</div>
            <p className="be2-confirm-sub">Your {pkgLabel(packageType)} estimate request has been received. A Best Epoxy specialist will reach out via {lead.contactMethod.toLowerCase()} within one business day.</p>
            {calc && !calc.isCommercialReview && (
              <div className="be2-confirm-range">
                <div className="be2-confirm-range-lbl">Your Preliminary Range</div>
                <div className="be2-confirm-range-val">${calc.low.toLocaleString()} – ${calc.high.toLocaleString()}</div>
              </div>
            )}
            <button className="be2-btn-back" style={{ margin: "0 auto" }} onClick={reset}>Start a New Estimate</button>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="be2-footer">
        <div className="be2-footer-logo"><BrandLogo size="sm" /></div>
        <div className="be2-footer-links">
          <a href="https://www.bestepoxy.pro" className="be2-footer-link">bestepoxy.pro</a>
          <a href="tel:7027109010" className="be2-footer-link">702-710-9010</a>
          <a href="mailto:contact@bestepoxypro.com" className="be2-footer-link">contact@bestepoxypro.com</a>
        </div>
        <div className="be2-footer-copy">© 2025 Best Epoxy Solutions · Las Vegas, Nevada · Licensed & Insured</div>
      </footer>
    </div>
  );
}

// ── Admin panels (same as before, compact) ──────────────────
function AdminQuotes({ quotes, onSelect, onStatusChange }) {
  const [filter, setFilter] = useState("all");
  const filtered = filter === "all" ? quotes : quotes.filter(q => q.status === filter);
  return (
    <div>
      <div className="be2-admin-hdr">
        <div className="be2-admin-title">Quote Requests</div>
        <select className="be2-admin-input" style={{ width: "auto" }} value={filter} onChange={e => setFilter(e.target.value)}>
          <option value="all">All ({quotes.length})</option>
          {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>
      {filtered.length === 0 ? (
        <div style={{ textAlign: "center", padding: "3rem", color: GRAY_MID, fontStyle: "italic" }}>No quotes yet. Submit one from the estimator.</div>
      ) : (
        <div className="be2-table-wrap">
          <table className="be2-table">
            <thead><tr><th>ID</th><th>Date</th><th>Name</th><th>Service</th><th>Package</th><th>Sq Ft</th><th>Estimate</th><th>Status</th><th></th></tr></thead>
            <tbody>
              {filtered.map(q => (
                <tr key={q.id}>
                  <td style={{ fontFamily: "monospace", fontSize: "0.7rem", color: GRAY_MID }}>{q.id}</td>
                  <td style={{ whiteSpace: "nowrap" }}>{new Date(q.timestamp).toLocaleDateString()}</td>
                  <td style={{ fontWeight: 500 }}>{q.name}</td>
                  <td style={{ textTransform: "capitalize" }}>{q.serviceType}</td>
                  <td style={{ textTransform: "capitalize" }}>{q.packageType}</td>
                  <td>{q.squareFeet}</td>
                  <td style={{ fontWeight: 500 }}>{q.calc?.isCommercialReview ? "Custom" : q.calc ? `$${q.calc.low?.toLocaleString()}–$${q.calc.high?.toLocaleString()}` : "—"}</td>
                  <td>
                    <select className="be2-admin-input" style={{ fontSize: "0.7rem", padding: "0.22rem 0.45rem" }} value={q.status} onChange={e => onStatusChange(q.id, e.target.value)}>
                      {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </td>
                  <td><button className="be2-admin-nav-item" style={{ padding: "0.28rem 0.7rem", color: GOLD, fontSize: "0.7rem" }} onClick={() => onSelect(q)}>View</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function QuoteModal({ quote: q, onClose, onStatusChange }) {
  return (
    <div className="be2-modal-overlay" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="be2-modal">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1.25rem" }}>
          <div>
            <div style={{ fontFamily: F_SERIF, fontSize: "1.3rem", color: NAVY }}>{q.name}</div>
            <div style={{ fontSize: "0.68rem", color: GRAY_MID }}>{q.id} · {new Date(q.timestamp).toLocaleString()}</div>
          </div>
          <select className="be2-admin-input" style={{ width: "auto" }} value={q.status} onChange={e => onStatusChange(q.id, e.target.value)}>
            {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.9rem", marginBottom: "1rem" }}>
          {[["Phone", q.phone], ["Email", q.email], ["ZIP", q.zip], ["Contact Method", q.contactMethod], ["Service", q.serviceType], ["Package", q.packageType], ["Sq Ft", q.squareFeet], ["Add-ons", (q.addonsSelected||[]).join(", ") || "None"]].map(([lbl, val]) => (
            <div key={lbl}>
              <div style={{ fontSize: "0.62rem", letterSpacing: "0.1em", textTransform: "uppercase", color: GRAY_MID, marginBottom: "0.15rem" }}>{lbl}</div>
              <div style={{ fontSize: "0.85rem", color: NAVY }}>{val || "—"}</div>
            </div>
          ))}
        </div>
        {q.notes && <div style={{ padding: "0.7rem", background: GRAY_LIGHT, borderRadius: "2px", fontSize: "0.8rem", marginBottom: "1rem" }}><strong>Notes:</strong> {q.notes}</div>}
        {q.calc && (
          <div className="be2-internal-box">
            <span className="ilabel">⬤ Internal Details — Not Shown to Customer</span>
            {[["Hidden Base System", q.calc.hiddenBaseSystem], ["Hidden Top Coat", q.calc.hiddenTopCoat], ["Estimate Shown", `$${q.calc.low?.toLocaleString()} – $${q.calc.high?.toLocaleString()}`], ["Internal Material Cost", `$${q.calc.internalMaterialCost?.toLocaleString()}`], ["Internal Labor Cost", `$${q.calc.internalLaborCost?.toLocaleString()}`], ["Total Internal Cost", `$${q.calc.internalTotalCost?.toLocaleString()}`], ["Est. Margin", `${q.calc.margin}%`], ["Warranty", `${q.calc.warrantyYears} years`], ["Turnaround", `${q.calc.turnaroundDays} days`]].map(([lbl, val]) => (
              <div key={lbl} className="be2-irow"><span>{lbl}</span><span>{val}</span></div>
            ))}
          </div>
        )}
        {q.calc?.ownerFollowUpNotes && <div style={{ padding: "0.7rem", background: "#FEF9E7", border: "1px solid #FAD7A0", borderRadius: "2px", fontSize: "0.78rem", color: "#7A5E1A", marginBottom: "1rem" }}><strong>Follow-up:</strong> {q.calc.ownerFollowUpNotes}</div>}
        <button className="be2-btn-back" onClick={onClose}>Close</button>
      </div>
    </div>
  );
}

function AdminPricing({ settings, updateSettings, onSave, changed }) {
  return (
    <div>
      <div className="be2-admin-hdr">
        <div className="be2-admin-title">Pricing & Packages</div>
        {changed && <button className="be2-btn-primary" style={{ width: "auto", padding: "0.6rem 1.5rem" }} onClick={onSave}>Save Changes</button>}
      </div>
      {Object.keys(settings.packages).map(key => {
        const pkg = settings.packages[key];
        return (
          <div className="be2-settings-section" key={key}>
            <div className="be2-settings-title">{key.replace("_", " – ").toUpperCase()}</div>
            <div className="be2-settings-grid">
              {[["Price/sqft ($)", "pricePerSqFt"], ["Material Cost/sqft ($)", "materialCostPerSqFt"], ["Labor Cost/sqft ($)", "laborCostPerSqFt"], ["Prep/sqft ($)", "prepAllowancePerSqFt"], ["Warranty (yrs)", "warrantyYears"], ["Turnaround (days)", "turnaroundDays"]].map(([lbl, f]) => (
                <div className="be2-admin-field" key={f}>
                  <label className="be2-admin-label">{lbl}</label>
                  <input className="be2-admin-input" value={pkg[f]} onChange={e => updateSettings(`packages.${key}.${f}`, f === "turnaroundDays" ? e.target.value : parseFloat(e.target.value) || 0)} />
                </div>
              ))}
              <div className="be2-admin-field" style={{ gridColumn: "span 2" }}>
                <label className="be2-admin-label">Hidden Base System</label>
                <input className="be2-admin-input" value={pkg.hiddenBaseSystem} onChange={e => updateSettings(`packages.${key}.hiddenBaseSystem`, e.target.value)} />
              </div>
              <div className="be2-admin-field" style={{ gridColumn: "span 2" }}>
                <label className="be2-admin-label">Hidden Top Coat</label>
                <input className="be2-admin-input" value={pkg.hiddenTopCoat} onChange={e => updateSettings(`packages.${key}.hiddenTopCoat`, e.target.value)} />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function AdminAddons({ settings, updateSettings, onSave, changed }) {
  return (
    <div>
      <div className="be2-admin-hdr">
        <div className="be2-admin-title">Add-On Pricing</div>
        {changed && <button className="be2-btn-primary" style={{ width: "auto", padding: "0.6rem 1.5rem" }} onClick={onSave}>Save Changes</button>}
      </div>
      <div className="be2-settings-section">
        <div className="be2-settings-title">Add-On & Condition Pricing</div>
        <div className="be2-settings-grid">
          {[["Crack Repair/sqft ($)", "crackRepairPerSqFt"], ["Heavy Prep/sqft ($)", "heavyPrepPerSqFt"], ["Moisture Mitigation/sqft ($)", "moistureMitigationPerSqFt"], ["Stem Walls/lin ft ($)", "stemWallsPerLinFt"], ["Outdoor UV Upgrade/sqft ($)", "outdoorUVUpgradePerSqFt"], ["Old Coating Removal/sqft ($)", "oldCoatingRemovalPerSqFt"], ["Rush Multiplier", "rushJobMultiplier"], ["Unknown Condition Buffer", "unknownConditionBuffer"]].map(([lbl, f]) => (
            <div className="be2-admin-field" key={f}>
              <label className="be2-admin-label">{lbl}</label>
              <input className="be2-admin-input" type="number" step="0.01" value={settings.addons[f]} onChange={e => updateSettings(`addons.${f}`, parseFloat(e.target.value) || 0)} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function AdminGlobal({ settings, updateSettings, onSave, changed }) {
  const g = settings.global;
  return (
    <div>
      <div className="be2-admin-hdr">
        <div className="be2-admin-title">Global Settings</div>
        {changed && <button className="be2-btn-primary" style={{ width: "auto", padding: "0.6rem 1.5rem" }} onClick={onSave}>Save Changes</button>}
      </div>
      <div className="be2-settings-section">
        <div className="be2-settings-title">Calculation Rules</div>
        <div className="be2-settings-grid">
          {[["Min Job Charge ($)", "minimumJobCharge"], ["Waste Factor", "wasteFactor"], ["Contingency", "contingency"], ["Rush Multiplier", "rushMultiplier"], ["Commercial Threshold (sqft)", "commercialThresholdSqFt"], ["Low Estimate ×", "lowEstimateMultiplier"], ["High Estimate ×", "highEstimateMultiplier"]].map(([lbl, f]) => (
            <div className="be2-admin-field" key={f}>
              <label className="be2-admin-label">{lbl}</label>
              <input className="be2-admin-input" type="number" step="0.01" value={g[f]} onChange={e => updateSettings(`global.${f}`, parseFloat(e.target.value) || 0)} />
            </div>
          ))}
        </div>
      </div>
      <div className="be2-settings-section">
        <div className="be2-settings-title">Notifications</div>
        <div className="be2-settings-grid">
          <div className="be2-admin-field"><label className="be2-admin-label">Owner Email</label><input className="be2-admin-input" value={g.ownerEmail} onChange={e => updateSettings("global.ownerEmail", e.target.value)} /></div>
          <div className="be2-admin-field"><label className="be2-admin-label">Owner Phone</label><input className="be2-admin-input" value={g.ownerPhone} onChange={e => updateSettings("global.ownerPhone", e.target.value)} /></div>
          <div className="be2-admin-field" style={{ gridColumn: "span 2" }}>
            <label className="be2-admin-label">Webhook URL (GoHighLevel / Zapier / Make)</label>
            <input className="be2-admin-input" placeholder="https://hooks.zapier.com/..." value={g.webhookUrl} onChange={e => updateSettings("global.webhookUrl", e.target.value)} />
          </div>
        </div>
      </div>
    </div>
  );
}

function AdminLabels({ settings, updateSettings, onSave, changed }) {
  return (
    <div>
      <div className="be2-admin-hdr">
        <div className="be2-admin-title">Package Labels & Copy</div>
        {changed && <button className="be2-btn-primary" style={{ width: "auto", padding: "0.6rem 1.5rem" }} onClick={onSave}>Save Changes</button>}
      </div>
      {["normal", "premium"].map(tier => {
        const pl = settings.packageLabels[tier];
        return (
          <div className="be2-settings-section" key={tier}>
            <div className="be2-settings-title">{tier === "normal" ? "Essential" : "Signature"} — Customer Labels</div>
            <div className="be2-admin-field"><label className="be2-admin-label">Package Name</label><input className="be2-admin-input" value={pl.name} onChange={e => updateSettings(`packageLabels.${tier}.name`, e.target.value)} /></div>
            <div className="be2-admin-field"><label className="be2-admin-label">Tagline</label><input className="be2-admin-input" value={pl.tagline} onChange={e => updateSettings(`packageLabels.${tier}.tagline`, e.target.value)} /></div>
            {pl.features.map((f, i) => (
              <div className="be2-admin-field" key={i}>
                <label className="be2-admin-label">Feature {i + 1}</label>
                <input className="be2-admin-input" value={f} onChange={e => { const u = [...pl.features]; u[i] = e.target.value; updateSettings(`packageLabels.${tier}.features`, u); }} />
              </div>
            ))}
          </div>
        );
      })}
    </div>
  );
}
