"use client";

/* eslint-disable react/prop-types */
/**
 * HostOnboarding — standalone, token-gated host onboarding page.
 * Reached only via the secure link emailed after an application is moved to
 * "Reviewing": /host-onboarding/{token}.
 *
 * This is the approved single-page design that MIRRORS the Admin → Add New Host
 * form 1:1 — same sections, same field ids (which ARE the backend Host keys), so
 * the multipart submit maps straight through and every value populates the draft
 * the admin reviews. On submit a DRAFT host is created (status:"draft"); no live
 * profile, no dashboard (that stays a separate manual admin step).
 *
 * Comma-separated backend arrays (specialties, languages, achievements,
 * regionsHosted, ageGroups) render as chip inputs: type + Enter/comma → chip,
 * chips removable, submitted as arrays exactly as the backend expects.
 */
import { useEffect, useMemo, useRef, useState, useCallback } from "react";

// ── Section/field config — order + ids match Add New Host exactly ──────────
// kind: text | area | select | num | toggle | chips (default text)
// admin: 1 → set by our team (shown read-only, never submitted by the host)
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
        { id: "achievements", label: "Achievements", kind: "chips", ph: "e.g. Wilderness First-Aid, UIMLA Mountain Leader", span: "1 / -1", help: "Type & press Enter or comma. Shown as certification badges when no custom badges are set." },
      ] },
      { type: "uploads", sub: "Gallery", uploads: [
        { id: "gallery", title: "Gallery images", accept: "image/*", multiple: 1, help: "Add multiple photos of trips in action" },
      ] },
    ] },

  { id: "specialties", title: "Specialties & Expertise",
    desc: "Comma-separated lists that drive where this host appears and show travellers they know their terrain.",
    blocks: [{ type: "fields", fields: [
      { id: "specialties", label: "Specialties / Expertise", kind: "chips", ph: "e.g. Trekking & guiding, Homestays, Photography walks", span: "1 / -1", help: "Type & press Enter or comma to add a chip" },
      { id: "languages", label: "Languages", kind: "chips", ph: "e.g. English, Nepali, Hindi, Tibetan", span: "1 / -1", help: "Type & press Enter or comma to add a chip" },
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
      { id: "verified", label: "Verified", kind: "toggle", admin: 1, help: "Set by our team after review" },
      { id: "tripsHosted", label: "Trips Hosted", kind: "num", admin: 1 },
      { id: "travellersHosted", label: "Travellers Hosted", kind: "num", admin: 1 },
      { id: "successRate", label: "Success Rate", kind: "num", admin: 1 },
      { id: "responseTimeLabel", label: "Response Time Label", ph: "Enter label…" },
      { id: "responseRate", label: "Response Rate (%)", kind: "num", admin: 1 },
      { id: "regionsHosted", label: "Regions Hosted", kind: "chips", ph: "e.g. Annapurna, Everest, Mustang", span: "1 / -1", help: "Type & press Enter or comma to add a chip" },
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
        { id: "ageGroups", label: "Age Groups", kind: "chips", ph: "e.g. 18–25, 26–40, Families", help: "Type & press Enter or comma to add a chip" },
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

// Backend-required fields (mirror createHost); consent also required.
const REQUIRED = ["hostName", "email", "bankName", "accountHolderName", "accountNumber", "ifscCode"];
const CHIP_FIELDS = ["specialties", "languages", "achievements", "regionsHosted", "ageGroups"];
const UPLOAD_IDS = ["logo", "coverImage", "gallery", "panCard", "gstCertificate", "bankPassbook",
  "businessLicense", "idProof", "certificationsLicenses", "insuranceDocuments"];

const KEY = "nt_host_onboarding_v2";
const FONT_CSS = "@import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,400..800&family=Hanken+Grotesk:wght@400;500;600;700;800&display=swap');";
const Fonts = () => <style>{FONT_CSS}</style>;

const isEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v || "");
const yearOptions = () => { const y = new Date().getFullYear(); const o = []; for (let i = y; i >= 1990; i--) o.push(String(i)); return o; };

export default function HostOnboarding({ token }) {
  const [phase, setPhase] = useState("loading"); // loading | error | form | success
  const [errKind, setErrKind] = useState(null);

  const [data, setData] = useState({});          // scalar fields
  const [chips, setChips] = useState({});        // id -> string[]
  const [chipBuf, setChipBuf] = useState({});    // id -> in-progress text
  const [files, setFiles] = useState({});        // id -> File[]
  const [faqs, setFaqs] = useState([]);          // {question,answer}
  const [badges, setBadges] = useState([]);      // {title,subtitle,icon}
  const [consent, setConsent] = useState(false);
  const [attempted, setAttempted] = useState(false);
  const [activeSec, setActiveSec] = useState(SECTIONS[0].id);
  const [saveText, setSaveText] = useState("All changes saved");
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitErr, setSubmitErr] = useState(null);
  const saveTimer = useRef(null);

  // ── Validate token + prefill from the approved application ──────────────
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
          ...(restored.data || {}), ...d,
        }));
        if (restored.chips) setChips(restored.chips);
        else if (pf.categories?.length) setChips({ specialties: pf.categories });
        if (restored.faqs) setFaqs(restored.faqs);
        if (restored.badges) setBadges(restored.badges);
        if (restored.consent) setConsent(true);
        setPhase("form");
      } catch (_e) { if (alive) { setErrKind("network"); setPhase("error"); } }
    })();
    return () => { alive = false; };
  }, [token]);

  // ── Debounced localStorage autosave (files can't persist) ───────────────
  const writeDraft = useCallback(() => {
    try { localStorage.setItem(KEY, JSON.stringify({ token, data, chips, faqs, badges, consent })); } catch (_e) { /* ignore */ }
  }, [token, data, chips, faqs, badges, consent]);

  useEffect(() => {
    if (phase !== "form") return undefined;
    const flash = setTimeout(() => { setSaving(true); setSaveText("Saving…"); }, 0);
    writeDraft();
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => { setSaving(false); setSaveText("All changes saved"); }, 600);
    return () => clearTimeout(flash);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, chips, faqs, badges, consent]);

  // ── Scroll-spy: highlight the section currently in view ─────────────────
  useEffect(() => {
    if (phase !== "form") return undefined;
    const onScroll = () => {
      let cur = SECTIONS[0].id;
      for (const s of SECTIONS) {
        const el = document.getElementById(`sec-${s.id}`);
        if (el && el.getBoundingClientRect().top <= 120) cur = s.id;
      }
      setActiveSec(cur);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, [phase]);

  // ── Setters ─────────────────────────────────────────────────────────────
  const setField = (id, v) => setData((d) => ({ ...d, [id]: v }));

  const addChip = (id, raw) => {
    const parts = (raw || "").split(/[\n,]/).map((x) => x.trim()).filter(Boolean);
    if (!parts.length) return;
    setChips((c) => ({ ...c, [id]: Array.from(new Set((c[id] || []).concat(parts))) }));
    setChipBuf((b) => ({ ...b, [id]: "" }));
  };
  const removeChip = (id, val) => setChips((c) => ({ ...c, [id]: (c[id] || []).filter((x) => x !== val) }));
  const onChipKey = (id, e) => {
    if (e.key === "Enter" || e.key === ",") { e.preventDefault(); addChip(id, chipBuf[id]); }
    else if (e.key === "Backspace" && !chipBuf[id]) { const cur = chips[id] || []; if (cur.length) removeChip(id, cur[cur.length - 1]); }
  };

  const onFile = (id, list, multiple) => {
    const arr = Array.from(list || []);
    setFiles((f) => ({ ...f, [id]: multiple ? (f[id] || []).concat(arr) : arr.slice(0, 1) }));
  };
  const clearFile = (id) => setFiles((f) => { const n = { ...f }; delete n[id]; return n; });

  const setFaq = (i, k, v) => setFaqs((fs) => fs.map((f, idx) => (idx === i ? { ...f, [k]: v } : f)));
  const addFaq = () => setFaqs((fs) => fs.concat({ question: "", answer: "" }));
  const removeFaq = (i) => setFaqs((fs) => fs.filter((_, idx) => idx !== i));

  const setBadge = (i, k, v) => setBadges((bs) => bs.map((b, idx) => (idx === i ? { ...b, [k]: v } : b)));
  const addBadge = () => setBadges((bs) => bs.concat({ title: "", subtitle: "", icon: "verified" }));
  const removeBadge = (i) => setBadges((bs) => bs.filter((_, idx) => idx !== i));

  // ── Validation ──────────────────────────────────────────────────────────
  const fieldInvalid = (id) => {
    if (!attempted) return false;
    if (id === "email") return !isEmail(data.email);
    if (REQUIRED.includes(id)) return !String(data[id] || "").trim();
    return false;
  };
  const missing = () => {
    const out = REQUIRED.filter((id) => (id === "email" ? !isEmail(data.email) : !String(data[id] || "").trim()));
    if (!consent) out.push("Consent");
    return out;
  };

  const scrollTo = (id) => { const el = document.getElementById(`sec-${id}`); if (el) window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 16, behavior: "smooth" }); };
  const saveLater = () => { writeDraft(); setSaveText("Saved — resume anytime from your link"); };

  // ── Submit → multipart → DRAFT host ─────────────────────────────────────
  const submit = async () => {
    setAttempted(true);
    setSubmitErr(null);
    if (missing().length) { scrollTo(REQUIRED.find((id) => (id === "email" ? !isEmail(data.email) : !String(data[id] || "").trim())) ? sectionOf(REQUIRED[0]) : "basic"); window.scrollTo({ top: 0, behavior: "smooth" }); return; }
    setSubmitting(true);
    try {
      const fd = new FormData();
      // scalar (host-editable, non-admin) fields — ids ARE backend keys
      SECTIONS.forEach((s) => (s.blocks || []).forEach((b) => (b.fields || []).forEach((f) => {
        if (f.admin || f.kind === "chips" || f.kind === "toggle") return;
        if (data[f.id] != null && data[f.id] !== "") fd.append(f.id, data[f.id]);
      })));
      // chip arrays
      CHIP_FIELDS.forEach((id) => fd.append(id, JSON.stringify(chips[id] || [])));
      // repeatables
      fd.append("faqs", JSON.stringify(faqs.filter((f) => (f.question || "").trim() || (f.answer || "").trim())));
      fd.append("badges", JSON.stringify(badges.filter((b) => (b.title || "").trim())));
      // files
      UPLOAD_IDS.forEach((id) => (files[id] || []).forEach((fl) => fd.append(id, fl)));

      const r = await fetch(`/api/host-portal/onboarding/${token}`, { method: "POST", body: fd });
      const j = await r.json().catch(() => ({}));
      if (!r.ok || !j.ok) { setSubmitErr(j.error || "server_error"); setSubmitting(false); return; }
      try { localStorage.removeItem(KEY); } catch (_e) { /* ignore */ }
      setPhase("success");
    } catch (_e) { setSubmitErr("network"); setSubmitting(false); }
  };

  const pctDone = useMemo(() => {
    const need = REQUIRED.length + 1;
    const have = REQUIRED.filter((id) => (id === "email" ? isEmail(data.email) : String(data[id] || "").trim())).length + (consent ? 1 : 0);
    return Math.round((have / need) * 100);
  }, [data, consent]);

  if (phase === "loading") return <Centered>Loading your onboarding…</Centered>;
  if (phase === "error") return <ErrorView kind={errKind} />;
  if (phase === "success") return <SuccessView onReview={() => { setPhase("form"); window.scrollTo({ top: 0 }); }} />;

  // ── FORM (single page + sticky section rail) ────────────────────────────
  return (
    <div style={{ minHeight: "100vh", background: "#EFE7DA" }}>
      <Fonts />
      <style>{FORM_CSS}</style>
      <div className="po-shell" style={{ display: "grid", gridTemplateColumns: "288px 1fr", minHeight: "100vh" }}>

        {/* SIDE RAIL */}
        <aside className="po-rail" style={{ position: "sticky", top: 0, alignSelf: "start", height: "100vh", overflow: "auto", background: "#221C17", color: "#E9DFD0", padding: "26px 22px", display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", alignItems: "baseline", fontFamily: "'Bricolage Grotesque',sans-serif", fontWeight: 800, fontSize: 19, letterSpacing: "-.01em" }}><span style={{ color: "#E9622F" }}>nomadic</span><span style={{ color: "#F4EEE4", marginLeft: 6 }}>townies</span></div>
          <div style={{ marginTop: 4, font: "600 11px/1 'Hanken Grotesk'", letterSpacing: ".05em", color: "#8A7E6C" }}>Host onboarding</div>

          <div style={{ marginTop: 22, padding: "14px 16px", background: "#2E271F", border: "1px solid #3A322A", borderRadius: 14 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
              <span style={{ font: "700 11px/1 'Hanken Grotesk'", color: "#C9BFAE" }}>{pctDone}% ready</span>
              <span style={{ font: "600 10.5px/1 'Hanken Grotesk'", color: "#8A7E6C" }}>required fields</span>
            </div>
            <div style={{ marginTop: 9, height: 6, borderRadius: 99, background: "#1A1510", overflow: "hidden" }}><div style={{ height: "100%", borderRadius: 99, background: "linear-gradient(90deg,#E9622F,#F0B49C)", width: `${pctDone}%`, transition: "width .4s ease" }} /></div>
          </div>

          <nav style={{ marginTop: 18, display: "flex", flexDirection: "column", gap: 2 }}>
            {SECTIONS.map((s) => (
              <div key={s.id} className="po-navitem" onClick={() => scrollTo(s.id)} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 10px", borderRadius: 10, cursor: "pointer", background: activeSec === s.id ? "rgba(233,98,47,.14)" : "transparent" }}>
                <span style={{ flex: 1, minWidth: 0, font: "600 12.5px/1.25 'Hanken Grotesk'", color: activeSec === s.id ? "#F4EEE4" : "#C9BFAE" }}>{s.title}</span>
                {s.admin ? <span style={{ font: "700 8.5px/1 'Hanken Grotesk'", letterSpacing: ".04em", textTransform: "uppercase", color: "#6B6152" }}>admin</span> : null}
              </div>
            ))}
          </nav>

          <div style={{ marginTop: "auto", paddingTop: 18 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, font: "500 11px/1.4 'Hanken Grotesk'", color: "#8A7E6C" }}>
              <span className={saving ? "po-saving" : ""} style={{ width: 7, height: 7, borderRadius: "50%", background: saving ? "#E0A93B" : "#2E7D4F" }} />{saveText}
            </div>
            <div style={{ marginTop: 12, font: "400 10.5px/1.6 'Hanken Grotesk'", color: "#6B6152" }}>🔒 Bank &amp; ID details are private — never shown on your public profile.</div>
          </div>
        </aside>

        {/* CONTENT */}
        <main style={{ padding: "clamp(22px,4vw,48px) clamp(18px,4vw,56px)", maxWidth: 960, width: "100%" }}>
          <h1 style={{ margin: 0, fontFamily: "'Bricolage Grotesque',sans-serif", fontWeight: 700, fontSize: "clamp(24px,3vw,32px)", letterSpacing: "-.02em", color: "#221C17" }}>Complete your host profile</h1>
          <p style={{ margin: "8px 0 0", maxWidth: 620, font: "400 15px/1.55 'Hanken Grotesk'", color: "#726A5E" }}>Everything here maps directly to our Add New Host record. Fill what you can — our team reviews and polishes before you go live.</p>

          {SECTIONS.map((s) => (
            <section id={`sec-${s.id}`} key={s.id} style={{ marginTop: 34, scrollMarginTop: 16 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <h2 style={{ margin: 0, fontFamily: "'Bricolage Grotesque',sans-serif", fontWeight: 700, fontSize: 21, letterSpacing: "-.01em", color: "#221C17" }}>{s.title}</h2>
                {s.admin ? <span style={{ font: "700 9px/1 'Hanken Grotesk'", letterSpacing: ".06em", textTransform: "uppercase", color: "#A89C8A", background: "#EFE7DA", border: "1px solid #E6DDCF", borderRadius: 99, padding: "4px 9px" }}>Set by our team</span> : null}
              </div>
              <p style={{ margin: "6px 0 0", maxWidth: 640, font: "400 13.5px/1.5 'Hanken Grotesk'", color: "#8A8073" }}>{s.desc}</p>

              {(s.blocks || []).map((b, bi) => (
                <div key={bi} style={{ marginTop: 18 }}>
                  {b.sub ? <div style={{ font: "700 11px/1 'Hanken Grotesk'", letterSpacing: ".05em", textTransform: "uppercase", color: "#726A5E", margin: "6px 0 12px" }}>{b.sub}</div> : null}

                  {b.type === "fields" ? (
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px 20px" }}>
                      {b.fields.map((f) => (
                        <Field key={f.id} f={f} value={data[f.id]} onChange={(v) => setField(f.id, v)}
                          invalid={fieldInvalid(f.id)}
                          chips={chips[f.id] || []} chipBuf={chipBuf[f.id] || ""}
                          onChipBuf={(v) => setChipBuf((x) => ({ ...x, [f.id]: v }))}
                          onChipKey={(e) => onChipKey(f.id, e)} onChipBlur={() => addChip(f.id, chipBuf[f.id])}
                          onChipRemove={(v) => removeChip(f.id, v)} />
                      ))}
                    </div>
                  ) : null}

                  {b.type === "uploads" ? (
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: 14 }}>
                      {b.uploads.map((u) => (
                        <Upload key={u.id} u={u} list={files[u.id] || []} onFile={(fl) => onFile(u.id, fl, !!u.multiple)} onClear={() => clearFile(u.id)} />
                      ))}
                    </div>
                  ) : null}

                  {b.type === "faq" ? (
                    <Repeatable rows={faqs} onAdd={addFaq} addLabel="+ Add a question" empty="No questions yet — add the ones travellers ask most.">
                      {(fq, i) => (
                        <div className="po-card">
                          <div className="po-cardhd"><span>Q{i + 1}</span><button type="button" onClick={() => removeFaq(i)} className="po-rm">Remove</button></div>
                          <input className="po-in" placeholder="Question" value={fq.question} onChange={(e) => setFaq(i, "question", e.target.value)} style={{ ...INP, marginBottom: 8 }} />
                          <textarea className="po-in" placeholder="Answer" rows={2} value={fq.answer} onChange={(e) => setFaq(i, "answer", e.target.value)} style={{ ...INP, resize: "vertical" }} />
                        </div>
                      )}
                    </Repeatable>
                  ) : null}

                  {b.type === "badges" ? (
                    <Repeatable rows={badges} onAdd={addBadge} addLabel="+ Add a badge" empty="No custom badges — we'll auto-generate from your status & achievements.">
                      {(bg, i) => (
                        <div className="po-card">
                          <div className="po-cardhd"><span>Badge {i + 1}</span><button type="button" onClick={() => removeBadge(i)} className="po-rm">Remove</button></div>
                          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                            <input className="po-in" placeholder="Title — e.g. Verified Guide" value={bg.title} onChange={(e) => setBadge(i, "title", e.target.value)} style={INP} />
                            <input className="po-in" placeholder="Subtitle (optional)" value={bg.subtitle} onChange={(e) => setBadge(i, "subtitle", e.target.value)} style={INP} />
                            <select className="po-in" value={bg.icon} onChange={(e) => setBadge(i, "icon", e.target.value)} style={{ ...INP, gridColumn: "1 / -1" }}>
                              {["verified", "shield", "certificate", "award", "trophy", "star", "firstaid", "mountain", "camera", "leaf", "language", "clock"].map((ic) => <option key={ic} value={ic}>{ic}</option>)}
                            </select>
                          </div>
                        </div>
                      )}
                    </Repeatable>
                  ) : null}
                </div>
              ))}
            </section>
          ))}

          {/* consent + submit */}
          <label style={{ display: "flex", gap: 12, alignItems: "flex-start", marginTop: 34, padding: "16px 18px", border: `1.5px solid ${attempted && !consent ? "#C0392B" : "#E6DDCF"}`, borderRadius: 12, cursor: "pointer", background: "#FBFAF6" }}>
            <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} style={{ marginTop: 2, width: 17, height: 17, accentColor: "#CF4A2C" }} />
            <span style={{ font: "500 13.5px/1.5 'Hanken Grotesk'", color: "#3C3228" }}>I confirm the information provided is accurate and complete, and I agree to Nomadic Townies&apos; host terms and to be contacted about my application. <span style={{ color: "#CF4A2C" }}>*</span></span>
          </label>

          {attempted && (missing().length || submitErr) ? (
            <div style={{ marginTop: 18, display: "flex", gap: 10, alignItems: "center", background: "#FCF3F2", border: "1px solid #F0CFC9", borderRadius: 12, padding: "12px 16px", font: "600 13px/1.4 'Hanken Grotesk'", color: "#C0392B" }}>
              <WarnSvg />{submitErr ? submitErrMsg(submitErr) : `Please complete: ${missing().join(", ")}`}
            </div>
          ) : null}

          <div style={{ display: "flex", flexWrap: "wrap", gap: 12, alignItems: "center", marginTop: 26, paddingTop: 22, borderTop: "1px solid #E6DDCF" }}>
            <button type="button" onClick={saveLater} className="po-ghost" style={{ padding: "13px 20px", font: "700 13.5px/1 'Hanken Grotesk'", color: "#726A5E", background: "transparent", border: "1.5px solid #E6DDCF", borderRadius: 12, cursor: "pointer" }}>Save &amp; finish later</button>
            <button type="button" onClick={submit} disabled={submitting} className="po-cta" style={{ marginLeft: "auto", padding: "13px 30px", font: "700 14px/1 'Hanken Grotesk'", color: "#fff", background: "#CF4A2C", border: "none", borderRadius: 12, cursor: submitting ? "wait" : "pointer", opacity: submitting ? 0.7 : 1, boxShadow: "0 6px 16px rgba(207,74,44,.26)" }}>
              {submitting ? "Submitting…" : "Submit for review"}
            </button>
          </div>
        </main>
      </div>
    </div>
  );
}

// ── Field renderer ─────────────────────────────────────────────────────────
function Field({ f, value, onChange, invalid, chips, chipBuf, onChipBuf, onChipKey, onChipBlur, onChipRemove }) {
  const kind = f.kind || "text";
  const disabled = !!f.admin;
  const errCls = invalid ? "po-err" : "";
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 7, gridColumn: f.span || "auto" }}>
      <label style={LBL}>{f.label} {f.req ? <span style={{ color: "#CF4A2C" }}>*</span> : null}</label>
      {kind === "chips" ? (
        <div className={`po-in ${errCls}`} style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center", minHeight: 46, padding: "8px 10px", background: "#FFFDF9", border: "1px solid #E6DDCF", borderRadius: 11 }}>
          {chips.map((c) => <span key={c} className="po-tag">{c} <button type="button" className="po-x" onClick={() => onChipRemove(c)}>×</button></span>)}
          <input value={chipBuf} onChange={(e) => onChipBuf(e.target.value)} onKeyDown={onChipKey} onBlur={onChipBlur} placeholder={chips.length ? "" : f.ph} style={{ flex: 1, minWidth: 120, border: "none", outline: "none", background: "transparent", fontSize: 14.5, fontFamily: "'Hanken Grotesk',sans-serif", color: "#221C17" }} />
        </div>
      ) : kind === "area" ? (
        <textarea className={`po-in ${errCls}`} placeholder={f.ph} rows={f.rows || 3} value={value || ""} disabled={disabled} onChange={(e) => onChange(e.target.value)} style={{ ...INP, resize: "vertical", ...(disabled ? DIS : {}) }} />
      ) : kind === "select" ? (
        <select className={`po-in ${errCls}`} value={value || ""} disabled={disabled} onChange={(e) => onChange(e.target.value)} style={{ ...INP, ...(disabled ? DIS : {}) }}>
          <option value="">{f.ph || "Select"}</option>
          {yearOptions().map((y) => <option key={y} value={y}>{y}</option>)}
        </select>
      ) : kind === "toggle" ? (
        <label style={{ display: "inline-flex", alignItems: "center", gap: 8, ...(disabled ? DIS : {}) }}>
          <input type="checkbox" checked={!!value} disabled={disabled} onChange={(e) => onChange(e.target.checked)} style={{ width: 17, height: 17, accentColor: "#CF4A2C" }} />
          <span style={{ font: "500 13px/1 'Hanken Grotesk'", color: "#726A5E" }}>{value ? "Yes" : "No"}</span>
        </label>
      ) : (
        <input className={`po-in ${errCls}`} type={kind === "num" ? "number" : "text"} placeholder={f.ph} value={value ?? ""} disabled={disabled} onChange={(e) => onChange(e.target.value)} style={{ ...INP, ...(disabled ? DIS : {}) }} />
      )}
      {f.help ? <span style={{ font: "400 11.5px/1.4 'Hanken Grotesk'", color: "#A89C8A" }}>{f.help}</span> : null}
    </div>
  );
}

// ── Upload tile ──────────────────────────────────────────────────────────
function Upload({ u, list, onFile, onClear }) {
  const has = list.length > 0;
  return (
    <div className="po-drop" style={{ position: "relative", border: `1.5px dashed ${has ? "#2E7D4F" : "#D8CFC0"}`, borderRadius: 14, background: has ? "#F3F8F3" : "#FFFDF9", padding: 16, cursor: "pointer", overflow: "hidden" }}>
      <input type="file" accept={u.accept} multiple={!!u.multiple} onChange={(e) => onFile(e.target.files)} style={{ position: "absolute", inset: 0, opacity: 0, cursor: "pointer" }} />
      {has ? (
        <div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ font: "700 12px/1.3 'Hanken Grotesk'", color: "#221C17" }}>{u.title}</span>
            <span style={{ position: "relative", zIndex: 2, font: "700 10.5px/1 'Hanken Grotesk'", color: "#CF4A2C", cursor: "pointer" }} onClick={(e) => { e.stopPropagation(); onClear(); }}>Replace</span>
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 10 }}>
            {list.map((fl, k) => (
              <div key={k} style={{ display: "flex", alignItems: "center", gap: 7, padding: "5px 9px", background: "#fff", border: "1px solid #E6DDCF", borderRadius: 9 }}>
                <span style={{ maxWidth: 110, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", font: "600 10.5px/1.3 'Hanken Grotesk'", color: "#3C3228" }}>{fl.name}</span>
                <span style={{ font: "400 9.5px/1.3 'Hanken Grotesk'", color: "#A89C8A" }}>{(fl.size / 1048576).toFixed(1)}MB</span>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 8, font: "600 10.5px/1.3 'Hanken Grotesk'", color: "#2E7D4F" }}>✓ {list.length} uploaded</div>
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

// ── Repeatable (FAQ / badges) ──────────────────────────────────────────────
function Repeatable({ rows, onAdd, addLabel, empty, children }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      {rows.length === 0 ? <p style={{ margin: 0, font: "400 12.5px/1.5 'Hanken Grotesk'", color: "#A89C8A" }}>{empty}</p> : null}
      {rows.map((row, i) => <div key={i} className="po-reveal">{children(row, i)}</div>)}
      <button type="button" onClick={onAdd} className="po-add" style={{ alignSelf: "flex-start", padding: "10px 18px", font: "700 13px/1 'Hanken Grotesk'", color: "#726A5E", background: "transparent", border: "1.5px dashed #D8CFC0", borderRadius: 12, cursor: "pointer" }}>{addLabel}</button>
    </div>
  );
}

// ── Styles / bits ──────────────────────────────────────────────────────────
const LBL = { font: "600 12px/1.3 'Hanken Grotesk'", letterSpacing: ".04em", textTransform: "uppercase", color: "#726A5E" };
const INP = { width: "100%", padding: "12px 14px", fontSize: 14.5, fontFamily: "'Hanken Grotesk',sans-serif", color: "#221C17", background: "#FFFDF9", border: "1px solid #E6DDCF", borderRadius: 11 };
const DIS = { background: "#F1ECE3", color: "#A89C8A", cursor: "not-allowed" };

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
const sectionOf = () => "basic";

const UploadSvg = () => (<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><path d="M17 8l-5-5-5 5" /><path d="M12 3v12" /></svg>);
const WarnSvg = () => (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="M12 8v4M12 16h.01" /></svg>);

function Centered({ children }) {
  return <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#EFE7DA", font: "500 15px/1.5 'Hanken Grotesk'", color: "#726A5E" }}><Fonts />{children}</div>;
}

function ErrorView({ kind }) {
  const map = {
    expired: { t: "This link has expired", d: "Your onboarding link is no longer valid. Contact our team for a fresh one." },
    used: { t: "Profile already submitted", d: "This onboarding link has already been used. Our team is reviewing your profile." },
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
    { mark: "1", title: "We review your proposal", desc: "Our team checks everything personally, usually within 2–3 working days." },
    { mark: "2", title: "A short intro call", desc: "We may reach out for a quick call or any missing details." },
    { mark: "3", title: "Approved & live", desc: "Once approved, your profile goes live and your dashboard is activated." },
  ];
  return (
    <div style={{ minHeight: "100vh", background: "#EFE7DA", fontFamily: "'Hanken Grotesk',sans-serif" }}>
      <Fonts />
      <style>{FORM_CSS}</style>
      <div style={{ maxWidth: 480, margin: "0 auto", padding: "6vh 22px", textAlign: "center" }}>
        <div className="po-check" style={{ width: 76, height: 76, margin: "0 auto", borderRadius: "50%", background: "#E0EFE4", display: "flex", alignItems: "center", justifyContent: "center" }}><svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#2E7D4F" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5" /></svg></div>
        <div style={{ marginTop: 16, display: "inline-flex", alignItems: "center", gap: 7, padding: "6px 14px", borderRadius: 99, background: "#FBF3E4", border: "1px solid #EBD9B4", font: "700 11px/1 'Hanken Grotesk'", letterSpacing: ".05em", textTransform: "uppercase", color: "#B07D2A" }}><span style={{ width: 7, height: 7, borderRadius: "50%", background: "#E0A93B" }} />Pending review</div>
        <h1 style={{ margin: "18px 0 0", fontFamily: "'Bricolage Grotesque',sans-serif", fontWeight: 700, fontSize: "clamp(26px,3.6vw,34px)", letterSpacing: "-.02em", color: "#221C17" }}>Profile submitted!</h1>
        <p style={{ margin: "12px 0 0", font: "400 15px/1.65 'Hanken Grotesk'", color: "#726A5E" }}>Thanks for completing your host profile. Our team reviews every submission personally — you&apos;ll hear from us <strong style={{ color: "#3C3228" }}>within 2–3 working days</strong>.</p>
        <div style={{ marginTop: 24, textAlign: "left", background: "#FFFDF9", border: "1px solid #E6DDCF", borderRadius: 16, padding: "20px 22px" }}>
          <div style={{ font: "700 10.5px/1 'Hanken Grotesk'", letterSpacing: ".1em", textTransform: "uppercase", color: "#A89C8A" }}>What happens next</div>
          <div style={{ marginTop: 14, display: "flex", flexDirection: "column", gap: 14 }}>
            {steps.map((ns) => (
              <div key={ns.mark} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                <span style={{ width: 24, height: 24, flex: "none", borderRadius: "50%", background: "#F6E4DC", color: "#CF4A2C", display: "flex", alignItems: "center", justifyContent: "center", font: "700 11px/1 'Hanken Grotesk'" }}>{ns.mark}</span>
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

const FORM_CSS = `
  .po-in::placeholder { color:#A89C8A; }
  .po-in:focus { border-color:#CF4A2C !important; box-shadow:0 0 0 4px rgba(207,74,44,.12); background:#FFFFFF; outline:none; }
  .po-err { border-color:#C0392B !important; background:#FCF3F2 !important; }
  .po-cta { transition:transform .18s ease, box-shadow .18s ease, background .18s ease; }
  .po-cta:hover { transform:translateY(-2px); box-shadow:0 12px 26px rgba(207,74,44,.3); background:#C0421F; }
  .po-ghost { transition:background .16s ease, border-color .16s ease; }
  .po-ghost:hover { background:#FBF6EE; border-color:#CF4A2C; }
  .po-tag { display:inline-flex; align-items:center; gap:6px; padding:6px 8px 6px 12px; border-radius:99px; background:#F6E4DC; border:1.5px solid #EBC9BC; font:600 12.5px/1 'Hanken Grotesk'; color:#A23A26; }
  .po-x { display:inline-flex; align-items:center; justify-content:center; width:16px; height:16px; border-radius:50%; background:rgba(162,58,38,.16); color:#A23A26; font-size:11px; line-height:1; cursor:pointer; border:none; }
  .po-x:hover { background:#A23A26; color:#fff; }
  .po-drop:hover { border-color:#CF4A2C; background:#FBF6EE; }
  .po-navitem:hover { background:rgba(233,98,47,.08); }
  .po-add:hover { background:#FBF6EE; border-color:#CF4A2C; color:#CF4A2C; }
  .po-card { border:1px solid #E6DDCF; border-radius:14px; padding:14px 16px; background:#FFFDF9; }
  .po-cardhd { display:flex; justify-content:space-between; align-items:center; margin-bottom:10px; font:700 12px/1 'Hanken Grotesk'; color:#221C17; }
  .po-rm { font:700 11px/1 'Hanken Grotesk'; color:#C0392B; background:none; border:none; cursor:pointer; }
  @keyframes poPop { 0%{transform:scale(.6);opacity:0;} 60%{transform:scale(1.08);} 100%{transform:scale(1);opacity:1;} }
  .po-check { animation:poPop .6s cubic-bezier(.22,.61,.36,1) both; }
  @keyframes poExpand { from{opacity:0;transform:translateY(-4px);} to{opacity:1;transform:none;} }
  .po-reveal { animation:poExpand .24s ease both; }
  @keyframes poDot { 0%,100%{opacity:.35;} 50%{opacity:1;} }
  .po-saving { animation:poDot 1s ease-in-out infinite; }
  @media (prefers-reduced-motion: reduce){ .po-check,.po-reveal,.po-saving { animation:none; } }
  @media (max-width: 900px){ .po-shell { grid-template-columns:1fr !important; } .po-rail { position:static !important; height:auto !important; } }
`;
