import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { formatDate, getRelativeDate } from './dateUtils';

describe('dateUtils', () => {

    beforeEach(() => {
        // Mock system time to a fixed date: 2024-01-15 12:00:00 (Monday)
        vi.useFakeTimers();
        vi.setSystemTime(new Date('2024-01-15T12:00:00Z'));
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    describe('formatDate', () => {
        it('returns "Today" for current date', () => {
            const today = '2024-01-15';
            expect(formatDate(today, 'en-US')).toBe('Today');
        });

        it('returns "Yesterday" for previous date', () => {
            const yesterday = '2024-01-14';
            expect(formatDate(yesterday, 'en-US')).toBe('Yesterday');
        });

        it('returns formatted date for other days', () => {
            const otherDay = '2024-01-10';
            const result = formatDate(otherDay, 'en-US');
            expect(result).toMatch(/Jan 10/);
        });

        it('returns localized date for UA', () => {
            const today = '2024-01-15';
            expect(formatDate(today, 'ua')).toBe('Сьогодні');

            const yesterday = '2024-01-14';
            expect(formatDate(yesterday, 'ua')).toBe('Вчора');
        });
    });

    describe('getRelativeDate', () => {
        it('returns next day correctly', () => {
            const today = '2024-01-15';
            const expected = '2024-01-16';
            expect(getRelativeDate(today, 1)).toBe(expected);
        });

        it('returns previous day correctly', () => {
            const today = '2024-01-15';
            const expected = '2024-01-14';
            expect(getRelativeDate(today, -1)).toBe(expected);
        });

        it('handles month rollover', () => {
            const endJan = '2024-01-31';
            const expected = '2024-02-01';
            expect(getRelativeDate(endJan, 1)).toBe(expected);
        });
    });
});
