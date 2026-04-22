// Central agent registry. Add new agents here — no component edits needed.
export const AGENTS = {
  watchman: {
    key: 'watchman',
    label: 'Watchman',
    abbr: 'WA',
    description: 'Monitors property, fences, and security incidents.',
    icon: { bg: '#EAF0E0', color: 'var(--moss)' },
  },
  paymaster: {
    key: 'paymaster',
    label: 'Paymaster',
    abbr: 'PA',
    description: 'Manages invoices, payments, and vendor relationships.',
    icon: { bg: '#FDF3E0', color: '#8B6914' },
  },
  bookkeeper: {
    key: 'bookkeeper',
    label: 'Bookkeeper',
    abbr: 'BO',
    description: 'Handles reconciliation, ledger entries, and period close.',
    icon: { bg: '#E8F0F8', color: '#2E5A8A' },
  },
  shepherd: {
    key: 'shepherd',
    label: 'Shepherd',
    abbr: 'SH',
    description: 'Tracks herd health, feeding schedules, and vet alerts.',
    icon: { bg: '#F5EDE0', color: 'var(--amber)' },
  },
  harvester: {
    key: 'harvester',
    label: 'Harvester',
    abbr: 'HA',
    description: 'Monitors crop cycles, harvest windows, and crew scheduling.',
    icon: { bg: '#F0EAE0', color: 'var(--ash)' },
  },
  storyteller: {
    key: 'storyteller',
    label: 'Storyteller',
    abbr: 'ST',
    description: 'Drafts and queues content for social, email, and print.',
    icon: { bg: '#F0EBF8', color: '#6B4A9E' },
  },
}

// Ordered list of chat-enabled agents (Storyteller routes to Content Studio instead)
export const CHAT_AGENT_KEYS = ['watchman', 'paymaster', 'bookkeeper', 'shepherd', 'harvester']
