import { useState } from 'react'
import { Routes, Route, Link } from 'react-router-dom'
import './App.css'
import Dashboard from './components/Dashboard.jsx'
import ContentStudio from './components/ContentStudio.jsx'
import Onboarding, { ONBOARDING_KEY } from './components/Onboarding.jsx'
import AdminSettings from './components/admin/AdminSettings.jsx'

const TABS = ['Dashboard', 'Content studio']

function MainApp() {
  const [activeTab, setActiveTab] = useState('Dashboard')
  const [showOnboarding, setShowOnboarding] = useState(
    () => !localStorage.getItem(ONBOARDING_KEY)
  )

  return (
    <>
      {showOnboarding && (
        <Onboarding onComplete={() => setShowOnboarding(false)} />
      )}

      <div className="topbar">
        <span className="brand">
          Southern<span className="brand-ridge">Ridge</span>
        </span>
        <nav className="tabs">
          {TABS.map(tab => (
            <button
              key={tab}
              className={`tab${activeTab === tab ? ' active' : ''}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </button>
          ))}
        </nav>
        <button
          className="help-btn"
          title="Show intro"
          onClick={() => setShowOnboarding(true)}
        >
          ?
        </button>
      </div>

      <main className="main-content">
        {activeTab === 'Dashboard' && (
          <Dashboard onSwitchToStudio={() => setActiveTab('Content studio')} />
        )}
        {activeTab === 'Content studio' && <ContentStudio />}
      </main>
    </>
  )
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<MainApp />} />
      <Route path="/admin" element={<AdminSettings />} />
    </Routes>
  )
}
