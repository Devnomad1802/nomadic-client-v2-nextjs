"use client";

import { useMemo, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Container } from "@mui/material";
import { setUserDbData, setAuthenticated } from "../../slices";
import { useEditUserProfileMutation } from "../../services";
import MyTripsPanel from "./MyTripsPanel";
import SavedTripsPanel from "./SavedTripsPanel";
import ReviewsPanel from "./ReviewsPanel";

const TABS = [
  { key: "account", icon: "◍", label: "My Account" },
  { key: "trips", icon: "⛰", label: "My Trips" },
  { key: "saved", icon: "♥", label: "Saved Trips" },
  { key: "reviews", icon: "✎", label: "My Reviews" },
  { key: "settings", icon: "⚙", label: "Settings" },
  { key: "logout", icon: "⏻", label: "Logout" },
];

const initials = (name) =>
  (name || "")
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase() || "U";

const UserProfile = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { userDbData } = useSelector((store) => store.global) || {};

  const [tab, setTab] = useState("account");
  const [toast, setToast] = useState("");
  const [editProfile, { isLoading }] = useEditUserProfileMutation();
  const fileRef = useRef(null);

  const [form, setForm] = useState({
    name: userDbData?.name || "",
    email: userDbData?.email || "",
    phone: userDbData?.phone || "",
    gender: userDbData?.gender || "",
  });
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(userDbData?.profileImage || "");

  const ping = (m) => {
    setToast(m);
    setTimeout(() => setToast(""), 2600);
  };

  const onField = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const onPickAvatar = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (!["image/jpeg", "image/jpg", "image/png"].includes(f.type)) return ping("JPG or PNG, up to ~5MB.");
    if (f.size > 5 * 1024 * 1024) return ping("JPG or PNG, up to ~5MB.");
    setAvatarFile(f);
    setAvatarPreview(URL.createObjectURL(f));
  };

  const onSave = async () => {
    if (!userDbData?._id) return ping("Please log in again.");
    try {
      const fd = new FormData();
      fd.append("userId", userDbData._id);
      fd.append("name", form.name);
      fd.append("email", form.email);
      fd.append("phone", form.phone);
      fd.append("gender", form.gender);
      if (avatarFile) fd.append("profileImage", avatarFile);

      const res = await editProfile(fd).unwrap();
      const updated = res?.data || res?.user || {};
      dispatch(
        setUserDbData({
          ...userDbData,
          ...form,
          profileImage: updated.profileImage || avatarPreview || userDbData.profileImage,
        })
      );
      setAvatarFile(null);
      ping("Profile updated ✓");
    } catch (err) {
      console.error("profile update failed:", err);
      ping(err?.data?.msg || err?.data?.error || "Could not update profile.");
    }
  };

  const onLogout = () => {
    localStorage.removeItem("token");
    dispatch(setUserDbData(null));
    dispatch(setAuthenticated(false));
    navigate("/");
  };

  const name = userDbData?.name || "Traveller";
  const isInfluencer = !!userDbData?.influencer;

  // localStorage-backed notification prefs (honest local preference, no fake backend)
  const [prefs, setPrefs] = useState(() => {
    try { return JSON.parse(localStorage.getItem("nt_prefs") || "{}"); } catch { return {}; }
  });
  const togglePref = (k) => {
    const next = { ...prefs, [k]: !prefs[k] };
    setPrefs(next);
    localStorage.setItem("nt_prefs", JSON.stringify(next));
  };

  const avatarNode = useMemo(
    () =>
      avatarPreview ? (
        <img className="nt-av-img" src={avatarPreview} alt={name} />
      ) : (
        <div className="nt-av-fallback">{initials(name)}</div>
      ),
    [avatarPreview, name]
  );

  return (
    <Container maxWidth="xl" disableGutters className="nt-profile">
      <style>{css}</style>

      {toast && <div className="nt-toast">{toast}</div>}

      <div className="nt-grid">
        {/* SIDEBAR */}
        <aside className="nt-side">
          <div className="nt-side-top">
            <div className="nt-av-wrap">
              {avatarNode}
              <span className="nt-av-dot" />
            </div>
            <div className="nt-name">{name}</div>
            {isInfluencer && <div className="nt-badge">★ Influencer host</div>}
          </div>
          <nav className="nt-tabs">
            {TABS.map((t) => (
              <button
                key={t.key}
                type="button"
                className="nt-tab"
                data-active={tab === t.key}
                onClick={() => setTab(t.key)}
              >
                <span className="nt-tab-ic">{t.icon}</span> {t.label}
              </button>
            ))}
          </nav>
        </aside>

        {/* CONTENT */}
        <section className="nt-panel">
          {tab === "account" && (
            <>
              <h2 className="nt-h2">My Account</h2>
              <p className="nt-sub">Keep your details up to date so hosts and travelers can reach you.</p>

              <div className="nt-avatar-row">
                <div className="nt-av-wrap nt-av-lg">{avatarNode}</div>
                <div>
                  <button className="nt-ghost" onClick={() => fileRef.current?.click()}>
                    {avatarPreview ? "Change photo" : "Upload photo"}
                  </button>
                  <input ref={fileRef} type="file" accept="image/jpeg,image/png" hidden onChange={onPickAvatar} />
                </div>
              </div>

              <div className="nt-form">
                <label className="nt-fld">
                  <span className="nt-lbl">Name</span>
                  <input className="nt-in" name="name" value={form.name} onChange={onField} />
                </label>
                <label className="nt-fld">
                  <span className="nt-lbl">Email</span>
                  <input className="nt-in" name="email" type="email" value={form.email} onChange={onField} />
                </label>
                <label className="nt-fld">
                  <span className="nt-lbl">Mobile</span>
                  <input className="nt-in" name="phone" value={form.phone} onChange={onField} />
                </label>
                <label className="nt-fld">
                  <span className="nt-lbl">Gender</span>
                  <div className="nt-sel-wrap">
                    <select className="nt-in" name="gender" value={form.gender} onChange={onField}>
                      <option value="">Select</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Prefer not to say</option>
                    </select>
                    <span className="nt-sel-caret">▾</span>
                  </div>
                </label>
              </div>

              <button className="nt-cta" onClick={onSave} disabled={isLoading}>
                {isLoading ? "Updating…" : "Update profile"}
              </button>
            </>
          )}

          {tab === "trips" && (
            <>
              <h2 className="nt-h2">My Trips</h2>
              <p className="nt-sub">Your bookings and balances. Open a trip to see details and pay any remaining amount.</p>
              <div className="nt-embed"><MyTripsPanel /></div>
            </>
          )}

          {tab === "saved" && (
            <>
              <h2 className="nt-h2">Saved Trips</h2>
              <p className="nt-sub">Experiences you&apos;ve bookmarked for later.</p>
              <div className="nt-embed"><SavedTripsPanel /></div>
            </>
          )}

          {tab === "reviews" && (
            <>
              <h2 className="nt-h2">My Reviews</h2>
              <p className="nt-sub">Review your completed trips and see what you&apos;ve shared.</p>
              <div className="nt-embed"><ReviewsPanel notify={ping} /></div>
            </>
          )}

          {tab === "settings" && (
            <>
              <h2 className="nt-h2">Settings</h2>
              <p className="nt-sub">Manage notifications, privacy and your account.</p>
              <div className="nt-settings">
                <label className="nt-toggle">
                  <span>
                    <span className="nt-toggle-t">Trip &amp; booking emails</span>
                    <span className="nt-toggle-d">Confirmations, reminders and itinerary updates</span>
                  </span>
                  <span className={`nt-switch ${prefs.tripEmails ? "on" : ""}`} onClick={() => togglePref("tripEmails")}><i /></span>
                </label>
                <label className="nt-toggle">
                  <span>
                    <span className="nt-toggle-t">Marketing &amp; offers</span>
                    <span className="nt-toggle-d">Curated experiences and seasonal deals</span>
                  </span>
                  <span className={`nt-switch ${prefs.marketing ? "on" : ""}`} onClick={() => togglePref("marketing")}><i /></span>
                </label>

                <div className="nt-danger">
                  <div>
                    <div className="nt-danger-t">Delete account</div>
                    <div className="nt-danger-d">Permanently remove your profile, trips and saved experiences. This can&apos;t be undone.</div>
                  </div>
                  <button className="nt-danger-btn" onClick={() => navigate("/contact-us")}>Contact support</button>
                </div>
              </div>
            </>
          )}

          {tab === "logout" && (
            <div className="nt-logout">
              <div className="nt-logout-ic">⏻</div>
              <h3 className="nt-h3">Ready to head out?</h3>
              <p className="nt-sub" style={{ textAlign: "center" }}>You&apos;ll need to sign in again next time.</p>
              <div className="nt-logout-actions">
                <button className="nt-ghost" onClick={() => setTab("account")}>Cancel</button>
                <button className="nt-cta" onClick={onLogout}>Log out</button>
              </div>
            </div>
          )}
        </section>
      </div>
    </Container>
  );
};

const css = `
.nt-profile{--bg:#FFFFFF;--line:#E4E4E7;--line-soft:#EFE7DA;--accent:#CF4A2C;--accent2:#CF4A2C;--ink:#18181B;--muted:#52525B;--muted2:#71717A;--green:#15803D;--badge:#F4F4F5;font-family:system-ui,-apple-system,'Segoe UI',sans-serif;color:var(--ink);padding:clamp(20px,4vw,52px) clamp(16px,4vw,52px);box-sizing:border-box}
.nt-profile *{box-sizing:border-box}
.nt-toast{position:fixed;top:18px;left:50%;transform:translateX(-50%);z-index:1300;background:var(--ink);color:#FFFFFF;padding:11px 20px;border-radius:12px;font-size:14px;font-weight:600;box-shadow:0 10px 30px -10px rgba(0,0,0,.4)}
.nt-head{display:flex;align-items:center;justify-content:space-between;margin-bottom:clamp(20px,3vw,34px);max-width:1180px;margin-left:auto;margin-right:auto}
.nt-brand{font-weight:800;font-size:clamp(20px,2.4vw,24px);letter-spacing:-.01em}
.nt-brand .o{color:var(--accent)}
.nt-crumb{font-weight:600;font-size:13px;color:var(--muted2)}
.nt-grid{display:grid;grid-template-columns:296px 1fr;gap:clamp(18px,2.2vw,28px);align-items:start;max-width:1180px;margin:0 auto}
.nt-side{position:sticky;top:24px;background:var(--bg);border:1px solid var(--line);border-radius:22px;padding:30px 22px;box-shadow:0 1px 3px rgba(0,0,0,.05)}
.nt-side-top{display:flex;flex-direction:column;align-items:center;text-align:center;padding-bottom:24px;border-bottom:1px solid var(--line-soft)}
.nt-av-wrap{position:relative;width:88px;height:88px}
.nt-av-lg{width:84px;height:84px}
.nt-av-img{width:100%;height:100%;border-radius:50%;object-fit:cover;display:block}
.nt-av-fallback{width:100%;height:100%;border-radius:50%;background:linear-gradient(145deg,var(--accent2),var(--accent));display:flex;align-items:center;justify-content:center;font-weight:700;font-size:32px;color:#FFFFFF}
.nt-av-dot{position:absolute;right:2px;bottom:2px;width:22px;height:22px;border-radius:50%;background:var(--green);border:3px solid var(--bg)}
.nt-name{margin-top:14px;font-weight:700;font-size:21px;color:var(--ink)}
.nt-badge{margin-top:5px;display:inline-flex;align-items:center;gap:6px;padding:4px 11px;border-radius:99px;background:var(--badge);color:var(--accent);font-weight:700;font-size:11px;letter-spacing:.04em;text-transform:uppercase}
.nt-tabs{display:flex;flex-direction:column;gap:4px;margin-top:18px}
.nt-tab{display:flex;align-items:center;gap:11px;width:100%;text-align:left;padding:12px 14px;border:none;background:transparent;color:var(--muted);font-size:15px;font-weight:600;border-radius:12px;cursor:pointer;transition:background .15s,color .15s}
.nt-tab:hover{background:#F7F0E6}
.nt-tab[data-active="true"]{background:var(--accent);color:#fff}
.nt-tab-ic{font-size:17px;width:18px;text-align:center}
.nt-panel{background:var(--bg);border:1px solid var(--line);border-radius:22px;padding:clamp(24px,3vw,40px);box-shadow:0 1px 3px rgba(0,0,0,.05);min-height:560px;text-align:left}
.nt-h2{margin:0;font-weight:700;font-size:clamp(24px,2.8vw,30px);letter-spacing:-.01em;color:var(--ink)}
.nt-h3{margin:18px 0 0;font-weight:700;font-size:24px;color:var(--ink)}
.nt-sub{margin:8px 0 0;font-size:15px;line-height:1.5;color:var(--muted)}
.nt-avatar-row{display:flex;align-items:center;gap:18px;margin-top:26px}
.nt-hint{margin:6px 0 0;font-size:12.5px;color:var(--muted2)}
.nt-form{display:grid;grid-template-columns:repeat(auto-fit,minmax(230px,1fr));gap:20px 24px;margin-top:28px}
.nt-fld{display:flex;flex-direction:column;gap:8px}
.nt-lbl{font-weight:600;font-size:12px;letter-spacing:.06em;text-transform:uppercase;color:var(--muted)}
.nt-in{width:100%;padding:13px 15px;font-size:15px;font-family:inherit;color:var(--ink);background:var(--bg);border:1px solid var(--line);border-radius:11px;outline:none}
.nt-in:focus{border-color:var(--accent)}
.nt-sel-wrap{position:relative}
.nt-sel-wrap select{-webkit-appearance:none;appearance:none;padding-right:40px;cursor:pointer;width:100%}
.nt-sel-caret{position:absolute;right:15px;top:50%;transform:translateY(-50%);color:#A1A1AA;pointer-events:none;font-size:12px}
.nt-cta{margin-top:30px;padding:14px 30px;font-size:15px;font-weight:700;color:#fff;background:var(--accent);border:none;border-radius:12px;cursor:pointer;box-shadow:0 6px 16px rgba(207,74,44,.26)}
.nt-cta:hover{background:#B83F23}
.nt-cta:disabled{opacity:.6;cursor:default}
.nt-cta-sm{margin-top:0;padding:12px 18px;display:inline-flex;align-items:center;gap:10px}
.nt-copy{font-size:13px;opacity:.85}
.nt-ghost{padding:12px 22px;font-size:14px;font-weight:700;color:#27272A;background:transparent;border:1.5px solid #D4D4D8;border-radius:11px;cursor:pointer}
.nt-ghost:hover{border-color:var(--ink)}
.nt-coupon-card{margin-top:26px;border:1px solid var(--line);border-radius:16px;padding:22px;display:flex;flex-direction:column;gap:20px}
.nt-coupon-row{display:flex;align-items:center;justify-content:space-between;gap:16px;flex-wrap:wrap}
.nt-coupon-name{font-weight:700;font-size:16px;display:flex;align-items:center;gap:8px}
.nt-pill-green{font-size:11px;font-weight:700;color:#15803D;background:#ECFDF3;padding:3px 9px;border-radius:99px;text-transform:uppercase;letter-spacing:.04em}
.nt-coupon-desc p{margin:6px 0 0;font-size:14px;line-height:1.55;color:var(--muted)}
.nt-empty{margin-top:26px;padding:22px;border:1px dashed var(--line);border-radius:14px;color:var(--muted);font-size:14.5px}
.nt-embed{margin-top:18px}
.nt-settings{margin-top:28px;display:flex;flex-direction:column;gap:14px}
.nt-toggle{display:flex;align-items:center;justify-content:space-between;gap:16px;padding:18px 20px;border:1px solid var(--line);border-radius:14px;cursor:pointer}
.nt-toggle-t{display:block;font-weight:600;font-size:15px;color:var(--ink)}
.nt-toggle-d{display:block;margin-top:3px;font-size:13px;color:var(--muted)}
.nt-switch{flex-shrink:0;width:46px;height:26px;border-radius:99px;background:#D4D4D8;position:relative;transition:background .18s}
.nt-switch i{position:absolute;top:3px;left:3px;width:20px;height:20px;border-radius:50%;background:#fff;transition:left .18s}
.nt-switch.on{background:var(--green)}
.nt-switch.on i{left:23px}
.nt-danger{display:flex;align-items:center;justify-content:space-between;gap:16px;padding:18px 20px;border:1px solid #E8C9C0;background:#FEF3F2;border-radius:14px;margin-top:6px}
.nt-danger-t{font-weight:700;font-size:15px;color:#A23A26}
.nt-danger-d{margin-top:3px;font-size:13px;color:#9A6A5E;line-height:1.4}
.nt-danger-btn{flex-shrink:0;padding:12px 22px;font-size:14px;font-weight:700;color:#B42318;background:transparent;border:1.5px solid #D88B7C;border-radius:11px;cursor:pointer}
.nt-danger-btn:hover{background:#B42318;color:#fff;border-color:#B42318}
.nt-logout{display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;min-height:460px;gap:6px}
.nt-logout-ic{width:64px;height:64px;border-radius:50%;background:var(--badge);color:var(--accent);display:flex;align-items:center;justify-content:center;font-size:28px;margin-bottom:6px}
.nt-logout-actions{display:flex;gap:12px;margin-top:22px}
/* states */
.nt-state{margin-top:24px;font-size:15px;color:var(--muted)}
.nt-state-err{color:#A23A26}
.nt-link{background:none;border:none;color:var(--accent);font-weight:700;cursor:pointer;text-decoration:underline}
.nt-empty-box{margin-top:24px;border:1px dashed var(--line);border-radius:16px;padding:40px 24px;text-align:center;color:var(--muted)}
.nt-empty-ic{font-size:34px;color:var(--accent)}
.nt-empty-t{margin-top:8px;font-weight:700;font-size:17px;color:var(--ink)}
.nt-empty-box p{margin:6px 0 16px;font-size:14px}
/* My Trips accordion */
.nt-bookings{margin-top:18px;display:flex;flex-direction:column;gap:12px}
.nt-bk{border:1px solid var(--line);border-radius:16px;overflow:hidden;background:#fff}
.nt-bk-head{width:100%;display:flex;align-items:center;justify-content:space-between;gap:14px;padding:18px 20px;background:transparent;border:none;cursor:pointer;text-align:left}
.nt-bk-ttl{display:flex;flex-direction:column;gap:3px;min-width:0}
.nt-bk-name{font-weight:700;font-size:16px;color:var(--ink)}
.nt-bk-sub{font-size:12.5px;color:var(--muted)}
.nt-bk-right{display:flex;align-items:center;gap:12px;flex-shrink:0}
.nt-stat{font-size:11.5px;font-weight:700;padding:5px 11px;border-radius:99px;text-transform:uppercase;letter-spacing:.03em}
.nt-stat.ok{background:#ECFDF3;color:#15803D}
.nt-stat.warn{background:#FBEBD9;color:#9C5A12}
.nt-stat.muted{background:#EFE7DA;color:var(--muted)}
.nt-caret{color:var(--muted);font-size:13px;transition:transform .2s}
.nt-bk[data-open="true"] .nt-caret{transform:rotate(180deg)}
.nt-bk-body{padding:0 20px 20px;border-top:1px solid var(--line-soft)}
.nt-bk-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:14px;padding:18px 0}
.nt-bk-cell{display:flex;flex-direction:column;gap:4px}
.nt-k{font-size:12px;color:var(--muted)}
.nt-v{font-size:14px;font-weight:600;color:var(--ink)}
.nt-li-box{margin-top:6px;border:1px solid var(--line);border-radius:12px;overflow:hidden}
.nt-li-row{display:grid;grid-template-columns:1fr auto auto;gap:12px;align-items:center;padding:12px 16px;font-size:13.5px;color:var(--ink);border-bottom:1px solid var(--line-soft)}
.nt-li-row:last-child{border-bottom:none}
.nt-li-qty{color:var(--muted);text-align:right}
.nt-li-row span:last-child{text-align:right;font-weight:600}
.nt-li-due{background:var(--bg);font-weight:700}
.nt-li-due span:last-child{font-weight:800}
.nt-green{color:#15803D;font-weight:600}
.nt-policy{margin-top:14px;background:none;border:none;padding:0;font-size:13px;font-weight:600;color:var(--muted);text-decoration:underline;cursor:pointer}
.nt-policy:hover{color:var(--accent)}
.nt-pay-rem{color:var(--accent)}
/* pagination */
.nt-pager{display:flex;align-items:center;justify-content:center;gap:6px;margin-top:18px;flex-wrap:wrap}
.nt-pg-btn{padding:8px 14px;font-size:13px;font-weight:600;color:var(--ink);background:#fff;border:1px solid var(--line);border-radius:9px;cursor:pointer}
.nt-pg-btn:disabled{opacity:.4;cursor:default}
.nt-pg-num{width:34px;height:34px;font-size:13.5px;font-weight:700;color:var(--muted);background:#fff;border:1px solid var(--line);border-radius:9px;cursor:pointer}
.nt-pg-num.on{background:var(--accent);color:#fff;border-color:var(--accent)}
.nt-pay{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-top:14px;padding:14px 16px;background:var(--bg);border:1px solid var(--line);border-radius:12px}
.nt-pay-cell{display:flex;flex-direction:column;gap:3px;font-size:13px;color:var(--muted)}
.nt-pay-cell strong{font-size:17px;color:var(--ink)}
.nt-balance{margin-top:14px;display:flex;align-items:center;justify-content:space-between;gap:14px;flex-wrap:wrap;padding:14px 16px;background:#FFF7EE;border:1px solid #F0DEC6;border-radius:12px;font-size:13px;color:#7a5a2e}
/* Saved Trips grid */
.nt-saved{margin-top:18px;display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:18px}
.nt-card{border:1px solid var(--line);border-radius:16px;overflow:hidden;background:#fff;display:flex;flex-direction:column}
.nt-card-img{position:relative;aspect-ratio:16/10;overflow:hidden;cursor:pointer;background:var(--line-soft)}
.nt-card-img img{width:100%;height:100%;object-fit:cover;display:block}
.nt-card-ph{width:100%;height:100%;background:linear-gradient(135deg,#E9DFCF,#D4D4D8)}
.nt-heart{position:absolute;top:10px;right:10px;width:34px;height:34px;border-radius:50%;border:none;background:rgba(255,253,249,.92);color:var(--accent);font-size:16px;cursor:pointer;display:flex;align-items:center;justify-content:center;box-shadow:0 2px 8px rgba(0,0,0,.12)}
.nt-heart:hover{background:#fff}
.nt-heart:disabled{opacity:.5}
.nt-rate{position:absolute;left:10px;bottom:10px;background:rgba(34,28,23,.85);color:#FFE9B0;font-size:12px;font-weight:700;padding:3px 9px;border-radius:99px}
.nt-card-body{padding:14px 16px;display:flex;flex-direction:column;gap:7px;flex:1}
.nt-card-ttl{font-weight:700;font-size:15.5px;color:var(--ink);cursor:pointer;line-height:1.3}
.nt-card-loc{font-size:13px;color:var(--muted)}
.nt-card-row{display:flex;align-items:center;justify-content:space-between;gap:8px;margin-top:2px}
.nt-card-price{font-weight:700;font-size:15px;color:var(--ink)}
.nt-per{font-weight:400;font-size:12px;color:var(--muted)}
.nt-card-dur{font-size:12.5px;color:var(--muted)}
.nt-card-cta{margin-top:8px;padding:10px;font-size:13.5px;font-weight:700;color:var(--accent);background:transparent;border:1.5px solid var(--accent);border-radius:10px;cursor:pointer}
.nt-card-cta:hover{background:var(--accent);color:#fff}
/* Reviews tab */
.nt-rv-h{margin:22px 0 0;font-weight:700;font-size:17px;color:var(--ink)}
.nt-rv-empty{margin-top:12px;padding:16px 18px;border:1px dashed var(--line);border-radius:12px;color:var(--muted);font-size:14px}
.nt-rv-pending{margin-top:12px;display:flex;flex-direction:column;gap:12px}
.nt-rv-card{display:flex;align-items:center;gap:14px;border:1px solid var(--line);border-radius:14px;padding:12px 14px;background:#fff}
.nt-rv-img{width:72px;height:54px;border-radius:10px;object-fit:cover;flex-shrink:0}
.nt-rv-ph{background:linear-gradient(135deg,#E9DFCF,#D4D4D8)}
.nt-rv-body{flex:1;min-width:0}
.nt-rv-title{font-weight:700;font-size:15px;color:var(--ink)}
.nt-rv-meta{font-size:12.5px;color:var(--muted);margin-top:2px}
.nt-rv-list{margin-top:12px;display:flex;flex-direction:column;gap:12px}
.nt-rv-item{border:1px solid var(--line);border-radius:14px;padding:16px 18px;background:#fff}
.nt-rv-item-head{display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap}
.nt-rv-text{margin:8px 0 0;font-size:14px;line-height:1.55;color:var(--text,#3F3F46)}
.nt-rv-photos{display:flex;gap:8px;margin-top:10px;flex-wrap:wrap}
.nt-rv-photos img{width:64px;height:64px;border-radius:10px;object-fit:cover}
.nt-stars{display:inline-flex;gap:2px}
.nt-star{background:none;border:none;padding:0;color:#D4D4D8;line-height:1}
.nt-star.on{color:#18181B}
.nt-rv-overlay{position:fixed;inset:0;background:rgba(34,28,23,.45);z-index:1400;display:flex;align-items:center;justify-content:center;padding:16px}
.nt-rv-modal{width:100%;max-width:520px;max-height:90vh;overflow:auto;background:var(--bg);border:1px solid var(--line);border-radius:18px;padding:24px}
.nt-rv-modal-head{display:flex;align-items:flex-start;justify-content:space-between;gap:12px}
.nt-rv-x{background:none;border:none;font-size:16px;color:var(--muted);cursor:pointer;padding:4px}
.nt-rv-ta{resize:vertical;margin-top:8px;width:100%}
.nt-rv-rec{display:flex;gap:10px;margin-top:8px}
.nt-chiplet{padding:9px 18px;font-size:13.5px;font-weight:600;color:var(--muted);background:#fff;border:1.5px solid var(--line);border-radius:999px;cursor:pointer}
.nt-chiplet.on{border-color:var(--accent);color:var(--accent);background:var(--badge)}
.nt-rv-photo-row{display:flex;gap:10px;margin-top:8px;flex-wrap:wrap}
.nt-rv-thumb{position:relative;width:64px;height:64px}
.nt-rv-thumb img{width:100%;height:100%;border-radius:10px;object-fit:cover}
.nt-rv-thumb-x{position:absolute;top:-6px;right:-6px;width:20px;height:20px;border-radius:50%;border:none;background:var(--ink);color:#fff;font-size:10px;cursor:pointer;line-height:1}
.nt-rv-add{width:64px;height:64px;border:1.5px dashed var(--line);border-radius:10px;background:none;font-size:22px;color:var(--muted);cursor:pointer}
.nt-rv-add:hover{border-color:var(--accent);color:var(--accent)}
.nt-rv-actions{display:flex;justify-content:flex-end;gap:10px;margin-top:22px}
@media(max-width:860px){
  /* minmax(0,1fr): a plain 1fr track has min-width:auto and grows to fit
     no-wrap content (the tab strip), dragging the whole page wider than the
     viewport. Clamp the track + let grid children shrink. */
  .nt-grid{grid-template-columns:minmax(0,1fr)}
  .nt-side,.nt-panel{min-width:0;max-width:100%}
  .nt-side{position:static}
  .nt-tabs{flex-direction:row;flex-wrap:wrap;gap:8px}
  .nt-tab{width:auto;flex:1 1 auto;justify-content:center}
  .nt-pay{grid-template-columns:1fr}
}
/* Phone: compact app-like profile. Desktop untouched. */
@media(max-width:560px){
  .nt-profile{padding:16px 14px 40px}
  /* header card: avatar + name in one row, tabs scroll horizontally */
  .nt-side{padding:16px 14px;border-radius:18px}
  .nt-side-top{flex-direction:row;text-align:left;gap:14px;padding-bottom:14px}
  .nt-av-wrap{width:56px;height:56px;flex-shrink:0}
  .nt-av-dot{width:16px;height:16px;border-width:2px}
  .nt-name{margin-top:0;font-size:18px}
  .nt-tabs{margin-top:12px;flex-wrap:nowrap;overflow-x:auto;scrollbar-width:none;-webkit-overflow-scrolling:touch;padding-bottom:2px}
  .nt-tabs::-webkit-scrollbar{display:none}
  .nt-tab{flex:0 0 auto;min-height:44px;padding:10px 14px;font-size:14px;white-space:nowrap}
  /* panel */
  .nt-panel{padding:20px 16px;border-radius:18px;min-height:0}
  .nt-h2{font-size:22px}
  .nt-sub{font-size:14px}
  .nt-form{grid-template-columns:1fr;gap:16px;margin-top:22px}
  .nt-in{font-size:16px;padding:13px 14px} /* >=16px stops iOS focus zoom */
  .nt-cta{width:100%;margin-top:24px;min-height:48px}
  .nt-ghost{min-height:44px}
  .nt-avatar-row{gap:14px;margin-top:20px}
  /* my trips */
  .nt-bk-head{padding:14px 14px;gap:10px}
  .nt-bk-name{font-size:15px}
  .nt-bk-body{padding:0 14px 16px}
  .nt-bk-grid{grid-template-columns:1fr 1fr;gap:12px;padding:14px 0}
  .nt-li-row{grid-template-columns:1fr auto;padding:10px 12px;font-size:13px}
  .nt-li-qty{display:none} /* qty math hidden on tiny widths; total stays */
  .nt-balance{flex-direction:column;align-items:stretch;text-align:left}
  .nt-balance .nt-cta-sm{width:100%;justify-content:center;min-height:46px}
  /* pagination: 40px+ taps */
  .nt-pg-num{width:40px;height:40px}
  .nt-pg-btn{min-height:40px}
  /* saved trips */
  .nt-saved{grid-template-columns:1fr;gap:14px}
  .nt-heart{width:40px;height:40px}
  .nt-card-cta{min-height:44px}
  /* settings + logout */
  .nt-toggle{padding:14px 14px}
  .nt-danger{flex-direction:column;align-items:stretch;text-align:left}
  .nt-danger-btn{width:100%;min-height:44px}
  .nt-logout{min-height:340px}
  .nt-logout-actions{width:100%;flex-direction:column-reverse}
  .nt-logout-actions .nt-cta,.nt-logout-actions .nt-ghost{width:100%;margin-top:0}
  /* My Reviews — consistent spacing, aligned cards, right-sized CTA */
  .nt-rv-h{margin-top:22px;font-size:15px}
  .nt-rv-pending,.nt-rv-list{gap:10px;margin-top:10px}
  .nt-rv-empty{margin-top:10px;font-size:13.5px}
  /* pending card: image + text inline, Write-review button wraps full-width
     below so it never crams the text or overflows */
  .nt-rv-card{flex-wrap:wrap;align-items:center;gap:10px 12px;padding:12px}
  .nt-rv-img{width:56px;height:56px}
  .nt-rv-body{flex:1 1 140px;min-width:0}
  .nt-rv-title{font-size:14.5px;line-height:1.3;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
  .nt-rv-meta{font-size:12px}
  .nt-rv-card .nt-cta-sm{flex:1 1 100%;justify-content:center;margin-top:2px;padding:11px 16px;min-height:44px;font-size:13.5px}
  /* submitted review item */
  .nt-rv-item{padding:14px}
  .nt-rv-item-head{gap:8px}
  .nt-rv-text{font-size:13.5px;margin-top:8px}
  .nt-rv-photos img{width:56px;height:56px}
  /* review modal + toast fit small screens */
  .nt-rv-modal{padding:18px 16px;border-radius:16px}
  .nt-rv-actions{flex-direction:column-reverse;gap:8px}
  .nt-rv-actions .nt-cta,.nt-rv-actions .nt-ghost{width:100%}
  .nt-toast{width:calc(100% - 32px);max-width:420px;text-align:center}
}
`;

export default UserProfile;
