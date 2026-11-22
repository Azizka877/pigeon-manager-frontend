'use client'

// app/(dashboard)/pigeons/[id]/pedigree/page.tsx — Pedigree imprimable.
// Arbre sur 3 générations : le sujet porte sa VRAIE photo (banque
// lib/pigeon-cage-images.ts, la même que dans la volière et la fiche détail),
// les ascendants inconnus restent clairement marqués « Non enregistré ».
// Connecteurs recalculés au cordeau (jonctions exactes) et styles
// d'impression AUTONOMES : aucun ajout de CSS global n'est nécessaire.

import { useParams } from 'next/navigation'
import Link from 'next/link'
import { useState } from 'react'
import { usePigeon } from '@/hooks/use-pigeons'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { ArrowLeft, Printer, Download, Share2, Bird } from 'lucide-react'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import { telechargerPedigreePdf } from '@/hooks/use-genetique'
import { PigeonPhoto } from '@/components/pigeons/pigeon-photo'

// Styles d'impression embarqués dans la page (fonctionne même sans
// modification de globals.css) : masque la navigation, garde les couleurs.
const CSS_IMPRESSION = `
  @media print {
    .no-print { display: none !important; }
    body { background: #ffffff !important; }
    .pedigree-imprimable { box-shadow: none !important; border: 0 !important; }
  }
  @page { margin: 12mm; }
`

/** pere / mere peuvent être un matricule (string), un id (number) ou null. */
function matriculeParent(valeur?: string | number | null): string | null {
  if (valeur == null) return null
  const texte = String(valeur).trim()
  return texte === '' ? null : texte
}

export default function PedigreePage() {
  const params = useParams()
  const { data: pigeon, isLoading } = usePigeon(params.id as string)
  const [isExporting, setIsExporting] = useState(false)

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-[#00685f]" />
      </div>
    )
  }

  if (!pigeon) {
    return (
      <Card className="mx-auto max-w-md p-10 text-center">
        <Bird className="mx-auto mb-3 h-10 w-10 text-gray-300" />
        <p className="font-medium text-gray-900">Pigeon non trouvé</p>
        <p className="mt-1 text-sm text-gray-500">Ce pigeon n&apos;existe pas ou a été supprimé.</p>
        <Link href="/pigeons" className="mt-5 inline-block">
          <Button variant="outline">Retour aux pigeons</Button>
        </Link>
      </Card>
    )
  }

  const pere = matriculeParent(pigeon.pere)
  const mere = matriculeParent(pigeon.mere)

  // Impression (destination « PDF » proposée par la boîte de dialogue)
  const handlePrint = () => window.print()

  const handleExportPDF = async () => {
    setIsExporting(true)
    try {
      await telechargerPedigreePdf(pigeon.id, pigeon.matricule)
      toast.success('PDF officiel téléchargé (QR inclus)')
    } catch {
      toast.error('Erreur lors de l\'export')
    } finally {
      setIsExporting(false)
    }
  }

  const handleShare = async () => {
    const shareData = {
      title: `Pedigree - ${pigeon.matricule}`,
      text: `Consultez le pedigree de ${pigeon.matricule} (${pigeon.race})`,
      url: window.location.href,
    }
    if (navigator.share) {
      try {
        await navigator.share(shareData)
        toast.success('Partage ouvert')
      } catch {
        // L'utilisateur a annulé
      }
    } else {
      try {
        await navigator.clipboard.writeText(window.location.href)
        toast.success('Lien copié dans le presse-papiers')
      } catch {
        toast.error('Impossible de copier le lien')
      }
    }
  }

  return (
    <div className="space-y-6">
      <style>{CSS_IMPRESSION}</style>

      {/* Header */}
      <div className="flex flex-col gap-4 no-print sm:flex-row sm:items-end sm:justify-between">
        <div>
          <Link href={`/pigeons/${pigeon.id}`} className="mb-2 inline-block">
            <Button variant="ghost" className="gap-2 pl-0 text-gray-500">
              <ArrowLeft className="h-4 w-4" />
              Retour au pigeon
            </Button>
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Pedigree</h1>
          <p className="mt-1 text-gray-500">
            Arbre généalogique de{' '}
            <span className="font-mono font-medium text-gray-700">{pigeon.matricule}</span>
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button variant="outline" className="gap-2" onClick={handlePrint}>
            <Printer className="h-4 w-4" />
            Imprimer
          </Button>
          <Button variant="outline" className="gap-2" onClick={handleExportPDF} disabled={isExporting}>
            <Download className="h-4 w-4" />
            {isExporting ? 'Génération…' : 'Exporter PDF'}
          </Button>
          <Button variant="outline" className="gap-2" onClick={handleShare}>
            <Share2 className="h-4 w-4" />
            Partager
          </Button>
        </div>
      </div>

      {/* Carte imprimable */}
      <Card className="pedigree-imprimable p-6 sm:p-8">
        {/* En-tête visible uniquement à l'impression */}
        <div className="mb-8 hidden text-center print:block">
          <h2 className="text-2xl font-bold text-gray-900">PigeonManager</h2>
          <p className="text-gray-500">Pedigree officiel</p>
          <p className="mt-1 text-sm text-gray-400">
            Généré le {new Date().toLocaleDateString('fr-FR')}
          </p>
        </div>

        <div className="overflow-x-auto">
          <div className="mx-auto w-full min-w-[640px] max-w-3xl">
            {/* Niveau 0 — sujet (avec sa vraie photo) */}
            <div className="flex flex-col items-center">
              <CarteArbre
                matricule={pigeon.matricule}
                race={pigeon.race}
                sexe={pigeon.sexe === 'F' ? 'F' : 'M'}
                photoId={pigeon.id}
                estPrincipal
              />
              <TraitVertical />
            </div>

            {/* Barre sujet → parents (jonction exacte au centre de la grille) */}
            <div className="grid grid-cols-2 gap-6">
              <DemiBarre cote="gauche" />
              <DemiBarre cote="droite" />
            </div>

            {/* Niveau 1 — parents */}
            <div className="grid grid-cols-2 gap-6">
              <ColonneArbre role="Père" matricule={pere} sexe="M" avecDescendance />
              <ColonneArbre role="Mère" matricule={mere} sexe="F" avecDescendance />
            </div>

            {/* Barres parents → grands-parents (une demi-barre par couple) */}
            <div className="grid grid-cols-4 gap-6">
              <DemiBarre cote="gauche" />
              <DemiBarre cote="droite" />
              <DemiBarre cote="gauche" />
              <DemiBarre cote="droite" />
            </div>

            {/* Niveau 2 — grands-parents */}
            <div className="grid grid-cols-4 gap-6">
              <ColonneArbre role="Grand-père paternel" sexe="M" estPetit />
              <ColonneArbre role="Grand-mère paternelle" sexe="F" estPetit />
              <ColonneArbre role="Grand-père maternel" sexe="M" estPetit />
              <ColonneArbre role="Grand-mère maternelle" sexe="F" estPetit />
            </div>
          </div>
        </div>

        {/* Pied de page visible uniquement à l'impression */}
        <div className="mt-8 hidden border-t border-gray-200 pt-4 text-center text-sm text-gray-400 print:block">
          Document généré par PigeonManager • {pigeon.matricule}
        </div>
      </Card>

      {/* Informations complémentaires */}
      <div className="grid gap-6 no-print sm:grid-cols-2">
        <CarteBilan
          titre="Performances"
          lignes={[
            { label: 'Courses disputées', valeur: 0 },
            { label: 'Victoires', valeur: 0 },
            { label: 'Top 10', valeur: 0 },
          ]}
        />
        <CarteBilan
          titre="Reproduction"
          lignes={[
            { label: 'Couples formés', valeur: 0 },
            { label: 'Descendants', valeur: 0 },
            { label: 'Pontes', valeur: 0 },
          ]}
        />
      </div>
    </div>
  )
}

// ── Connecteurs ──────────────────────────────────────────────────────────────
// Géométrie exacte : toutes les grilles partagent le même gap (gap-6 =
// 1,5 rem). Chaque demi-barre va du centre de sa carte à la jonction centrale
// du couple en DÉBORDANT de g/2 (0,75 rem) dans la gouttière — les traits
// se rejoignent donc au pixel près, quel que soit l'écran.

/** Trait vertical standard (remontée ou descente d'une carte). */
function TraitVertical() {
  return <div className="h-6 w-px bg-gray-300" />
}

/**
 * Demi-barre horizontale : du centre de la cellule jusqu'au point de jonction
 * du couple (centre de la gouttière entre les deux cartes sœurs).
 */
function DemiBarre({ cote }: { cote: 'gauche' | 'droite' }) {
  return (
    <div className="relative h-px w-full">
      {cote === 'gauche' ? (
        <>
          <div className="absolute left-1/2 right-[-0.75rem] top-0 h-px bg-gray-300" />
          {/* point de jonction */}
          <div className="absolute right-[-0.75rem] top-0 h-1.5 w-1.5 translate-x-1/2 -translate-y-1/2 rounded-full bg-gray-400" />
        </>
      ) : (
        <div className="absolute left-[-0.75rem] right-1/2 top-0 h-px bg-gray-300" />
      )}
    </div>
  )
}

/** Colonne d'un ascendant : remontée + carte (+ descente s'il a des parents). */
function ColonneArbre(props: {
  role?: string
  matricule?: string | null
  sexe: 'M' | 'F'
  estPetit?: boolean
  avecDescendance?: boolean
}) {
  return (
    <div className="flex flex-col items-center">
      <TraitVertical />
      <CarteArbre {...props} />
      {props.avecDescendance && <TraitVertical />}
    </div>
  )
}

// ── Carte d'un pigeon dans l'arbre ───────────────────────────────────────────

function CarteArbre({
  matricule,
  race,
  sexe,
  role,
  photoId,
  estPrincipal = false,
  estPetit = false,
}: {
  matricule?: string | null
  race?: string | null
  sexe: 'M' | 'F'
  role?: string
  photoId?: string | null
  estPrincipal?: boolean
  estPetit?: boolean
}) {
  const connu = matricule != null
  return (
    <div
      className={cn(
        'relative mx-auto rounded-xl border-2 p-4 text-center transition-all hover:shadow-lg',
        estPrincipal
          ? 'w-full max-w-[260px] border-[#00685f] bg-[#f5faf8] shadow-md shadow-[#00685f]/10'
          : estPetit
            ? 'w-full max-w-[190px] border-gray-200 bg-white'
            : 'w-full max-w-[220px] border-gray-200 bg-white',
      )}
    >
      {estPrincipal && (
        <span className="absolute -top-2.5 right-4 rounded-full bg-[#00685f] px-2.5 py-0.5 text-[11px] font-semibold text-white shadow">
          Sujet
        </span>
      )}

      {photoId && connu ? (
        <PigeonPhoto
          pigeonId={photoId}
          matricule={matricule}
          sexe={sexe}
          className={cn(
            'mx-auto mb-2 rounded-full ring-1 ring-[#00685f]/25',
            estPrincipal ? 'h-16 w-16' : 'h-14 w-14',
          )}
          fallbackClassName="text-xs"
        />
      ) : (
        <div
          className={cn(
            'mx-auto mb-2 flex items-center justify-center rounded-full border',
            connu
              ? sexe === 'M'
                ? 'border-blue-200 bg-blue-50 text-blue-500'
                : 'border-pink-200 bg-pink-50 text-pink-500'
              : 'border-gray-200 bg-gray-50 text-gray-300',
            estPrincipal ? 'h-16 w-16' : estPetit ? 'h-11 w-11' : 'h-14 w-14',
          )}
        >
          <Bird className={cn(estPrincipal ? 'h-7 w-7' : estPetit ? 'h-4 w-4' : 'h-5 w-5')} />
        </div>
      )}

      {role && (
        <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-gray-400">{role}</p>
      )}
      <p
        className={cn(
          'truncate font-mono font-medium',
          connu ? 'text-gray-900' : 'text-gray-400',
          estPrincipal ? 'text-lg' : estPetit ? 'text-xs' : 'text-sm',
        )}
      >
        {connu ? matricule : 'Non enregistré'}
      </p>
      <p className="mt-0.5 truncate text-xs text-gray-500">
        {race || (connu ? 'Race non renseignée' : 'À compléter')}
      </p>
      <span
        className={cn(
          'mt-2 inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold',
          sexe === 'M' ? 'bg-blue-50 text-blue-600' : 'bg-pink-50 text-pink-600',
        )}
      >
        {sexe === 'M' ? '♂ Mâle' : '♀ Femelle'}
      </span>
    </div>
  )
}

// ── Bilans chiffrés ──────────────────────────────────────────────────────────

function CarteBilan({
  titre,
  lignes,
}: {
  titre: string
  lignes: { label: string; valeur: string | number }[]
}) {
  return (
    <Card className="p-6">
      <h3 className="mb-4 text-lg font-semibold text-gray-900">{titre}</h3>
      <div className="space-y-3">
        {lignes.map((ligne) => (
          <div
            key={ligne.label}
            className="flex items-center justify-between border-b border-dashed border-gray-100 pb-2.5 last:border-0 last:pb-0"
          >
            <span className="text-sm text-gray-500">{ligne.label}</span>
            <span className="text-sm font-semibold text-gray-900">{ligne.valeur}</span>
          </div>
        ))}
      </div>
    </Card>
  )
}