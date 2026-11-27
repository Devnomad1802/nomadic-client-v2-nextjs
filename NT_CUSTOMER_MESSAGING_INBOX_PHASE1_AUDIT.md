# NT — Customer Messaging Inbox + Unread Notifications — PHASE 1 AUDIT (read-only)

Date: 2026-11-27. Status: **audit only. No code, data, config, branch or deploy changed.**
Directive: NT_Customer_Messaging_Notifications_Claude.md (Phase 1 = read-only audit, STOP for approval).

## What already exists (reuse — do NOT rebuild)

### Server (nomadic-server-v2)
| Piece | Location | Notes |
|---|---|---|
| Thread store | models/enquire.js | ONE `Enquire` per `(userId, hostId)`. `chat[]`, `hostUnread`, `userUnread`, `moderation`, now `chat.$.notify` (email status). Single source of truth. |
| Customer endpoints | routes/hostChat.js (passport JWT) → controllers/hostChat.js | `POST /host-chat/start`, `GET /host-chat/mine`, `POST /host-chat/:id/message`, `POST /host-chat/:id/read`. Identity from JWT, ownership enforced (`userId: req.user._id`). |
| Host side | controllers/hostPortal.js `replyToEnquiry` + list + markRead | Same thread; `userUnread++` on host reply. |
| Admin oversight | controllers/hostChat.js `getAdminConversations` / `getAdminConversation` | Read-only, admin-only, preserves edit/delete history. |
| Email notify | services/chatNotifications.js (just shipped, 6a16973) | Resend, both directions, portal CTA, delivery status on `chat.$.notify`. |
| Moderation | utils/contactModeration.js | Contact-sharing blocked, 3-strike 1h pause. |

### Client (nomadic-client-v2-nextjs)
| Piece | Location | Notes |
|---|---|---|
| Chat API | src/services/HostChatApi.js | start / mine / send / read all wired (RTK Query). |
| Global notifier | src/SmallComponents/ChatNotifier.jsx | **Already polls `/host-chat/mine` every 20s**, detects `userUnread` growth → toast + chime + deep-link. Mounted in app/providers.tsx + Parent.jsx. |
| Conversation UI | src/Component/Host/HostPage.jsx | Start/read/reply UI, but **bound to the host detail page** — not a standalone inbox. |
| UI state | src/utils/chatUiState.js | Tracks which convo drawer is open (suppresses self-toast). |

## Gaps vs directive (confirmed)

| # | Gap | Evidence | Severity |
|---|---|---|---|
| C1 | **No persistent Messages entry / unread badge in website nav.** | Navbar.jsx + Header.jsx have zero message/unread refs. | High (core ask) |
| C2 | **No standalone Messages page / inbox.** | No `app/messages` route; conversation UI only inside HostPage.jsx. | High |
| C3 | **Unread count is not surfaced globally.** | ChatNotifier computes growth for toasts but no nav badge; count derivable by summing `userUnread` from `/mine`. | High |
| C4 | **No dedicated unread-count endpoint.** | Only `/host-chat/mine` (returns full convos). Fine for small N; a cheap count endpoint avoids over-fetching for a badge. | Low/option |
| C5 | **Read state is a per-convo counter reset, not a per-message cursor.** | markHostChatRead sets `userUnread:0` on open. Directive allows "mark read when opened" — compliant; true per-message cursor is an enhancement, not required. | Low |
| C6 | **Duplicate stray files.** | src/services/`HostChatApi 2.js` (and any `ChatNotifier` dupes) — clean up to avoid drift. | Low |
| C7 | **Imported/assisted customers need activation to reach the inbox.** | importPayment creates `isVerified:false`, no password; thread keyed by `userId`. Access is JWT-gated (good — never by email string), but these customers must complete the existing OTP/activation to log in and see the thread. | Med (dependency) |

## Security review (current state — healthy)
- Endpoints JWT-authenticated; thread ownership enforced by `userId` from the session, never client-supplied. ✓
- Contact-sharing moderation + pause preserved. ✓
- Admin oversight separate and read-only. ✓
- Email CTA routes to the portal (login-gated), no direct-reply address, no token in URL. ✓ (deep link must re-verify membership after login — to confirm in Phase 2.)

## Proposed Phase 2 (after approval) — client-led, backend mostly ready

1. **Nav (client):** add an authenticated Messages icon next to profile (desktop) + persistent mobile nav, brand-styled. Server-derived unread badge (cap 99+, hidden at 0), hydrated from the data ChatNotifier already polls — single shared store, no new poll loop. Unauthenticated click → login with safe return URL.
2. **Inbox page (client):** `app/messages` — conversation list (host name/avatar, experience context, last message, timestamp, unread), newest-first, pagination + loading/empty/error. Conversation view reuses the HostPage chat UI, extracted into a shared `<HostConversation>` component (composer, send with idempotency, read-on-open, mobile back, safe scroll, draft-preserve on failure).
3. **Deep links:** email "Reply on Nomadic Townies" + trip contact actions open the correct existing thread (no duplicate threads); re-verify auth + membership after login.
4. **Server (small, optional):** `GET /host-chat/unread-count` → summed `userUnread` in one indexed query, so the badge doesn't fetch every conversation. Add an index on `{ userId: 1 }` for `enquires` if absent.
5. **Cleanup:** remove `HostChatApi 2.js` and any duplicate notifier.

## Decisions needed before Phase 2
- **D1 — unread badge source:** reuse ChatNotifier's `/mine` poll (zero new backend) vs add the cheap `/host-chat/unread-count` endpoint (recommended for scale).
- **D2 — rollout slice:** (a) nav badge + dropdown preview first, then full `/messages` page; or (b) both together.
- **D3 — imported/assisted access:** confirm the activation path (existing single-use OTP) is the gate for pending customers to reach the inbox; no email-string linking.

**STOP — read-only audit complete. Awaiting explicit approval + D1–D3 before any implementation (directive Phase 1 gate).**
