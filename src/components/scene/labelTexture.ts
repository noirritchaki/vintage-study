import { CanvasTexture, SRGBColorSpace } from 'three';

const W = 1024;
const H = 160;

/**
 * A strip of off-white label paper with the tape's title hand-written on it,
 * drawn to a canvas. Pasted over the top of the cassette's printed label.
 */
export function makeLabelTexture(title: string, side: string, fontFamily: string) {
  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;
  texture.anisotropy = 8;

  const draw = () => {
    const ctx = canvas.getContext('2d')!;
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = '#efece2';
    ctx.fillRect(0, 0, W, H);

    // faint ruled line, like a real J-card label
    ctx.strokeStyle = 'rgba(80, 90, 160, 0.25)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(24, H - 26);
    ctx.lineTo(W - 24, H - 26);
    ctx.stroke();

    ctx.fillStyle = '#1d1d2b';
    ctx.textBaseline = 'alphabetic';
    ctx.textAlign = 'left';
    ctx.font = `700 124px ${fontFamily}`;
    ctx.fillText(title, 36, H - 36);

    ctx.font = `700 100px ${fontFamily}`;
    ctx.textAlign = 'right';
    ctx.fillStyle = '#ce0e9b';
    ctx.fillText(side, W - 40, H - 36);
    texture.needsUpdate = true;
  };

  draw();
  // Redraw once the hand-writing font is ready.
  document.fonts?.load(`700 124px ${fontFamily}`).then(draw).catch(() => {});

  return texture;
}
