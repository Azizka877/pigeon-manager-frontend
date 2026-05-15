// app/profile/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { 
  useAuth, 
  useUpdateProfile, 
  useChangePassword, 
  useDeleteAccount,
  useColombierConfig,
  useUpdateColombier,
  useBillingPlan,
  useBillingInvoices,
} from '@/hooks/use-auth'
import { 
  User, Building2, Bell, Lock, ShieldAlert, 
  Check, MapPin, Save, AlertTriangle, 
  Loader2, Eye, EyeOff, Trash2, CreditCard,
  FileText
} from 'lucide-react'
import { cn } from '@/lib/utils'

export default function ProfilePage() {
  const { user, isLoading: authLoading } = useAuth()
  const updateProfile = useUpdateProfile()
  const changePassword = useChangePassword()
  const deleteAccount = useDeleteAccount()
  const { data: colombierConfig, isLoading: colombierLoading } = useColombierConfig()
  const updateColombier = useUpdateColombier()
  const { data: plan, isLoading: planLoading } = useBillingPlan()
  const { data: invoicesData } = useBillingInvoices()

  const [activeTab, setActiveTab] = useState<'profile' | 'loft' | 'security' | 'billing'>('profile')

  const [formData, setFormData] = useState({
    prenom: '',
    nom: '',
    email: '',
    nomColombier: '',
    pays: 'Netherlands',
    ville: '',
    gps: '',
  })

  const [passwordData, setPasswordData] = useState({
    old_password: '',
    new_password: '',
    confirm_password: '',
  })

  const [showPassword, setShowPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)

  const [notifications, setNotifications] = useState({
    alertesReproduction: true,
    resumeHebdo: false,
  })

  const [deleteConfirm, setDeleteConfirm] = useState('')

  // Synchroniser avec les données API
  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        prenom: user.first_name || '',
        nom: user.last_name || '',
        email: user.email || '',
      }))
    }
  }, [user])

  useEffect(() => {
    if (colombierConfig) {
      setFormData(prev => ({
        ...prev,
        nomColombier: colombierConfig.nom || '',
        pays: colombierConfig.pays || 'Netherlands',
        ville: colombierConfig.ville || '',
        gps: colombierConfig.gps || '',
      }))
    }
  }, [colombierConfig])

  const handleSavePersonal = () => {
    updateProfile.mutate({
      first_name: formData.prenom,
      last_name: formData.nom,
    })
  }

  const handleSaveLoft = () => {
    updateColombier.mutate({
      nom: formData.nomColombier,
      pays: formData.pays,
      ville: formData.ville,
      gps: formData.gps || null,
    })
  }

  const handleChangePassword = () => {
    if (passwordData.new_password !== passwordData.confirm_password) {
      toast.error('Les mots de passe ne correspondent pas')
      return
    }
    if (passwordData.new_password.length < 8) {
      toast.error('Le mot de passe doit contenir au moins 8 caractères')
      return
    }
    changePassword.mutate({
      old_password: passwordData.old_password,
      new_password: passwordData.new_password,
    }, {
      onSuccess: () => {
        setPasswordData({ old_password: '', new_password: '', confirm_password: '' })
      }
    })
  }

  const handleDeleteAccount = () => {
    if (deleteConfirm !== user?.username) {
      toast.error('Veuillez taper votre nom d\'utilisateur pour confirmer')
      return
    }
    deleteAccount.mutate()
  }

  if (authLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-[#00685f]" />
      </div>
    )
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <p className="text-gray-500">Session expirée. Veuillez vous reconnecter.</p>
        <Button 
          onClick={() => window.location.href = '/login'}
          className="bg-[#00685f] hover:bg-[#00554d] text-white"
        >
          Se connecter
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Profil & Paramètres</h1>
        <p className="text-gray-500 mt-1">
          Gérez les détails de votre colombier, vos informations personnelles et les préférences.
        </p>
      </div>

      {/* Navigation par onglets */}
      <div className="flex gap-2 border-b border-gray-200">
        {[
          { key: 'profile', label: 'Profil', icon: User },
          { key: 'loft', label: 'Colombier', icon: Building2 },
          { key: 'security', label: 'Sécurité', icon: Lock },
          { key: 'billing', label: 'Facturation', icon: CreditCard },
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as any)}
            className={cn(
              'flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors',
              activeTab === tab.key
                ? 'border-[#00685f] text-[#00685f]'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            )}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Contenu */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          {activeTab === 'profile' && (
            <Card className="p-6">
              <div className="flex items-center gap-2 mb-6 text-[#00685f]">
                <User className="w-5 h-5" />
                <h2 className="text-lg font-semibold">Informations personnelles</h2>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="space-y-2">
                  <Label htmlFor="prenom">Prénom</Label>
                  <Input
                    id="prenom"
                    value={formData.prenom}
                    onChange={e => setFormData({ ...formData, prenom: e.target.value })}
                    placeholder="Votre prénom"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="nom">Nom</Label>
                  <Input
                    id="nom"
                    value={formData.nom}
                    onChange={e => setFormData({ ...formData, nom: e.target.value })}
                    placeholder="Votre nom"
                  />
                </div>
              </div>

              <div className="space-y-2 mb-4">
                <Label htmlFor="email">Adresse e-mail</Label>
                <Input id="email" type="email" value={formData.email} disabled className="bg-gray-50" />
                <p className="text-sm text-gray-500">
                  Contactez le support pour modifier votre adresse e-mail.
                </p>
              </div>

              <div className="flex justify-end">
                <Button 
                  onClick={handleSavePersonal}
                  disabled={updateProfile.isPending}
                  className="bg-[#00685f] hover:bg-[#00554d] text-white gap-2"
                >
                  {updateProfile.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  Enregistrer les modifications
                </Button>
              </div>
            </Card>
          )}

          {activeTab === 'loft' && (
            <Card className="p-6">
              <div className="flex items-center gap-2 mb-6 text-[#00685f]">
                <Building2 className="w-5 h-5" />
                <h2 className="text-lg font-semibold">Configuration du colombier</h2>
              </div>

              {colombierLoading ? (
                <div className="flex items-center justify-center h-32">
                  <Loader2 className="w-6 h-6 animate-spin text-[#00685f]" />
                </div>
              ) : (
                <>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="nomColombier">Nom du colombier</Label>
                      <Input
                        id="nomColombier"
                        value={formData.nomColombier}
                        onChange={e => setFormData({ ...formData, nomColombier: e.target.value })}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="pays">Pays</Label>
                        <select
                          id="pays"
                          className="w-full h-10 px-3 rounded-md border border-gray-200 bg-white text-sm"
                          value={formData.pays}
                          onChange={e => setFormData({ ...formData, pays: e.target.value })}
                        >
                          <option value="Netherlands">Pays-Bas</option>
                          <option value="Belgium">Belgique</option>
                          <option value="France">France</option>
                          <option value="Germany">Allemagne</option>
                          <option value="Senegal">Sénégal</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="ville">Ville / Région</Label>
                        <Input
                          id="ville"
                          value={formData.ville}
                          onChange={e => setFormData({ ...formData, ville: e.target.value })}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="gps">Coordonnées GPS (Optionnel)</Label>
                      <div className="flex gap-2">
                        <Input
                          id="gps"
                          placeholder="ex. 52.3676° N, 4.9041° E"
                          value={formData.gps}
                          onChange={e => setFormData({ ...formData, gps: e.target.value })}
                          className="flex-1"
                        />
                        <Button variant="outline" size="icon" className="shrink-0">
                          <MapPin className="w-4 h-4 text-gray-500" />
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end mt-6">
                    <Button 
                      onClick={handleSaveLoft}
                      disabled={updateColombier.isPending}
                      className="bg-[#00685f] hover:bg-[#00554d] text-white gap-2"
                    >
                      {updateColombier.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                      Mettre à jour le colombier
                    </Button>
                  </div>
                </>
              )}
            </Card>
          )}

          {activeTab === 'security' && (
            <div className="space-y-6">
              <Card className="p-6">
                <div className="flex items-center gap-2 mb-6 text-[#00685f]">
                  <Lock className="w-5 h-5" />
                  <h2 className="text-lg font-semibold">Changer le mot de passe</h2>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="old_password">Mot de passe actuel</Label>
                    <div className="relative">
                      <Input
                        id="old_password"
                        type={showPassword ? 'text' : 'password'}
                        value={passwordData.old_password}
                        onChange={e => setPasswordData({ ...passwordData, old_password: e.target.value })}
                        placeholder="••••••••"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="new_password">Nouveau mot de passe</Label>
                    <div className="relative">
                      <Input
                        id="new_password"
                        type={showNewPassword ? 'text' : 'password'}
                        value={passwordData.new_password}
                        onChange={e => setPasswordData({ ...passwordData, new_password: e.target.value })}
                        placeholder="Minimum 8 caractères"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirm_password">Confirmer le mot de passe</Label>
                    <Input
                      id="confirm_password"
                      type="password"
                      value={passwordData.confirm_password}
                      onChange={e => setPasswordData({ ...passwordData, confirm_password: e.target.value })}
                      placeholder="••••••••"
                    />
                  </div>

                  <div className="flex justify-end">
                    <Button 
                      onClick={handleChangePassword}
                      disabled={changePassword.isPending}
                      variant="outline"
                      className="gap-2"
                    >
                      {changePassword.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
                      Changer le mot de passe
                    </Button>
                  </div>
                </div>
              </Card>

              <Card className="p-6 border border-red-200 bg-red-50/50">
                <div className="flex items-center gap-2 mb-4 text-red-600">
                  <ShieldAlert className="w-5 h-5" />
                  <h2 className="text-lg font-semibold">Danger Zone</h2>
                </div>

                <p className="text-sm text-gray-600 mb-4">
                  Supprimez définitivement votre compte et toutes les données du colombier. Cette action est irréversible.
                </p>

                <div className="space-y-3 mb-4">
                  <Label htmlFor="delete-confirm" className="text-red-600 text-sm">
                    Tapez <strong>{user.username}</strong> pour confirmer
                  </Label>
                  <Input
                    id="delete-confirm"
                    value={deleteConfirm}
                    onChange={e => setDeleteConfirm(e.target.value)}
                    placeholder={user.username}
                    className="border-red-300 focus:border-red-500 focus:ring-red-500/20"
                  />
                </div>

                <Button 
                  variant="destructive" 
                  className="w-full gap-2 bg-red-600 hover:bg-red-700"
                  onClick={handleDeleteAccount}
                  disabled={deleteAccount.isPending || deleteConfirm !== user.username}
                >
                  {deleteAccount.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                  Supprimer le compte
                </Button>
              </Card>
            </div>
          )}

          {activeTab === 'billing' && (
            <div className="space-y-6">
              <Card className="p-6">
                <div className="flex items-center gap-2 mb-4 text-[#00685f]">
                  <CreditCard className="w-5 h-5" />
                  <h2 className="text-lg font-semibold">Plan actuel</h2>
                </div>

                {planLoading ? (
                  <div className="flex items-center justify-center h-20">
                    <Loader2 className="w-5 h-5 animate-spin text-[#00685f]" />
                  </div>
                ) : (
                  <>
                    <div className="flex items-center gap-2 mb-4">
                      <Badge className="bg-[#ffedd5] text-[#9a3412] hover:bg-[#ffedd5] font-medium">
                        ACTIF
                      </Badge>
                      <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Plan actuel</span>
                    </div>

                    <h3 className="text-2xl font-bold text-gray-900 mb-2">
                      {plan?.nom || 'Master Breeder'}
                    </h3>
                    <p className="text-sm text-gray-500 mb-4">
                      {plan?.description || 'Pigeons illimités, suivi avancé de pedigree et support prioritaire.'}
                    </p>

                    <ul className="space-y-3 mb-6">
                      <li className="flex items-center gap-2 text-sm text-gray-700">
                        <Check className="w-4 h-4 text-[#00685f]" />
                        Oiseaux actifs illimités
                      </li>
                      <li className="flex items-center gap-2 text-sm text-gray-700">
                        <Check className="w-4 h-4 text-[#00685f]" />
                        Tableau de bord génétique
                      </li>
                      <li className="flex items-center gap-2 text-sm text-gray-700">
                        <Check className="w-4 h-4 text-[#00685f]" />
                        Export de données (PDF/CSV)
                      </li>
                    </ul>

                    <Button variant="outline" className="w-full gap-2">
                      <CreditCard className="w-4 h-4" />
                      Gérer la facturation
                    </Button>
                  </>
                )}
              </Card>

              <Card className="p-6">
                <div className="flex items-center gap-2 mb-4 text-[#00685f]">
                  <FileText className="w-5 h-5" />
                  <h2 className="text-lg font-semibold">Factures récentes</h2>
                </div>

                {invoicesData?.results?.length === 0 ? (
                  <p className="text-sm text-gray-500 text-center py-4">Aucune facture</p>
                ) : (
                  <div className="space-y-3">
                    {invoicesData?.results?.slice(0, 5).map(invoice => (
                      <div key={invoice.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium text-sm">{invoice.numero}</p>
                          <p className="text-xs text-gray-500">{invoice.date}</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="font-medium text-sm">{invoice.montant}€</span>
                          <Badge variant={invoice.statut === 'payee' ? 'default' : 'secondary'}>
                            {invoice.statut}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4 text-[#00685f]">
              <Bell className="w-5 h-5" />
              <h2 className="text-lg font-semibold">Notifications</h2>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="pr-4">
                  <p className="font-medium text-gray-900">Alertes de reproduction</p>
                  <p className="text-sm text-gray-500">M'avertir quand les œufs doivent éclore.</p>
                </div>
                <button
                  onClick={() => setNotifications(prev => ({ ...prev, alertesReproduction: !prev.alertesReproduction }))}
                  className={cn(
                    'w-11 h-6 rounded-full transition-colors relative cursor-pointer shrink-0',
                    notifications.alertesReproduction ? 'bg-[#00685f]' : 'bg-gray-200'
                  )}
                >
                  <div className={cn(
                    'w-5 h-5 rounded-full bg-white absolute top-0.5 transition-transform shadow-sm',
                    notifications.alertesReproduction ? 'translate-x-5' : 'translate-x-0.5'
                  )} />
                </button>
              </div>

              <hr className="border-gray-100" />

              <div className="flex items-center justify-between">
                <div className="pr-4">
                  <p className="font-medium text-gray-900">Résumé hebdomadaire</p>
                  <p className="text-sm text-gray-500">Rapport par e-mail des activités du colombier.</p>
                </div>
                <button
                  onClick={() => setNotifications(prev => ({ ...prev, resumeHebdo: !prev.resumeHebdo }))}
                  className={cn(
                    'w-11 h-6 rounded-full transition-colors relative cursor-pointer shrink-0',
                    notifications.resumeHebdo ? 'bg-[#00685f]' : 'bg-gray-200'
                  )}
                >
                  <div className={cn(
                    'w-5 h-5 rounded-full bg-white absolute top-0.5 transition-transform shadow-sm',
                    notifications.resumeHebdo ? 'translate-x-5' : 'translate-x-0.5'
                  )} />
                </button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}