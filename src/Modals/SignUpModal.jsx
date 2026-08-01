"use client";

/* eslint-disable react/prop-types */
import { useState, useEffect, useRef, useCallback } from "react";
import {
  useSendEmailOtpMutation,
  useVerifyEmailOtpMutation,
  usePhoneLoginMutation,
  useVerifySmsCodeMutation,
} from "../services/authApis";
import { useDispatch } from "react-redux";
import { setUserDbData } from "../slices";
import { useNavigate } from "react-router-dom";
import { baseUrl } from "../utils/api";
import Loading from "../SmallComponents/Loading";
import Toastify from "../SmallComponents/Tostify";

/* ─── brand tokens ─── */
const T = {
  rust: "#CF4A2C", rustDeep: "#b53c20", charcoal: "#2c2a28",
  ink: "#18181B", muted: "#7a5a48", line: "rgba(0,0,0,.12)",
};

const QUOTES = [
  "You don't have to be rich to travel well.",
  "The world is yours to explore.",
  "If not now, when?",
  "You need six months vacation twice a year.",
];

const S = {
  overlay: { position: "fixed", inset: 0, zIndex: 1300, background: "rgba(20,14,8,.45)", backdropFilter: "blur(6px)", WebkitBackdropFilter: "blur(6px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 },
  modal: { width: 820, maxWidth: "100%", display: "flex", overflow: "hidden", borderRadius: 28, background: "#FFFFFF", backdropFilter: "blur(32px) saturate(180%)", WebkitBackdropFilter: "blur(32px) saturate(180%)", border: "1px solid rgba(255,255,255,.52)", boxShadow: "0 40px 90px rgba(20,8,2,.38), 0 1px 0 rgba(255,255,255,.6) inset", position: "relative", maxHeight: "92vh" },
  closeBtn: { position: "absolute", top: 16, right: 16, width: 34, height: 34, borderRadius: "50%", background: "rgba(255,255,255,.3)", border: "1px solid rgba(255,255,255,.5)", display: "grid", placeItems: "center", cursor: "pointer", color: "rgba(30,20,10,.8)", zIndex: 10 },
  panel: { width: 340, flexShrink: 0, background: "#fff", borderRight: "1px solid rgba(210,75,42,.1)", display: "flex", flexDirection: "column", overflow: "hidden" },
  logo: { padding: "22px 24px 0", fontFamily: '"Fredoka", Inter, sans-serif', fontWeight: 700, fontSize: 20 },
  quotesArea: { flex: 1, display: "flex", flexDirection: "column", alignItems: "flex-start", justifyContent: "center", padding: "16px 28px 14px" },
  qMark: { fontFamily: "Georgia, serif", fontSize: 72, lineHeight: 0.78, color: T.rust, opacity: 0.9, userSelect: "none", marginBottom: 6 },
  qSlide: { position: "relative", minHeight: 108, width: "100%" },
  qText: (a) => ({ position: "absolute", inset: 0, fontFamily: "Georgia, serif", fontStyle: "italic", fontSize: 20, lineHeight: 1.5, color: T.ink, opacity: a ? 1 : 0, transform: a ? "translateY(0)" : "translateY(10px)", transition: "opacity .55s, transform .55s", pointerEvents: a ? "auto" : "none", display: "flex", alignItems: "center", margin: 0 }),
  dots: { display: "flex", gap: 8, marginTop: 18 },
  dot: (a) => ({ height: 6, width: a ? 22 : 6, borderRadius: 3, background: a ? T.rust : "rgba(210,75,42,.22)", transition: "width .35s, background .35s", cursor: "pointer", border: "none" }),
  subLabel: { padding: "0 28px 12px", fontSize: 11, fontWeight: 700, letterSpacing: ".16em", textTransform: "uppercase", color: "rgba(80,50,30,.4)" },
  form: { flex: 1, padding: "42px 42px 36px 32px", display: "flex", flexDirection: "column", justifyContent: "center", background: "#fff", overflowY: "auto" },
  h2: { fontSize: 30, fontWeight: 800, color: T.ink, letterSpacing: "-.025em", margin: "0 0 24px", fontFamily: "Inter, sans-serif" },
  toggle: { display: "flex", background: "#F4F4F5", border: "1px solid #F4F4F5", borderRadius: 999, padding: 4, marginBottom: 22 },
  togBtn: (a) => ({ flex: 1, border: "none", background: a ? "rgba(30,20,10,.88)" : "transparent", color: a ? "#fff" : "#7a4030", cursor: "pointer", fontFamily: "Inter, sans-serif", fontSize: 15, fontWeight: 600, padding: "10px 12px", borderRadius: 999, boxShadow: a ? "0 4px 12px rgba(0,0,0,.18)" : "none", transition: "all .2s" }),
  label: { display: "block", fontSize: 13.5, fontWeight: 700, color: "#3a2e22", marginBottom: 7, fontFamily: "Inter, sans-serif" },
  phoneRow: { display: "flex", gap: 10 },
  ccSel: { display: "flex", alignItems: "center", gap: 6, background: "#fff", border: `1.5px solid ${T.line}`, borderRadius: 14, padding: "0 14px", height: 50, fontFamily: "Inter, sans-serif", fontSize: 15, fontWeight: 600, color: T.ink, whiteSpace: "nowrap" },
  inp: { flex: 1, border: `1.5px solid ${T.line}`, borderRadius: 14, padding: "0 14px", height: 50, background: "#fff", fontFamily: "Inter, sans-serif", fontSize: 16, color: T.ink, outline: "none", width: "100%" },
  inpFocus: { borderColor: T.rust, boxShadow: "0 0 0 4px rgba(210,75,42,.1)" },
  cta: { width: "100%", height: 50, borderRadius: 999, background: `linear-gradient(135deg, #e05a35, ${T.rustDeep})`, color: "#fff", fontFamily: "Inter, sans-serif", fontSize: 16, fontWeight: 700, border: "none", cursor: "pointer", marginBottom: 16, boxShadow: "0 12px 26px -10px rgba(210,75,42,.6)" },
  orRow: { display: "flex", alignItems: "center", gap: 12, marginBottom: 14 },
  orHr: { flex: 1, border: "none", borderTop: "1px solid #ede6dc" },
  orSpan: { color: "#c0b4a8", fontSize: 13, fontWeight: 600 },
  googleBtn: { width: "100%", height: 48, background: "#fff", border: "1.5px solid rgba(210,75,42,.15)", borderRadius: 999, fontFamily: "Inter, sans-serif", fontSize: 15, fontWeight: 600, color: T.ink, display: "flex", alignItems: "center", justifyContent: "center", gap: 10, cursor: "pointer" },
  terms: { marginTop: 14, fontSize: 11.5, color: "#a09080", textAlign: "center", lineHeight: 1.55, fontFamily: "Inter, sans-serif" },
  termLink: { color: T.rust, textDecoration: "none" },
  backBtn: { display: "inline-flex", alignItems: "center", gap: 5, background: "none", border: "none", cursor: "pointer", fontFamily: "Inter, sans-serif", fontSize: 14, fontWeight: 600, color: "#9a7060", padding: 0, marginBottom: 20 },
  otpIcon: { width: 52, height: 52, borderRadius: 14, background: "rgba(210,75,42,.1)", display: "grid", placeItems: "center", marginBottom: 14 },
  otpBoxRow: { display: "flex", gap: 9, marginBottom: 20 },
  otpBox: (f) => ({ width: 48, height: 56, textAlign: "center", fontFamily: "Inter, sans-serif", fontSize: 24, fontWeight: 700, color: T.ink, border: `2px solid ${f ? "rgba(210,75,42,.4)" : T.line}`, borderRadius: 14, background: "#fff", outline: "none", caretColor: "transparent" }),
  resendRow: { marginTop: 14, fontSize: 13, color: "#9a7060", fontFamily: "Inter, sans-serif" },
  resendBtn: { background: "none", border: "none", cursor: "pointer", fontFamily: "Inter, sans-serif", fontSize: 13, fontWeight: 700, color: T.rust, padding: 0, textDecoration: "underline" },
  successWrap: { flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", padding: 32, background: "#fff" },
  successIcon: { width: 68, height: 68, borderRadius: "50%", background: "rgba(31,138,91,.1)", display: "grid", placeItems: "center", marginBottom: 16 },
};

const XIcon = () => <svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="M1 1l11 11M12 1L1 12" /></svg>;
const ChevLeft = () => <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4L6 9l5 5" /></svg>;
const ChevDown = () => <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="m2 4.5 4 4 4-4" /></svg>;
const CheckIcon = () => <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#1f8a5b" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m4.5 12.5 5 5 10-10" /></svg>;
const GoogleLogo = () => <svg width="19" height="19" viewBox="0 0 48 48"><path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9.1 3.2l6.8-6.8C35.8 2.4 30.2 0 24 0 14.6 0 6.6 5.4 2.7 13.4l7.9 6.1C12.4 13.3 17.7 9.5 24 9.5z" /><path fill="#4285F4" d="M46.5 24.6c0-1.7-.2-3.3-.5-4.9H24v9.3h12.7c-.6 3-2.3 5.5-4.8 7.2l7.6 5.9C43.8 37.9 46.5 31.7 46.5 24.6z" /><path fill="#FBBC05" d="M10.6 28.5a14.6 14.6 0 0 1 0-9.1L2.7 13.4A23.9 23.9 0 0 0 0 24c0 3.8.9 7.4 2.7 10.6l7.9-6.1z" /><path fill="#34A853" d="M24 48c6.2 0 11.4-2 15.2-5.4l-7.6-5.9c-2 1.4-4.7 2.2-7.6 2.2-6.3 0-11.6-3.8-13.4-9.4l-7.9 6.1C6.6 42.6 14.6 48 24 48z" /></svg>;

function MountainIllustration() {
  return (
    <svg viewBox="0 0 340 155" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMax slice" style={{ display: "block", width: "100%", height: "100%" }}>
      <defs>
        <linearGradient id="su-sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#ffecd6" /><stop offset="100%" stopColor="#ffd6a8" /></linearGradient>
        <linearGradient id="su-gr" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="rgba(100,180,60,0)" /><stop offset="100%" stopColor="rgba(80,150,40,.45)" /></linearGradient>
      </defs>
      <rect width="340" height="155" fill="url(#su-sky)" />
      <circle cx="270" cy="28" r="18" fill="#f5c842" opacity=".9" />
      <g fill="white" opacity=".75"><ellipse cx="52" cy="42" rx="24" ry="10" /><ellipse cx="36" cy="45" rx="16" ry="8" /><ellipse cx="66" cy="45" rx="17" ry="7" /></g>
      <polygon points="0,106 40,55 80,90 120,36 165,80 205,45 248,84 288,48 340,68 340,120 0,120" fill={T.rust} opacity=".78" />
      <polygon points="0,130 34,108 68,128 104,98 140,122 176,106 212,128 248,106 282,130 316,110 340,122 340,144 0,144" fill={T.charcoal} opacity=".85" />
      <rect x="0" y="142" width="340" height="13" fill="url(#su-gr)" />
      <path d="M20,155 Q75,143 140,144 Q195,140 255,134 Q295,130 325,134" stroke={T.rust} strokeWidth="1.8" fill="none" strokeDasharray="5,5" opacity=".65" />
      <g fill="rgba(44,42,40,.9)"><circle cx="170" cy="113" r="5" /><rect x="167" y="117" width="10" height="11" rx="2.5" fill={T.rust} opacity=".9" /><rect x="167" y="117" width="7" height="11" rx="2" /><line x1="168" y1="128" x2="164" y2="138" stroke="rgba(44,42,40,.9)" strokeWidth="2.5" strokeLinecap="round" /><line x1="172" y1="128" x2="175" y2="137" stroke="rgba(44,42,40,.9)" strokeWidth="2.5" strokeLinecap="round" /><line x1="167" y1="120" x2="160" y2="129" stroke="rgba(44,42,40,.9)" strokeWidth="2" strokeLinecap="round" /></g>
      <g fill="rgba(30,60,20,.65)"><polygon points="10,144 18,116 26,144" /><polygon points="8,130 18,108 28,130" /><polygon points="26,144 33,120 40,144" /><polygon points="300,144 310,112 320,144" /><polygon points="298,130 310,104 322,130" /><polygon points="320,144 328,120 336,144" /></g>
    </svg>
  );
}

function OTPBoxes({ otp, onChange, boxRefs }) {
  const handleInput = (idx, val) => {
    const v = val.replace(/\D/g, "");
    const next = [...otp]; next[idx] = v ? v[0] : ""; onChange(next);
    if (v && idx < 5) boxRefs.current[idx + 1]?.focus();
  };
  const handleKeyDown = (idx, e) => {
    if (e.key === "Backspace" && !otp[idx] && idx > 0) { boxRefs.current[idx - 1]?.focus(); const next = [...otp]; next[idx - 1] = ""; onChange(next); }
    if (e.key === "ArrowLeft" && idx > 0) boxRefs.current[idx - 1]?.focus();
    if (e.key === "ArrowRight" && idx < 5) boxRefs.current[idx + 1]?.focus();
  };
  const handlePaste = (e) => {
    e.preventDefault();
    const p = (e.clipboardData || window.clipboardData).getData("text").replace(/\D/g, "").slice(0, 6);
    const next = ["", "", "", "", "", ""]; [...p].forEach((c, i) => { next[i] = c; }); onChange(next);
    boxRefs.current[Math.min(p.length, 5)]?.focus();
  };
  return (
    <div style={S.otpBoxRow}>
      {otp.map((v, i) => (
        <input key={i} ref={(el) => { boxRefs.current[i] = el; }} style={S.otpBox(!!v)} maxLength={1} inputMode="numeric" value={v}
          onChange={(e) => handleInput(i, e.target.value)} onKeyDown={(e) => handleKeyDown(i, e)} onPaste={i === 0 ? handlePaste : undefined} />
      ))}
    </div>
  );
}

export default function SignUpModal({ opens, setOpens }) {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [sendEmailOtp] = useSendEmailOtpMutation();
  const [verifyEmailOtp] = useVerifyEmailOtpMutation();
  const [phoneLogin] = usePhoneLoginMutation();
  const [verifySmsCode] = useVerifySmsCodeMutation();

  const [step, setStep] = useState("login");
  const [tab, setTab] = useState("email");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [qIdx, setQIdx] = useState(0);
  const [timer, setTimer] = useState(300);
  const [timerOn, setTimerOn] = useState(false);
  const [focusedInp, setFocusedInp] = useState(null);
  const [loading, setLoading] = useState(false);
  const [alertState, setAlertState] = useState({ open: false, message: "", severity: undefined });

  const boxRefs = useRef([]);
  const timerRef = useRef(null);

  const showToast = (msg, type) => setAlertState({ open: true, message: msg, severity: type });

  const handleClose = () => {
    setOpens(false);
    setStep("login"); setOtp(["", "", "", "", "", ""]); setEmail(""); setPhone(""); setTab("email");
  };

  useEffect(() => {
    const id = setInterval(() => setQIdx((i) => (i + 1) % QUOTES.length), 3800);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (timerOn && timer > 0) timerRef.current = setTimeout(() => setTimer((t) => t - 1), 1000);
    else if (timer === 0) setTimerOn(false);
    return () => clearTimeout(timerRef.current);
  }, [timer, timerOn]);

  const otpFull = otp.every((v) => v);
  const timerFmt = `${Math.floor(timer / 60)}:${String(timer % 60).padStart(2, "0")}`;
  const fullPhone = phone ? `91${phone}` : "";
  const contactDisplay = email || "your email";

  const handleAfterAuth = (token, user, isNewUser) => {
    localStorage.setItem("token", token);
    dispatch(setUserDbData(user));
    // Redirect to complete-profile whenever the profile is incomplete:
    // new users, missing name, missing phone, or missing email.
    const profileIncomplete =
      isNewUser || !user?.name || !user?.phone || !user?.email;
    if (profileIncomplete) {
      setOpens(false); navigate("/complete-profile");
    } else {
      setStep("success");
      setTimeout(() => { setOpens(false); navigate("/"); }, 2000);
    }
  };

  const handleContinue = useCallback(async () => {
    if (!email) return showToast("Please enter your email", "error");
    try {
      setLoading(true);
      const res = await sendEmailOtp({ email }).unwrap();
      showToast(res.message || "OTP sent", "success");
      setStep("otp"); setTimer(300); setTimerOn(true); setOtp(["", "", "", "", "", ""]);
      setTimeout(() => boxRefs.current[0]?.focus(), 100);
    } catch (err) {
      showToast(err?.data?.message || "Failed to send OTP", "error");
    } finally { setLoading(false); }
  }, [email, sendEmailOtp]);

  const handleVerify = useCallback(async () => {
    const code = otp.join("");
    if (code.length < 6) return showToast("Enter 6-digit OTP", "error");
    try {
      setLoading(true);
      const res = await verifyEmailOtp({ email, otp: code }).unwrap();
      handleAfterAuth(res.token, res.user, res.isNewUser);
    } catch (err) {
      showToast(err?.data?.message || "Invalid OTP", "error");
      setOtp(["", "", "", "", "", ""]); boxRefs.current[0]?.focus();
    } finally { setLoading(false); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [otp, email, verifyEmailOtp, dispatch, navigate]);

  const handleGoogleLogin = () => { window.location.href = baseUrl + "/auth/auth/google"; };
  const handleResend = () => handleContinue();

  if (!opens) return null;

  return (
    <>
      <Loading isLoading={loading} />
      <Toastify setAlertState={setAlertState} alertState={alertState} />
      <div style={S.overlay} onClick={(e) => e.target === e.currentTarget && handleClose()}>
        <div style={S.modal}>
          <button style={S.closeBtn} onClick={handleClose} aria-label="Close"><XIcon /></button>

          <div style={S.panel} className="su-left-panel">
            <div style={S.logo}>
              <span style={{ color: T.rust }}>nomadic</span>
              <span style={{ color: T.charcoal, marginLeft: 5 }}>Townies</span>
            </div>
            <div style={S.quotesArea}>
              <div style={S.qMark}>&ldquo;</div>
              <div style={S.qSlide}>{QUOTES.map((q, i) => <p key={i} style={S.qText(i === qIdx)}>{q}</p>)}</div>
              <div style={S.dots}>{QUOTES.map((_, i) => <button key={i} style={S.dot(i === qIdx)} onClick={() => setQIdx(i)} aria-label={`Quote ${i + 1}`} />)}</div>
            </div>
            <div style={S.subLabel}>Travel differently</div>
            <div style={{ height: 155, flexShrink: 0 }}><MountainIllustration /></div>
          </div>

          {step === "login" && (
            <div style={S.form}>
              <h2 style={S.h2}>Login</h2>
              <div style={{ marginBottom: 18 }}>
                <label style={S.label}>Email</label>
                <input style={{ ...S.inp, ...(focusedInp === "email" ? S.inpFocus : {}) }} type="email" value={email} placeholder="you@email.com"
                  onChange={(e) => setEmail(e.target.value)} onFocus={() => setFocusedInp("email")} onBlur={() => setFocusedInp(null)} />
              </div>
              <button style={S.cta} onClick={handleContinue}>Continue</button>
              <div style={S.orRow}><hr style={S.orHr} /><span style={S.orSpan}>Or</span><hr style={S.orHr} /></div>
              <button style={S.googleBtn} onClick={handleGoogleLogin}><GoogleLogo /> Continue with Google</button>
              <p style={S.terms}>By continuing you agree to our <a href="/terms-and-conditions" style={S.termLink}>Terms</a> and <a href="/privacy-policy" style={S.termLink}>Privacy Policy</a>.</p>
            </div>
          )}

          {step === "otp" && (
            <div style={S.form}>
              <button style={S.backBtn} onClick={() => setStep("login")}><ChevLeft /> Back</button>
              <div style={S.otpIcon}><svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke={T.rust} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="5" y="2" width="14" height="20" rx="3" /><path d="M9 18h6" /></svg></div>
              <h2 style={S.h2}>Verify email</h2>
              <p style={{ fontSize: 14, color: T.muted, lineHeight: 1.55, margin: "6px 0 22px", fontFamily: "Inter, sans-serif" }}>We sent a 6-digit code to <b>{email}</b>.</p>
              <OTPBoxes otp={otp} onChange={setOtp} boxRefs={boxRefs} />
              <button style={{ ...S.cta, opacity: otpFull ? 1 : 0.45, pointerEvents: otpFull ? "auto" : "none" }} onClick={handleVerify}>Verify &amp; Login</button>
              <div style={S.resendRow}>{timerOn ? <span>Resend code in <b>{timerFmt}</b></span> : <button style={S.resendBtn} onClick={handleResend}>Resend code</button>}</div>
            </div>
          )}

          {step === "success" && (
            <div style={S.successWrap}>
              <div style={S.successIcon}><CheckIcon /></div>
              <h2 style={{ ...S.h2, margin: "0 0 10px" }}>You&apos;re in!</h2>
              <p style={{ fontSize: 15, color: T.muted, lineHeight: 1.55, marginBottom: 24, fontFamily: "Inter, sans-serif" }}>Welcome to Nomadic Townies.<br />Let&apos;s find your next adventure.</p>
            </div>
          )}
        </div>
      </div>
      <style>{`.su-left-panel{display:flex}@media(max-width:768px){.su-left-panel{display:none !important}}`}</style>
    </>
  );
}
