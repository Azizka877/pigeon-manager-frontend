'use client'

import { Button } from '@/components/ui/button'
import { Bird, Home, Egg } from 'lucide-react'
import Link from 'next/link'

export function QuickActions() {
  return (
    <div className="flex flex-wrap gap-3">
      <Link href="/cages">
        <Button size="lg" className="gap-2">
          <Home className="w-4 h-4" />
          Voir la volière
        </Button>
      </Link>
      <Link href="/pigeons/new">
        <Button variant="outline" size="lg" className="gap-2">
          <Bird className="w-4 h-4" />
          Ajouter un pigeon
        </Button>
      </Link>
      <Link href="/reproductions/new">
        <Button variant="outline" size="lg" className="gap-2">
          <Egg className="w-4 h-4" />
          Nouvelle reproduction
        </Button>
      </Link>
    </div>
  )
}