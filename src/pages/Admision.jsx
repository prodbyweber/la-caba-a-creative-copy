import React, { useEffect, useState } from "react";
import "@/components/fullaccess/fa.css";
import "@/components/admision/admision.css";
import { base44 } from "@/api/base44Client";
import FullAccessNav from "@/components/fullaccess/FullAccessNav";
import AdmissionFlow from "@/components/admision/AdmissionFlow";

export default function Admision() {
  const [settings, setSettings] = useState({});

  useEffect(() => {
    window.scrollTo(0, 0);
    base44.entities.FullAccessSettings.list("-created_date", 1)
      .then((rows) => setSettings(rows?.[0] || {}))
      .catch(() => setSettings({}));
  }, []);

  return (
    <div className="fa adm">
      <FullAccessNav />
      <main>
        <AdmissionFlow settings={settings} />
      </main>
      <div className="adm-wrap" style={{ paddingTop: 0 }}>
        <p className="adm-hint">Cabaña Creative · Madrid — Proceso privado de admisión</p>
      </div>
    </div>
  );
}