import { extendTheme } from '@chakra-ui/react';

const semanticTokens = {
  colors: {
    'bg.canvas': { default: 'gray.50' },
    'bg.surface': { default: 'white' },
    'bg.subtle': { default: 'gray.100' },
    'border.subtle': { default: 'gray.200' },
    'border.emphasis': { default: 'gray.300' },
  }
};

const theme = extendTheme({
  semanticTokens,
  styles: {
    global: {
      body: {
        bg: 'bg.canvas',
        color: 'gray.900',
      },
    },
  },
  colors: {
    brand: {
      50: '#EBF8FF',
      100: '#BEE3F8',
      200: '#90CDF4',
      300: '#63B3ED',
      400: '#4299E1',
      500: '#3182CE',
      600: '#2B6CB0',
      700: '#2C5282',
      800: '#2A4365',
      900: '#1A365D',
    },
  },
  fonts: {
    heading: `'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"`,
    body: `'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"`,
  },
  components: {
    Button: {
      baseStyle: {
        fontWeight: 'medium',
        borderRadius: 'md',
        transition: 'all 0.2s',
        _focus: {
          boxShadow: 'outline',
        },
      },
      variants: {
        solid: {
          bg: 'brand.500',
          color: 'white',
          backdropFilter: 'blur(8px)',
          _hover: {
            bg: 'brand.600',
            transform: 'translateY(-1px)',
            shadow: 'sm',
          },
          _active: {
            bg: 'brand.700',
            transform: 'translateY(0)',
          },
        },
        outline: {
          borderColor: 'border.subtle',
          color: 'gray.700',
          bg: 'white',
          _hover: {
            bg: 'bg.subtle',
            borderColor: 'border.emphasis',
          },
        },
        ghost: {
          color: 'gray.700',
          _hover: {
            bg: 'gray.100',
          },
        },
      },
      defaultProps: {
        variant: 'solid',
      },
    },
    Card: {
      baseStyle: {
        container: {
          borderRadius: 'lg',
          boxShadow: 'base',
          bg: 'bg.surface',
          borderWidth: '1px',
          borderColor: 'border.subtle',
          transition: 'all 0.2s',
          bg: 'white',
          _hover: {
            shadow: 'md',
            borderColor: 'border.emphasis',
          },
        },
      },
    },
    Input: {
      variants: {
        outline: {
          field: {
            borderColor: 'border.subtle',
            borderRadius: 'md',
            bg: 'white',
            transition: 'all 0.2s',
            _placeholder: {
              color: 'gray.400',
            },
            _hover: {
              borderColor: 'border.emphasis',
            },
            _focus: {
              borderColor: 'brand.500',
              boxShadow: '0 0 0 2px var(--chakra-colors-brand-100)',
            },
          },
        },
      },
    },
    Heading: {
      baseStyle: {
        fontWeight: 'bold',
        letterSpacing: '-0.025em',
      },
    },
    Modal: {
      baseStyle: {
        dialog: {
          borderRadius: 'lg',
          shadow: 'xl',
        },
        overlay: {
          backdropFilter: 'blur(8px)',
        },
      },
    },
    Tag: {
      baseStyle: {
        container: {
          borderRadius: 'full',
          bg: 'gray.100',
          transition: 'all 0.2s',
          _hover: {
            transform: 'translateY(-1px)',
            bg: 'gray.200',
          },
        },
      },
    },
  },
  layerStyles: {
    card: {
      bg: 'bg.surface',
      borderRadius: 'lg',
      boxShadow: 'base',
      borderWidth: '1px',
      borderColor: 'border.subtle',
      p: '6',
    },
  },
  textStyles: {
    h1: {
      fontSize: ['2xl', '3xl'],
      fontWeight: 'bold',
      lineHeight: '1.1',
      letterSpacing: '-0.01em',
    },
    h2: {
      fontSize: ['xl', '2xl'],
      fontWeight: 'semibold',
      lineHeight: '1.1',
      letterSpacing: '-0.01em',
    },
  },
  shadows: {
    outline: '0 0 0 3px var(--chakra-colors-brand-100)',
  },
})

export default theme;