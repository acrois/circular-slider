import { polarToCartesian, cartesianToPolar } from './utils';

describe('utils', () => {
  describe('polarToCartesian', () => {
    it('should convert polar coordinates to cartesian coordinates', () => {
      const cx = 100;
      const cy = 100;
      const radius = 50;
      const angleInDegrees = 0;

      const result = polarToCartesian(cx, cy, radius, angleInDegrees);
      expect(result).toEqual({ x: 100, y: 50 });

      const result90 = polarToCartesian(cx, cy, radius, 90);
      expect(result90).toEqual({ x: 150, y: 100 });

      const result180 = polarToCartesian(cx, cy, radius, 180);
      expect(result180).toEqual({ x: 100, y: 150 });

      const result270 = polarToCartesian(cx, cy, radius, 270);
      expect(result270).toEqual({ x: 50, y: 100 });
    });
  });

  describe('cartesianToPolar', () => {
    it('should convert cartesian coordinates to polar coordinates', () => {
      const cx = 100;
      const cy = 100;

      const result = cartesianToPolar(cx, cy, 100, 50);
      expect(result).toBe(0);

      const result90 = cartesianToPolar(cx, cy, 150, 100);
      expect(result90).toBe(90);

      const result180 = cartesianToPolar(cx, cy, 100, 150);
      expect(result180).toBe(180);

      const result270 = cartesianToPolar(cx, cy, 50, 100);
      expect(result270).toBe(270);
    });
  });
});
