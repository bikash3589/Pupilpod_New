"use client";

import {
  createContext,
  useContext,
  ReactNode,
} from "react";

import useBuilder from "@/hooks/form-builder/useBuilder";

type BuilderContextType = ReturnType<typeof useBuilder>;

const BuilderContext =
  createContext<BuilderContextType | null>(null);

interface BuilderProviderProps {
  children: ReactNode;
  storageKey?: string;
}

export function BuilderProvider({
  children,
  storageKey,
}: BuilderProviderProps) {
  const builder = useBuilder(storageKey);

  return (
    <BuilderContext.Provider value={builder}>
      {children}
    </BuilderContext.Provider>
  );
}

export function useBuilderContext() {
  const context = useContext(BuilderContext);

  if (!context) {
    throw new Error(
      "useBuilderContext must be used inside BuilderProvider"
    );
  }

  return context;
}
