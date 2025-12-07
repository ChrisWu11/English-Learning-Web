import { useState } from 'react';
import Layout from './components/Layout';
import NavSidebar from './components/NavSidebar';
import ArticleReader from './components/ArticleReader';
import { articles } from './data';
import { useArticleParser } from './hooks/useArticleParser';
import './styles/main.scss'; // 必须引入全局样式

function App() {
  const [activeArticleId, setActiveArticleId] = useState(articles[0].id);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  
  const currentArticle = articles.find(a => a.id === activeArticleId) || articles[0];
  const { parsedParagraphs, vocabList } = useArticleParser(currentArticle.content);

  return (
    <Layout
      sidebar={
        <NavSidebar 
          articles={articles} 
          activeId={activeArticleId} 
          onSelect={setActiveArticleId}
          collapsed={isSidebarCollapsed}
        />
      }
      main={
        <ArticleReader 
          article={currentArticle} 
          paragraphs={parsedParagraphs}
          vocabList={vocabList} // 传给中间层
          onToggleSidebar={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        />
      }
    />
  );
}

export default App;