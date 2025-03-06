import React from 'react'
import ReactDOM from 'react-dom/client'
import { ChakraProvider, extendTheme } from '@chakra-ui/react'
import App from './App.tsx'
import './index.css'
import { initializePlugins } from './plugins'

// 初始化插件系统
initializePlugins()

// 扩展Chakra UI主题
const theme = extendTheme({
  colors: {
    brand: {
      50: '#e6f6ff',
      100: '#bae3ff',
      200: '#7cc4fa',
      300: '#47a3f3',
      400: '#2186eb',
      500: '#0967d2',
      600: '#0552b5',
      700: '#03449e',
      800: '#01337d',
      900: '#002159',
    },
  },
  config: {
    initialColorMode: 'light',
    useSystemColorMode: false,
  },
})

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ChakraProvider theme={theme}>
      <App />
    </ChakraProvider>
  </React.StrictMode>,
)
