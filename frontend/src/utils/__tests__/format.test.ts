import { formatDate } from '../format';

describe('formatDate', () => {
    beforeAll(() => {
        // Mock Date.now() to return a fixed timestamp
        jest.useFakeTimers();
        jest.setSystemTime(new Date('2024-01-15T12:00:00Z'));
    });

    afterAll(() => {
        jest.useRealTimers();
    });

    it('formats today\'s date correctly', () => {
        const today = new Date('2024-01-15T10:30:00Z');
        expect(formatDate(today)).toMatch(/\d{1,2}:\d{2}/);
    });

    it('formats yesterday\'s date correctly', () => {
        const yesterday = new Date('2024-01-14T15:45:00Z');
        expect(formatDate(yesterday)).toMatch(/Yesterday \d{1,2}:\d{2}/);
    });

    it('formats older dates correctly', () => {
        const oldDate = new Date('2024-01-01T09:15:00Z');
        expect(formatDate(oldDate)).toMatch(/Jan 1, 2024/);
    });
}); 