import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

const rootEl = document.getElementById('root');
if (!rootEl) {
  document.body.innerHTML = '<div style="padding:40px;text-align:center;font-family:sans-serif;"><h2>加载失败</h2><p>无法找到根元素 #root</p></div>';
} else {
  try {
    createRoot(rootEl).render(
      <StrictMode>
        <App />
      </StrictMode>,
    );
  } catch (e) {
    rootEl.innerHTML = `<div style="padding:40px;text-align:center;font-family:sans-serif;"><h2>应用启动错误</h2><p>${(e as Error).message}</p></div>`;
  }
}
