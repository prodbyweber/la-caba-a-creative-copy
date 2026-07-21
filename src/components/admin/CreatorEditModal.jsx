import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Upload, Save, AlertTriangle, Loader2, Trash2 } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import CreatorDeleteConfirm from "@/components/admin/CreatorDeleteConfirm";

const inputStyle = {
  width: "100%", padding: "9px 11px",
  background: "rgba(0,0,0,0.35)", border: "1px solid rgba(255,255,255,0.1)",
  borderRadius: "8px", color: "#fff", fontSize: "12px", outline: "none",
};
const labelStyle = {
  fontSize: "10px", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase",
  color: "rgba(255,255,255,0.3)", marginBottom: "5px", display: "block",
};
const sectionStyle = {
  background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)",
  borderRadius: "12px", padding: "14px", marginBottom: "12px",
};

function Field({ label, children }) {
  return (
    <div style={{ flex: 1, minWidth: 0 }}>
      <label style={labelStyle}>{label}</label>
      {children}
    </div>
  );
}

function Text({ value, onChange, placeholder, type = "text" }) {
  return <input type={type} value={value ?? ""} onChange={e => onChange(e.target.value)} placeholder={placeholder} style={inputStyle} />;
}
function Area({ value, onChange, placeholder }) {
  return <textarea value={value ?? ""} onChange={e => onChange(e.target.value)} placeholder={placeholder} rows={3} style={{ ...inputStyle, resize: "vertical", lineHeight: 1.5 }} />;
}
function Select({ value, onChange, options }) {
  return (
    <select value={value ?? ""} onChange={e => onChange(e.target.value)} style={inputStyle}>
      {options.map(o => <option key={o} value={o}>{o}</option>)}
    </select>
  );
}

export default function CreatorEditModal({ creator, onClose }) {
  const queryClient = useQueryClient();
  const { artist, profile, platformUser } = creator;

  const userId = artist?.user_id || profile?.user_id || platformUser?.id || creator.userId;

  const [tab, setTab] = useState("data");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [uploading, setUploading] = useState(null); // 'artist' | 'profile' | null
  const [showDelete, setShowDelete] = useState(false);

  // Artist form
  const [af, setAf] = useState({
    stageName: artist?.stageName || "",
    legalName: artist?.legalName || "",
    email: artist?.email || "",
    phone: artist?.phone || "",
    location: artist?.location || "",
    nationality: artist?.nationality || "",
    country_of_residence: artist?.country_of_residence || "",
    status: artist?.status || "Lead",
    genre: artist?.genre || "",
    bio: artist?.bio || "",
    tags: (artist?.tags || []).join(", "),
    photo_position: artist?.photo_position || "center center",
    notes: artist?.notes || "",
    avatar_url: artist?.avatar_url || "",
    studio_hours_total: artist?.studio_hours_total || 0,
    ig: artist?.social_links?.instagram || "",
    yt: artist?.social_links?.youtube || "",
    tiktok: artist?.social_links?.tiktok || "",
    spotify: artist?.social_links?.spotify || "",
    applemusic: artist?.social_links?.applemusic || "",
  });

  // Profile form
  const [pf, setPf] = useState({
    username: profile?.username || "",
    display_name: profile?.display_name || "",
    artist_name: profile?.artist_name || "",
    first_name: profile?.first_name || "",
    last_name: profile?.last_name || "",
    full_name: profile?.full_name || "",
    bio: profile?.bio || "",
    contact_email: profile?.contact_email || "",
    phone: profile?.phone || "",
    phone_country_code: profile?.phone_country_code || "",
    nationality: profile?.nationality || "",
    country_of_residence: profile?.country_of_residence || "",
    address: profile?.address || "",
    photo_position: profile?.photo_position || "center center",
    role_tags: (profile?.role_tags || []).join(", "),
    avatar_url: profile?.avatar_url || profile?.profile_photo_url || "",
  });

  const [userRole, setUserRole] = useState(platformUser?.role || "user");

  const setA = (k) => (v) => setAf(s => ({ ...s, [k]: v }));
  const setP = (k) => (v) => setPf(s => ({ ...s, [k]: v }));

  const uploadImage = async (file, target) => {
    if (!file) return;
    setUploading(target);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      if (target === "artist") setAf(s => ({ ...s, avatar_url: file_url }));
      else setPf(s => ({ ...s, avatar_url: file_url }));
    } catch (e) {
      // ignore
    } finally {
      setUploading(null);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    const tasks = [];

    if (artist?.id) {
      const payload = {
        stageName: af.stageName,
        legalName: af.legalName,
        email: af.email,
        phone: af.phone,
        location: af.location,
        nationality: af.nationality,
        country_of_residence: af.country_of_residence,
        status: af.status,
        genre: af.genre,
        bio: af.bio,
        tags: af.tags.split(",").map(t => t.trim()).filter(Boolean),
        photo_position: af.photo_position,
        notes: af.notes,
        avatar_url: af.avatar_url,
        studio_hours_total: Number(af.studio_hours_total) || 0,
        social_links: {
          instagram: af.ig, youtube: af.yt, tiktok: af.tiktok, spotify: af.spotify, applemusic: af.applemusic,
        },
      };
      tasks.push(base44.entities.Artist.update(artist.id, payload));
    }

    if (profile?.id) {
      const payload = {
        username: pf.username,
        display_name: pf.display_name,
        artist_name: pf.artist_name,
        first_name: pf.first_name,
        last_name: pf.last_name,
        full_name: pf.full_name,
        bio: pf.bio,
        contact_email: pf.contact_email,
        phone: pf.phone,
        phone_country_code: pf.phone_country_code,
        nationality: pf.nationality,
        country_of_residence: pf.country_of_residence,
        address: pf.address,
        photo_position: pf.photo_position,
        role_tags: pf.role_tags.split(",").map(t => t.trim()).filter(Boolean),
        avatar_url: pf.avatar_url,
        profile_photo_url: pf.avatar_url,
      };
      tasks.push(base44.entities.UserProfile.update(profile.id, payload));
    }

    if (platformUser?.id) {
      tasks.push(base44.entities.User.update(platformUser.id, { role: userRole }));
    }

    try {
      await Promise.all(tasks);
    } finally {
      setSaving(false);
    }

    queryClient.invalidateQueries({ queryKey: ["artists"] });
    queryClient.invalidateQueries({ queryKey: ["all-user-profiles"] });
    queryClient.invalidateQueries({ queryKey: ["platform-users"] });

    setSaved(true);
    setTimeout(() => setSaved(false), 1800);
  };

  const hasAnything = artist || profile || platformUser;

  return (
    <AnimatePresence>
      <motion.div
        key="overlay"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose}
        style={{
          position: "fixed", inset: 0, zIndex: 9999,
          background: "rgba(0,0,0,0.85)", backdropFilter: "blur(12px)",
          display: "flex", alignItems: "center", justifyContent: "center", padding: "16px",
        }}
      >
        <motion.div
          key="panel"
          initial={{ opacity: 0, y: 24, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 16, scale: 0.98 }}
          transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
          onClick={e => e.stopPropagation()}
          style={{
            width: "100%", maxWidth: "480px", maxHeight: "90vh",
            background: "#111113", border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: "16px", overflow: "hidden", display: "flex", flexDirection: "column",
          }}
        >
          {/* Header */}
          <div style={{
            padding: "18px 20px 14px", borderBottom: "1px solid rgba(255,255,255,0.06)",
            display: "flex", alignItems: "center", gap: "12px", flexShrink: 0,
          }}>
            <div style={{
              width: "44px", height: "44px", borderRadius: "50%", overflow: "hidden", flexShrink: 0,
              background: "#1a1a1c", border: "1px solid rgba(255,255,255,0.1)",
            }}>
              {creator.avatarUrl ? (
                <img src={creator.avatarUrl} alt={creator.displayName}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              ) : (
                <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <span style={{ color: "rgba(255,255,255,0.2)", fontWeight: 900, fontSize: "16px" }}>
                    {creator.displayName?.[0]?.toUpperCase() || "?"}
                  </span>
                </div>
              )}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontFamily: "'Helvetica Neue', sans-serif", fontWeight: 700, fontSize: "15px", color: "#fff", margin: 0, letterSpacing: "-0.02em" }}>
                {creator.displayName}
              </p>
              {creator.email && (
                <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.3)", margin: "2px 0 0" }}>{creator.email}</p>
              )}
            </div>
            <button onClick={onClose} style={{
              width: "32px", height: "32px", borderRadius: "50%",
              background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)",
              display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer", flexShrink: 0, color: "rgba(255,255,255,0.4)",
            }}>
              <X size={14} />
            </button>
          </div>

          {/* Tabs */}
          <div style={{ display: "flex", gap: "4px", padding: "12px 20px 0", flexShrink: 0 }}>
            <button onClick={() => setTab("data")} style={{
              flex: 1, padding: "8px", fontSize: "12px", fontWeight: 700,
              borderRadius: "8px 8px 0 0", cursor: "pointer", border: "none",
              color: tab === "data" ? "#fff" : "rgba(255,255,255,0.35)",
              background: tab === "data" ? "rgba(255,255,255,0.05)" : "transparent",
              borderBottom: tab === "data" ? "2px solid #ff5833" : "2px solid transparent",
            }}>Editar datos</button>
            <button onClick={() => setTab("danger")} style={{
              flex: 1, padding: "8px", fontSize: "12px", fontWeight: 700,
              borderRadius: "8px 8px 0 0", cursor: "pointer", border: "none",
              color: tab === "danger" ? "#ef4444" : "rgba(255,255,255,0.35)",
              background: tab === "danger" ? "rgba(239,68,68,0.05)" : "transparent",
              borderBottom: tab === "danger" ? "2px solid #ef4444" : "2px solid transparent",
            }}>Eliminar</button>
          </div>

          {/* Body */}
          <div style={{ padding: "14px 20px 20px", overflowY: "auto" }}>

            {tab === "data" && (
              <>
                {!hasAnything && (
                  <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.4)" }}>No hay datos editables para este creador.</p>
                )}

                {/* Artist data */}
                {artist?.id && (
                  <div style={sectionStyle}>
                    <p style={{ fontSize: "11px", fontWeight: 700, color: "rgba(255,255,255,0.55)", margin: "0 0 12px", letterSpacing: "0.08em", textTransform: "uppercase" }}>
                      Ficha de artista
                    </p>

                    {/* Avatar upload */}
                    <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "12px" }}>
                      <div style={{ width: "48px", height: "48px", borderRadius: "50%", overflow: "hidden", background: "#1a1a1c", flexShrink: 0 }}>
                        {af.avatar_url ? <img src={af.avatar_url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : null}
                      </div>
                      <label style={{
                        padding: "7px 12px", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)",
                        borderRadius: "8px", fontSize: "11px", fontWeight: 600, color: "rgba(255,255,255,0.6)", cursor: "pointer",
        display: "flex", alignItems: "center", gap: "6px",
                      }}>
                        {uploading === "artist" ? <Loader2 size={12} className="animate-spin" /> : <Upload size={12} />}
                        {uploading === "artist" ? "Subiendo…" : "Cambiar avatar"}
                        <input type="file" accept="image/*" hidden onChange={e => uploadImage(e.target.files?.[0], "artist")} />
                      </label>
                    </div>

                    <div style={{ display: "flex", gap: "10px", marginBottom: "10px" }}>
                      <Field label="Nombre artístico"><Text value={af.stageName} onChange={setA("stageName")} /></Field>
                      <Field label="Nombre legal"><Text value={af.legalName} onChange={setA("legalName")} /></Field>
                    </div>
                    <div style={{ display: "flex", gap: "10px", marginBottom: "10px" }}>
                      <Field label="Email"><Text value={af.email} onChange={setA("email")} type="email" /></Field>
                      <Field label="Teléfono"><Text value={af.phone} onChange={setA("phone")} /></Field>
                    </div>
                    <div style={{ display: "flex", gap: "10px", marginBottom: "10px" }}>
                      <Field label="Ubicación"><Text value={af.location} onChange={setA("location")} /></Field>
                      <Field label="Género"><Text value={af.genre} onChange={setA("genre")} /></Field>
                    </div>
                    <div style={{ display: "flex", gap: "10px", marginBottom: "10px" }}>
                      <Field label="Nacionalidad"><Text value={af.nationality} onChange={setA("nationality")} /></Field>
                      <Field label="Residencia"><Text value={af.country_of_residence} onChange={setA("country_of_residence")} /></Field>
                    </div>
                    <div style={{ display: "flex", gap: "10px", marginBottom: "10px" }}>
                      <Field label="Estado">
                        <Select value={af.status} onChange={setA("status")} options={["Lead", "Active", "Inactive"]} />
                      </Field>
                      <Field label="Posición foto"><Text value={af.photo_position} onChange={setA("photo_position")} /></Field>
                    </div>
                    <div style={{ marginBottom: "10px" }}>
                      <Field label="Bio"><Area value={af.bio} onChange={setA("bio")} /></Field>
                    </div>
                    <div style={{ marginBottom: "10px" }}>
                      <Field label="Tags (separados por coma)"><Text value={af.tags} onChange={setA("tags")} /></Field>
                    </div>

                    <p style={{ ...labelStyle, marginTop: "4px" }}>Redes sociales</p>
                    <div style={{ display: "flex", gap: "10px", marginBottom: "10px" }}>
                      <Field label="Instagram"><Text value={af.ig} onChange={setA("ig")} /></Field>
                      <Field label="YouTube"><Text value={af.yt} onChange={setA("yt")} /></Field>
                    </div>
                    <div style={{ display: "flex", gap: "10px", marginBottom: "10px" }}>
                      <Field label="TikTok"><Text value={af.tiktok} onChange={setA("tiktok")} /></Field>
                      <Field label="Spotify"><Text value={af.spotify} onChange={setA("spotify")} /></Field>
                    </div>

                    <div style={{ display: "flex", gap: "10px", alignItems: "flex-end", marginBottom: "10px" }}>
                      <Field label="Horas de estudio">
                        <Text value={af.studio_hours_total} onChange={v => setA("studio_hours_total")(v)} type="number" />
                      </Field>
                    </div>

                    <div>
                      <Field label="Notas internas"><Area value={af.notes} onChange={setA("notes")} /></Field>
                    </div>
                  </div>
                )}

                {/* Profile data */}
                {profile?.id && (
                  <div style={sectionStyle}>
                    <p style={{ fontSize: "11px", fontWeight: 700, color: "rgba(255,255,255,0.55)", margin: "0 0 12px", letterSpacing: "0.08em", textTransform: "uppercase" }}>
                      Perfil de usuario
                    </p>

                    <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "12px" }}>
                      <div style={{ width: "48px", height: "48px", borderRadius: "50%", overflow: "hidden", background: "#1a1a1c", flexShrink: 0 }}>
                        {pf.avatar_url ? <img src={pf.avatar_url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : null}
                      </div>
                      <label style={{
                        padding: "7px 12px", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)",
                        borderRadius: "8px", fontSize: "11px", fontWeight: 600, color: "rgba(255,255,255,0.6)", cursor: "pointer",
        display: "flex", alignItems: "center", gap: "6px",
                      }}>
                        {uploading === "profile" ? <Loader2 size={12} className="animate-spin" /> : <Upload size={12} />}
                        {uploading === "profile" ? "Subiendo…" : "Cambiar foto"}
                        <input type="file" accept="image/*" hidden onChange={e => uploadImage(e.target.files?.[0], "profile")} />
                      </label>
                    </div>

                    <div style={{ display: "flex", gap: "10px", marginBottom: "10px" }}>
                      <Field label="Username (URL)"><Text value={pf.username} onChange={setP("username")} /></Field>
                      <Field label="Nombre mostrado"><Text value={pf.display_name} onChange={setP("display_name")} /></Field>
                    </div>
                    <div style={{ display: "flex", gap: "10px", marginBottom: "10px" }}>
                      <Field label="Nombre artístico"><Text value={pf.artist_name} onChange={setP("artist_name")} /></Field>
                      <Field label="Nombre completo"><Text value={pf.full_name} onChange={setP("full_name")} /></Field>
                    </div>
                    <div style={{ display: "flex", gap: "10px", marginBottom: "10px" }}>
                      <Field label="Nombre"><Text value={pf.first_name} onChange={setP("first_name")} /></Field>
                      <Field label="Apellidos"><Text value={pf.last_name} onChange={setP("last_name")} /></Field>
                    </div>
                    <div style={{ display: "flex", gap: "10px", marginBottom: "10px" }}>
                      <Field label="Email contacto"><Text value={pf.contact_email} onChange={setP("contact_email")} type="email" /></Field>
                      <Field label="Teléfono"><Text value={pf.phone} onChange={setP("phone")} /></Field>
                    </div>
                    <div style={{ display: "flex", gap: "10px", marginBottom: "10px" }}>
                      <Field label="Nacionalidad"><Text value={pf.nationality} onChange={setP("nationality")} /></Field>
                      <Field label="Residencia"><Text value={pf.country_of_residence} onChange={setP("country_of_residence")} /></Field>
                    </div>
                    <div style={{ display: "flex", gap: "10px", marginBottom: "10px" }}>
                      <Field label="Dirección / Ciudad"><Text value={pf.address} onChange={setP("address")} /></Field>
                      <Field label="Posición foto"><Text value={pf.photo_position} onChange={setP("photo_position")} /></Field>
                    </div>
                    <div style={{ marginBottom: "10px" }}>
                      <Field label="Bio"><Area value={pf.bio} onChange={setP("bio")} /></Field>
                    </div>
                    <div>
                      <Field label="Role tags (coma)"><Text value={pf.role_tags} onChange={setP("role_tags")} /></Field>
                    </div>
                  </div>
                )}

                {/* Platform user */}
                {platformUser?.id && (
                  <div style={sectionStyle}>
                    <p style={{ fontSize: "11px", fontWeight: 700, color: "rgba(255,255,255,0.55)", margin: "0 0 12px", letterSpacing: "0.08em", textTransform: "uppercase" }}>
                      Cuenta de acceso
                    </p>
                    <div style={{ display: "flex", gap: "10px", marginBottom: "10px" }}>
                      <Field label="Email (solo lectura)">
                        <input value={platformUser.email || ""} disabled style={{ ...inputStyle, opacity: 0.5 }} />
                      </Field>
                      <Field label="Rol">
                        <Select value={userRole} onChange={setUserRole} options={["user", "admin"]} />
                      </Field>
                    </div>
                  </div>
                )}

                {hasAnything && (
                  <button onClick={handleSave} disabled={saving} style={{
                    width: "100%", padding: "12px",
                    background: saved ? "rgba(16,185,129,0.15)" : "#ff5833",
                    border: saved ? "1px solid rgba(16,185,129,0.3)" : "none",
                    borderRadius: "10px", color: saved ? "#10b981" : "#fff",
                    fontSize: "13px", fontWeight: 700, cursor: saving ? "default" : "pointer",
                    opacity: saving ? 0.7 : 1, display: "flex", alignItems: "center", justifyContent: "center", gap: "6px",
                  }}>
                    {saving ? <Loader2 size={14} className="animate-spin" /> : saved ? "✓ Guardado" : <><Save size={14} /> Guardar cambios</>}
                  </button>
                )}
              </>
            )}

            {tab === "danger" && (
              <div style={sectionStyle}>
                <div style={{ display: "flex", gap: "8px", marginBottom: "14px" }}>
                  <AlertTriangle size={16} color="#ef4444" style={{ flexShrink: 0, marginTop: "1px" }} />
                  <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.65)", margin: 0, lineHeight: 1.5 }}>
                    Zona de peligro. El borrado elimina al creador y <b>todo</b> su contenido e historial de la plataforma.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowDelete(true)}
                  style={{
                    width: "100%", padding: "11px",
                    display: "flex", alignItems: "center", justifyContent: "center", gap: "6px",
                    background: "#ef4444", border: "none", borderRadius: "10px",
                    color: "#fff", fontSize: "12px", fontWeight: 700, cursor: "pointer",
                  }}
                >
                  <Trash2 size={13} /> Eliminar creador por completo
                </button>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>

      {showDelete && (
        <CreatorDeleteConfirm
          creator={creator}
          onClose={() => setShowDelete(false)}
          onDone={onClose}
        />
      )}
    </AnimatePresence>
  );
}