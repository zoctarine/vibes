import React from 'react';
import { ChevronLeft } from 'lucide-react';
import { Button } from '../../atoms/Button/Button';
import { Title } from '../../atoms/Title/Title';

interface NavigationHeaderProps {
  title: string;
  onBack: () => void;
}

export const NavigationHeader: React.FC<NavigationHeaderProps> = ({
  title,
  onBack
}) => {
  return (
    <div className="p-4 border-b border-border flex items-center bg-background">
      <Button
        onClick={onBack}
        icon={ChevronLeft}
        title="Back to tree view"
        className="mr-4 hover:bg-muted"
      />
      <Title>{title}</Title>
    </div>
  );
};