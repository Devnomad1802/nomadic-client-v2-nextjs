"use client";

/* eslint-disable react/prop-types */
/**
 * HostOnboarding — standalone, token-gated host onboarding page, rebuilt to
 * match the approved HTML design pixel-for-pixel (card sections, numbered rail,
 * 3-column field grid, switch toggles, comma-separated array inputs, repeatable
 * FAQ + badges). Reached only via the secure link emailed after an application
 * is moved to "Reviewing": /host-onboarding/{token}.
 *
 * Field ids ARE the backend Host keys, so the multipart submit is a near-identity
 * map into a DRAFT host (status:"draft") the admin reviews in Add/Edit Host.
 * Backend, endpoint, token flow and validation are unchanged — UI only.
 *
 * Comma inputs (specialties, languages, achievements, regionsHosted, ageGroups)
 * behave exactly like the Add New Host form: typed comma-separated, submitted as
 * arrays (csv → JSON).
 */
import { useEffect, useMemo, useRef, useState, useCallback } from "react";

// kind: text | area | select | num | toggle   ·   csv:1 → comma list → array
// admin:1 → managed by our team (read-only, never submitted by the host)
const SECTIONS = [
  { id: "basic", title: "Basic Information",
    desc: "Core identity and location for this host — as it appears in the Add New Host record.",
    blocks: [{ type: "fields", fields: [
      { id: "hostName", label: "Host Name", req: 1, ph: "Enter host name" },
      { id: "location", label: "Location", ph: "Enter location" },
      { id: "city", label: "City", ph: "Enter city" },
      { id: "state", label: "State", ph: "Enter state" },
      { id: "pincode", label: "Pincode", ph: "Enter pincode" },
      { id: "completeAddress", label: "Complete Address", ph: "Enter complete address", span: "1 / -1" },
    ] }] },

  { id: "business", title: "Business Information",
    desc: "Registration identifiers. Kept private and used only for verification.",
    blocks: [{ type: "fields", fields: [
      { id: "panNumber", label: "PAN Number", ph: "Enter PAN number", help: "🔒 Private · format ABCDE1234F" },
      { id: "gstNumber", label: "GST Number", ph: "Enter GST number", help: "🔒 Private · optional" },
    ] }] },

  { id: "bank", title: "Bank Account Details",
    desc: "Used only to send payouts. Never shown publicly. All four fields are required by the backend.",
    blocks: [{ type: "fields", fields: [
      { id: "bankName", label: "Bank Name", req: 1, ph: "Enter bank name" },
      { id: "accountHolderName", label: "Account Holder Name", req: 1, ph: "Enter account holder name" },
      { id: "accountNumber", label: "Account Number", req: 1, ph: "Enter account number" },
      { id: "ifscCode", label: "IFSC Code", req: 1, ph: "Enter IFSC code", help: "e.g. HDFC0001234" },
    ] }] },

  { id: "branding", title: "Branding",
    desc: "How this host appears across Nomadic Townies. Great imagery drives more bookings.",
    blocks: [
      { type: "fields", fields: [
        { id: "hostTitle", label: "Host Title", ph: "Enter host title" },
        { id: "tagline", label: "Tagline", ph: "Enter short tagline…" },
      ] },
      { type: "uploads", uploads: [
        { id: "logo", title: "Logo", accept: "image/*", help: "Square · min 400×400 · JPG/PNG" },
        { id: "coverImage", title: "Cover Upload", accept: "image/*", help: "Wide landscape · min 1600×900" },
      ] },
    ] },

  { id: "about", title: "About",
    desc: "The story and highlights shown on the public host page.",
    blocks: [
      { type: "fields", fields: [
        { id: "shortBio", label: "Short Bio (card description)", ph: "One-line description shown on the Meet Our Hosts card (optional)", span: "1 / -1" },
        { id: "hostOverview", label: "Host Overview", kind: "area", rows: 5, ph: "Enter host overview here…", span: "1 / -1" },
        { id: "foundedYear", label: "Founded Year", kind: "select", ph: "Select year" },
        { id: "experience", label: "Experience", ph: "Enter experience" },
        { id: "hqLocation", label: "HQ Location", ph: "Enter HQ location" },
        { id: "achievements", label: "Achievements", csv: 1, ph: "e.g. Wilderness First-Aid, UIMLA Mountain Leader, Top-rated 2025", span: "1 / -1", help: "Comma separated. Shown as certification badges when no custom badges are set." },
      ] },
      { type: "uploads", sub: "Gallery", uploads: [
        { id: "gallery", title: "Gallery images", accept: "image/*", multiple: 1, help: "Add multiple photos of trips in action" },
      ] },
    ] },

  { id: "specialties", title: "Specialties & Expertise",
    desc: "Comma-separated lists that drive where this host appears and show travellers they know their terrain.",
    blocks: [{ type: "fields", fields: [
      { id: "specialties", label: "Specialties / Expertise (comma separated)", csv: 1, ph: "e.g. Trekking & guiding, Homestays, Photography walks", span: "1 / -1" },
      { id: "languages", label: "Languages (comma separated)", csv: 1, ph: "e.g. English, Nepali, Hindi, Tibetan", span: "1 / -1" },
    ] }] },

  { id: "faq", title: "Ask the Host (FAQ)",
    desc: "Common questions travellers ask, with the host's answer. These appear in the “Ask the host” section of the host detail page. Leave empty to show generic defaults.",
    blocks: [{ type: "faq" }] },

  { id: "badges", title: "Verification Badges",
    desc: "Trust badges shown in the “Verification & badges” section. Leave empty to auto-generate from Verified status, Achievements and rebook rate.",
    blocks: [{ type: "badges" }] },

  { id: "trust", title: "Trust & Service Quality",
    desc: "Performance stats. Verified status and hosted counts are set by our team after review; the response label and regions can be pre-filled.",
    blocks: [{ type: "fields", fields: [
      { id: "verified", label: "Verified", kind: "toggle", admin: 1, help: "Managed by our team" },
      { id: "tripsHosted", label: "Trips Hosted", kind: "num", admin: 1 },
      { id: "travellersHosted", label: "Travellers Hosted", kind: "num", admin: 1 },
      { id: "successRate", label: "Success Rate", kind: "num", admin: 1 },
      { id: "responseTimeLabel", label: "Response Time Label", ph: "Enter label…" },
      { id: "responseRate", label: "Response Rate (%)", kind: "num", admin: 1 },
      { id: "regionsHosted", label: "Regions Hosted (comma separated)", csv: 1, ph: "e.g. Annapurna, Everest, Mustang", span: "1 / -1" },
    ] }] },

  { id: "contact", title: "Contact",
    desc: "Coordination details. Travellers only ever reach the host through platform chat — direct contacts are never shown.",
    blocks: [{ type: "fields", fields: [
      { id: "email", label: "Email", req: 1, ph: "support@example.com", help: "Host account login" },
      { id: "phone", label: "Phone", ph: "(+91)" },
      { id: "whatsapp", label: "WhatsApp", ph: "Enter link…" },
      { id: "supportHours", label: "Support Hours", ph: "Enter hours…" },
    ] }] },

  { id: "docs", title: "Document Uploads",
    desc: "Clear photos or PDFs. Encrypted and only seen by our verification team.",
    blocks: [{ type: "uploads", uploads: [
      { id: "panCard", title: "PAN Card", accept: "image/*,application/pdf" },
      { id: "gstCertificate", title: "GST Certificate", accept: "image/*,application/pdf" },
      { id: "bankPassbook", title: "Bank Passbook", accept: "image/*,application/pdf" },
      { id: "businessLicense", title: "Business License", accept: "image/*,application/pdf" },
    ] }] },

  { id: "onboarding", title: "Host Onboarding Details",
    desc: "Extended profile the admin sees alongside the core record.",
    blocks: [
      { type: "fields", fields: [
        { id: "displayName", label: "Display Name", ph: "Public-facing name" },
        { id: "country", label: "Country", ph: "Country" },
        { id: "businessType", label: "Business Type", ph: "Individual / Pvt Ltd / LLP" },
        { id: "whyHost", label: "Why they host", ph: "Motivation" },
        { id: "uniqueValue", label: "What makes them unique", ph: "Unique value" },
        { id: "alternatePhone", label: "Alternate Phone", ph: "Alternate / emergency phone" },
      ] },
      { type: "fields", sub: "Emergency Contact", fields: [
        { id: "emergencyContactName", label: "Contact Name" },
        { id: "emergencyContactRole", label: "Role" },
        { id: "emergencyPreparedness", label: "Emergency preparedness / phone" },
      ] },
      { type: "fields", sub: "Service Quality", fields: [
        { id: "maxGroupSize", label: "Max Group Size" },
        { id: "typicalDuration", label: "Typical Duration" },
        { id: "difficultyLevels", label: "Difficulty Levels" },
        { id: "ageGroups", label: "Age Groups (comma-separated)", csv: 1 },
        { id: "firstAidOnTrips", label: "First-aid on trips?" },
      ] },
      { type: "uploads", sub: "Additional Documents", uploads: [
        { id: "idProof", title: "ID Proof (Aadhaar / Passport)", accept: "image/*,application/pdf" },
        { id: "certificationsLicenses", title: "Certifications & Licenses", accept: "image/*,application/pdf", multiple: 1 },
        { id: "insuranceDocuments", title: "Insurance Documents", accept: "image/*,application/pdf", multiple: 1 },
      ] },
    ] },

  { id: "finance", title: "Finance", admin: 1,
    desc: "Admin-only. Commission is set by our team.",
    blocks: [{ type: "fields", fields: [
      { id: "commissionRate", label: "Commission Rate", kind: "num", suffix: "%", admin: 1 },
    ] }] },

  { id: "seo", title: "SEO", admin: 1,
    desc: "Admin-only. Search metadata managed by our marketing team.",
    blocks: [{ type: "fields", fields: [
      { id: "seoTitle", label: "SEO Title", ph: "Enter SEO title", admin: 1 },
      { id: "slug", label: "Slug", ph: "Enter slug", admin: 1 },
      { id: "metaDescription", label: "Meta Description", kind: "area", rows: 3, ph: "Enter meta description", span: "1 / -1", admin: 1 },
    ] }] },
];

const REQUIRED = ["hostName", "email", "bankName", "accountHolderName", "accountNumber", "ifscCode"];
const CSV_FIELDS = ["specialties", "languages", "achievements", "regionsHosted", "ageGroups"];
const UPLOAD_IDS = ["logo", "coverImage", "gallery", "panCard", "gstCertificate", "bankPassbook",
  "businessLicense", "idProof", "certificationsLicenses", "insuranceDocuments"];

const KEY = "nt_host_onboarding_v3";
const FONT_CSS = "@import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,400..800&family=Hanken+Grotesk:wght@400;500;600;700;800&display=swap');";
const Fonts = () => <style>{FONT_CSS}</style>;

const isEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v || "");
const splitCsv = (s) => (s || "").split(",").map((x) => x.trim()).filter(Boolean);
const yearOptions = () => { const y = new Date().getFullYear(); const o = []; for (let i = y; i >= 1990; i--) o.push(String(i)); return o; };

export default function HostOnboarding({ token }) {
  const [phase, setPhase] = useState("loading");
  const [errKind, setErrKind] = useState(null);

  const [data, setData] = useState({});
  const [files, setFiles] = useState({});
  const [faqs, setFaqs] = useState([]);
  const [badges, setBadges] = useState([]);
  const [consent, setConsent] = useState(false);
  const [attempted, setAttempted] = useState(false);
  const [activeSec, setActiveSec] = useState(0);
  const [saveText, setSaveText] = useState("All changes saved");
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitErr, setSubmitErr] = useState(null);
  const saveTimer = useRef(null);

  // ── Token validate + prefill ────────────────────────────────────────────
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const r = await fetch(`/api/host-portal/onboarding/${token}`);
        const j = await r.json().catch(() => ({}));
        if (!alive) return;
        if (!r.ok || !j.ok) { setErrKind(j.error || "invalid"); setPhase("error"); return; }
        let restored = {};
        try { const raw = localStorage.getItem(KEY); if (raw) { const s = JSON.parse(raw); if (s.token === token) restored = s; } } catch (_e) { /* ignore */ }
        const pf = j.prefill || {};
        setData((d) => ({
          hostName: pf.hostName || "", email: pf.email || "", phone: pf.phone || "",
          city: pf.city || "", hostOverview: pf.overview || "", foundedYear: pf.foundedYear || "",
          specialties: (pf.categories || []).join(", "),
          ...(restored.data || {}), ...d,
        }));
        if (restored.faqs) setFaqs(restored.faqs);
        if (restored.badges) setBadges(restored.badges);
        if (restored.consent) setConsent(true);
        setPhase("form");
      } catch (_e) { if (alive) { setErrKind("network"); setPhase("error"); } }
    })();
    return () => { alive = false; };
  }, [token]);

  // ── Autosave ────────────────────────────────────────────────────────────
  const writeDraft = useCallback(() => {
    try { localStorage.setItem(KEY, JSON.stringify({ token, data, faqs, badges, consent })); } catch (_e) { /* ignore */ }
  }, [token, data, faqs, badges, consent]);

  useEffect(() => {
    if (phase !== "form") return undefined;
    const flash = setTimeout(() => { setSaving(true); setSaveText("Saving…"); }, 0);
    writeDraft();
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => { setSaving(false); setSaveText("All changes saved"); }, 600);
    return () => clearTimeout(flash);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, faqs, badges, consent]);

  // ── Scroll-spy ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (phase !== "form") return undefined;
    const onScroll = () => {
      let cur = 0;
      SECTIONS.forEach((s, i) => { const el = document.getElementById(`sec-${s.id}`); if (el && el.getBoundingClientRect().top <= 130) cur = i; });
      setActiveSec(cur);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, [phase]);

  // ── Setters ─────────────────────────────────────────────────────────────
  const setField = (id, v) => setData((d) => ({ ...d, [id]: v }));
  const toggleField = (id) => setData((d) => ({ ...d, [id]: !d[id] }));

  const onFile = (id, list, multiple) => { const arr = Array.from(list || []); if (arr.length) setFiles((f) => ({ ...f, [id]: multiple ? (f[id] || []).concat(arr) : arr.slice(0, 1) })); };
  const clearFile = (id, e) => { e?.stopPropagation?.(); setFiles((f) => { const n = { ...f }; delete n[id]; return n; }); };

  const setFaq = (i, k, v) => setFaqs((fs) => fs.map((f, idx) => (idx === i ? { ...f, [k]: v } : f)));
  const addFaq = () => setFaqs((fs) => fs.concat({ question: "", answer: "" }));
  const removeFaq = (i) => setFaqs((fs) => fs.filter((_, idx) => idx !== i));

  const setBadge = (i, k, v) => setBadges((bs) => bs.map((b, idx) => (idx === i ? { ...b, [k]: v } : b)));
  const addBadge = () => setBadges((bs) => bs.concat({ title: "", note: "" }));
  const removeBadge = (i) => setBadges((bs) => bs.filter((_, idx) => idx !== i));

  // ── Validation ──────────────────────────────────────────────────────────
  const fieldErr = (f) => {
    if (!attempted) return "";
    if (f.id === "email") return isEmail(data.email) ? "" : "Enter a valid email";
    if (f.req && !String(data[f.id] || "").trim()) return "Required";
    return "";
  };
  const missing = () => {
    const out = [];
    REQUIRED.forEach((id) => { const bad = id === "email" ? !isEmail(data.email) : !String(data[id] || "").trim(); if (bad) { const f = allFields().find((x) => x.id === id); out.push(f ? f.label : id); } });
    if (!consent) out.push("Consent");
    return out;
  };
  const allFields = () => { const o = []; SECTIONS.forEach((s) => (s.blocks || []).forEach((b) => (b.fields || []).forEach((f) => o.push(f)))); return o; };

  const scrollTo = (id) => { const el = document.getElementById(`sec-${id}`); if (el) window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 16, behavior: "smooth" }); };
  const saveLater = () => { writeDraft(); setSaveText("Saved — resume anytime from your link"); };

  // ── Submit ──────────────────────────────────────────────────────────────
  const submit = async () => {
    setAttempted(true); setSubmitErr(null);
    if (missing().length) { window.scrollTo({ top: 0, behavior: "smooth" }); return; }
    setSubmitting(true);
    try {
      const fd = new FormData();
      SECTIONS.forEach((s) => (s.blocks || []).forEach((b) => (b.fields || []).forEach((f) => {
        if (f.admin || f.kind === "toggle") return;
        if (f.csv) { fd.append(f.id, JSON.stringify(splitCsv(data[f.id]))); return; }
        if (data[f.id] != null && data[f.id] !== "") fd.append(f.id, data[f.id]);
      })));
      fd.append("faqs", JSON.stringify(faqs.filter((f) => (f.question || "").trim() || (f.answer || "").trim())));
      fd.append("badges", JSON.stringify(badges.filter((b) => (b.title || "").trim()).map((b) => ({ title: b.title, subtitle: b.note || "" }))));
      UPLOAD_IDS.forEach((id) => (files[id] || []).forEach((fl) => fd.append(id, fl)));

      const r = await fetch(`/api/host-portal/onboarding/${token}`, { method: "POST", body: fd });
      const j = await r.json().catch(() => ({}));
      if (!r.ok || !j.ok) { setSubmitErr(j.error || "server_error"); setSubmitting(false); return; }
      try { localStorage.removeItem(KEY); } catch (_e) { /* ignore */ }
      setPhase("success");
    } catch (_e) { setSubmitErr("network"); setSubmitting(false); }
  };

  const reqFields = useMemo(() => allFields().filter((f) => f.req), []);
  const reqDone = reqFields.filter((f) => (f.id === "email" ? isEmail(data.email) : String(data[f.id] || "").trim())).length;
  const reqTotal = reqFields.length + 1; // + consent
  const doneAll = reqDone + (consent ? 1 : 0);
  const pctDone = Math.round((doneAll / reqTotal) * 100);

  if (phase === "loading") return <Centered>Loading your onboarding…</Centered>;
  if (phase === "error") return <ErrorView kind={errKind} />;
  if (phase === "success") return <SuccessView onReview={() => { setPhase("form"); window.scrollTo({ top: 0 }); }} />;

  const miss = missing();
  const showErr = attempted && (miss.length || submitErr);

  return (
    <div style={{ minHeight: "100vh", background: "#EFE7DA" }}>
      <Fonts />
      <style>{CSS}</style>
      <div className="po-shell" style={{ display: "grid", gridTemplateColumns: "296px 1fr", minHeight: "100vh" }}>

        {/* RAIL */}
        <aside className="po-rail" style={{ position: "sticky", top: 0, alignSelf: "start", height: "100vh", overflow: "auto", background: "#221C17", color: "#E9DFD0", padding: "26px 22px", display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", alignItems: "baseline", fontFamily: "'Bricolage Grotesque',sans-serif", fontWeight: 800, fontSize: 19, letterSpacing: "-.01em" }}><span style={{ color: "#E9622F" }}>nomadic</span><span style={{ color: "#F4EEE4", marginLeft: 6 }}>townies</span></div>
          <div style={{ marginTop: 4, font: "600 11px/1 'Hanken Grotesk'", letterSpacing: ".05em", color: "#8A7E6C" }}>Host onboarding · proposal draft</div>

          <div style={{ marginTop: 22, padding: "14px 16px", background: "#2E271F", border: "1px solid #3A322A", borderRadius: 14 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
              <span style={{ font: "700 11px/1 'Hanken Grotesk'", color: "#C9BFAE" }}>{pctDone}% ready</span>
              <span style={{ font: "600 10.5px/1 'Hanken Grotesk'", color: "#8A7E6C" }}>{doneAll}/{reqTotal} required</span>
            </div>
            <div style={{ marginTop: 9, height: 6, borderRadius: 99, background: "#1A1510", overflow: "hidden" }}><div style={{ height: "100%", borderRadius: 99, background: "linear-gradient(90deg,#E9622F,#F0B49C)", width: `${pctDone}%`, transition: "width .4s ease" }} /></div>
          </div>

          <nav style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 1 }}>
            {SECTIONS.map((s, i) => {
              const active = i === activeSec;
              return (
                <div key={s.id} className="po-navitem" onClick={() => scrollTo(s.id)} style={{ display: "flex", alignItems: "center", gap: 11, padding: "8px 10px", borderRadius: 9, cursor: "pointer", background: active ? "rgba(233,98,47,.14)" : "transparent" }}>
                  <span style={{ width: 24, height: 24, flex: "none", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", font: "700 10.5px/1 'Hanken Grotesk'", background: active ? "#E9622F" : "#2E271F", color: active ? "#fff" : "#9A8E7C", border: `1.5px solid ${active ? "#E9622F" : "#3A322A"}` }}>{i + 1}</span>
                  <span style={{ flex: 1, minWidth: 0, font: "600 12.5px/1.25 'Hanken Grotesk'", color: active ? "#F4EEE4" : "#C9BFAE" }}>{s.title}</span>
                  {s.admin ? <span style={{ font: "700 8.5px/1.3 'Hanken Grotesk'", letterSpacing: ".04em", textTransform: "uppercase", color: "#8A7E6C" }}>admin</span> : null}
                </div>
              );
            })}
          </nav>

          <div style={{ marginTop: "auto", paddingTop: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, font: "500 11px/1.4 'Hanken Grotesk'", color: saving ? "#E9622F" : "#8A9A7C" }}>
              <span className={saving ? "po-saving" : ""} style={{ width: 7, height: 7, borderRadius: "50%", background: saving ? "#E9622F" : "#6FA07A" }} />{saveText}
            </div>
            <div style={{ marginTop: 12, font: "400 10.5px/1.6 'Hanken Grotesk'", color: "#6B6152" }}>🔒 Bank &amp; ID details are private — never shown on your public profile. Fields marked <em style={{ color: "#9A8E7C" }}>Managed by our team</em> are set by an admin during review.</div>
          </div>
        </aside>

        {/* CONTENT */}
        <main style={{ padding: "clamp(22px,4vw,54px) clamp(18px,4vw,60px)", maxWidth: 1000, width: "100%" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", font: "700 11px/1 'Hanken Grotesk'", letterSpacing: ".09em", textTransform: "uppercase", color: "#CF4A2C" }}>Add New Host <span style={{ color: "#C9BFAE" }}>·</span> <span style={{ color: "#A89C8A", fontWeight: 600, letterSpacing: 0, textTransform: "none" }}>Mirrors the admin record field-for-field</span></div>
          <h1 style={{ margin: "8px 0 0", fontFamily: "'Bricolage Grotesque',sans-serif", fontWeight: 700, fontSize: "clamp(26px,3.4vw,36px)", letterSpacing: "-.02em", color: "#221C17" }}>Host onboarding</h1>
          <p style={{ margin: "10px 0 0", maxWidth: 640, font: "400 15px/1.6 'Hanken Grotesk'", color: "#726A5E" }}>Complete the sections below. Your answers populate a Host Proposal draft — the same structure as the admin&apos;s Add New Host form — so our team only has to review and approve.</p>

          {SECTIONS.map((s, si) => (
            <section id={`sec-${s.id}`} key={s.id} style={{ scrollMarginTop: 20, background: "#FFFDF9", border: "1px solid #E6DDCF", borderRadius: 18, padding: "clamp(20px,3vw,30px)", marginTop: 20 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                <span style={{ width: 30, height: 30, flex: "none", borderRadius: 9, background: "#F6E4DC", color: "#CF4A2C", display: "flex", alignItems: "center", justifyContent: "center", font: "800 13px/1 'Bricolage Grotesque'" }}>{si + 1}</span>
                <h2 style={{ margin: 0, fontFamily: "'Bricolage Grotesque',sans-serif", fontWeight: 700, fontSize: "clamp(19px,2.4vw,23px)", letterSpacing: "-.01em", color: "#221C17" }}>{s.title}</h2>
                {s.admin ? <span style={{ font: "700 9px/1 'Hanken Grotesk'", letterSpacing: ".06em", textTransform: "uppercase", color: "#8A7E6C", background: "#EFE7DA", border: "1px solid #E6DDCF", borderRadius: 99, padding: "4px 9px" }}>🔒 Managed by our team</span> : null}
              </div>
              <p style={{ margin: "9px 0 0", maxWidth: 660, font: "400 14px/1.55 'Hanken Grotesk'", color: "#726A5E" }}>{s.desc}</p>

              {(s.blocks || []).map((b, bi) => (
                <div key={bi} style={{ marginTop: bi === 0 ? 24 : 22 }}>
                  {b.sub ? <div style={{ font: "700 12px/1 'Hanken Grotesk'", letterSpacing: ".06em", textTransform: "uppercase", color: "#221C17", marginBottom: 14, paddingBottom: 9, borderBottom: "1px solid #EFE7DA" }}>{b.sub}</div> : null}

                  {b.type === "fields" ? (
                    <div className="po-fgrid">
                      {b.fields.map((f) => <FieldEl key={f.id} f={f} value={data[f.id]} err={fieldErr(f)} onChange={(v) => setField(f.id, v)} onToggle={() => toggleField(f.id)} />)}
                    </div>
                  ) : null}

                  {b.type === "uploads" ? (
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(210px,1fr))", gap: 14 }}>
                      {b.uploads.map((u) => <UploadEl key={u.id} u={u} list={files[u.id] || []} onFile={(l) => onFile(u.id, l, !!u.multiple)} onClear={(e) => clearFile(u.id, e)} />)}
                    </div>
                  ) : null}

                  {b.type === "faq" ? (
                    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                      {faqs.map((q, i) => (
                        <div key={i} className="po-reveal" style={{ border: "1px solid #E6DDCF", borderRadius: 14, padding: "16px 18px", background: "#fff" }}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 11 }}>
                            <span style={{ font: "700 11.5px/1 'Hanken Grotesk'", letterSpacing: ".04em", textTransform: "uppercase", color: "#A89C8A" }}>Question {i + 1}</span>
                            <button type="button" onClick={() => removeFaq(i)} className="po-rm">Remove</button>
                          </div>
                          <input className="fin" value={q.question} onChange={(e) => setFaq(i, "question", e.target.value)} placeholder="Question travellers ask…" style={SM} />
                          <textarea className="fin" value={q.answer} onChange={(e) => setFaq(i, "answer", e.target.value)} placeholder="The host's answer…" rows={2} style={{ ...SM, marginTop: 10, resize: "vertical" }} />
                        </div>
                      ))}
                      <button type="button" onClick={addFaq} className="po-add">+ Add Question</button>
                    </div>
                  ) : null}

                  {b.type === "badges" ? (
                    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                      {badges.map((bd, i) => (
                        <div key={i} className="po-reveal po-badgerow" style={{ border: "1px solid #E6DDCF", borderRadius: 14, padding: "16px 18px", background: "#fff", display: "grid", gridTemplateColumns: "1fr 1.4fr auto", gap: 12, alignItems: "center" }}>
                          <input className="fin" value={bd.title} onChange={(e) => setBadge(i, "title", e.target.value)} placeholder="Badge label (e.g. Verified guide)" style={SM} />
                          <input className="fin" value={bd.note} onChange={(e) => setBadge(i, "note", e.target.value)} placeholder="Short description (optional)" style={SM} />
                          <button type="button" onClick={() => removeBadge(i)} className="po-rm" style={{ padding: "0 4px" }}>Remove</button>
                        </div>
                      ))}
                      <button type="button" onClick={addBadge} className="po-add">+ Add Badge</button>
                    </div>
                  ) : null}
                </div>
              ))}
            </section>
          ))}

          {/* CONSENT */}
          <label style={{ display: "flex", gap: 12, alignItems: "flex-start", marginTop: 22, padding: "16px 18px", border: `1.5px solid ${attempted && !consent ? "#C0392B" : "#E6DDCF"}`, borderRadius: 14, cursor: "pointer", background: "#FFFDF9" }}>
            <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} style={{ marginTop: 2, width: 17, height: 17, accentColor: "#CF4A2C" }} />
            <span style={{ font: "500 13.5px/1.5 'Hanken Grotesk'", color: "#3C3228" }}>I confirm the information provided is accurate and complete, and I agree to Nomadic Townies&apos; host terms and to be contacted about this proposal. <span style={{ color: "#CF4A2C" }}>*</span></span>
          </label>

          {showErr ? (
            <div style={{ marginTop: 16, display: "flex", gap: 10, alignItems: "flex-start", background: "#FCF3F2", border: "1px solid #F0CFC9", borderRadius: 12, padding: "13px 16px", font: "600 13px/1.5 'Hanken Grotesk'", color: "#C0392B" }}>
              <span style={{ flex: "none", marginTop: 2 }}><WarnSvg /></span>{submitErr ? submitErrMsg(submitErr) : `Please complete ${miss.length} item${miss.length > 1 ? "s" : ""}: ${miss.slice(0, 6).join(", ")}${miss.length > 6 ? "…" : ""}`}
            </div>
          ) : null}

          <div style={{ display: "flex", flexWrap: "wrap", gap: 12, alignItems: "center", marginTop: 24, paddingTop: 22, borderTop: "1px solid #E6DDCF" }}>
            <button type="button" onClick={saveLater} className="po-ghost" style={{ padding: "13px 20px", font: "700 13.5px/1 'Hanken Grotesk'", color: "#726A5E", background: "transparent", border: "1.5px solid #E6DDCF", borderRadius: 12, cursor: "pointer" }}>Save &amp; finish later</button>
            <button type="button" onClick={submit} disabled={submitting} className="po-cta" style={{ marginLeft: "auto", padding: "14px 32px", font: "700 14.5px/1 'Hanken Grotesk'", color: "#fff", background: "#CF4A2C", border: "none", borderRadius: 12, cursor: submitting ? "wait" : "pointer", opacity: submitting ? 0.7 : 1, boxShadow: "0 6px 16px rgba(207,74,44,.26)" }}>{submitting ? "Submitting…" : "Submit host proposal"}</button>
          </div>
        </main>
      </div>
    </div>
  );
}

// ── Field ─────────────────────────────────────────────────────────────────
const IN = { width: "100%", padding: "12px 14px", fontSize: 14.5, fontFamily: "'Hanken Grotesk',sans-serif", color: "#221C17", background: "#FFFDF9", border: "1px solid #E6DDCF", borderRadius: 11 };
const SM = { width: "100%", padding: "11px 13px", fontSize: 14, fontFamily: "'Hanken Grotesk',sans-serif", color: "#221C17", background: "#FFFDF9", border: "1px solid #E6DDCF", borderRadius: 10 };
const LBL = { font: "600 11.5px/1.3 'Hanken Grotesk'", letterSpacing: ".05em", textTransform: "uppercase", color: "#726A5E" };

function FieldEl({ f, value, err, onChange, onToggle }) {
  const kind = f.csv ? "text" : (f.kind || "text");
  const cls = `fin ${err ? "ferr" : ""} ${f.admin ? "fdis" : ""}`;
  const on = !!value;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 7, gridColumn: f.span || "auto" }}>
      <label style={LBL}>{f.label} {f.req ? <span style={{ color: "#CF4A2C" }}>*</span> : null}</label>
      {kind === "area" ? (
        <textarea className={cls} placeholder={f.ph} rows={f.rows || 3} value={value || ""} disabled={!!f.admin} onChange={(e) => onChange(e.target.value)} style={{ ...IN, resize: "vertical" }} />
      ) : kind === "select" ? (
        <select className={cls} value={value || ""} disabled={!!f.admin} onChange={(e) => onChange(e.target.value)} style={{ ...IN, appearance: "none", WebkitAppearance: "none", backgroundImage: "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='12' height='12' fill='none' stroke='%23CF4A2C' stroke-width='2'><path d='M2 4l4 4 4-4'/></svg>\")", backgroundRepeat: "no-repeat", backgroundPosition: "right 14px center" }}>
          <option value="">{f.ph || "Select"}</option>
          {yearOptions().map((y) => <option key={y} value={y}>{y}</option>)}
        </select>
      ) : kind === "num" ? (
        <div style={{ position: "relative" }}>
          <input type="number" className={cls} placeholder={f.ph} value={value ?? ""} disabled={!!f.admin} onChange={(e) => onChange(e.target.value)} style={IN} />
          {f.suffix ? <span style={{ position: "absolute", right: 1, top: 1, bottom: 1, display: "flex", alignItems: "center", padding: "0 14px", background: "#F1ECE2", borderLeft: "1px solid #E6DDCF", borderRadius: "0 10px 10px 0", font: "600 13px/1 'Hanken Grotesk'", color: "#8A7E6C" }}>{f.suffix}</span> : null}
        </div>
      ) : kind === "toggle" ? (
        <button type="button" onClick={f.admin ? undefined : onToggle} style={{ alignSelf: "flex-start", position: "relative", width: 48, height: 27, borderRadius: 99, border: "none", cursor: f.admin ? "not-allowed" : "pointer", background: on ? "#CF4A2C" : "#D8CFC0", transition: "background .2s" }}>
          <span style={{ position: "absolute", top: 3, left: on ? 24 : 3, width: 21, height: 21, borderRadius: "50%", background: "#fff", boxShadow: "0 1px 3px rgba(0,0,0,.25)", transition: "left .2s" }} />
        </button>
      ) : (
        <input className={cls} placeholder={f.ph} value={value ?? ""} disabled={!!f.admin} onChange={(e) => onChange(e.target.value)} style={IN} />
      )}
      {(err || f.help) ? <span style={{ font: "400 11.5px/1.4 'Hanken Grotesk'", color: err ? "#C0392B" : "#9A9080" }}>{err || f.help}</span> : null}
    </div>
  );
}

// ── Upload tile ─────────────────────────────────────────────────────────────
function UploadEl({ u, list, onFile, onClear }) {
  const has = list.length > 0;
  return (
    <div className="po-drop" style={{ position: "relative", border: `1.5px dashed ${has ? "#B7D8C0" : "#D8CFC0"}`, borderRadius: 14, background: has ? "#F3FAF4" : "#FBFAF6", padding: 16, cursor: "pointer", overflow: "hidden" }}>
      <input type="file" accept={u.accept} multiple={!!u.multiple} onChange={(e) => onFile(e.target.files)} style={{ position: "absolute", inset: 0, opacity: 0, cursor: "pointer" }} />
      {has ? (
        <div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ font: "700 12px/1.3 'Hanken Grotesk'", color: "#221C17" }}>{u.title}</span>
            <span style={{ position: "relative", zIndex: 2, font: "700 10.5px/1 'Hanken Grotesk'", color: "#CF4A2C", cursor: "pointer" }} onClick={onClear}>Replace</span>
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 10 }}>
            {list.map((fl, k) => (
              <div key={k} style={{ display: "flex", alignItems: "center", gap: 7, padding: "5px 9px 5px 5px", background: "#fff", border: "1px solid #E6DDCF", borderRadius: 9 }}>
                <span style={{ maxWidth: 96, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", font: "600 10.5px/1.3 'Hanken Grotesk'", color: "#3C3228" }}>{fl.name}</span>
                <span style={{ font: "400 9.5px/1.3 'Hanken Grotesk'", color: "#A89C8A" }}>{(fl.size / 1048576).toFixed(1)}MB</span>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 8, font: "600 10.5px/1.3 'Hanken Grotesk'", color: "#2E7D4F" }}>✓ {list.length} attached</div>
        </div>
      ) : (
        <div style={{ textAlign: "center", padding: "6px 0" }}>
          <div style={{ width: 38, height: 38, margin: "0 auto", borderRadius: 11, background: "#F6E4DC", display: "flex", alignItems: "center", justifyContent: "center", color: "#CF4A2C" }}><UploadSvg /></div>
          <div style={{ marginTop: 9, font: "700 12.5px/1.3 'Hanken Grotesk'", color: "#221C17" }}>{u.title}</div>
          {u.help ? <div style={{ marginTop: 4, font: "400 10.5px/1.5 'Hanken Grotesk'", color: "#8A8073" }}>{u.help}</div> : null}
        </div>
      )}
    </div>
  );
}

const SUBMIT_ERRORS = {
  email_in_use: "This email is already registered to a host account. Use a different email or contact our team.",
  pan_in_use: "This PAN is already on file for another host. Please check the number.",
  duplicate: "Some details are already on file. Check your email and PAN, then try again.",
  validation: "Some details couldn't be saved. Please review your entries and try again.",
  network: "Network problem — your answers are safe. Check your connection and submit again.",
  server_error: "Our server hit a snag. Your answers are saved — please try submitting again.",
  used: "This onboarding link was already submitted.",
  expired: "This onboarding link has expired. Contact our team for a new one.",
  not_approved: "This link isn't active yet. Please wait for your approval email.",
};
const submitErrMsg = (c) => SUBMIT_ERRORS[c] || "Something went wrong submitting. Your answers are saved — please try again.";

const UploadSvg = () => (<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><path d="M17 8l-5-5-5 5" /><path d="M12 3v12" /></svg>);
const WarnSvg = () => (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="M12 8v4M12 16h.01" /></svg>);

function Centered({ children }) {
  return <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#EFE7DA", font: "500 15px/1.5 'Hanken Grotesk'", color: "#726A5E" }}><Fonts />{children}</div>;
}

function ErrorView({ kind }) {
  const map = {
    expired: { t: "This link has expired", d: "Your onboarding link is no longer valid. Contact our team for a fresh one." },
    used: { t: "Proposal already submitted", d: "This onboarding link has already been used. Our team is reviewing your proposal." },
    not_approved: { t: "Not available yet", d: "This link isn't active. If you've just applied, please wait for your approval email." },
    invalid: { t: "Invalid link", d: "We couldn't find this onboarding link. Please use the exact link from your email." },
    network: { t: "Connection problem", d: "We couldn't reach the server. Check your connection and try again." },
  };
  const m = map[kind] || map.invalid;
  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#EFE7DA", fontFamily: "'Hanken Grotesk',sans-serif", padding: 24 }}>
      <Fonts />
      <div style={{ maxWidth: 420, textAlign: "center" }}>
        <div style={{ fontFamily: "'Bricolage Grotesque',sans-serif", fontWeight: 800, fontSize: 19 }}><span style={{ color: "#E9622F" }}>nomadic</span> <span style={{ color: "#221C17" }}>townies</span></div>
        <h1 style={{ margin: "22px 0 0", fontFamily: "'Bricolage Grotesque',sans-serif", fontWeight: 700, fontSize: 26, color: "#221C17" }}>{m.t}</h1>
        <p style={{ margin: "12px 0 0", font: "400 15px/1.6 'Hanken Grotesk'", color: "#726A5E" }}>{m.d}</p>
        <a href="https://www.nomadictownies.com" style={{ display: "inline-block", marginTop: 24, padding: "12px 24px", font: "700 13.5px/1 'Hanken Grotesk'", color: "#fff", background: "#CF4A2C", borderRadius: 12, textDecoration: "none" }}>Back to home</a>
      </div>
    </div>
  );
}

function SuccessView({ onReview }) {
  const steps = [
    { mark: "1", bg: "#F6E4DC", fg: "#CF4A2C", title: "We review your proposal", desc: "An admin opens your populated Add New Host draft and checks each section." },
    { mark: "2", bg: "#F6E4DC", fg: "#CF4A2C", title: "A short intro call", desc: "We confirm details and collect anything still pending, like bank info." },
    { mark: "✓", bg: "#E0EFE4", fg: "#2E7D4F", title: "Approved & live", desc: "Your host profile is created and your dashboard unlocks." },
  ];
  return (
    <div style={{ minHeight: "100vh", background: "#EFE7DA", fontFamily: "'Hanken Grotesk',sans-serif" }}>
      <Fonts />
      <style>{CSS}</style>
      <div style={{ maxWidth: 490, margin: "0 auto", padding: "8vh 22px", textAlign: "center" }}>
        <div className="po-check" style={{ width: 76, height: 76, margin: "0 auto", borderRadius: "50%", background: "#E0EFE4", display: "flex", alignItems: "center", justifyContent: "center" }}><svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#2E7D4F" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5" /></svg></div>
        <div style={{ marginTop: 16, display: "inline-flex", alignItems: "center", gap: 7, padding: "6px 14px", borderRadius: 99, background: "#FBF3E4", border: "1px solid #EBD9B4", font: "700 11px/1 'Hanken Grotesk'", letterSpacing: ".05em", textTransform: "uppercase", color: "#B07D2A" }}><span style={{ width: 7, height: 7, borderRadius: "50%", background: "#E0A93B" }} />Pending review</div>
        <h1 style={{ margin: "18px 0 0", fontFamily: "'Bricolage Grotesque',sans-serif", fontWeight: 700, fontSize: "clamp(26px,3.6vw,34px)", letterSpacing: "-.02em", color: "#221C17" }}>Proposal submitted!</h1>
        <p style={{ margin: "12px 0 0", font: "400 15px/1.65 'Hanken Grotesk'", color: "#726A5E" }}>Thanks for completing the host profile. Our team reviews every proposal personally — you&apos;ll hear from us <strong style={{ color: "#3C3228" }}>within 2–3 working days</strong>.</p>
        <div style={{ marginTop: 24, textAlign: "left", background: "#FFFDF9", border: "1px solid #E6DDCF", borderRadius: 16, padding: "20px 22px" }}>
          <div style={{ font: "700 10.5px/1 'Hanken Grotesk'", letterSpacing: ".1em", textTransform: "uppercase", color: "#A89C8A" }}>What happens next</div>
          <div style={{ marginTop: 14, display: "flex", flexDirection: "column", gap: 14 }}>
            {steps.map((ns) => (
              <div key={ns.mark} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                <span style={{ width: 24, height: 24, flex: "none", borderRadius: "50%", background: ns.bg, color: ns.fg, display: "flex", alignItems: "center", justifyContent: "center", font: "700 11px/1 'Hanken Grotesk'" }}>{ns.mark}</span>
                <span><span style={{ display: "block", font: "700 13.5px/1.3 'Hanken Grotesk'", color: "#221C17" }}>{ns.title}</span><span style={{ display: "block", marginTop: 2, font: "400 12.5px/1.5 'Hanken Grotesk'", color: "#8A8073" }}>{ns.desc}</span></span>
              </div>
            ))}
          </div>
        </div>
        <div style={{ display: "flex", gap: 12, justifyContent: "center", marginTop: 24, flexWrap: "wrap" }}>
          <button type="button" onClick={onReview} className="po-ghost" style={{ padding: "12px 22px", font: "700 13.5px/1 'Hanken Grotesk'", color: "#3C3228", background: "transparent", border: "1.5px solid #D8CFC0", borderRadius: 12, cursor: "pointer" }}>Review my answers</button>
          <a href="https://www.nomadictownies.com" className="po-cta" style={{ padding: "12px 24px", font: "700 13.5px/1 'Hanken Grotesk'", color: "#fff", background: "#CF4A2C", borderRadius: 12, textDecoration: "none", boxShadow: "0 6px 16px rgba(207,74,44,.26)" }}>Back to home</a>
        </div>
      </div>
    </div>
  );
}

const CSS = `
  .fin::placeholder { color:#A89C8A; }
  .fin:focus { border-color:#CF4A2C !important; box-shadow:0 0 0 4px rgba(207,74,44,.12); background:#FFFFFF; outline:none; }
  .ferr { border-color:#C0392B !important; background:#FCF3F2 !important; }
  .fdis { background:#F1ECE2 !important; color:#9A9080 !important; cursor:not-allowed; }
  .po-cta { transition:transform .18s ease, box-shadow .18s ease, background .18s ease; }
  .po-cta:hover { transform:translateY(-2px); box-shadow:0 12px 26px rgba(207,74,44,.3); background:#C0421F; }
  .po-ghost { transition:background .16s ease, border-color .16s ease; }
  .po-ghost:hover { background:#FBF6EE; border-color:#CF4A2C; }
  .po-navitem { transition:background .15s ease; }
  .po-navitem:hover { background:rgba(233,98,47,.08); }
  .po-drop { transition:border-color .16s ease, background .16s ease; }
  .po-drop:hover { border-color:#CF4A2C; background:#FBF6EE; }
  .po-add { align-self:flex-start; padding:11px 18px; font:700 13px/1 'Hanken Grotesk'; color:#726A5E; background:transparent; border:1.5px dashed #D8CFC0; border-radius:11px; cursor:pointer; transition:background .16s, border-color .16s, color .16s; }
  .po-add:hover { background:#FBF6EE; border-color:#CF4A2C; color:#CF4A2C; }
  .po-rm { font:700 11px/1 'Hanken Grotesk'; color:#C0392B; background:none; border:none; cursor:pointer; }
  .po-fgrid { display:grid; grid-template-columns:1fr 1fr 1fr; gap:16px 20px; }
  @keyframes poPop { 0%{transform:scale(.6);opacity:0;} 60%{transform:scale(1.08);} 100%{transform:scale(1);opacity:1;} }
  .po-check { animation:poPop .6s cubic-bezier(.22,.61,.36,1) both; }
  @keyframes poExpand { from{opacity:0;transform:translateY(-4px);} to{opacity:1;transform:none;} }
  .po-reveal { animation:poExpand .24s ease both; }
  @keyframes poDot { 0%,100%{opacity:.35;} 50%{opacity:1;} }
  .po-saving { animation:poDot 1s ease-in-out infinite; }
  @media (prefers-reduced-motion: reduce){ .po-check,.po-reveal,.po-saving { animation:none; } }
  @media (max-width: 980px){ .po-shell { grid-template-columns:1fr !important; } .po-rail { position:static !important; height:auto !important; overflow:visible !important; } }
  @media (max-width: 780px){ .po-fgrid { grid-template-columns:1fr 1fr !important; } .po-badgerow { grid-template-columns:1fr !important; } }
  @media (max-width: 560px){ .po-fgrid { grid-template-columns:1fr !important; } .po-fgrid > div { grid-column:auto !important; } }
`;
