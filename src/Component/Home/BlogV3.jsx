"use client";

/* eslint-disable react/prop-types */
import { Link, useNavigate } from "react-router-dom";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import { useGetAllBlogsQuery } from "../../services";

const fmtDate = (d) => {
  if (!d) return "";
  const date = new Date(d);
  return isNaN(date) ? `${d}` : date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
};

const BlogV3 = ({ initialBlogs = [] }) => {
  const navigate = useNavigate();
  // RTK Query for live client refresh; use server data for first render
  const { data } = useGetAllBlogsQuery();
  const clientBlogs = Array.isArray(data?.data) ? data.data : [];
  const blogs = (clientBlogs.length ? clientBlogs : initialBlogs).slice(0, 3);
  if (!blogs.length) return null;

  return (
    <section className="section" style={{ background: "#fff" }}>
      <div className="wrap">
        <div className="sec-head" style={{ marginBottom: 36 }}>
          <div>
            <div className="section-label"><span className="section-label-bar" />Travel stories</div>
            <h2 className="section-h">From the Blog</h2>
            <p className="section-sub" style={{ marginTop: 8 }}>Guides, tips and stories to inspire your next adventure.</p>
          </div>
          <button className="btn btn-ghost btn-md" onClick={() => navigate("/blog")}>
            View All Blogs <ArrowForwardIcon sx={{ fontSize: 15 }} />
          </button>
        </div>

        <div className="blog-grid">
          {blogs.map((item, i) => (
            <Link key={item?._id || i} to={`/blog/${item?.seoSlug || item?._id}`} className="blog-card">
              <div className="blog-img">
                {item?.Banner_Image
                  ? <img src={item.Banner_Image} alt={item?.title ? `${item.title} - Nomadic Townies Blog` : "Nomadic Townies blog"} loading="lazy" />
                  : <div style={{ width: "100%", height: "100%", background: "linear-gradient(135deg,#1a3a2a,#2d6b4a)" }} />}
              </div>
              <div className="blog-body">
                <div className="blog-cat">{item?.location || "Travel Story"}</div>
                <div className="blog-title">{item?.title}</div>
                <div className="blog-meta">
                  <span style={{ color: "var(--text-lighter)" }}>{fmtDate(item?.Date)}</span>
                  {item?.Date ? <span style={{ width: 3, height: 3, background: "var(--text-lighter)", borderRadius: "50%", display: "inline-block" }} /> : null}
                  <span className="blog-readmore">Read more →</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default BlogV3;
