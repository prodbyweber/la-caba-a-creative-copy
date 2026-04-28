import React, { createContext, useContext, useState } from "react";

const ExplorarContext = createContext(null);

export function ExplorarProvider({ children }) {
  const [cardModalOpen, setCardModalOpen] = useState(false);

  return (
    <ExplorarContext.Provider value={{ cardModalOpen, setCardModalOpen }}>
      {children}
    </ExplorarContext.Provider>
  );
}

export function useExplorar() {
  return useContext(ExplorarContext);
}