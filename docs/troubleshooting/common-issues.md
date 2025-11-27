# Troubleshooting Guide

## Common Issues and Solutions

---

## Authentication Issues

### "Invalid Credentials"

**Symptoms**:
- Login fails with "Invalid credentials" message
- Correct password doesn't work

**Causes**:
1. Wrong username or password
2. Caps Lock enabled
3. Database not initialized
4. User doesn't exist

**Solutions**:
```bash
# 1. Verify default credentials
Username: operator
Password: password123

# 2. Check database
docker exec -it pocket_ops_db psql -U admin -d pocket_ops -c "SELECT * FROM users;"

# 3. Reset password (if needed)
docker exec -it pocket_ops_db psql -U admin -d pocket_ops -c "UPDATE users SET password='<hashed>' WHERE username='operator';"
```

---

### "Session Expired"

**Symptoms**:
- Redirected to login after being logged in
- "Session expired" message

**Causes**:
1. JWT token expired (24 hours)
2. Server restarted
3. Token invalid

**Solutions**:
```bash
# Simply log in again
# Sessions expire after 24 hours for security
```

---

## Database Issues

### "Connection Refused"

**Symptoms**:
- API can't connect to database
- "ECONNREFUSED" errors in logs

**Causes**:
1. Database container not running
2. Wrong connection string
3. Network issue

**Solutions**:
```bash
# 1. Check database is running
docker ps | grep postgres

# 2. Start if stopped
docker compose up -d postgres

# 3. Check logs
docker logs pocket_ops_db

# 4. Test connection
docker exec -it pocket_ops_db psql -U admin -d pocket_ops -c "SELECT 1;"
```

---

### "Relation Does Not Exist"

**Symptoms**:
- SQL errors about missing tables
- "relation 'users' does not exist"

**Causes**:
1. Migrations not run
2. Wrong database selected

**Solutions**:
```bash
# Run migrations
cat packages/database/migrations/*.sql | \
  docker exec -i pocket_ops_db psql -U admin -d pocket_ops

# Verify tables exist
docker exec -it pocket_ops_db psql -U admin -d pocket_ops -c "\dt"
```

---

## Service Issues

### API Core Not Starting

**Symptoms**:
- Container exits immediately
- "Cannot find module" errors

**Causes**:
1. Dependencies not installed
2. Build failed
3. Port already in use

**Solutions**:
```bash
# 1. Check logs
docker logs pocket_ops_api

# 2. Rebuild image
docker compose build api-core

# 3. Check port availability
lsof -i :3001

# 4. Kill process if needed
kill -9 <PID>

# 5. Restart service
docker compose up -d api-core
```

---

### Telemetry Service Disconnected

**Symptoms**:
- "DISCONNECTED" status on dashboard
- No telemetry data

**Causes**:
1. Service not running
2. MQTT broker down
3. Network issue

**Solutions**:
```bash
# 1. Check service status
docker ps | grep telemetry

# 2. Check MQTT broker
docker ps | grep mosquitto

# 3. Restart services
docker compose restart mosquitto telemetry-service

# 4. Check logs
docker logs pocket_ops_mqtt
docker logs pocket_ops_telemetry
```

---

## AI/ML Issues

### "No Predictions Available"

**Symptoms**:
- AI dashboard shows no data
- "Insufficient data" message

**Causes**:
1. Not enough training data (need 1000+ samples)
2. AI service not running
3. Database empty

**Solutions**:
```bash
# 1. Check AI service
docker ps | grep ai-service

# 2. Start simulator to generate data
node simulator.js

# 3. Wait for data collection (5-10 minutes)

# 4. Check data in database
docker exec -it pocket_ops_telemetry psql -U admin -d pocket_ops_telemetry \
  -c "SELECT COUNT(*) FROM machine_telemetry;"
```

---

### MLflow Not Accessible

**Symptoms**:
- Can't access http://localhost:5000
- Connection refused

**Causes**:
1. MLflow container not running
2. Port conflict

**Solutions**:
```bash
# 1. Check container
docker ps | grep mlflow

# 2. Start if stopped
docker compose -f docker-compose.dev.yml up -d mlflow

# 3. Check logs
docker logs pocket_ops_mlflow

# 4. Verify port
lsof -i :5000
```

---

## Frontend Issues

### "Network Error"

**Symptoms**:
- API calls fail
- "Failed to fetch" errors

**Causes**:
1. API not running
2. CORS issue
3. Wrong API URL

**Solutions**:
```bash
# 1. Verify API is running
curl http://localhost:3001/health

# 2. Check browser console for CORS errors

# 3. Verify API_URL in .env
NEXT_PUBLIC_API_URL=http://localhost:3001

# 4. Restart web client
npm run dev --workspace=@pocket-ops/web-client
```

---

### Offline Mode Not Working

**Symptoms**:
- Changes don't save offline
- "Pending sync" never clears

**Causes**:
1. RxDB not initialized
2. Browser storage full
3. Sync service down

**Solutions**:
```bash
# 1. Clear browser cache
# Chrome: Settings > Privacy > Clear browsing data

# 2. Check browser console for errors

# 3. Verify IndexedDB
# Chrome DevTools > Application > IndexedDB

# 4. Restart browser
```

---

## Performance Issues

### Slow API Responses

**Symptoms**:
- Requests take >1 second
- Dashboard laggy

**Causes**:
1. Database not indexed
2. Too much data
3. Resource constraints

**Solutions**:
```bash
# 1. Check database performance
docker exec -it pocket_ops_db psql -U admin -d pocket_ops \
  -c "EXPLAIN ANALYZE SELECT * FROM ledger_events LIMIT 100;"

# 2. Add indexes if needed
docker exec -it pocket_ops_db psql -U admin -d pocket_ops \
  -c "CREATE INDEX idx_ledger_timestamp ON ledger_events(timestamp);"

# 3. Check resource usage
docker stats

# 4. Increase resources if needed
# Edit docker-compose.yml:
# resources:
#   limits:
#     memory: 2G
```

---

### High Memory Usage

**Symptoms**:
- Container OOM killed
- System slow

**Causes**:
1. Memory leak
2. Too many containers
3. Large datasets

**Solutions**:
```bash
# 1. Check memory usage
docker stats

# 2. Restart high-memory containers
docker compose restart <service>

# 3. Increase memory limits
# Edit docker-compose.yml

# 4. Clean up old data
docker exec -it pocket_ops_telemetry psql -U admin -d pocket_ops_telemetry \
  -c "DELETE FROM machine_telemetry WHERE time < NOW() - INTERVAL '30 days';"
```

---

## Docker Issues

### "Port Already in Use"

**Symptoms**:
- Container fails to start
- "bind: address already in use"

**Causes**:
1. Another service using port
2. Old container still running

**Solutions**:
```bash
# 1. Find process using port
lsof -i :<port>

# 2. Kill process
kill -9 <PID>

# 3. Or change port in docker-compose.yml
ports:
  - "3002:3001"  # Use 3002 instead of 3001
```

---

### "No Space Left on Device"

**Symptoms**:
- Build fails
- Container won't start

**Causes**:
1. Disk full
2. Too many images/volumes

**Solutions**:
```bash
# 1. Check disk space
df -h

# 2. Clean up Docker
docker system prune -a --volumes

# 3. Remove old images
docker image prune -a

# 4. Remove unused volumes
docker volume prune
```

---

## Kubernetes Issues

### Pods in CrashLoopBackOff

**Symptoms**:
- Pod keeps restarting
- STATUS shows "CrashLoopBackOff"

**Causes**:
1. Application error
2. Missing dependencies
3. Configuration issue

**Solutions**:
```bash
# 1. Check pod logs
kubectl logs <pod-name>

# 2. Describe pod for events
kubectl describe pod <pod-name>

# 3. Check previous logs
kubectl logs <pod-name> --previous

# 4. Exec into pod to debug
kubectl exec -it <pod-name> -- /bin/sh
```

---

### ImagePullBackOff

**Symptoms**:
- Pod can't pull image
- STATUS shows "ImagePullBackOff"

**Causes**:
1. Image doesn't exist
2. Registry authentication failed
3. Network issue

**Solutions**:
```bash
# 1. Check image exists
docker pull <image-name>

# 2. Create image pull secret
kubectl create secret docker-registry regcred \
  --docker-server=<registry> \
  --docker-username=<username> \
  --docker-password=<password>

# 3. Add to deployment
spec:
  imagePullSecrets:
  - name: regcred
```

---

## Getting Help

### Collect Debug Information

```bash
# System info
docker version
docker compose version
kubectl version

# Container status
docker ps -a

# Logs
docker compose logs > logs.txt

# Kubernetes status
kubectl get all -n pocket-ops
kubectl describe pod <pod-name> > pod-debug.txt
```

### Contact Support

Include:
1. Error message (exact text)
2. Steps to reproduce
3. System information
4. Logs (from above)
5. Screenshots (if UI issue)

---

## Prevention

### Regular Maintenance

```bash
# Weekly
- Check disk space
- Review logs for errors
- Update dependencies

# Monthly
- Backup databases
- Clean old data
- Review security updates

# Quarterly
- Full system audit
- Performance review
- Disaster recovery test
```

---

## Next Steps

- [Deployment Guide](../deployment/production.md)
- [Monitoring Guide](../deployment/monitoring.md)
- [API Reference](../api-reference/api.md)
