import { useEffect, useRef } from 'react';

export default function WaveformCanvas({ data = [], title, accent = 'var(--primary)' }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = accent;
    ctx.strokeStyle = 'rgba(255,255,255,0.25)';
    ctx.lineWidth = 1;

    const mid = height / 2;
    ctx.beginPath();
    ctx.moveTo(0, mid);
    ctx.lineTo(width, mid);
    ctx.stroke();

    if (!data.length) return;

    const barWidth = width / data.length;
    data.forEach((value, index) => {
      const amplitude = Math.max(-1, Math.min(1, value));
      const barHeight = Math.max(2, Math.abs(amplitude) * height * 0.9);
      const x = index * barWidth;
      ctx.fillRect(x, mid - barHeight / 2, barWidth * 0.8, barHeight);
    });
  }, [data, accent]);

  return (
    <div className="waveform-card">
      {title && <div className="waveform-card__title">{title}</div>}
      <canvas ref={canvasRef} width="480" height="120" />
    </div>
  );
}
