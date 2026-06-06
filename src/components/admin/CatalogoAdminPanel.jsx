import React, { useState, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";

const inputStyle = {
  width: "100%",
  background: "rgba(255,255,255,0.03)",
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: "8px",
  padding: "10px 12px",
  fontSize: "13px",
  color: "#f0ede8",
  outline: "none",
  transition: "border-color 0.2s",
};

export default function CatalogoAdminPanel() {
  const queryClient = useQueryClient();
  const [editingId, setEditingId] = useState(null);
  const [uploadingImageId, setUploadingImageId] = useState(null);
  const fileInputRef = useRef(null);

  const { data: items = [] } = useQuery({
    queryKey: ['catalogo-produccion'],
    queryFn: () => base44.entities.CatalogoProduccion.list("orden"),
    initialData: [],
  });

  const createMutation = useMutation({
    mutationFn: async (data) => {
      const { imagen_file, ...restData } = data;
      if (imagen_file) {
        const uploadResult = await base44.integrations.Core.UploadFile({ file: imagen_file });
        return base44.entities.CatalogoProduccion.create({ ...restData, imagen_personalizada_url: uploadResult.file_url });
      }
      return base44.entities.CatalogoProduccion.create(restData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['catalogo-produccion'] });
      if (fileInputRef.current) fileInputRef.current.value = "";
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }) => {
      const { imagen_file, ...restData } = data;
      if (imagen_file) {
        const uploadResult = await base44.integrations.Core.UploadFile({ file: imagen_file });
        return base44.entities.CatalogoProduccion.update(id, { ...restData, imagen_personalizada_url: uploadResult.file_url });
      }
      return base44.entities.CatalogoProduccion.update(id, restData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['catalogo-produccion'] });
      setEditingId(null);
      setUploadingImageId(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.CatalogoProduccion.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['catalogo-produccion'] });
    },
  });

  const handleCreate = () => {
    if (!newItem.youtube_url || !newItem.artista) return;
    const maxOrder = items.reduce((max, item) => Math.max(max, item.orden || 0), 0);
    createMutation.mutate({ ...newItem, orden: maxOrder + 1 });
  };

  const handleDelete = (id) => {
    if (confirm("¿Eliminar este video del catálogo?")) {
      deleteMutation.mutate(id);
    }
  };

  const moveItem = (index, direction) => {
    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= items.length) return;
    
    const currentItem = items[index];
    const swapItem = items[newIndex];
    
    updateMutation.mutate({ id: currentItem.id, data: { orden: swapItem.orden } });
    updateMutation.mutate({ id: swapItem.id, data: { orden: currentItem.orden } });
  };

  const extractYoutubeId = (url) => {
    const match = url.match(/\/embed\/([a-zA-Z0-9_-]+)/);
    return match ? match[1] : null;
  };

  const [newItem, setNewItem] = useState({ youtube_url: "", artista: "", compania: "", imagen_file: null });

  return (
    <div style={{
      maxWidth: "1200px",
      margin: "0 auto",
      padding: "24px",
    }}>
      <div style={{ marginBottom: "32px" }}>
        <h2 style={{
          fontFamily: "'Helvetica Neue', sans-serif",
          fontWeight: 700,
          fontSize: "18px",
          color: "#ffffff",
          marginBottom: "8px",
        }}>
          Catálogo de Producciones
        </h2>
        <p style={{
          fontFamily: "'Helvetica Neue', sans-serif",
          fontWeight: 400,
          fontSize: "13px",
          color: "rgba(255,255,255,0.4)",
          marginBottom: "20px",
        }}>
          Gestiona los videos del carrusel en la página Start
        </p>

        {/* Formulario para nuevo item */}
        <div style={{
          background: "rgba(255,255,255,0.02)",
          border: "1px solid rgba(255,255,255,0.06)",
          borderRadius: "12px",
          padding: "20px",
          marginBottom: "24px",
        }}>
          <h3 style={{
            fontFamily: "'Helvetica Neue', sans-serif",
            fontWeight: 600,
            fontSize: "14px",
            color: "#ffffff",
            marginBottom: "16px",
          }}>
            Añadir nuevo video
          </h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr auto", gap: "12px", alignItems: "end" }}>
            <div>
              <label style={{
                display: "block",
                fontFamily: "'Helvetica Neue', sans-serif",
                fontSize: "11px",
                fontWeight: 600,
                color: "rgba(255,255,255,0.5)",
                marginBottom: "6px",
              }}>
                YouTube URL (embed)
              </label>
              <input
                type="text"
                placeholder="https://www.youtube.com/embed/..."
                value={newItem.youtube_url}
                onChange={(e) => setNewItem({ ...newItem, youtube_url: e.target.value })}
                style={inputStyle}
              />
            </div>
            <div>
              <label style={{
                display: "block",
                fontFamily: "'Helvetica Neue', sans-serif",
                fontSize: "11px",
                fontWeight: 600,
                color: "rgba(255,255,255,0.5)",
                marginBottom: "6px",
              }}>
                Artista
              </label>
              <input
                type="text"
                placeholder="Nombre del artista"
                value={newItem.artista}
                onChange={(e) => setNewItem({ ...newItem, artista: e.target.value })}
                style={inputStyle}
              />
            </div>
            <div>
              <label style={{
                display: "block",
                fontFamily: "'Helvetica Neue', sans-serif",
                fontSize: "11px",
                fontWeight: 600,
                color: "rgba(255,255,255,0.5)",
                marginBottom: "6px",
              }}>
                Compañía (opcional)
              </label>
              <input
                type="text"
                placeholder="Compañía discográfica"
                value={newItem.compania}
                onChange={(e) => setNewItem({ ...newItem, compania: e.target.value })}
                style={inputStyle}
              />
            </div>
            <div>
              <label style={{
                display: "block",
                fontFamily: "'Helvetica Neue', sans-serif",
                fontSize: "11px",
                fontWeight: 600,
                color: "rgba(255,255,255,0.5)",
                marginBottom: "6px",
              }}>
                Portada (opcional)
              </label>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={(e) => setNewItem({ ...newItem, imagen_file: e.target.files[0] })}
                style={{
                  ...inputStyle,
                  padding: "8px",
                  cursor: "pointer",
                }}
              />
            </div>
            <button
              onClick={handleCreate}
              disabled={createMutation.isPending}
              style={{
                background: "#ff5833",
                color: "#ffffff",
                border: "none",
                borderRadius: "8px",
                padding: "10px 20px",
                fontFamily: "'Helvetica Neue', sans-serif",
                fontWeight: 600,
                fontSize: "13px",
                cursor: "pointer",
                transition: "background 0.2s",
                whiteSpace: "nowrap",
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = "#e04a28"}
              onMouseLeave={(e) => e.currentTarget.style.background = "#ff5833"}
            >
              {createMutation.isPending ? "Añadiendo..." : "Añadir"}
            </button>
          </div>
        </div>

        {/* Lista de items */}
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {items.map((item, index) => (
            <div
              key={item.id}
              style={{
                background: "rgba(255,255,255,0.02)",
                border: "1px solid rgba(255,255,255,0.06)",
                borderRadius: "10px",
                padding: "16px",
                display: "flex",
                gap: "16px",
                alignItems: "center",
              }}
            >
              {/* Thumbnail */}
              <div style={{
                width: "120px",
                height: "68px",
                borderRadius: "6px",
                overflow: "hidden",
                flexShrink: 0,
                background: "#000",
              }}>
                <img
                  src={item.imagen_personalizada_url || `https://img.youtube.com/vi/${extractYoutubeId(item.youtube_url)}/mqdefault.jpg`}
                  alt={item.artista}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  onError={(e) => {
                    e.target.src = `https://img.youtube.com/vi/${extractYoutubeId(item.youtube_url)}/mqdefault.jpg`;
                  }}
                />
              </div>

              {/* Campos editables */}
              {editingId === item.id ? (
                <div style={{ flex: 1, display: "flex", gap: "12px", alignItems: "center", flexWrap: "wrap" }}>
                  <input
                    type="text"
                    defaultValue={item.youtube_url}
                    id={`youtube-${item.id}`}
                    style={{ ...inputStyle, flex: 1, minWidth: "200px" }}
                  />
                  <input
                    type="text"
                    defaultValue={item.artista}
                    id={`artista-${item.id}`}
                    style={{ ...inputStyle, width: "150px" }}
                  />
                  <input
                    type="text"
                    defaultValue={item.compania || ""}
                    id={`compania-${item.id}`}
                    style={{ ...inputStyle, width: "120px" }}
                  />
                  <input
                    type="file"
                    accept="image/*"
                    id={`imagen-${item.id}`}
                    style={{ ...inputStyle, width: "150px", padding: "6px" }}
                  />
                  <button
                    onClick={() => {
                      const youtube = document.getElementById(`youtube-${item.id}`).value;
                      const artista = document.getElementById(`artista-${item.id}`).value;
                      const compania = document.getElementById(`compania-${item.id}`).value;
                      const imagenInput = document.getElementById(`imagen-${item.id}`);
                      const updateData = { youtube_url: youtube, artista, compania };
                      if (imagenInput.files[0]) {
                        updateData.imagen_file = imagenInput.files[0];
                      }
                      updateMutation.mutate({
                        id: item.id,
                        data: updateData,
                      });
                    }}
                    disabled={updateMutation.isPending}
                    style={{
                      background: updateMutation.isPending ? "#9ca3af" : "#4ade80",
                      color: "#000",
                      border: "none",
                      borderRadius: "6px",
                      padding: "8px 16px",
                      fontFamily: "'Helvetica Neue', sans-serif",
                      fontWeight: 600,
                      fontSize: "12px",
                      cursor: updateMutation.isPending ? "not-allowed" : "pointer",
                    }}
                  >
                    {updateMutation.isPending ? "Guardando..." : "Guardar"}
                  </button>
                  <button
                    onClick={() => setEditingId(null)}
                    style={{
                      background: "transparent",
                      color: "rgba(255,255,255,0.5)",
                      border: "1px solid rgba(255,255,255,0.2)",
                      borderRadius: "6px",
                      padding: "8px 16px",
                      fontFamily: "'Helvetica Neue', sans-serif",
                      fontWeight: 500,
                      fontSize: "12px",
                      cursor: "pointer",
                    }}
                  >
                    Cancelar
                  </button>
                </div>
              ) : (
                <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "4px" }}>
                  <p style={{
                    fontFamily: "'Helvetica Neue', sans-serif",
                    fontWeight: 600,
                    fontSize: "13px",
                    color: "#ffffff",
                  }}>
                    {item.artista}
                  </p>
                  <p style={{
                    fontFamily: "'Helvetica Neue', sans-serif",
                    fontWeight: 400,
                    fontSize: "11px",
                    color: "rgba(255,255,255,0.4)",
                    wordBreak: "break-all",
                  }}>
                    {item.youtube_url}
                  </p>
                  {item.compania && (
                    <p style={{
                      fontFamily: "'Helvetica Neue', sans-serif",
                      fontWeight: 400,
                      fontSize: "11px",
                      color: "rgba(255,255,255,0.3)",
                    }}>
                      {item.compania}
                    </p>
                  )}
                </div>
              )}

              {/* Acciones */}
              {editingId !== item.id && (
                <div style={{ display: "flex", gap: "8px", flexShrink: 0 }}>
                  <button
                    onClick={() => moveItem(index, -1)}
                    disabled={index === 0}
                    style={{
                      width: "32px",
                      height: "32px",
                      borderRadius: "6px",
                      background: index === 0 ? "rgba(255,255,255,0.05)" : "rgba(255,255,255,0.08)",
                      border: "none",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: index === 0 ? "not-allowed" : "pointer",
                      opacity: index === 0 ? 0.3 : 1,
                    }}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <path d="M15 18L9 12L15 6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>
                  <button
                    onClick={() => moveItem(index, 1)}
                    disabled={index === items.length - 1}
                    style={{
                      width: "32px",
                      height: "32px",
                      borderRadius: "6px",
                      background: index === items.length - 1 ? "rgba(255,255,255,0.05)" : "rgba(255,255,255,0.08)",
                      border: "none",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: index === items.length - 1 ? "not-allowed" : "pointer",
                      opacity: index === items.length - 1 ? 0.3 : 1,
                    }}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <path d="M9 18L15 12L9 6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>
                  <button
                    onClick={() => setEditingId(item.id)}
                    style={{
                      width: "32px",
                      height: "32px",
                      borderRadius: "6px",
                      background: "rgba(255,255,255,0.08)",
                      border: "none",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: "pointer",
                    }}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <path d="M11 4H4C3.46957 4 2.96086 4.21071 2.58579 4.58579C2.21071 4.96086 2 5.46957 2 6V20C2 20.5304 2.21071 21.0391 2.58579 21.4142C2.96086 21.7893 3.46957 22 4 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V13" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M18.5 2.50023C18.8978 2.89805 19.1211 3.43725 19.1211 4.00023C19.1211 4.56321 18.8978 5.10241 18.5 5.50023L12 12.0002L8 16.0002L4 12.0002L8 8.00023L14.5 1.50023C14.8978 1.10241 15.437 0.879105 16 0.879105C16.563 0.879105 17.1022 1.10241 17.5 1.50023" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
                    style={{
                      width: "32px",
                      height: "32px",
                      borderRadius: "6px",
                      background: "rgba(239,68,68,0.15)",
                      border: "none",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: "pointer",
                    }}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <path d="M3 6H5H21M8 6V4C8 3.46957 8.21071 2.96086 8.58579 2.58579C8.96086 2.21071 9.46957 2 10 2H14C14.5304 2 15.0391 2.21071 15.4142 2.58579C15.7893 2.96086 16 3.46957 16 4V6M19 6V20C19 20.5304 18.7893 21.0391 18.4142 21.4142C18.0391 21.7893 17.5304 22 17 22H7C6.46957 22 5.96086 21.7893 5.58579 21.4142C5.21071 21.0391 5 20.5304 5 20V6H19Z" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}