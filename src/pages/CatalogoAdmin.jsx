import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import AdminLayout from "../components/admin/AdminLayout";

export default function CatalogoAdmin() {
  const [newItem, setNewItem] = useState({
    youtube_url: "",
    artista: "",
    compania: "",
    imagen_personalizada_url: "",
  });
  const [editingId, setEditingId] = useState(null);

  const { data: items, isLoading, refetch } = useQuery({
    queryKey: ['catalogo-produccion'],
    queryFn: () => base44.entities.CatalogoProduccion.list("-orden"),
    initialData: [],
  });

  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.CatalogoProduccion.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['catalogo-produccion'] });
      setNewItem({ youtube_url: "", artista: "", compania: "", imagen_personalizada_url: "" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.CatalogoProduccion.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['catalogo-produccion'] });
      setEditingId(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.CatalogoProduccion.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['catalogo-produccion'] });
    },
  });

  const handleAdd = () => {
    if (!newItem.youtube_url || !newItem.artista) return;
    const maxOrder = items.reduce((max, item) => Math.max(max, item.orden || 0), 0);
    createMutation.mutate({
      ...newItem,
      orden: maxOrder + 1,
    });
  };

  const handleMove = (item, direction) => {
    const currentIndex = items.findIndex(i => i.id === item.id);
    if (direction === "up" && currentIndex === 0) return;
    if (direction === "down" && currentIndex === items.length - 1) return;

    const swapItem = items[currentIndex + (direction === "up" ? -1 : 1)];
    updateMutation.mutate({ id: item.id, data: { orden: swapItem.orden } });
    updateMutation.mutate({ id: swapItem.id, data: { orden: item.orden } });
  };

  const handleDelete = (id) => {
    if (confirm("¿Eliminar esta producción?")) {
      deleteMutation.mutate(id);
    }
  };

  return (
    <AdminLayout>
      <div style={{ padding: "20px", maxWidth: "1200px", margin: "0 auto" }}>
        <h1 style={{
          fontFamily: "'Helvetica Neue', sans-serif",
          fontWeight: 700,
          fontSize: "24px",
          color: "#ffffff",
          marginBottom: "8px",
        }}>
          Catálogo de producciones
        </h1>
        <p style={{
          fontFamily: "'Helvetica Neue', sans-serif",
          fontWeight: 400,
          fontSize: "14px",
          color: "#AAAAAA",
          marginBottom: "30px",
        }}>
          Gestiona las producciones del carrusel Weber x Cabaña Creative
        </p>

        {/* Add New */}
        <div style={{
          background: "#141414",
          borderRadius: "12px",
          padding: "20px",
          marginBottom: "30px",
        }}>
          <h3 style={{
            fontFamily: "'Helvetica Neue', sans-serif",
            fontWeight: 600,
            fontSize: "16px",
            color: "#ffffff",
            marginBottom: "16px",
          }}>
            Añadir nueva producción
          </h3>
          <div style={{ display: "grid", gap: "12px", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))" }}>
            <input
              type="text"
              placeholder="URL de YouTube (ej: https://www.youtube.com/embed/VIDEO_ID)"
              value={newItem.youtube_url}
              onChange={(e) => setNewItem({ ...newItem, youtube_url: e.target.value })}
              style={{
                background: "#0a0a0b",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: "8px",
                padding: "10px 13px",
                fontSize: "14px",
                color: "#f0ede8",
                fontFamily: "'Helvetica Neue', sans-serif",
              }}
            />
            <input
              type="text"
              placeholder="Nombre del artista *"
              value={newItem.artista}
              onChange={(e) => setNewItem({ ...newItem, artista: e.target.value })}
              style={{
                background: "#0a0a0b",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: "8px",
                padding: "10px 13px",
                fontSize: "14px",
                color: "#f0ede8",
                fontFamily: "'Helvetica Neue', sans-serif",
              }}
            />
            <input
              type="text"
              placeholder="Compañía discográfica (opcional)"
              value={newItem.compania}
              onChange={(e) => setNewItem({ ...newItem, compania: e.target.value })}
              style={{
                background: "#0a0a0b",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: "8px",
                padding: "10px 13px",
                fontSize: "14px",
                color: "#f0ede8",
                fontFamily: "'Helvetica Neue', sans-serif",
              }}
            />
            <input
              type="text"
              placeholder="Imagen personalizada URL (opcional)"
              value={newItem.imagen_personalizada_url}
              onChange={(e) => setNewItem({ ...newItem, imagen_personalizada_url: e.target.value })}
              style={{
                background: "#0a0a0b",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: "8px",
                padding: "10px 13px",
                fontSize: "14px",
                color: "#f0ede8",
                fontFamily: "'Helvetica Neue', sans-serif",
              }}
            />
          </div>
          <button
            onClick={handleAdd}
            disabled={createMutation.isPending}
            style={{
              marginTop: "16px",
              background: "#FF5833",
              border: "none",
              borderRadius: "8px",
              padding: "10px 24px",
              color: "#ffffff",
              fontFamily: "'Helvetica Neue', sans-serif",
              fontWeight: 600,
              fontSize: "14px",
              cursor: "pointer",
              opacity: createMutation.isPending ? 0.6 : 1,
            }}
          >
            {createMutation.isPending ? "Añadiendo..." : "Añadir producción"}
          </button>
        </div>

        {/* List */}
        {isLoading ? (
          <p style={{ color: "#AAAAAA" }}>Cargando...</p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {items.map((item, index) => (
              <div
                key={item.id}
                style={{
                  background: "#141414",
                  borderRadius: "12px",
                  padding: "16px",
                  display: "flex",
                  alignItems: "center",
                  gap: "16px",
                }}
              >
                {/* Thumbnail */}
                <div style={{
                  width: "160px",
                  aspectRatio: "16/9",
                  borderRadius: "8px",
                  overflow: "hidden",
                  flexShrink: 0,
                  background: "#0a0a0b",
                }}>
                  <img
                    src={item.imagen_personalizada_url || `https://img.youtube.com/vi/${item.youtube_url.split('/embed/')[1]?.split('?')[0]}/maxresdefault.jpg`}
                    alt={item.artista}
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />
                </div>

                {/* Info */}
                <div style={{ flex: 1 }}>
                  <p style={{
                    fontFamily: "'Helvetica Neue', sans-serif",
                    fontWeight: 600,
                    fontSize: "16px",
                    color: "#ffffff",
                    marginBottom: "4px",
                  }}>
                    {item.artista}
                  </p>
                  {item.compania && (
                    <p style={{
                      fontFamily: "'Helvetica Neue', sans-serif",
                      fontWeight: 400,
                      fontSize: "13px",
                      color: "#AAAAAA",
                      margin: 0,
                    }}>
                      {item.compania}
                    </p>
                  )}
                  <p style={{
                    fontFamily: "'Helvetica Neue', sans-serif",
                    fontWeight: 400,
                    fontSize: "12px",
                    color: "#666666",
                    marginTop: "8px",
                    wordBreak: "break-all",
                  }}>
                    {item.youtube_url}
                  </p>
                </div>

                {/* Actions */}
                <div style={{ display: "flex", gap: "8px", flexShrink: 0 }}>
                  <button
                    onClick={() => handleMove(item, "up")}
                    disabled={index === 0}
                    style={{
                      width: "36px",
                      height: "36px",
                      borderRadius: "6px",
                      background: index === 0 ? "#2a2a2a" : "#FF5833",
                      border: "none",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: index === 0 ? "not-allowed" : "pointer",
                      opacity: index === 0 ? 0.5 : 1,
                    }}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <path d="M18 15L12 9L6 15" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>
                  <button
                    onClick={() => handleMove(item, "down")}
                    disabled={index === items.length - 1}
                    style={{
                      width: "36px",
                      height: "36px",
                      borderRadius: "6px",
                      background: index === items.length - 1 ? "#2a2a2a" : "#FF5833",
                      border: "none",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: index === items.length - 1 ? "not-allowed" : "pointer",
                      opacity: index === items.length - 1 ? 0.5 : 1,
                    }}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <path d="M6 9L12 15L18 9" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
                    style={{
                      width: "36px",
                      height: "36px",
                      borderRadius: "6px",
                      background: "#2a2a2a",
                      border: "none",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: "pointer",
                    }}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <path d="M18 6L6 18M6 6L18 18" stroke="#ff5833" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}