import {extendTheme} from 'native-base'

const theme = extendTheme({
  colors: {
    // Add new color
    primary: {
      50: '#9ab6d9',
      100: '#86a8d1',
      200: '#7299c9',
      300: '#5e8bc2',
      400: '#4a7cba',
      500: '#366EB3',
      600: '#3063a1',
      700: '#2b588f',
      800: '#254d7d',
      900: '#20426b',
    },
    // Redefining only one shade, rest of the color will remain same.
    amber: {
      600: '#ffffff',
    },
  }
})

export default theme