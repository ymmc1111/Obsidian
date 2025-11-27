# User Guide: Authentication & Authorization

## Overview

Operation Obsidian uses a multi-layered security approach with JWT authentication and role-based access control (RBAC).

---

## User Roles

### Operator
- **Access Level**: Basic
- **Permissions**:
  - View inventory
  - Request authorization for critical actions
  - Scan QR/barcodes
  - View telemetry data
- **Cannot**: Approve critical actions

### Supervisor
- **Access Level**: Elevated
- **Permissions**:
  - All Operator permissions
  - Approve critical actions
  - View pending approvals
- **Cannot**: Modify system configuration

### Admin
- **Access Level**: Full
- **Permissions**:
  - All Supervisor permissions
  - System configuration
  - User management
  - Access all logs

---

## Logging In

### 1. Navigate to Login Page
Open your browser and go to:
```
http://localhost:3000/login
```

### 2. Enter Credentials

**Default Accounts**:
- **Operator**: `operator` / `password123`
- **Supervisor**: `supervisor` / `password123`

### 3. Security Features

**Session Management**:
- Sessions expire after 24 hours
- JWT tokens stored securely in HttpOnly cookies
- Automatic logout on inactivity

**Screen Lock**:
- Screen blurs after 30 seconds of inactivity
- Click "UNLOCK" to resume
- Prevents data leaks during screen sharing

---

## Two-Person Rule (Double-Signature)

Critical actions require approval from two different users.

### How It Works

1. **Operator Initiates Action**
   - Click "REQUEST AUTHORIZATION" button
   - Action is queued as "Pending"
   - Supervisor is notified

2. **Supervisor Reviews**
   - Navigate to "Pending Approvals"
   - Review the requested action
   - Click "APPROVE" to authorize

3. **Action Executes**
   - System verifies both signatures
   - Action is logged to immutable ledger
   - Both users are recorded as actors

### Critical Actions

Actions requiring double-signature:
- Inventory adjustments > 10 units
- Batch releases
- System configuration changes
- User role modifications

---

## Security Best Practices

### Password Management
- ✅ Use strong, unique passwords
- ✅ Change default passwords immediately
- ✅ Never share credentials
- ❌ Don't write passwords down

### Session Security
- ✅ Always log out when finished
- ✅ Lock screen when stepping away
- ✅ Use private browsing for shared devices
- ❌ Don't leave sessions unattended

### Physical Security
- ✅ Ensure device is secure
- ✅ Use screen privacy filters in public
- ✅ Enable device encryption
- ❌ Don't access from public WiFi

---

## Troubleshooting

### "Invalid Credentials"
- **Cause**: Wrong username or password
- **Solution**: Verify credentials, check caps lock

### "Session Expired"
- **Cause**: JWT token expired (24 hours)
- **Solution**: Log in again

### "Unauthorized"
- **Cause**: Insufficient permissions for action
- **Solution**: Request supervisor approval

### "Screen Locked"
- **Cause**: Inactivity timeout (30 seconds)
- **Solution**: Click "UNLOCK" button

---

## FAQ

**Q: How long do sessions last?**
A: 24 hours from login. You'll need to re-authenticate after that.

**Q: Can I use the same account on multiple devices?**
A: Yes, but each device will have its own session.

**Q: What happens if I forget my password?**
A: Contact your system administrator for a password reset.

**Q: Why does my screen keep locking?**
A: This is a security feature. Adjust the timeout in settings if needed.

**Q: Can I bypass the two-person rule?**
A: No. This is a critical security requirement and cannot be disabled.

---

## Next Steps

- [Inventory Management Guide](inventory.md)
- [Telemetry Monitoring Guide](telemetry.md)
- [AI Predictions Guide](ai.md)
