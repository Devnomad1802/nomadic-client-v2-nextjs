"use client";

/* eslint-disable react/prop-types */
import { useState } from "react";
import { Helmet } from "react-helmet-async";
import "./contactPage.css";
import Footer from "../Component/Footer";
import { useEnquirMutation } from "../services/EnquirApi";

// Re-exported for shared MUI inputs (ForgetPassword, ResetPassword, MyAccount, CompleteProfile)
export const inputStyle = {
  "& input::-webkit-outer-spin-button,\n input::-webkit-inner-spin-button": {
    WebkitAppearance: "none",
    margin: "0",
  },
  width: "100%",
  "& .css-hfutr2-MuiSvgIcon-root-MuiSelect-icon": { color: "#000" },
  "& .css-bpeome-MuiSvgIcon-root-MuiSelect-icon": { color: "#000" },
  "& .MuiOutlinedInput-root": {
    background: "#fff",
    "& fieldset": { border: "1px solid #E7E7E7" },
    "&:hover fieldset": { border: "1px solid #E7E7E7" },
    "&.Mui-focused fieldset": { border: "1px solid #E7E7E7" },
    "& .MuiInputBase-input::placeholder": { color: "#253A47" },
    color: "#000",
    height: "45px",
    borderRadius: "8px",
    fontFamily: "Inter",
    textAlign: "left",
  },
};

// Fallback hero image (used until a Contact banner is set in admin → coverImages.contactUS)
const HERO_FALLBACK = "https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1600&q=70";

const CHIPS = ["General enquiry", "Trip booking", "Group / custom trip", "Become a host"];

const FAQS = [
  { q: "How soon will I get a reply?", a: "We usually reply within a few hours during office hours (Mon–Sat, 10am–7pm IST). For anything urgent, WhatsApp is the fastest way to reach us." },
  { q: "Can you plan a custom or group trip?", a: "Absolutely — custom and group trips are our specialty. Pick \"Group / custom\" in the form above, tell us your dates, group size, and rough idea, and we'll build something around you." },
  { q: "I want to host a trip. How do I start?", a: "We're always looking for great hosts and organisers. Choose \"Become a host\" above and share what you'd like to run — we'll walk you through the rest." },
  { q: "Do you have a phone number I can call?", a: "Yes — call or WhatsApp us at +91 86239 29751 during office hours. If we miss you, drop a message and we'll call you back." },
];

const ContactUs = ({ contactbg }) => {
  const [enquir, { isLoading }] = useEnquirMutation();
  const [chip, setChip] = useState(CHIPS[0]);
  const [form, setForm] = useState({ Name: "", Phone: "", Email: "", Message: "" });
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const update = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await enquir({
        Name: form.Name,
        Phone: form.Phone,
        Email: form.Email,
        // Prepend the enquiry-type as context (no new backend field)
        Message: `[${chip}] ${form.Message}`,
      }).unwrap();
      setSent(true);
    } catch {
      setError("Something went wrong. Please try again or WhatsApp us.");
    }
  };

  const resetForm = () => {
    setSent(false);
    setForm({ Name: "", Phone: "", Email: "", Message: "" });
    setChip(CHIPS[0]);
  };

  return (
    <div className="ctpg">
      <Helmet>
        <title>Contact Us | Nomadic Townies</title>
        <meta name="description" content="Contact Nomadic Townies for custom trip planning, host or experience enquiries, or travel support. Reach us via phone, email or the enquiry form." />
        <link rel="canonical" href="https://nomadictownies.com/contact-us" />
      </Helmet>

      {/* HERO */}
      <section className="hero">
        <img src={contactbg || HERO_FALLBACK} alt="Traveller looking out over a mountain landscape" />
        <div className="hero-inner">
          <div className="wrap">
            <div className="hero-eyebrow">We&apos;re here to help</div>
            <h1>Let&apos;s plan something worth remembering</h1>
            <p className="sub">Questions about a trip, a custom group itinerary, or just want to say hello? Our team usually replies within a few hours.</p>
            <div className="hero-quick">
              <a href="https://wa.me/918623929751" className="wa" target="_blank" rel="noopener">
                <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor"><path d="M17.5 14.4c-.3-.1-1.7-.8-2-1-.3-.1-.5-.1-.6.1-.2.3-.7.8-.8 1-.2.2-.3.2-.5.1-.3-.1-1.2-.5-2.3-1.4-.8-.7-1.4-1.6-1.6-1.9-.2-.3 0-.4.1-.6.1-.1.3-.3.4-.5.1-.2.2-.3.3-.5.1-.2 0-.4 0-.5 0-.1-.6-1.4-.8-2-.2-.5-.4-.4-.6-.4h-.5c-.2 0-.4.1-.6.3-.2.2-.8.8-.8 2s.8 2.3.9 2.5c.1.2 1.7 2.5 4 3.5.6.2 1 .4 1.4.5.6.2 1.1.2 1.5.1.5-.1 1.4-.6 1.6-1.1.2-.5.2-1 .1-1.1 0-.1-.2-.2-.4-.3zM12 2C6.5 2 2 6.5 2 12c0 1.7.4 3.4 1.3 4.9L2 22l5.2-1.4c1.4.8 3 1.2 4.7 1.2 5.5 0 10-4.5 10-10S17.5 2 12 2z" /></svg>
                Chat on WhatsApp
              </a>
              <a href="tel:+918623929751" className="call">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.9.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92Z" /></svg>
                Call us
              </a>
            </div>
          </div>
        </div>
      </section>

      <div className="wrap">
        <div className="main">
          {/* LEFT: info */}
          <div>
            <div className="info-eyebrow">Get in touch</div>
            <h2 className="info-title">Have a question? We&apos;d love to hear from you.</h2>
            <p className="info-lead">Whether you&apos;re dreaming up a trip, organising a group, or hosting your own experience — reach out and a real person will get back to you.</p>

            <div className="info-cards">
              <div className="info-card">
                <div className="info-ic"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="16" rx="3" /><path d="m2 7 10 6 10-6" /></svg></div>
                <div className="ic-body">
                  <h4>Email us</h4>
                  <p><a href="mailto:hello@nomadictownies.com">hello@nomadictownies.com</a></p>
                  <span className="tag"><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M20 6 9 17l-5-5" /></svg>Replies within a few hours</span>
                </div>
              </div>
              <div className="info-card">
                <div className="info-ic"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.9.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92Z" /></svg></div>
                <div className="ic-body">
                  <h4>Call or WhatsApp</h4>
                  <p><a href="tel:+918623929751">+91 86239 29751</a></p>
                  <span className="tag"><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></svg>Mon–Sat, 10am–7pm IST</span>
                </div>
              </div>
              <div className="info-card">
                <div className="info-ic"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 21s7-5.6 7-11a7 7 0 1 0-14 0c0 5.4 7 11 7 11Z" /><circle cx="12" cy="10" r="2.6" /></svg></div>
                <div className="ic-body">
                  <h4>Visit us</h4>
                  <p>Nanded City, Pune, Maharashtra, India</p>
                </div>
              </div>
            </div>

            <div className="social-row">
              <span className="lbl">Follow along</span>
              <a href="https://instagram.com" className="social-btn" title="Instagram" target="_blank" rel="noopener"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="2" y="2" width="20" height="20" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" /></svg></a>
              <a href="https://facebook.com" className="social-btn" title="Facebook" target="_blank" rel="noopener"><svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M14 9h3V6h-3c-1.7 0-3 1.3-3 3v2H9v3h2v7h3v-7h2.5l.5-3H14V9.5c0-.3.2-.5.5-.5H14Z" /></svg></a>
            </div>
          </div>

          {/* RIGHT: form */}
          <div className="form-card">
            {!sent ? (
              <div>
                <div className="form-head">
                  <h3>Send us a message</h3>
                  <p>Fill in the form and we&apos;ll get back to you shortly.</p>
                </div>
                <form onSubmit={handleSubmit}>
                  <div className="field">
                    <label>What&apos;s this about?</label>
                    <div className="chips">
                      {CHIPS.map((c) => (
                        <span key={c} className={`chip${chip === c ? " on" : ""}`} onClick={() => setChip(c)}>
                          {c === "General enquiry" ? "General" : c === "Group / custom trip" ? "Group / custom" : c}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="field">
                    <label>Name <span className="req">*</span></label>
                    <input className="inp" type="text" placeholder="Your full name" required value={form.Name} onChange={update("Name")} />
                  </div>
                  <div className="field">
                    <label>Mobile <span className="req">*</span></label>
                    <div className="phone-row">
                      <div className="cc-sel">+91</div>
                      <input className="inp" type="tel" inputMode="numeric" placeholder="98765 43210" style={{ flex: 1 }} required value={form.Phone} onChange={update("Phone")} />
                    </div>
                  </div>
                  <div className="field">
                    <label>Email <span className="req">*</span></label>
                    <input className="inp" type="email" placeholder="you@email.com" required value={form.Email} onChange={update("Email")} />
                  </div>
                  <div className="field">
                    <label>Message <span className="req">*</span></label>
                    <textarea className="inp" placeholder="Tell us where you want to go, when, and how many of you…" required value={form.Message} onChange={update("Message")} />
                  </div>
                  <button type="submit" className="submit-btn" disabled={isLoading}>
                    {isLoading ? "Sending…" : "Send message"}
                    {!isLoading && <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="m22 2-7 20-4-9-9-4Z" /><path d="M22 2 11 13" /></svg>}
                  </button>
                  {error && <p className="form-note" style={{ color: "#CD482A" }}>{error}</p>}
                  <p className="form-note">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"><path d="M20 6 9 17l-5-5" /></svg>
                    We never share your details. No spam, ever.
                  </p>
                </form>
              </div>
            ) : (
              <div className="form-success">
                <div className="success-ic"><svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="#11875b" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m4.5 12.5 5 5 10-10" /></svg></div>
                <h3>Message sent! 🎉</h3>
                <p>Thanks for reaching out. Our team will get back to you within a few hours.</p>
                <button className="submit-btn" style={{ width: "auto", padding: "0 28px" }} onClick={resetForm}>Send another</button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* MAP */}
      <section className="map-section">
        <div className="wrap">
          <div className="map-head">
            <div className="kicker">Find us</div>
            <h2>Come say hello</h2>
          </div>
          <div className="map-wrap">
            <div className="map-frame">
              <iframe src="https://www.openstreetmap.org/export/embed.html?bbox=73.79%2C18.45%2C73.84%2C18.49&layer=mapnik&marker=18.4682%2C73.8156" loading="lazy" title="Nomadic Townies location map — Nanded City, Pune" />
            </div>
            <div className="office-card">
              <h3>Nomadic Townies HQ</h3>
              <div className="office-row">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 21s7-5.6 7-11a7 7 0 1 0-14 0c0 5.4 7 11 7 11Z" /><circle cx="12" cy="10" r="2.6" /></svg>
                <div className="or-body"><b>Address</b>Nanded City, Pune,<br />Maharashtra 411041, India</div>
              </div>
              <div className="office-row">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="16" rx="3" /><path d="m2 7 10 6 10-6" /></svg>
                <div className="or-body"><b>Email</b><a href="mailto:hello@nomadictownies.com" style={{ color: "var(--orange)" }}>hello@nomadictownies.com</a></div>
              </div>
              <div className="office-hours">
                <b>Office hours</b><br />
                Monday – Saturday · 10:00am – 7:00pm IST<br />
                Sunday · Closed
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="faq-section">
        <div className="wrap">
          <div className="faq-head">
            <div className="kicker">Before you ask</div>
            <h2>Frequently asked questions</h2>
          </div>
          <div className="faq-list">
            {FAQS.map((f, i) => (
              <details className="faq-item" key={i} open={i === 0}>
                <summary>{f.q}<span className="q-ic"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"><path d="M12 5v14M5 12h14" /></svg></span></summary>
                <div className="faq-a">{f.a}</div>
              </details>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default ContactUs;
