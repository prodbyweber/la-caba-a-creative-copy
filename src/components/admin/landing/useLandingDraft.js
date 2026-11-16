import { useCallback, useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { DEFAULT_SETTINGS, mergeModel } from "@/lib/landingDefaults";

const FIELDS = {
  LandingSection: ["key", "order", "is_visible", "eyebrow", "title", "subtitle", "body", "cta_label", "cta_link", "cta2_label", "cta2_link"],
  FeaturedFeature: ["title", "support_line", "badge", "visual", "size", "image_url", "order", "is_visible"],
  FeaturedVideo: ["title", "youtube_url", "thumbnail_url", "tags", "is_featured", "order", "is_visible"],
  FeaturedCreator: ["name", "genre", "photo_url", "cover_url", "track_title", "audio_url", "year", "credits", "is_public", "order"],
  FeaturedBeat: ["beat_id", "order", "is_visible"],
};

const SETTINGS_KEYS = Object.keys(DEFAULT_SETTINGS);

function pick(obj, keys) {
  const out = {};
  keys.forEach((k) => {
    if (obj?.[k] !== undefined && obj[k] !== null) out[k] = obj[k];
  });
  return out;
}

async function loadPublished() {
  const [sections, features, videos, creators, beats, settings] = await Promise.all([
    base44.entities.LandingSection.list("-created_date", 200),
    base44.entities.FeaturedFeature.list("-created_date", 200),
    base44.entities.FeaturedVideo.list("-created_date", 200),
    base44.entities.FeaturedCreator.list("-created_date", 200),
    base44.entities.FeaturedBeat.list("-created_date", 200),
    base44.entities.SiteSettings.list("-created_date", 20),
  ]);
  return mergeModel({
    sections,
    features,
    videos,
    creators,
    beats,
    settings: settings?.[0] || null,
  });
}

async function replaceCollection(entity, items, keys) {
  const existing = await entity.list("-created_date", 500);
  const clean = items.map((it) => pick(it, keys));
  const created = clean.length ? await entity.bulkCreate(clean) : [];
  if (existing?.length) {
    try {
      await entity.deleteMany({ id: { $in: existing.map((e) => e.id) } });
    } catch (e) {
      for (const rec of existing) {
        try {
          await entity.delete(rec.id);
        } catch (inner) {
          /* continúa */
        }
      }
    }
  }
  return created;
}

export function useLandingDraft() {
  const [model, setModel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [draftExists, setDraftExists] = useState(false);
  const [busy, setBusy] = useState("");
  const [notice, setNotice] = useState("");
  const [versionsKey, setVersionsKey] = useState(0);

  const flash = (msg) => {
    setNotice(msg);
    setTimeout(() => setNotice(""), 3500);
  };

  const init = useCallback(async () => {
    setLoading(true);
    try {
      const published = await loadPublished();
      const drafts = await base44.entities.LandingVersion.filter(
        { status: "draft" },
        { sort: "-created_date", limit: 1 }
      );
      const draft = drafts.items?.[0];
      if (draft?.content) {
        try {
          setModel(mergeModel(JSON.parse(draft.content)));
          setDraftExists(true);
        } catch (e) {
          setModel(published);
        }
      } else {
        setModel(published);
        setDraftExists(false);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    init();
  }, [init]);

  const saveDraft = useCallback(
    async (current) => {
      const doc = current || model;
      if (!doc) return;
      setBusy("draft");
      try {
        const content = JSON.stringify(doc);
        const drafts = await base44.entities.LandingVersion.filter(
          { status: "draft" },
          { sort: "-created_date", limit: 5 }
        );
        const items = drafts.items || [];
        if (items.length) {
          await base44.entities.LandingVersion.update(items[0].id, { content, label: "Borrador" });
        } else {
          await base44.entities.LandingVersion.create({ status: "draft", label: "Borrador", content });
        }
        setDraftExists(true);
        setVersionsKey((k) => k + 1);
        return true;
      } catch (e) {
        flash("No se pudo guardar el borrador.");
        return false;
      } finally {
        setBusy("");
      }
    },
    [model]
  );

  const publish = useCallback(
    async (current) => {
      const doc = current || model;
      if (!doc) return;
      setBusy("publish");
      try {
        await Promise.all([
          replaceCollection(base44.entities.LandingSection, doc.sections, FIELDS.LandingSection),
          replaceCollection(base44.entities.FeaturedFeature, doc.features, FIELDS.FeaturedFeature),
          replaceCollection(base44.entities.FeaturedVideo, doc.videos, FIELDS.FeaturedVideo),
          replaceCollection(base44.entities.FeaturedCreator, doc.creators, FIELDS.FeaturedCreator),
          replaceCollection(base44.entities.FeaturedBeat, doc.beats, FIELDS.FeaturedBeat),
        ]);

        // Ajustes globales (registro único)
        const oldSettings = await base44.entities.SiteSettings.list("-created_date", 20);
        await base44.entities.SiteSettings.create(pick(doc.settings, SETTINGS_KEYS));
        for (const s of oldSettings || []) {
          try {
            await base44.entities.SiteSettings.delete(s.id);
          } catch (e) {
            /* continúa */
          }
        }

        await base44.entities.LandingVersion.create({
          status: "published",
          label: `Publicado ${new Date().toLocaleString("es-ES", { dateStyle: "short", timeStyle: "short" })}`,
          content: JSON.stringify(doc),
        });

        await base44.entities.LandingVersion.deleteMany({ status: "draft" });
        setDraftExists(false);
        setVersionsKey((k) => k + 1);
        flash("Publicado. La web ya muestra los cambios.");
        await init();
      } catch (e) {
        flash("No se pudo publicar. Revisa la consola e inténtalo de nuevo.");
      } finally {
        setBusy("");
      }
    },
    [model, init]
  );

  const preview = useCallback(async () => {
    const ok = await saveDraft(model);
    if (ok) window.open("/Landing?preview=1", "_blank", "noopener");
  }, [saveDraft, model]);

  const discardDraft = useCallback(async () => {
    setBusy("discard");
    try {
      await base44.entities.LandingVersion.deleteMany({ status: "draft" });
      setDraftExists(false);
      await init();
      flash("Borrador descartado. Se muestra el contenido publicado.");
    } finally {
      setBusy("");
    }
  }, [init]);

  const restore = useCallback(
    async (version) => {
      try {
        const parsed = JSON.parse(version.content);
        setModel(mergeModel(parsed));
        await saveDraft(mergeModel(parsed));
        flash("Versión cargada en el editor. Pulsa Publicar para aplicarla.");
      } catch (e) {
        flash("No se pudo cargar esa versión.");
      }
    },
    [saveDraft]
  );

  return {
    model,
    setModel,
    loading,
    draftExists,
    busy,
    notice,
    versionsKey,
    saveDraft,
    publish,
    preview,
    discardDraft,
    restore,
    reload: init,
    flash,
  };
}