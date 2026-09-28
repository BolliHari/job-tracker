import { useEffect, useRef, useState } from 'react'
import { MessageCircle, Send, X } from 'lucide-react'
import { API_BASE_URL } from '../../utils/api'

const SUGGESTIONS = [
  'What is the job vault?',
  'How do I install the Chrome extension?',
  'What does the AI coach do?',
]

function ChatBubble() {
  const [open, setOpen] = useState(false)
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content:
        "Hi, I'm the Job Tracker guide. Ask me how the vault, follow-ups, or the Chrome extension work.",
    },
  ])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const listRef = useRef(null)
  const inputRef = useRef(null)

  useEffect(() => {
    if (!open) return
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' })
    inputRef.current?.focus()
  }, [open, messages, loading])

  async function ask(question) {
    const text = question.trim()
    if (!text || loading) return

    const history = messages
      .filter((message) => message.role === 'user' || message.role === 'assistant')
      .slice(1)
      .map(({ role, content }) => ({ role, content }))

    setMessages((current) => [...current, { role: 'user', content: text }])
    setInput('')
    setError('')
    setLoading(true)

    try {
      const response = await fetch(`${API_BASE_URL}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: text, history }),
      })
      const data = await response.json().catch(() => ({}))
      if (!response.ok) {
        throw new Error(data.message || 'The guide could not answer just now.')
      }
      setMessages((current) => [
        ...current,
        { role: 'assistant', content: data.answer || "I don't know that yet." },
      ])
    } catch (err) {
      setError(
        err.message === 'Failed to fetch'
          ? 'The guide is offline. Start the Job Tracker API, then try again.'
          : err.message
      )
    } finally {
      setLoading(false)
    }
  }

  function handleSubmit(event) {
    event.preventDefault()
    ask(input)
  }

  return (
    <div className="fixed bottom-5 right-5 z-[60] flex flex-col items-end gap-3">
      {open ? (
        <section
          className="flex h-[min(70vh,520px)] w-[min(100vw-2.5rem,380px)] flex-col overflow-hidden rounded-2xl border border-sand bg-white shadow-xl shadow-charcoal/10"
          aria-label="Job Tracker guide"
        >
          <header className="flex items-center justify-between gap-3 bg-sage px-4 py-3 text-white">
            <div>
              <p className="text-sm font-semibold">Job Tracker guide</p>
              <p className="text-xs text-white/80">Answers from the product guide</p>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded-lg p-1.5 transition-colors hover:bg-white/15"
              aria-label="Close chat"
            >
              <X size={18} strokeWidth={2} />
            </button>
          </header>

          <div ref={listRef} className="flex-1 space-y-3 overflow-y-auto bg-paper px-4 py-4">
            {messages.map((message, index) => (
              <div
                key={`${message.role}-${index}`}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <p
                  className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm leading-relaxed ${
                    message.role === 'user'
                      ? 'rounded-br-md bg-sage text-white'
                      : 'rounded-bl-md border border-sand bg-white text-charcoal'
                  }`}
                >
                  {message.content}
                </p>
              </div>
            ))}
            {loading ? (
              <p className="text-xs text-charcoal/50">Looking through the guide…</p>
            ) : null}
            {error ? (
              <p className="text-xs text-red-600" role="alert">
                {error}
              </p>
            ) : null}
          </div>

          {messages.length < 3 && !loading ? (
            <div className="flex flex-wrap gap-2 border-t border-sand/70 bg-white px-4 py-3">
              {SUGGESTIONS.map((suggestion) => (
                <button
                  key={suggestion}
                  type="button"
                  onClick={() => ask(suggestion)}
                  className="rounded-full border border-sand bg-paper px-3 py-1 text-xs text-charcoal/80 transition-colors hover:border-sage/40 hover:text-sage"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          ) : null}

          <form onSubmit={handleSubmit} className="flex items-center gap-2 border-t border-sand bg-white p-3">
            <input
              ref={inputRef}
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder="Ask about Job Tracker"
              className="min-w-0 flex-1 rounded-xl border border-sand bg-paper px-3 py-2 text-sm text-charcoal placeholder:text-charcoal/40 focus:border-sage focus:outline-none focus:ring-1 focus:ring-sage"
              maxLength={1000}
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-sage text-white transition-opacity hover:opacity-90 disabled:opacity-40"
              aria-label="Send message"
            >
              <Send size={16} strokeWidth={2} />
            </button>
          </form>
        </section>
      ) : null}

      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-sage text-white shadow-lg shadow-sage/30 transition-transform hover:scale-105"
        aria-label={open ? 'Close chat' : 'Open chat'}
        aria-expanded={open}
      >
        {open ? <X size={22} strokeWidth={2} /> : <MessageCircle size={24} strokeWidth={2} />}
      </button>
    </div>
  )
}

export default ChatBubble
