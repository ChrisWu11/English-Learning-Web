import { useState, useEffect } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import Layout from './components/Layout';
import NavSidebar from './components/NavSidebar';
import ArticleReader from './components/ArticleReader';
import { articles } from './data';
import { useArticleParser } from './hooks/useArticleParser';
import SpeakLab from './pages/SpeakLab';
import PhraseTyping from './pages/PhraseTyping';
import './styles/main.scss';

function ArticleApp() {
  const [activeArticleId, setActiveArticleId] = useState(articles[0].id);

  // 左侧导航状态 (默认: 手机收起, 桌面展开)
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(window.innerWidth < 768);
  
  // 右侧单词表状态 (默认: 关闭)
  const [isVocabOpen, setIsVocabOpen] = useState(false);
  
  const currentArticle = articles.find(a => a.id === activeArticleId) || articles[0];
  const { parsedParagraphs, vocabList } = useArticleParser(currentArticle.content);

  // 监听屏幕大小变化
  useEffect(() => {
    const handleResize = () => {
      const isMobile = window.innerWidth < 768;
      // 桌面端强制展开左侧，关闭右侧浮层
      if (!isMobile) {
        setIsSidebarCollapsed(false);
        setIsVocabOpen(false);
      } else {
        setIsSidebarCollapsed(true);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // 切换文章时，手机端自动收起所有菜单
  const handleSelectArticle = (id) => {
    setActiveArticleId(id);
    if (window.innerWidth < 768) {
      setIsSidebarCollapsed(true);
      setIsVocabOpen(false);
    }
  };

  // 点击遮罩层：关闭所有侧边栏
  const handleCloseAll = () => {
    setIsSidebarCollapsed(true);
    setIsVocabOpen(false);
  };

  return (
    <Layout
      // 只要左侧展开 或 右侧展开，就显示遮罩
      isBackdropVisible={!isSidebarCollapsed || isVocabOpen}
      onCloseAll={handleCloseAll}

      sidebar={
        <NavSidebar 
          articles={articles} 
          activeId={activeArticleId} 
          onSelect={handleSelectArticle}
          collapsed={isSidebarCollapsed}
        />
      }
      main={
        <ArticleReader 
          article={currentArticle} 
          paragraphs={parsedParagraphs}
          vocabList={vocabList}
          
          // 左侧控制
          onToggleNav={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          
          // 右侧控制
          isVocabOpen={isVocabOpen}
          onToggleVocab={() => setIsVocabOpen(!isVocabOpen)}
        />
      }
    />
  );
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<ArticleApp />} />
      <Route path="/speaklab" element={<SpeakLab />} />
      <Route path="/phrase-typing" element={<PhraseTyping />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
