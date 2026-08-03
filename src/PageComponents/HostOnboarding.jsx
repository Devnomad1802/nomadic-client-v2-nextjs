"use client";

/* eslint-disable react/prop-types */
/**
 * HostOnboarding — standalone, secure, token-gated host onboarding wizard.
 * NOT part of site navigation. Reached only via the unique link emailed after
 * an application is approved: /host-onboarding/{token}.
 *
 * Design ported 1:1 from the approved "Host Onboarding Portal" mockup (10-step
 * wizard, clay/cream brand). On submit it creates a DRAFT host on the backend
 * (status:"draft") for admin review — no live profile / dashboard yet (Phase 2).
 *
 * Field ids below match the server controller (controllers/hostOnboarding.js)
 * body keys exactly, so the multipart submit maps straight through.
 */
import { useEffect, useMemo, useRef, useState, useCallback } from "react";

// ── Wizard config (mirrors the mockup's SECTIONS) ─────────────────────────
const SECTIONS = [
  { title: "Basic Information", vis: "Shown on your public profile",
    desc: "The essentials travellers and our team use to identify and reach you.",
    fields: [
      { id: "hostName", label: "Full name", req: 1, ph: "As on your government ID", span: "auto", validate: "req" },
      { id: "displayName", label: "Display name", ph: "Friendlier name travellers see", span: "auto", help: "Optional" },
      { id: "email", label: "Email address", req: 1, ph: "you@email.com", span: "auto", validate: "email", help: "Your host account login" },
      { id: "phone", label: "Mobile number", req: 1, ph: "+91 98765 43210", span: "auto", validate: "phone", help: "With country code" },
      { id: "city", label: "City", req: 1, ph: "Where you're based", span: "auto", validate: "req" },
      { id: "state", label: "State", req: 1, ph: "", span: "auto", validate: "req" },
      { id: "location", label: "Home base / operating location", req: 1, ph: "e.g. Manali, Himachal Pradesh", span: "1 / -1", validate: "req", help: "Displayed on your profile card" },
    ],
    chips: [
      { id: "country", label: "Country", req: 1, type: "radio", validate: "reqSel", otherMode: "input", otherPh: "Please specify your country", options: ["India", "Nepal", "Bhutan", "Sri Lanka", "Other"] },
      { id: "languages", label: "Languages you speak", req: 1, type: "checkbox", validate: "reqSel", otherMode: "chip", otherPh: "Enter your language", options: ["Hindi", "English", "Marathi", "Bengali", "Tamil", "Telugu", "Kannada", "Malayalam", "Gujarati", "Punjabi", "Nepali", "Other"] },
    ] },

  { title: "About You", vis: "Shown on your public profile",
    desc: "The heart of your profile — travellers book hosts they connect with. Write naturally; our team helps polish.",
    fields: [
      { id: "overview", label: "Tell us your story", req: 1, area: 1, rows: 5, ph: "Who are you? How did you get into hosting travel?", span: "1 / -1", validate: "req", help: "150–300 words works great" },
      { id: "shortBio", label: "One-line intro for your card", req: 1, ph: '"Trekking the Himalayas with small groups since 2015"', span: "1 / -1", validate: "req", help: "Max ~120 characters" },
      { id: "whyHost", label: "Why do you host experiences?", req: 1, area: 1, rows: 3, ph: "What drives you?", span: "auto", validate: "req" },
      { id: "unique", label: "What makes your experiences unique?", req: 1, area: 1, rows: 3, ph: "The thing guests remember", span: "auto", validate: "req" },
    ] },

  { title: "Business Information", vis: "Some fields private",
    desc: "Tells us who we're partnering with. Registration & tax fields stay private; brand name is public.",
    fields: [
      { id: "brandName", label: "Business / brand name", req: 1, ph: "e.g. Mountain Collective", span: "1 / -1", validate: "req", help: "The name travellers see" },
      { id: "foundedYear", label: "Year you started hosting", req: 1, ph: "e.g. 2016", span: "auto", validate: "req" },
      { id: "bizType", label: "Business type", ph: "Individual / Sole prop / Pvt Ltd / LLP", span: "auto", help: "Optional" },
      { id: "gstNumber", label: "GST number", ph: "If registered", span: "auto", help: "🔒 Private" },
      { id: "panNumber", label: "PAN number", req: 1, ph: "ABCDE1234F", span: "auto", validate: "pan", help: "🔒 Private" },
      { id: "bizAddress", label: "Registered business address", ph: "Address + pincode", span: "1 / -1", help: "🔒 Private" },
    ] },

  { title: "Branding", vis: "Shown on your public profile",
    desc: "How you'll look across Nomadic Townies. Great imagery drives more bookings.",
    fields: [
      { id: "tagline", label: "Tagline", req: 1, ph: '"Small groups. Big mountains."', span: "1 / -1", validate: "req", help: "Short & punchy, ~60 chars" },
    ],
    uploads: [
      { id: "logo", title: "Logo / profile photo", req: 1, accept: "image/*", help: "Square, min 400×400 · JPG/PNG · max 10 MB", validate: "reqFile" },
      { id: "cover", title: "Cover photo", req: 1, accept: "image/*", help: "Wide landscape, min 1600×900", validate: "reqFile" },
      { id: "gallery", title: "Gallery (up to 10)", req: 1, accept: "image/*", multiple: 1, help: "5–10 photos of trips in action", validate: "reqFile" },
    ] },

  { title: "Specialties & Expertise", vis: "Shown on your public profile",
    desc: "Decides where your trips appear and shows travellers you know your terrain.",
    chips: [
      { id: "categories", label: "Experience categories", req: 1, type: "checkbox", validate: "reqSel", otherMode: "chip", otherPh: "Enter a category", options: ["Backpacking", "Trekking", "Adventure", "Camping", "Photography", "Wellness", "Spiritual", "Cultural", "Wildlife", "Food", "Road Trips", "Bike Expeditions", "Digital Nomad", "Workshops", "Corporate Retreats", "Other"] },
    ],
    fields: [
      { id: "expertise", label: "Areas of expertise", req: 1, tags: 1, ph: "Type & press Enter, or comma-separate…", span: "1 / -1", validate: "reqTags", help: "e.g. High-altitude treks, Winter expeditions, First-timers" },
      { id: "regions", label: "Regions / mountains you cover", req: 1, area: 1, rows: 2, ph: "Himachal, Uttarakhand, Ladakh, Spiti", span: "auto", validate: "req" },
      { id: "countries", label: "Countries you operate in", req: 1, ph: "India, Nepal", span: "auto", validate: "req" },
      { id: "experience", label: "Years of experience", req: 1, ph: '"8+ years leading Himalayan treks"', span: "auto", validate: "req" },
      { id: "certifications", label: "Certifications & training", area: 1, rows: 2, ph: "e.g. Basic Mountaineering Course, NIM, 2018", span: "auto", help: "List each with year" },
      { id: "achievements", label: "Proudest achievements", tags: 1, ph: "Type & press Enter, or comma-separate…", span: "1 / -1", help: "Awards, records, media features, milestone expeditions" },
    ] },

  { title: "Verification Badges", vis: "Badges shown publicly · documents private",
    desc: "Verified hosts get a trust badge and rank higher. Tick what you hold; upload proof in the Documents step.",
    chips: [
      { id: "badges", label: "Which of these do you have?", req: 1, type: "checkbox", validate: "reqSel", otherMode: "chip", otherPh: "Enter a badge / credential", options: ["Government ID", "Business Registration", "GST Registration", "First Aid Certification", "Trek Leader Certification", "Wilderness Training", "Adventure License", "Local Guide License", "Insurance", "Other"] },
    ] },

  { title: "Trust & Service Quality", vis: "Shown on your public profile",
    desc: "Helps us match you with the right travellers and reassures them you run a safe operation.",
    chips: [
      { id: "groupSize", label: "Maximum group size", req: 1, type: "radio", validate: "reqSel", otherMode: "input", otherPh: "Enter custom group size", options: ["Up to 10", "11–20", "21–40", "40+", "Other"] },
      { id: "duration", label: "Typical trip length", req: 1, type: "checkbox", validate: "reqSel", otherMode: "input", otherPh: "Enter custom duration", options: ["Day trips", "Weekend (2–3 days)", "4–7 days", "8+ days", "Other"] },
      { id: "difficulty", label: "Difficulty levels you run", req: 1, type: "checkbox", validate: "reqSel", otherMode: "input", otherPh: "Enter custom level", options: ["Easy", "Moderate", "Challenging", "Expert", "Other"] },
      { id: "ageGroups", label: "Age groups you host", req: 1, type: "checkbox", validate: "reqSel", otherMode: "input", otherPh: "Enter custom age group", options: ["Under 18 (guardians)", "18–35", "35–50", "50+", "Families", "Other"] },
      { id: "medical", label: "First-aid-trained person on trips?", req: 1, type: "radio", validate: "reqSel", otherMode: "input", otherPh: "Please specify", options: ["Always", "Usually", "Planning to add", "Other"] },
    ],
    fields: [
      { id: "emergency", label: "Emergency preparedness", req: 1, area: 1, rows: 3, ph: "First-aid kits, evacuation plans, satellite phones, nearest-hospital protocols…", span: "1 / -1", validate: "req" },
    ] },

  { title: "Contact Information", vis: "Private — routed through platform",
    desc: "For our team and payout coordination. Travellers only ever reach you through Nomadic Townies chat — direct contacts are never shown.",
    note: 'These are for internal coordination only. Your public profile shows a "Message on Nomadic" button, never your phone or email.',
    fields: [
      { id: "whatsapp", label: "WhatsApp number", ph: "Only if different from mobile", span: "auto", validate: "phoneOpt" },
      { id: "altPhone", label: "Alternate / emergency phone", ph: "+91 …", span: "auto", validate: "phoneOpt" },
      { id: "contactName", label: "Primary contact person", ph: "Who we speak to", span: "auto" },
      { id: "contactRole", label: "Their role", ph: "e.g. Founder, Operations lead", span: "auto" },
      { id: "completeAddress", label: "Full mailing address", req: 1, area: 1, rows: 2, ph: "Address, city, state, pincode", span: "1 / -1", validate: "req" },
    ] },

  { title: "Bank Details", vis: "Private — payouts only",
    desc: "Used only to send your payouts. Never shown publicly. You can add up to two accounts.",
    note: 'Prefer to share later? Type "Will share later" in the account fields — our team collects these securely on your intro call so you can keep going.',
    bank: 1 },

  { title: "Document Uploads", vis: "Private — verification only",
    desc: "Upload clear photos or PDFs. All documents are encrypted and only seen by our verification team.",
    uploads: [
      { id: "docPan", title: "PAN card", req: 1, accept: "image/*,application/pdf", help: "1 file · max 10 MB", validate: "reqFile" },
      { id: "docId", title: "Aadhaar / Passport", req: 1, accept: "image/*,application/pdf", multiple: 1, help: "Up to 2 files", validate: "reqFile" },
      { id: "docBank", title: "Passbook / cheque", req: 1, accept: "image/*,application/pdf", help: "1 file", validate: "reqFile" },
      { id: "docGst", title: "GST certificate", accept: "image/*,application/pdf", help: "Optional" },
      { id: "docBiz", title: "Business registration", accept: "image/*,application/pdf", help: "Optional" },
      { id: "docCert", title: "Certifications & licenses", accept: "image/*,application/pdf", multiple: 1, help: "Up to 5" },
      { id: "docIns", title: "Insurance documents", accept: "image/*,application/pdf", multiple: 1, help: "Up to 2" },
    ],
    consent: 1 },
];

const BANK_FIELDS = [
  { id: "accHolder", label: "Account holder name", req: 1, ph: "", span: "auto", validate: "req" },
  { id: "bankName", label: "Bank name", req: 1, ph: "", span: "auto", validate: "req" },
  { id: "branch", label: "Branch name", ph: "", span: "auto" },
  { id: "accType", label: "Account type", ph: "Savings / Current", span: "auto" },
  { id: "accNumber", label: "Account number", req: 1, ph: "", span: "auto", validate: "req" },
  { id: "ifsc", label: "IFSC code", req: 1, ph: "e.g. HDFC0001234", span: "auto", validate: "ifsc" },
];

// Brand fonts for this standalone page (not loaded globally elsewhere).
const FONT_CSS = "@import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,400..800&family=Hanken+Grotesk:wght@400;500;600;700;800&display=swap');";
const Fonts = () => <style>{FONT_CSS}</style>;

const KEY = "nt_host_onboarding_v1";
const isEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v || "");
const isPhone = (v) => (v || "").replace(/\D/g, "").length >= 8;
const isPan = (v) => /^[A-Z]{5}[0-9]{4}[A-Z]$/i.test((v || "").trim());
const isIfsc = (v) => /^[A-Z]{4}0[A-Z0-9]{6}$/i.test((v || "").trim());
const splitList = (s) => (s || "").split(/[\n,]/).map((x) => x.trim()).filter(Boolean);

// Actionable submit-error messages, keyed by the server's error code.
const SUBMIT_ERRORS = {
  email_in_use: "This email is already registered to a host account. Use a different email or contact our team.",
  pan_in_use: "This PAN is already on file for another host. Please check the number.",
  duplicate: "Some details are already on file. Check your email and PAN, then try again.",
  validation: "Some details couldn't be saved. Please review your entries and try again.",
  network: "Network problem — your answers are safe. Check your connection and submit again.",
  server_error: "Our server hit a snag. Your answers are saved — please try submitting again.",
  used: "This onboarding link was already submitted.",
  expired: "This onboarding link has expired. Contact our team for a new one.",
};
const submitErrMsg = (code) => SUBMIT_ERRORS[code] || "Something went wrong submitting. Your answers are saved — please try again.";

export default function HostOnboarding({ token }) {
  const [phase, setPhase] = useState("loading"); // loading | error | form | success
  const [errKind, setErrKind] = useState(null); // invalid | expired | used | not_approved | network

  const [data, setData] = useState({});
  const [sel, setSel] = useState({});
  const [tags, setTags] = useState({});
  const [tagBuf, setTagBuf] = useState({});
  const [otherText, setOtherText] = useState({});
  const [customOpts, setCustomOpts] = useState({});
  const [files, setFiles] = useState({}); // id -> File[]
  const [banks, setBanks] = useState([{}]);
  const [consent, setConsent] = useState(false);
  const [step, setStep] = useState(0);
  const [errors, setErrors] = useState({});
  const [showErr, setShowErr] = useState(false);
  const [saveText, setSaveText] = useState("All changes saved");
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const saveTimer = useRef(null);

  // ── Validate token + prefill from the approved application ──────────────
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const r = await fetch(`/api/host-portal/onboarding/${token}`);
        const j = await r.json().catch(() => ({}));
        if (!alive) return;
        if (!r.ok || !j.ok) {
          setErrKind(j.error || "invalid");
          setPhase("error");
          return;
        }
        // Restore a locally-saved draft (if same token) BEFORE applying prefill.
        let restored = {};
        try {
          const raw = localStorage.getItem(KEY);
          if (raw) { const s = JSON.parse(raw); if (s.token === token) restored = s; }
        } catch (_e) { /* ignore */ }
        const pf = j.prefill || {};
        setData((d) => ({
          hostName: pf.hostName || "", email: pf.email || "", phone: pf.phone || "",
          city: pf.city || "", overview: pf.overview || "", foundedYear: pf.foundedYear || "",
          ...(restored.data || {}), ...d,
        }));
        if (restored.sel) setSel(restored.sel);
        else if (pf.categories?.length) setSel({ categories: pf.categories });
        if (restored.tags) setTags(restored.tags);
        if (restored.otherText) setOtherText(restored.otherText);
        if (restored.customOpts) setCustomOpts(restored.customOpts);
        if (restored.banks?.length) setBanks(restored.banks);
        if (restored.consent) setConsent(true);
        if (typeof restored.step === "number") setStep(restored.step);
        setPhase("form");
      } catch (_e) {
        if (!alive) return;
        setErrKind("network");
        setPhase("error");
      }
    })();
    return () => { alive = false; };
  }, [token]);

  // ── Debounced localStorage autosave (files can't be persisted). The write
  // is pure; the "Saving…/saved" indicator is driven asynchronously via timers
  // so we never call setState synchronously inside the effect body. ──────────
  const writeDraft = useCallback(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify({
        token, data, sel, tags, otherText, customOpts, banks, consent, step,
      }));
    } catch (_e) { /* ignore quota */ }
  }, [token, data, sel, tags, otherText, customOpts, banks, consent, step]);

  useEffect(() => {
    if (phase !== "form") return undefined;
    const flash = setTimeout(() => { setSaving(true); setSaveText("Saving…"); }, 0);
    writeDraft();
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => { setSaving(false); setSaveText("All changes saved"); }, 600);
    return () => clearTimeout(flash);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, sel, tags, otherText, customOpts, banks, consent, step]);

  // ── Field setters ───────────────────────────────────────────────────────
  const setField = (id, v) => { setData((d) => ({ ...d, [id]: v })); setErrors((e) => ({ ...e, [id]: undefined })); };
  const clearErr = (id) => setErrors((e) => (e[id] ? { ...e, [id]: undefined } : e));

  const toggleSel = (gid, opt, single) => {
    setSel((s) => {
      const cur = s[gid] || [];
      let nv = single ? [opt] : cur.includes(opt) ? cur.filter((x) => x !== opt) : cur.concat(opt);
      if (!nv.includes("Other")) {
        setOtherText((o) => { const n = { ...o }; delete n[gid]; return n; });
        const co = customOpts[gid];
        if (co) { nv = nv.filter((x) => !co.includes(x)); setCustomOpts((c) => { const n = { ...c }; delete n[gid]; return n; }); }
      }
      return { ...s, [gid]: nv };
    });
    clearErr(gid);
  };

  const addOtherInput = (gid) => {
    const val = (otherText[gid] || "").trim();
    if (!val) return;
    // input-mode Other: store the typed value as the selection replacement.
    setSel((s) => {
      const cur = (s[gid] || []).filter((x) => x !== "Other" && !(customOpts[gid] || []).includes(x));
      return { ...s, [gid]: cur.concat(val) };
    });
    setCustomOpts((c) => ({ ...c, [gid]: [val] }));
  };

  const addOtherChip = (gid) => {
    const val = (otherText[gid] || "").trim();
    if (!val) return;
    setSel((s) => ({ ...s, [gid]: (s[gid] || []).filter((x) => x !== "Other").concat(val) }));
    setCustomOpts((c) => ({ ...c, [gid]: (c[gid] || []).concat(val) }));
    setOtherText((o) => ({ ...o, [gid]: "" }));
  };

  const addTag = (id, raw) => {
    const parts = splitList(raw);
    if (!parts.length) return;
    setTags((t) => ({ ...t, [id]: Array.from(new Set((t[id] || []).concat(parts))) }));
    setTagBuf((b) => ({ ...b, [id]: "" }));
    clearErr(id);
  };
  const removeTag = (id, val) => setTags((t) => ({ ...t, [id]: (t[id] || []).filter((x) => x !== val) }));

  const onFile = (id, fileList, multiple, max) => {
    const arr = Array.from(fileList || []);
    setFiles((f) => ({ ...f, [id]: multiple ? (f[id] || []).concat(arr).slice(0, max || 10) : arr.slice(0, 1) }));
    clearErr(id);
  };
  const clearFiles = (id) => setFiles((f) => { const n = { ...f }; delete n[id]; return n; });

  const setBank = (i, fid, v) => setBanks((bs) => bs.map((b, idx) => (idx === i ? { ...b, [fid]: v } : b)));
  const addBank = () => setBanks((bs) => (bs.length < 2 ? bs.concat({}) : bs));
  const removeBank = (i) => setBanks((bs) => bs.filter((_, idx) => idx !== i));

  // ── Validation per section ──────────────────────────────────────────────
  const sec = SECTIONS[step];

  const validateSection = (s) => {
    const er = {};
    (s.fields || []).forEach((f) => {
      const v = f.tags ? (tags[f.id] || []) : data[f.id];
      switch (f.validate) {
        case "req": if (!String(v || "").trim()) er[f.id] = 1; break;
        case "email": if (!isEmail(v)) er[f.id] = 1; break;
        case "phone": if (!isPhone(v)) er[f.id] = 1; break;
        case "phoneOpt": if (v && !isPhone(v)) er[f.id] = 1; break;
        case "pan": if (!isPan(v)) er[f.id] = 1; break;
        case "reqTags": if (!(tags[f.id] || []).length) er[f.id] = 1; break;
        default: break;
      }
    });
    (s.chips || []).forEach((g) => { if (g.validate === "reqSel" && !(sel[g.id] || []).length) er[g.id] = 1; });
    (s.uploads || []).forEach((u) => { if (u.validate === "reqFile" && !(files[u.id] || []).length) er[u.id] = 1; });
    if (s.bank) {
      BANK_FIELDS.forEach((f) => {
        if (!f.req) return;
        const v = banks[0]?.[f.id];
        if (!String(v || "").trim()) er[`bank0_${f.id}`] = 1;
        else if (f.validate === "ifsc" && !isIfsc(v)) er[`bank0_${f.id}`] = 1;
      });
    }
    if (s.consent && !consent) er.consent = 1;
    return er;
  };

  const sectionValid = (i) => Object.keys(validateSection(SECTIONS[i])).length === 0;

  const next = async () => {
    const er = validateSection(sec);
    if (Object.keys(er).length) { setErrors(er); setShowErr(true); window.scrollTo({ top: 0, behavior: "smooth" }); return; }
    setShowErr(false); setErrors({});
    if (step < SECTIONS.length - 1) { setStep((s) => s + 1); window.scrollTo({ top: 0, behavior: "smooth" }); }
    else await submit();
  };
  const back = () => { setShowErr(false); setStep((s) => Math.max(0, s - 1)); window.scrollTo({ top: 0, behavior: "smooth" }); };
  const goStep = (i) => { setShowErr(false); setStep(i); window.scrollTo({ top: 0, behavior: "smooth" }); };
  const saveLater = () => { writeDraft(); setSaveText("Saved — resume anytime from your link"); };

  // ── Submit → multipart → creates a DRAFT host for admin review ──────────
  const submit = async () => {
    setSubmitting(true);
    try {
      const fd = new FormData();
      // plain text fields (ids already match server body keys)
      const textIds = ["hostName", "displayName", "email", "phone", "city", "state", "location",
        "overview", "shortBio", "whyHost", "unique", "brandName", "foundedYear", "bizType",
        "gstNumber", "panNumber", "bizAddress", "tagline", "experience", "whatsapp", "altPhone",
        "contactName", "contactRole", "completeAddress", "emergency", "medical"];
      textIds.forEach((id) => { if (data[id] != null && data[id] !== "") fd.append(id, data[id]); });

      // selections → server-expected shapes
      fd.append("country", (sel.country || [])[0] || "");
      fd.append("languages", JSON.stringify(sel.languages || []));
      fd.append("categories", JSON.stringify(sel.categories || []));
      fd.append("regions", JSON.stringify(splitList(data.regions)));
      fd.append("expertise", JSON.stringify(tags.expertise || []));
      fd.append("certifications", JSON.stringify(splitList(data.certifications)));
      fd.append("achievements", JSON.stringify(tags.achievements || []));
      fd.append("badges", JSON.stringify((sel.badges || []).map((t) => ({ title: t }))));
      // service quality
      fd.append("groupSize", (sel.groupSize || [])[0] || "");
      fd.append("duration", (sel.duration || []).join(", "));
      fd.append("difficulty", (sel.difficulty || []).join(", "));
      fd.append("ageGroups", JSON.stringify(sel.ageGroups || []));
      // bank: primary + full list
      const b0 = banks[0] || {};
      fd.append("accountHolderName", b0.accHolder || "");
      fd.append("bankName", b0.bankName || "");
      fd.append("accountNumber", b0.accNumber || "");
      fd.append("ifscCode", b0.ifsc || "");
      fd.append("bankAccounts", JSON.stringify(banks.map((b) => ({
        accountHolderName: b.accHolder || "", bankName: b.bankName || "",
        accountNumber: b.accNumber || "", ifscCode: b.ifsc || "",
      }))));
      // files
      ["logo", "cover", "gallery", "docPan", "docId", "docBank", "docGst", "docBiz", "docCert", "docIns"]
        .forEach((id) => (files[id] || []).forEach((fl) => fd.append(id, fl)));

      const r = await fetch(`/api/host-portal/onboarding/${token}`, { method: "POST", body: fd });
      const j = await r.json().catch(() => ({}));
      if (!r.ok || !j.ok) {
        setShowErr(true);
        setErrors({ _submit: j.error || "submit_failed" });
        setSubmitting(false);
        return;
      }
      try { localStorage.removeItem(KEY); } catch (_e) { /* ignore */ }
      setPhase("success");
    } catch (_e) {
      setShowErr(true); setErrors({ _submit: "network" }); setSubmitting(false);
    }
  };

  const doneCount = useMemo(() => SECTIONS.filter((_, i) => sectionValid(i)).length, [data, sel, tags, files, banks, consent]); // eslint-disable-line react-hooks/exhaustive-deps
  const pctDone = Math.round((doneCount / SECTIONS.length) * 100);

  // ── Render states ───────────────────────────────────────────────────────
  if (phase === "loading") return <Centered>Loading your onboarding…</Centered>;
  if (phase === "error") return <ErrorView kind={errKind} />;
  if (phase === "success") return <SuccessView onReview={() => { setPhase("form"); setStep(0); }} />;

  // ── FORM ─────────────────────────────────────────────────────────────────
  return (
    <div style={{ minHeight: "100vh" }}>
      <Fonts />
      <style>{FORM_CSS}</style>
      <div className="po-shell" style={{ display: "grid", gridTemplateColumns: "288px 1fr", minHeight: "100vh" }}>

        {/* SIDE RAIL */}
        <aside className="po-rail" style={{ position: "sticky", top: 0, alignSelf: "start", height: "100vh", overflow: "auto", background: "#221C17", color: "#E9DFD0", padding: "26px 22px", display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", alignItems: "baseline", fontFamily: "'Bricolage Grotesque',sans-serif", fontWeight: 800, fontSize: 19, letterSpacing: "-.01em" }}><span style={{ color: "#E9622F" }}>nomadic</span><span style={{ color: "#F4EEE4", marginLeft: 6 }}>townies</span></div>
          <div style={{ marginTop: 4, font: "600 11px/1 'Hanken Grotesk'", letterSpacing: ".05em", color: "#8A7E6C" }}>Host onboarding</div>

          <div style={{ marginTop: 22, padding: "14px 16px", background: "#2E271F", border: "1px solid #3A322A", borderRadius: 14 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
              <span style={{ font: "700 11px/1 'Hanken Grotesk'", color: "#C9BFAE" }}>{pctDone}% complete</span>
              <span style={{ font: "600 10.5px/1 'Hanken Grotesk'", color: "#8A7E6C" }}>{doneCount}/10 done</span>
            </div>
            <div style={{ marginTop: 9, height: 6, borderRadius: 99, background: "#1A1510", overflow: "hidden" }}><div style={{ height: "100%", borderRadius: 99, background: "linear-gradient(90deg,#E9622F,#F0B49C)", width: `${pctDone}%`, transition: "width .4s ease" }} /></div>
          </div>

          <nav style={{ marginTop: 18, display: "flex", flexDirection: "column", gap: 2 }}>
            {SECTIONS.map((s, i) => {
              const done = sectionValid(i);
              const active = i === step;
              return (
                <div key={s.title} className="po-navitem" onClick={() => goStep(i)} style={{ display: "flex", alignItems: "center", gap: 12, padding: "9px 10px", borderRadius: 10, cursor: "pointer", background: active ? "rgba(233,98,47,.14)" : "transparent" }}>
                  <span style={{ width: 26, height: 26, flex: "none", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", font: "700 11px/1 'Hanken Grotesk'", background: done ? "#2E7D4F" : active ? "#E9622F" : "transparent", color: done || active ? "#fff" : "#8A7E6C", border: `1.5px solid ${done ? "#2E7D4F" : active ? "#E9622F" : "#3A322A"}` }}>{done ? "✓" : i + 1}</span>
                  <span style={{ flex: 1, minWidth: 0, font: "600 13px/1.25 'Hanken Grotesk'", color: active ? "#F4EEE4" : "#C9BFAE" }}>{s.title}</span>
                </div>
              );
            })}
          </nav>

          <div style={{ marginTop: "auto", paddingTop: 18 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, font: "500 11px/1.4 'Hanken Grotesk'", color: "#8A7E6C" }}>
              <span className={saving ? "po-saving" : ""} style={{ width: 7, height: 7, borderRadius: "50%", background: saving ? "#E0A93B" : "#2E7D4F" }} />{saveText}
            </div>
            <div style={{ marginTop: 12, font: "400 10.5px/1.6 'Hanken Grotesk'", color: "#6B6152" }}>🔒 Bank &amp; ID details are private — never shown on your public profile.</div>
          </div>
        </aside>

        {/* CONTENT */}
        <main style={{ padding: "clamp(22px,4vw,54px) clamp(18px,4vw,60px)", maxWidth: 920, width: "100%" }}>
          <div className="po-step" key={step}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, font: "700 11px/1 'Hanken Grotesk'", letterSpacing: ".09em", textTransform: "uppercase", color: "#CF4A2C" }}>Section {step + 1} of 10 <span style={{ color: "#C9BFAE" }}>·</span> <span style={{ color: "#A89C8A", fontWeight: 600, letterSpacing: 0, textTransform: "none" }}>{sec.vis}</span></div>
            <h1 style={{ margin: "8px 0 0", fontFamily: "'Bricolage Grotesque',sans-serif", fontWeight: 700, fontSize: "clamp(24px,3.2vw,32px)", letterSpacing: "-.02em", color: "#221C17" }}>{sec.title}</h1>
            <p style={{ margin: "9px 0 0", maxWidth: 600, font: "400 15px/1.55 'Hanken Grotesk'", color: "#726A5E" }}>{sec.desc}</p>

            {/* text / textarea / tag fields */}
            {sec.fields?.length ? (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "18px 20px", marginTop: 28 }}>
                {sec.fields.map((f) => (
                  <div key={f.id} style={{ display: "flex", flexDirection: "column", gap: 7, gridColumn: f.span }}>
                    <label style={LBL}>{f.label} {f.req ? <span style={{ color: "#CF4A2C" }}>*</span> : null}</label>
                    {f.area ? (
                      <textarea className={`po-in ${errors[f.id] ? "po-err" : ""}`} placeholder={f.ph} rows={f.rows || 3} value={data[f.id] || ""} onChange={(e) => setField(f.id, e.target.value)} style={{ ...INP, resize: "vertical" }} />
                    ) : f.tags ? (
                      <div className={`po-in ${errors[f.id] ? "po-err" : ""}`} style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center", minHeight: 46, padding: "8px 10px", background: "#FFFDF9", border: "1px solid #E6DDCF", borderRadius: 11 }}>
                        {(tags[f.id] || []).map((c) => (
                          <span key={c} className="po-tag">{c} <button type="button" className="po-x" onClick={() => removeTag(f.id, c)}>×</button></span>
                        ))}
                        <input value={tagBuf[f.id] || ""} onChange={(e) => setTagBuf((b) => ({ ...b, [f.id]: e.target.value }))} onKeyDown={(e) => { if (e.key === "Enter" || e.key === ",") { e.preventDefault(); addTag(f.id, tagBuf[f.id]); } }} onBlur={() => addTag(f.id, tagBuf[f.id])} placeholder={f.ph} style={{ flex: 1, minWidth: 120, border: "none", outline: "none", background: "transparent", fontSize: 14.5, fontFamily: "'Hanken Grotesk',sans-serif", color: "#221C17" }} />
                      </div>
                    ) : (
                      <input className={`po-in ${errors[f.id] ? "po-err" : ""}`} placeholder={f.ph} value={data[f.id] || ""} onChange={(e) => setField(f.id, e.target.value)} style={INP} />
                    )}
                    {f.help ? <span style={{ font: "400 11.5px/1.4 'Hanken Grotesk'", color: "#A89C8A" }}>{f.help}</span> : null}
                  </div>
                ))}
              </div>
            ) : null}

            {/* chip groups */}
            {sec.chips?.length ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 22, marginTop: sec.fields?.length ? 22 : 28 }}>
                {sec.chips.map((g) => {
                  const chosen = sel[g.id] || [];
                  const custom = customOpts[g.id] || [];
                  return (
                    <div key={g.id}>
                      <label style={LBL}>{g.label} {g.req ? <span style={{ color: "#CF4A2C" }}>*</span> : null}</label>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 9, marginTop: 10 }}>
                        {g.options.map((o) => (
                          <label key={o} className="po-chip" style={{ position: "relative" }}>
                            <input type={g.type} name={g.id} checked={chosen.includes(o)} onChange={() => toggleSel(g.id, o, g.type === "radio")} />
                            <span>{o}</span>
                          </label>
                        ))}
                        {custom.map((c) => (
                          <label key={c} className="po-chip" style={{ position: "relative" }}>
                            <input type={g.type} name={g.id} checked readOnly />
                            <span>{c}</span>
                          </label>
                        ))}
                      </div>
                      {chosen.includes("Other") ? (
                        <div className="po-reveal" style={{ display: "flex", gap: 8, marginTop: 10, maxWidth: 420 }}>
                          <input value={otherText[g.id] || ""} onChange={(e) => setOtherText((o) => ({ ...o, [g.id]: e.target.value }))} onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); if (g.otherMode === "chip") addOtherChip(g.id); else addOtherInput(g.id); } }} placeholder={g.otherPh} className="po-in" style={{ flex: 1, padding: "11px 13px", fontSize: 14, fontFamily: "'Hanken Grotesk',sans-serif", color: "#221C17", background: "#FFFDF9", border: "1px solid #E6DDCF", borderRadius: 10 }} />
                          <button type="button" onClick={() => (g.otherMode === "chip" ? addOtherChip(g.id) : addOtherInput(g.id))} className="po-add" style={{ padding: "11px 16px", font: "700 13px/1 'Hanken Grotesk'", color: "#3C3228", background: "#fff", border: "1.5px solid #D8CFC0", borderRadius: 10, cursor: "pointer" }}>Add</button>
                        </div>
                      ) : null}
                    </div>
                  );
                })}
              </div>
            ) : null}

            {/* privacy note */}
            {sec.note ? (
              <div style={{ marginTop: 24, display: "flex", gap: 12, alignItems: "flex-start", background: "#FBF3E4", border: "1px solid #EBD9B4", borderRadius: 12, padding: "14px 16px" }}>
                <span style={{ flex: "none", width: 30, height: 30, borderRadius: "50%", background: "#F6E9CE", display: "flex", alignItems: "center", justifyContent: "center", color: "#B07D2A" }}><LockSvg /></span>
                <span style={{ font: "400 13px/1.6 'Hanken Grotesk'", color: "#8A6A3A" }}>{sec.note}</span>
              </div>
            ) : null}

            {/* bank accounts */}
            {sec.bank ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 18, marginTop: 26 }}>
                {banks.map((b, i) => (
                  <div key={i} className="po-reveal" style={{ border: "1px solid #E6DDCF", borderRadius: 16, padding: "18px 20px", background: "#FFFDF9" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ font: "700 13px/1 'Hanken Grotesk'", letterSpacing: ".03em", color: "#221C17" }}>{i === 0 ? "Primary account" : `Account ${i + 1}`}</span>
                      {i > 0 ? <button type="button" onClick={() => removeBank(i)} style={{ font: "700 11px/1 'Hanken Grotesk'", color: "#C0392B", background: "none", border: "none", cursor: "pointer" }}>Remove</button> : null}
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px 18px", marginTop: 16 }}>
                      {BANK_FIELDS.map((f) => {
                        const key = `bank${i}_${f.id}`;
                        return (
                          <div key={f.id} style={{ display: "flex", flexDirection: "column", gap: 7, gridColumn: f.span }}>
                            <label style={LBL}>{f.label} {f.req ? <span style={{ color: "#CF4A2C" }}>*</span> : null}</label>
                            <input className={`po-in ${errors[key] ? "po-err" : ""}`} placeholder={f.ph} value={b[f.id] || ""} onChange={(e) => { setBank(i, f.id, e.target.value); setErrors((er) => ({ ...er, [key]: undefined })); }} style={INP} />
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
                {banks.length < 2 ? <button type="button" onClick={addBank} className="po-add" style={{ alignSelf: "flex-start", padding: "12px 20px", font: "700 13.5px/1 'Hanken Grotesk'", color: "#726A5E", background: "transparent", border: "1.5px dashed #D8CFC0", borderRadius: 12, cursor: "pointer" }}>+ Add another bank account</button> : null}
              </div>
            ) : null}

            {/* uploads */}
            {sec.uploads?.length ? (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(210px,1fr))", gap: 14, marginTop: sec.fields?.length ? 22 : 28 }}>
                {sec.uploads.map((u) => {
                  const list = files[u.id] || [];
                  const has = list.length > 0;
                  const max = u.id === "gallery" ? 10 : u.id === "docCert" ? 5 : u.id === "docId" || u.id === "docIns" ? 2 : 1;
                  return (
                    <div key={u.id} className="po-drop" style={{ position: "relative", border: `1.5px dashed ${errors[u.id] ? "#C0392B" : has ? "#2E7D4F" : "#D8CFC0"}`, borderRadius: 14, background: has ? "#F3F8F3" : "#FFFDF9", padding: 16, cursor: "pointer", overflow: "hidden" }}>
                      <input type="file" accept={u.accept} multiple={!!u.multiple} onChange={(e) => onFile(u.id, e.target.files, !!u.multiple, max)} style={{ position: "absolute", inset: 0, opacity: 0, cursor: "pointer" }} />
                      {has ? (
                        <div>
                          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                            <span style={{ font: "700 12px/1.3 'Hanken Grotesk'", color: "#221C17" }}>{u.title}</span>
                            <span style={{ position: "relative", zIndex: 2, font: "700 10.5px/1 'Hanken Grotesk'", color: "#CF4A2C", cursor: "pointer" }} onClick={(e) => { e.stopPropagation(); clearFiles(u.id); }}>Replace</span>
                          </div>
                          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 10 }}>
                            {list.map((fl, k) => (
                              <div key={k} style={{ display: "flex", alignItems: "center", gap: 7, padding: "5px 9px 5px 5px", background: "#fff", border: "1px solid #E6DDCF", borderRadius: 9 }}>
                                <span style={{ maxWidth: 96, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", font: "600 10.5px/1.3 'Hanken Grotesk'", color: "#3C3228" }}>{fl.name}</span>
                                <span style={{ font: "400 9.5px/1.3 'Hanken Grotesk'", color: "#A89C8A" }}>{(fl.size / 1024 / 1024).toFixed(1)}MB</span>
                              </div>
                            ))}
                          </div>
                          <div style={{ marginTop: 8, font: "600 10.5px/1.3 'Hanken Grotesk'", color: "#2E7D4F" }}>✓ {list.length} uploaded</div>
                        </div>
                      ) : (
                        <div style={{ textAlign: "center", padding: "6px 0" }}>
                          <div style={{ width: 38, height: 38, margin: "0 auto", borderRadius: 11, background: "#F6E4DC", display: "flex", alignItems: "center", justifyContent: "center", color: "#CF4A2C" }}><UploadSvg /></div>
                          <div style={{ marginTop: 9, font: "700 12.5px/1.3 'Hanken Grotesk'", color: "#221C17" }}>{u.title} {u.req ? <span style={{ color: "#CF4A2C" }}>*</span> : null}</div>
                          <div style={{ marginTop: 4, font: "400 10.5px/1.5 'Hanken Grotesk'", color: "#8A8073" }}>{u.help}</div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : null}

            {/* consent */}
            {sec.consent ? (
              <label style={{ display: "flex", gap: 12, alignItems: "flex-start", marginTop: 24, padding: "16px 18px", border: `1.5px solid ${errors.consent ? "#C0392B" : "#E6DDCF"}`, borderRadius: 12, cursor: "pointer", background: "#FBFAF6" }}>
                <input type="checkbox" checked={consent} onChange={(e) => { setConsent(e.target.checked); setErrors((er) => ({ ...er, consent: undefined })); }} style={{ marginTop: 2, width: 17, height: 17, accentColor: "#CF4A2C" }} />
                <span style={{ font: "500 13.5px/1.5 'Hanken Grotesk'", color: "#3C3228" }}>I confirm the information provided is accurate and complete, and I agree to Nomadic Townies&apos; host terms and to be contacted about my application. <span style={{ color: "#CF4A2C" }}>*</span></span>
              </label>
            ) : null}

            {/* validation banner */}
            {showErr ? (
              <div style={{ marginTop: 20, display: "flex", gap: 10, alignItems: "center", background: "#FCF3F2", border: "1px solid #F0CFC9", borderRadius: 12, padding: "12px 16px", font: "600 13px/1.4 'Hanken Grotesk'", color: "#C0392B" }}>
                <WarnSvg />{errors._submit ? submitErrMsg(errors._submit) : "Please complete the highlighted fields before continuing."}
              </div>
            ) : null}
          </div>

          {/* nav bar */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: 12, alignItems: "center", marginTop: 36, paddingTop: 22, borderTop: "1px solid #E6DDCF" }}>
            <button type="button" onClick={back} className="po-ghost" style={{ visibility: step === 0 ? "hidden" : "visible", padding: "13px 22px", font: "700 14px/1 'Hanken Grotesk'", color: "#3C3228", background: "transparent", border: "1.5px solid #D8CFC0", borderRadius: 12, cursor: "pointer" }}>← Back</button>
            <button type="button" onClick={saveLater} className="po-ghost" style={{ padding: "13px 20px", font: "700 13.5px/1 'Hanken Grotesk'", color: "#726A5E", background: "transparent", border: "1.5px solid #E6DDCF", borderRadius: 12, cursor: "pointer" }}>Save &amp; finish later</button>
            <button type="button" onClick={next} disabled={submitting} className="po-cta" style={{ marginLeft: "auto", padding: "13px 30px", font: "700 14px/1 'Hanken Grotesk'", color: "#fff", background: "#CF4A2C", border: "none", borderRadius: 12, cursor: submitting ? "wait" : "pointer", opacity: submitting ? 0.7 : 1, boxShadow: "0 6px 16px rgba(207,74,44,.26)" }}>
              {submitting ? "Submitting…" : step === SECTIONS.length - 1 ? "Submit for review" : "Continue →"}
            </button>
          </div>
        </main>
      </div>
    </div>
  );
}

// ── Small presentational bits ─────────────────────────────────────────────
const LBL = { font: "600 12px/1.3 'Hanken Grotesk'", letterSpacing: ".05em", textTransform: "uppercase", color: "#726A5E" };
const INP = { width: "100%", padding: "12px 14px", fontSize: 14.5, fontFamily: "'Hanken Grotesk',sans-serif", color: "#221C17", background: "#FFFDF9", border: "1px solid #E6DDCF", borderRadius: 11 };

const LockSvg = () => (<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>);
const UploadSvg = () => (<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><path d="M17 8l-5-5-5 5" /><path d="M12 3v12" /></svg>);
const WarnSvg = () => (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="M12 8v4M12 16h.01" /></svg>);

function Centered({ children }) {
  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#EFE7DA", fontFamily: "'Hanken Grotesk',sans-serif", color: "#726A5E", font: "500 15px/1.5 'Hanken Grotesk'" }}><Fonts />{children}</div>
  );
}

function ErrorView({ kind }) {
  const map = {
    expired: { t: "This link has expired", d: "Your onboarding link is no longer valid. Contact our team and we'll send you a fresh one." },
    used: { t: "Profile already submitted", d: "This onboarding link has already been used. Our team is reviewing your profile — you'll hear from us soon." },
    not_approved: { t: "Not available yet", d: "This link isn't active. If you've just applied, please wait for your approval email." },
    invalid: { t: "Invalid link", d: "We couldn't find this onboarding link. Please use the exact link from your approval email." },
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
    { mark: "1", title: "We review your profile", desc: "Our team checks everything personally, usually within 2–3 working days." },
    { mark: "2", title: "We may reach out", desc: "For a quick intro call or any missing details." },
    { mark: "3", title: "You go live", desc: "Once approved, your dashboard unlocks and your profile appears on the site." },
  ];
  return (
    <div style={{ minHeight: "100vh", background: "#EFE7DA", fontFamily: "'Hanken Grotesk',sans-serif" }}>
      <Fonts />
      <style>{FORM_CSS}</style>
      <div style={{ maxWidth: 480, margin: "0 auto", padding: "6vh 22px", textAlign: "center" }}>
        <div className="po-check" style={{ width: 76, height: 76, margin: "0 auto", borderRadius: "50%", background: "#E0EFE4", display: "flex", alignItems: "center", justifyContent: "center" }}><svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#2E7D4F" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5" /></svg></div>
        <div style={{ marginTop: 16, display: "inline-flex", alignItems: "center", gap: 7, padding: "6px 14px", borderRadius: 99, background: "#FBF3E4", border: "1px solid #EBD9B4", font: "700 11px/1 'Hanken Grotesk'", letterSpacing: ".05em", textTransform: "uppercase", color: "#B07D2A" }}><span style={{ width: 7, height: 7, borderRadius: "50%", background: "#E0A93B" }} />Pending review</div>
        <h1 style={{ margin: "18px 0 0", fontFamily: "'Bricolage Grotesque',sans-serif", fontWeight: 700, fontSize: "clamp(26px,3.6vw,34px)", letterSpacing: "-.02em", color: "#221C17" }}>Profile submitted!</h1>
        <p style={{ margin: "12px 0 0", font: "400 15px/1.65 'Hanken Grotesk'", color: "#726A5E" }}>Thanks for completing your host profile. Our team now reviews every submission personally — you&apos;ll hear from us <strong style={{ color: "#3C3228" }}>within 2–3 working days</strong>. Your dashboard unlocks the moment you&apos;re approved.</p>
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
        <p style={{ margin: "18px 0 0", font: "400 12.5px/1.5 'Hanken Grotesk'", color: "#9A9080" }}>Follow <strong style={{ color: "#CF4A2C" }}>@nomadictownies</strong> while you wait. See you out there!</p>
      </div>
    </div>
  );
}

const FORM_CSS = `
  .po-shell { background:#EFE7DA; }
  .po-in::placeholder { color:#A89C8A; }
  .po-in:focus { border-color:#CF4A2C !important; box-shadow:0 0 0 4px rgba(207,74,44,.12); background:#FFFFFF; outline:none; }
  .po-err { border-color:#C0392B !important; background:#FCF3F2 !important; }
  .po-cta { transition:transform .18s ease, box-shadow .18s ease, background .18s ease; }
  .po-cta:hover { transform:translateY(-2px); box-shadow:0 12px 26px rgba(207,74,44,.3); background:#C0421F; }
  .po-ghost { transition:background .16s ease, border-color .16s ease; }
  .po-ghost:hover { background:#FBF6EE; border-color:#CF4A2C; }
  .po-chip input { position:absolute; opacity:0; pointer-events:none; }
  .po-chip span { display:inline-flex; align-items:center; padding:9px 16px; border-radius:99px; border:1.5px solid #E6DDCF; background:#FFFDF9; font:600 13px/1 'Hanken Grotesk'; color:#3C3228; cursor:pointer; transition:all .15s ease; }
  .po-chip span:hover { border-color:#CF4A2C; }
  .po-chip input:checked + span { background:#CF4A2C; border-color:#CF4A2C; color:#fff; }
  .po-tag { display:inline-flex; align-items:center; gap:6px; padding:6px 8px 6px 12px; border-radius:99px; background:#F6E4DC; border:1.5px solid #EBC9BC; font:600 12.5px/1 'Hanken Grotesk'; color:#A23A26; }
  .po-x { display:inline-flex; align-items:center; justify-content:center; width:16px; height:16px; border-radius:50%; background:rgba(162,58,38,.16); color:#A23A26; font-size:11px; line-height:1; cursor:pointer; border:none; }
  .po-x:hover { background:#A23A26; color:#fff; }
  .po-drop:hover { border-color:#CF4A2C; background:#FBF6EE; }
  .po-navitem:hover { background:rgba(233,98,47,.08); }
  .po-add:hover { background:#FBF6EE; border-color:#CF4A2C; color:#CF4A2C; }
  @keyframes poPop { 0%{transform:scale(.6);opacity:0;} 60%{transform:scale(1.08);} 100%{transform:scale(1);opacity:1;} }
  .po-check { animation:poPop .6s cubic-bezier(.22,.61,.36,1) both; }
  @keyframes poFade { from{opacity:0;transform:translateY(6px);} to{opacity:1;transform:none;} }
  .po-step { animation:poFade .32s ease both; }
  @keyframes poExpand { from{opacity:0;transform:translateY(-4px);} to{opacity:1;transform:none;} }
  .po-reveal { animation:poExpand .24s ease both; }
  @keyframes poDot { 0%,100%{opacity:.35;} 50%{opacity:1;} }
  .po-saving { animation:poDot 1s ease-in-out infinite; }
  @media (prefers-reduced-motion: reduce){ .po-check,.po-step,.po-reveal,.po-saving { animation:none; } }
  @media (max-width: 900px){ .po-shell { grid-template-columns:1fr !important; } .po-rail { position:static !important; height:auto !important; } }
`;
