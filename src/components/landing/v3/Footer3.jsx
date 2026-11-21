import React from "react";
import { Link } from "react-router-dom";
import { Instagram, Youtube, Music2, Mail, MapPin } from "lucide-react";
import { LOGO, NAV_ITEMS } from "./constants";

export default function Footer3({ settings }) {
  const socials = [
    settings?.social_instagram && { href: settings.social_instagram, label: "Instagram", icon: Instagram },
    settings?.social_tiktok && { href: settings.social_tiktok, label: "TikTok", icon: Music2 },
    settings?.social_youtube && { href: settings.social_youtube, label: "YouTube", icon: Youtube },
  ].filter(Boolean);

  return (
    <footer className="ccl-foot">
      <div className="ccl-wrap">
        <div className="ccl-foot__logo">
          <img src={LOGO} alt="Cabaña Creative" />
        </div>

        <div className="ccl-foot__cols">
          <div>
            <div className="ccl-foot__title">Navegación</div>
            <div className="ccl-foot__links">
              {NAV_ITEMS.map((item) => (
                <a key={item.id} href={`#${item.id}`}>
                  {item.label}
                </a>
              ))}
            </div>
          </div>

          <div>
            <div className="ccl-foot__title">Contacto</div>
            <div className="ccl-foot__links">
              {settings?.contact_email && (
                <a href={`mailto:${settings.contact_email}`}>
                  <Mail size={11} style={{ display: "inline", marginRight: 6 }} />
                  {settings.contact_email}
                </a>
              )}
              {settings?.city && (
                <span>
                  <MapPin size={11} style={{ display: "inline", marginRight: 6 }} />
                  {settings.city}
                </span>
              )}
              {socials.length > 0 && (
                <span className="ccl-foot__socials">
                  {socials.map(({ href, label, icon: Icon }) => (
                    <a key={label} href={href} target="_blank" rel="noopener noreferrer">
                      <Icon size={12} /> {label}
                    </a>
                  ))}
                </span>
              )}
            </div>
          </div>

          <div>
            <div className="ccl-foot__title">Legal</div>
            <div className="ccl-foot__links">
              <Link to="/politica-de-privacidad">Política de privacidad</Link>
              <Link to="/aviso-legal">Aviso legal</Link>
              <Link to="/politica-de-cookies">Política de cookies</Link>
            </div>
          </div>
        </div>

        <div className="ccl-foot__bottom">
          <span>© 2026 Cabaña Creative</span>
          <span>Producción musical · Madrid</span>
        </div>
      </div>
    </footer>
  );
}