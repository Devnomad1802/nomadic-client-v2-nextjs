"use client";

/* eslint-disable react/prop-types */
import { Box } from "@mui/material";
import { useEffect, useRef, useState } from "react";
import Overview from "./Overview";
import Itinerary from "./Itinerary";
import BatchListTab from "../BatchListTabs/BatchListTab";
import InclusionExclusion from "./InclusionExclusion";
import OtherInfo from "./OtherInfo";
import Gallary from "./Gallary";
import TabReview from "./TabReview";

const tabs = [
  "Overview",
  "Itinerary",
  "Batch List",
  "Inclusions",
  "Other Info",
  "Gallery",
  "Review",
];

const DetailUpcomming = ({ tripDetail }) => {
  const [activeTab, setActiveTab] = useState("Overview");

  const overviewRef = useRef(null);
  const itineraryRef = useRef(null);
  const batchRef = useRef(null);
  const inclusionRef = useRef(null);
  const otherRef = useRef(null);
  const galleryRef = useRef(null);
  const reviewRef = useRef(null);

  const refMap = {
    Overview: overviewRef,
    Itinerary: itineraryRef,
    "Batch List": batchRef,
    Inclusions: inclusionRef,
    "Other Info": otherRef,
    Gallery: galleryRef,
    Review: reviewRef,
  };

  const scrollTo = (tab) => {
    setActiveTab(tab);
    refMap[tab]?.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  // Intersection Observer — highlight tab based on which section is visible
  useEffect(() => {
    const refs = [
      { name: "Overview", ref: overviewRef },
      { name: "Itinerary", ref: itineraryRef },
      { name: "Batch List", ref: batchRef },
      { name: "Inclusions", ref: inclusionRef },
      { name: "Other Info", ref: otherRef },
      { name: "Gallery", ref: galleryRef },
      { name: "Review", ref: reviewRef },
    ];

    const observer = new IntersectionObserver(
      (entries) => {
        // Find the entry with the largest intersection ratio
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visible.length > 0) {
          const match = refs.find((r) => r.ref.current === visible[0].target);
          if (match) setActiveTab(match.name);
        }
      },
      { rootMargin: "-80px 0px -60% 0px", threshold: [0, 0.25, 0.5] }
    );

    refs.forEach(({ ref }) => {
      if (ref.current) observer.observe(ref.current);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <Box>
      {/* ── Tab bar ── */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 0,
          borderBottom: "2px solid #F3F4F6",
          background: "#fff",
          position: "sticky",
          top: 0,
          zIndex: 100,
          overflowX: "auto",
          "&::-webkit-scrollbar": { display: "none" },
          scrollbarWidth: "none",
        }}
      >
        {tabs.map((tab) => (
          <Box
            key={tab}
            onClick={() => scrollTo(tab)}
            sx={{
              px: { xs: 1.5, md: 2.5 },
              py: 1.5,
              cursor: "pointer",
              whiteSpace: "nowrap",
              fontSize: { xs: "13px", md: "14px" },
              fontWeight: activeTab === tab ? 700 : 500,
              fontFamily: "Inter",
              color: activeTab === tab ? "#1F2937" : "#6B7280",
              borderBottom: activeTab === tab ? "3px solid #CF4A2C" : "3px solid transparent",
              transition: "all 0.15s",
              "&:hover": { color: "#1F2937" },
              flexShrink: 0,
            }}
          >
            {tab}
          </Box>
        ))}
      </Box>

      {/* ── Content sections ── */}
      <Box sx={{ pt: 4 }}>
        <Box ref={overviewRef} sx={{ mb: 6 }}>
          <Overview overview={tripDetail?.overview} />
        </Box>

        <Box ref={itineraryRef} sx={{ mb: 6 }}>
          <Itinerary
            ItineraryFile={tripDetail?.itenarryImg}
            addDays={tripDetail?.addDays}
          />
        </Box>

        <Box ref={batchRef} sx={{ mb: 6 }}>
          <BatchListTab
            selectDate={tripDetail?.selectDate ? JSON.parse(tripDetail.selectDate) : []}
            endSelectDate={tripDetail?.endSelectDate ? JSON.parse(tripDetail.endSelectDate) : []}
            numberOfSeats={tripDetail?.numberOfSeats ? JSON.parse(tripDetail.numberOfSeats) : []}
            numberOfDays={tripDetail?.numberOfDays ? JSON.parse(tripDetail.numberOfDays) : []}
          />
        </Box>

        <Box ref={inclusionRef} sx={{ mb: 6 }}>
          <InclusionExclusion
            Inclusion={tripDetail?.Inclusion}
            Exclusion={tripDetail?.Exclusion}
          />
        </Box>

        <Box ref={otherRef} sx={{ mb: 6 }}>
          <OtherInfo
            ThingsToCarry={tripDetail?.ThingsToCarry}
            Cancellation={tripDetail?.Cancellation}
          />
        </Box>

        <Box ref={galleryRef} sx={{ mb: 6 }}>
          <Gallary Gallary={tripDetail?.gallaryImages} />
        </Box>

        <Box ref={reviewRef} sx={{ mb: 6 }}>
          <TabReview />
        </Box>
      </Box>
    </Box>
  );
};

export default DetailUpcomming;
