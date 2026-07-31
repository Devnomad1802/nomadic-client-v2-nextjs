"use client";

/* eslint-disable react/prop-types */
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import Footer from "../Component/Footer";
import BecomeHostModal from "./BecomeHostModal";
import { useGetAllHostsQuery } from "../services";
import "./aboutV2.css";

const HERO_IMG = "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=1600&q=75";
const STORY_IMG = "https://images.unsplash.com/photo-1530789253388-582c481c54b0?auto=format&fit=crop&w=1200&q=75";
const PHILOSOPHY_IMG = "https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=1600&q=75";
const VISION_IMG = "https://images.unsplash.com/photo-1454942901704-3c44c11b2ad1?auto=format&fit=crop&w=1600&q=75";
const DEFAULT_COVER = "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=65";

const chaptersList = [
  { id: "v2-1", short: "Story", label: "Hero" },
  { id: "v2-2", short: "Story", label: "Our Story" },
  { id: "v2-3", short: "Why", label: "Why We Exist" },
  { id: "v2-4", short: "How", label: "How It Works" },
  { id: "v2-5", short: "Why us", label: "Why Nomadic" },
  { id: "v2-6", short: "Beliefs", label: "Philosophy" },
  { id: "v2-7", short: "Hosts", label: "Hosts" },
  { id: "v2-8", short: "Vision", label: "Vision" },
  { id: "v2-9", short: "Numbers", label: "Numbers" },
  { id: "v2-10", short: "Join", label: "Join Us" },
];

const stepsData = [
  {
    n: "1",
    title: "We verify passionate hosts",
    body: "Every host is vetted for safety, skill and story before they join.",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2 4 5v6c0 5 3.5 8 8 11 4.5-3 8-6 8-11V5l-8-3Z" />
        <path d="m9 12 2 2 4-4" />
      </svg>
    ),
  },
  {
    n: "2",
    title: "Hosts create experiences",
    body: "They craft unforgettable trips only a local could.",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2 15 8.5 22 9.1 16.7 13.7 18.3 20.5 12 17 5.7 20.5 7.3 13.7 2 9.1 9 8.5 12 2Z" />
      </svg>
    ),
  },
  {
    n: "3",
    title: "Travellers discover & book",
    body: "Curated and searchable, booked through Nomadic Townies.",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8" />
        <path d="m21 21-4.3-4.3" />
      </svg>
    ),
  },
  {
    n: "4",
    title: "We manage bookings & payouts",
    body: "Secure payments, support and on-time host payouts.",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="5" width="20" height="14" rx="2" />
        <path d="M2 10h20" />
      </svg>
    ),
  },
  {
    n: "5",
    title: "Authentic experiences happen",
    body: "Everyone enjoys experiences built on trust.",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
        <circle cx="12" cy="10" r="3" />
      </svg>
    ),
  },
];

const pillarsData = [
  {
    title: "Verified hosts",
    body: "Every host goes through a verification process before joining our marketplace.",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2 4 5v6c0 5 3.5 8 8 11 4.5-3 8-6 8-11V5l-8-3Z" />
        <path d="m9 12 2 2 4-4" />
      </svg>
    ),
  },
  {
    title: "Curated experiences",
    body: "We prioritise quality over quantity — every experience is thoughtfully selected.",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2 15 8.5 22 9.1 16.7 13.7 18.3 20.5 12 17 5.7 20.5 7.3 13.7 2 9.1 9 8.5 12 2Z" />
      </svg>
    ),
  },
  {
    title: "Secure bookings",
    body: "Book confidently with secure payments, transparent pricing and dedicated support.",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="5" width="20" height="14" rx="2" />
        <path d="M2 10h20" />
        <path d="M6 15h4" />
      </svg>
    ),
  },
  {
    title: "Trusted community",
    body: "Join a growing community who believe experiences matter more than itineraries.",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      </svg>
    ),
  },
];

const beliefsData = [
  { n: "01", text: "People remember experiences more than destinations." },
  { n: "02", text: "Travel becomes meaningful when shared with the right people." },
  { n: "03", text: "Communities create better memories than crowded tours." },
  { n: "04", text: "Local knowledge is more valuable than guidebooks." },
  { n: "05", text: "Every journey has the power to change someone." },
];

const numbersData = [
  { value: "2020", label: "Community since" },
  { value: "Launching", label: "Growing host network" },
  { value: "Growing", label: "Experiences across India" },
  { value: "Every day", label: "Traveller community growing" },
];

const AboutUs = ({ aboutbg = "" }) => {
  const navigate = useNavigate();
  const [activeChap, setActiveChap] = useState(0);
  const [openHostModal, setOpenHostModal] = useState(false);

  // Dynamic backend host fetching
  const { data: hostsRes, isLoading: hostsLoading } = useGetAllHostsQuery();
  const dynamicHosts = useMemo(() => {
    const list = Array.isArray(hostsRes?.data) ? hostsRes.data : Array.isArray(hostsRes) ? hostsRes : [];
    return list.filter((h) => h?.isActive !== false);
  }, [hostsRes]);

  // Track active chapter on scroll
  useEffect(() => {
    const handleScroll = () => {
      const vh = window.innerHeight || 800;
      chaptersList.forEach((ch, idx) => {
        const el = document.getElementById(ch.id);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= vh * 0.45 && rect.bottom >= 100) {
            setActiveChap(idx);
          }
        }
      });
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToChapter = (id) => {
    const el = document.getElementById(id);
    if (el) {
      const top = el.getBoundingClientRect().top + window.scrollY - 20;
      window.scrollTo({ top, behavior: "smooth" });
    }
  };

  return (
    <div className="v2-page">
      <Helmet>
        <title>About Us | More Than Travel — Meaningful Experiences | Nomadic Townies</title>
        <meta name="description" content="Discover Nomadic Townies — a curated marketplace connecting travellers with verified hosts who create community trips, backpacking adventures, wellness retreats, and cultural experiences." />
        <link rel="canonical" href="https://nomadictownies.com/about-us" />
        <meta property="og:title" content="About Us | Nomadic Townies" />
        <meta property="og:description" content="A story about meaningful experiences. Discover host-led community trips, backpacking, wellness retreats, and cultural immersions." />
        <meta property="og:url" content="https://nomadictownies.com/about-us" />
      </Helmet>

      <BecomeHostModal openS={openHostModal} setOpens={setOpenHostModal} />

      {/* CHAPTER RAIL (DESKTOP FLOATING SIDEBAR) */}
      <div className="v2-rail" style={{ display: "none", position: "fixed", left: 26, top: "50%", transform: "translateY(-50%)", zIndex: 45, flexDirection: "column", gap: 16 }}>
        {chaptersList.map((ch, idx) => {
          const isActive = activeChap === idx;
          return (
            <div key={ch.id} onClick={() => scrollToChapter(ch.id)} style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}>
              <span
                className="v2-raildot"
                style={{
                  width: 9,
                  height: 9,
                  borderRadius: "50%",
                  background: isActive ? "#E9622F" : "rgba(26, 19, 13, 0.25)",
                  transform: isActive ? "scale(1.5)" : "scale(1)",
                  flex: "none",
                }}
              />
              <span
                style={{
                  font: "600 11px/1 var(--inter)",
                  letterSpacing: ".05em",
                  textTransform: "uppercase",
                  color: isActive ? "#CF4A2C" : "transparent",
                  transition: "color .3s ease",
                  whiteSpace: "nowrap",
                }}
              >
                {ch.short}
              </span>
            </div>
          );
        })}
      </div>

      {/* ===== 1 · HERO ===== */}
      <section id="v2-1" style={{ position: "relative", minHeight: "calc(100vh - 80px)", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", background: "#1a130d" }}>
        <img src={aboutbg || HERO_IMG} alt="Travellers in the mountains" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", opacity: 0.45 }} />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(160deg, rgba(26,19,13,.78), rgba(26,19,13,.88))" }} />
        <div style={{ position: "absolute", inset: 0, background: "repeating-linear-gradient(54deg, rgba(244,238,228,.03) 0 22px, rgba(244,238,228,.06) 22px 44px)" }} />
        <div style={{ position: "relative", zIndex: 2, maxWidth: 960, padding: "40px 24px", textAlign: "center", margin: "auto" }}>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 7, padding: "8px 18px", borderRadius: 99, border: "1px solid rgba(244,238,228,.24)", font: "700 11px/1 var(--inter)", letterSpacing: ".16em", textTransform: "uppercase", color: "#F0B49C" }}>
            Our story
          </span>
          <h1 className="v2-font-heading" style={{ margin: "26px 0 0", fontWeight: 700, fontSize: "clamp(32px, 4.5vw, 56px)", lineHeight: 1.08, letterSpacing: "-.03em", color: "#F8F4ED" }}>
            More than travel.<br />
            <span style={{ color: "#E9622F" }}>A story about meaningful experiences.</span>
          </h1>
          <p style={{ margin: "26px auto 0", maxWidth: 640, font: "400 clamp(16px,2vw,19px)/1.65 var(--inter)", color: "#D8CFC0" }}>
            Nomadic Townies is a curated marketplace connecting travellers with trusted hosts who create community trips, backpacking adventures, wellness retreats, workshops, and cultural experiences that leave lasting memories.
          </p>
          <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap", marginTop: 36 }}>
            <button type="button" className="v2-cta" onClick={() => navigate("/experiences")} style={{ padding: "15px 30px", font: "700 15px/1 var(--inter)", color: "#fff", background: "#CF4A2C", border: "none", borderRadius: 12, cursor: "pointer", boxShadow: "0 8px 20px rgba(207,74,44,.3)" }}>
              Explore experiences →
            </button>
            <button type="button" className="v2-ghost" onClick={() => navigate("/hosts")} style={{ padding: "15px 30px", font: "700 15px/1 var(--inter)", color: "#F4EEE4", background: "transparent", border: "1px solid rgba(244,238,228,.32)", borderRadius: 12, cursor: "pointer" }}>
              Meet our hosts
            </button>
          </div>
        </div>
        <button
          type="button"
          onClick={() => scrollToChapter("v2-2")}
          style={{
            position: "absolute",
            bottom: 26,
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 2,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 7,
            color: "rgba(244,238,228,.75)",
            background: "none",
            border: "none",
            cursor: "pointer",
            outline: "none",
            transition: "opacity .2s ease, transform .2s ease",
          }}
        >
          <span style={{ font: "600 10px/1 var(--inter)", letterSpacing: ".2em", textTransform: "uppercase" }}>Scroll</span>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M5 12l7 7 7-7" /></svg>
        </button>
      </section>

      {/* ===== 2 · OUR STORY ===== */}
      <section id="v2-2" style={{ background: "#F4EEE4", padding: "clamp(70px,9vw,120px) clamp(20px,5vw,60px)" }}>
        <div style={{ maxWidth: 1180, margin: "0 auto", textAlign: "left" }}>
          {/* Header section matching 03, 04, 05 */}
          <div style={{ maxWidth: 860, marginBottom: 48, textAlign: "left" }}>
            <div className="v2-font-heading" style={{ fontWeight: 800, fontSize: "clamp(64px,10vw,110px)", lineHeight: 0.85, color: "#EAD9C9", letterSpacing: "-.03em" }}>01</div>
            <div style={{ font: "700 12px/1 var(--inter)", letterSpacing: ".18em", textTransform: "uppercase", color: "#CF4A2C", marginTop: 12 }}>Our story</div>
            <h2 className="v2-font-heading" style={{ margin: "12px 0 0", fontWeight: 700, fontSize: "clamp(32px,4.8vw,52px)", lineHeight: 1.08, letterSpacing: "-.02em", color: "#221C17" }}>
              It started with one question…
            </h2>
            <p className="v2-font-serif" style={{ margin: "18px 0 0", fontWeight: 500, fontSize: "clamp(19px,2.6vw,25px)", lineHeight: 1.4, letterSpacing: "-.01em", color: "#8A4B33", fontStyle: "italic", maxWidth: 780 }}>
              &ldquo;What if travel wasn&apos;t just about visiting places — but truly experiencing them?&rdquo;
            </p>
          </div>

          {/* Row side-by-side: Image at LEFT, Text at RIGHT */}
          <div className="v2-split" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "clamp(30px,5vw,64px)", alignItems: "center" }}>
            {/* LEFT SIDE: Image */}
            <div>
              <img src={STORY_IMG} alt="Community travel story" style={{ width: "100%", height: "clamp(320px,40vw,460px)", objectFit: "cover", borderRadius: 20 }} />
            </div>

            {/* RIGHT SIDE: Text */}
            <div style={{ display: "flex", flexDirection: "column", gap: 16, font: "400 16px/1.75 var(--inter)", color: "#5A5247" }}>
              <p style={{ margin: 0 }}>Back in 2020, Nomadic Townies began with a simple idea: the best journeys are remembered not for the destinations, but for the people we meet, the stories we hear, and the experiences that change us.</p>
              <p style={{ margin: 0 }}>We started by organising community trips for small groups of explorers who wanted something beyond traditional tourism. Those journeys taught us an important lesson — people weren&apos;t looking for another package. They were searching for <strong style={{ color: "#3C3228", fontWeight: 600 }}>authentic experiences.</strong></p>
              <p style={{ margin: 0 }}>As our community grew, so did our vision. Incredible hosts already existed across the country — local guides, backpacking leaders, retreat organisers, artists, photographers, storytellers and community builders. They simply needed a trusted platform where travellers could discover them.</p>
              <p className="v2-font-heading" style={{ margin: 0, fontWeight: 600, fontSize: 18, color: "#221C17" }}>That realisation became Nomadic Townies.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ===== 3 · WHY WE EXIST ===== */}
      <section id="v2-3" style={{ background: "#16100B", padding: "clamp(80px,10vw,140px) clamp(24px,7vw,100px)", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", right: 0, top: 0, width: "600px", height: "600px", pointerEvents: "none", background: "radial-gradient(circle at 85% 15%, rgba(233,98,47,.16), transparent 55%)" }} />
        <div style={{ position: "relative", maxWidth: 940, margin: "0 auto", textAlign: "left" }}>
          <div>
            <div className="v2-font-heading" style={{ fontWeight: 800, fontSize: "clamp(64px,10vw,110px)", lineHeight: 0.85, color: "#3D2619", letterSpacing: "-.03em" }}>02</div>
            <div style={{ font: "700 12px/1 var(--inter)", letterSpacing: ".18em", textTransform: "uppercase", color: "#D97352", marginTop: 12 }}>Why we exist</div>
            <h2 className="v2-font-heading" style={{ margin: "12px 0 0", fontWeight: 700, fontSize: "clamp(32px,4.8vw,52px)", lineHeight: 1.08, letterSpacing: "-.02em", color: "#FFFFFF" }}>
              Why we built Nomadic Townies
            </h2>
          </div>
          <div style={{ marginTop: 38, display: "flex", flexDirection: "column", gap: 0 }}>
            <p className="v2-font-heading" style={{ margin: 0, fontWeight: 500, fontSize: "clamp(20px,2.8vw,30px)", lineHeight: 1.35, letterSpacing: "-.01em", color: "#9E9285", maxWidth: 780 }}>
              Most travel platforms help you book hotels. Some help you book tours.
            </p>
            <p className="v2-font-heading" style={{ margin: "24px 0 0", fontWeight: 700, fontSize: "clamp(24px,3.4vw,36px)", lineHeight: 1.25, letterSpacing: "-.015em", color: "#FFFFFF", maxWidth: 840 }}>
              We wanted to build a place where travellers discover <span style={{ color: "#E9622F" }}>people before destinations</span> — where hosts become storytellers, and every journey creates genuine connection.
            </p>
            <p style={{ margin: "28px 0 0", font: "400 14.5px/1.65 var(--inter)", color: "#A89C8F", maxWidth: 540 }}>
              Nomadic Townies exists to make meaningful travel accessible, trustworthy, and unforgettable.
            </p>
          </div>
        </div>
      </section>

      {/* ===== 4 · HOW IT WORKS ===== */}
      <section id="v2-4" style={{ background: "#EFE7DA", padding: "clamp(70px,9vw,120px) clamp(20px,5vw,60px)" }}>
        <div style={{ maxWidth: 1180, margin: "0 auto", textAlign: "left" }}>
          <div style={{ maxWidth: 860, marginBottom: 48, textAlign: "left" }}>
            <div className="v2-font-heading" style={{ fontWeight: 800, fontSize: "clamp(64px,10vw,110px)", lineHeight: 0.85, color: "#E0D7C8", letterSpacing: "-.03em" }}>03</div>
            <div style={{ font: "700 12px/1 var(--inter)", letterSpacing: ".18em", textTransform: "uppercase", color: "#CF4A2C", marginTop: 12 }}>How it works</div>
            <h2 className="v2-font-heading" style={{ margin: "12px 0 0", fontWeight: 700, fontSize: "clamp(32px,4.8vw,52px)", lineHeight: 1.08, letterSpacing: "-.02em", color: "#221C17" }}>
              A marketplace built around people
            </h2>
            <p style={{ margin: "16px 0 0", font: "400 15px/1.65 var(--inter)", color: "#726A5E", maxWidth: 780 }}>
              Instead of creating every experience ourselves, we carefully curate passionate independent hosts. Our role is simple.
            </p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16 }}>
            {stepsData.map((st) => (
              <div key={st.n} className="v2-card" style={{ background: "#FFFDF9", border: "1px solid #E6DDCF", borderRadius: 18, padding: "24px 22px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span className="v2-font-heading" style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 34, height: 34, borderRadius: 10, background: "#221C17", color: "#F4EEE4", fontWeight: 700, fontSize: 14, textAlign: "center", lineHeight: "34px", flexShrink: 0 }}>
                    {st.n}
                  </span>
                  <span style={{ color: "#CF4A2C" }}>{st.icon}</span>
                </div>
                <h3 className="v2-font-heading" style={{ margin: "16px 0 0", fontWeight: 700, fontSize: 15.5, letterSpacing: "-.01em", color: "#221C17" }}>{st.title}</h3>
                <p style={{ margin: "7px 0 0", font: "400 13.5px/1.55 var(--inter)", color: "#726A5E" }}>{st.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== 5 · WHY NOMADIC TOWNIES ===== */}
      <section id="v2-5" style={{ background: "#F4EEE4", padding: "clamp(70px,9vw,120px) clamp(20px,5vw,60px)" }}>
        <div style={{ maxWidth: 1180, margin: "0 auto", textAlign: "left" }}>
          <div style={{ maxWidth: 860, marginBottom: 46, textAlign: "left" }}>
            <div className="v2-font-heading" style={{ fontWeight: 800, fontSize: "clamp(64px,10vw,110px)", lineHeight: 0.85, color: "#EAD9C9", letterSpacing: "-.03em" }}>04</div>
            <div style={{ font: "700 12px/1 var(--inter)", letterSpacing: ".18em", textTransform: "uppercase", color: "#CF4A2C", marginTop: 12 }}>Why Nomadic Townies</div>
            <h2 className="v2-font-heading" style={{ margin: "12px 0 0", fontWeight: 700, fontSize: "clamp(32px,4.8vw,52px)", lineHeight: 1.08, letterSpacing: "-.02em", color: "#221C17" }}>
              Why travel with us?
            </h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 18 }}>
            {pillarsData.map((p) => (
              <div key={p.title} className="v2-card" style={{ background: "#FFFDF9", border: "1px solid #E6DDCF", borderRadius: 20, padding: "30px 28px" }}>
                <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 54, height: 54, borderRadius: 16, background: "#F6E4DC", color: "#CF4A2C" }}>
                  {p.icon}
                </span>
                <h3 className="v2-font-heading" style={{ margin: "18px 0 0", fontWeight: 700, fontSize: 19, letterSpacing: "-.01em", color: "#221C17" }}>{p.title}</h3>
                <p style={{ margin: "9px 0 0", font: "400 14.5px/1.6 var(--inter)", color: "#726A5E" }}>{p.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== 6 · PHILOSOPHY ===== */}
      <section id="v2-6" style={{ position: "relative", padding: "clamp(80px,11vw,150px) clamp(20px,5vw,60px)", overflow: "hidden" }}>
        <img src={PHILOSOPHY_IMG} alt="Philosophy background" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(120deg, rgba(26,19,13,.92), rgba(44,38,32,.85))" }} />
        <div style={{ position: "relative", maxWidth: 900, margin: "0 auto", textAlign: "left" }}>
          <div style={{ textAlign: "left", marginBottom: 44 }}>
            <div style={{ font: "700 12px/1 var(--inter)", letterSpacing: ".18em", textTransform: "uppercase", color: "#F0B49C" }}>Our philosophy</div>
            <h2 className="v2-font-heading" style={{ margin: "12px 0 0", fontWeight: 700, fontSize: "clamp(32px,4.8vw,52px)", letterSpacing: "-.02em", color: "#F8F4ED" }}>
              We believe…
            </h2>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {beliefsData.map((b) => (
              <div key={b.n} style={{ display: "flex", alignItems: "center", gap: 16, padding: "20px 24px", background: "rgba(244,238,228,.06)", border: "1px solid rgba(244,238,228,.12)", borderRadius: 16, backdropFilter: "blur(4px)" }}>
                <span className="v2-font-heading" style={{ flex: "none", fontWeight: 700, fontSize: 18, color: "#E9622F", width: 30 }}>{b.n}</span>
                <p className="v2-font-heading" style={{ margin: 0, fontWeight: 500, fontSize: "clamp(17px,2.4vw,22px)", lineHeight: 1.35, letterSpacing: "-.01em", color: "#F4EEE4" }}>{b.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== 7 · MEET OUR HOSTS (DYNAMIC BACKEND HOSTS) ===== */}
      <section id="v2-7" style={{ background: "#EFE7DA", padding: "clamp(70px,9vw,120px) clamp(20px,5vw,60px)" }}>
        <div style={{ maxWidth: 1180, margin: "0 auto", textAlign: "left" }}>
          <div style={{ maxWidth: 860, marginBottom: 32, textAlign: "left" }}>
            <div className="v2-font-heading" style={{ fontWeight: 800, fontSize: "clamp(64px,10vw,110px)", lineHeight: 0.85, color: "#E0D7C8", letterSpacing: "-.03em" }}>05</div>
            <div style={{ font: "700 12px/1 var(--inter)", letterSpacing: ".18em", textTransform: "uppercase", color: "#CF4A2C", marginTop: 12 }}>Meet our hosts</div>
            <h2 className="v2-font-heading" style={{ margin: "12px 0 0", fontWeight: 700, fontSize: "clamp(32px,4.8vw,52px)", lineHeight: 1.08, letterSpacing: "-.02em", color: "#221C17" }}>
              The people behind every experience
            </h2>
            <p style={{ margin: "16px 0 0", font: "400 15px/1.65 var(--inter)", color: "#726A5E", maxWidth: 780 }}>
              Nomadic Townies is powered by passionate hosts — backpacking leaders, adventure enthusiasts, retreat facilitators, artists, photographers, storytellers, local experts and community builders. Each brings something unique. Together, they create experiences travellers never forget.
            </p>
          </div>

          {hostsLoading ? (
            <div style={{ font: "500 16px var(--inter)", color: "#726A5E", padding: "20px 0" }}>Loading verified hosts…</div>
          ) : dynamicHosts.length > 0 ? (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 18 }}>
              {dynamicHosts.slice(0, 8).map((h) => {
                const name = h?.hostTitle || h?.hostName || "Verified Host";
                const title = (Array.isArray(h?.specialties) && h.specialties[0]) || h?.hostTitle || "Experience Host";
                const loc = [h?.city, h?.state].filter(Boolean).join(", ") || h?.location || "India";
                const initial = name.trim()[0]?.toUpperCase() || "H";
                const img = h?.coverImage || h?.brandingLogo || DEFAULT_COVER;
                const slug = h?.seoSlug || h?._id;

                return (
                  <div key={h._id || name} className="v2-card" onClick={() => navigate(`/hosts/${slug}`)} style={{ background: "#FFFDF9", border: "1px solid #E6DDCF", borderRadius: 18, overflow: "hidden", cursor: "pointer" }}>
                    <div style={{ position: "relative" }}>
                      <img src={img} alt={name} style={{ width: "100%", height: 180, objectFit: "cover" }} />
                      <span style={{ position: "absolute", right: 12, top: 12, display: "inline-flex", alignItems: "center", gap: 5, padding: "5px 10px", borderRadius: 99, background: "rgba(34,28,23,.62)", color: "#A8E6BC", font: "700 10px/1 var(--inter)", letterSpacing: ".03em", textTransform: "uppercase" }}>
                        ✓ Verified
                      </span>
                      <span className="v2-font-heading" style={{ position: "absolute", left: 14, bottom: -20, width: 52, height: 52, borderRadius: 14, background: "linear-gradient(150deg,#E9622F,#CF4A2C)", border: "3px solid #FFFDF9", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 20, color: "#FFF6EF", textAlign: "center", lineHeight: "46px" }}>
                        {initial}
                      </span>
                    </div>
                    <div style={{ padding: "28px 18px 20px" }}>
                      <div className="v2-font-heading" style={{ fontWeight: 700, fontSize: 17, color: "#221C17" }}>{name}</div>
                      <div style={{ marginTop: 3, font: "500 13px/1.3 var(--inter)", color: "#CF4A2C" }}>{title}</div>
                      <div style={{ marginTop: 10, display: "flex", alignItems: "center", gap: 6, font: "400 13px/1 var(--inter)", color: "#8A8073" }}>
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#A89C8A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" /><circle cx="12" cy="10" r="3" /></svg> {loc}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div style={{ font: "500 15px var(--inter)", color: "#726A5E" }}>Discover our growing community of hosts across India.</div>
          )}

          <div style={{ marginTop: 40 }}>
            <button type="button" className="v2-cta" onClick={() => navigate("/hosts")} style={{ padding: "15px 30px", font: "700 15px/1 var(--inter)", color: "#fff", background: "#CF4A2C", border: "none", borderRadius: 12, cursor: "pointer", boxShadow: "0 8px 20px rgba(207,74,44,.26)" }}>
              Meet all hosts →
            </button>
          </div>
        </div>
      </section>

      {/* ===== 8 · VISION ===== */}
      <section id="v2-8" style={{ position: "relative", padding: "clamp(90px,12vw,170px) clamp(20px,5vw,60px)", overflow: "hidden", background: "#1a130d" }}>
        <img src={VISION_IMG} alt="Vision background" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", opacity: 0.35 }} />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(160deg, rgba(26,19,13,.86), rgba(26,19,13,.92))" }} />
        <div style={{ position: "relative", maxWidth: 840, margin: "0 auto", textAlign: "center" }}>
          <div style={{ font: "700 12px/1 var(--inter)", letterSpacing: ".16em", textTransform: "uppercase", color: "#F0B49C" }}>Where we&apos;re heading</div>
          <h2 className="v2-font-heading" style={{ margin: "18px 0 0", fontWeight: 700, fontSize: "clamp(30px,5.4vw,56px)", lineHeight: 1.06, letterSpacing: "-.02em", color: "#F8F4ED" }}>
            We&apos;re building more than a travel platform.
          </h2>
          <p style={{ margin: "24px auto 0", maxWidth: 640, font: "400 clamp(16px,2vw,19px)/1.7 var(--inter)", color: "#C9BFAE" }}>
            A global marketplace where travellers discover trusted hosts offering meaningful experiences anywhere in the world. As we grow, our goal stays unchanged: help people experience the world through genuine human connections.
          </p>
        </div>
      </section>

      {/* ===== 9 · BY THE NUMBERS ===== */}
      <section id="v2-9" style={{ background: "#F4EEE4", padding: "clamp(60px,9vw,110px) clamp(20px,5vw,60px)" }}>
        <div style={{ maxWidth: 1080, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 44 }}>
            <div style={{ font: "700 12px/1 var(--inter)", letterSpacing: ".16em", textTransform: "uppercase", color: "#CF4A2C" }}>By the numbers</div>
            <h2 className="v2-font-heading" style={{ margin: "14px 0 0", fontWeight: 700, fontSize: "clamp(26px,4vw,40px)", letterSpacing: "-.02em", color: "#221C17" }}>
              A community just getting started
            </h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16 }}>
            {numbersData.map((n) => (
              <div key={n.label} style={{ textAlign: "center", padding: "32px 20px", background: "#FFFDF9", border: "1px solid #E6DDCF", borderRadius: 18 }}>
                <div className="v2-font-heading" style={{ fontWeight: 700, fontSize: "clamp(28px,3.6vw,40px)", letterSpacing: "-.02em", color: "#CF4A2C" }}>{n.value}</div>
                <div style={{ marginTop: 8, font: "600 13.5px/1.35 var(--inter)", color: "#5A5247" }}>{n.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== 10 · FINAL CTA ===== */}
      <section id="v2-10" style={{ position: "relative", padding: "clamp(80px,11vw,150px) clamp(20px,5vw,60px)", background: "#CF4A2C", overflow: "hidden" }}>
        <div style={{ position: "absolute", left: "-100px", top: "-100px", width: 360, height: 360, borderRadius: "50%", background: "radial-gradient(circle, rgba(255,255,255,.14), transparent 66%)" }} />
        <div style={{ position: "absolute", right: "-120px", bottom: "-120px", width: 420, height: 420, borderRadius: "50%", background: "radial-gradient(circle, rgba(34,28,23,.24), transparent 68%)" }} />
        <div style={{ position: "relative", maxWidth: 760, margin: "0 auto", textAlign: "center" }}>
          <h2 className="v2-font-heading" style={{ margin: 0, fontWeight: 700, fontSize: "clamp(32px,5.6vw,58px)", lineHeight: 1.04, letterSpacing: "-.02em", color: "#FFF6EF" }}>
            Come be part of the story
          </h2>
          <p style={{ margin: "22px auto 0", maxWidth: 560, font: "400 clamp(16px,2vw,18px)/1.7 var(--inter)", color: "#FBE6DD" }}>
            Whether you&apos;re looking for your next unforgettable journey or ready to share your own experiences with the world, there&apos;s a place for you at Nomadic Townies.
          </p>
          <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap", marginTop: 32 }}>
            <button type="button" onClick={() => navigate("/experiences")} style={{ padding: "15px 30px", font: "700 15px/1 var(--inter)", color: "#CF4A2C", background: "#FFF6EF", border: "none", borderRadius: 12, cursor: "pointer" }}>
              Explore experiences
            </button>
            <button type="button" className="v2-ghost" onClick={() => setOpenHostModal(true)} style={{ padding: "15px 30px", font: "700 15px/1 var(--inter)", color: "#FFF6EF", background: "transparent", border: "1.5px solid rgba(255,246,239,.5)", borderRadius: 12, cursor: "pointer" }}>
              Become a host
            </button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default AboutUs;
