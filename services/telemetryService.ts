
interface Span {
  id: string;
  name: string;
  startTime: number;
  tags: Record<string, string>;
}

class TelemetryService {
  private activeSpans: Map<string, Span> = new Map();

  // Simulate generating a trace ID (OpenTelemetry style)
  private generateId(): string {
    return Math.random().toString(16).substr(2, 16);
  }

  startSpan(name: string, tags: Record<string, string> = {}): Span {
    const span: Span = {
      id: this.generateId(),
      name,
      startTime: performance.now(),
      tags,
    };
    
    // In a real implementation, this would handle parent contexts
    this.activeSpans.set(span.id, span);
    
    // Simulate OTel console exporter
    console.debug(`[Telemetry] Span Started: ${name}`, tags);
    
    return span;
  }

  endSpan(span: Span, status: 'ok' | 'error' = 'ok', error?: any) {
    const endTime = performance.now();
    const duration = endTime - span.startTime;
    
    if (this.activeSpans.has(span.id)) {
      this.activeSpans.delete(span.id);
    }

    // Enhance tags with status
    const finalTags: Record<string, string> = { ...span.tags, status, duration_ms: duration.toFixed(2) };
    if (error) {
        finalTags.error_message = error.message || String(error);
    }

    console.debug(`[Telemetry] Span Ended: ${span.name} (${duration.toFixed(2)}ms)`, finalTags);
    
    // Here we would export to Jaeger/Zipkin
  }

  recordMetric(name: string, value: number, tags: Record<string, string> = {}) {
    console.debug(`[Metric] Gauge/Histogram: ${name} = ${value}`, tags);
    // Here we would export to Prometheus/CloudWatch
  }

  incrementCounter(name: string, tags: Record<string, string> = {}) {
    console.debug(`[Metric] Counter Inc: ${name}`, tags);
  }
}

export const telemetryService = new TelemetryService();
