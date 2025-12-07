import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // 【这里是关键】
  base: '/English-Learning-Web/', // ⚠️ 注意：这里必须换成你的仓库名，否则部署后是白屏！
  build: {
    outDir: 'docs', // 告诉 Vite 把构建结果输出到 docs 目录
  }
})