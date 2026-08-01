"use client";

import {
  Box,
  Button,
  Container,
  IconButton,
  Typography,
  Drawer,
  List,
  ListItemButton,
  Collapse,
  CircularProgress,
} from "@mui/material";
import { NavLink, useNavigate } from "react-router-dom";
import { logo } from "../../Images";
import dynamic from "next/dynamic";
const SignUpModal = dynamic(() => import("../../Modals/SignUpModal"), { ssr: false });
const EnquirNow = dynamic(() => import("../../Modals/EnquirNow"), { ssr: false });
import { useState, useEffect, useRef, useMemo } from "react";
import { useSelector } from "react-redux";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import MenuIcon from "@mui/icons-material/Menu";
import CloseIcon from "@mui/icons-material/Close";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import { useGetTripsByCagtegoryMutation } from "../../services/categoriesApis";
import { useGetAllBlogsQuery } from "../../services/blogApi";

const menuItems = [
  { name: "International Trips", category: "INTERNATIONAL" },
  { name: "India Trips", category: "INDIA" },
  { name: "Blog", isBlog: true },
  // Group Tours and Workshops hidden until ready to avoid dead-end nav items
  // { name: "Group Tours", category: "GROUP TOURS", comingSoon: true },
  // { name: "Workshops", category: "WORKSHOPS", comingSoon: true },
];

const ORANGE = "#CF4A2C";
const TEXT = "#5A5247";

const norm = (s) => (s || "").toLowerCase().trim();

const slugify = (str) =>
  String(str || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

const parseCats = (v) => {
  if (Array.isArray(v)) return v.flatMap(parseCats);
  if (typeof v === "string") {
    const s = v.trim();
    if (s.startsWith("[")) {
      try { const p = JSON.parse(s); return Array.isArray(p) ? p.map((x) => `${x}`.trim()) : [s]; }
      catch { return [s.replace(/[[\]"]/g, "").trim()]; }
    }
    return s ? [s] : [];
  }
  return [];
};

const isTripInCategory = (t, targetCat) => {
  if (!t || !targetCat) return false;
  const target = norm(targetCat);
  const targetSlug = slugify(targetCat);

  const loc = norm(t.location);
  const dest = norm(t.destination);
  const title = norm(t.title);
  const cat = norm(t.category || t.categoryName);
  const cats = parseCats(t.categories).map(norm);

  if (loc === target || (t.location && slugify(t.location) === targetSlug)) return true;
  if (dest === target || (t.destination && slugify(t.destination) === targetSlug)) return true;
  if (cat === target || ((t.category || t.categoryName) && slugify(t.category || t.categoryName) === targetSlug)) return true;
  if (cats.some((c) => c === target || slugify(c) === targetSlug)) return true;
  if (title.includes(target) || (targetSlug && slugify(t.title).includes(targetSlug))) return true;

  return false;
};

const Navbar = () => {
  const [opens, setOpens] = useState(false);
  const [opene, setOpene] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileExpanded, setMobileExpanded] = useState(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const [activeMenu, setActiveMenu] = useState(null);
  const [dropdownTrips, setDropdownTrips] = useState({});
  const [loadingCategory, setLoadingCategory] = useState(null);
  const fetchingRef = useRef({});

  const navigate = useNavigate();
  const { userDbData } = useSelector((store) => store.global);
  const [GetTripsByCagtegory] = useGetTripsByCagtegoryMutation();
  const { data: blogsData } = useGetAllBlogsQuery();
  const allBlogs = blogsData?.data || [];
  const recentBlogs = allBlogs.slice(0, 5);

  const blogCategories = useMemo(() => {
    const cats = allBlogs.map((b) => b?.location || b?.category).filter(Boolean);
    return Array.from(new Set(cats));
  }, [allBlogs]);

  const fetchCategoryTrips = async (category) => {
    if (dropdownTrips[category] || fetchingRef.current[category]) return;
    fetchingRef.current[category] = true;
    try {
      setLoadingCategory(category);
      const res = await GetTripsByCagtegory({ categories: category }).unwrap();
      setDropdownTrips((prev) => ({ ...prev, [category]: res?.data || [] }));
    } catch (error) {
      console.error("Error fetching category trips:", error);
      setDropdownTrips((prev) => ({ ...prev, [category]: [] }));
    } finally {
      setLoadingCategory(null);
      fetchingRef.current[category] = false;
    }
  };

  useEffect(() => {
    // Prefetch category trips on mount so hover dropdown opens instantly
    menuItems.forEach((item) => {
      if (item.category && !item.comingSoon) {
        fetchCategoryTrips(item.category);
      }
    });
  }, []);

  const handleHoverEnter = (item) => {
    setActiveMenu(item.name);
    if (item.category && !item.comingSoon) fetchCategoryTrips(item.category);
  };

  const handleTripClick = (tripId) => {
    setActiveMenu(null);
    setMobileOpen(false);
    navigate(`/trips/${tripId}`);
    window.scrollTo(0, 0);
  };

  const getCategoryLocations = (categoryKey) => {
    const trips = dropdownTrips[categoryKey] || [];
    const map = new Map();
    trips.forEach((t) => {
      const rawLoc = t.location || t.categoryName || t.category;
      if (rawLoc) {
        const key = slugify(rawLoc);
        if (!map.has(key)) {
          const formattedName = rawLoc.trim().charAt(0).toUpperCase() + rawLoc.trim().slice(1).toLowerCase();
          map.set(key, { raw: rawLoc, name: formattedName, slug: key });
        }
      }
    });
    return Array.from(map.values());
  };

  const handleCategoryClick = (categorySlug) => {
    setActiveMenu(null);
    setMobileOpen(false);

    // If this category/location has exactly 1 trip, navigate directly to trip details page
    const allTrips = Object.values(dropdownTrips).flat();
    const matchingTrips = allTrips.filter((t) => isTripInCategory(t, categorySlug));

    if (matchingTrips.length === 1) {
      const singleTrip = matchingTrips[0];
      const destSlug = slugify(singleTrip.location || singleTrip.destination || categorySlug);
      navigate(`/trips/${destSlug}/${singleTrip.seoSlug || singleTrip._id}`);
    } else {
      navigate(`/trips/${slugify(categorySlug)}`);
    }
    window.scrollTo(0, 0);
  };

  const handleBlogClick = (blogSlugOrId) => {
    setActiveMenu(null);
    setMobileOpen(false);
    navigate(`/blog/${blogSlugOrId}`);
    window.scrollTo(0, 0);
  };

  const handleBlogCategoryClick = (categoryName) => {
    setActiveMenu(null);
    setMobileOpen(false);
    navigate(`/blog/category/${slugify(categoryName)}`);
    window.scrollTo(0, 0);
  };

  const handleViewAllBlogs = () => {
    setActiveMenu(null);
    setMobileOpen(false);
    navigate("/blog");
    window.scrollTo(0, 0);
  };

  const goHome = () => {
    navigate("/");
    window.scrollTo(0, 0);
  };

  const dropdownItemSx = {
    px: 2,
    py: 1.2,
    fontSize: "12px",
    color: TEXT,
    cursor: "pointer",
    textAlign: "left",
    "&:hover": { background: "#FBF6EE", color: ORANGE },
  };

  const renderDropdownPanel = (item) => {
    return (
      <Box
        sx={{
          position: "absolute",
          top: "100%",
          left: 0,
          minWidth: "240px",
          background: "#fff",
          boxShadow: "0px 8px 24px rgba(0,0,0,0.12)",
          borderRadius: "10px",
          border: "1px solid #E6DDCF",
          py: 1,
          zIndex: 1300,
          mt: 1,
          // Transparent bridge fills the 8px gap (mt:1) between the menu item and
          // the panel so moving the cursor down keeps it within the hover area.
          "&::before": {
            content: '""',
            position: "absolute",
            top: "-8px",
            left: 0,
            right: 0,
            height: "8px",
            background: "transparent",
          },
        }}
      >
        {item.isBlog ? (
          blogCategories.length === 0 ? (
            <Typography sx={{ px: 2, py: 1.5, color: "#8A8073", fontSize: "12px" }}>
              No categories available
            </Typography>
          ) : (
            <>
              {blogCategories.map((cat) => (
                <Typography
                  key={cat}
                  onClick={() => handleBlogCategoryClick(cat)}
                  sx={dropdownItemSx}
                >
                  {cat}
                </Typography>
              ))}
              <Box sx={{ borderTop: "1px solid #E6DDCF", mt: 0.5, pt: 0.5 }}>
                <Typography
                  onClick={handleViewAllBlogs}
                  sx={{ ...dropdownItemSx, color: ORANGE, fontWeight: 600 }}
                >
                  View all blogs →
                </Typography>
              </Box>
            </>
          )
        ) : item.comingSoon ? (
          <Typography sx={{ px: 2, py: 1.5, color: "#8A8073", fontSize: "12px" }}>
            Coming soon
          </Typography>
        ) : loadingCategory === item.category ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 2 }}>
            <CircularProgress size={20} sx={{ color: ORANGE }} />
          </Box>
        ) : getCategoryLocations(item.category).length === 0 ? (
          <Typography sx={{ px: 2, py: 1.5, color: "#8A8073", fontSize: "12px" }}>
            No destinations available
          </Typography>
        ) : (
          getCategoryLocations(item.category).map((locObj) => (
            <Typography
              key={locObj.slug}
              onClick={() => handleCategoryClick(locObj.slug)}
              sx={dropdownItemSx}
            >
              {locObj.name}
            </Typography>
          ))
        )}
      </Box>
    );
  };

  return (
    <Box
      sx={{
        position: "sticky",
        top: 0,
        zIndex: 1100,
        backgroundColor: "#fff",
        boxShadow: "0 5px 24px rgb(57 57 56 / 15%)",
        borderBottom: "1px solid #F1EADD",
      }}
    >
      <Container maxWidth="lg">
        <SignUpModal opens={opens} setOpens={setOpens} toggelModel={() => setOpens(!opens)} />
        <EnquirNow opene={opene} setOpene={setOpene} toggelModele={() => setOpene(!opene)} />

        <Box
          sx={{
            width: "100%",
            boxSizing: "border-box",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            backgroundColor: "transparent",
            pt: "11px",
            pb: "10px",
          }}
        >
          <Box
            sx={{
              display: "flex",
              justifyContent: "flex-start",
              alignItems: "center",
              gap: { xs: "0px 16px", md: "0px 30px" },
            }}
          >
            <Box onClick={goHome} sx={{ cursor: "pointer", mt: { xs: 0, md: 1 } }}>
              <img width="160px" height="21px" src={logo} alt="Nomadic Townies - Adventure Travel" />
            </Box>

            <Box
              sx={{
                display: { xs: "none", lg: "flex" },
                justifyContent: "flex-start",
                gap: "0px 10px",
                alignItems: "center",
              }}
            >
              {menuItems.map((item, index) => (
                <Box
                  key={index}
                  onMouseEnter={() => handleHoverEnter(item)}
                  onMouseLeave={() => setActiveMenu(null)}
                  sx={{ position: "relative" }}
                >
                  <Box
                    sx={{
                      display: "flex", whiteSpace: "nowrap",
                      alignItems: "center",
                      gap: "2px",
                      padding: "10px 8px",
                      cursor: "pointer",
                      fontSize: "13px",
                      fontFamily: "Inter",
                      color: activeMenu === item.name ? ORANGE : TEXT,
                      fontWeight: 400,
                      "&:hover": { color: ORANGE },
                    }}
                  >
                    {item.name}
                    <KeyboardArrowDownIcon sx={{ fontSize: "18px" }} />
                  </Box>
                  {activeMenu === item.name && renderDropdownPanel(item)}
                </Box>
              ))}
              <Box
                onClick={() => { setActiveMenu(null); navigate("/hosts"); window.scrollTo(0, 0); }}
                sx={{
                  whiteSpace: "nowrap",
                  padding: "10px 8px",
                  cursor: "pointer",
                  fontSize: "13px",
                  fontFamily: "Inter",
                  color: TEXT,
                  fontWeight: 400,
                  "&:hover": { color: ORANGE },
                }}
              >
                Meet Our Hosts
              </Box>
            </Box>
          </Box>

          <Box sx={{ display: "flex", alignItems: "center", gap: "0px 12px" }}>
            <Button
              variant="simplebtn"
              sx={{ display: { xs: "none", sm: "inline-flex" }, fontSize: "13px" }}
              onClick={() => setOpene(true)}
            >
              Enquire Now
            </Button>

            {mounted && userDbData ? (
              <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                <IconButton onClick={() => navigate("/profile")} sx={{ p: 0.5 }}>
                  <AccountCircleIcon />
                </IconButton>
                <Typography sx={{ color: TEXT, fontSize: "12px" }}>
                  {userDbData?.name}
                </Typography>
              </Box>
            ) : (
              <Button
                onClick={() => setOpens(true)}
                variant="simplebtn"
                sx={{
                  display: { xs: "none", sm: "inline-flex" },
                  background: "#393938",
                  color: "#fff",
                  border: "1px solid #393938",
                  whiteSpace: "nowrap",
                  "&:hover": {
                    background: "transparent",
                    border: "1px solid " + ORANGE,
                    color: ORANGE,
                  },
                }}
              >
                Login
              </Button>
            )}

            <IconButton
              sx={{ display: { xs: "inline-flex", lg: "none" }, color: TEXT }}
              onClick={() => setMobileOpen(true)}
            >
              <MenuIcon />
            </IconButton>
          </Box>
        </Box>
      </Container>

      <Drawer anchor="right" open={mobileOpen} onClose={() => setMobileOpen(false)}>
        <Box sx={{ width: 280, p: 2 }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
            <img width="130px" src={logo} alt="Nomadic Townies" />
            <IconButton onClick={() => setMobileOpen(false)}>
              <CloseIcon />
            </IconButton>
          </Box>

          <List>
            {menuItems.map((item, index) => {
              const isExpanded = mobileExpanded === item.name;
              return (
                <Box key={index}>
                  <ListItemButton
                    onClick={() => {
                      const next = isExpanded ? null : item.name;
                      setMobileExpanded(next);
                      if (next && item.category && !item.comingSoon) {
                        fetchCategoryTrips(item.category);
                      }
                    }}
                    sx={{ color: TEXT, justifyContent: "space-between" }}
                  >
                    {item.name}
                    <KeyboardArrowDownIcon
                      sx={{
                        transform: isExpanded ? "rotate(180deg)" : "none",
                        transition: "transform 0.2s",
                      }}
                    />
                  </ListItemButton>
                  <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                    {item.isBlog ? (
                      blogCategories.length === 0 ? (
                        <Typography sx={{ pl: 4, py: 1, color: "#8A8073", fontSize: "14px", textAlign: "left" }}>
                          No categories available
                        </Typography>
                      ) : (
                        <>
                          {blogCategories.map((cat) => (
                            <Typography
                              key={cat}
                              onClick={() => handleBlogCategoryClick(cat)}
                              sx={{ pl: 4, py: 1, fontSize: "14px", color: TEXT, cursor: "pointer", textAlign: "left", "&:hover": { color: ORANGE } }}
                            >
                              {cat}
                            </Typography>
                          ))}
                          <Typography
                            onClick={handleViewAllBlogs}
                            sx={{ pl: 4, py: 1, fontSize: "14px", color: ORANGE, fontWeight: 600, cursor: "pointer", textAlign: "left" }}
                          >
                            View all blogs →
                          </Typography>
                        </>
                      )
                    ) : item.comingSoon ? (
                      <Typography sx={{ pl: 4, py: 1, color: "#8A8073", fontSize: "14px", textAlign: "left" }}>
                        Coming soon
                      </Typography>
                    ) : loadingCategory === item.category ? (
                      <Box sx={{ display: "flex", justifyContent: "center", py: 1 }}>
                        <CircularProgress size={18} sx={{ color: ORANGE }} />
                      </Box>
                    ) : getCategoryLocations(item.category).length === 0 ? (
                      <Typography sx={{ pl: 4, py: 1, color: "#8A8073", fontSize: "14px", textAlign: "left" }}>
                        No destinations available
                      </Typography>
                    ) : (
                      getCategoryLocations(item.category).map((locObj) => (
                        <Typography
                          key={locObj.slug}
                          onClick={() => handleCategoryClick(locObj.slug)}
                          sx={{ pl: 4, py: 1, fontSize: "14px", color: TEXT, cursor: "pointer", textAlign: "left", "&:hover": { color: ORANGE } }}
                        >
                          {locObj.name}
                        </Typography>
                      ))
                    )}
                  </Collapse>
                </Box>
              );
            })}
            <ListItemButton
              onClick={() => { setMobileOpen(false); navigate("/hosts"); window.scrollTo(0, 0); }}
              sx={{ py: 1.5 }}
            >
              <Typography sx={{ fontSize: "16px", fontFamily: "Inter", color: TEXT }}>
                Meet Our Hosts
              </Typography>
            </ListItemButton>
          </List>

          <Box sx={{ mt: 3, display: "flex", flexDirection: "column", gap: 1.5 }}>
            <Button variant="simplebtn" onClick={() => { setMobileOpen(false); setOpene(true); }}>
              Enquire Now
            </Button>
            {mounted && !userDbData && (
              <Button
                variant="simplebtn"
                onClick={() => { setMobileOpen(false); setOpens(true); }}
                sx={{ background: "#393938", color: "#fff" }}
              >
                Login
              </Button>
            )}
          </Box>
        </Box>
      </Drawer>
    </Box>
  );
};

export default Navbar;
