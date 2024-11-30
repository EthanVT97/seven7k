import { formatDate } from '../format';

describe('formatDate', () => {
    it('formats date correctly', () => {
        const date = new Date('2023-01-01T00:00:00.000Z');
        expect(formatDate(date)).toBe('January 1, 2023');
    });

    it('handles different months', () => {
        const date = new Date('2023-12-25T00:00:00.000Z');
        expect(formatDate(date)).toBe('December 25, 2023');
    });
}); 