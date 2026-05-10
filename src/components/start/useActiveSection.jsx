import { useState, useEffect } from "react";

const SECTIONS = [
  { key: "hero",     href: "#hero" },
  { key: "about",    href: "#about" },
  { key: "artists",  href: "#artists" },
  { key: "brands",   href: "#brands" },
  { key: "explorar", href: "#explorar" },
  { key: "choose",   href: "#choose" },
  { key: "contact",  href: "#contact" },
];

export { SECTIONS };

export default function useActiveSection() {
  const [active, setActive] = useState("hero");

  useEffect(() => {
    const ids = SECTIONS.map(s => s.key);

    const observer = new IntersectionObserver(
      (entries) => {
        // Pick the entry that is most visible
        let best = null;
        let bestRatio = 0;
        entries.forEach(entry => {
          if (entry.isIntersecting && entry.intersectionRatio > bestRatio) {
            bestRatio = entry.intersectionRatio;
            best = entry.target.id;
          }
        });
        if (best) setActive(best);
      },
      { threshold: [0.3, 0.6] }
    );

    ids.forEach(id => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  return active;
}