# Smart Green Farmers Life - API Test Commands

## 1. IoT Telemetry Pipeline

### POST Telemetry Data
```powershell
# Send telemetry data from IoT device
$body = @{
    deviceId = 'greenhouse-001'
    temperature = 28.5
    humidity = 70.0
    soilMoisture = 55.0
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:5000/api/telemetry" `
    -Method POST `
    -Body $body `
    -ContentType "application/json"
```

### GET Latest Telemetry
```powershell
# Get latest telemetry reading for a device
Invoke-RestMethod -Uri "http://localhost:5000/api/telemetry/latest/greenhouse-001" -Method GET
```

### GET Averages (for charting)
```powershell
# Get 7-day averages for device
Invoke-RestMethod -Uri "http://localhost:5000/api/averages?deviceId=greenhouse-001&days=7" -Method GET

# Get 30-day averages
Invoke-RestMethod -Uri "http://localhost:5000/api/averages?deviceId=greenhouse-001&days=30" -Method GET
```

## 2. Simulate Multiple Telemetry Readings
```powershell
# Send 5 readings in a loop
for ($i = 1; $i -le 5; $i++) {
    $body = @{
        deviceId = 'greenhouse-001'
        temperature = 25 + (Get-Random -Maximum 5)
        humidity = 60 + (Get-Random -Maximum 10)
        soilMoisture = 40 + (Get-Random -Maximum 15)
    } | ConvertTo-Json
    
    Invoke-RestMethod -Uri "http://localhost:5000/api/telemetry" `
        -Method POST `
        -Body $body `
        -ContentType "application/json"
    
    Write-Host "Sent reading $i"
    Start-Sleep -Seconds 2
}
```

## Expected Results

### POST /api/telemetry
- Status: 201 Created
- Response: `{ "success": true, "message": "Telemetry data received", "data": {...} }`
- Socket.IO broadcast to connected clients in < 1s
- Data stored in MongoDB for aggregation

### GET /api/averages
- Returns 5-minute averaged data points
- Useful for charting trends
- Aggregation runs automatically every 5 minutes via cron job

## Verification Steps (< 5 min)

1. **Start Backend**: `node server.js`
2. **Send Test Data**: Run POST telemetry command 3-5 times
3. **Check Real-time**: Open dashboard - see live updates via Socket.IO
4. **Wait 5 min**: Aggregation service computes averages
5. **Query Averages**: Run GET /api/averages - see computed data points
