# /speaklab 路由挂载示例

项目已经切换到 React Router 进行路由管理，并针对 GitHub Pages 设置了 `basename`。如果你需要在其它项目中挂载 `/speaklab`，可参考下方示例：

## React Router 版本（含 GitHub Pages 基础路径）
```jsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import SpeakLab from './pages/SpeakLab';
import ArticleApp from './ArticleApp';

const normalizeBase = (base) => {
  if (!base) return '/';
  if (base === '/') return '/';
  return base.endsWith('/') ? base.slice(0, -1) : base;
};

const basename = normalizeBase(import.meta.env.BASE_URL);

export default function App() {
  return (
    <BrowserRouter basename={basename}>
      <Routes>
        <Route path="/" element={<ArticleApp />} />
        <Route path="/speaklab" element={<SpeakLab />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
```
把 `/speaklab` 指向 `SpeakLab` 组件即可完成挂载；`import.meta.env.BASE_URL` 会在 GitHub Pages 构建时自动变为仓库名（如 `/English-Learning-Web/`），本地开发时则是 `/`，确保两种环境都能正常解析路由。
