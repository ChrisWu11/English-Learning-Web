/* eslint-disable react-hooks/set-state-in-effect */
import { useState, useEffect } from "react";

const MaskedPhrase = ({
  id,
  text,
  globalRevealTrigger,
  globalResetTrigger,
}) => {
  const [isRevealed, setIsRevealed] = useState(false);
  const [isHighlighted, setIsHighlighted] = useState(false);

  // 1. 响应全局按钮
  useEffect(() => {
    if (globalRevealTrigger > 0) setIsRevealed(true);
  }, [globalRevealTrigger]);
  useEffect(() => {
    if (globalResetTrigger > 0) setIsRevealed(false);
  }, [globalResetTrigger]);

  // 2. 响应右侧列表点击 (通过 DOM 自定义事件/方法)
  useEffect(() => {
    const element = document.getElementById(id);
    if (element) {
      element.triggerHighlight = () => {
        if (!isRevealed) setIsRevealed(true); // 自动揭开
        setIsHighlighted(true); // 高亮
        setTimeout(() => setIsHighlighted(false), 1500); // 移除高亮
      };
    }
  }, [id, isRevealed]);

  return (
    <span
      id={id}
      className={`mask ${isRevealed ? "revealed" : ""} ${
        isHighlighted ? "highlight-focus" : ""
      }`}
      onClick={() => setIsRevealed(!isRevealed)}
    >
      {text}
    </span>
  );
};

export default MaskedPhrase;
