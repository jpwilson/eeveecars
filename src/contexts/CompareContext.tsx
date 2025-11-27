import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import { Car } from "../hooks/useCars";

interface CompareContextType {
  isCompareMode: boolean;
  selectedCars: Car[];
  maxCars: number;
  toggleCompareMode: () => void;
  addCar: (car: Car) => boolean;
  removeCar: (carId: number) => void;
  clearSelection: () => void;
  isCarSelected: (carId: number) => boolean;
  canAddMore: boolean;
  isCompareModalOpen: boolean;
  openCompareModal: () => void;
  closeCompareModal: () => void;
}

const CompareContext = createContext<CompareContextType | undefined>(undefined);

export const useCompare = () => {
  const context = useContext(CompareContext);
  if (!context) {
    throw new Error("useCompare must be used within a CompareProvider");
  }
  return context;
};

interface CompareProviderProps {
  children: React.ReactNode;
}

export const CompareProvider: React.FC<CompareProviderProps> = ({ children }) => {
  const [isCompareMode, setIsCompareMode] = useState(false);
  const [selectedCars, setSelectedCars] = useState<Car[]>([]);
  const [maxCars, setMaxCars] = useState(3);
  const [isCompareModalOpen, setIsCompareModalOpen] = useState(false);

  // Detect viewport and set max cars
  useEffect(() => {
    const updateMaxCars = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      const isPortrait = height > width;

      // Mobile portrait: 2 cars max
      // Mobile landscape or tablet: 3 cars max
      // Desktop: 3 cars max
      if (width < 768 && isPortrait) {
        setMaxCars(2);
      } else {
        setMaxCars(3);
      }
    };

    updateMaxCars();
    window.addEventListener("resize", updateMaxCars);
    window.addEventListener("orientationchange", updateMaxCars);

    return () => {
      window.removeEventListener("resize", updateMaxCars);
      window.removeEventListener("orientationchange", updateMaxCars);
    };
  }, []);

  // When maxCars decreases, trim selection if needed
  useEffect(() => {
    if (selectedCars.length > maxCars) {
      setSelectedCars(prev => prev.slice(0, maxCars));
    }
  }, [maxCars, selectedCars.length]);

  const toggleCompareMode = useCallback(() => {
    setIsCompareMode(prev => {
      if (prev) {
        // Exiting compare mode - clear selection
        setSelectedCars([]);
      }
      return !prev;
    });
  }, []);

  const addCar = useCallback((car: Car): boolean => {
    if (selectedCars.length >= maxCars) {
      return false;
    }
    if (selectedCars.some(c => c.id === car.id)) {
      return false;
    }
    setSelectedCars(prev => [...prev, car]);
    return true;
  }, [selectedCars, maxCars]);

  const removeCar = useCallback((carId: number) => {
    setSelectedCars(prev => prev.filter(c => c.id !== carId));
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedCars([]);
  }, []);

  const isCarSelected = useCallback((carId: number): boolean => {
    return selectedCars.some(c => c.id === carId);
  }, [selectedCars]);

  const openCompareModal = useCallback(() => {
    if (selectedCars.length >= 2) {
      setIsCompareModalOpen(true);
    }
  }, [selectedCars.length]);

  const closeCompareModal = useCallback(() => {
    setIsCompareModalOpen(false);
  }, []);

  const canAddMore = selectedCars.length < maxCars;

  return (
    <CompareContext.Provider
      value={{
        isCompareMode,
        selectedCars,
        maxCars,
        toggleCompareMode,
        addCar,
        removeCar,
        clearSelection,
        isCarSelected,
        canAddMore,
        isCompareModalOpen,
        openCompareModal,
        closeCompareModal,
      }}
    >
      {children}
    </CompareContext.Provider>
  );
};
