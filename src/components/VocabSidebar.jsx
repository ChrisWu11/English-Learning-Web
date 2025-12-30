import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Layout.scss';

const VocabSidebar = ({ vocabList, articleTitle }) => {
  const navigate = useNavigate();

  const handleItemClick = (maskId) => {
    const maskElement = document.getElementById(maskId);
    if (maskElement) {
      maskElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      if (maskElement.triggerHighlight) {
        maskElement.triggerHighlight();
      }
    }
  };

  useEffect(() => {
    if (!vocabList || vocabList.length === 0) return;
    const payload = {
      articleTitle,
      phrases: vocabList,
      savedAt: new Date().toISOString(),
    };
    sessionStorage.setItem('phraseTypingData', JSON.stringify(payload));
  }, [vocabList, articleTitle]);

  const handleTypingClick = () => {
    if (!vocabList || vocabList.length === 0) return;
    navigate('/phrase-typing', {
      state: {
        articleTitle,
        phrases: vocabList,
      },
    });
  };

  if (!vocabList || vocabList.length === 0) return null;

  // 【修改点】：直接返回 vocab-card，因为外层已经被父组件的 div 包裹了
  return (
    <div className="vocab-card">
      <div className="vocab-header">
        <span>Key Phrases</span>
        <span className="vocab-count">{vocabList.length}</span>
      </div>
      <button className="vocab-cta" type="button" onClick={handleTypingClick}>
        拼写复习模式
      </button>
      <ul className="vocab-list">
        {vocabList.map((item) => (
          <li key={item.id} className="vocab-item" onClick={() => handleItemClick(item.id)}>
            {item.text}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default VocabSidebar;
