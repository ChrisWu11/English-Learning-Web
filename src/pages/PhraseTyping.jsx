import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import '../styles/phraseTyping.scss';

const normalizePhrase = (text = '') =>
  text
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();

const fetchSessionData = () => {
  try {
    const raw = sessionStorage.getItem('phraseTypingData');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export default function PhraseTyping() {
  const location = useLocation();
  const audioContextRef = useRef(null);
  const hasAutoPlayed = useRef(false);

  const initialPayload = useMemo(() => {
    if (location.state?.phrases?.length) {
      return location.state;
    }
    return fetchSessionData();
  }, [location.state]);

  const phrases = initialPayload?.phrases ?? [];
  const articleTitle = initialPayload?.articleTitle ?? '短语拼写复习';

  const [currentIndex, setCurrentIndex] = useState(0);
  const [inputValue, setInputValue] = useState('');
  const [status, setStatus] = useState('idle');
  const [lastChecked, setLastChecked] = useState(null);

  const currentPhrase = phrases[currentIndex]?.text || '';
  const normalizedTarget = useMemo(
    () => normalizePhrase(currentPhrase),
    [currentPhrase]
  );

  useEffect(() => {
    if (!phrases.length || hasAutoPlayed.current) return;
    hasAutoPlayed.current = true;
    handleSpeak(currentPhrase);
  }, [phrases, currentPhrase]);

  useEffect(() => {
    setInputValue('');
    setStatus('idle');
    setLastChecked(null);
  }, [currentIndex]);

  const handleSpeak = (text) => {
    if (!('speechSynthesis' in window)) return;
    if (!text) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-GB';
    const voices = window.speechSynthesis.getVoices();
    const britishVoice = voices.find(v => v.lang === 'en-GB');
    if (britishVoice) utterance.voice = britishVoice;
    window.speechSynthesis.speak(utterance);
  };

  const playKeyClick = () => {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return;
    if (!audioContextRef.current) {
      audioContextRef.current = new AudioContextClass();
    }
    const context = audioContextRef.current;
    if (context.state === 'suspended') {
      context.resume();
    }

    const oscillator = context.createOscillator();
    const gainNode = context.createGain();
    oscillator.type = 'square';
    oscillator.frequency.setValueAtTime(280 + Math.random() * 80, context.currentTime);
    gainNode.gain.setValueAtTime(0.12, context.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, context.currentTime + 0.06);
    oscillator.connect(gainNode);
    gainNode.connect(context.destination);
    oscillator.start();
    oscillator.stop(context.currentTime + 0.06);
  };

  const handleInputChange = (event) => {
    setInputValue(event.target.value.toLowerCase());
    if (status !== 'idle') {
      setStatus('idle');
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      handleCheck();
      return;
    }
    if (event.key.length === 1) {
      playKeyClick();
    }
  };

  const handleCheck = () => {
    const normalizedInput = normalizePhrase(inputValue);
    if (!normalizedInput) return;
    const isCorrect = normalizedInput === normalizedTarget;
    setStatus(isCorrect ? 'correct' : 'wrong');
    setLastChecked({
      input: normalizedInput,
      target: normalizedTarget,
      correct: isCorrect,
    });
  };

  const handleNext = () => {
    if (currentIndex < phrases.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  const progressValue = phrases.length ? ((currentIndex + 1) / phrases.length) * 100 : 0;

  if (!phrases.length) {
    return (
      <div className="phrase-typing-page empty-state">
        <div className="empty-card">
          <p className="eyebrow">Phrase Typing Lab</p>
          <h1>没有找到短语列表</h1>
          <p>请先回到首页，在短语列表中点击「拼写复习模式」。</p>
          <Link className="ghost-link" to="/">返回首页</Link>
        </div>
      </div>
    );
  }

  const phraseCharacters = currentPhrase.split('').map((char, idx) => {
    const typedChar = inputValue[idx];
    if (!typedChar) {
      return (
        <span key={`${char}-${idx}`} className={`char ${char === ' ' ? 'space' : ''}`}>
          {char === ' ' ? '·' : '—'}
        </span>
      );
    }
    const match = typedChar.toLowerCase() === char.toLowerCase();
    return (
      <span key={`${char}-${idx}`} className={`char typed ${match ? 'match' : 'mismatch'}`}>
        {typedChar}
      </span>
    );
  });

  return (
    <div className="phrase-typing-page">
      <header className="phrase-typing-header">
        <div>
          <p className="eyebrow">Typing Review</p>
          <h1>{articleTitle}</h1>
          <p className="muted">听音频，拼写完整短语。大小写不影响判断。</p>
        </div>
        <Link className="ghost-link" to="/">返回主页</Link>
      </header>

      <main className="phrase-typing-main">
        <section className="phrase-card" key={currentIndex} data-status={status}>
          <div className="phrase-meta">
            <span className="pill">第 {currentIndex + 1} / {phrases.length} 条</span>
            <button className="audio-btn" type="button" onClick={() => handleSpeak(currentPhrase)}>
              🔈 播放短语
            </button>
          </div>

          <div className="phrase-display">{phraseCharacters}</div>

          <div className="input-area">
            <label htmlFor="phrase-input">请输入你听到的短语</label>
            <input
              id="phrase-input"
              type="text"
              value={inputValue}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder="Start typing here..."
              autoComplete="off"
              spellCheck={false}
            />
          </div>

          <div className="result-row">
            <div className={`status-pill ${status}`}>
              {status === 'correct' && '✅ 拼写正确'}
              {status === 'wrong' && '❌ 拼写错误，再试一次'}
              {status === 'idle' && '准备好后按 Enter 检查'}
            </div>
            <button className="check-btn" type="button" onClick={handleCheck}>
              检查答案
            </button>
          </div>

          {lastChecked && !lastChecked.correct && (
            <div className="hint-card">
              <p className="label">正确答案（已忽略大小写）</p>
              <p className="answer">{currentPhrase}</p>
            </div>
          )}
        </section>

        <section className="phrase-controls">
          <div className="progress-bar">
            <div className="progress-track">
              <div className="progress-fill" style={{ width: `${progressValue}%` }} />
            </div>
            <span>{currentIndex + 1} / {phrases.length}</span>
          </div>
          <div className="nav-buttons">
            <button type="button" onClick={handlePrev} disabled={currentIndex === 0}>
              上一条
            </button>
            <button type="button" onClick={handleNext} disabled={currentIndex === phrases.length - 1}>
              下一条
            </button>
          </div>
        </section>
      </main>
    </div>
  );
}
