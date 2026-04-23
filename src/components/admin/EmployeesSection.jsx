import './AdminSection.css'

export default function EmployeesSection({ employees }) {
  const farmTotal = employees.list
    .filter(e => e.active && e.classification === 'farm')
    .reduce((s, e) => s + (Number(e.annualWages) || 0), 0)

  const retailTotal = employees.list
    .filter(e => e.active && e.classification === 'retail')
    .reduce((s, e) => s + (Number(e.annualWages) || 0), 0)

  return (
    <section className="admin-section">
      <div className="admin-section-header">
        <h2 className="admin-section-title">Employees</h2>
        <button className="admin-add-btn" onClick={employees.add}>+ Add employee</button>
      </div>

      <div className="employees-hint">
        Classification determines which payroll form is used:
        Farm → Form 943 (annual) · Retail → Form 941 (quarterly)
      </div>

      {employees.list.length === 0 && (
        <p className="admin-empty">No employees added yet.</p>
      )}

      {employees.list.length > 0 && (
        <div className="employees-table-wrap">
          <table className="employees-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Classification</th>
                <th>Annual wages ($)</th>
                <th>Active</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {employees.list.map(emp => (
                <tr key={emp.id} className={emp.active ? '' : 'row-inactive'}>
                  <td>
                    <input
                      className="admin-input"
                      value={emp.name}
                      placeholder="Full name"
                      onChange={e => employees.update(emp.id, 'name', e.target.value)}
                    />
                  </td>
                  <td>
                    <select
                      className="admin-input"
                      value={emp.classification}
                      onChange={e => employees.update(emp.id, 'classification', e.target.value)}
                    >
                      <option value="farm">Farm (943)</option>
                      <option value="retail">Retail (941)</option>
                    </select>
                  </td>
                  <td>
                    <input
                      className="admin-input"
                      type="number"
                      min="0"
                      value={emp.annualWages}
                      onChange={e => employees.update(emp.id, 'annualWages', Number(e.target.value))}
                    />
                  </td>
                  <td className="td-center">
                    <input
                      type="checkbox"
                      className="admin-toggle"
                      checked={emp.active}
                      onChange={e => employees.update(emp.id, 'active', e.target.checked)}
                    />
                  </td>
                  <td className="td-center">
                    <button
                      className="admin-delete-btn"
                      title="Remove employee"
                      onClick={() => employees.delete(emp.id)}
                    >
                      ✕
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {employees.list.some(e => e.active) && (
        <div className="employees-totals">
          <span>Farm wages (Form 943): <strong>${farmTotal.toLocaleString()}</strong></span>
          <span>Retail wages (Form 941): <strong>${retailTotal.toLocaleString()}</strong></span>
        </div>
      )}
    </section>
  )
}
