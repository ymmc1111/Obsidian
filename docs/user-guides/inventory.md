# User Guide: Inventory Management

## Overview

The Inventory Management system provides real-time tracking of parts and materials with offline-first capabilities.

---

## Accessing Inventory

Navigate to:
```
http://localhost:3000/inventory
```

---

## Features

### Real-Time Sync
- ✅ Data syncs automatically when online
- ✅ Works offline in factory dead zones
- ✅ Changes queue and sync when connection restored
- ✅ Visual indicator shows sync status

### QR/Barcode Scanning
- ✅ Scan parts using device camera
- ✅ Instant lookup and details
- ✅ No external scanner required

---

## Viewing Inventory

### Inventory Cards

Each item displays:
- **Part Number**: Unique identifier
- **Nomenclature**: Item description
- **Quantity**: Current stock level
- **Sync Status**: 
  - ✅ Green checkmark = Synced
  - ⏳ Yellow badge = Pending sync

### Network Status

Top-right indicator:
- **● ONLINE**: Connected to server, changes sync immediately
- **● OFFLINE**: No connection, changes queued locally

---

## Adjusting Inventory

### Quick Adjustments

**Decrease Quantity** (-1):
1. Click the **-1** button
2. Quantity decreases immediately
3. Change syncs to server (if online)

**Increase Quantity** (+1):
1. Click the **+1** button
2. Quantity increases immediately
3. Change syncs to server (if online)

### Bulk Adjustments

**Order +10 Units** (Requires Approval):
1. Slide the **SLIDE TO ORDER +10** control
2. Slide all the way to the right
3. Release to execute
4. If you're an Operator, approval is requested
5. If you're a Supervisor, action executes immediately

---

## QR/Barcode Scanning

### Starting the Scanner

1. Click **SCAN QR/BARCODE** button
2. Allow camera access when prompted
3. Point camera at barcode/QR code
4. Scanner automatically detects and reads code

### Scanning Results

**Item Found**:
- Alert shows item details
- Quantity displayed
- Scanner closes automatically

**Item Not Found**:
- Alert shows "Item not found: [code]"
- Check code and try again

### Troubleshooting Scanner

**Camera Not Working**:
- Ensure browser has camera permission
- Check if another app is using camera
- Try refreshing the page

**Code Not Scanning**:
- Ensure good lighting
- Hold steady, avoid shaking
- Try different angle or distance

---

## Offline Mode

### How It Works

When offline:
1. All changes save to local database (RxDB)
2. "PENDING SYNC" badge appears on modified items
3. Changes queue for upload
4. When online, changes sync automatically

### Limitations

**Offline Restrictions**:
- ❌ Cannot approve critical actions
- ❌ Cannot view other users' changes
- ✅ Can view and modify local inventory
- ✅ Can scan QR codes

### Sync Conflicts

If someone else modified the same item while you were offline:
- Your change is rejected
- You see "Stale Data" alert
- Re-scan or refresh to get latest data
- Make your change again

---

## Best Practices

### Accuracy
- ✅ Always verify quantity before adjusting
- ✅ Use scanner for accuracy
- ✅ Double-check part numbers
- ❌ Don't guess quantities

### Offline Work
- ✅ Sync before going offline
- ✅ Minimize time offline
- ✅ Sync as soon as connection restored
- ❌ Don't make critical changes offline

### Security
- ✅ Lock screen when stepping away
- ✅ Log out when finished
- ✅ Report discrepancies immediately

---

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `S` | Open scanner |
| `Esc` | Close scanner |
| `R` | Refresh inventory |

---

## Troubleshooting

### "Pending Sync" Won't Clear
- **Cause**: No network connection
- **Solution**: Check network, wait for connection

### Quantity Incorrect
- **Cause**: Sync conflict or stale data
- **Solution**: Refresh page, verify with physical count

### Scanner Won't Open
- **Cause**: Camera permission denied
- **Solution**: Enable camera in browser settings

### Changes Not Saving
- **Cause**: Local storage full
- **Solution**: Clear browser cache, sync data

---

## FAQ

**Q: How long does data stay in offline mode?**
A: Indefinitely. Data persists until synced or browser cache cleared.

**Q: Can multiple people edit the same item?**
A: Yes, but last sync wins. Use approval workflow for critical changes.

**Q: What happens if I clear my browser cache?**
A: Unsynced changes are lost. Always sync before clearing cache.

**Q: Can I export inventory data?**
A: Yes, contact administrator for data export.

---

## Next Steps

- [QR Scanning Guide](qr-scanning.md)
- [Offline Mode Guide](offline-mode.md)
- [Approval Workflow Guide](approvals.md)
