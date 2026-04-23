import './AdminSection.css'

export default function PermitsSection({ permits }) {
  return (
    <section className="admin-section">
      <div className="admin-section-header">
        <h2 className="admin-section-title">Permits &amp; Licenses</h2>
        <button className="admin-add-btn" onClick={permits.add}>+ Add permit</button>
      </div>

      {permits.list.length === 0 && (
        <p className="admin-empty">No permits added yet.</p>
      )}

      <div className="permit-cards">
        {permits.list.map(permit => (
          <div key={permit.id} className="permit-card">
            <div className="permit-card-row">
              <div className="field-group grow">
                <label className="field-label">Permit / License name</label>
                <input
                  className="admin-input"
                  value={permit.name}
                  placeholder="e.g. TDA Retail Meat Sales Permit"
                  onChange={e => permits.update(permit.id, 'name', e.target.value)}
                />
              </div>
              <button
                className="admin-delete-btn"
                title="Remove permit"
                onClick={() => permits.delete(permit.id)}
              >
                ✕
              </button>
            </div>

            <div className="permit-card-row">
              <div className="field-group">
                <label className="field-label">Expiration date</label>
                <input
                  className="admin-input"
                  type="date"
                  value={permit.expiration}
                  onChange={e => permits.update(permit.id, 'expiration', e.target.value)}
                />
              </div>
              <div className="field-group">
                <label className="field-label">Renewal lead time (days)</label>
                <input
                  className="admin-input"
                  type="number"
                  min="0"
                  value={permit.leadDays}
                  onChange={e => permits.update(permit.id, 'leadDays', Number(e.target.value))}
                />
              </div>
            </div>

            <div className="field-group">
              <label className="field-label">Notes</label>
              <input
                className="admin-input"
                value={permit.notes}
                placeholder="Contact info, renewal instructions…"
                onChange={e => permits.update(permit.id, 'notes', e.target.value)}
              />
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
