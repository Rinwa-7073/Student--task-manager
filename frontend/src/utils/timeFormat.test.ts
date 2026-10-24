import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  formatMinutes,
  formatSeconds,
  calculateFocusProgress,
} from './timeFormat.ts';

describe('timeFormat utility', () => {
  describe('formatMinutes', () => {
    it('handles 0, negative, null, and undefined values', () => {
      assert.equal(formatMinutes(0), '0m');
      assert.equal(formatMinutes(-15), '0m');
      assert.equal(formatMinutes(null), '0m');
      assert.equal(formatMinutes(undefined), '0m');
      assert.equal(formatMinutes(NaN), '0m');
    });

    it('formats durations under one hour correctly', () => {
      assert.equal(formatMinutes(1), '1m');
      assert.equal(formatMinutes(25), '25m');
      assert.equal(formatMinutes(59), '59m');
    });

    it('formats exact hours without remaining minutes', () => {
      assert.equal(formatMinutes(60), '1h');
      assert.equal(formatMinutes(120), '2h');
      assert.equal(formatMinutes(300), '5h');
    });

    it('formats hours with remaining minutes', () => {
      assert.equal(formatMinutes(75), '1h 15m');
      assert.equal(formatMinutes(90), '1h 30m');
      assert.equal(formatMinutes(145), '2h 25m');
    });
  });

  describe('formatSeconds', () => {
    it('handles 0, negative, and invalid values', () => {
      assert.equal(formatSeconds(0), '00:00');
      assert.equal(formatSeconds(-10), '00:00');
      assert.equal(formatSeconds(NaN), '00:00');
    });

    it('formats standard Pomodoro durations', () => {
      assert.equal(formatSeconds(1500), '25:00'); // 25 mins
      assert.equal(formatSeconds(300), '05:00'); // 5 mins
      assert.equal(formatSeconds(3000), '50:00'); // 50 mins
    });

    it('formats arbitrary minutes and seconds with padding', () => {
      assert.equal(formatSeconds(9), '00:09');
      assert.equal(formatSeconds(65), '01:05');
      assert.equal(formatSeconds(599), '09:59');
    });
  });

  describe('calculateFocusProgress', () => {
    it('returns zero percentage when estimated time is missing or zero', () => {
      const resNull = calculateFocusProgress(30, null);
      assert.equal(resNull.percentage, 0);
      assert.equal(resNull.isOver, false);
      assert.equal(resNull.formattedEstimated, null);

      const resZero = calculateFocusProgress(30, 0);
      assert.equal(resZero.percentage, 0);
      assert.equal(resZero.isOver, false);
    });

    it('calculates accurate progress percentage', () => {
      const resHalf = calculateFocusProgress(30, 60);
      assert.equal(resHalf.percentage, 50);
      assert.equal(resHalf.isOver, false);
      assert.equal(resHalf.formattedLogged, '30m');
      assert.equal(resHalf.formattedEstimated, '1h');

      const resQuarter = calculateFocusProgress(15, 60);
      assert.equal(resQuarter.percentage, 25);
    });

    it('detects when focus time exceeds the estimated target', () => {
      const resOver = calculateFocusProgress(90, 60);
      assert.equal(resOver.percentage, 100); // capped at 100 for UI bar
      assert.equal(resOver.isOver, true);
      assert.equal(resOver.formattedLogged, '1h 30m');
      assert.equal(resOver.formattedEstimated, '1h');
    });
  });
});
