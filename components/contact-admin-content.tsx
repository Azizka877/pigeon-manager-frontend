// components/contact-admin-content.tsx
'use client'

import { useSearchParams } from 'next/navigation'
import { Mail, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export function ContactAdminContent() {
  const searchParams = useSearchParams()
  const reason = searchParams.get('reason')

  const titles: Record<string, string> = {
    password: 'Réinitialisation de mot de passe',
    account: "Demande d'accès",
  }

  const descriptions: Record<string, string> = {
    password: "Pour réinitialiser votre mot de passe, contactez l'administrateur système.",
    account: "La création de compte est réservée aux administrateurs. Contactez l'administrateur pour obtenir vos identifiants.",
  }

  return (
    <div className="w-full max-w-[420px] bg-white rounded-2xl shadow-sm border border-gray-200/60 p-8 md:p-10 text-center">
      <div className="w-14 h-14 rounded-xl bg-[#00685f]/10 flex items-center justify-center mx-auto mb-4">
        <Mail className="w-7 h-7 text-[#00685f]" />
      </div>
      
      <h1 className="text-xl font-semibold text-gray-900 mb-2">
        {titles[reason || 'account']}
      </h1>
      
      <p className="text-sm text-gray-500 mb-6">
        {descriptions[reason || 'account']}
      </p>

      <div className="space-y-3">
        <a 
          href="mailto:admin@pigeon-manager.local"
          className="inline-flex items-center justify-center w-full bg-[#00685f] hover:bg-[#00554d] text-white py-2.5 rounded-lg font-medium text-sm transition-all"
        >
          <Mail className="w-4 h-4 mr-2" />
          Contacter l'administrateur
        </a>
        
        <Link 
          href="/login"
          className="inline-flex items-center justify-center w-full text-sm text-gray-500 hover:text-[#00685f] transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Retour à la connexion
        </Link>
      </div>
    </div>
  )
}