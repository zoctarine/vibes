import React from 'react';
import { Tag, TagLabel, TagCloseButton, TagProps } from '@chakra-ui/react';

type BadgeVariant = 'default' | 'primary' | 'secondary' | 'success' | 'danger' | 'warning';

interface BadgeProps extends Omit<TagProps, 'variant'> {
  children: React.ReactNode;
  variant?: BadgeVariant;
  onClick?: () => void;
  removable?: boolean;
  onRemove?: () => void;
  className?: string;
}

const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  onClick,
  removable = false,
  onRemove,
  className = '',
  ...props
}) => {
  const variantProps = {
    default: { colorScheme: 'gray', variant: 'subtle' },
    primary: { colorScheme: 'blue', variant: 'subtle' },
    secondary: { colorScheme: 'teal', variant: 'subtle' },
    success: { colorScheme: 'green', variant: 'subtle' },
    danger: { colorScheme: 'red', variant: 'subtle' },
    warning: { colorScheme: 'yellow', variant: 'subtle' }
  };

  const { colorScheme, variant: tagVariant } = variantProps[variant];

  return (
    <Tag
      size="sm"
      borderRadius="md"
      variant={tagVariant}
      colorScheme={colorScheme}
      className={className}
      cursor={onClick ? 'pointer' : undefined}
      onClick={onClick}
      {...props}
    >
      <TagLabel>{children}</TagLabel>
      {removable && onRemove && (
        <TagCloseButton onClick={(e) => {
          e.stopPropagation();
          onRemove();
        }} />
      )}
    </Tag>
  );
};

export default Badge;