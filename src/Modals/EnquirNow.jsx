"use client";

/* eslint-disable react/prop-types */
import { useCallback, useState } from "react";
import Modal from "@mui/material/Modal";
import { useSelector } from "react-redux";
import { useEnquirMutation } from "../services/EnquirApi";
import { logo } from "../Images";
import "./enquiryModal.css";

export default function EnquirNow({ opene, setOpene }) {
  const { userDbData } = useSelector((store) => store.global);
  const [enquir, { isLoading }] = useEnquirMutation();

  const [form, setForm] = useState({ name: "", email: "", phone: "", message: "" });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const onChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleClose = () => {
    setOpene(false);
    // reset shortly after close so the closing animation isn't janky
    setTimeout(() => { setSuccess(false); setError(""); }, 200);
  };

  const handleSubmit = useCallback(
    async (e) => {
      e?.preventDefault?.();
      setError("");
      if (!form.name.trim() || (!form.phone.trim() && !form.email.trim())) {
        setError("Please add your name and a phone number or email.");
        return;
      }
      try {
        await enquir({
          Name: form.name.trim(),
          Phone: form.phone.trim() ? `+91 ${form.phone.trim()}` : "",
          Email: form.email.trim(),
          Message: form.message.trim(),
          userId: userDbData?._id,
        }).unwrap();
        setSuccess(true);
        setForm({ name: "", email: "", phone: "", message: "" });
      } catch (err) {
        setError(err?.data?.message || "Something went wrong. Please try again.");
      }
    },
    [enquir, form, userDbData?._id]
  );

  return (
    <Modal open={!!opene} onClose={handleClose} slotProps={{ backdrop: { sx: { background: "transparent" } } }}>
      <div className="enq-root">
        <div className="modal">
          <button className="close-btn" onClick={handleClose} aria-label="Close">
            <svg width="15" height="15" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="M1 1l12 12M13 1L1 13" /></svg>
          </button>

          {/* LEFT — illustration */}
          <div className="l-panel">
            <div className="l-brand"><img src={logo} alt="Nomadic Townies" /></div>
            <div className="l-illus-wrap">
              <svg width="280" height="220" viewBox="0 0 280 220" xmlns="http://www.w3.org/2000/svg" fill="none" aria-hidden="true">
                <defs>
                  <linearGradient id="enqPathGrad" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#C8462A" stopOpacity=".2" />
                    <stop offset="50%" stopColor="#C8462A" stopOpacity=".8" />
                    <stop offset="100%" stopColor="#C8462A" />
                  </linearGradient>
                </defs>
                <line x1="20" y1="180" x2="260" y2="180" stroke="#e8dfd2" strokeWidth="1" strokeDasharray="2 4" />
                <path d="M40 180 L75 145 L110 175 L150 130 L195 168 L235 140 L260 180" stroke="#d4c4b0" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
                <g stroke="#cdbfa8" strokeWidth="1.2" strokeLinecap="round" fill="none">
                  <path d="M30 55 Q35 48 44 50 Q48 42 56 46 Q62 42 65 50" />
                  <path d="M210 38 Q215 30 224 32 Q228 24 236 28 Q242 24 245 32" />
                  <path d="M195 95 Q199 90 206 91 Q210 86 215 90" />
                </g>
                <circle cx="225" cy="62" r="14" stroke="#e9c9a5" strokeWidth="1.2" fill="#fff8ed" />
                <path d="M75 130 Q120 60 175 110 Q210 140 215 165" stroke="url(#enqPathGrad)" strokeWidth="1.6" strokeDasharray="3 4" strokeLinecap="round" fill="none" />
                <g transform="translate(60,116) rotate(-22)">
                  <path d="M0 0 L42 8 L0 16 L12 8 Z" fill="#fff" stroke="#1a1208" strokeWidth="1.6" strokeLinejoin="round" />
                  <path d="M0 0 L12 8 L0 16" stroke="#1a1208" strokeWidth="1.2" fill="none" />
                  <path d="M12 8 L42 8" stroke="#1a1208" strokeWidth="1" opacity=".35" />
                </g>
                <g stroke="#C8462A" strokeWidth="1.4" strokeLinecap="round" opacity=".7">
                  <line x1="42" y1="120" x2="32" y2="118" />
                  <line x1="46" y1="128" x2="36" y2="128" />
                  <line x1="50" y1="136" x2="40" y2="138" />
                </g>
                <g transform="translate(215,165)">
                  <circle r="14" stroke="#C8462A" strokeWidth="1" opacity=".25" />
                  <circle r="9" stroke="#C8462A" strokeWidth="1" opacity=".4" />
                  <path d="M0 -10 C5 -10 8 -6 8 -2 C8 4 0 12 0 12 C0 12 -8 4 -8 -2 C-8 -6 -5 -10 0 -10 Z" fill="#C8462A" stroke="#1a1208" strokeWidth="1.4" strokeLinejoin="round" />
                  <circle r="2.5" fill="#fff" cy="-3" />
                </g>
                <g fill="#C8462A" opacity=".5">
                  <circle cx="100" cy="35" r="1.2" />
                  <circle cx="165" cy="22" r="1" />
                  <circle cx="145" cy="50" r="1.4" />
                </g>
                <g transform="translate(20,156)" stroke="#1a1208" strokeWidth="1.4" strokeLinejoin="round" fill="#fff">
                  <rect width="32" height="20" rx="1.5" />
                  <path d="M0 0 L16 12 L32 0" fill="none" />
                  <rect x="24" y="3" width="5" height="5" fill="#C8462A" stroke="none" />
                </g>
              </svg>
            </div>
            <div className="l-caption">
              <h3>One quick <em>note</em>,<br />and we&apos;re on it.</h3>
              <p>Share where you&apos;d like to go — our team replies within a few hours with handpicked options.</p>
            </div>
          </div>

          {/* RIGHT — form / success */}
          {success ? (
            <div className="success-panel">
              <div className="success-icon">
                <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5" /></svg>
              </div>
              <h2>Enquiry sent.</h2>
              <p>Thanks — your message is on its way. Expect a reply from our team within the next few hours.</p>
              <button className="submit-btn" style={{ width: "auto", padding: "0 28px" }} onClick={handleClose}>Continue browsing</button>
            </div>
          ) : (
            <form className="r-form" onSubmit={handleSubmit}>
              <div className="r-head">
                <div className="r-eyebrow">Plan your trip</div>
                <h2>Send us an enquiry.</h2>
                <p>Tell us a little about your trip. We&apos;ll handle the rest.</p>
              </div>

              <div className="field">
                <label htmlFor="enq-name">Your name</label>
                <input className="inp" type="text" id="enq-name" name="name" value={form.name} onChange={onChange} placeholder="Jane Doe" autoComplete="name" />
              </div>

              <div className="f-grid">
                <div className="field">
                  <label htmlFor="enq-email">Email</label>
                  <input className="inp" type="email" id="enq-email" name="email" value={form.email} onChange={onChange} placeholder="you@email.com" autoComplete="email" />
                </div>
                <div className="field">
                  <label htmlFor="enq-phone">Phone</label>
                  <div className="ph-row">
                    <span className="cc">+91</span>
                    <input className="inp" type="tel" inputMode="numeric" id="enq-phone" name="phone" value={form.phone} onChange={onChange} placeholder="98765 43210" />
                  </div>
                </div>
              </div>

              <div className="field">
                <label htmlFor="enq-msg">What are you dreaming of?</label>
                <textarea className="inp" id="enq-msg" name="message" value={form.message} onChange={onChange} placeholder="Spiti in July, or maybe a yoga retreat in Goa..." />
              </div>

              {error ? <p className="err-msg">{error}</p> : null}

              <button className="submit-btn" type="submit" disabled={isLoading}>
                {isLoading ? "Sending..." : "Send enquiry"}
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
              </button>
              <p className="fineprint">We typically reply within 4 hours.</p>
            </form>
          )}
        </div>
      </div>
    </Modal>
  );
}
