import React from "react";
import DemoMasterRow from "@/components/fullaccess/DemoMasterRow";

/** Demo & Master como sección propia, independiente de la metodología. */
export default function DemoMasterSection({ settings = {}, demos = [] }) {
  return (
    <section className="fa-dmsec" id="demo-master">
      <DemoMasterRow eyebrow={settings.demo_eyebrow} projects={demos} />
    </section>
  );
}