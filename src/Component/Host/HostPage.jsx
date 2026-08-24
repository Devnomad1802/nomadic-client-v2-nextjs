"use client";

/* eslint-disable react/prop-types */
import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import "./hostPage.css";
import Footer from "../Footer";
import HostGallery from "./HostGallery";
import { useSelector } from "react-redux";
import { setActiveChatConvo } from "../../utils/chatUiState";
import {
  useStartHostChatMutation,
  useGetMyHostChatsMutation,
  useSendHostChatMessageMutation,
  useMarkHostChatReadMutation,
} from "../../services";
import {
  useGetHostByIdQuery,
  useGetHostTripsQuery,
  useGetReviewsByHostIdQuery,
  useGetAllHostsQuery,
  useAddUserReviewMutation,
} from "../../services";

/* ---------------- helpers ---------------- */
const initialOf = (s) => (s ? s.trim()[0]?.toUpperCase() : "H");

const slugify = (str) =>
  String(str || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

const cleanHostSlug = (str) =>
  String(str || "")
    .replace(/^\/?hosts?\//i, "")
    .replace(/^\//, "")
    .trim();

// Chat time helpers — always the viewer's local timezone.
const msgTime = (ts) => {
  if (!ts) return "";
  const d = new Date(ts);
  return isNaN(d) ? "" : d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
};
const dayKey = (ts) => { const d = new Date(ts); return isNaN(d) ? "" : d.toDateString(); };
const dayLabel = (ts) => {
  const d = new Date(ts);
  if (isNaN(d)) return "";
  const today = new Date();
  const y = new Date(); y.setDate(today.getDate() - 1);
  if (d.toDateString() === today.toDateString()) return "Today";
  if (d.toDateString() === y.toDateString()) return "Yesterday";
  return d.toLocaleDateString([], { month: "long", day: "numeric", year: "numeric" });
};
const firstNameOf = (s, fallback) => (s ? s.split(" ")[0] : fallback);
const fmtDate = (d) => {
  if (!d) return "";
  try {
    return new Date(d).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return "";
  }
};
const starStr = (n) => {
  const r = Math.max(0, Math.min(5, Math.round(Number(n) || 0)));
  return "★".repeat(r) + "☆".repeat(5 - r);
};

// Decimal-accurate star row: each star fills 0–100% by the fractional rating,
// so 4.4 → four full + one 40%-filled star. Synchronised with the numeric value.
const StarRow = ({ value = 0, size = 16, dim = "#E0D8CB", gold = "#F5B301" }) => {
  const v = Math.max(0, Math.min(5, Number(value) || 0));
  return (
    <span style={{ display: "inline-flex", gap: 2, lineHeight: 1 }} aria-label={`${v.toFixed(1)} out of 5`}>
      {[0, 1, 2, 3, 4].map((i) => {
        const fill = Math.max(0, Math.min(1, v - i));
        return (
          <span key={i} style={{ position: "relative", width: size, height: size, fontSize: size, lineHeight: 1, display: "inline-block" }}>
            <span style={{ position: "absolute", inset: 0, color: dim }}>★</span>
            <span style={{ position: "absolute", inset: 0, width: `${fill * 100}%`, overflow: "hidden", color: gold, whiteSpace: "nowrap" }}>★</span>
          </span>
        );
      })}
    </span>
  );
};
const tripImg = (t) =>
  t?.Banner_Image || t?.cardImage || t?.bannerImage || t?.image || "";

/* ---------------- inline icons (match design) ---------------- */
const IcCheck = ({ s = 19, w = 3, c = "currentColor" }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth={w} strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5" /></svg>
);
const IcPin = ({ c = "#F0B49C" }) => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" /><circle cx="12" cy="10" r="3" /></svg>
);
const IcCal = ({ c = "#F0B49C" }) => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4.5" width="18" height="16" rx="2.5" /><path d="M3 9.5h18M8 2.5v4M16 2.5v4" /></svg>
);
const IcTrophy = ({ c = "#F0B49C", s = 15 }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9V2h12v7a6 6 0 0 1-12 0Z" /><path d="M6 5H3v2a3 3 0 0 0 3 3M18 5h3v2a3 3 0 0 1-3 3M9 18h6M10 22h4M12 15v3" /></svg>
);
const IcGlobe = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#CF4A2C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3a14 14 0 0 1 0 18 14 14 0 0 1 0-18Z" /></svg>
);
const IcPinSm = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#CF4A2C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" /><circle cx="12" cy="10" r="3" /></svg>
);
const IcChat = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-8.5 8.5 8.5 8.5 0 0 1-3.8-.9L3 21l1.9-5.7a8.5 8.5 0 0 1-.9-3.8A8.38 8.38 0 0 1 12.5 3 8.38 8.38 0 0 1 21 11.5Z" /></svg>
);
const IcBox = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 7l9-4 9 4-9 4-9-4Z" /><path d="M3 7v10l9 4 9-4V7" /></svg>
);
const IcLock = ({ c = "#CF4A2C", s = 16 }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flex: "none", marginTop: 1 }}><rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
);

/* ---- verification-badge icons (keyword → meaning-matched glyph) ---- */
const BADGE_PATHS = {
  verified: <><path d="M12 2 4 5v6c0 5 3.4 8.5 8 11 4.6-2.5 8-6 8-11V5l-8-3Z" /><path d="m9 12 2 2 4-4" /></>,
  shield: <><path d="M12 2 4 5v6c0 5 3.4 8.5 8 11 4.6-2.5 8-6 8-11V5l-8-3Z" /></>,
  certificate: <><circle cx="12" cy="9" r="5" /><path d="M9 13.5 7.5 22l4.5-2.6L16.5 22 15 13.5" /></>,
  award: <><circle cx="12" cy="8" r="5" /><path d="M8.5 12 7 22l5-3 5 3-1.5-10" /></>,
  trophy: <><path d="M6 9V3h12v6a6 6 0 0 1-12 0Z" /><path d="M6 5H3v2a3 3 0 0 0 3 3M18 5h3v2a3 3 0 0 1-3 3M9 18h6M10 22h4M12 15v3" /></>,
  star: <><path d="M12 3l2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 16.9 6.8 19l1-5.8L3.5 9.1l5.9-.9L12 3Z" /></>,
  firstaid: <><rect x="3" y="6" width="18" height="14" rx="2" /><path d="M9 6V4h6v2M12 11v4M10 13h4" /></>,
  mountain: <><path d="M3 20h18L14 7l-3.5 6L8 9l-5 11Z" /></>,
  camera: <><rect x="3" y="7" width="18" height="13" rx="2" /><path d="M8 7l1.5-3h5L16 7" /><circle cx="12" cy="13.5" r="3.5" /></>,
  leaf: <><path d="M4 20c0-9 7-15 16-15 0 9-6 15-15 15H4Z" /><path d="M4 20c4-6 8-9 13-11" /></>,
  language: <><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3a14 14 0 0 1 0 18 14 14 0 0 1 0-18Z" /></>,
  clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>,
};
const BADGE_TONES = {
  green: { bg: "#E0EFE4", color: "#2E7D4F" },
  terracotta: { bg: "#F6E4DC", color: "#CF4A2C" },
  gold: { bg: "#FBEFD6", color: "#C8941E" },
};
const toneForBadge = (icon) =>
  icon === "verified" || icon === "shield" || icon === "leaf"
    ? "green"
    : icon === "award" || icon === "trophy" || icon === "star"
    ? "gold"
    : "terracotta";
const BadgeIcon = ({ name }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    {BADGE_PATHS[name] || BADGE_PATHS.certificate}
  </svg>
);

const FAQS = [
  { q: "Is this suitable for beginners?", a: "Most trips welcome beginners — each listing notes the difficulty. If you're new, the host suggests gentler routes and helps you prepare." },
  { q: "Can solo travellers join?", a: "Absolutely. Many travellers come solo and leave with a whole group of friends — the small group size makes it easy to connect." },
  { q: "What fitness level is required?", a: "A basic level of fitness helps as trips involve walking at altitude. Each experience lists the expected fitness level." },
  { q: "How do I book or enquire?", a: "Use Send message to chat with the host right here on Nomadic Townies. They'll help you pick the right trip and dates." },
];

const HostPage = ({ initialHost, initialTrips, initialReviews, initialAllHosts }) => {
  const params = useParams();
  const slugOrId = params.slug || params.id;
  const navigate = useNavigate();
  const id = initialHost?._id || slugOrId;

  const { data, isLoading: queryLoading } = useGetHostByIdQuery(id, { skip: !id || !!initialHost });
  const { data: tripsRes } = useGetHostTripsQuery(id, { skip: !id || !!initialTrips });
  const { data: reviewsRes } = useGetReviewsByHostIdQuery(id, { skip: !id || !!initialReviews });
  const { data: allHostsRes } = useGetAllHostsQuery(undefined, { skip: !!initialAllHosts });
  const [addUserReview, { isLoading: submitting }] = useAddUserReviewMutation();

  const host = initialHost || data?.data || data || {};

  const trips = useMemo(
    () => {
      if (initialTrips) return initialTrips;
      return (Array.isArray(tripsRes?.data) ? tripsRes.data : Array.isArray(tripsRes) ? tripsRes : []);
    },
    [tripsRes, initialTrips]
  );
  const reviews = useMemo(() => {
    if (initialReviews) return initialReviews;
    const r = reviewsRes?.data ?? reviewsRes?.reviews ?? reviewsRes ?? [];
    return Array.isArray(r) ? r : [];
  }, [reviewsRes, initialReviews]);
  const similar = useMemo(() => {
    const list = initialAllHosts || (Array.isArray(allHostsRes?.data) ? allHostsRes.data : Array.isArray(allHostsRes) ? allHostsRes : []);
    return list.filter((h) => h?._id !== host?._id).slice(0, 3);
  }, [allHostsRes, initialAllHosts, host?._id]);

  const isLoading = (initialHost && initialTrips && initialReviews && initialAllHosts) ? false : queryLoading;

  /* ---- derived host fields ---- */
  const name = host?.hostTitle || host?.hostName || "Travel Host";
  const firstName = firstNameOf(host?.hostName, name);
  const initial = initialOf(host?.hostTitle || host?.hostName);
  const location = [host?.city, host?.state].filter(Boolean).join(", ") || host?.location || host?.hqLocation || "";
  const verified = host?.isVerified || host?.status === "approved";

  const hasReviews = reviews.length > 0;
  const avgRating = hasReviews
    ? reviews.reduce((a, r) => a + (Number(r.rating) || 0), 0) / reviews.length
    : 0;
  const ratingStr = hasReviews ? avgRating.toFixed(1) : "No ratings yet";

  const rawExp = host?.experience || (host?.foundedYear ? `${Math.max(1, new Date().getFullYear() - parseInt(host.foundedYear, 10))}` : "");
  const years = rawExp ? (/^\d+$/.test(`${rawExp}`.trim()) ? `${`${rawExp}`.trim()} yrs` : rawExp) : "—";

  const specialties = Array.isArray(host?.specialties) ? host.specialties.filter(Boolean) : [];
  const languages = Array.isArray(host?.languages) ? host.languages.filter(Boolean) : [];
  const gallery = Array.isArray(host?.gallery) ? host.gallery.filter(Boolean) : [];
  const reels = Array.isArray(host?.reels) ? host.reels.filter((r) => r && r.videoUrl) : [];

  // Ask the host: prefer admin-managed FAQs, fall back to generic defaults
  const faqs = useMemo(() => {
    const fromHost = Array.isArray(host?.faqs)
      ? host.faqs
          .filter((f) => f && (f.question || f.q))
          .map((f) => ({ q: f.question || f.q, a: f.answer || f.a }))
      : [];
    return fromHost.length ? fromHost : FAQS;
  }, [host?.faqs]);

  // regions: prefer explicit field, fall back to unique hosted-trip locations
  const regions = useMemo(() => {
    const explicit = Array.isArray(host?.regionsHosted) ? host.regionsHosted.filter(Boolean) : [];
    if (explicit.length) return explicit;
    const fromTrips = [...new Set(trips.map((t) => t?.location).filter(Boolean))];
    return fromTrips.slice(0, 6);
  }, [host?.regionsHosted, trips]);

  const tripsHosted = host?.tripsHosted ?? trips.length ?? 0;
  const travellersHosted = host?.travellersHosted ? Number(host.travellersHosted).toLocaleString("en-IN") : "—";
  const successRate = Number(host?.successRate) || 0;
  const responseRate = Number(host?.responseRate) || 0;
  const responseTime = host?.responseTimeLabel || "within a day";
  const memberSince = host?.foundedYear || (host?.createdAt ? new Date(host.createdAt).getFullYear() : "");
  const rankLabel = successRate >= 95 || verified ? "Top-rated host" : "Trusted host";

  // verification badges: prefer admin-managed list, else derive from existing data
  const badges = useMemo(() => {
    const custom = Array.isArray(host?.verificationBadges)
      ? host.verificationBadges
          .filter((b) => b && (b.title || b.label))
          .map((b) => ({ title: b.title || b.label, sub: b.subtitle || b.sub || "", icon: b.icon || "verified" }))
      : [];
    if (custom.length) return custom;
    const certifications = Array.isArray(host?.achievements) ? host.achievements.filter(Boolean) : [];
    const out = [];
    if (verified) out.push({ icon: "verified", title: "ID verified", sub: "Confirmed by Nomadic Townies" });
    certifications.slice(0, 3).forEach((c) => out.push({ icon: "certificate", title: c, sub: "Certified" }));
    if (successRate >= 95) out.push({ icon: "award", title: "Top-rated host", sub: "Top 5% of hosts" });
    return out;
  }, [host?.verificationBadges, verified, host?.achievements, successRate]);

  // rating distribution bars
  const ratingBars = useMemo(() => {
    const counts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    reviews.forEach((r) => {
      const k = Math.max(1, Math.min(5, Math.round(Number(r.rating) || 0)));
      counts[k] += 1;
    });
    const total = reviews.length || 1;
    return [5, 4, 3, 2, 1].map((stars) => ({
      stars,
      count: counts[stars],
      pct: `${Math.round((counts[stars] / total) * 100)}%`,
    }));
  }, [reviews]);

  /* ---- write-review form ---- */
  const [rRating, setRRating] = useState(0);
  const [rName, setRName] = useState("");
  const [rText, setRText] = useState("");
  const [rDone, setRDone] = useState(false);
  const [rErr, setRErr] = useState("");
  const submitReview = async (e) => {
    e.preventDefault();
    setRErr("");
    try {
      await addUserReview({
        hostId: id,
        name: rName,
        rating: rRating || 5,
        review: rText,
        tripName: "",
        date: new Date().toISOString(),
      }).unwrap();
      setRDone(true);
      setRName("");
      setRText("");
      setRRating(0);
    } catch {
      setRErr("Couldn't submit your review just now. Please try again.");
    }
  };

  /* ---- chat drawer (live platform chat) ---- */
  const { userDbData } = useSelector((store) => store.global) || {};
  const [chatOpen, setChatOpen] = useState(false);
  const [convo, setConvo] = useState(null); // Enquire doc for me + this host
  const [chatText, setChatText] = useState("");
  const [chatWarn, setChatWarn] = useState("");
  const [chatSending, setChatSending] = useState(false);
  const chatEndRef = useRef(null);
  const [startHostChat] = useStartHostChatMutation();
  const [getMyHostChats] = useGetMyHostChatsMutation();
  const [sendHostChatMessage] = useSendHostChatMessageMutation();
  const [markHostChatRead] = useMarkHostChatReadMutation();

  const openChat = async () => {
    setChatOpen(true);
    setChatWarn("");
    if (!userDbData?._id || !host?._id) return;
    try {
      const res = await getMyHostChats().unwrap();
      const mine = (res?.data || []).find((c) => `${c.hostId}` === `${host._id}`);
      if (mine) {
        setConvo(mine);
        if (mine.userUnread > 0) markHostChatRead({ id: mine._id }).catch(() => {});
      }
    } catch { /* not logged in / offline — composer still shows */ }
  };
  const closeChat = () => { setChatOpen(false); setActiveChatConvo(null); };

  const [searchParams, setSearchParams] = useSearchParams();
  const chatInputRef = useRef(null);
  const tripsSectionRef = useRef(null);

  const handleViewTrips = () => {
    if (trips.length === 1) {
      const singleTrip = trips[0];
      const destSlug = slugify(singleTrip.location || singleTrip.destination || "trip");
      navigate(`/trips/${destSlug}/${singleTrip.seoSlug || singleTrip._id}`);
    } else if (trips.length > 1) {
      const activeSlug = host?.seoSlug ? host.seoSlug.replace(/^\/?hosts?\//i, "").replace(/^\//, "") : id;
      navigate(`/trips/${activeSlug}`);
    } else if (tripsSectionRef.current) {
      tripsSectionRef.current?.scrollIntoView({ behavior: "smooth" });
    }
    window.scrollTo(0, 0);
  };

  useEffect(() => {
    if (searchParams.get("chat") === "1" && host?._id && !chatOpen) {
      openChat();
      searchParams.delete("chat");
      setSearchParams(searchParams, { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, host?._id]);

  useEffect(() => {
    if (!isLoading && searchParams.get("tab") === "experiences") {
      if (trips.length === 1) {
        const singleTrip = trips[0];
        const destSlug = slugify(singleTrip.location || singleTrip.destination || "trip");
        navigate(`/trips/${destSlug}/${singleTrip.seoSlug || singleTrip._id}`, { replace: true });
      } else if (trips.length > 1) {
        const activeSlug = host?.seoSlug ? host.seoSlug.replace(/^\/?hosts?\//i, "").replace(/^\//, "") : id;
        navigate(`/trips/${activeSlug}`, { replace: true });
      } else if (tripsSectionRef.current) {
        setTimeout(() => {
          tripsSectionRef.current?.scrollIntoView({ behavior: "smooth" });
        }, 150);
      }
    }
  }, [isLoading, searchParams, trips, host, id, navigate]);

  // Focus the composer + jump to the newest message whenever the drawer opens.
  useEffect(() => {
    if (!chatOpen) return;
    const t = setTimeout(() => {
      chatInputRef.current?.focus();
      chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 200);
    return () => clearTimeout(t);
  }, [chatOpen, convo?._id]);

  // Publish the on-screen conversation so the global notifier stays quiet for it.
  useEffect(() => {
    setActiveChatConvo(chatOpen && convo?._id ? String(convo._id) : null);
    return () => setActiveChatConvo(null);
  }, [chatOpen, convo?._id]);

  // Poll while the drawer is open so host replies appear without refresh.
  useEffect(() => {
    if (!chatOpen || !userDbData?._id || !host?._id) return undefined;
    const iv = setInterval(async () => {
      try {
        const res = await getMyHostChats().unwrap();
        const mine = (res?.data || []).find((c) => `${c.hostId}` === `${host._id}`);
        if (mine) {
          setConvo((prev) => {
            const grew = (mine.chat?.length || 0) > (prev?.chat?.length || 0);
            if (grew) setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: "smooth" }), 60);
            return mine;
          });
          if (mine.userUnread > 0) markHostChatRead({ id: mine._id }).catch(() => {});
        }
      } catch { /* next tick */ }
    }, 5000);
    return () => clearInterval(iv);
  }, [chatOpen, userDbData?._id, host?._id, getMyHostChats, markHostChatRead]);

  const sendChat = async () => {
    const text = chatText.trim();
    if (!text || chatSending) return;
    if (!userDbData?._id) { setChatWarn("Please log in to message this host."); return; }
    setChatSending(true);
    setChatWarn("");
    try {
      const res = convo?._id
        ? await sendHostChatMessage({ id: convo._id, message: text }).unwrap()
        : await startHostChat({ hostId: host._id, message: text }).unwrap();
      setConvo(res?.data || convo);
      setChatText("");
      setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: "smooth" }), 60);
    } catch (err) {
      setChatWarn(err?.data?.error || err?.data?.message || "Couldn't send your message. Please try again.");
    } finally {
      setChatSending(false);
    }
  };

  /* ---- chat esc-to-close (gallery owns its own lightbox) ---- */
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") setChatOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const seoTitle = `${name} | Travel Host | Nomadic Townies`;
  const seoDesc = host?.tagline
    ? `${host.tagline} — discover host-led experiences with ${name} on Nomadic Townies.`
    : `Discover host-led community trips, retreats and cultural immersions with ${name} on Nomadic Townies.`;

  if (!id || isLoading) {
    return <div className="hd-page"><div className="hd-loading">Loading host…</div></div>;
  }

  const activeSlug = host?.seoSlug || host?._id || slugOrId;

  return (
    <div className="hd-page">
      <Helmet>
        <title>{seoTitle}</title>
        <meta name="description" content={seoDesc} />
        <link rel="canonical" href={`https://www.nomadictownies.com/hosts/${activeSlug}`} />
        <meta property="og:type" content="profile" />
        <meta property="og:title" content={seoTitle} />
        <meta property="og:description" content={seoDesc} />
        {host?.coverImage || host?.brandingLogo ? <meta property="og:image" content={host.coverImage || host.brandingLogo} /> : null}
      </Helmet>

      {/* ---------- breadcrumb sub-header ---------- */}
      <header className="hd-topbar">
        <div className="hd-topbar-inner">
          <button type="button" className="hd-back" aria-label="Go back" onClick={() => navigate(-1)}>←</button>
          <div className="hd-crumb">
            <a onClick={() => navigate("/")}>Home</a><span>›</span>
            <a onClick={() => navigate("/hosts")}>Hosts</a><span>›</span>
            <span className="cur">{name}</span>
          </div>
        </div>
      </header>

      {/* ---------- hero banner ---------- */}
      <section className={`hd-hero${host?.coverImage ? " has-cover" : ""}`}>
        {host?.coverImage ? (
          <img className="hd-hero-img" src={host.coverImage} alt={`${name} cover`} />
        ) : (
          <>
            <div className="hd-hero-stripe" />
            <div className="hd-hero-glow" />
          </>
        )}
        <div className="hd-hero-scrim" />
        <div className="hd-hero-inner">
          <div className="hd-avatar">
            <div className="hd-avatar-inner">
              {host?.brandingLogo ? <img src={host.brandingLogo} alt={name} /> : initial}
            </div>
            {verified && <span className="hd-avatar-badge"><IcCheck s={19} /></span>}
          </div>

          <div className="hd-identity">
            <div className="hd-namerow">
              <h1 className="hd-name">{name}</h1>
              {verified && <span className="hd-verified-pill"><IcCheck s={13} /> Verified host</span>}
            </div>
            {host?.tagline && <p className="hd-hero-tag">&ldquo;{host.tagline}&rdquo;</p>}
            <div className="hd-hero-meta">
              {location && <span><IcPin /> {location}</span>}
              {memberSince && <span><IcCal /> Since {memberSince}</span>}
              <span><IcTrophy /> {rankLabel}</span>
            </div>
          </div>

          <div className="hd-hero-stats">
            <div className="hd-hs">
              <div className="hd-hs-stars"><StarRow value={avgRating} size={17} dim="rgba(244,238,228,.3)" /></div>
              <div className="hd-hs-num">{hasReviews ? avgRating.toFixed(1) : "New"}</div>
              <div className="hd-hs-label">{hasReviews ? "Rating" : "No ratings yet"}</div>
            </div>
            <div className="hd-hs">
              <div className="hd-hs-num gap">{tripsHosted}</div>
              <div className="hd-hs-label">Trips hosted</div>
            </div>
            <div className="hd-hs">
              <div className="hd-hs-num gap">{successRate}%</div>
              <div className="hd-hs-label">Rebook rate</div>
            </div>
          </div>
        </div>
      </section>

      {/* ---------- stat strip ---------- */}
      <div className="hd-strip-wrap">
        <div className="hd-strip">
          <div className="hd-strip-cell"><div className="hd-strip-num">{tripsHosted}</div><div className="hd-strip-label">Trips hosted</div></div>
          <div className="hd-strip-cell"><div className="hd-strip-num">{travellersHosted}</div><div className="hd-strip-label">Travellers hosted</div></div>
          <div className="hd-strip-cell"><div className="hd-strip-num">{hasReviews ? <><span className="star">★</span> {avgRating.toFixed(1)}</> : "New"}</div><div className="hd-strip-label">{hasReviews ? `${reviews.length} review${reviews.length > 1 ? "s" : ""}` : "No ratings yet"}</div></div>
          <div className="hd-strip-cell"><div className="hd-strip-num">{years}</div><div className="hd-strip-label">Experience</div></div>
        </div>
      </div>

      {/* ---------- main grid ---------- */}
      <div className="hd-grid">
        {/* ===== main column ===== */}
        <div className="hd-col-main">
          {/* about */}
          <section className="hd-card">
            <h2>About {firstName}</h2>
            {host?.hostOverview
              ? <p className="hd-about-p">{host.hostOverview}</p>
              : <p className="hd-about-p" style={{ color: "#8A8073" }}>This host hasn&apos;t added an overview yet.</p>}
            {host?.tagline && <div className="hd-quote">&ldquo;{host.tagline}&rdquo;</div>}
          </section>

          {/* verification & badges */}
          {badges.length > 0 && (
            <section className="hd-card">
              <h2>Verification &amp; badges</h2>
              <div className="hd-badges">
                {badges.map((b, i) => {
                  const tone = BADGE_TONES[toneForBadge(b.icon)];
                  return (
                    <div className="hd-badge" key={i}>
                      <span className="hd-badge-ic" style={{ background: tone.bg, color: tone.color }}>
                        <BadgeIcon name={b.icon} />
                      </span>
                      <span className="hd-badge-txt">
                        <span className="hd-badge-tt">{b.title}</span>
                        {b.sub && <span className="hd-badge-sub">{b.sub}</span>}
                      </span>
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {/* expertise, languages, regions */}
          {(specialties.length > 0 || languages.length > 0 || regions.length > 0) && (
            <section className="hd-card">
              <h2>Expertise &amp; travel style</h2>
              {specialties.length > 0 && (
                <div className="hd-chips" style={{ marginTop: 16 }}>
                  {specialties.map((s) => <span key={s} className="hd-chip-fill">{s}</span>)}
                </div>
              )}
              {languages.length > 0 && (
                <>
                  <div className="hd-sublabel">Languages</div>
                  <div className="hd-chips">
                    {languages.map((l) => <span key={l} className="hd-chip-out"><IcGlobe /> {l}</span>)}
                  </div>
                </>
              )}
              {regions.length > 0 && (
                <>
                  <div className="hd-sublabel">Regions hosted</div>
                  <div className="hd-chips">
                    {regions.map((r) => <span key={r} className="hd-chip-out"><IcPinSm /> {r}</span>)}
                  </div>
                </>
              )}
            </section>
          )}

          {/* hosted trips */}
          <section className="hd-card" ref={tripsSectionRef}>
            <div className="hd-section-head">
              <h2>Trips by {firstName}</h2>
              {trips.length > 0 && <span className="hd-chip-fill" style={{ cursor: "pointer" }} onClick={() => navigate("/experiences")}>View all trips</span>}
            </div>
            {trips.length > 0 ? (
              <div className="hd-trips">
                {trips.map((t) => (
                  <a key={t._id} className="hd-trip" onClick={() => navigate(`/trips/${t.seoSlug || t._id}`)}>
                    <div className="hd-trip-img">
                      {tripImg(t) && <img src={tripImg(t)} alt={t.title} loading="lazy" />}
                      <div className="hd-trip-rate"><span className="s">★</span><span className="n">{(Number(t.rating) || avgRating).toFixed(1)}</span></div>
                    </div>
                    <div className="hd-trip-b">
                      <div className="hd-trip-t">{t.title}</div>
                      {t.location && <div className="hd-trip-loc"><IcPinSm /> {t.location}</div>}
                      <div className="hd-trip-foot">
                        <span className="hd-trip-price">₹ {parseInt(t.price || t.firstBookingPrice || 0, 10).toLocaleString("en-IN")}</span>
                        {(t.days || t.nights) && <span className="hd-trip-dur">{t.days}D{t.nights ? ` / ${t.nights}N` : ""}</span>}
                      </div>
                    </div>
                  </a>
                ))}
              </div>
            ) : (
              <p className="hd-about-p" style={{ color: "#8A8073" }}>No active trips right now — check back soon.</p>
            )}
          </section>

          {/* reviews */}
          <section className="hd-card">
            <h2>Traveller reviews</h2>
            <div className="hd-rev-summary">
              <div style={{ textAlign: "center" }}>
                <div className="hd-rev-big">{hasReviews ? avgRating.toFixed(1) : "—"}</div>
                <div className="hd-rev-stars"><StarRow value={avgRating} size={18} /></div>
                <div className="hd-rev-count">{hasReviews ? `${reviews.length} review${reviews.length > 1 ? "s" : ""}` : "No ratings yet"}</div>
              </div>
              <div className="hd-bars">
                {ratingBars.map((bar) => (
                  <div className="hd-bar" key={bar.stars}>
                    <span className="hd-bar-k">{bar.stars}★</span>
                    <span className="hd-bar-track"><span className="hd-bar-fill" style={{ width: bar.pct }} /></span>
                    <span className="hd-bar-c">{bar.count}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="hd-rev-list">
              {reviews.length > 0 ? reviews.slice(0, 6).map((rv, i) => (
                <div className="hd-review" key={rv._id || i}>
                  <div className="hd-review-head">
                    <span className="hd-review-av">{rv.profileImage ? <img src={rv.profileImage} alt="" /> : initialOf(rv.name || rv.Name)}</span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div className="hd-review-name">{rv.name || rv.Name || "Traveller"}</div>
                      <div className="hd-review-date">{fmtDate(rv.date || rv.Date || rv.createdAt)}</div>
                    </div>
                    <span className="hd-review-stars">{starStr(rv.rating)}</span>
                  </div>
                  {(rv.tripName || rv.Title) && <span className="hd-review-trip">{rv.tripName || rv.Title}</span>}
                  <p className="hd-review-text">{rv.review || rv.Review || rv.comment}</p>
                </div>
              )) : <div className="hd-empty">No reviews yet — be the first to share your experience.</div>}
            </div>

            {/* write review (preserves existing functionality) */}
            <div className="hd-wr">
              <h4>Write a review</h4>
              {rDone ? (
                <p className="ok">Thanks! Your review has been submitted.</p>
              ) : (
                <form onSubmit={submitReview}>
                  <div className="hd-stars-pick">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <i key={n} className={n <= rRating ? "on" : ""} onClick={() => setRRating(n)} role="button" aria-label={`${n} star`}>★</i>
                    ))}
                  </div>
                  <input placeholder="Your name" value={rName} onChange={(e) => setRName(e.target.value)} required />
                  <textarea placeholder="Share your experience travelling with this host…" value={rText} onChange={(e) => setRText(e.target.value)} required />
                  {rErr && <p className="err">{rErr}</p>}
                  <button type="submit" className="hd-cta" style={{ width: "auto", padding: "12px 22px" }} disabled={submitting}>{submitting ? "Submitting…" : "Submit review"}</button>
                </form>
              )}
            </div>
          </section>

          {/* gallery — Design 1B (reels rail + photo grid) */}
          <HostGallery photos={gallery} reels={reels} firstName={firstName} />

          {/* faq */}
          <section className="hd-card">
            <h2>Ask the host</h2>
            <div className="hd-faq-list">
              {faqs.map((f, i) => (
                <details className="hd-faq" key={i} open={i === 0}>
                  <summary>{f.q}<span className="hd-faq-ic">+</span></summary>
                  <div className="hd-faq-a">{f.a}</div>
                </details>
              ))}
            </div>
          </section>
        </div>

        {/* ===== sidebar ===== */}
        <aside className="hd-side">
          {/* chat / contact */}
          <div className="hd-side-card shadow">
            <div className="hd-chat-head">
              <span className="hd-chat-av">
                {host?.brandingLogo ? <img src={host.brandingLogo} alt={name} /> : initial}
                <span className="dot" />
              </span>
              <div>
                <div className="hd-chat-name">Chat with {firstName}</div>
                <div className="hd-chat-sub">● Usually replies {responseTime}</div>
              </div>
            </div>
            <button type="button" className="hd-cta" onClick={openChat}><IcChat /> Send message</button>
            <button type="button" className="hd-ghost" onClick={handleViewTrips}><IcBox /> View trips</button>
            <div className="hd-safety">
              <IcLock />
              <span>For your safety, all conversations stay on Nomadic Townies. We never share personal contact details.</span>
            </div>
          </div>

          {/* host stats */}
          <div className="hd-side-card">
            <div className="hd-side-label">Host stats</div>
            <div className="hd-stat-rows">
              {responseRate > 0 && <div className="hd-stat-row"><span className="k">Response rate</span><span className="v">{responseRate}%</span></div>}
              <div className="hd-stat-row"><span className="k">Response time</span><span className="v">{responseTime}</span></div>
              {memberSince && <div className="hd-stat-row"><span className="k">Member since</span><span className="v">{memberSince}</span></div>}
              <div className="hd-stat-row"><span className="k">Travellers hosted</span><span className="v">{travellersHosted}</span></div>
            </div>
          </div>

          {/* host rank */}
          <div className="hd-rank">
            <div className="hd-rank-glow" />
            <div className="hd-rank-inner">
              <span className="hd-rank-ic"><IcTrophy c="currentColor" s={22} /></span>
              <div>
                <div className="hd-rank-t">{rankLabel}</div>
                <div className="hd-rank-s">{successRate ? `${successRate}% rebook rate` : "Verified by Nomadic Townies"}</div>
              </div>
            </div>
          </div>

          {/* similar hosts */}
          {similar.length > 0 && (
            <div className="hd-side-card">
              <div className="hd-side-label">Similar hosts</div>
              {similar.map((h) => (
                <div className="hd-sim" key={h._id} onClick={() => navigate(`/hosts/${h.seoSlug || h._id}`)}>
                  <span className="hd-sim-av">{h.brandingLogo ? <img src={h.brandingLogo} alt="" /> : initialOf(h.hostName || h.hostTitle)}</span>
                  <div style={{ minWidth: 0 }}>
                    <div className="hd-sim-n">{h.hostTitle || h.hostName}</div>
                    <div className="hd-sim-s">{[h.city, h.state].filter(Boolean).join(", ") || h.location || ""}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </aside>
      </div>

      {/* ---------- chat drawer (placeholder — messaging coming soon) ---------- */}
      {chatOpen && <div className="hd-overlay" onClick={closeChat} />}
      <div className={`hd-drawer${chatOpen ? " open" : ""}`} role="dialog" aria-label={`Message ${name}`}>
        <div className="hd-drawer-head">
          <span className="hd-chat-av" style={{ width: 42, height: 42 }}>
            {host?.brandingLogo ? <img src={host.brandingLogo} alt={name} /> : initial}
            <span className="dot" />
          </span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="hd-chat-name">{name}</div>
            <div className="hd-chat-sub">● Replies {responseTime}</div>
          </div>
          <button type="button" className="hd-drawer-x" onClick={closeChat} aria-label="Close">✕</button>
        </div>

        <div className="hd-drawer-safety">
          <IcLock c="#CF4A2C" s={15} />
          <span>Keep it on-platform. For your safety we never share personal contact details.</span>
        </div>

        <div className="hd-thread">
          {(convo?.chat || []).length === 0 && (
            <div className="hd-thread-empty">
              Say hello to {firstName} — ask about trips, dates or anything you need. Replies land right here.
            </div>
          )}
          {(convo?.chat || []).map((m, i, arr) => {
            const showSep = i === 0 || dayKey(m.timeStamp) !== dayKey(arr[i - 1]?.timeStamp);
            return (
              <div key={i}>
                {showSep && m.timeStamp && <div className="hd-daysep"><span>{dayLabel(m.timeStamp)}</span></div>}
                <div className={`hd-msg ${m.MessageBy === "user" ? "me" : "them"}`}>
                  <div className="hd-msg-bubble">{m.Message}</div>
                  <div className="hd-msg-time">{msgTime(m.timeStamp)}</div>
                </div>
              </div>
            );
          })}
          <div ref={chatEndRef} />
        </div>

        {chatWarn && <div className="hd-chat-warn">{chatWarn}</div>}

        <div className="hd-composer">
          <input
            ref={chatInputRef}
            type="text"
            value={chatText}
            onChange={(e) => setChatText(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") sendChat(); }}
            placeholder={userDbData ? `Message ${firstName}…` : "Log in to send a message"}
            disabled={chatSending}
          />
          <button type="button" className="hd-cta hd-send" onClick={sendChat} disabled={chatSending || !chatText.trim()}>
            {chatSending ? "…" : "Send"}
          </button>
        </div>
      </div>

      {/* ---------- mobile sticky cta ---------- */}
      <div className="hd-mobile-cta">
        <button type="button" className="hd-ghost" style={{ marginTop: 0 }} onClick={handleViewTrips}>View trips</button>
        <button type="button" className="hd-cta" onClick={openChat}>Send message</button>
      </div>

      <Footer />
    </div>
  );
};

export default HostPage;
