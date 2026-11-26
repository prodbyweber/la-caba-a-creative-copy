import React from "react";
import { QUALIFICATION, RESULT_COPY } from "@/lib/admissionForm";

export default function ResultScreen({ qualification }) {
  const copy = RESULT_COPY[qualification] || RESULT_COPY[QUALIFICATION.EXPLORANDO];

  return (
    <div>
      <h1 className="adm-title">{copy.title}</h1>
      <p className="adm-note adm-note--soft">{copy.text}</p>
    </div>
  );
}