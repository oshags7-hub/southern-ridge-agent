import './AdminSection.css'

const RESULT_OPTIONS = ['', 'Pass', 'Fail', 'Pending']

export default function ComplianceSection({ compliance }) {
  const { data, update } = compliance

  return (
    <section className="admin-section">
      <div className="admin-section-header">
        <h2 className="admin-section-title">Compliance Records</h2>
      </div>

      <div className="compliance-grid">
        {/* HACCP */}
        <div className="compliance-card">
          <span className="compliance-card-label">HACCP Review</span>
          <div className="field-group">
            <label className="field-label">Last review date</label>
            <input
              className="admin-input"
              type="date"
              value={data.haccpReviewDate}
              onChange={e => update('haccpReviewDate', e.target.value)}
            />
          </div>
        </div>

        {/* Herdshare */}
        <div className="compliance-card">
          <span className="compliance-card-label">Herdshare</span>
          <div className="field-group">
            <label className="field-label">Active herdshare customers</label>
            <input
              className="admin-input"
              type="number"
              min="0"
              value={data.herdshareCount}
              onChange={e => update('herdshareCount', Number(e.target.value))}
            />
          </div>
        </div>

        {/* TDA Inspection */}
        <div className="compliance-card">
          <span className="compliance-card-label">TDA Inspection</span>
          <div className="field-row">
            <div className="field-group">
              <label className="field-label">Last inspection date</label>
              <input
                className="admin-input"
                type="date"
                value={data.tdaInspectionDate}
                onChange={e => update('tdaInspectionDate', e.target.value)}
              />
            </div>
            <div className="field-group">
              <label className="field-label">Result</label>
              <select
                className="admin-input"
                value={data.tdaInspectionResult}
                onChange={e => update('tdaInspectionResult', e.target.value)}
              >
                {RESULT_OPTIONS.map(o => (
                  <option key={o} value={o}>{o || '— select —'}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* USDA Inspection */}
        <div className="compliance-card">
          <span className="compliance-card-label">USDA Inspection</span>
          <div className="field-row">
            <div className="field-group">
              <label className="field-label">Last inspection date</label>
              <input
                className="admin-input"
                type="date"
                value={data.usdaInspectionDate}
                onChange={e => update('usdaInspectionDate', e.target.value)}
              />
            </div>
            <div className="field-group">
              <label className="field-label">Result</label>
              <select
                className="admin-input"
                value={data.usdaInspectionResult}
                onChange={e => update('usdaInspectionResult', e.target.value)}
              >
                {RESULT_OPTIONS.map(o => (
                  <option key={o} value={o}>{o || '— select —'}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
