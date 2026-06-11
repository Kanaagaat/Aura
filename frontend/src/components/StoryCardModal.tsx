import { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Beacon } from '../types';
import { AuraButton } from './AuraButton';
import { resolvePhotoUrl } from '../lib/media';
import { useBodyScrollLock } from '../hooks/useBodyScrollLock';

interface StoryCardModalProps {
  beacon: Beacon;
  onClose: () => void;
}

export function StoryCardModal({ beacon, onClose }: StoryCardModalProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  useBodyScrollLock(true);

  const exportStory = async () => {
    setExporting(true);
    setError(null);

    try {
      const canvas = await createStoryCanvas({
        imageUrl: photoUrl,
        message: beacon.message,
        locationName: beacon.location.name,
        timeLabel: `${time} · Your city`,
      });
      const link = document.createElement('a');
      link.download = `aura-beacon-${beacon.id}.png`;
      link.href = canvas.toDataURL('image/png');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch {
      setError('Could not download the story card. Please try again.');
    } finally {
      setExporting(false);
    }
  };

  const time = new Date(beacon.scheduled_at).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  });

  const photoUrl = resolvePhotoUrl(beacon.location.photo_url, beacon.location.category);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[2000] flex items-end justify-center bg-black/70 p-0 md:items-center md:p-4"
        onClick={onClose}
        onWheel={(e) => e.stopPropagation()}
        onTouchMove={(e) => e.stopPropagation()}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="flex max-h-[92dvh] w-full max-w-md flex-col overflow-hidden rounded-t-[28px] bg-surface shadow-[0_-4px_40px_rgba(0,0,0,0.18)] md:rounded-[var(--radius-modal)]"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="shrink-0 px-6 pb-4 pt-6">
            <p className="font-serif text-2xl text-center">Share to Stories</p>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-6">
            <div
              ref={cardRef}
              className="relative mx-auto aspect-[9/16] max-h-[58dvh] min-h-[360px] overflow-hidden rounded-2xl bg-background"
            >
              <img
                src={photoUrl}
                alt=""
                className="absolute inset-0 h-full w-full object-cover opacity-80"
                crossOrigin="anonymous"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-text-main/80 via-transparent to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                <p className="font-serif text-2xl leading-tight mb-2">{beacon.message}</p>
                <p className="text-sm opacity-90">{beacon.location.name}</p>
                <p className="text-sm opacity-75 mt-1">{time} · Your city</p>
                <p className="mt-4 text-xs tracking-widest uppercase opacity-60">Aura</p>
              </div>
            </div>

            {error && <p className="mt-3 text-center text-sm text-rose-500">{error}</p>}
          </div>

          <div className="shrink-0 flex gap-3 border-t border-border bg-surface/96 px-6 py-4 pb-[calc(1rem+env(safe-area-inset-bottom))] shadow-[0_-8px_22px_rgba(0,0,0,0.04)]">
            <AuraButton variant="secondary" className="flex-1" onClick={onClose}>
              Cancel
            </AuraButton>
            <AuraButton className="flex-1" onClick={exportStory} disabled={exporting}>
              {exporting ? 'Preparing...' : 'Download'}
            </AuraButton>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

interface StoryCanvasInput {
  imageUrl: string;
  message: string;
  locationName: string;
  timeLabel: string;
}

async function createStoryCanvas({
  imageUrl,
  message,
  locationName,
  timeLabel,
}: StoryCanvasInput): Promise<HTMLCanvasElement> {
  const width = 1080;
  const height = 1920;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Canvas is unavailable.');
  }

  const image = await loadImageSafely(imageUrl);

  if (image) {
    drawCoverImage(ctx, image, width, height);
  } else {
    drawFallbackBackground(ctx, width, height);
  }

  const overlay = ctx.createLinearGradient(0, 0, 0, height);
  overlay.addColorStop(0, 'rgba(26, 26, 24, 0.04)');
  overlay.addColorStop(0.48, 'rgba(26, 26, 24, 0.08)');
  overlay.addColorStop(1, 'rgba(26, 26, 24, 0.78)');
  ctx.fillStyle = overlay;
  ctx.fillRect(0, 0, width, height);

  ctx.fillStyle = '#ffffff';
  ctx.textBaseline = 'top';
  drawWrappedText(ctx, message, 96, 1260, width - 192, 64, 3, '700 74px Georgia, serif');

  ctx.font = '500 42px system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
  ctx.fillText(locationName, 96, 1460);

  ctx.globalAlpha = 0.82;
  ctx.font = '400 38px system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
  ctx.fillText(timeLabel, 96, 1532);

  ctx.globalAlpha = 0.66;
  ctx.font = '500 34px system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
  ctx.letterSpacing = '8px';
  ctx.fillText('AURA', 96, 1658);
  ctx.globalAlpha = 1;

  return canvas;
}

function loadImageSafely(src: string): Promise<HTMLImageElement | null> {
  return new Promise((resolve) => {
    const image = new Image();
    image.crossOrigin = 'anonymous';
    image.referrerPolicy = 'no-referrer';
    image.onload = () => resolve(image);
    image.onerror = () => resolve(null);
    image.src = src;
  });
}

function drawCoverImage(
  ctx: CanvasRenderingContext2D,
  image: HTMLImageElement,
  width: number,
  height: number
) {
  const scale = Math.max(width / image.naturalWidth, height / image.naturalHeight);
  const drawWidth = image.naturalWidth * scale;
  const drawHeight = image.naturalHeight * scale;
  const x = (width - drawWidth) / 2;
  const y = (height - drawHeight) / 2;

  try {
    ctx.drawImage(image, x, y, drawWidth, drawHeight);
  } catch {
    drawFallbackBackground(ctx, width, height);
  }
}

function drawFallbackBackground(ctx: CanvasRenderingContext2D, width: number, height: number) {
  const gradient = ctx.createLinearGradient(0, 0, width, height);
  gradient.addColorStop(0, '#f7eee6');
  gradient.addColorStop(0.48, '#dfe8d9');
  gradient.addColorStop(1, '#c4978a');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);

  ctx.fillStyle = 'rgba(255, 255, 255, 0.18)';
  ctx.beginPath();
  ctx.arc(width * 0.76, height * 0.22, 260, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = 'rgba(255, 255, 255, 0.16)';
  ctx.beginPath();
  ctx.arc(width * 0.18, height * 0.62, 220, 0, Math.PI * 2);
  ctx.fill();
}

function drawWrappedText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number,
  maxLines: number,
  font: string
) {
  ctx.font = font;
  const words = text.split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let line = '';

  for (const word of words) {
    const testLine = line ? `${line} ${word}` : word;
    if (ctx.measureText(testLine).width > maxWidth && line) {
      lines.push(line);
      line = word;
      if (lines.length === maxLines) break;
    } else {
      line = testLine;
    }
  }

  if (line && lines.length < maxLines) {
    lines.push(line);
  }

  lines.slice(0, maxLines).forEach((currentLine, index) => {
    const textLine =
      index === maxLines - 1 && lines.length === maxLines && words.join(' ').length > lines.join(' ').length
        ? `${currentLine.replace(/[.,!?;:]?$/, '')}...`
        : currentLine;
    ctx.fillText(textLine, x, y + index * lineHeight);
  });
}
