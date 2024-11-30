import { Counter, Gauge, Histogram } from 'prom-client';

export interface MetricOptions {
    name: string;
    help: string;
    labelNames?: string[];
}

export class MetricsService {
    private counters: Map<string, Counter> = new Map();
    private gauges: Map<string, Gauge> = new Map();
    private histograms: Map<string, Histogram> = new Map();

    createCounter(options: MetricOptions): Counter {
        const counter = new Counter({
            name: options.name,
            help: options.help,
            labelNames: options.labelNames
        });
        this.counters.set(options.name, counter);
        return counter;
    }

    createGauge(options: MetricOptions): Gauge {
        const gauge = new Gauge({
            name: options.name,
            help: options.help,
            labelNames: options.labelNames
        });
        this.gauges.set(options.name, gauge);
        return gauge;
    }

    createHistogram(options: MetricOptions & { buckets?: number[] }): Histogram {
        const histogram = new Histogram({
            name: options.name,
            help: options.help,
            labelNames: options.labelNames,
            buckets: options.buckets
        });
        this.histograms.set(options.name, histogram);
        return histogram;
    }

    incrementCounter(name: string, labels?: Partial<Record<string, string | number>>) {
        const counter = this.counters.get(name);
        if (counter) {
            if (labels) {
                counter.inc(labels);
            } else {
                counter.inc();
            }
        }
    }

    setGauge(name: string, value: number, labels?: Record<string, string | number>) {
        const gauge = this.gauges.get(name);
        if (gauge) {
            gauge.set(labels || {}, value);
        }
    }

    observeHistogram(name: string, value: number, labels?: Record<string, string | number>) {
        const histogram = this.histograms.get(name);
        if (histogram) {
            histogram.observe(labels || {}, value);
        }
    }
} 