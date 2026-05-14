'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useCreateCage } from '@/hooks/use-cages'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Home, ArrowLeft, Save, MapPin } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'

export default function NewCagePage() {
  const router = useRouter()
  const createCage = useCreateCage()

  const [formData, setFormData] = useState({
    numero: '',
    nom: '',
    superficie: '',
    position_x: '0',
    position_y: '0',
  })

  const [errors, setErrors] = useState({} as Record<string, string>)

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    
    if (errors[field]) {
      setErrors(prev => {
        const { [field]: _, ...rest } = prev
        return rest as Record<string, string>
      })
    }
  }

  const validate = () => {
    const newErrors: Record<string, string> = {}
    if (!formData.numero.trim()) {
      newErrors.numero = 'Le numéro est obligatoire'
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return

    try {
      await createCage.mutateAsync({
        numero: formData.numero.trim(),
        nom: formData.nom.trim() || null,
        superficie: formData.superficie.trim() || '0',
        position_x: parseFloat(formData.position_x) || 0,
        position_y: parseFloat(formData.position_y) || 0,
        est_active: true,
      })
      
      toast.success('Cage créée avec succès')
      router.push('/cages')
    } catch (err: any) {
      console.error('Erreur création cage:', err)
      toast.error(err.response?.data?.detail || 'Erreur lors de la création')
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/cages">
          <Button variant="ghost" size="icon" className="rounded-full">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-on-surface">Nouvelle Cage</h1>
          <p className="text-on-surface-variant">Ajoutez une cage à votre volière</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Formulaire */}
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit}>
            <Card className="border-outline-variant/50">
              <CardHeader className="bg-surface-container-low/50">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Home className="w-5 h-5 text-primary" />
                  Informations de la cage
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6 pt-6">
                {/* Ligne 1 : Numéro + Nom */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="numero" className="text-xs font-semibold uppercase tracking-wider">
                      Numéro <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="numero"
                      placeholder="Ex: A03, B05..."
                      value={formData.numero}
                      onChange={(e) => handleChange('numero', e.target.value)}
                      className={errors.numero ? 'border-destructive' : ''}
                    />
                    {errors.numero && (
                      <p className="text-sm text-destructive">{errors.numero}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="nom" className="text-xs font-semibold uppercase tracking-wider">
                      Nom (optionnel)
                    </Label>
                    <Input
                      id="nom"
                      placeholder="Ex: Cage principale..."
                      value={formData.nom}
                      onChange={(e) => handleChange('nom', e.target.value)}
                    />
                  </div>
                </div>

                {/* Superficie */}
                <div className="space-y-2">
                  <Label htmlFor="superficie" className="text-xs font-semibold uppercase tracking-wider">
                    Superficie (m²)
                  </Label>
                  <div className="relative">
                    <Input
                      id="superficie"
                      type="number"
                      step="0.01"
                      placeholder="Ex: 1.50"
                      value={formData.superficie}
                      onChange={(e) => handleChange('superficie', e.target.value)}
                      className="pr-12"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-on-surface-variant">
                      m²
                    </span>
                  </div>
                </div>

                {/* Positions */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="position_x" className="text-xs font-semibold uppercase tracking-wider flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      Position X
                    </Label>
                    <Input
                      id="position_x"
                      type="number"
                      placeholder="0"
                      value={formData.position_x}
                      onChange={(e) => handleChange('position_x', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="position_y" className="text-xs font-semibold uppercase tracking-wider flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      Position Y
                    </Label>
                    <Input
                      id="position_y"
                      type="number"
                      placeholder="0"
                      value={formData.position_y}
                      onChange={(e) => handleChange('position_y', e.target.value)}
                    />
                  </div>
                </div>

                {/* Boutons */}
                <div className="flex gap-3 pt-4 border-t border-outline-variant/30">
                  <Link href="/cages" className="flex-1">
                    <Button type="button" variant="outline" className="w-full">
                      Annuler
                    </Button>
                  </Link>
                  <Button 
                    type="submit" 
                    className="flex-1 gap-2"
                    disabled={createCage.isPending}
                  >
                    <Save className="w-4 h-4" />
                    {createCage.isPending ? 'Création...' : 'Créer la cage'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </form>
        </div>

        {/* Sidebar : Aide + Preview */}
        <div className="space-y-6">
          {/* Aide au placement */}
          <Card className="border-outline-variant/50 bg-surface-container-low/30">
            <CardContent className="p-6 space-y-3">
              <h3 className="text-sm font-semibold text-primary uppercase tracking-wider">
                Aide au placement
              </h3>
              <p className="text-sm text-on-surface-variant leading-relaxed">
                Les coordonnées X et Y permettent d'organiser vos cages sur le plan interactif de votre volière.
              </p>
            </CardContent>
          </Card>

          {/* Preview */}
          <Card className="border-outline-variant/50">
            <CardContent className="p-6">
              <div className="border-2 border-dashed border-primary/20 rounded-xl p-8 flex items-center justify-center bg-surface-container-low min-h-[200px]">
                <div className="text-center space-y-2">
                  <Home className="w-12 h-12 text-primary/30 mx-auto" />
                  <p className="text-sm font-medium text-primary/50 uppercase tracking-wider">
                    Nouvelle<br/>Cage
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}