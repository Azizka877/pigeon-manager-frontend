// app/test/page.tsx
'use client'

import { useEffect, useState } from 'react'

export default function TestPage() {
  const [data, setData] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchCages = async () => {
      const token = localStorage.getItem('access_token')
      
      
      try {
        const response = await fetch('http://localhost:8000/api/cages/', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        })
        
        
        const json = await response.json()
        
        setData(json)
      } catch (err: any) {
        console.error('🔵 Error:', err)
        setError(err.message)
      }
    }
    
    fetchCages()
  }, [])

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Test API</h1>
      
      {error && (
        <div className="bg-red-100 text-red-700 p-4 rounded mb-4">
          Erreur: {error}
        </div>
      )}
      
      {data && (
        <div className="bg-green-100 p-4 rounded">
          <pre className="whitespace-pre-wrap">
            {JSON.stringify(data, null, 2)}
          </pre>
        </div>
      )}
    </div>
  )
}