'use client'

import Image from 'next/image'
import { useAuthStore } from '@/stores/auth-store'
import { QuickActions } from '@/components/dashboard/quick-actions'

export function WelcomeBanner() {
  const user = useAuthStore((s) => s.user)

  const dateDuJour = new Intl.DateTimeFormat('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date())

  return (
    <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#00685f] via-[#005651] to-[#01352f] p-6 text-white md:p-8">
      {/* Décor : halos doux */}
      <div className="pointer-events-none absolute -right-16 -top-24 h-64 w-64 rounded-full bg-white/5" />
      <div className="pointer-events-none absolute -bottom-32 right-48 h-72 w-72 rounded-full bg-white/5" />
      <div className="pointer-events-none absolute left-1/2 top-0 h-px w-2/3 bg-gradient-to-r from-transparent via-white/20 to-transparent" />

      {/* Pigeon décoratif */}
      <div className="pm-flotte pointer-events-none absolute right-8 top-6 hidden opacity-90 lg:block">
        <Image
          src="/pigeon-vol.png"
          alt=""
          width={112}
          height={124}
          loading="eager"
          className="drop-shadow-2xl"
          draggable={false}
        />
      </div>

      <div className="relative max-w-2xl">
        <p className="text-sm capitalize text-white/70">{dateDuJour}</p>
        <h2 className="mt-1 text-2xl font-bold md:text-3xl">
          Bonjour, {user?.username ?? 'éleveur'}
        </h2>
        <p className="mt-1 text-sm text-white/70">
          Voici l'état de votre volière aujourd'hui.
        </p>
        <div className="mt-6">
          <QuickActions variante="sombre" />
        </div>
      </div>
    </section>
  )
}