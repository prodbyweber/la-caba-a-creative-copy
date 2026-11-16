import React from "react";
import { Link } from "react-router-dom";

function smoothScroll(e, href) {
  const el = document.querySelector(href);
  if (!el) return;
  e.preventDefault();
  el.scrollIntoView({ behavior: "smooth", block: "start" });
}

export default function CtaButton({
  label,
  href,
  variant = "primary",
  onAccess,
  className = "",
  onClick,
}) {
  if (!label) return null;
  const cls = `cc-btn cc-btn--${variant} ${className}`.trim();

  if (!href || href.startsWith("modal:")) {
    return (
      <button
        type="button"
        className={cls}
        onClick={() => {
          onAccess?.();
          onClick?.();
        }}
      >
        {label}
      </button>
    );
  }

  if (/^https?:\/\//.test(href) || /^mailto:|^tel:/.test(href)) {
    return (
      <a className={cls} href={href} target="_blank" rel="noopener noreferrer">
        {label}
      </a>
    );
  }

  if (href.startsWith("#")) {
    return (
      <a className={cls} href={href} onClick={(e) => smoothScroll(e, href)}>
        {label}
      </a>
    );
  }

  return (
    <Link className={cls} to={href} onClick={onClick}>
      {label}
    </Link>
  );
}