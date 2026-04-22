import './DraftList.css'

export default function DraftList({ drafts, selectedId, onSelect }) {
  return (
    <div className="draft-list">
      {drafts.map(draft => (
        <div
          key={draft.id}
          className={`draft-item${selectedId === draft.id ? ' selected' : ''}`}
          onClick={() => onSelect(draft.id)}
        >
          <span className="draft-platform">{draft.platform}</span>
          <span className="draft-title">{draft.title}</span>
          <span className="draft-preview">{draft.content}</span>
        </div>
      ))}
    </div>
  )
}
