import { StatsCards } from '@/components/dashboard/stats-cards'
import { RecentActivity } from '@/components/dashboard/recent-activity'
import { AlertsPanel } from '@/components/dashboard/alerts-panel'
import { WelcomeBanner } from '@/components/dashboard/welcome-banner'
import { SexeDistribution } from '@/components/dashboard/charts/sexe-distribution'
import { OccupationGauge } from '@/components/dashboard/charts/occupation-gauge'

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      {/* Bannière de bienvenue + actions rapides */}
      <WelcomeBanner />

      {/* KPI Cards */}
      <StatsCards />

      {/* Main Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Colonne principale (2/3) */}
        <div className="space-y-6 lg:col-span-2">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <SexeDistribution />
            <OccupationGauge />
          </div>
          <RecentActivity />
        </div>

        {/* Colonne latérale (1/3) */}
        <div className="space-y-6">
          <AlertsPanel />
        </div>
      </div>
    </div>
  )
}