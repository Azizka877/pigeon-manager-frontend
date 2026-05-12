'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/stores/auth-store'
import { Bird } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const { login } = useAuthStore()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    
    try {
      await login(username, password)
      router.push('/cages')
    } catch (err: any) {
      console.error('Login error:', err)
      const message = err?.response?.data?.detail 
        || err?.response?.data?.non_field_errors?.[0]
        || err?.message 
        || 'Erreur de connexion'
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#f0f4f3] flex items-center justify-center p-4">
      {/* Carte de connexion */}
      <div className="w-full max-w-[420px] bg-white rounded-2xl shadow-sm border border-gray-200/60 p-8 md:p-10">
        
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 rounded-xl bg-[#00685f] flex items-center justify-center mb-4">
            <Bird className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-semibold text-gray-900 tracking-tight">PigeonManager</h1>
          <p className="text-sm text-gray-500 mt-1.5">
            Connectez-vous pour gérer votre colombier
          </p>
        </div>

        {/* Erreur */}
        {error && (
          <div className="mb-5 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
            {error}
          </div>
        )}

        {/* Formulaire */}
        <form onSubmit={handleLogin} className="space-y-5">
          
          {/* Nom d'utilisateur */}
          <div className="space-y-1.5">
            <label htmlFor="username" className="block text-sm font-medium text-gray-700">
              Nom d'utilisateur
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="admin"
              className="w-full px-3.5 py-2.5 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#00685f]/20 focus:border-[#00685f] transition-all text-sm"
              required
            />
          </div>

          {/* Mot de passe */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Mot de passe
              </label>
              <button
                type="button"
                onClick={() => alert('Contactez l\'administrateur pour réinitialiser votre mot de passe.')}
                className="text-sm text-[#00685f] hover:text-[#00554d] font-medium transition-colors"
              >
                Mot de passe oublié ?
              </button>
            </div>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-3.5 py-2.5 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#00685f]/20 focus:border-[#00685f] transition-all text-sm"
              required
            />
          </div>

          {/* Se souvenir de moi */}
          <div className="flex items-center">
            <input
              id="remember"
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="w-4 h-4 rounded border-gray-300 text-[#00685f] focus:ring-[#00685f]/20 cursor-pointer"
            />
            <label htmlFor="remember" className="ml-2 text-sm text-gray-600 cursor-pointer select-none">
              Se souvenir de moi
            </label>
          </div>

          {/* Bouton connexion */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#00685f] hover:bg-[#00554d] text-white py-2.5 rounded-lg font-medium text-sm transition-all disabled:opacity-60 disabled:cursor-not-allowed shadow-sm"
          >
            {loading ? 'Connexion...' : 'Se connecter'}
          </button>
        </form>

        {/* Lien créer compte */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500">
            Pas encore de compte ?{' '}
            <button
              type="button"
              onClick={() => alert('Contactez l\'administrateur pour créer un compte.')}
              className="text-[#00685f] hover:text-[#00554d] font-medium transition-colors"
            >
              Créer un compte
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}