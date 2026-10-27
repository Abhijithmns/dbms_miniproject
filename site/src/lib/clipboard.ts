/**
 * Copy text to the clipboard, then call `done`. Uses the Clipboard API where the page is a
 * secure context and falls back to a hidden textarea (older browsers, plain http).
 */
export function copyText(text: string, done: () => void) {
  const fallback = () => {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.setAttribute("readonly", "");
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    try {
      document.execCommand("copy");
    } catch {}
    document.body.removeChild(ta);
    done();
  };
  if (navigator.clipboard && window.isSecureContext) navigator.clipboard.writeText(text).then(done, fallback);
  else fallback();
}

/** The page's address without its #fragment, plus an optional new one. */
export const pageUrl = (hash = "") => window.location.href.split("#")[0] + hash;
