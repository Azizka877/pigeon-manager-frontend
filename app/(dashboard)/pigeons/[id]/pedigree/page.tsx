'use client'

import { useParams } from 'next/navigation'
import { usePigeon } from '@/hooks/use-pigeons'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { ArrowLeft, Printer, Download, Share2 } from 'lucide-react'
import Link from 'next/link'
import { useRef, useState } from 'react'
import { toast } from 'sonner'

export default function PedigreePage() {
  const params = useParams()
  const { data: pigeon, isLoading } = usePigeon(params.id as string)
  const pedigreeRef = useRef<HTMLDivElement>(null)
  const [isExporting, setIsExporting] = useState(false)

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00685f]" />
      </div>
    )
  }

  if (!pigeon) {
    return <div className="p-6">Pigeon non trouvé</div>
  }

  // 🔧 IMPRESSION
  const handlePrint = () => {
    window.print()
  }

  // 🔧 EXPORT PDF (simulation avec print-to-PDF)
  const handleExportPDF = async () => {
    setIsExporting(true)
    try {
      // Ouvre la boîte de dialogue d'impression avec PDF comme destination
      window.print()
      toast.success('PDF généré')
    } catch {
      toast.error('Erreur lors de l\'export')
    } finally {
      setIsExporting(false)
    }
  }

  // 🔧 PARTAGER
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
      // Fallback : copier le lien dans le presse-papiers
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
      {/* Header */}
      <div className="flex items-center justify-between no-print">
        <div>
          <Link href={`/pigeons/${pigeon.id}`}>
            <Button variant="ghost" className="gap-2 text-gray-500 mb-4 pl-0">
              <ArrowLeft className="w-4 h-4" />
              Retour au pigeon
            </Button>
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Pedigree</h1>
          <p className="text-gray-500 mt-1">
            Arbre généalogique de {pigeon.matricule}
          </p>
        </div>
        
        <div className="flex gap-2">
          {/* 🔧 BOUTON IMPRIMER */}
          <Button 
            variant="outline" 
            className="gap-2"
            onClick={handlePrint}
          >
            <Printer className="w-4 h-4" />
            Imprimer
          </Button>

          {/* 🔧 BOUTON EXPORTER PDF */}
          <Button 
            variant="outline" 
            className="gap-2"
            onClick={handleExportPDF}
            disabled={isExporting}
          >
            <Download className="w-4 h-4" />
            {isExporting ? 'Génération...' : 'Exporter PDF'}
          </Button>

          {/* 🔧 BOUTON PARTAGER */}
          <Button 
            variant="outline" 
            className="gap-2"
            onClick={handleShare}
          >
            <Share2 className="w-4 h-4" />
            Partager
          </Button>
        </div>
      </div>

      {/* Contenu imprimable */}
      <div ref={pedigreeRef} className="print-content">
        <Card className="p-8">
          {/* En-tête du pedigree (visible uniquement à l'impression) */}
          <div className="hidden print:block mb-6 text-center">
            <h1 className="text-2xl font-bold text-gray-900">PigeonManager</h1>
            <p className="text-gray-500">Pedigree officiel</p>
            <p className="text-sm text-gray-400 mt-1">
              Généré le {new Date().toLocaleDateString('fr-FR')}
            </p>
          </div>

          <div className="flex justify-center">
            <div className="w-full max-w-4xl">
              {/* Niveau 0 - Pigeon actuel */}
              <div className="flex justify-center mb-8">
                <CartePigeon 
                  matricule={pigeon.matricule}
                  race={pigeon.race}
                  sexe={pigeon.sexe}
                  estPrincipal
                />
              </div>

              {/* Connecteur */}
              <div className="flex justify-center mb-8">
                <div className="w-px h-8 bg-gray-300" />
              </div>

              {/* Niveau 1 - Parents */}
              <div className="grid grid-cols-2 gap-16 mb-8">
                <div className="flex flex-col items-center">
                  <ConnecteurParent position="gauche" />
                  <CartePigeon 
                    matricule={typeof pigeon.pere === 'string' ? pigeon.pere : 'Père inconnu'}
                    race="Race inconnue"
                    sexe="M"
                  />
                </div>
                <div className="flex flex-col items-center">
                  <ConnecteurParent position="droite" />
                  <CartePigeon 
                    matricule={typeof pigeon.mere === 'string' ? pigeon.mere : 'Mère inconnue'}
                    race="Race inconnue"
                    sexe="F"
                  />
                </div>
              </div>

              {/* Connecteurs */}
              <div className="grid grid-cols-2 gap-16 mb-8">
                <div className="flex justify-center">
                  <div className="w-px h-8 bg-gray-300" />
                </div>
                <div className="flex justify-center">
                  <div className="w-px h-8 bg-gray-300" />
                </div>
              </div>

              {/* Niveau 2 - Grands-parents */}
              <div className="grid grid-cols-4 gap-8">
                <div className="flex flex-col items-center">
                  <ConnecteurParent position="gauche" />
                  <CartePigeon 
                    matricule="Grand-père paternel"
                    race="Inconnue"
                    sexe="M"
                    estPetit
                  />
                </div>
                <div className="flex flex-col items-center">
                  <ConnecteurParent position="droite" />
                  <CartePigeon 
                    matricule="Grand-mère paternelle"
                    race="Inconnue"
                    sexe="F"
                    estPetit
                  />
                </div>
                <div className="flex flex-col items-center">
                  <ConnecteurParent position="gauche" />
                  <CartePigeon 
                    matricule="Grand-père maternel"
                    race="Inconnue"
                    sexe="M"
                    estPetit
                  />
                </div>
                <div className="flex flex-col items-center">
                  <ConnecteurParent position="droite" />
                  <CartePigeon 
                    matricule="Grand-mère maternelle"
                    race="Inconnue"
                    sexe="F"
                    estPetit
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Pied de page (visible uniquement à l'impression) */}
          <div className="hidden print:block mt-8 pt-4 border-t border-gray-200 text-center text-sm text-gray-400">
            Document généré par PigeonManager • {pigeon.matricule}
          </div>
        </Card>
      </div>

      {/* Informations complémentaires */}
      <div className="grid grid-cols-2 gap-6 no-print">
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Performances</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-500">Courses disputées</span>
              <span className="font-medium">0</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Victoires</span>
              <span className="font-medium">0</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Top 10</span>
              <span className="font-medium">0</span>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Reproduction</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-500">Couples formés</span>
              <span className="font-medium">0</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Descendants</span>
              <span className="font-medium">0</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Pontes</span>
              <span className="font-medium">0</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}

function CartePigeon({ 
  matricule, 
  race, 
  sexe, 
  estPrincipal = false,
  estPetit = false
}: { 
  matricule: string
  race: string
  sexe: string
  estPrincipal?: boolean
  estPetit?: boolean
}) {
  return (
    <div className={`
      relative border-2 rounded-xl p-4 text-center transition-all hover:shadow-lg cursor-pointer
      ${estPrincipal 
        ? 'border-[#00685f] bg-[#f5faf8] w-64' 
        : estPetit 
          ? 'border-gray-200 bg-white w-48' 
          : 'border-gray-200 bg-white w-56'
      }
    `}>
      <div className={`
        w-12 h-12 rounded-full mx-auto mb-2 flex items-center justify-center
        ${sexe === 'M' ? 'bg-blue-100 text-blue-600' : 'bg-pink-100 text-pink-600'}
      `}>
        <span className="text-xl">{sexe === 'M' ? '♂' : '♀'}</span>
      </div>
      
      <p className={`
        font-mono font-medium text-gray-900 mb-1
        ${estPrincipal ? 'text-lg' : 'text-sm'}
      `}>
        {matricule}
      </p>
      
      <p className="text-xs text-gray-500">{race}</p>
      
      {estPrincipal && (
        <div className="absolute -top-2 -right-2 bg-[#00685f] text-white text-xs px-2 py-1 rounded-full">
          Sujet
        </div>
      )}
    </div>
  )
}

function ConnecteurParent({ position }: { position: 'gauche' | 'droite' }) {
  return (
    <div className="relative w-full h-8 mb-2">
      <div className="absolute top-0 left-1/2 w-px h-4 bg-gray-300 -translate-x-1/2" />
      <div className={`
        absolute top-4 h-px bg-gray-300
        ${position === 'gauche' ? 'left-1/2 right-0' : 'left-0 right-1/2'}
      `} />
      <div className="absolute top-4 w-2 h-2 rounded-full bg-gray-300 left-1/2 -translate-x-1/2" />
    </div>
  )
}