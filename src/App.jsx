import { useState } from 'react'
import './App.css'
import Dashboard from './components/Dashboard.jsx'
import ContentStudio from './components/ContentStudio.jsx'

const TABS = ['Dashboard', 'Content studio']

export default function App() {
  const [activeTab, setActiveTab] = useState('Dashboard')

  return (
    <>
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
