import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import MaskedPhrase from './MaskedPhrase';
import VocabSidebar from './VocabSidebar';
import '../styles/Layout.scss';

const ArticleReader = ({ 
  article, 
  paragraphs, 
  vocabList,
  onToggleNav,
  isVocabOpen,
  onToggleVocab
}) => {
  const [revealTrigger, setRevealTrigger] = useState(0);
  const [resetCounter, setResetCounter] = useState(0);

  const resetTrigger = Array.from(article.id).reduce((acc, char) => acc + char.charCodeAt(0), 0) + resetCounter;

  useEffect(() => {
    const area = document.querySelector('.content-scroll-area');
    if (area) area.scrollTop = 0;
  }, [article.id]);

  return (
    <div className="main-wrapper">
      {/* 顶部左侧汉堡按钮 */}
      <div className="top-bar">
        <button className="toggle-btn" onClick={onToggleNav}>
          <svg width="24" height="24" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" fill="none">
            <line x1="3" y1="12" x2="21" y2="12"></line>
            <line x1="3" y1="6" x2="21" y2="6"></line>
            <line x1="3" y1="18" x2="21" y2="18"></line>
          </svg>
        </button>

        <div className="top-actions">
          <Link className="btn-cta" to="/speaklab">Go to SpeakLab</Link>
        </div>
      </div>

      <div className="content-scroll-area">
        {/* 文章区域 */}
        <div className="article-container">
          <header className="article-header">
            <div>
              <h1>{article.title}</h1>
              <p className="subtitle">Click masks to reveal / 点击蒙版显示</p>
            </div>
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
            <button className="btn-primary" onClick={() => setRevealTrigger(t => t + 1)}>Show All</button>
            <button className="btn-secondary" onClick={() => setResetCounter(t => t + 1)}>Reset</button>
          </div>
        </div>

        {/* 右侧单词表：包裹一层 div 以便处理移动端 class */}
        <div className={`vocab-panel ${isVocabOpen ? 'mobile-open' : ''}`}>
           <VocabSidebar vocabList={vocabList} />
        </div>
      </div>

      {/* 手机端右下角悬浮按钮 (FAB) */}
      <button className="fab-btn" onClick={onToggleVocab} title="Toggle Vocabulary">
        {/* 书本图标 */}
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
          <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
        </svg>
      </button>
    </div>
  );
};

export default ArticleReader;