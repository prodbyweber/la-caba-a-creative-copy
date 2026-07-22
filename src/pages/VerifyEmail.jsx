import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { CheckCircle2, AlertCircle, Loader2 } from "lucide-react";

export default function VerifyEmail() {
  const [params] = useSearchParams();
  const token = params.get("token");
  const navigate = useNavigate();
  const [status, setStatus] = useState("loading"); // loading | success | already | error

  useEffect(() => {
    if (!token) { setStatus("error"); return; }
    base44.functions.invoke("verifyEmail", { token })
      .then((res) => {
        if (res?.data?.already_verified) setStatus("already");
        else if (res?.data?.success) setStatus("success");
        else setStatus("error");
      })
      .catch(() => setStatus("error"));
  }, [token]);

  const content = {
    loading: { icon: <Loader2 className="w-10 h-10 text-white/40 animate-spin" />, title: "Verificando tu correo…", desc: "Un momento, por favor.", btn: null },
    success: { icon: <CheckCircle2 className="w-12 h-12 text-emerald-400" />, title: "Correo verificado", desc: "Tu correo se ha verificado correctamente. Ya recibirás las notificaciones de tu catálogo.", btn: "Ir al catálogo" },
    already: { icon: <CheckCircle2 className="w-12 h-12 text-emerald-400" />, title: "Correo ya verificado", desc: "Tu correo ya estaba verificado. No necesitas hacer nada más.", btn: "Ir al catálogo" },
    error: { icon: <AlertCircle className="w-12 h-12 text-red-400" />, title: "Enlace no válido", desc: "El enlace de verificación no es válido o ha expirado. Pide uno nuevo desde el panel de administración.", btn: "Volver al inicio" },
  }[status];

  return (
    <div className="min-h-screen bg-[#0a0a0b] text-white flex flex-col items-center justify-center px-6 text-center">
      <p className="text-lg font-bold mb-8" style={{ letterSpacing: "-0.01em" }}>Cabaña Creative</p>
      <div className="mb-5">{content.icon}</div>
      <h1 className="text-2xl font-black mb-2" style={{ letterSpacing: "-0.03em" }}>{content.title}</h1>
      <p className="text-sm text-white/50 max-w-xs mb-8 leading-relaxed">{content.desc}</p>
      {content.btn && (
        <button
          onClick={() => navigate("/")}
          className="px-6 py-3 rounded-xl bg-white text-black text-sm font-bold hover:bg-white/90 transition-colors"
        >
          {content.btn}
        </button>
      )}
    </div>
  );
}