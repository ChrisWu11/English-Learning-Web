import { useMemo, useState } from 'react';
import WaveformCanvas from './WaveformCanvas';
import { useRecorder } from '../hooks/useRecorder';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';
import { similarityScore } from '../utils/levenshtein';

function normalizeText(text = '') {
  return text
    .toLowerCase()
    .replace(/[^a-z\s]/gi, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function createReferenceWaveform(text = '') {
  const clean = normalizeText(text);
  if (!clean) return [];
  const samples = 64;
  const arr = new Array(samples).fill(0);
  const hashValues = clean.split(' ').map(word => word.length + word.charCodeAt(0));
  for (let i = 0; i < samples; i++) {
    const seed = hashValues[i % hashValues.length] || 1;
    const value = Math.sin((i / samples) * Math.PI * 2) * 0.6 + (seed % 7) / 14;
    arr[i] = Math.max(-1, Math.min(1, value));
  }
  return arr;
}

export default function SentenceTrainer({ sentence }) {
  const [note, setNote] = useState('');

  const {
    isSupported: recorderSupported,
    isRecording,
    audioURL,
    waveform,
    error: recorderError,
    startRecording,
    stopRecording,
    resetRecording,
  } = useRecorder();

  const {
    supported: speechSupported,
    transcript,
    error: speechError,
    isListening,
    startRecognition,
    stopRecognition,
  } = useSpeechRecognition('en-GB');

  const speechReady = useMemo(
    () => 'speechSynthesis' in window,
    []
  );

  const normalizedTranscript = useMemo(() => normalizeText(transcript), [transcript]);
  const normalizedOrigin = useMemo(() => normalizeText(sentence), [sentence]);
  const referenceWaveform = useMemo(() => createReferenceWaveform(sentence), [sentence]);

  const calculatedScore = useMemo(() => {
    if (!normalizedTranscript) return null;
    return similarityScore(normalizedOrigin, normalizedTranscript);
  }, [normalizedOrigin, normalizedTranscript]);

  const handleSpeak = () => {
    if (!speechReady) return;
    const utterance = new SpeechSynthesisUtterance(sentence);
    utterance.lang = 'en-GB';
    const voices = window.speechSynthesis.getVoices();
    const britishVoice = voices.find(v => v.lang === 'en-GB');
    if (britishVoice) utterance.voice = britishVoice;
    window.speechSynthesis.speak(utterance);
  };

  const handleRecordToggle = async () => {
    if (!recorderSupported || !speechSupported) {
      setNote('Your browser does not fully support the required audio APIs.');
      return;
    }

    if (isRecording) {
      stopRecording();
      stopRecognition();
      setNote('Processing your speech...');
    } else {
      resetRecording();
      setNote('Listening...');
      await startRecording();
      startRecognition();
    }
  };

  const handlePlay = () => {
    if (!audioURL) return;
    const audio = new Audio(audioURL);
    audio.play();
  };

  return (
    <div className="sentence-card">
      <div className="sentence-card__header">
        <p className="sentence-card__text">{sentence}</p>
        <div className="sentence-card__actions">
          <button className="ghost" onClick={handleSpeak} disabled={!speechReady}>
            🔈 英式朗读
          </button>
          <button
            className={isRecording ? 'danger' : 'primary'}
            onClick={handleRecordToggle}
            disabled={!recorderSupported || !speechSupported}
          >
            {isRecording ? '停止录音' : '开始录音'}
          </button>
          <button className="outline" onClick={handlePlay} disabled={!audioURL}>
            ▶️ 播放录音
          </button>
        </div>
      </div>

      <div className="sentence-card__body">
        <div className="chip">{isListening ? '语音识别中...' : '准备好练习'}</div>
        {note && <div className="note">{note}</div>}
        {recorderError && <div className="error">录音错误：{recorderError}</div>}
        {speechError && <div className="error">识别错误：{speechError}</div>}

        <div className="waveform-grid">
          <WaveformCanvas title="例句波形" data={referenceWaveform} accent="var(--accent)" />
          <WaveformCanvas title="你的录音" data={waveform} accent="var(--primary)" />
        </div>

        <div className="result">
          <div>
            <p className="label">识别结果</p>
            <p className="result__text">{transcript || '暂无结果，请录音'}</p>
          </div>
          <div className="score">
            <p className="label">得分</p>
            <p className="score__value">{calculatedScore === null ? '--' : `${calculatedScore} / 100`}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
