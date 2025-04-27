import React from 'react';
import { Button as ChakraButton, ButtonProps as ChakraButtonProps } from '@chakra-ui/react';

interface ButtonProps extends ChakraButtonProps {
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'solid',
  size = 'sm',
  isLoading = false,
  leftIcon,
  rightIcon,
  className = '',
  colorScheme = 'blue',
  ...rest
}) => {
  // Map variant names to Chakra variants
  const variantMap = {
    primary: 'solid',
    secondary: 'solid',
    outline: 'outline',
    danger: 'solid'
  };
  
  // Map colorScheme based on variant
  const colorSchemeMap = {
    primary: 'blue',
    secondary: 'teal',
    outline: 'gray',
    danger: 'red'
  };
  
  const mappedVariant = variantMap[variant as keyof typeof variantMap] || variant;
  const mappedColorScheme = colorSchemeMap[variant as keyof typeof colorSchemeMap] || colorScheme;

  // Custom icon size based on button size
  const iconSize = size === 'sm' ? 16 : size === 'xs' ? 14 : 18;

  // Adjust icon components size
  const adjustedLeftIcon = leftIcon && React.isValidElement(leftIcon)
    ? React.cloneElement(leftIcon as React.ReactElement, { size: iconSize })
    : leftIcon;

  const adjustedRightIcon = rightIcon && React.isValidElement(rightIcon)
    ? React.cloneElement(rightIcon as React.ReactElement, { size: iconSize })
    : rightIcon;
  return (
    <ChakraButton
      variant={mappedVariant}
      size={size}
      isLoading={isLoading}
      leftIcon={!isLoading && adjustedLeftIcon ? adjustedLeftIcon : undefined}
      rightIcon={!isLoading && adjustedRightIcon ? adjustedRightIcon : undefined}
      colorScheme={mappedColorScheme}
      className={className}
      fontSize="sm"
      px={3}
      py={1.5}
      {...rest}
    >
      {children}
    </ChakraButton>
  );
};

export default Button;