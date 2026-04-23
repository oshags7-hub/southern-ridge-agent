import { useState, useCallback } from 'react'

const STORAGE_KEY = 'srm_business_data_v1'

const DEFAULT_DATA = {
  permits: [
    {
      id: 1,
      name: 'TDA Retail Meat Sales Permit',
      expiration: '',
      leadDays: 60,
      notes: 'Contact TDA Regulatory Services: 615-837-5100',
    },
    {
      id: 2,
      name: 'TDA Retail Food Store License',
      expiration: '',
      leadDays: 60,
      notes: 'Required if selling eggs, honey, or packaged goods alongside meat.',
    },
  ],
  employees: [
    { id: 1, name: '', classification: 'farm', annualWages: 0, active: true },
  ],
  compliance: {
    haccpReviewDate: '',
    herdshareCount: 0,
    tdaInspectionDate: '',
    tdaInspectionResult: '',
    usdaInspectionDate: '',
    usdaInspectionResult: '',
  },
}

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return DEFAULT_DATA
    return { ...DEFAULT_DATA, ...JSON.parse(raw) }
  } catch {
    return DEFAULT_DATA
  }
}

function save(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
}

let nextId = Date.now()
function uid() { return ++nextId }

export function useBusinessData() {
  const [data, setData] = useState(load)

  const update = useCallback((updater) => {
    setData(prev => {
      const next = updater(prev)
      save(next)
      return next
    })
  }, [])

  // --- Permits ---
  function addPermit() {
    update(d => ({
      ...d,
      permits: [...d.permits, { id: uid(), name: '', expiration: '', leadDays: 30, notes: '' }],
    }))
  }

  function updatePermit(id, field, value) {
    update(d => ({
      ...d,
      permits: d.permits.map(p => p.id === id ? { ...p, [field]: value } : p),
    }))
  }

  function deletePermit(id) {
    update(d => ({ ...d, permits: d.permits.filter(p => p.id !== id) }))
  }

  // --- Employees ---
  function addEmployee() {
    update(d => ({
      ...d,
      employees: [...d.employees, { id: uid(), name: '', classification: 'farm', annualWages: 0, active: true }],
    }))
  }

  function updateEmployee(id, field, value) {
    update(d => ({
      ...d,
      employees: d.employees.map(e => e.id === id ? { ...e, [field]: value } : e),
    }))
  }

  function deleteEmployee(id) {
    update(d => ({ ...d, employees: d.employees.filter(e => e.id !== id) }))
  }

  // --- Compliance ---
  function updateCompliance(field, value) {
    update(d => ({ ...d, compliance: { ...d.compliance, [field]: value } }))
  }

  return {
    data,
    permits: {
      list: data.permits,
      add: addPermit,
      update: updatePermit,
      delete: deletePermit,
    },
    employees: {
      list: data.employees,
      add: addEmployee,
      update: updateEmployee,
      delete: deleteEmployee,
    },
    compliance: {
      data: data.compliance,
      update: updateCompliance,
    },
  }
}
