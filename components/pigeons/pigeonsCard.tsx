import { Calendar, Eye, Link, Palette, Pencil, Tag } from "lucide-react";
import { Button } from "../ui/button";
import { Pigeon } from "@/types";
import { Badge } from "../ui/badge";



export  function getBadgeStatut(statut: string) {
  switch (statut) {
    case 'actif':
      return <Badge className="bg-[#00685f] text-white hover:bg-[#00685f]">ACTIF</Badge>
    case 'vendu':
      return <Badge className="bg-[#fee2e2] text-[#991b1b] hover:bg-[#fee2e2]">VENDU</Badge>
    case 'mort':
      return <Badge className="bg-gray-200 text-gray-700 hover:bg-gray-200">DÉCÉDÉ</Badge>
    case 'perdu':
      return <Badge className="bg-[#ffedd5] text-[#9a3412] hover:bg-[#ffedd5]">PERDU</Badge>
    default:
      return <Badge className="bg-gray-100 text-gray-600">INCONNU</Badge>
  }
}


export default function PigeonCard({ pigeon }: { pigeon: Pigeon }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <code className="bg-gray-100 px-2 py-1 rounded text-sm font-mono text-gray-700">
          {pigeon.matricule}
        </code>
        {getBadgeStatut(pigeon.statut)}
      </div>
      
      {/* Infos */}
      <div className="grid grid-cols-2 gap-3 text-sm">
        <div className="flex items-start gap-2">
          <Tag className="w-4 h-4 text-gray-400 mt-0.5" />
          <div>
            <p className="text-gray-500 text-xs">Race</p>
            <p className="font-medium text-gray-900">{pigeon.race || '-'}</p>
          </div>
        </div>
        <div className="flex items-start gap-2">
          <Palette className="w-4 h-4 text-gray-400 mt-0.5" />
          <div>
            <p className="text-gray-500 text-xs">Couleur</p>
            <p className="font-medium text-gray-900">{pigeon.couleur || '-'}</p>
          </div>
        </div>
        <div className="flex items-start gap-2">
          <span className="text-gray-400 text-lg leading-none">♂♀</span>
          <div>
            <p className="text-gray-500 text-xs">Sexe</p>
            <p className="font-medium text-gray-900">
              {pigeon.sexe === 'M' ? '♂ Mâle' : pigeon.sexe === 'F' ? '♀ Femelle' : '?'}
            </p>
          </div>
        </div>
        <div className="flex items-start gap-2">
          <Calendar className="w-4 h-4 text-gray-400 mt-0.5" />
          <div>
            <p className="text-gray-500 text-xs">Âge</p>
            <p className="font-medium text-gray-900">
              {pigeon.age ? `${pigeon.age} an${pigeon.age > 1 ? 's' : ''}` : '-'}
            </p>
          </div>
        </div>
      </div>
      
      {/* Actions */}
      <div className="flex gap-2 pt-2 border-t">
        <Link href={`/pigeons/${pigeon.id}`} className="flex-1">
          <Button variant="outline" size="sm" className="w-full gap-1">
            <Eye className="w-3 h-3" /> Voir
          </Button>
        </Link>
        <Link href={`/pigeons/${pigeon.id}/edit`} className="flex-1">
          <Button variant="outline" size="sm" className="w-full gap-1">
            <Pencil className="w-3 h-3" /> Modifier
          </Button>
        </Link>
      </div>
    </div>
  )
}