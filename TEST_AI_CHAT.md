# AI Agronomist Chat - Testing Guide

## Overview
The AI Agronomist Chat provides Swahili/English agricultural advice using Google's Gemini AI. Includes voice input (Web Speech API) and auto-speaking responses.

---

## Backend API

### 1. Chat Endpoint (Non-Streaming)

```powershell
# English Question
$body = @{
    message = "How do I control aphids on tomatoes?"
    language = "en"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:5000/api/ai/chat" `
  -Method POST `
  -ContentType "application/json" `
  -Body $body
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "message": "Use neem oil spray or insecticidal soap. Mix 2 tablespoons neem oil with water in a spray bottle. Apply early morning or evening. Spray both sides of leaves every 7 days. Remove heavily infested leaves. Plant marigolds nearby as companion plants to repel aphids naturally.",
    "language": "en",
    "timestamp": "2024-01-15T10:30:00.000Z"
  }
}
```

### 2. Chat with Conversation History

```powershell
$body = @{
    message = "Ni kiasi gani cha maji?"
    language = "sw"
    conversationHistory = @(
        @{
            role = "user"
            content = "Mbolea gani ni bora kwa mahindi?"
        },
        @{
            role = "assistant"
            content = "Tumia DAP wakati wa kupanda (50kg/ekari) na Urea baada ya wiki 3-4 (50kg/ekari)."
        }
    )
} | ConvertTo-Json -Depth 3

Invoke-RestMethod -Uri "http://localhost:5000/api/ai/chat" `
  -Method POST `
  -ContentType "application/json" `
  -Body $body
```

### 3. Streaming Chat (SSE)

```powershell
# Note: PowerShell doesn't handle SSE well, use curl or browser
curl -N "http://localhost:5000/api/ai/chat?stream=true" `
  -H "Content-Type: application/json" `
  -d '{"message":"Tell me about drip irrigation","language":"en"}'
```

**Expected Output:**
```
data: {"text":"Drip "}
data: {"text":"irrigation "}
data: {"text":"saves "}
data: {"text":"water..."}
data: [DONE]
```

### 4. Pest Remedy Endpoint

```powershell
$body = @{
    pestLabels = @("aphids", "whiteflies", "leaf_miner")
    language = "sw"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:5000/api/ai/pest-remedy" `
  -Method POST `
  -ContentType "application/json" `
  -Body $body
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "pests": ["aphids", "whiteflies", "leaf_miner"],
    "remedy": "Tumia dawa ya neem (2 vijiko vya chai kwa lita 1 ya maji). Nyunyiza asubuhi mapema au jioni. Ondoa majani yaliyoathiriwa. Panda marigold kuzuia wadudu. Safisha bustani mara kwa mara.",
    "language": "sw",
    "timestamp": "2024-01-15T10:35:00.000Z"
  }
}
```

---

## Frontend Component Testing

### 1. Navigate to AI Chat
1. Login to dashboard
2. Click "AI Agronomist" in sidebar (MessageCircle icon)
3. Should see green header: "🌾 Mshauri wa Kilimo" (Swahili) or "🌾 AI Agronomist" (English)

### 2. Text Chat
1. Type question in input box (e.g., "How to plant maize?")
2. Click Send button
3. Should see:
   - User message on right (green bubble)
   - Loading indicator
   - AI response on left (white bubble)
   - Auto-scroll to latest message

### 3. Voice Input
1. Click microphone button (left of input)
2. Browser asks for permission → Allow
3. Speak your question
4. Should see:
   - Red pulsing mic button
   - "🎤 Inasikiza..." indicator
   - After speech ends → transcript appears in input box

**Supported Languages:**
- Swahili: `sw-KE` (Kenya)
- English: `en-US`

### 4. Voice Output
1. Enable voice: Click speaker button (top right) → Volume2 icon shows
2. Send message
3. AI response should be spoken aloud using browser TTS

**Controls:**
- Volume2 icon = Voice enabled
- VolumeX icon = Voice muted
- Browser will use appropriate voice based on language

### 5. Clear Chat
1. Click "Futa" (Swahili) or "Clear" (English) button in header
2. All messages cleared
3. Voice output stops

---

## Testing Checklist

### Backend ✅
- [ ] POST /api/ai/chat returns response in < 5 seconds
- [ ] Language parameter works (en/sw)
- [ ] Conversation history included in context (last 6 messages)
- [ ] System prompt enforces 80-word limit
- [ ] Streaming endpoint works with `?stream=true`
- [ ] Pest remedy endpoint returns Swahili remedies
- [ ] Error handling: Missing GEMINI_API_KEY returns 500

### Frontend ✅
- [ ] Chat component renders in dashboard
- [ ] Messages scroll automatically
- [ ] User messages on right (green), AI on left (white)
- [ ] Loading spinner shows while waiting
- [ ] Timestamps display correctly
- [ ] Voice input button toggles listening state
- [ ] Voice permission request appears
- [ ] Spoken text populates input field
- [ ] Voice output auto-plays AI responses
- [ ] Speaker icon toggles mute/unmute
- [ ] Clear button removes all messages
- [ ] Language switches with i18n (EN/SW)

### Voice API ✅
- [ ] SpeechRecognition works in Chrome/Edge
- [ ] Safari fallback: Shows "Voice input not supported" alert
- [ ] Recognition language matches i18n setting
- [ ] SpeechSynthesis speaks responses
- [ ] Voice rate set to 0.9 (slower for clarity)
- [ ] Voice stops when component unmounts

---

## Environment Setup

Add to `.env`:
```env
GEMINI_API_KEY=your_google_ai_studio_key_here
```

Get API key from: https://aistudio.google.com/app/apikey

---

## Browser Compatibility

| Feature | Chrome | Edge | Firefox | Safari |
|---------|--------|------|---------|--------|
| Text Chat | ✅ | ✅ | ✅ | ✅ |
| Voice Input | ✅ | ✅ | ❌ | ⚠️ Limited |
| Voice Output | ✅ | ✅ | ✅ | ✅ |
| Streaming | ✅ | ✅ | ✅ | ✅ |

**Note:** Web Speech API has limited support in Firefox and Safari. Component gracefully degrades to text-only mode.

---

## Troubleshooting

### Issue: "Voice input not supported"
**Solution:** Use Chrome or Edge browser

### Issue: No voice output
**Solution:** 
1. Check speaker icon is Volume2 (not VolumeX)
2. Ensure browser audio not muted
3. Check system TTS voices installed (Windows Settings → Time & Language → Speech)

### Issue: API returns 500 error
**Solution:**
1. Verify GEMINI_API_KEY in `.env`
2. Restart server: `npm run dev`
3. Check API quota: https://aistudio.google.com/app/apikey

### Issue: Wrong language response
**Solution:**
1. Check i18n language setting (top-right language toggle)
2. Backend uses `language` parameter from request
3. System prompt enforces Swahili when `language=sw`

---

## Next Steps
1. Test with real farmers (Swahili primary users)
2. Monitor Gemini API usage/costs
3. Add conversation persistence (save to MongoDB)
4. Implement voice activity detection (stop on silence)
5. Add suggested questions ("Quick Replies")
