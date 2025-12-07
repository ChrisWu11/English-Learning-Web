import '../styles/Layout.scss';

const VocabSidebar = ({ vocabList }) => {
  const handleItemClick = (maskId) => {
    const maskElement = document.getElementById(maskId);
    if (maskElement) {
      // 滚动
      maskElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      // 触发高亮 (调用我们在 MaskedPhrase 里挂载的方法)
      if (maskElement.triggerHighlight) {
        maskElement.triggerHighlight();
      }
    }
  };

  if (!vocabList || vocabList.length === 0) return null;

  return (
    <aside className="vocab-panel">
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
    </aside>
  );
};

export default VocabSidebar;