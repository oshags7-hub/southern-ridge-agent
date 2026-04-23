import { Link } from 'react-router-dom'
import { useBusinessData } from '../../hooks/useBusinessData.js'
import PermitsSection from './PermitsSection.jsx'
import EmployeesSection from './EmployeesSection.jsx'
import ComplianceSection from './ComplianceSection.jsx'
import './AdminSettings.css'

export default function AdminSettings() {
  const { permits, employees, compliance } = useBusinessData()

  return (
    <div className="admin-page">
      <div className="admin-topbar">
        <Link to="/" className="admin-back">← Dashboard</Link>
        <span className="admin-topbar-title">
          Settings <span className="admin-badge">Admin</span>
        </span>
      </div>

      <div className="admin-content">
        <PermitsSection permits={permits} />
        <EmployeesSection employees={employees} />
        <ComplianceSection compliance={compliance} />
      </div>
    </div>
  )
}
