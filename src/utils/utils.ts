export function polarToCartesian(cx: number, cy: number, radius: number, angleInDegrees: number) {
  const angleInRadians = (angleInDegrees - 90) * Math.PI / 180.0;
  return {
    x: cx + (radius * Math.cos(angleInRadians)),
    y: cy + (radius * Math.sin(angleInRadians))
  };
}

export function cartesianToPolar(cx: number, cy: number, x: number, y: number) {
  const dx = x - cx;
  const dy = y - cy;
  let angle = Math.atan2(dy, dx) * 180 / Math.PI + 90;
  return (angle < 0) ? 360 + angle : angle;
}
