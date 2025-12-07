import '../styles/Layout.scss';

const VocabSidebar = ({ vocabList }) => {
  const handleItemClick = (maskId) => {
    const maskElement = document.getElementById(maskId);
    if (maskElement) {
      maskElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      if (maskElement.triggerHighlight) {
        maskElement.triggerHighlight();
      }
    }
  };

  if (!vocabList || vocabList.length === 0) return null;

  // 【修改点】：直接返回 vocab-card，因为外层已经被父组件的 div 包裹了
  return (
    <div className="vocab-card">
      <div className="vocab-header">
        Key Phrases <span className="vocab-count">{vocabList.length}</span>
      </div>
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