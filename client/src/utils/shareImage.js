// Draws a square "my progress" card on a canvas and returns it as a PNG blob.
// Plain canvas drawing, no libraries, so it works offline.
const SIZE = 1080;

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

// stats: { name, rate30, checkIns30, topStreak, perfect30, weekChange, habits: [{ name, color, current }] }
export function drawShareCard(stats) {
  const canvas = document.createElement('canvas');
  canvas.width = SIZE;
  canvas.height = SIZE;
  const ctx = canvas.getContext('2d');
  const font = (weight, size) =>
    `${weight} ${size}px ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif`;

  // background: warm gradient
  const bg = ctx.createLinearGradient(0, 0, SIZE, SIZE);
  bg.addColorStop(0, '#fff7ed');
  bg.addColorStop(1, '#ffedd5');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, SIZE, SIZE);

  // wordmark
  ctx.font = font(800, 64);
  ctx.fillStyle = '#1c1917';
  ctx.fillText('Streak', 80, 140);
  const w = ctx.measureText('Streak').width;
  ctx.fillStyle = '#f97316';
  ctx.fillText('ly', 80 + w, 140);

  ctx.font = font(500, 34);
  ctx.fillStyle = '#78716c';
  ctx.fillText(`${stats.name ? `${stats.name}'s` : 'My'} last 30 days`, 80, 200);

  // big number
  ctx.font = font(800, 220);
  ctx.fillStyle = '#ea580c';
  ctx.fillText(`${Math.round(stats.rate30 * 100)}%`, 72, 430);
  ctx.font = font(500, 36);
  ctx.fillStyle = '#57534e';
  ctx.fillText(`of habits done · ${stats.checkIns30} check-ins`, 84, 490);

  // three tiles
  const tiles = [
    ['Top streak', `${stats.topStreak} ${stats.topStreak === 1 ? 'day' : 'days'}`],
    ['Perfect days', String(stats.perfect30)],
    [
      'vs last week',
      stats.weekChange === null ? '–' : `${stats.weekChange > 0 ? '+' : ''}${stats.weekChange} pts`,
    ],
  ];
  const tileW = (SIZE - 160 - 40) / 3;
  tiles.forEach(([label, value], i) => {
    const x = 80 + i * (tileW + 20);
    ctx.fillStyle = 'rgba(255,255,255,0.8)';
    roundRect(ctx, x, 560, tileW, 170, 28);
    ctx.fill();
    ctx.fillStyle = '#78716c';
    ctx.font = font(500, 28);
    ctx.fillText(label, x + 30, 615);
    ctx.fillStyle = '#1c1917';
    ctx.font = font(800, 54);
    ctx.fillText(value, x + 30, 690);
  });

  // up to four habits with their streaks
  stats.habits.slice(0, 4).forEach((h, i) => {
    const y = 800 + i * 56;
    ctx.fillStyle = h.color;
    ctx.beginPath();
    ctx.arc(96, y - 12, 12, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#292524';
    ctx.font = font(600, 34);
    const name = h.name.length > 34 ? `${h.name.slice(0, 33)}…` : h.name;
    ctx.fillText(name, 126, y);
    ctx.fillStyle = '#78716c';
    ctx.font = font(500, 30);
    const streak = `${h.current} day streak`;
    ctx.fillText(streak, SIZE - 80 - ctx.measureText(streak).width, y);
  });

  return new Promise((resolve) => canvas.toBlob(resolve, 'image/png'));
}

// Uses the phone's share sheet when it can take files, otherwise downloads.
export async function shareOrDownload(blob, filename) {
  const file = new File([blob], filename, { type: 'image/png' });
  if (navigator.canShare?.({ files: [file] })) {
    try {
      await navigator.share({ files: [file], title: 'My Streakly progress' });
      return 'shared';
    } catch (err) {
      if (err.name === 'AbortError') return 'cancelled';
      // fall through to a download
    }
  }
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  return 'downloaded';
}
