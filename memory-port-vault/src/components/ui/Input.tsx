import React, { forwardRef } from 'react';
import {
  Input as ChakraInput,
  FormControl,
  FormLabel as ChakraFormLabel,
  FormHelperText,
  FormErrorMessage,
  InputProps as ChakraInputProps,
  InputGroup,
  InputLeftElement,
} from '@chakra-ui/react';

interface InputProps extends ChakraInputProps {
  label?: string;
  error?: string;
  helpText?: string;
  leftElement?: React.ReactNode;
}

const Input = forwardRef<HTMLInputElement, InputProps>(({
  label,
  error,
  helpText,
  leftElement,
  className = '',
  pl,
  ...rest
}, ref) => {
  return (
    <FormControl isInvalid={!!error}>
      {label && (
        <ChakraFormLabel fontSize="sm" fontWeight="medium" color="gray.700" mb="1">
          {label}
        </ChakraFormLabel>
      )}
      <InputGroup>
        {leftElement && (
          <InputLeftElement
            pointerEvents="none"
            color="gray.400"
            h="full"
            pl="3"
          >
            {leftElement}
          </InputLeftElement>
        )}
        <ChakraInput
          ref={ref}
          h="10"
          className={className}
          errorBorderColor="red.300"
          focusBorderColor="blue.500"
          pl={leftElement ? "12" : pl}
          fontSize="sm"
          {...rest}
        />
      </InputGroup>
      {helpText && !error && (
        <FormHelperText fontSize="xs">{helpText}</FormHelperText>
      )}
      {error && (
        <FormErrorMessage fontSize="xs">{error}</FormErrorMessage>
      )}
    </FormControl>
  );
});

Input.displayName = 'Input';

export default Input