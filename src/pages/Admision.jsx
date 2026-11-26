import React, { useEffect, useState } from "react";
import "@/components/fullaccess/fa.css";
import "@/components/admision/admision.css";
import { base44 } from "@/api/base44Client";
import AdmissionFlow from "@/components/admision/AdmissionFlow";

export default function Admision() {
  const [settings, setSettings] = useState({});

  useEffect(() => {
    window.scrollTo(0, 0);
    document.documentElement.classList.add("adm-lock");
    base44.entities.FullAccessSettings.list("-created_date", 1)
      .then((rows) => setSettings(rows?.[0] || {}))
      .catch(() => setSettings({}));

    return () => document.documentElement.classList.remove("adm-lock");
  }, []);

  return (
    <main className="fa adm">
      <AdmissionFlow settings={settings} />
    </main>
  );
}