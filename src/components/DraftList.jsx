import './DraftList.css'

export default function DraftList({ drafts, selectedId, onSelect }) {
  if (!drafts.length) {
    return (
      <div className="draft-list">
        <div className="draft-empty">No drafts yet. Generate one below.</div>
      </div>
    )
  }

  return (
    <div className="draft-list">
      {drafts.map(draft => (
        <div
          key={draft.id}
          className={`draft-item status-${draft.status ?? 'pending'}${selectedId === draft.id ? ' selected' : ''}`}
          onClick={() => onSelect(draft.id)}
        >
          <div className="draft-item-top">
            <span className="draft-platform">{draft.platform}</span>
            {draft.status === 'approved' && (
              <span className="draft-badge approved">approved</span>
            )}
            {draft.status === 'skipped' && (
              <span className="draft-badge skipped">skipped</span>
            )}
          </div>
          <span className="draft-title">{draft.title}</span>
          <span className="draft-preview">{draft.content}</span>
        </div>
      ))}
    </div>
  )
}
