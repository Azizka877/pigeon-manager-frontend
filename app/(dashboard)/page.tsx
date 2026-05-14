import { OccupationGauge } from '../../components/dashboard/charts/occupation-gauge';
import { SexeDistribution } from '../../components/dashboard/charts/sexe-distribution';
import { AlertsPanel } from '../../components/dashboard/alerts-panel';
import { RecentActivity } from '../../components/dashboard/recent-activity';
import { QuickActions } from '../../components/dashboard/quick-actions';
'use client'

import { StatsCards } from '@/components/dashboard/stats-cards';

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-on-surface">Tableau de bord</h1>
        <p className="text-on-surface-variant mt-1">Vue d'ensemble de votre volièr</p>
      </div>

      {/* KPI Cards */}
      <StatsCards />

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Colonne gauche (2/3) */}
        <div className="lg:col-span-2 space-y-6">
          <RecentActivity />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <SexeDistribution />
            <OccupationGauge />
          </div>
        </div>

        {/* Colonne droite (1/3) */}
        <div className="space-y-6">
          <AlertsPanel />
        </div>
      </div>

      {/* Quick Actions */}
      <QuickActions />
    </div>
  )
}