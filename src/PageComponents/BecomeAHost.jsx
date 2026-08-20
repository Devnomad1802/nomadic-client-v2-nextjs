"use client";

/* eslint-disable react/prop-types */
/**
 * BecomeAHost — public "How it works" page for prospective hosts, reached from
 * Meet Our Hosts. Informational only: no internal commercial/commission/payout
 * detail. Every CTA opens the EXISTING Become-a-Host application flow
 * (BecomeHostModal → /host-portal/apply); no new application/onboarding logic.
 * Uses the site design system (fonts, colours, buttons, cards) via .ntv3.
 */
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import "../Component/Home/homeV3.css";
import "./becomeAHost.css";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import Footer from "../Component/Footer";
import BecomeHostModal from "./BecomeHostModal";

const HERO_IMG = "https://images.unsplash.com/photo-1454496522488-7a8e488e8606?auto=format&fit=crop&w=1600&q=70";

// 5-step host journey — mirrors the real backend flow (apply → review →
// complete profile → approval → start hosting). No invented steps.
const STEPS = [
  { n: "01", title: "Apply to become a host", body: "Tell us about yourself, your expertise and the experiences you create. It takes a few minutes." },
  { n: "02", title: "We review your application", body: "Our team looks at your experience, quality and fit. We curate hosts — we don't auto-approve everyone.", note: "Curated, not collected." },
  { n: "03", title: "Complete your host profile", body: "Share your story, photos, expertise, destinations, languages and specialities. We shape it into a professional profile." },
  { n: "04", title: "Profile review & approval", body: "We review your completed profile once more, then approve it so it can go live on Nomadic Townies." },
  { n: "05", title: "Start hosting", body: "Your dashboard is activated. Add experiences, manage bookings and welcome travellers who chose you." },
];

const VALUES = [
  { title: "Authenticity", body: "You genuinely care about what you host." },
  { title: "Experience", body: "You have real knowledge, skill or experience in your field." },
  { title: "Hospitality", body: "You care about the people travelling with you." },
  { title: "Responsibility", body: "You take safety, communication and guest experience seriously." },
  { title: "Personality", body: "You bring something that makes the experience memorable." },
  { title: "Quality", body: "You offer something more meaningful than moving people from place to place." },
];

const FAQS = [
  { q: "Who can become a host?", a: "Anyone with real expertise and a genuine experience to share — trek leaders, photographers, homestay hosts, wellness practitioners, cultural storytellers and more. Follower count isn't what we look for." },
  { q: "Does everyone who applies get accepted?", a: "No. We curate hosts based on quality and fit rather than approving every application, so travellers can trust every host on the platform." },
  { q: "How long does the process take?", a: "We review most applications within a few working days. Building your full profile after that is at your own pace." },
  { q: "What do I need to get started?", a: "Just the basics to apply: who you are, what you host and a little about your experience. Photos, itineraries and other details come later, when you complete your profile." },
  { q: "How do travellers find me?", a: "Once approved, your profile and experiences appear on Nomadic Townies, where travellers discover you, understand what you offer and book directly." },
];

const BecomeAHost = () => {
  const navigate = useNavigate();
  const [openApply, setOpenApply] = useState(false);
  const [openFaq, setOpenFaq] = useState(0);
  const apply = () => setOpenApply(true);

  return (
    <div className="ntv3 bah">
      <Helmet>
        <title>Become a Host | How It Works | Nomadic Townies</title>
        <meta name="description" content="Learn how to become a host on Nomadic Townies. Apply, complete your profile, get approved and start hosting host-led experiences for curious travellers." />
        <link rel="canonical" href="https://www.nomadictownies.com/become-a-host" />
        <meta property="og:title" content="Become a Host | Nomadic Townies" />
        <meta property="og:description" content="Share your expertise and stories. Apply to host curated, host-led experiences on Nomadic Townies." />
      </Helmet>

      <BecomeHostModal open={openApply} onClose={() => setOpenApply(false)} />

      {/* HERO */}
      <section className="bah-hero">
        <img className="bah-hero-img" src={HERO_IMG} alt="A host leading travellers through the mountains" loading="eager" />
        <div className="bah-hero-overlay" />
        <div className="wrap bah-hero-inner">
          <div className="bah-eyebrow"><span className="bah-dot" />Curated host community · Est. 2020</div>
          <h1 className="bah-hero-h1">Your experience deserves more than a listing.</h1>
          <p className="bah-hero-sub">Nomadic Townies connects travellers with passionate hosts who bring something unique to the journey — their expertise, their stories and their way of seeing the world.</p>
          <div className="bah-hero-ctas">
            <button className="btn btn-orange btn-xl" onClick={apply}>Apply to host <ArrowForwardIcon sx={{ fontSize: 18 }} /></button>
            <button className="btn btn-lg bah-hero-ghost" onClick={() => navigate("/hosts")}>See our hosts</button>
          </div>
        </div>
      </section>

      {/* INTRO */}
      <section className="section" style={{ background: "#fff" }}>
        <div className="wrap" style={{ textAlign: "center", maxWidth: 720 }}>
          <div className="section-label" style={{ justifyContent: "center" }}><span className="section-label-bar" />More than a trip listing<span className="section-label-bar" /></div>
          <h2 className="section-h">People are what make travel memorable.</h2>
          <p className="section-sub">We&apos;re building a platform where hosts become the destination. You bring the experience and the community; we handle the profile, discovery and booking journey so you can focus on what you do best.</p>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how" className="section" style={{ background: "var(--orange-tint,#FBF3EE)" }}>
        <div className="wrap">
          <div style={{ textAlign: "center", maxWidth: 640, margin: "0 auto 44px" }}>
            <div className="section-label" style={{ justifyContent: "center" }}><span className="section-label-bar" />How it works</div>
            <h2 className="section-h">From application to your first guest.</h2>
            <p className="section-sub">Five simple steps. No jargon, no guesswork.</p>
          </div>
          <div className="bah-steps">
            {STEPS.map((s) => (
              <div className="bah-step" key={s.n}>
                <div className="bah-step-n">{s.n}</div>
                <div className="bah-step-body">
                  <h3 className="bah-step-title">{s.title}</h3>
                  <p className="bah-step-text">{s.body}</p>
                  {s.note && <span className="bah-step-note">{s.note}</span>}
                </div>
              </div>
            ))}
          </div>
          <div style={{ textAlign: "center", marginTop: 40 }}>
            <button className="btn btn-orange btn-lg" onClick={apply}>Start your application</button>
          </div>
        </div>
      </section>

      {/* WHAT MAKES A GREAT HOST */}
      <section className="section" style={{ background: "#fff" }}>
        <div className="wrap">
          <div style={{ textAlign: "center", maxWidth: 640, margin: "0 auto 44px" }}>
            <div className="section-label" style={{ justifyContent: "center" }}><span className="section-label-bar" />Our hosts</div>
            <h2 className="section-h">What makes a great Nomadic Townies host?</h2>
            <p className="section-sub">There&apos;s no single type of host. But the best ones share a few things.</p>
          </div>
          <div className="bah-values">
            {VALUES.map((v) => (
              <div className="bah-value" key={v.title}>
                <h3 className="bah-value-title">{v.title}</h3>
                <p className="bah-value-text">{v.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="section" style={{ background: "var(--orange-tint,#FBF3EE)" }}>
        <div className="wrap" style={{ maxWidth: 820 }}>
          <div style={{ textAlign: "center", marginBottom: 36 }}>
            <div className="section-label" style={{ justifyContent: "center" }}><span className="section-label-bar" />FAQ</div>
            <h2 className="section-h">Questions, answered honestly.</h2>
          </div>
          <div className="bah-faqs">
            {FAQS.map((f, i) => (
              <div className={`bah-faq${openFaq === i ? " open" : ""}`} key={f.q}>
                <button type="button" className="bah-faq-q" aria-expanded={openFaq === i} onClick={() => setOpenFaq(openFaq === i ? -1 : i)}>
                  <span>{f.q}</span><span className="bah-faq-ic">+</span>
                </button>
                <div className="bah-faq-a"><p>{f.a}</p></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="cta-band bah-cta">
        <div className="wrap">
          <h2 style={{ fontFamily: "var(--playfair)", color: "#fff", fontSize: "clamp(28px,4vw,50px)", fontWeight: 700, lineHeight: 1.08, letterSpacing: "-.02em", marginBottom: 16 }}>Become one of our founding hosts.</h2>
          <p style={{ fontSize: 17, color: "rgba(255,255,255,.85)", lineHeight: 1.6, maxWidth: 520, margin: "0 auto 32px" }}>Have an experience worth sharing? We&apos;d love to meet you. Apply in a few minutes.</p>
          <button className="btn btn-lg" style={{ background: "#fff", color: "var(--orange)", fontWeight: 700, boxShadow: "0 6px 20px rgba(0,0,0,.2)" }} onClick={apply}>Apply to host</button>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default BecomeAHost;
