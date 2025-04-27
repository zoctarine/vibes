import React from 'react';
import {
  Alert as ChakraAlert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  CloseButton,
  Box
} from '@chakra-ui/react';
import { AlertCircle, CheckCircle, Info, XCircle } from 'lucide-react';

type AlertVariant = 'info' | 'success' | 'warning' | 'error';

interface AlertProps {
  title?: string;
  children: React.ReactNode;
  variant?: AlertVariant;
  isDismissable?: boolean;
  onDismiss?: () => void;
  className?: string;
}

const Alert: React.FC<AlertProps> = ({
  title,
  children,
  variant = 'info',
  isDismissable = false,
  onDismiss,
  className = '',
}) => {
  const variantProps = {
    info: { status: 'info', icon: Info },
    success: { status: 'success', icon: CheckCircle },
    warning: { status: 'warning', icon: AlertCircle },
    error: { status: 'error', icon: XCircle },
  };

  const { status, icon: Icon } = variantProps[variant];

  return (
    <ChakraAlert
      status={status}
      variant="subtle"
      className={className}
      borderRadius="md"
      display="flex"
      alignItems="flex-start"
    >
      <Box as={Icon} boxSize="5" mr={3} />
      <Box flex="1">
        {title && <AlertTitle>{title}</AlertTitle>}
        <AlertDescription display="block">
          {children}
        </AlertDescription>
      </Box>
      {isDismissable && onDismiss && (
        <CloseButton
          position="relative"
          right={-1}
          top={-1}
          onClick={onDismiss}
        />
      )}
    </ChakraAlert>
  );
};

export default Alert;