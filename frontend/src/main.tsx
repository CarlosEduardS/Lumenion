import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import EditorPage from './pages/EditorPage/editor.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

createRoot(document.getElementById('editor')!).render(
  <StrictMode>
    <EditorPage/>
  </StrictMode>,
)