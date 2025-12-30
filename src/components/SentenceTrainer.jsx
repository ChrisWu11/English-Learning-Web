import { useMemo, useState } from 'react';
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

export default function SentenceTrainer({ sentence }) {
  const [note, setNote] = useState('');
  const [hasSubmitted, setHasSubmitted] = useState(false);

  const {
    isSupported: recorderSupported,
    isRecording,
    audioURL,
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
    resetTranscript,
  } = useSpeechRecognition('en-GB');

  const speechReady = useMemo(
    () => 'speechSynthesis' in window,
    []
  );

  const normalizedTranscript = useMemo(() => normalizeText(transcript), [transcript]);
  const normalizedOrigin = useMemo(() => normalizeText(sentence), [sentence]);

  const calculatedScore = useMemo(() => {
    if (!hasSubmitted || !normalizedTranscript) return null;
    return similarityScore(normalizedOrigin, normalizedTranscript);
  }, [hasSubmitted, normalizedOrigin, normalizedTranscript]);

  const handleSpeak = () => {
    if (!speechReady) return;
    const utterance = new SpeechSynthesisUtterance(sentence);
    utterance.lang = 'en-GB';
    const voices = window.speechSynthesis.getVoices();
    const britishVoice = voices.find(v => v.lang === 'en-GB');
    if (britishVoice) utterance.voice = britishVoice;
    window.speechSynthesis.speak(utterance);
  };

  const beginRecordingFlow = async () => {
    if (!recorderSupported || !speechSupported) {
      setNote('Your browser does not fully support the required audio APIs.');
      return;
    }

    stopRecording();
    stopRecognition();
    resetTranscript();
    resetRecording();
    setHasSubmitted(false);
    setNote('Listening...');
    await startRecording();
    startRecognition();
  };

  const handleRecordingToggle = async () => {
    if (isRecording) {
      stopRecording();
      stopRecognition();
      setHasSubmitted(true);
      setNote(transcript ? '评分已自动更新' : '未检测到有效识别');
      return;
    }
    await beginRecordingFlow();
  };

  const handlePlay = () => {
    if (!audioURL) return;
    const audio = new Audio(audioURL);
    audio.play();
  };

  return (
    <div className="sentence-card">
      <div className="sentence-card__header">
        <p className="sentence-card__label">例句</p>
        <p className="sentence-card__text">{sentence}</p>
      </div>

      <div className="sentence-card__actions">
        <button className="ghost" onClick={handleSpeak} disabled={!speechReady}>
          🔈 英式朗读
        </button>
        <button
          className="primary"
          onClick={handleRecordingToggle}
          disabled={!recorderSupported || !speechSupported}
        >
          {isRecording ? '停止录音' : '开始录音'}
        </button>
        <button className="outline" onClick={handlePlay} disabled={!audioURL}>
          ▶️ 播放录音
        </button>
      </div>

      <div className="sentence-card__body">
        <div className="chip">{isListening ? '语音识别中...' : '准备好练习'}</div>
        {note && <div className="note">{note}</div>}
        {recorderError && <div className="error">录音错误：{recorderError}</div>}
        {speechError && <div className="error">识别错误：{speechError}</div>}

        <div className="result">
          <div className="result__text-block">
            <p className="label">识别文本</p>
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
