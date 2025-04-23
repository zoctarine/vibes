import React from 'react';
import { FileText, Sun, Moon, LogOut } from 'lucide-react';
import { Button } from '../../atoms/Button/Button';
import { useTheme } from '../../../context/ThemeContext';
import { useAuthStore } from '../../../store/authStore';

/**
 * Main application header component.
 * Contains navigation, theme toggle, and user controls.
 */
export const Header: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const { user, signOut } = useAuthStore();

  return (
    <header className="border-b border-border bg-background">
      <div className="container mx-auto px-4 h-14 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileText size={24} className="text-primary" />
          <h1 className="text-xl font-semibold">Draft Editor</h1>
        </div>

        <div className="flex items-center gap-4">
          {user && (
            <span className="text-sm text-muted-foreground">
              {user.name || user.email}
            </span>
          )}
          
          <Button
            onClick={toggleTheme}
            variant="ghost"
            icon={theme === 'light' ? Moon : Sun}
            title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
          />
          
          {user && (
            <Button
              onClick={signOut}
              variant="ghost"
              icon={LogOut}
              title="Sign out"
            />
          )}
        </div>
      </div>
    </header>
  );
};