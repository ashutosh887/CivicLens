"use client";

import { useEffect } from "react";
import Clarity from "@microsoft/clarity";

interface ClarityProviderProps {
  projectId: string;
  children: React.ReactNode;
}

export function ClarityProvider({ projectId, children }: ClarityProviderProps) {
  useEffect(() => {
    if (projectId) {
      Clarity.init(projectId);
    }
  }, [projectId]);

  return <>{children}</>;
}
