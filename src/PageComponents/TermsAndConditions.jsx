"use client";

/* eslint-disable react/prop-types */
import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import "./termsAndConditions.css";
import Footer from "../Component/Footer";

/* Legal content — source of truth from the approved Terms & Conditions design.
   Do not rewrite wording without explicit request. */
const SECTIONS = [
  { title: "Role of Nomadic Townies", blocks: [
    { kind: "p", text: "Nomadic Townies acts as a curated marketplace and booking platform connecting travelers with independent hosts, organizers, experience creators, retreat leaders, guides, and service providers." },
    { kind: "p", text: "Some experiences may be operated directly by Nomadic Townies, while others may be operated by independent hosts or third-party partners." },
    { kind: "p", text: "Nomadic Townies curates, lists, promotes, facilitates bookings, collects payments, and coordinates communication. However, the actual delivery of an experience may be handled by the respective host or service provider." },
  ]},
  { title: "Eligibility", blocks: [
    { kind: "callout", text: "You must be at least 18 years old to make a booking." },
    { kind: "p", text: "Minors may participate only with the consent and responsibility of a parent or legal guardian." },
  ]},
  { title: "Booking Confirmation", blocks: [
    { kind: "p", text: "A booking is confirmed only after:" },
    { kind: "list", items: ["Required booking amount or full payment is received.", "Availability is confirmed.", "Booking confirmation is issued by Nomadic Townies."] },
    { kind: "callout", text: "Submitting an inquiry does not guarantee booking confirmation." },
  ]},
  { title: "Payments", blocks: [
    { kind: "p", text: "Payments may be collected through online payment gateways, UPI, cards, net banking, wallets, or other approved payment methods." },
    { kind: "p", text: "The total experience price, booking amount, taxes, platform charges, and payment terms will be shown before payment wherever applicable." },
    { kind: "p", text: "Payment gateway fees, transaction charges, taxes, or bank charges may apply and may not always be refundable." },
  ]},
  { title: "Host-Led Experiences", blocks: [
    { kind: "p", text: "Hosts are responsible for delivering the experience as described, subject to practical conditions, weather, safety, permissions, and local circumstances." },
    { kind: "p", text: "Nomadic Townies may review and verify hosts, but participation remains subject to the traveler’s personal judgment, fitness, conduct, and risk acceptance." },
  ]},
  { title: "Traveler Responsibilities", blocks: [
    { kind: "p", text: "Travelers must:" },
    { kind: "list", items: ["Provide accurate personal and booking information.", "Follow host instructions and safety guidelines.", "Respect local communities, cultures, and environments.", "Carry valid ID, permits, visas, and travel documents where required.", "Arrive on time at the meeting point.", "Avoid behavior that may risk the safety or comfort of others."] },
  ]},
  { title: "Health, Fitness & Risk", blocks: [
    { kind: "p", text: "Certain experiences may involve trekking, road travel, water activities, remote locations, workshops, wellness practices, adventure activities, or physically demanding conditions." },
    { kind: "p", text: "Travelers are responsible for assessing their health, fitness, medical condition, and suitability before booking." },
    { kind: "callout", text: "Nomadic Townies may refuse participation if a traveler appears unfit, unsafe, intoxicated, aggressive, or unable to follow instructions." },
  ]},
  { title: "Itinerary Changes", blocks: [
    { kind: "p", text: "Itineraries may change due to:" },
    { kind: "list", items: ["Weather", "Road conditions", "Local restrictions", "Government rules", "Safety concerns", "Operational issues", "Host or vendor limitations", "Force majeure events"] },
    { kind: "p", text: "Nomadic Townies and/or the host may modify the itinerary in the interest of safety, feasibility, or experience quality." },
  ]},
  { title: "Code of Conduct", blocks: [
    { kind: "p", text: "Nomadic Townies may remove a participant without refund if they engage in:" },
    { kind: "list", items: ["Harassment", "Abuse", "Illegal activity", "Substance misuse", "Violence", "Disrespect toward locals, hosts, or travelers", "Repeated violation of instructions", "Conduct that affects group safety"] },
  ]},
  { title: "Platform Communication", blocks: [
    { kind: "p", text: "To protect travelers, hosts, and booking integrity, communication before booking should happen through Nomadic Townies." },
    { kind: "p", text: "Travelers and hosts should not bypass the platform for direct payments, direct bookings, or off-platform arrangements." },
    { kind: "callout", text: "Nomadic Townies is not responsible for any loss, fraud, dispute, or service failure arising from direct arrangements made outside the platform." },
  ]},
  { title: "Reviews & Content", blocks: [
    { kind: "p", text: "Travelers may submit reviews, photos, videos, or feedback." },
    { kind: "p", text: "By submitting content, you allow Nomadic Townies to use it for marketing, website, social media, quality control, and promotional purposes, unless you request otherwise in writing." },
    { kind: "p", text: "Reviews must be genuine, respectful, and not misleading." },
  ]},
  { title: "Third-Party Services", blocks: [
    { kind: "p", text: "Experiences may include services by third parties such as hotels, homestays, transport providers, activity vendors, guides, restaurants, or local operators." },
    { kind: "p", text: "Nomadic Townies is not liable for failures, delays, misconduct, or service issues caused by independent third parties, but will make reasonable efforts to assist." },
  ]},
  { title: "Liability Limitation", blocks: [
    { kind: "p", text: "Participation in travel and experience-led activities involves inherent risks." },
    { kind: "callout", text: "Nomadic Townies shall not be liable for personal injury, illness, loss of belongings, delays, missed transport, weather disruptions, emotional distress, indirect losses, or expenses arising from circumstances beyond reasonable control." },
  ]},
  { title: "Intellectual Property", blocks: [
    { kind: "p", text: "All website content, brand assets, copy, graphics, design, logos, and platform materials belong to Nomadic Townies unless otherwise stated." },
    { kind: "p", text: "You may not copy, reproduce, or commercially use our content without permission." },
  ]},
  { title: "Governing Law & Jurisdiction", blocks: [
    { kind: "p", text: "These Terms shall be governed by the laws of India." },
    { kind: "p", text: "Subject to applicable law, disputes shall fall under the jurisdiction of courts in Pune, Maharashtra." },
  ]},
  { title: "Updates", blocks: [
    { kind: "p", text: "Nomadic Townies may update these Terms from time to time." },
    { kind: "p", text: "Continued use of the website or services means acceptance of the updated Terms." },
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

const TermsAndConditions = () => {
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
    const el = document.getElementById(`tc-sec-${idx}`);
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
        <title>Terms and Conditions | Nomadic Townies</title>
        <meta name="description" content="Read the terms and conditions for booking travel experiences with Nomadic Townies." />
        <link rel="canonical" href="https://www.nomadictownies.com/terms-and-conditions" />
      </Helmet>

      {/* header (logo intentionally omitted per brand request) */}
      <header className="tc-header">
        <button type="button" className="tc-back" aria-label="Go back" onClick={() => navigate(-1)}>←</button>
        <div className="tc-header-title">Terms &amp; Conditions</div>
      </header>

      {/* hero */}
      <section className="tc-hero">
        <div className="tc-hero-glow" />
        <div className="tc-hero-inner">
          <span className="tc-eyebrow">Legal</span>
          <h1>Terms &amp; Conditions</h1>
          <p className="tc-hero-lead">Welcome to Nomadic Townies. Please read these terms carefully — they govern your use of our platform and participation in any listed experience.</p>
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
                placeholder="Search terms…"
                aria-label="Search terms"
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
            <p>Welcome to Nomadic Townies.</p>
            <p>Nomadic Townies is a curated marketplace for transformative travel experiences, including community trips, retreats, workshops, cultural immersions, backpacking adventures, local experiences, and other host-led experiences.</p>
            <div className="tc-quote">
              <p>By accessing our website, submitting an inquiry, making a booking, or participating in any experience listed on Nomadic Townies, you agree to these Terms &amp; Conditions.</p>
            </div>
          </section>

          {/* sections */}
          <div className="tc-sections" ref={bodyRef}>
            {visible.map(({ s, i }) => {
              const idx = i + 1;
              return (
                <section key={idx} id={`tc-sec-${idx}`} data-sec={idx} className="tc-card tc-sec">
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

          <p className="tc-footnote">These Terms shall be governed by the laws of India. For questions about these Terms, please reach us through the Nomadic Townies platform.</p>
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

export default TermsAndConditions;
