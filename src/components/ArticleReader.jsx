import { useState, useEffect } from 'react';
import MaskedPhrase from './MaskedPhrase';
import VocabSidebar from './VocabSidebar';
import '../styles/Layout.scss';

const ArticleReader = ({ article, paragraphs, vocabList, onToggleSidebar }) => {
  const [revealTrigger, setRevealTrigger] = useState(0);
  const [resetTrigger, setResetTrigger] = useState(0);

  // 切换文章时，滚动回顶部 & 重置蒙版
  useEffect(() => {
    document.querySelector('.content-scroll-area').scrollTop = 0;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setResetTrigger(t => t + 1);
  }, [article.id]);

  return (
    <div className="main-wrapper">
      {/* 顶部 Toggle 按钮 */}
      <div className="top-bar">
        <button className="toggle-btn" onClick={onToggleSidebar}>
          <svg width="24" height="24" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" fill="none">
            <line x1="3" y1="12" x2="21" y2="12"></line>
            <line x1="3" y1="6" x2="21" y2="6"></line>
            <line x1="3" y1="18" x2="21" y2="18"></line>
          </svg>
        </button>
      </div>

      {/* 滚动区域：包含 文章 + 侧边栏 (Flex布局) */}
      <div className="content-scroll-area">
        
        {/* 文章卡片 */}
        <div className="article-container">
          <header>
            <h1>{article.title}</h1>
            <p className="subtitle">Click masks to reveal</p>
          </header>

          <div className="text-body">
            {paragraphs.map((para, i) => (
              <p key={i}>
                {para.map((token) => 
                  token.type === 'mask' ? (
                    <MaskedPhrase
                      key={token.key} id={token.id} text={token.text}
                      globalRevealTrigger={revealTrigger} globalResetTrigger={resetTrigger}
                    />
                  ) : (
                    <span key={token.key}>{token.content}</span>
                  )
                )}
              </p>
            ))}
          </div>

          <div className="controls">
            <button className="btn-primary" onClick={() => setRevealTrigger(t => t + 1)}>Show All Phrases</button>
            <button className="btn-secondary" onClick={() => setResetTrigger(t => t + 1)}>Reset Masks</button>
          </div>
        </div>

        {/* 右侧单词表 (必须放在这里才能随内容滚动并 Sticky) */}
        <VocabSidebar vocabList={vocabList} />
      </div>
    </div>
  );
};

export default ArticleReader;