import React from "react";
import { TextField, ImageField } from "./Field";
import BrandLogosEditor from "./BrandLogosEditor";

function Group({ title, hint, children }) {
  return (
    <section className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
      <h3 className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#ff5833] mb-1">{title}</h3>
      {hint && <p className="text-[11px] text-white/30 mb-3">{hint}</p>}
      <div className="grid gap-3 mt-3">{children}</div>
    </section>
  );
}

export default function SettingsPanel({ settings = {}, onChange }) {
  const set = (key) => (v) => onChange({ [key]: v });

  return (
    <div className="space-y-3">
      <Group title="SEO" hint="Se inyectan en el <head> de la página.">
        <TextField label="Título SEO" value={settings.seo_title} onChange={set("seo_title")} />
        <TextField
          label="Meta description"
          value={settings.seo_description}
          onChange={set("seo_description")}
          textarea
          rows={3}
        />
        <ImageField label="og:image" value={settings.og_image_url} onChange={set("og_image_url")} />
      </Group>

      <Group title="Navegación y botones">
        <div className="grid grid-cols-2 gap-3">
          <TextField label="Botón acceso · texto" value={settings.login_label} onChange={set("login_label")} />
          <TextField label="Botón acceso · enlace" value={settings.login_url} onChange={set("login_url")} />
        </div>
        <TextField label="Botón solicitud · texto" value={settings.request_label} onChange={set("request_label")} />
        <TextField label="Título del carrusel de marcas" value={settings.brand_strip_title} onChange={set("brand_strip_title")} />
      </Group>

      <Group title="Contacto">
        <div className="grid grid-cols-2 gap-3">
          <TextField label="Email" value={settings.contact_email} onChange={set("contact_email")} />
          <TextField label="Ciudad" value={settings.city} onChange={set("city")} />
        </div>
        <TextField label="Enlace de sesión · texto" value={settings.booking_label} onChange={set("booking_label")} />
        <TextField label="Enlace de sesión · URL" value={settings.booking_url} onChange={set("booking_url")} />
      </Group>

      <Group title="Redes" hint="Deja un campo vacío para ocultar ese enlace.">
        <TextField label="Instagram" value={settings.social_instagram} onChange={set("social_instagram")} placeholder="https://instagram.com/…" />
        <TextField label="TikTok" value={settings.social_tiktok} onChange={set("social_tiktok")} placeholder="https://tiktok.com/@…" />
        <TextField label="YouTube" value={settings.social_youtube} onChange={set("social_youtube")} placeholder="https://youtube.com/@…" />
      </Group>

      <Group title="Logos de marcas">
        <BrandLogosEditor />
      </Group>

      <Group title="Vídeos e imágenes" hint="Formatos ligeros (MP4/WebM) para que el hero cargue rápido en móvil.">
        <ImageField label="Vídeo del hero (escritorio)" value={settings.hero_media_url} onChange={set("hero_media_url")} />
        <ImageField label="Vídeo del hero (móvil)" value={settings.hero_media_mobile_url} onChange={set("hero_media_mobile_url")} />
        <ImageField label="Poster del hero / og:image" value={settings.hero_poster_url} onChange={set("hero_poster_url")} />
        <ImageField label="Vídeo del recorrido" value={settings.journey_media_url} onChange={set("journey_media_url")} />
        <ImageField label="Imagen de la tarjeta de acceso" value={settings.access_card_image_url} onChange={set("access_card_image_url")} />
      </Group>

      <Group title="Quién está detrás">
        <TextField label="Nombre" value={settings.weber_name} onChange={set("weber_name")} />
        <ImageField label="Foto" value={settings.weber_photo_url} onChange={set("weber_photo_url")} />
        <ImageField label="Imagen de fondo" value={settings.weber_bg_url} onChange={set("weber_bg_url")} />
        <TextField label="Frase" value={settings.weber_line} onChange={set("weber_line")} textarea rows={3} />
      </Group>

      <Group title="Recorrido (Explora · Descubre · Lanza)">
        {[1, 2, 3].map((n) => (
          <div key={n} className="grid gap-2 pb-2 border-b border-white/5 last:border-0 last:pb-0">
            <TextField
              label={`Paso ${n} · titular`}
              value={settings[`journey_step${n}_title`]}
              onChange={set(`journey_step${n}_title`)}
            />
            <TextField
              label={`Paso ${n} · texto`}
              value={settings[`journey_step${n}_text`]}
              onChange={set(`journey_step${n}_text`)}
            />
          </div>
        ))}
      </Group>
    </div>
  );
}