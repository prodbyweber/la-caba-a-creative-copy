import React, { createContext, useContext, useState, useCallback } from "react";

const ExplorarContext = createContext(null);

export function ExplorarProvider({ children }) {
  const [cardModalOpen, setCardModalOpen] = useState(false);

  // Global YouTube modal state — singleton so iframe never unmounts on re-render
  const [ytModal, setYtModal] = useState(null); // { ytId, title, originalUrl }

  // Global Credits modal state
  const [creditsModal, setCreditsModal] = useState(null); // { item, currentUser, allItems }

  const openYtModal = useCallback((ytId, title, originalUrl) => {
    setYtModal({ ytId, title, originalUrl });
    setCardModalOpen(true);
  }, []);

  const closeYtModal = useCallback(() => {
    setYtModal(null);
    setCardModalOpen(false);
  }, []);

  const openCreditsModal = useCallback((item, currentUser, allItems) => {
    setCreditsModal({ item, currentUser, allItems });
    setCardModalOpen(true);
  }, []);

  const closeCreditsModal = useCallback(() => {
    setCreditsModal(null);
    setCardModalOpen(false);
  }, []);

  return (
    <ExplorarContext.Provider value={{
      cardModalOpen, setCardModalOpen,
      ytModal, openYtModal, closeYtModal,
      creditsModal, openCreditsModal, closeCreditsModal,
    }}>
      {children}
    </ExplorarContext.Provider>
  );
}

export function useExplorar() {
  return useContext(ExplorarContext);
}