import { useMemo } from 'react';

export const useArticleParser = (rawContent) => {
  return useMemo(() => {
    if (!rawContent) return { parsedParagraphs: [], vocabList: [] };

    const vocabList = [];
    let maskCounter = 0;

    const paragraphs = rawContent.trim().split(/\n\s*\n/); // 按双换行分段

    const parsedParagraphs = paragraphs.map((para, paraIndex) => {
      const parts = para.split(/(\[.*?\])/g);
      
      return parts.map((part, partIndex) => {
        if (part.startsWith('[') && part.endsWith(']')) {
          const text = part.slice(1, -1);
          const id = `mask-${maskCounter++}`; // 生成唯一 ID
          
          vocabList.push({ id, text });

          return { type: 'mask', id, text, key: `${paraIndex}-${partIndex}` };
        }
        return { type: 'text', content: part, key: `${paraIndex}-${partIndex}` };
      });
    });

    return { parsedParagraphs, vocabList };
  }, [rawContent]);
};