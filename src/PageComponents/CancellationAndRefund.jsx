"use client";

/* eslint-disable react/prop-types */
import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import "./termsAndConditions.css"; // shared legal-page styles (tc-*)
import Footer from "../Component/Footer";

/* Cancellation & Refund content — exact text from the approved design.
   Do not rewrite or summarize. */
const SECTIONS = [
  { title: "Booking Amount", blocks: [
    { kind: "p", text: "The booking amount paid to reserve a seat is generally non-refundable." },
    { kind: "p", text: "This amount may be used to block inventory, secure host/vendor commitments, process administration, and reserve limited seats." },
  ]},
  { title: "Balance Payment", blocks: [
    { kind: "p", text: "If a booking requires partial payment first, the remaining balance must be paid as per the timeline communicated for that experience." },
    { kind: "callout", text: "Failure to pay the balance on time may result in cancellation of the booking, and the booking amount may be forfeited." },
  ]},
  { title: "Traveler Cancellation", blocks: [
    { kind: "p", text: "If a traveler cancels after booking, the following policy may apply unless a specific experience page mentions different terms:" },
    { kind: "sub", text: "30+ Days Before Start Date" },
    { kind: "list", items: ["Booking amount: non-refundable", "Balance amount paid: refundable after deducting applicable charges"] },
    { kind: "sub", text: "15–29 Days Before Start Date" },
    { kind: "list", items: ["Booking amount: non-refundable", "Up to 50% of the total experience amount may be deducted", "Remaining eligible amount may be refunded or converted to credit, depending on host/vendor terms"] },
    { kind: "sub", text: "7–14 Days Before Start Date" },
    { kind: "list", items: ["Booking amount: non-refundable", "Up to 75% of the total experience amount may be deducted"] },
    { kind: "sub", text: "Less Than 7 Days Before Start Date" },
    { kind: "list", items: ["No refund will generally be provided"] },
    { kind: "sub", text: "No-Show" },
    { kind: "p", text: "No refund will be provided for no-shows, late arrivals, missed departures, or voluntary dropouts during the experience." },
  ]},
  { title: "Transfer / Reschedule Option", blocks: [
    { kind: "p", text: "Where feasible, Nomadic Townies may allow one-time transfer to another batch, experience, or traveler." },
    { kind: "p", text: "This is subject to:" },
    { kind: "list", items: ["Availability", "Host approval", "Vendor conditions", "Fare difference", "Operational feasibility", "Minimum notice period"] },
    { kind: "callout", text: "Transfer or rescheduling is not guaranteed." },
  ]},
  { title: "Cancellation By Host Or Nomadic Townies", blocks: [
    { kind: "p", text: "If an experience is cancelled by the host or Nomadic Townies for operational reasons, the traveler may be offered:" },
    { kind: "list", items: ["Full refund", "Alternative batch", "Alternative experience", "Travel credit"] },
    { kind: "p", text: "The final option may depend on the reason for cancellation, vendor recoverability, and traveler preference." },
  ]},
  { title: "Force Majeure", blocks: [
    { kind: "p", text: "Force majeure includes events beyond reasonable control, such as:" },
    { kind: "list", items: ["Natural disasters", "Extreme weather", "Road closures", "Political unrest", "Government restrictions", "Pandemics", "Transport shutdowns", "Safety threats", "Local authority orders"] },
    { kind: "p", text: "In such cases, refunds may not always be possible." },
    { kind: "p", text: "Nomadic Townies may offer rescheduling, partial credit, alternative experience, or refund depending on recoverable costs and host/vendor terms." },
  ]},
  { title: "Non-Refundable Components", blocks: [
    { kind: "p", text: "Certain components may be non-refundable once booked, including:" },
    { kind: "list", items: ["Permits", "Accommodation advances", "Transport bookings", "Activity/vendor charges", "Payment gateway charges", "Taxes where already paid", "Third-party cancellation charges"] },
  ]},
  { title: "Refund Processing Time", blocks: [
    { kind: "p", text: "Approved refunds may take 7–14 business days after approval, depending on payment method, bank, payment gateway, and internal processing timelines. Payment gateway refund timelines can vary based on banking and processing systems." },
  ]},
  { title: "Payment Gateway / Transaction Charges", blocks: [
    { kind: "p", text: "Payment gateway fees, MDR, convenience fees, transaction charges, or bank charges may not be refundable where they have already been charged by the payment processor. Razorpay’s terms refer to permissible deductions including payment aggregator fees and chargeback-related amounts." },
  ]},
  { title: "Special Experience-Specific Policies", blocks: [
    { kind: "p", text: "Some experiences may have stricter or different cancellation terms due to:" },
    { kind: "list", items: ["International travel", "Permits", "Retreat venues", "Limited seats", "Flights", "Remote logistics", "Seasonal operations", "Host/vendor-specific rules"] },
    { kind: "callout", text: "Where applicable, the experience-specific cancellation policy will override this general policy." },
  ]},
  { title: "Refund Request Process", blocks: [
    { kind: "p", text: "To request cancellation or refund, travelers must contact Nomadic Townies with:" },
    { kind: "list", items: ["Booking ID", "Traveler name", "Experience name", "Batch date", "Reason for cancellation"] },
    { kind: "p", text: "Refund eligibility will be reviewed based on this policy and the specific experience terms." },
  ]},
  { title: "Important Note", blocks: [
    { kind: "callout", text: "Nomadic Townies aims to be fair to travelers while protecting hosts and operational commitments." },
    { kind: "p", text: "The booking amount is generally non-refundable, but we may offer transfer, credit, or rescheduling wherever practically possible." },
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

const CancellationAndRefund = () => {
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
    const el = document.getElementById(`cr-sec-${idx}`);
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
        <title>Cancellation &amp; Refund Policy | Nomadic Townies</title>
        <meta name="description" content="Cancellation and refund rules for bookings made through Nomadic Townies." />
        <link rel="canonical" href="https://www.nomadictownies.com/cancellation-and-refund" />
      </Helmet>

      {/* header (logo intentionally omitted per brand request) */}
      <header className="tc-header">
        <button type="button" className="tc-back" aria-label="Go back" onClick={() => navigate(-1)}>←</button>
        <div className="tc-header-title">Cancellation &amp; Refund Policy</div>
      </header>

      {/* hero */}
      <section className="tc-hero">
        <div className="tc-hero-glow" />
        <div className="tc-hero-inner">
          <span className="tc-eyebrow">Refunds</span>
          <h1>Cancellation &amp; Refund Policy</h1>
          <p className="tc-hero-lead">This Cancellation &amp; Refund Policy applies to bookings made through Nomadic Townies. Our rules balance traveler fairness with the realities of host-led travel.</p>
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
            <p>This Cancellation &amp; Refund Policy applies to bookings made through Nomadic Townies.</p>
            <div className="tc-quote">
              <p>Nomadic Townies operates as a curated marketplace for host-led experiences. Since many experiences involve advance planning, host commitments, accommodation holds, permits, vendors, logistics, and limited seats, cancellation rules must balance traveler fairness with operational reality.</p>
            </div>
          </section>

          {/* sections */}
          <div className="tc-sections" ref={bodyRef}>
            {visible.map(({ s, i }) => {
              const idx = i + 1;
              return (
                <section key={idx} id={`cr-sec-${idx}`} data-sec={idx} className="tc-card tc-sec">
                  <div className="tc-sec-head">
                    <span className="tc-sec-num">{idx}</span>
                    <h2>{s.title}</h2>
                  </div>
                  <div className="tc-sec-body">
                    {s.blocks.map((b, bi) => (
                      <div className={`blk${b.kind === "sub" ? " sub-blk" : ""}`} key={bi}>
                        {b.kind === "p" && <p className="tc-p"><Html html={highlight(b.text, q)} /></p>}
                        {b.kind === "sub" && <p className="tc-sub"><Html html={highlight(b.text, q)} /></p>}
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

          <p className="tc-footnote">Where an experience lists its own cancellation terms, those terms override this general policy. For refund requests, contact Nomadic Townies through the platform.</p>
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

export default CancellationAndRefund;
