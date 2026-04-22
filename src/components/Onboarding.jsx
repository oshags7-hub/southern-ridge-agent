import { useState } from 'react'
import './Onboarding.css'

const STEPS = [
  {
    id: 'welcome',
    visual: '🌾',
    visualBg: '#EAF0E0',
    title: 'Welcome to Southern Ridge',
    body: 'Your farm operation, organized in one place. Agents monitor what matters, surface what needs attention, and help you act fast — without the paperwork.',
  },
  {
    id: 'agents',
    visual: '⚡',
    visualBg: '#FDF3E0',
    title: 'Your agents are watching',
    body: 'Six specialized agents run in the background: Watchman tracks security, Paymaster handles invoices, Bookkeeper manages the ledger, Shepherd monitors your herd, Harvester watches the fields, and Storyteller drafts your content.',
    detail: 'Click any alert in the feed to open a conversation with that agent.',
  },
  {
    id: 'invoices',
    visual: '📄',
    visualBg: '#E8F0F8',
    title: 'Drop invoices to categorize',
    body: 'When you\'re in Paymaster or Bookkeeper chat, drag and drop a photo of any bill, invoice, or receipt directly into the conversation.',
    detail: 'The agent reads the document and proposes a category and ledger entry for your review.',
  },
  {
    id: 'studio',
    visual: '✍️',
    visualBg: '#F0EBF8',
    title: 'Content Studio',
    body: 'Draft Instagram posts, newsletters, and customer emails from the Content Studio tab. Use tone controls to adjust voice — shorter, more personal, stronger call to action, or faith-forward.',
    detail: 'The Storyteller agent queues content for your review before anything goes out.',
  },
  {
    id: 'ready',
    visual: '✓',
    visualBg: '#EEF2E8',
    title: 'You\'re all set',
    body: 'Your dashboard is ready. Start by reviewing the agent alerts, or drop an invoice into Paymaster to try the document workflow.',
  },
]

export const ONBOARDING_KEY = 'srm_onboarded_v1'

export default function Onboarding({ onComplete }) {
  const [step, setStep] = useState(0)
  const current = STEPS[step]
  const isLast = step === STEPS.length - 1

  function advance() {
    if (isLast) {
      localStorage.setItem(ONBOARDING_KEY, 'true')
      onComplete()
    } else {
      setStep(s => s + 1)
    }
  }

  function skip() {
    localStorage.setItem(ONBOARDING_KEY, 'true')
    onComplete()
  }

  return (
    <div className="onboarding-backdrop">
      <div className="onboarding-card">
        <div className="onboarding-visual" style={{ background: current.visualBg }}>
          <span className="onboarding-emoji">{current.visual}</span>
        </div>

        <div className="onboarding-body">
          <div className="onboarding-steps">
            {STEPS.map((s, i) => (
              <span
                key={s.id}
                className={`onboarding-dot${i === step ? ' active' : ''}${i < step ? ' done' : ''}`}
              />
            ))}
          </div>

          <h2 className="onboarding-title">{current.title}</h2>
          <p className="onboarding-text">{current.body}</p>
          {current.detail && (
            <p className="onboarding-detail">{current.detail}</p>
          )}

          <div className="onboarding-actions">
            {!isLast && (
              <button className="onboarding-skip" onClick={skip}>
                Skip intro
              </button>
            )}
            <button className="onboarding-next" onClick={advance}>
              {isLast ? 'Get started' : 'Next'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
