# /speaklab 路由挂载示例

该项目未使用外部路由库，直接在 `src/App.jsx` 内做路径判断即可。如果你的项目有 React Router，可参考下方示例：

## 方式一：保持当前实现（无需依赖）
```jsx
// src/App.jsx 节选
function App() {
  if (window.location.pathname === '/speaklab') {
    return <SpeakLab />;
  }
  return <ExistingApp />;
}
```

## 方式二：React Router 版本
```jsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import SpeakLab from './pages/SpeakLab';
import ArticleApp from './ArticleApp';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<ArticleApp />} />
        <Route path="/speaklab" element={<SpeakLab />} />
      </Routes>
    </BrowserRouter>
  );
}
```
把 `/speaklab` 指向 `SpeakLab` 组件即可完成挂载。
