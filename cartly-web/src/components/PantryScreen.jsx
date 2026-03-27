import { useState, useRef } from 'react'
import { Mic, Loader2 } from 'lucide-react'
import { callOpenAI, transcribeAudio } from '../services/openaiApi'

const STATUS_CONFIG = {
  'use-soon': { label: 'Use soon', bg: '#FEF3C7', color: '#92400E' },
  low:        { label: 'Low',      bg: '#FEE2E2', color: '#991B1B' },
  stocked:    { label: 'Stocked',  bg: '#DCFCE7', color: '#166534' },
}

function StatusPill({ status }) {
  const cfg = STATUS_CONFIG[status]
  return (
    <span
      className="text-[10px] font-semibold px-2.5 py-0.5 rounded-full shrink-0 leading-5"
      style={{ backgroundColor: cfg.bg, color: cfg.color }}
    >
      {cfg.label}
    </span>
  )
}

// pantry and setPantry come from App so PlanScreen can share the same state.
export default function PantryScreen({ pantry, setPantry }) {
  const [isRecording, setIsRecording] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [toast, setToast] = useState(null)
  const mediaRecorderRef = useRef(null)
  const audioChunksRef = useRef([])
  const toastTimerRef = useRef(null)

  const needsAttention = pantry.flatMap(g => g.items).filter(
    i => i.status === 'use-soon' || i.status === 'low'
  ).length

  function showToast(msg) {
    clearTimeout(toastTimerRef.current)
    setToast(msg)
    toastTimerRef.current = setTimeout(() => setToast(null), 4000)
  }

  async function applyVoiceUpdates(transcript) {
    // isProcessing is already true when called from recorder.onstop
    const itemNames = pantry.flatMap(g => g.items.map(i => i.name))
    const systemPrompt =
      `You are a pantry tracking assistant. The user will describe what they just used or added to their pantry. ` +
      `Parse their statement and return a JSON array of updates:\n` +
      `[{ "itemName": string, "action": "decrease" | "increase" | "remove", "newAmount": string }]\n` +
      `Match item names to these exact pantry items: ${itemNames.join(', ')}.\n` +
      `Only return valid JSON.`
    try {
      const raw = await callOpenAI(
        [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: transcript },
        ],
        0.3
      )
      const updates = JSON.parse(raw)
      const updatedNames = []

      setPantry(prev =>
        prev.map(group => ({
          ...group,
          items: group.items.map(item => {
            const update = updates.find(u => u.itemName === item.name)
            if (!update) return item
            updatedNames.push(`${item.name} → ${update.newAmount}`)
            if (update.action === 'remove') {
              return { ...item, amount: 'Out of stock', status: 'low' }
            }
            const newStatus = update.action === 'decrease' ? 'use-soon' : 'stocked'
            return { ...item, amount: update.newAmount, status: newStatus }
          }),
        }))
      )

      showToast(
        updatedNames.length > 0
          ? `Updated: ${updatedNames.join(', ')}`
          : 'No matching pantry items found'
      )
    } catch (err) {
      showToast(`Couldn't update pantry: ${err.message}`)
    } finally {
      setIsProcessing(false)
    }
  }

  async function startRecording() {
    if (!navigator.mediaDevices?.getUserMedia) {
      showToast('Microphone access not supported in this browser')
      return
    }

    let stream
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true })
    } catch {
      showToast('Microphone permission denied — please allow access and try again')
      return
    }

    audioChunksRef.current = []
    const recorder = new MediaRecorder(stream)
    mediaRecorderRef.current = recorder

    recorder.ondataavailable = e => {
      if (e.data.size > 0) audioChunksRef.current.push(e.data)
    }

    recorder.onstop = async () => {
      // Stop all mic tracks so the browser releases the mic indicator
      stream.getTracks().forEach(t => t.stop())
      setIsRecording(false)
      setIsProcessing(true)
      try {
        const blob = new Blob(audioChunksRef.current, { type: recorder.mimeType || 'audio/webm' })
        const transcript = await transcribeAudio(blob)
        if (!transcript) {
          showToast("Couldn't hear anything — try again")
          setIsProcessing(false)
          return
        }
        // applyVoiceUpdates manages isProcessing from here
        applyVoiceUpdates(transcript)
      } catch (err) {
        showToast(`Voice error: ${err.message}`)
        setIsProcessing(false)
      }
    }

    recorder.start()
    setIsRecording(true)
  }

  function stopRecording() {
    mediaRecorderRef.current?.stop()
    // isRecording flipped to false inside recorder.onstop
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-4 pt-12 pb-4" style={{ backgroundColor: '#FAFAF8' }}>
        <div className="flex items-start justify-between">
          <div>
            <h1
              className="tracking-tight leading-tight"
              style={{ color: '#2C2A24', fontSize: '1.625rem', fontWeight: 600 }}
            >
              Cartly
            </h1>
            <p className="text-xs mt-0.5" style={{ color: '#A09880' }}>
              Your kitchen, organized
            </p>
          </div>

          {/* Mic button — idle: olive green, recording: pulsing red, processing: spinner */}
          <button
            onClick={isRecording ? stopRecording : startRecording}
            disabled={isProcessing}
            aria-label={isRecording ? 'Stop recording' : 'Update pantry by voice'}
            className={`rounded-full flex items-center justify-center mt-1 shrink-0 ${isRecording ? 'animate-pulse' : ''}`}
            style={{
              width: 40,
              height: 40,
              backgroundColor: isRecording ? '#EF4444' : '#F0F3E8',
              transition: 'background-color 0.2s',
            }}
          >
            {isProcessing ? (
              <Loader2 size={18} className="animate-spin" style={{ color: '#5C6E2E' }} />
            ) : (
              <Mic size={18} style={{ color: isRecording ? '#FFFFFF' : '#5C6E2E' }} />
            )}
          </button>
        </div>
      </div>

      {/* Toast notification */}
      {toast && (
        <div className="mx-4 mb-1">
          <div
            className="rounded-[12px] px-4 py-3 text-xs font-medium leading-relaxed"
            style={{ backgroundColor: '#2C2A24', color: '#FFFFFF' }}
          >
            {toast}
          </div>
        </div>
      )}

      <div
        className="flex-1 overflow-y-auto pb-24 px-4 pt-3"
        style={{ backgroundColor: '#FAFAF8' }}
      >
        {/* Summary chip */}
        {needsAttention > 0 && (
          <div
            className="flex items-center gap-2 rounded-[14px] p-3 mb-5 border"
            style={{ backgroundColor: '#FEF9F0', borderColor: '#F0E6CC' }}
          >
            <span className="text-base">⚠️</span>
            <p className="text-xs font-medium" style={{ color: '#92400E' }}>
              {needsAttention} item{needsAttention !== 1 ? 's' : ''} need attention — use soon or running low
            </p>
          </div>
        )}

        {/* Category sections */}
        {pantry.map(({ category, items }) => (
          <div key={category} className="mb-6">
            <p
              className="text-[10px] font-semibold uppercase tracking-[0.1em] px-1 mb-2"
              style={{ color: '#A09880' }}
            >
              {category}
            </p>
            <div
              className="rounded-[14px] overflow-hidden"
              style={{ backgroundColor: '#FFFFFF', border: '1px solid #E8E4DC' }}
            >
              {items.map((item, idx) => (
                <div
                  key={item.name}
                  className="flex items-center px-4 py-3 gap-3"
                  style={idx < items.length - 1 ? { borderBottom: '1px solid #F0EDE6' } : {}}
                >
                  <div className="flex-1 min-w-0">
                    <p
                      className="text-sm font-medium leading-snug"
                      style={{ color: '#2C2A24' }}
                    >
                      {item.name}
                    </p>
                    <p className="text-xs mt-0.5" style={{ color: '#A09880' }}>
                      {item.amount}
                    </p>
                  </div>
                  <StatusPill status={item.status} />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
