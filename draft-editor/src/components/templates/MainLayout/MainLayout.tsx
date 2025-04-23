import React from 'react';
import { Header } from '../../organisms/Header/Header';

interface MainLayoutProps {
  /** Page content */
  children: React.ReactNode;
}

/**
 * Main layout template for authenticated pages.
 * Includes header and main content area.
 */
export const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1">
        {children}
      </main>
    </div>
  );
};