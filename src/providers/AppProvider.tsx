import React from 'react';
import type { PropsWithChildren } from 'react';

export function AppProvider({ children }: PropsWithChildren) {
  return <>{children}</>;
}