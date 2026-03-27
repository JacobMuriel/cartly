// Thin wrapper around OpenAI endpoints.
// API key is read from the VITE_OPENAI_API_KEY environment variable.
// This is a demo app — calling the API directly from the browser is intentional.

// Transcribe an audio Blob via OpenAI Whisper.
// Works in any browser that supports MediaRecorder (all modern browsers),
// unlike the Web Speech API which is Chrome-only.
export async function transcribeAudio(audioBlob) {
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY
  if (!apiKey) {
    throw new Error('OpenAI API key not configured. Add VITE_OPENAI_API_KEY to your .env file.')
  }

  const formData = new FormData()
  // Whisper accepts webm/ogg/mp4 — MediaRecorder typically produces webm or ogg
  formData.append('file', audioBlob, 'recording.webm')
  formData.append('model', 'whisper-1')

  const res = await fetch('https://api.openai.com/v1/audio/transcriptions', {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}` },
    body: formData,
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error?.message ?? `Whisper request failed (${res.status})`)
  }

  const data = await res.json()
  return data.text?.trim() ?? ''
}

export async function callOpenAI(messages, temperature = 0.7) {
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY
  if (!apiKey) {
    throw new Error(
      'OpenAI API key not configured. Add VITE_OPENAI_API_KEY to your .env file.'
    )
  }

  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({ model: 'gpt-4o-mini', messages, temperature }),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error?.message ?? `OpenAI request failed (${res.status})`)
  }

  const data = await res.json()
  return data.choices[0].message.content.trim()
}
