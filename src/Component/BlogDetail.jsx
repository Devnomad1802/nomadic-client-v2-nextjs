"use client";

/**
 * BlogDetail.jsx — Editorial redesign (v2, backend-true)
 * ─────────────────────────────────────────────────────────────
 * Drop-in replacement for: src/Component/BlogDetail.jsx
 * Route mounted at:        /blogs/Details/:id
 *
 * BACKEND-COMPATIBLE — uses ONLY fields already in models/blogs.js:
 *   _id, title, author, location, Date, Banner_Image,
 *   metaDescription, seoTitle, seoSlug,
 *   items[{ order, type, content, imageIndex, imageUrl }],   // NEW structured
 *   images[],                                                 // NEW structured
 *   content1, content2, Add_Image[]                           // LEGACY fallback
 *
 * Body renderer handles BOTH formats transparently.
 *
 * New design (v2):
 *   • Full-bleed magazine cover (Banner_Image overlays title + lede + meta)
 *   • Sticky share rail (left) + scrollspy TOC (right)
 *   • Justified body with auto-hyphenation, drop-cap
 *   • Native <blockquote> pullquote styling for body HTML
 *   • Author bio · newsletter · related (uses existing component)
 */

import React, { useEffect, useMemo, useRef, useState } from "react";
import { useParams, Link as RouterLink, useNavigate } from "react-router-dom";
import { Box, Container, Typography, IconButton, Button } from "@mui/material";
import FmdGoodOutlinedIcon from "@mui/icons-material/FmdGoodOutlined";
import CalendarMonthRoundedIcon from "@mui/icons-material/CalendarMonthRounded";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import BookmarkBorderIcon from "@mui/icons-material/BookmarkBorder";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import TwitterIcon from "@mui/icons-material/Twitter";
import LinkIcon from "@mui/icons-material/Link";
import { Helmet } from "react-helmet-async";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";

import { useGetAllBlogsQuery } from "../services";
import RelatedBlogs from "./Blog/RelatedBlogs";
import Footer from "./Footer";

// ─── Brand tokens ─────────────────────────────────────────────
const ORANGE = "#CF4A2C";
const ORANGE_HOVER = "#B53D1F";
const ORANGE_TINT = "#FDF3EE";
const ORANGE_TINT2 = "#FBEAE3";
const TEXT_DARK = "#3C3228";
const TEXT = "#5A5247";
const TEXT_LIGHT = "#726A5E";
const TEXT_LIGHTER = "#8A8073";
const LINE = "#E6DDCF";
const LINE_SOFT = "#F1EADD";
const BG_CREAM = "#FAF7F2";
const PLAYFAIR = `"Playfair Display", Georgia, serif`;
const SERIF = `"Newsreader", Georgia, serif`;
const INTER = `"Inter", system-ui, sans-serif`;

// ─── Helpers ──────────────────────────────────────────────────
const formatDate = d => {
  if (!d) return "";
  const dt = new Date(d);
  const day = dt.getDate();
  const month = dt.toLocaleString("en-US", { month: "long" });
  const year = dt.getFullYear();
  const suf = (n => {
    const s = ["th", "st", "nd", "rd"], v = n % 100;
    return s[(v - 20) % 10] || s[v] || s[0];
  })(day);
  return `${day}${suf} ${month} ${year}`;
};

const slugify = (str) =>
  String(str || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

const estimateReadMinutes = (itemOrText) => {
  if (!itemOrText) return 1;
  let text = "";
  if (typeof itemOrText === "string") {
    text = itemOrText;
  } else if (typeof itemOrText === "object") {
    const parts = [
      itemOrText.title,
      itemOrText.subTitle,
      itemOrText.description,
      itemOrText.content,
      itemOrText.content1,
      itemOrText.content2,
      itemOrText.details,
      itemOrText.metaDescription,
      ...(Array.isArray(itemOrText.items) ? itemOrText.items.map((i) => i?.content || i?.text || i?.caption || "") : []),
      ...(Array.isArray(itemOrText.sections) ? itemOrText.sections.map((s) => s?.content || s?.title || "") : []),
    ];
    text = parts.filter(Boolean).join(" ");
  }
  const cleanText = text.replace(/<[^>]+>/g, " ").replace(/&nbsp;| /g, " ");
  const wordCount = cleanText.trim().split(/\s+/).filter((w) => w.length > 0).length;
  // Standard average reading speed: 200 words per minute (WPM)
  return Math.max(1, Math.ceil(wordCount / 200));
};

// ─── Article body — handles items[] OR legacy content1/Add_Image/content2 ──
const ArticleBody = ({ item, onHeadingsExtracted }) => {
  const containerRef = useRef(null);

  // Old content was saved with &nbsp; ( ) between every word — non-breaking
  // spaces never wrap, so a paragraph becomes one giant unbreakable line that
  // overflows horizontally. Convert them back to normal spaces before rendering.
  const clean = (html) => (html || "").replace(/ |&nbsp;/g, " ");

  const blocks = useMemo(() => {
    // 1. NEW: structured items[]
    if (Array.isArray(item.items) && item.items.length) {
      return [...item.items]
        .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
        .map((it, idx) => {
          if (it.type === "content") return { kind: "content", html: clean(it.content), key: `c${idx}` };
          if (it.type === "image") {
            const url = it.imageUrl || (item.images && item.images[it.imageIndex]) || null;
            return { kind: "image", url, caption: it.caption || "", key: `i${idx}` };
          }
          return null;
        })
        .filter(Boolean);
    }
    // 2. LEGACY: content1 / Add_Image / content2
    const legacy = [];
    if (item.content1) legacy.push({ kind: "content", html: clean(item.content1), key: "lc1" });
    if (Array.isArray(item.Add_Image) && item.Add_Image.length) {
      legacy.push({ kind: "swiper", urls: item.Add_Image, key: "lsw" });
    }
    if (item.content2) legacy.push({ kind: "content", html: clean(item.content2), key: "lc2" });
    return legacy;
  }, [item]);

  // Build the "In this story" TOC dynamically from the blog's own headings.
  // Works for every blog (not hardcoded): prefer h2 sections; if a post only
  // uses h3 subheadings, fall back to those so the sidebar still appears.
  useEffect(() => {
    if (!containerRef.current) return;
    const seen = new Set();
    const collect = (sel, level) =>
      [...containerRef.current.querySelectorAll(sel)].map((h, i) => {
        const text = (h.textContent || "").trim();
        if (!text) return null;
        let slug = text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || `section-${level}-${i}`;
        while (seen.has(slug)) slug += "-x";
        seen.add(slug);
        if (!h.id) h.id = slug;
        return { id: h.id, label: text, level };
      }).filter(Boolean);

    const h2 = collect("h2", 2);
    // include h3 too — as sub-items under h2, or as the only items if no h2
    const h3 = collect("h3", 3);
    const headings = h2.length ? [...h2, ...h3].sort((a, b) => {
      const ax = document.getElementById(a.id), bx = document.getElementById(b.id);
      return (ax?.compareDocumentPosition(bx) & Node.DOCUMENT_POSITION_FOLLOWING) ? -1 : 1;
    }) : h3;
    onHeadingsExtracted?.(headings);
  }, [blocks, onHeadingsExtracted]);

  return (
    <Box ref={containerRef} className="nt-article-body" sx={{
      fontFamily: SERIF, fontSize: 19.5, lineHeight: 1.78, color: "#2b3441",
      maxWidth: 680, width: "100%", letterSpacing: ".003em",
      overflowWrap: "break-word", wordBreak: "break-word",
      "& *": { maxWidth: "100%" },
      "& p": { margin: "0 0 28px", textAlign: "justify", textWrap: "pretty", hyphens: "auto", WebkitHyphens: "auto" },
      "& p:first-of-type::first-letter": {
        fontFamily: PLAYFAIR, fontWeight: 700, float: "left",
        fontSize: 78, lineHeight: 0.85, padding: "8px 14px 0 0", color: ORANGE,
      },
      "& h2": {
        fontFamily: PLAYFAIR, fontSize: 32, fontWeight: 700, color: TEXT_DARK,
        letterSpacing: "-.02em", lineHeight: 1.18, margin: "56px 0 20px",
        textWrap: "balance", textAlign: "left", scrollMarginTop: 80,
      },
      "& h2:first-of-type": { marginTop: "12px" },
      "& h3": {
        fontFamily: PLAYFAIR, fontSize: 22, fontWeight: 700, color: TEXT_DARK,
        letterSpacing: "-.01em", lineHeight: 1.28, margin: "40px 0 14px", textAlign: "left",
      },
      "& a": { color: ORANGE, fontWeight: 600, borderBottom: "1px solid rgba(205,72,42,.3)" },
      "& a:hover": { borderBottomColor: ORANGE },
      "& ul, & ol": { paddingLeft: "24px", marginBottom: "28px" },
      "& li": { marginBottom: "12px", lineHeight: 1.65, textAlign: "left" },
      "& li::marker": { color: ORANGE },
      "& strong": { color: TEXT_DARK, fontWeight: 600 },
      "& em": { fontStyle: "italic" },
      "& blockquote": {
        position: "relative", margin: "56px -36px", padding: "60px 44px 32px",
        borderTop: `2px solid ${ORANGE}`, borderBottom: `1px solid ${LINE}`,
        fontFamily: PLAYFAIR, fontStyle: "italic", fontWeight: 500,
        fontSize: 27, lineHeight: 1.32, letterSpacing: "-.015em",
        color: TEXT_DARK, textWrap: "balance",
      },
      "& blockquote::before": {
        content: '"\\201C"', fontSize: 64, color: ORANGE,
        position: "absolute", top: 18, left: 36, lineHeight: 0.4, fontFamily: PLAYFAIR,
      },
      "& blockquote cite": {
        display: "block", marginTop: "18px", fontFamily: INTER, fontStyle: "normal",
        fontSize: 11.5, fontWeight: 800, color: TEXT_LIGHT,
        letterSpacing: ".14em", textTransform: "uppercase",
      },
      "@media (max-width:768px)": {
        fontSize: 18,
        "& blockquote": { margin: "40px 0", padding: "48px 0 24px", fontSize: 21 },
        "& blockquote::before": { left: 0 },
      },
      "@media (max-width:600px)": {
        "& p:first-of-type::first-letter": { fontSize: 64 },
      },
    }}>
      {blocks.map(b => {
        if (b.kind === "content") {
          return <Box key={b.key} component="div" dangerouslySetInnerHTML={{ __html: b.html }} />;
        }
        if (b.kind === "image" && b.url) {
          return (
            <Box key={b.key} component="figure" sx={{ margin: "44px 0", display: "block" }}>
              <Box sx={{
                borderRadius: "18px", overflow: "hidden",
                aspectRatio: "16/10", bgcolor: "#0e1620",
                boxShadow: "0 6px 24px -14px rgba(0,0,0,.25)",
              }}>
                <Box component="img" src={b.url} alt={b.caption || ""} loading="lazy" sx={{
                  width: "100%", height: "100%", objectFit: "cover", display: "block",
                }} />
              </Box>
              {b.caption && (
                <Typography component="figcaption" sx={{
                  fontFamily: SERIF, fontSize: 13.5, color: TEXT_LIGHT,
                  textAlign: "center", fontStyle: "italic", lineHeight: 1.5,
                  mt: "14px", letterSpacing: ".01em",
                }}>{b.caption}</Typography>
              )}
            </Box>
          );
        }
        if (b.kind === "swiper" && b.urls?.length) {
          return (
            <Box key={b.key} sx={{ my: "44px" }}>
              <Swiper slidesPerView={1} spaceBetween={20} pagination={{ clickable: true }}
                modules={[Pagination]} className="mySwiper">
                {b.urls.map((src, i) => (
                  <SwiperSlide key={i}>
                    <Box sx={{
                      borderRadius: "18px", overflow: "hidden",
                      aspectRatio: "16/10", bgcolor: "#0e1620",
                    }}>
                      <img src={src} alt="" loading="lazy"
                        style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                    </Box>
                  </SwiperSlide>
                ))}
              </Swiper>
            </Box>
          );
        }
        return null;
      })}
    </Box>
  );
};

// ─── Share rail (sticky left) ─────────────────────────────────
const ShareRail = ({ url, title }) => {
  const enc = encodeURIComponent;
  const links = {
    whatsapp: `https://wa.me/?text=${enc(title)}%20${enc(url)}`,
    twitter: `https://twitter.com/intent/tweet?text=${enc(title)}&url=${enc(url)}`,
  };
  const copy = () => navigator.clipboard?.writeText(url);
  const btnSx = {
    width: 44, height: 44, border: `1.5px solid ${LINE}`, bgcolor: "#fff",
    color: TEXT_LIGHT, transition: "all .15s",
    "&:hover": { borderColor: ORANGE, color: ORANGE, transform: "translateY(-2px)" },
  };
  return (
    <Box sx={{
      position: "sticky", top: 84,
      display: { xs: "none", md: "flex" },
      flexDirection: "column", alignItems: "center", gap: 1,
    }}>
      <Box sx={{
        fontFamily: INTER, fontSize: 10, fontWeight: 800, letterSpacing: ".18em",
        textTransform: "uppercase", color: TEXT_LIGHTER,
        writingMode: "vertical-rl", transform: "rotate(180deg)", mb: 2.2,
      }}>Share</Box>
      <IconButton sx={btnSx} title="Bookmark"><BookmarkBorderIcon sx={{ fontSize: 18 }} /></IconButton>
      <IconButton sx={btnSx} title="WhatsApp" component="a" href={links.whatsapp} target="_blank" rel="noopener">
        <WhatsAppIcon sx={{ fontSize: 18 }} />
      </IconButton>
      <IconButton sx={btnSx} title="X" component="a" href={links.twitter} target="_blank" rel="noopener">
        <TwitterIcon sx={{ fontSize: 16 }} />
      </IconButton>
      <IconButton sx={btnSx} title="Copy link" onClick={copy}><LinkIcon sx={{ fontSize: 18 }} /></IconButton>
    </Box>
  );
};

// ─── Scrollspy TOC (right) ───────────────────────────────────
const TableOfContents = ({ headings }) => {
  const [activeId, setActiveId] = useState(null);

  useEffect(() => {
    const onScroll = () => {
      let cur = null;
      headings.forEach(h => {
        const el = document.getElementById(h.id);
        if (el && el.getBoundingClientRect().top <= 120) cur = h.id;
      });
      setActiveId(cur);
    };
    document.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => document.removeEventListener("scroll", onScroll);
  }, [headings]);

  if (!headings.length) return null;
  return (
    <Box sx={{ position: "sticky", top: 84, display: { xs: "none", lg: "block" }, fontFamily: INTER }}>
      <Box sx={{
        fontSize: 10.5, fontWeight: 800, letterSpacing: ".16em", textTransform: "uppercase",
        color: TEXT_LIGHTER, mb: 1.8,
      }}>In this story</Box>
      <Box component="ul" sx={{ listStyle: "none", p: 0, m: 0, borderLeft: `1.5px solid ${LINE}` }}>
        {headings.map(h => (
          <Box component="li" key={h.id}>
            <Box component="a" href={`#${h.id}`} sx={{
              display: "block", py: 1, pl: h.level === 3 ? 3.5 : 2, fontSize: h.level === 3 ? 12.5 : 13,
              color: activeId === h.id ? ORANGE : TEXT_LIGHT,
              fontWeight: activeId === h.id ? 600 : 400,
              borderLeft: `1.5px solid ${activeId === h.id ? ORANGE : "transparent"}`,
              marginLeft: "-1.5px", textDecoration: "none", lineHeight: 1.4,
              transition: "all .15s",
              "&:hover": { color: TEXT_DARK },
            }}>{h.label}</Box>
          </Box>
        ))}
      </Box>
    </Box>
  );
};

// ─── Reading progress bar ─────────────────────────────────────
const ReadingProgress = () => {
  const [pct, setPct] = useState(0);
  useEffect(() => {
    const onScroll = () => {
      const h = document.documentElement;
      const max = h.scrollHeight - h.clientHeight;
      setPct(Math.min(100, (h.scrollTop / Math.max(1, max)) * 100));
    };
    document.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => document.removeEventListener("scroll", onScroll);
  }, []);
  return (
    <Box sx={{ position: "fixed", top: 0, left: 0, right: 0, height: 3, zIndex: 60 }}>
      <Box sx={{ height: "100%", width: `${pct}%`, bgcolor: ORANGE, transition: "width .1s linear" }} />
    </Box>
  );
};

// ─── Author bio ───────────────────────────────────────────────
const AuthorBio = ({ author, location, bio }) => {
  if (!author) return null;
  return (
    <Box sx={{
      maxWidth: 760, mx: "auto", mt: 8,
      display: "grid", gridTemplateColumns: { xs: "1fr", sm: "120px 1fr" }, gap: 4, alignItems: "center",
      p: 4, bgcolor: BG_CREAM, borderRadius: "20px",
      textAlign: { xs: "center", sm: "left" },
    }}>
      <Box sx={{
        width: 120, height: 120, borderRadius: "50%",
        background: "linear-gradient(135deg,#a8703a,#5c3a1a)",
        display: "grid", placeItems: "center", color: "#fff",
        fontFamily: PLAYFAIR, fontSize: 46, fontWeight: 700,
        border: "4px solid #fff", boxShadow: "0 10px 28px -14px rgba(31,39,51,.2)",
        mx: { xs: "auto", sm: 0 },
      }}>{(author || "?")[0].toUpperCase()}</Box>
      <Box>
        <Box sx={{ fontSize: 11, fontWeight: 800, letterSpacing: ".16em", textTransform: "uppercase", color: ORANGE, mb: 1.2 }}>
          Written by
        </Box>
        <Typography sx={{ fontFamily: PLAYFAIR, fontSize: 24, fontWeight: 700, color: TEXT_DARK, mb: 0.7 }}>
          {author}
        </Typography>
        {location && (
          <Box sx={{
            display: "inline-flex", alignItems: "center", gap: 0.6, fontSize: 13,
            color: TEXT_LIGHT, mb: 1.5, fontWeight: 500,
            justifyContent: { xs: "center", sm: "flex-start" },
          }}>
            <FmdGoodOutlinedIcon sx={{ fontSize: 14 }} /> {location}
          </Box>
        )}
        <Typography sx={{ fontSize: 14.5, color: TEXT, lineHeight: 1.65, mb: 2.2, fontFamily: SERIF }}>
          {bio || "Field notes from the road for Nomadic Townies."}
        </Typography>
        <Box sx={{
          display: "flex", gap: 1.2, flexWrap: "wrap",
          justifyContent: { xs: "center", sm: "flex-start" },
        }}>
          <Button component={RouterLink} to="/blog" sx={{
            bgcolor: ORANGE, color: "#fff", fontSize: 13, fontWeight: 600, px: 2.2, py: 1,
            borderRadius: "999px", textTransform: "none",
            "&:hover": { bgcolor: ORANGE_HOVER },
          }}>More from the journal →</Button>
          <Button component={RouterLink} to="/experiences" sx={{
            fontSize: 13, fontWeight: 600, px: 2.2, py: 1, borderRadius: "999px", textTransform: "none",
            color: TEXT_DARK, border: `1.5px solid ${TEXT_DARK}`,
            "&:hover": { bgcolor: TEXT_DARK, color: "#fff" },
          }}>Explore trips</Button>
        </Box>
      </Box>
    </Box>
  );
};

// ─── Newsletter ───────────────────────────────────────────────
const NewsletterInline = () => {
  const [done, setDone] = useState(false);
  return (
    <Box sx={{
      maxWidth: 760, mx: "auto", mt: 6,
      background: `linear-gradient(135deg,${ORANGE_TINT},${ORANGE_TINT2})`,
      borderRadius: "20px", p: { xs: 4, sm: "44px 40px" }, textAlign: "center",
      position: "relative", overflow: "hidden",
    }}>
      <Typography sx={{
        fontFamily: PLAYFAIR, fontSize: { xs: 22, sm: 28 }, fontWeight: 700, color: TEXT_DARK,
        letterSpacing: "-.01em", lineHeight: 1.2, mb: 1,
      }}>Field notes, every other Saturday</Typography>
      <Typography sx={{ fontSize: 14.5, color: TEXT, mb: 2.5, maxWidth: 420, mx: "auto", lineHeight: 1.55 }}>
        Long-form essays from the road, plus first dibs on upcoming small-group trips.
      </Typography>
      <Box component="form" onSubmit={e => { e.preventDefault(); setDone(true); }} sx={{
        display: "flex", gap: 1, maxWidth: 440, mx: "auto", flexWrap: "wrap", justifyContent: "center",
      }}>
        <Box component="input" type="email" required placeholder="you@email.com" sx={{
          flex: 1, minWidth: 200, padding: "13px 18px",
          border: "1.5px solid #fff", bgcolor: "#fff", borderRadius: "999px",
          fontFamily: INTER, fontSize: 14, color: TEXT_DARK, outline: "none",
          "&:focus": { borderColor: ORANGE },
        }} />
        <Button type="submit" sx={{
          bgcolor: ORANGE, color: "#fff", px: 3, py: 1.5, borderRadius: "999px",
          fontSize: 14, fontWeight: 700, textTransform: "none", whiteSpace: "nowrap",
          "&:hover": { bgcolor: ORANGE_HOVER },
        }}>{done ? "Subscribed ✓" : "Subscribe"}</Button>
      </Box>
    </Box>
  );
};

// ─── Main ────────────────────────────────────────────────────
const BlogDetail = ({ initialBlog, initialAllBlogs }) => {
  let slugOrId;
  try {
    const params = useParams();
    slugOrId = params?.slug || params?.id;
  } catch {
    slugOrId = undefined;
  }

  const navigate = (path) => {
    if (typeof window !== "undefined") {
      window.location.href = path;
    }
  };
  const { data, isLoading: queryLoading } = useGetAllBlogsQuery(undefined, { skip: !!initialAllBlogs });
  const [blogs, setBlogs] = useState(initialAllBlogs || []);
  const [headings, setHeadings] = useState([]);

  useEffect(() => {
    if (data) setBlogs(data?.data || []);
  }, [data]);

  useEffect(() => {
    if (typeof window !== "undefined") window.scrollTo(0, 0);
  }, [slugOrId]);

  const item = initialBlog || blogs.find(b => b.seoSlug === slugOrId || b._id === slugOrId);
  const isLoading = (initialBlog || initialAllBlogs) ? false : queryLoading;

  if (isLoading) {
    return (
      <Box sx={{ display: "grid", placeItems: "center", minHeight: "60vh", fontFamily: INTER, color: TEXT_LIGHT }}>
        Loading…
      </Box>
    );
  }
  if (!item) {
    return (
      <Box sx={{ display: "grid", placeItems: "center", minHeight: "60vh", textAlign: "center", p: 4 }}>
        <Box>
          <Typography sx={{ fontFamily: PLAYFAIR, fontSize: 28, fontWeight: 700, color: TEXT_DARK, mb: 1 }}>
            Story not found
          </Typography>
          <Button onClick={() => navigate("/blog")} sx={{
            mt: 2, bgcolor: ORANGE, color: "#fff", px: 3, py: 1.2, borderRadius: "999px",
            textTransform: "none", fontWeight: 700,
            "&:hover": { bgcolor: ORANGE_HOVER },
          }}>Back to journal</Button>
        </Box>
      </Box>
    );
  }

  const readMins = estimateReadMinutes(item);
  const safeMeta = (item.metaDescription || item.title || "Travel story from Nomadic Townies").substring(0, 155);
  const title = item.seoTitle || item.title;
  const activeSlug = item.seoSlug || item._id || slugOrId;
  const pageUrl = typeof window !== "undefined" ? window.location.href : `https://nomadictownies.com/blog/${activeSlug}`;

  return (
    <Box sx={{ fontFamily: INTER, color: TEXT, bgcolor: "#fff", minHeight: "100vh",
      // Theme/global CSS centers text — force left by default, let Typography inherit
      // their container (cover=left, newsletter/author cards set their own center).
      textAlign: "left",
      "& .MuiTypography-root": { textAlign: "inherit" } }}>
      {typeof window !== "undefined" && (
        <Helmet>
          <title>{title} | Nomadic Townies</title>
          <meta name="description" content={safeMeta} />
          <link rel="canonical" href={pageUrl} />
          <meta property="og:type" content="article" />
          <meta property="og:title" content={`${title} | Nomadic Townies`} />
          <meta property="og:description" content={safeMeta} />
          <meta property="og:url" content={pageUrl} />
          {item.Banner_Image && <meta property="og:image" content={item.Banner_Image} />}
          <meta property="twitter:card" content="summary_large_image" />
          <meta property="twitter:title" content={`${title} | Nomadic Townies`} />
          <meta property="twitter:description" content={safeMeta} />
          {item.Banner_Image && <meta property="twitter:image" content={item.Banner_Image} />}
          <script type="application/ld+json">{JSON.stringify({
            "@context": "https://schema.org", "@type": "BlogPosting",
            "headline": title, "image": item.Banner_Image ? [item.Banner_Image] : [],
            "datePublished": item.Date, "author": { "@type": "Person", "name": item.author || "Nomadic Townies" },
            "publisher": { "@type": "Organization", "name": "Nomadic Townies", "logo": { "@type": "ImageObject", "url": "https://nomadictownies.com/nt.png" } },
            "description": safeMeta,
          })}</script>
        </Helmet>
      )}

      <ReadingProgress />

      {/* ═══ COVER ═══ */}
      <Container maxWidth="lg" sx={{ pt: { xs: 4, md: 5 } }}>
        <Box sx={{
          position: "relative", display: "flex", alignItems: "flex-end",
          minHeight: { xs: 480, md: 580 }, borderRadius: { xs: "20px", md: "28px" },
          overflow: "hidden", bgcolor: "#0a1a24",
          "&::after": {
            content: '""', position: "absolute", inset: 0, zIndex: 2,
            background: "linear-gradient(180deg,rgba(0,0,0,.1) 0%,rgba(0,0,0,.2) 40%,rgba(0,0,0,.85) 100%)",
          },
        }}>
          {item.Banner_Image && (
            <Box component="img" src={item.Banner_Image}
              alt={item.title ? `${item.title} — Nomadic Townies` : "Travel story"}
              sx={{ position: "absolute", inset: 0, width: "100%", height: "100%",
                objectFit: "cover", zIndex: 1 }} />
          )}
          <Box sx={{ position: "relative", zIndex: 3, p: { xs: 3, md: "48px 56px" }, color: "#fff", width: "100%" }}>
            {item.location && (
              <Box
                onClick={() => navigate(`/blog/category/${slugify(item.location)}`)}
                sx={{
                  display: "inline-flex", alignItems: "center", gap: 1,
                  bgcolor: "rgba(255,255,255,.16)", backdropFilter: "blur(12px)",
                  border: "1px solid rgba(255,255,255,.2)",
                  px: 1.8, py: 0.9, borderRadius: "999px",
                  fontSize: 11.5, fontWeight: 700, letterSpacing: ".14em", textTransform: "uppercase",
                  color: "#fff", mb: 3, cursor: "pointer", transition: "all .18s ease",
                  "&:hover": { bgcolor: "rgba(255,255,255,.3)", transform: "translateY(-1px)" }
                }}
              >
                <FmdGoodOutlinedIcon sx={{ fontSize: 14 }} /> {item.location}
              </Box>
            )}
            <Typography component="h1" sx={{
              fontFamily: PLAYFAIR, fontWeight: 700,
              fontSize: { xs: 30, sm: 42, md: 56 }, lineHeight: 1.05, letterSpacing: "-.025em",
              maxWidth: 880, mb: 2.2, textWrap: "balance",
            }}>{item.title}</Typography>
            {item.metaDescription && (
              <Typography sx={{
                fontFamily: SERIF, fontSize: { xs: 15, md: 20 }, fontStyle: "italic",
                color: "rgba(255,255,255,.88)", lineHeight: 1.55, maxWidth: 660, textWrap: "pretty",
              }}>{item.metaDescription}</Typography>
            )}
            <Box sx={{
              display: "flex", alignItems: "center", gap: 2.5, mt: 4,
              pt: 3, borderTop: "1px solid rgba(255,255,255,.18)",
              fontSize: 13.5, color: "rgba(255,255,255,.85)", flexWrap: "wrap",
            }}>
              {item.author && (
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                  <Box sx={{
                    width: 42, height: 42, borderRadius: "50%",
                    background: `linear-gradient(135deg,${ORANGE_TINT2},${ORANGE_TINT})`,
                    color: ORANGE, display: "grid", placeItems: "center", fontWeight: 800, fontSize: 15,
                    border: "2px solid rgba(255,255,255,.4)",
                  }}>{item.author[0].toUpperCase()}</Box>
                  <Box>
                    <Box component="b" sx={{ display: "block", color: "#fff", fontWeight: 700, fontSize: 14, mb: 0.1 }}>
                      {item.author}
                    </Box>
                    <Box sx={{ color: "rgba(255,255,255,.7)", fontSize: 12.5 }}>{item.authorRole || "Nomadic Townies"}</Box>
                  </Box>
                </Box>
              )}
              <Box sx={{ width: 3, height: 3, bgcolor: "rgba(255,255,255,.4)", borderRadius: "50%" }} />
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.7 }}>
                <CalendarMonthRoundedIcon sx={{ fontSize: 15, color: "rgba(255,255,255,.75)" }} />
                {formatDate(item.Date)}
              </Box>
              <Box sx={{ width: 3, height: 3, bgcolor: "rgba(255,255,255,.4)", borderRadius: "50%" }} />
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.7 }}>
                <AccessTimeIcon sx={{ fontSize: 15, color: "rgba(255,255,255,.75)" }} />
                {readMins} min read
              </Box>
            </Box>
          </Box>
        </Box>
      </Container>

      {/* ═══ ARTICLE SHELL ═══ */}
      <Container maxWidth="lg" sx={{ mt: { xs: 5, md: 8 }, pb: 6 }}>
        <Box sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "54px minmax(0,1fr) 240px" },
          gap: { md: 6 }, alignItems: "start",
        }}>
          <ShareRail url={pageUrl} title={item.title} />
          <Box>
            <ArticleBody item={item} onHeadingsExtracted={setHeadings} />

            {/* Foot strip */}
            <Box sx={{
              maxWidth: 680, mt: 6, py: 3,
              borderTop: `1px solid ${LINE}`, borderBottom: `1px solid ${LINE}`,
              display: "flex", justifyContent: "space-between", alignItems: "center",
              gap: 2.2, flexWrap: "wrap",
            }}>
              <Box sx={{ fontSize: 13, color: TEXT_LIGHT }}>
                {item.location && <>Filed under <b style={{ color: TEXT_DARK, fontWeight: 600, cursor: "pointer", textDecoration: "underline" }} onClick={() => navigate(`/blog/category/${slugify(item.location)}`)}>{item.location}</b> · </>}
                Updated <b style={{ color: TEXT_DARK, fontWeight: 600 }}>{formatDate(item.Date)}</b>
              </Box>
              <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
                <Box sx={{ fontSize: 13, color: TEXT_LIGHT, mr: 0.5, fontWeight: 500 }}>Share</Box>
                {(() => {
                  const fb = {
                    width: 38, height: 38, border: `1.5px solid ${LINE}`, bgcolor: "#fff",
                    color: TEXT_LIGHT, transition: "all .15s",
                    "&:hover": { borderColor: ORANGE, color: ORANGE, transform: "translateY(-2px)" },
                  };
                  return (
                    <>
                      <IconButton sx={fb} title="WhatsApp" component="a" target="_blank" rel="noopener"
                        href={`https://wa.me/?text=${encodeURIComponent(item.title)}%20${encodeURIComponent(pageUrl)}`}>
                        <WhatsAppIcon sx={{ fontSize: 16 }} />
                      </IconButton>
                      <IconButton sx={fb} title="X" component="a" target="_blank" rel="noopener"
                        href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(item.title)}&url=${encodeURIComponent(pageUrl)}`}>
                        <TwitterIcon sx={{ fontSize: 15 }} />
                      </IconButton>
                      <IconButton sx={fb} title="Copy link" onClick={() => navigator.clipboard?.writeText(pageUrl)}>
                        <LinkIcon sx={{ fontSize: 16 }} />
                      </IconButton>
                    </>
                  );
                })()}
              </Box>
            </Box>

            <AuthorBio author={item.author} location={item.location} bio={item.authorBio} />
            <NewsletterInline />
          </Box>
          <TableOfContents headings={headings} />
        </Box>
      </Container>

      {/* Related blogs — new card design, dynamic, excludes current */}
      <RelatedBlogs currentId={item?._id} location={item?.location} />
      <Footer />
    </Box>
  );
};

export default BlogDetail;
