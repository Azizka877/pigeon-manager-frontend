// app/login/page.tsx - Version avec image de fond
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const router = useRouter()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    
    try {
      const response = await fetch('http://localhost:8000/api/token/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      })
      
      const data = await response.json()
      
      if (response.ok && data.access) {
        localStorage.setItem('access_token', data.access)
        localStorage.setItem('refresh_token', data.refresh)
        router.push('/cages')
      } else {
        setError('Identifiants incorrects')
      }
    } catch (err) {
      setError('Erreur de connexion au serveur')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Image de fond */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: 'url("https://images.unsplash.com/photo-1517420704952-d9f39e95b43e?q=80&w=2070&auto=format")',
          filter: 'brightness(0.7)'
        }}
      />
      
      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-blue-900/40" />

      {/* Contenu */}
      <div className="relative min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {/* Carte de connexion glassmorphique */}
          <div className="backdrop-blur-xl bg-white/10 rounded-2xl shadow-2xl p-8 border border-white/20">
            <div className="text-center mb-8">
              <div className="bg-white/20 backdrop-blur-sm w-20 h-20 rounded-2xl mx-auto mb-4 flex items-center justify-center">
                <span className="text-4xl">🐦</span>
              </div>
              <h1 className="text-3xl font-bold text-white mb-2">Volière Manager</h1>
              <p className="text-blue-100 text-sm">Gestion professionnelle de colombophilie</p>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-500/20 backdrop-blur border border-red-400/50 rounded-xl text-white text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-5">
              <div>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/60 focus:ring-2 focus:ring-white/50 focus:border-transparent outline-none transition"
                  placeholder="Nom d'utilisateur"
                  required
                />
              </div>

              <div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/60 focus:ring-2 focus:ring-white/50 focus:border-transparent outline-none transition"
                  placeholder="Mot de passe"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-white text-gray-800 py-3 rounded-xl font-semibold hover:bg-gray-100 transition shadow-lg backdrop-blur-sm"
              >
                {loading ? 'Connexion...' : 'Se connecter'}
              </button>
            </form>

            <div className="mt-6 text-center text-white/60 text-xs">
              <p>Application de gestion de volière - Version 1.0</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}