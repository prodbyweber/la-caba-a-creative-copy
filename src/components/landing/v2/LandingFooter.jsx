import React from "react";
import { Link } from "react-router-dom";
import { Instagram, Youtube, Music2 } from "lucide-react";

export default function LandingFooter({ settings }) {
  const socials = [
    settings?.social_instagram && { href: settings.social_instagram, label: "Instagram", icon: Instagram },
    settings?.social_tiktok && { href: settings.social_tiktok, label: "TikTok", icon: Music2 },
    settings?.social_youtube && { href: settings.social_youtube, label: "YouTube", icon: Youtube },
  ].filter(Boolean);

  return (
    <footer className="cc-footer">
      <div className="cc-wrap">
        <div className="cc-footer__grid">
          <div>
            <div className="cc-footer__brand">Cabaña Creative</div>
            <div className="cc-footer__links" style={{ marginTop: 14 }}>
              <Link to="/politica-de-privacidad">Política de privacidad</Link>
              <Link to="/aviso-legal">Aviso legal</Link>
              <Link to="/politica-de-cookies">Política de cookies</Link>
            </div>
          </div>

          {socials.length > 0 && (
            <div className="cc-footer__socials">
              {socials.map(({ href, label, icon: Icon }) => (
                <a key={label} href={href} target="_blank" rel="noopener noreferrer">
                  <Icon size={14} /> {label}
                </a>
              ))}
            </div>
          )}
        </div>

        <div className="cc-footer__bottom">
          <span>© 2026 Cabaña Creative</span>
          {settings?.contact_email && <span>{settings.contact_email}</span>}
        </div>
      </div>
    </footer>
  );
}