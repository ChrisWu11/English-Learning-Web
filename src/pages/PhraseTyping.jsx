import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { phraseTranslations } from '../data/phraseTranslations';
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
  const confettiRef = useRef(null);

  const initialPayload = useMemo(() => {
    if (location.state?.phrases?.length) {
      return location.state;
    }
    return fetchSessionData();
  }, [location.state]);

  const phrases = initialPayload?.phrases ?? [];
  const articleTitle = initialPayload?.articleTitle ?? '短语拼写复习';

  const [currentIndex, setCurrentIndex] = useState(0);
  const [typedValue, setTypedValue] = useState('');
  const [status, setStatus] = useState('idle');
  const [lastChecked, setLastChecked] = useState(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const [showMeaning, setShowMeaning] = useState(false);

  const currentPhrase = phrases[currentIndex]?.text || '';
  const normalizedTarget = useMemo(
    () => normalizePhrase(currentPhrase),
    [currentPhrase]
  );

  useEffect(() => {
    setTypedValue('');
    setStatus('idle');
    setLastChecked(null);
    setShowAnswer(false);
    setShowMeaning(false);
  }, [currentIndex]);

  useEffect(() => {
    if (!phrases.length) return;
    handleSpeak(currentPhrase);
  }, [currentIndex, phrases.length, currentPhrase]);

  const handleSpeak = (text) => {
    if (!('speechSynthesis' in window)) return;
    if (!text) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-GB';
    utterance.rate = 0.72;
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

    const time = context.currentTime;
    const clickOsc = context.createOscillator();
    const clickGain = context.createGain();
    clickOsc.type = 'square';
    clickOsc.frequency.setValueAtTime(520 + Math.random() * 80, time);
    clickGain.gain.setValueAtTime(0.16, time);
    clickGain.gain.exponentialRampToValueAtTime(0.001, time + 0.04);
    clickOsc.connect(clickGain);
    clickGain.connect(context.destination);
    clickOsc.start(time);
    clickOsc.stop(time + 0.045);

    const noiseBuffer = context.createBuffer(1, context.sampleRate * 0.06, context.sampleRate);
    const bufferData = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferData.length; i += 1) {
      bufferData[i] = (Math.random() * 2 - 1) * (1 - i / bufferData.length);
    }
    const noise = context.createBufferSource();
    noise.buffer = noiseBuffer;
    const noiseGain = context.createGain();
    noiseGain.gain.setValueAtTime(0.18, time);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, time + 0.05);
    noise.connect(noiseGain);
    noiseGain.connect(context.destination);
    noise.start(time);
    noise.stop(time + 0.055);
  };

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.isComposing) return;
      if (event.shiftKey && event.key.toLowerCase() === 'a') {
        event.preventDefault();
        handleSpeak(currentPhrase);
        return;
      }

      if (event.key === 'Enter') {
        event.preventDefault();
        if (status === 'correct') {
          handleNext();
          return;
        }
        void handleCheck();
        return;
      }

      if (event.key === ' ') {
        event.preventDefault();
        playKeyClick();
        setTypedValue((prev) => `${prev} `);
        if (status !== 'idle') {
          setStatus('idle');
        }
        const nextValue = `${typedValue} `;
        if (normalizePhrase(nextValue) === normalizedTarget) {
          void handleCheck();
        }
        return;
      }

      if (event.key === 'Backspace') {
        event.preventDefault();
        setTypedValue((prev) => prev.slice(0, -1));
        if (status !== 'idle') {
          setStatus('idle');
        }
        return;
      }

      if (event.key.length === 1 && !event.metaKey && !event.ctrlKey && !event.altKey) {
        event.preventDefault();
        playKeyClick();
        const nextValue = `${typedValue}${event.key}`.toLowerCase();
        setTypedValue(nextValue);
        if (status !== 'idle') {
          setStatus('idle');
        }
        if (normalizePhrase(nextValue) === normalizedTarget) {
          void handleCheck();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentPhrase, status]);

  const handleCheck = async () => {
    const normalizedInput = normalizePhrase(typedValue);
    if (!normalizedInput) return;
    const isCorrect = normalizedInput === normalizedTarget;
    setStatus(isCorrect ? 'correct' : 'wrong');
    setLastChecked({
      input: normalizedInput,
      target: normalizedTarget,
      correct: isCorrect,
    });
    setShowMeaning(true);
    if (isCorrect) {
      if (!confettiRef.current) {
        try {
          const module = await import(
            'https://cdn.jsdelivr.net/npm/canvas-confetti@1.9.2/dist/confetti.module.mjs'
          );
          confettiRef.current = module.default || module;
        } catch (error) {
          confettiRef.current = null;
        }
      }
      if (confettiRef.current) {
        confettiRef.current({
          particleCount: 120,
          spread: 70,
          origin: { y: 0.6 },
        });
      }
    }
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
  const translationText = phraseTranslations[normalizedTarget] || '暂无中文释义';

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

  let cursor = 0;
  const phraseCharacters = currentPhrase.split(/(\s+)/).map((segment, segmentIndex) => {
    if (!segment) return null;
    if (segment.trim() === '') {
      const typedSpace = typedValue.slice(cursor, cursor + segment.length);
      const isFilled = typedSpace.length === segment.length;
      cursor += segment.length;
      return (
        <span
          key={`space-${segmentIndex}`}
          className={`word-gap ${isFilled ? 'filled' : ''}`}
          style={{ width: `${Math.max(segment.length, 1) * 18}px` }}
          aria-hidden
        >
          ·
        </span>
      );
    }

    const letters = segment.split('').map((char, idx) => {
      const typedChar = typedValue[cursor + idx];
      if (!typedChar) {
        return (
          <span key={`${char}-${cursor + idx}`} className="char">
            —
          </span>
        );
      }
      const match = typedChar.toLowerCase() === char.toLowerCase();
      return (
        <span key={`${char}-${cursor + idx}`} className={`char typed ${match ? 'match' : 'mismatch'}`}>
          {typedChar}
        </span>
      );
    });
    cursor += segment.length;
    return (
      <span key={`word-${segmentIndex}`} className="word-block">
        {letters}
      </span>
    );
  });

  return (
    <div className="phrase-typing-page">
      <header className="phrase-typing-header">
        <div>
          <p className="eyebrow">Typing Review</p>
          <h1>{articleTitle}</h1>
          <p className="muted">听音频，直接输入拼写完整短语。大小写不影响判断。</p>
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
          {showMeaning && (
            <div className="phrase-meaning">
              <span className="meaning-label">中文意思</span>
              <span className="meaning-text">{translationText}</span>
            </div>
          )}

          <div className="typing-hint">
            <span>直接输入拼写，Enter 检查，正确后 Enter 进入下一条。</span>
            <span>Shift + A 重听短语。</span>
          </div>

          <div className="result-row">
            <div className={`status-pill ${status}`}>
              {status === 'correct' && '✅ 拼写正确'}
              {status === 'wrong' && '❌ 拼写错误，再试一次'}
              {status === 'idle' && '准备好后按 Enter 检查'}
            </div>
            <div className="result-actions">
              <button className="ghost" type="button" onClick={() => setShowAnswer(true)}>
                显示答案
              </button>
              <button className="check-btn" type="button" onClick={handleCheck}>
                检查答案
              </button>
            </div>
          </div>

          {(showAnswer || (lastChecked && !lastChecked.correct)) && (
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
