
import { BackendAPI } from './backend/api';

interface Span {
  id: string;
  name: string;
  startTime: number;
  tags: Record<string, string>;
}

class TelemetryService {
  private activeSpans: Map<string, Span> = new Map();

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
    this.activeSpans.set(span.id, span);
    return span;
  }

  endSpan(span: Span, status: 'ok' | 'error' = 'ok', error?: any) {
    const endTime = performance.now();
    const duration = endTime - span.startTime;
    
    if (this.activeSpans.has(span.id)) {
      this.activeSpans.delete(span.id);
    }

    const finalTags: Record<string, string> = { ...span.tags, status };
    if (error) {
        finalTags.error_message = error.message || String(error);
    }

    // Send to Backend API
    BackendAPI.ingestTrace({
        id: span.id,
        name: span.name,
        startTime: span.startTime,
        duration: duration,
        tags: finalTags
    }).catch(err => console.error("[Telemetry] Failed to export span", err));
  }

  recordMetric(name: string, value: number, tags: Record<string, string> = {}) {
    BackendAPI.ingestMetric({
        name,
        value,
        tags
    }).catch(err => console.error("[Telemetry] Failed to export metric", err));
  }

  incrementCounter(name: string, tags: Record<string, string> = {}) {
    // In a real system, counters are aggregated locally then flushed.
    // For this mock, we treat it as a metric with value 1
    this.recordMetric(name, 1, tags);
  }

  recordDBQuery(query: string, durationMs: number) {
      const tags = { query_signature: query.substring(0, 50) + '...' };
      
      if (durationMs > 200) {
          console.warn(`[Telemetry] SLOW QUERY DETECTED: ${durationMs.toFixed(2)}ms`, query);
          this.recordMetric('db_query_duration_slow', durationMs, tags);
          this.incrementCounter('db_slow_query_count', tags);
      } else {
          this.recordMetric('db_query_duration', durationMs, tags);
      }
  }
}

export const telemetryService = new TelemetryService();
