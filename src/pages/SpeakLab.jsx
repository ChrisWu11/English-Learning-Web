import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import SentenceTrainer from '../components/SentenceTrainer';
import presets from '../data/speaklabPresets.json';
import '../styles/speaklab.scss';

function splitIntoSentences(text = '') {
  return (text.match(/[^.!?]+[.!?]?/g) || [])
    .map(s => s.trim())
    .filter(Boolean);
}

export default function SpeakLab() {
  const [input, setInput] = useState(
    'London is a city full of stories.\nSpeak clearly to be understood.\nPractice makes perfect!'
  );
  const [activePreset, setActivePreset] = useState('');
  const [showPresetDrawer, setShowPresetDrawer] = useState(false);
  const [drawerActive, setDrawerActive] = useState(false);

  const sentences = useMemo(() => splitIntoSentences(input), [input]);

  const handlePresetSelect = (preset) => {
    setInput(preset.lines.join('\n'));
    setActivePreset(preset.id);
    handleCloseDrawer();
  };

  const handleOpenDrawer = () => {
    setShowPresetDrawer(true);
    requestAnimationFrame(() => setDrawerActive(true));
  };

  const handleCloseDrawer = () => {
    setDrawerActive(false);
    setTimeout(() => setShowPresetDrawer(false), 260);
  };

  return (
    <div className="speaklab-page">
      <div className="speaklab-main">
        <header className="speaklab-hero">
          <div>
            <div className="hero-meta">
              <p className="eyebrow">SpeakLab · Browser-only MVP</p>
            </div>
            <h1>免费英式口语训练房</h1>
            <p className="lede">
              使用浏览器自带的语音合成功能 (SpeechSynthesis)、录音 (MediaRecorder)、语音识别
              (SpeechRecognition) 打造的零成本口语练习工具。输入你的练习文本，逐句练到熟练。
            </p>
          <div className="pill-row">
            <span className="pill">英式发音 TTS</span>
            <span className="pill">录音 + 回放</span>
            <span className="pill">自动语音识别</span>
            <span className="pill">编辑距离评分</span>
          </div>
        </div>
        <Link className="glass-card back-card" to="/">
          <div className="back-icon" aria-hidden>←</div>
          <div>
            <p className="glass-card__title">返回文章阅读</p>
            <p className="glass-card__desc">回到首页继续阅读内容</p>
          </div>
        </Link>
      </header>

      <section className="input-panel">
        <div className="panel-header">
          <div>
            <p className="label">输入练习文本（自动按句拆分）</p>
            <p className="muted">英文最佳，支持标点 . ? ! 作为分句依据。</p>
          </div>
          <div className="panel-actions">
            <div className="hint">🔥 录音时将同时触发 en-GB 的语音识别</div>
            <button
              type="button"
              className="preset-trigger"
              onClick={handleOpenDrawer}
            >
              <span className="icon" aria-hidden>🗂️</span>
              <span>打开例句目录</span>
            </button>
          </div>
        </div>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          rows={5}
            placeholder="Paste or type any English paragraph here..."
          />
          <div className="split-preview">
            <span className="pill">已拆分 {sentences.length} 句</span>
          </div>
        </section>

        <section className="cards-grid">
          {sentences.length === 0 && (
            <div className="empty">请输入内容以生成训练卡片。</div>
        )}
        {sentences.map((sentence, idx) => (
          <SentenceTrainer key={`${sentence}-${idx}`} sentence={sentence} />
        ))}
      </section>
      </div>

      <footer className="speaklab-footer">
        <div>
          <p className="eyebrow">Thanks for visiting SpeakLab</p>
          <p>完全基于浏览器原生 API 打造的零成本口语练习 MVP。</p>
        </div>
        <div>
          <p>作者：Chris Wu</p>
          <a href="https://github.com/ChrisHughes24/English-Learning-Web" target="_blank" rel="noreferrer">
            GitHub 仓库
          </a>
        </div>
      </footer>

      {showPresetDrawer && (
        <div className={`preset-drawer ${drawerActive ? 'is-open' : ''}`} role="dialog" aria-modal="true">
          <div className="preset-drawer__backdrop" onClick={handleCloseDrawer} />
          <div className="preset-drawer__panel">
            <div className="preset-drawer__header">
              <div>
                <p className="eyebrow">例句目录</p>
                <h3>一键导入练习素材</h3>
                <p className="muted">
                  所有例句均为 JSON 定义，点击卡片即可填充到输入框，方便快速开始。
                </p>
              </div>
              <button
                type="button"
                className="close-btn"
                onClick={handleCloseDrawer}
                aria-label="关闭例句目录"
              >
                <span aria-hidden>✕</span>
              </button>
            </div>
            <div className="preset-drawer__body">
              <div className="preset-grid compact">
                {presets.map((preset) => {
                  const isActive = activePreset === preset.id;
                  return (
                    <button
                      key={preset.id}
                      className={`preset-card ${isActive ? 'preset-card--active' : ''}`}
                      onClick={() => handlePresetSelect(preset)}
                      type="button"
                    >
                      <div className="preset-card__meta">
                        <p className="label">{preset.title}</p>
                        <span className="badge">{preset.lines.length} 句</span>
                      </div>
                      <p className="preset-card__desc">{preset.description}</p>
                      <pre className="preset-card__json">{JSON.stringify(preset.lines, null, 2)}</pre>
                      <span className="preset-card__cta">{isActive ? '已导入' : '点击导入'}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
