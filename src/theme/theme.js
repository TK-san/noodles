import { extendTheme } from '@chakra-ui/react';

// Custom theme optimized for mobile
const theme = extendTheme({
  config: {
    initialColorMode: 'light',
    useSystemColorMode: false,
  },
  colors: {
    brand: {
      50: '#ffe5e5',
      100: '#ffb8b8',
      200: '#ff8a8a',
      300: '#ff5c5c',
      400: '#ff2e2e',
      500: '#e60000', // Primary red (like noodles!)
      600: '#b30000',
      700: '#800000',
      800: '#4d0000',
      900: '#1a0000',
    },
    noodle: {
      yellow: '#FFD93D',
      red: '#E63946',
      cream: '#FFF8E7',
    }
  },
  fonts: {
    heading: `'Noto Sans SC', -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`,
    body: `'Noto Sans SC', -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`,
  },
  styles: {
    global: {
      body: {
        bg: 'gray.50',
      },
    },
  },
});

export default theme;