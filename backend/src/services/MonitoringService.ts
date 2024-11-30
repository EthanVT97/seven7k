import prometheus from 'prom-client';
import { MetricsService } from '../services/MetricsService';

export class MonitoringService {
    private static instance: MonitoringService;
    private metrics: MetricsService;

    private constructor() {
        this.metrics = new MetricsService();
        this.setupMetrics();
    }

    static getInstance(): MonitoringService {
        if (!MonitoringService.instance) {
            MonitoringService.instance = new MonitoringService();
        }
        return MonitoringService.instance;
    }

    private setupMetrics() {
        // Message metrics
        this.metrics.createCounter({
            name: 'messages_total',
            help: 'Total number of messages processed'
        });

        // Platform metrics
        this.metrics.createGauge({
            name: 'platform_status',
            help: 'Platform connection status',
            labelNames: ['platform']
        });

        // Performance metrics
        this.metrics.createHistogram({
            name: 'message_processing_time',
            help: 'Time taken to process messages',
            buckets: [0.1, 0.5, 1, 2, 5]
        });
    }

    trackMessage(platform: string, status: string) {
        this.metrics.incrementCounter('messages_total', { platform, status });
    }

    trackPlatformStatus(platform: string, isConnected: boolean) {
        this.metrics.setGauge('platform_status', isConnected ? 1 : 0, { platform });
    }

    trackProcessingTime(duration: number) {
        this.metrics.observeHistogram('message_processing_time', duration);
    }
} 