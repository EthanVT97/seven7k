// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';
import { configure } from '@testing-library/react';
import { TextEncoder, TextDecoder } from 'util';
import type { TextDecoder as NodeTextDecoder, TextEncoder as NodeTextEncoder } from 'util';

// Configure testing library
configure({
    testIdAttribute: 'data-testid',
});

// Mock IntersectionObserver
class MockIntersectionObserver implements IntersectionObserver {
    readonly root: Element | null = null;
    readonly rootMargin: string = '';
    readonly thresholds: ReadonlyArray<number> = [];
    observe = jest.fn();
    disconnect = jest.fn();
    unobserve = jest.fn();
    takeRecords = jest.fn();
}

Object.defineProperty(window, 'IntersectionObserver', {
    writable: true,
    configurable: true,
    value: MockIntersectionObserver
});

// Mock ResizeObserver
class MockResizeObserver implements ResizeObserver {
    observe = jest.fn();
    disconnect = jest.fn();
    unobserve = jest.fn();
}

Object.defineProperty(window, 'ResizeObserver', {
    writable: true,
    configurable: true,
    value: MockResizeObserver
});

// Mock window.matchMedia
interface MediaQueryList {
    matches: boolean;
    media: string;
    onchange: ((this: MediaQueryList, ev: MediaQueryListEvent) => any) | null;
    addListener: (callback: (event: MediaQueryListEvent) => void) => void;
    removeListener: (callback: (event: MediaQueryListEvent) => void) => void;
    addEventListener: (type: string, callback: (event: MediaQueryListEvent) => void) => void;
    removeEventListener: (type: string, callback: (event: MediaQueryListEvent) => void) => void;
    dispatchEvent: (event: Event) => boolean;
}

Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: jest.fn().mockImplementation((query: string): MediaQueryList => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: jest.fn(),
        removeListener: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
    }))
});

// Mock TextEncoder/TextDecoder
declare global {
    var TextEncoder: typeof TextEncoder;
    var TextDecoder: typeof TextDecoder;
}

if (typeof global.TextEncoder === 'undefined') {
    global.TextEncoder = TextEncoder;
}

if (typeof global.TextDecoder === 'undefined') {
    global.TextDecoder = TextDecoder as unknown as typeof global.TextDecoder;
}

// Mock fetch with type safety
type FetchMock = jest.Mock & { mockResponse: (response: any) => void };
const mockFetch = jest.fn() as FetchMock;
mockFetch.mockResponse = (response: any) => {
    mockFetch.mockImplementationOnce(() => Promise.resolve({
        ok: true,
        json: () => Promise.resolve(response),
        text: () => Promise.resolve(JSON.stringify(response)),
        blob: () => Promise.resolve(new Blob([JSON.stringify(response)])),
        headers: new Headers(),
        status: 200,
        statusText: 'OK',
    }));
};
global.fetch = mockFetch;

// Mock Storage with proper interface
class MockStorage implements Storage {
    private store: { [key: string]: string } = {};
    length = 0;

    clear(): void {
        this.store = {};
        this.length = 0;
    }

    getItem(key: string): string | null {
        return this.store[key] || null;
    }

    setItem(key: string, value: string): void {
        this.store[key] = String(value);
        this.length = Object.keys(this.store).length;
    }

    removeItem(key: string): void {
        delete this.store[key];
        this.length = Object.keys(this.store).length;
    }

    key(index: number): string | null {
        const keys = Object.keys(this.store);
        return keys[index] || null;
    }
}

Object.defineProperty(window, 'localStorage', {
    value: new MockStorage()
});

Object.defineProperty(window, 'sessionStorage', {
    value: new MockStorage()
});

// Suppress specific console messages
const originalConsole = {
    error: console.error,
    warn: console.warn,
    log: console.log,
    info: console.info,
    debug: console.debug
} as const;

const suppressedWarnings = [
    'Warning: ReactDOM.render is no longer supported',
    'Warning: React.createFactory()',
    'Warning: Using UNSAFE_',
    'Warning: componentWillMount',
    'Warning: componentWillReceiveProps',
    'Warning: componentWillUpdate'
];

beforeAll(() => {
    console.error = (...args: any[]) => {
        if (typeof args[0] === 'string' &&
            suppressedWarnings.some(warning => args[0].includes(warning))) {
            return;
        }
        originalConsole.error.call(console, ...args);
    };

    console.warn = (...args: any[]) => {
        if (typeof args[0] === 'string' && args[0].includes('Warning:')) {
            return;
        }
        originalConsole.warn.call(console, ...args);
    };
});

afterAll(() => {
    (Object.keys(originalConsole) as Array<keyof typeof originalConsole>).forEach(key => {
        (console[key] as any) = originalConsole[key];
    });
});