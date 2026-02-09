import { RouterProvider } from 'react-router-dom'
import { ThemeProvider } from '@core/contexts'
import { router } from '@/routes'
import '@core/styles/global.scss'

function App() {
  return (
    <ThemeProvider>
      <RouterProvider router={router} />
    </ThemeProvider>
  )
}

export default App
