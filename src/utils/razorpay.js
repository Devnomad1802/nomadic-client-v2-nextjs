// Ensures the Razorpay Checkout script is available before we construct a
// `new window.Razorpay(...)`.
//
// Why this exists: the script is injected by next/script in the root layout,
// but it loads asynchronously. Between the moment the page becomes interactive
// and the moment the script finishes, `window.Razorpay` is undefined — a window
// of ~0.8s (cached) to ~1.7s+ (cold), measured on production. A click inside
// that window used to throw `TypeError: window.Razorpay is not a constructor`,
// which the callers caught and turned into the generic /paymentfail page. The
// same happens indefinitely when an ad/privacy blocker blocks the request.
//
// `ensureRazorpay()` resolves with the Razorpay constructor once it is ready,
// injecting the script on demand as a fallback, and rejects with a typed Error
// (`code`) when it genuinely cannot load — so callers can show an accurate
// message instead of a generic failure.

const SRC = "https://checkout.razorpay.com/v1/checkout.js";

// Reasons a caller can branch on / forward to the failure page.
export const RZP_LOAD_ERROR = "init";

let loaderPromise = null;

/**
 * @param {{ timeout?: number }} [opts]
 * @returns {Promise<any>} the `window.Razorpay` constructor
 */
export function ensureRazorpay({ timeout = 15000 } = {}) {
  if (typeof window === "undefined" || typeof document === "undefined") {
    return Promise.reject(makeErr("RAZORPAY_NO_WINDOW"));
  }
  if (window.Razorpay) return Promise.resolve(window.Razorpay);
  if (loaderPromise) return loaderPromise;

  loaderPromise = new Promise((resolve, reject) => {
    let settled = false;
    const finish = (err) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      clearInterval(poll);
      if (!err && window.Razorpay) {
        resolve(window.Razorpay);
        return;
      }
      // Any failure path clears the cached promise so a later retry can try again.
      loaderPromise = null;
      reject(err || makeErr("RAZORPAY_UNAVAILABLE"));
    };

    const timer = setTimeout(() => finish(makeErr("RAZORPAY_TIMEOUT")), timeout);
    // Covers the race where the existing tag fired `load` before we attached,
    // and the case where it loads without a listener we control.
    const poll = setInterval(() => {
      if (window.Razorpay) finish();
    }, 120);

    const existing = document.querySelector(`script[src="${SRC}"]`);
    if (existing) {
      existing.addEventListener("load", () => finish(), { once: true });
      existing.addEventListener("error", () => finish(makeErr("RAZORPAY_BLOCKED")), { once: true });
      return;
    }

    const s = document.createElement("script");
    s.src = SRC;
    s.async = true;
    s.onload = () => finish();
    s.onerror = () => finish(makeErr("RAZORPAY_BLOCKED"));
    document.body.appendChild(s);
  });

  return loaderPromise;
}

function makeErr(code) {
  const e = new Error(code);
  e.code = code;
  return e;
}
