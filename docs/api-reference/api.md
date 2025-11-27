# Developer Guide: API Reference

## Overview

Complete API reference for Operation Obsidian backend services.

---

## API Core (NestJS)

**Base URL**: `http://localhost:3001`

### Authentication

#### POST /auth/login
Authenticate user and receive JWT token.

**Request**:
```json
{
  "username": "operator",
  "password": "password123"
}
```

**Response**:
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid",
    "username": "operator",
    "role": "operator"
  }
}
```

**Status Codes**:
- `200`: Success
- `401`: Invalid credentials

---

### Inventory

#### GET /inventory
Get all inventory items.

**Headers**:
```
Authorization: Bearer <token>
```

**Response**:
```json
[
  {
    "id": "uuid",
    "part_number": "PN-001",
    "nomenclature": "Widget A",
    "quantity": 100,
    "status": "active",
    "location": "Warehouse A"
  }
]
```

#### POST /inventory/:id/adjust
Adjust inventory quantity.

**Headers**:
```
Authorization: Bearer <token>
```

**Request**:
```json
{
  "delta": -5
}
```

**Response**:
```json
{
  "id": "uuid",
  "quantity": 95,
  "updated_at": "2025-11-27T00:00:00Z"
}
```

**Status Codes**:
- `200`: Success
- `401`: Unauthorized
- `403`: Forbidden (requires approval)
- `404`: Item not found

---

### Ledger

#### GET /ledger
Get ledger events.

**Headers**:
```
Authorization: Bearer <token>
```

**Query Parameters**:
- `limit`: Number of events (default: 100)
- `offset`: Pagination offset (default: 0)

**Response**:
```json
{
  "events": [
    {
      "id": "uuid",
      "prev_hash": "sha256...",
      "actor_id": "uuid",
      "action_type": "INVENTORY_ADJUST",
      "payload": {},
      "signature": "ed25519...",
      "timestamp": "2025-11-27T00:00:00Z"
    }
  ],
  "total": 1000
}
```

---

### Health Check

#### GET /health
Check API health status.

**Response**:
```json
{
  "status": "healthy",
  "timestamp": "2025-11-27T00:00:00Z",
  "service": "api-core",
  "version": "1.0.0"
}
```

---

## AI Service (FastAPI)

**Base URL**: `http://localhost:8000`

### Predictions

#### GET /predict/{machine_id}
Get prediction for specific machine.

**Response**:
```json
{
  "machine_id": "CNC-01",
  "timestamp": "2025-11-27T00:00:00Z",
  "is_anomaly": false,
  "anomaly_score": -0.15,
  "risk_level": "LOW",
  "current_metrics": {
    "temperature": 195.5,
    "vibration": 1.2,
    "spindle_speed": 3500,
    "power_consumption": 18.5
  },
  "recommendation": "NOMINAL - Continue normal operation"
}
```

#### GET /analyze
Analyze all machines.

**Response**:
```json
[
  {
    "machine_id": "CNC-01",
    "timestamp": "2025-11-27T00:00:00Z",
    "is_anomaly": false,
    "anomaly_score": -0.15,
    "risk_level": "LOW",
    "current_metrics": {},
    "recommendation": "NOMINAL - Continue normal operation"
  }
]
```

#### POST /train/{machine_id}
Train model for specific machine.

**Response**:
```json
{
  "message": "Training initiated for CNC-01"
}
```

---

### Health Check

#### GET /health
Check AI service health.

**Response**:
```json
{
  "status": "healthy"
}
```

---

## Telemetry Service

**WebSocket URL**: `ws://localhost:8080`

### WebSocket Events

#### Connection
```javascript
const ws = new WebSocket('ws://localhost:8080');

ws.onopen = () => {
  console.log('Connected to telemetry stream');
};
```

#### Message Format
```json
{
  "type": "telemetry",
  "machineId": "CNC-01",
  "timestamp": "2025-11-27T00:00:00Z",
  "data": {
    "metrics": {
      "temperature": 195.5,
      "vibration": 1.2,
      "spindle_speed": 3500,
      "power_consumption": 18.5
    },
    "unit": "mixed",
    "metadata": {
      "location": "Shop Floor A",
      "operator": "SYS-AUTO"
    }
  }
}
```

---

## Error Responses

### Standard Error Format
```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "error": "Bad Request"
}
```

### Common Status Codes

| Code | Meaning | Description |
|------|---------|-------------|
| 200 | OK | Request successful |
| 201 | Created | Resource created |
| 400 | Bad Request | Invalid input |
| 401 | Unauthorized | Missing/invalid token |
| 403 | Forbidden | Insufficient permissions |
| 404 | Not Found | Resource doesn't exist |
| 500 | Internal Server Error | Server error |

---

## Rate Limiting

**Limits**:
- 100 requests per minute per IP
- 1000 requests per hour per user

**Headers**:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1640000000
```

**Response when exceeded**:
```json
{
  "statusCode": 429,
  "message": "Too many requests",
  "error": "Too Many Requests"
}
```

---

## Authentication

### JWT Token

**Header Format**:
```
Authorization: Bearer <token>
```

**Token Expiration**: 24 hours

**Refresh**: Re-login to get new token

---

## CORS

**Allowed Origins**:
- `http://localhost:3000` (web-client)
- `http://localhost:8501` (science-lab)

**Allowed Methods**:
- GET, POST, PUT, DELETE, OPTIONS

**Allowed Headers**:
- Authorization, Content-Type

---

## Examples

### cURL

**Login**:
```bash
curl -X POST http://localhost:3001/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"operator","password":"password123"}'
```

**Get Inventory**:
```bash
curl http://localhost:3001/inventory \
  -H "Authorization: Bearer <token>"
```

**Get Prediction**:
```bash
curl http://localhost:8000/predict/CNC-01
```

### JavaScript (Fetch)

**Login**:
```javascript
const response = await fetch('http://localhost:3001/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    username: 'operator',
    password: 'password123'
  })
});
const data = await response.json();
```

**Get Inventory**:
```javascript
const response = await fetch('http://localhost:3001/inventory', {
  headers: { 'Authorization': `Bearer ${token}` }
});
const inventory = await response.json();
```

### Python (requests)

**Login**:
```python
import requests

response = requests.post('http://localhost:3001/auth/login', json={
    'username': 'operator',
    'password': 'password123'
})
data = response.json()
token = data['access_token']
```

**Get Prediction**:
```python
response = requests.get('http://localhost:8000/predict/CNC-01')
prediction = response.json()
```

---

## Next Steps

- [Database Schema](schema.md)
- [WebSocket Guide](websockets.md)
- [Authentication Guide](../user-guides/authentication.md)
