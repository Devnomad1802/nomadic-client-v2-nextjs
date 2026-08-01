"use client";

/* eslint-disable react/prop-types */
import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import "./termsAndConditions.css"; // shared legal-page styles (tc-*)
import Footer from "../Component/Footer";

/* Privacy content — exact text from the approved Privacy Policy design.
   Do not rewrite or summarize. */
const SECTIONS = [
  { title: "Information We Collect", blocks: [
    { kind: "p", text: "We may collect:" },
    { kind: "list", items: ["Name", "Email address", "Phone number", "City/location", "Travel preferences", "Booking details", "Payment-related information", "Identity or verification details where required", "Host profile information", "Social media links submitted by hosts", "Reviews, messages, inquiries, and uploaded content", "Device, browser, IP address, and usage information"] },
  ]},
  { title: "How We Use Your Information", blocks: [
    { kind: "p", text: "We use your information to:" },
    { kind: "list", items: ["Process inquiries and bookings", "Confirm availability", "Coordinate with hosts and service providers", "Process payments and refunds", "Send booking updates", "Provide customer support", "Verify hosts", "Improve website experience", "Prevent fraud or misuse", "Send marketing communications where permitted", "Comply with legal, tax, regulatory, and accounting obligations"] },
  ]},
  { title: "Sharing With Hosts & Partners", blocks: [
    { kind: "p", text: "For confirmed or potential bookings, we may share necessary information with:" },
    { kind: "list", items: ["Hosts", "Local operators", "Accommodation providers", "Transport providers", "Activity partners", "Payment processors", "Technology service providers"] },
    { kind: "callout", text: "Only information required to deliver the experience or process the booking will be shared." },
  ]},
  { title: "Payment Information", blocks: [
    { kind: "p", text: "Payments may be processed by third-party payment gateways." },
    { kind: "callout", text: "Nomadic Townies does not store complete card numbers, CVV, UPI PIN, or net banking passwords." },
    { kind: "p", text: "Payment processors handle payment data according to their own security and compliance standards." },
  ]},
  { title: "Host Information", blocks: [
    { kind: "p", text: "If you apply as a host, we may collect profile details, experience details, business information, social proof, identity information, payout details, and verification documents." },
    { kind: "p", text: "This information may be used for host verification, profile creation, experience approval, payout processing, and platform trust." },
  ]},
  { title: "Cookies & Tracking", blocks: [
    { kind: "p", text: "We may use cookies, analytics tools, pixels, or similar technologies to:" },
    { kind: "list", items: ["Improve website performance", "Understand visitor behavior", "Measure marketing performance", "Personalize user experience", "Track campaigns and conversions"] },
    { kind: "p", text: "You may disable cookies through browser settings, but some features may not work properly." },
  ]},
  { title: "Marketing Communication", blocks: [
    { kind: "p", text: "We may contact you through email, phone, SMS, WhatsApp, or other channels for:" },
    { kind: "list", items: ["Booking updates", "Inquiry follow-ups", "Experience recommendations", "Offers", "Host onboarding", "Important platform updates"] },
    { kind: "p", text: "You may opt out of promotional communication where applicable." },
  ]},
  { title: "Data Security", blocks: [
    { kind: "p", text: "We take reasonable technical and organizational steps to protect your information." },
    { kind: "callout", text: "However, no online system is completely secure. Users are responsible for keeping login credentials confidential." },
  ]},
  { title: "Data Retention", blocks: [
    { kind: "p", text: "We retain information as long as needed for:" },
    { kind: "list", items: ["Booking records", "Legal compliance", "Tax/accounting requirements", "Dispute resolution", "Fraud prevention", "Business operations"] },
    { kind: "p", text: "When no longer required, data may be deleted, anonymized, or archived securely." },
  ]},
  { title: "Your Rights", blocks: [
    { kind: "p", text: "Subject to applicable law, you may request:" },
    { kind: "list", items: ["Access to your personal data", "Correction of inaccurate data", "Withdrawal of consent where applicable", "Deletion of certain data", "Information about how your data is used"] },
    { kind: "p", text: "Requests can be submitted through Nomadic Townies support channels." },
  ]},
  { title: "Children’s Privacy", blocks: [
    { kind: "p", text: "Our booking services are intended for adults." },
    { kind: "p", text: "Minors may participate only with parent or guardian consent." },
    { kind: "callout", text: "We do not knowingly collect personal data from minors without appropriate consent." },
  ]},
  { title: "Third-Party Links", blocks: [
    { kind: "p", text: "Our website may contain links to third-party websites, social media pages, host pages, or partner platforms." },
    { kind: "p", text: "Nomadic Townies is not responsible for their privacy practices." },
  ]},
  { title: "Updates To This Policy", blocks: [
    { kind: "p", text: "We may update this Privacy Policy from time to time." },
    { kind: "p", text: "Continued use of our website or services means acceptance of the updated policy." },
  ]},
  { title: "Contact", blocks: [
    { kind: "p", text: "For privacy-related questions, contact Nomadic Townies through the official website or support email." },
  ]},
];

const IcSearch = ({ s = 15 }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="7" /><path d="m21 21-4.3-4.3" /></svg>
);
const IcInfo = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#CF4A2C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9" /><path d="M12 8h.01M11 12h1v4h1" /></svg>
);

const escapeHtml = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const highlight = (text, q) => {
  const safe = escapeHtml(text);
  if (!q) return safe;
  const re = new RegExp("(" + q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + ")", "ig");
  return safe.replace(re, "<mark>$1</mark>");
};
const matches = (sec, q) => {
  if (!q) return true;
  const hay = (sec.title + " " + sec.blocks.map((b) => b.text || (b.items || []).join(" ")).join(" ")).toLowerCase();
  return hay.indexOf(q.toLowerCase()) >= 0;
};

const Html = ({ html }) => <span dangerouslySetInnerHTML={{ __html: html }} />;

const PrivacyPolicy = () => {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(1);
  const [showTop, setShowTop] = useState(false);
  const bodyRef = useRef(null);

  useEffect(() => { window.scrollTo(0, 0); }, []);

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY || document.documentElement.scrollTop;
      setShowTop(y > 320);
      if (!bodyRef.current) return;
      const secs = bodyRef.current.querySelectorAll("[data-sec]");
      let cur = 1;
      secs.forEach((el) => { if (el.getBoundingClientRect().top <= 140) cur = Number(el.getAttribute("data-sec")); });
      setActive(cur);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const q = query.trim();
  const visible = useMemo(
    () => SECTIONS.map((s, i) => ({ s, i })).filter(({ s }) => matches(s, q)),
    [q]
  );
  const noResults = q && visible.length === 0;

  const goTo = (idx) => {
    const el = document.getElementById(`pp-sec-${idx}`);
    if (el) {
      const y = el.getBoundingClientRect().top + window.scrollY - 84;
      window.scrollTo({ top: y, behavior: "smooth" });
    }
  };
  const scrollTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  const lastUpdated = "30 June 2026";

  return (
    <div className="tc-page">
      <Helmet>
        <title>Privacy Policy | Nomadic Townies</title>
        <meta name="description" content="How Nomadic Townies collects, uses, stores, shares, and protects your personal information." />
        <link rel="canonical" href="https://www.nomadictownies.com/privacy-policy" />
      </Helmet>

      {/* header (logo intentionally omitted per brand request) */}
      <header className="tc-header">
        <button type="button" className="tc-back" aria-label="Go back" onClick={() => navigate(-1)}>←</button>
        <div className="tc-header-title">Privacy Policy</div>
      </header>

      {/* hero */}
      <section className="tc-hero">
        <div className="tc-hero-glow" />
        <div className="tc-hero-inner">
          <span className="tc-eyebrow">Privacy</span>
          <h1>Privacy Policy</h1>
          <p className="tc-hero-lead">Nomadic Townies respects your privacy and is committed to protecting your personal information. This policy explains how we handle your information across our platform.</p>
          <div className="tc-pills">
            <span className="tc-pill">Last updated · {lastUpdated}</span>
            <span className="tc-pill">{SECTIONS.length} sections</span>
          </div>
        </div>
      </section>

      {/* grid */}
      <div className="tc-grid">
        {/* sticky TOC (desktop) */}
        <aside className="tc-side">
          <div className="tc-side-card">
            <div className="tc-search-wrap">
              <input
                className="tc-in"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search policy…"
                aria-label="Search policy"
              />
              <span className="tc-search-ic"><IcSearch /></span>
            </div>
            <div className="tc-toc-label">On this page</div>
            <nav className="tc-toc-nav">
              {SECTIONS.map((s, i) => {
                const idx = i + 1;
                const isActive = active === idx && !q;
                return (
                  <button
                    key={idx}
                    type="button"
                    className={`tc-toc-link${isActive ? " active" : ""}`}
                    onClick={() => goTo(idx)}
                  >
                    <span className="num">{idx}.</span>
                    <span>{s.title}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        </aside>

        {/* content */}
        <main className="tc-main">
          {/* mobile ToC */}
          <details className="tc-mobile-toc">
            <summary>Jump to section <span className="caret">▾</span></summary>
            <div className="tc-mobile-list">
              {SECTIONS.map((s, i) => (
                <button key={i} type="button" className="tc-toc-link" onClick={(e) => { goTo(i + 1); e.currentTarget.closest("details").open = false; }}>
                  <span className="num">{i + 1}.</span>
                  <span>{s.title}</span>
                </button>
              ))}
            </div>
          </details>

          {/* intro */}
          <section className="tc-card tc-intro tc-sec">
            <p>Nomadic Townies respects your privacy and is committed to protecting your personal information.</p>
            <div className="tc-quote">
              <p>This Privacy Policy explains how we collect, use, store, share, and protect information when you use our website, submit inquiries, make bookings, become a host, or interact with Nomadic Townies.</p>
            </div>
          </section>

          {/* sections */}
          <div className="tc-sections" ref={bodyRef}>
            {visible.map(({ s, i }) => {
              const idx = i + 1;
              return (
                <section key={idx} id={`pp-sec-${idx}`} data-sec={idx} className="tc-card tc-sec">
                  <div className="tc-sec-head">
                    <span className="tc-sec-num">{idx}</span>
                    <h2>{s.title}</h2>
                  </div>
                  <div className="tc-sec-body">
                    {s.blocks.map((b, bi) => (
                      <div className="blk" key={bi}>
                        {b.kind === "p" && <p className="tc-p"><Html html={highlight(b.text, q)} /></p>}
                        {b.kind === "callout" && (
                          <div className="tc-callout"><IcInfo /><p><Html html={highlight(b.text, q)} /></p></div>
                        )}
                        {b.kind === "list" && (
                          <ul className="tc-list">
                            {b.items.map((it, ii) => (
                              <li key={ii}><span className="dot" /><span><Html html={highlight(it, q)} /></span></li>
                            ))}
                          </ul>
                        )}
                      </div>
                    ))}
                  </div>
                </section>
              );
            })}
          </div>

          {noResults && (
            <div className="tc-card tc-noresults">
              <div className="ic"><IcSearch s={22} /></div>
              <p className="t">No matches for &ldquo;{q}&rdquo;</p>
              <p className="s">Try a different word or clear your search.</p>
            </div>
          )}

          <p className="tc-footnote">For privacy-related questions, contact Nomadic Townies through the official website or support email.</p>
        </main>
      </div>

      {/* back to top */}
      <button type="button" className={`tc-top${showTop ? "" : " hidden"}`} onClick={scrollTop} aria-label="Back to top">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 19V5M5 12l7-7 7 7" /></svg> Top
      </button>

      <Footer />
    </div>
  );
};

export default PrivacyPolicy;
