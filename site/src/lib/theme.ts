/** Light/dark theme settings shared by the boot script (src/app/layout.tsx) and ThemeToggle. */

/** localStorage key for the reader's choice: "dark" or "light". Anything else follows the system. */
export const THEME_KEY = "getit-theme";

export const themeLabel = (dark: boolean) => (dark ? "Switch to light theme" : "Switch to dark theme");

/**
 * Runs in <head> before the page paints, so there's no flash: marks JavaScript as available
 * (scroll reveals), applies the theme (a stored "dark" or "light" wins; anything else, or nothing,
 * follows the system) and, as soon as the page is parsed, gives the theme button its state,
 * before React has loaded.
 */
export const themeScript = `(function(){var d=document.documentElement;d.classList.add('js');try{var t=localStorage.getItem('${THEME_KEY}');if(t==='dark'||(t!=='light'&&window.matchMedia('(prefers-color-scheme: dark)').matches))d.classList.add('dark')}catch(e){}document.addEventListener('DOMContentLoaded',function(){var on=d.classList.contains('dark');document.querySelectorAll('[data-theme-toggle]').forEach(function(b){b.setAttribute('aria-pressed',String(on));b.setAttribute('aria-label',on?'${themeLabel(true)}':'${themeLabel(false)}')})})})();`;
