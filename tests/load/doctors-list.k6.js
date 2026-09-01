/**
 * k6 Load Test — Doctorooms Patient Module
 *
 * SECURITY (P4.8): Baseline performance testing.
 * Run: `k6 run tests/load/doctors-list.k6.js`
 *
 * Install k6: https://k6.io/docs/getting-started/installation/
 *
 * Expected baseline (single-instance dev server, SQLite):
 *   - 10 concurrent users: all requests < 500ms
 *   - 50 concurrent users: p95 < 2s, 0% errors
 *   - 100 concurrent users: p95 < 5s, <5% errors (SQLite write lock contention)
 *   - 500 concurrent users: FAILS — SQLite can't handle this. Phase 5 (Postgres migration) needed.
 */

import http from 'k6/http'
import { check, sleep } from 'k6'
import { Rate, Trend } from 'k6/metrics'

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000'

// Custom metrics
const errorRate = new Rate('errors')
const responseTime = new Trend('response_time_ms', true)

// Test stages: ramp up → hold → ramp down
export const options = {
  stages: [
    { duration: '30s', target: 10 },   // Ramp to 10 users
    { duration: '1m', target: 10 },     // Hold at 10 users
    { duration: '30s', target: 50 },   // Ramp to 50 users
    { duration: '1m', target: 50 },     // Hold at 50 users
    { duration: '30s', target: 100 },  // Ramp to 100 users
    { duration: '1m', target: 100 },   // Hold at 100 users
    { duration: '30s', target: 0 },    // Ramp down to 0
  ],
  thresholds: {
    // Fail the test if these thresholds are breached
    http_req_failed: ['rate<0.05'],           // <5% errors
    http_req_duration: ['p(95)<5000'],         // p95 < 5s
    errors: ['rate<0.05'],                     // Custom error rate < 5%
  },
}

export default function loadTest () {
  // Test 1: Public doctor list (no auth required)
  const doctorsRes = http.get(`${BASE_URL}/api/doctors?limit=10`, {
    headers: { 'Accept': 'application/json' },
  })

  check(doctorsRes, {
    'doctors status 200': (r) => r.status === 200,
    'doctors has data': (r) => {
      try {
        const body = JSON.parse(r.body)
        return body.doctors?.length > 0 || body.data?.length > 0
      } catch {
        return false
      }
    },
  })

  errorRate.add(doctorsRes.status !== 200)
  responseTime.add(doctorsRes.timings.duration)

  // Test 2: Public doctor detail (no auth — should NOT return email)
  // Use a known doctor ID from the seed data
  const doctorDetailRes = http.get(`${BASE_URL}/api/doctors/dev-doctor-suresh`, {
    headers: { 'Accept': 'application/json' },
  })

  check(doctorDetailRes, {
    'doctor detail status 200': (r) => r.status === 200,
    'doctor detail no email leak': (r) => {
      try {
        const body = JSON.parse(r.body)
        return !body.doctor?.email
      } catch {
        return false
      }
    },
  })

  errorRate.add(doctorDetailRes.status !== 200)
  responseTime.add(doctorDetailRes.timings.duration)

  // Test 3: Security headers present
  const headersRes = http.get(BASE_URL)
  check(headersRes, {
    'has X-Content-Type-Options': (r) => r.headers['X-Content-Type-Options'] === 'nosniff',
    'has X-Frame-Options': (r) => r.headers['X-Frame-Options'] === 'DENY',
    'has CSP': (r) => r.headers['Content-Security-Policy']?.includes("default-src 'self'"),
  })

  sleep(1) // 1 request per second per virtual user
}

export function handleSummary(data) {
  return {
    stdout: `
═══════════════════════════════════════════════
  k6 Load Test Summary — Doctorooms
═══════════════════════════════════════════════
  Total requests:    ${data.metrics.http_reqs.values.count}
  Duration:          ${data.metrics.iteration_duration.values.avg.toFixed(0)}ms avg
  Error rate:        ${(data.metrics.http_req_failed.values.rate * 100).toFixed(2)}%
  p50 response time: ${data.metrics.http_req_duration.values.p(50).toFixed(0)}ms
  p95 response time: ${data.metrics.http_req_duration.values.p(95).toFixed(0)}ms
  p99 response time: ${data.metrics.http_req_duration.values.p(99).toFixed(0)}ms
═══════════════════════════════════════════════
`,
  }
}
