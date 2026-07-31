"use client";

/* eslint-disable react/prop-types */
import StarIcon from "@mui/icons-material/Star";
import StarBorderIcon from "@mui/icons-material/StarBorder";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import "swiper/css";
import { useGetAllReviewsQuery } from "../../services";

const initial = (name) => (name ? name.trim()[0]?.toUpperCase() : "N");

const Stars = ({ rating = 5 }) => {
  const r = Math.round(Number(rating) || 5);
  return (
    <div className="testi-stars">
      {[1, 2, 3, 4, 5].map((i) =>
        i <= r ? <StarIcon key={i} sx={{ fontSize: 16 }} /> : <StarBorderIcon key={i} sx={{ fontSize: 16, color: "#f5a623" }} />
      )}
    </div>
  );
};

const ReviewsV3 = () => {
  const { data } = useGetAllReviewsQuery();
  const reviews = (Array.isArray(data?.data) ? data.data : []).slice(0, 12);
  if (!reviews.length) return null;

  return (
    <section className="section testi-section" style={{ background: "var(--orange-tint)" }}>
      <div className="wrap">
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div className="section-label" style={{ justifyContent: "center" }}>
            <span className="section-label-bar" />From the community<span className="section-label-bar" />
          </div>
          <h2 className="section-h">Stories from Fellow Adventurers</h2>
          <p className="section-sub" style={{ margin: "10px auto 0", maxWidth: 520 }}>
            Real experiences from travellers who&apos;ve embarked on unforgettable journeys with us.
          </p>
        </div>

        <Swiper
          modules={[Autoplay]}
          spaceBetween={18}
          loop={reviews.length > 3}
          autoplay={{ delay: 3500, disableOnInteraction: false, pauseOnMouseEnter: true }}
          breakpoints={{
            0: { slidesPerView: 1.05 },
            600: { slidesPerView: 1.8 },
            900: { slidesPerView: 2.4 },
            1200: { slidesPerView: 3 },
          }}
        >
          {reviews.map((rev, i) => (
            <SwiperSlide key={rev?._id || i} style={{ height: "auto" }}>
              <div className="testi">
                <Stars rating={rev?.rating} />
                <p className="testi-text">&ldquo;{rev?.Review}&rdquo;</p>
                <div className="testi-person">
                  <div className="testi-avatar">
                    {rev?.Profile_Image ? <img src={rev.Profile_Image} alt={rev?.Name} /> : initial(rev?.Name)}
                  </div>
                  <div>
                    <div className="testi-name">{rev?.Name}</div>
                    {rev?.Job ? <div className="testi-role">{rev.Job}</div> : null}
                  </div>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </section>
  );
};

export default ReviewsV3;
