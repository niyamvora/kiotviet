/**
 * Dashboard overview component showing key business metrics
 * Updated to support dynamic data and different data types with comprehensive analytics
 */

'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useLanguage } from '@/components/providers/language-provider'
import { formatCurrency, formatNumber } from '@/lib/utils'
import { TrendingUp, TrendingDown, DollarSign, ShoppingCart, Users, Package } from 'lucide-react'

interface DashboardOverviewProps {
  data: any
  dataType: string
}

export function DashboardOverview({ data, dataType }: DashboardOverviewProps) {
  const { t, language } = useLanguage();

  if (!data || !data.overview) {
    return <DashboardOverviewSkeleton />
  }

  const overviewData = data.overview

  const MetricCard = ({ 
    title, 
    icon: Icon, 
    current, 
    growth, 
    format = 'number' 
  }: {
    title: string
    icon: any
    current: number
    growth: number
    format?: 'number' | 'currency'
  }) => {
    const formattedCurrent = format === 'currency' 
      ? formatCurrency(current, language === 'vi' ? 'vi-VN' : 'en-US')
      : formatNumber(current, language === 'vi' ? 'vi-VN' : 'en-US')

    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">{title}</CardTitle>
          <Icon className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formattedCurrent}</div>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            {growth >= 0 ? (
              <TrendingUp className="h-4 w-4 text-green-500" />
            ) : (
              <TrendingDown className="h-4 w-4 text-red-500" />
            )}
            <span className={growth >= 0 ? 'text-green-500' : 'text-red-500'}>
              {Math.abs(growth).toFixed(1)}%
            </span>
            <span>from last period</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <MetricCard
        title={t('dashboard.revenue')}
        icon={DollarSign}
        current={overviewData.totalRevenue}
        growth={overviewData.revenueGrowth}
        format="currency"
      />
      <MetricCard
        title={t('dashboard.orders')}
        icon={ShoppingCart}
        current={overviewData.totalOrders}
        growth={overviewData.ordersGrowth}
      />
      <MetricCard
        title={t('dashboard.customers')}
        icon={Users}
        current={overviewData.totalCustomers}
        growth={overviewData.customersGrowth}
      />
      <MetricCard
        title={t('dashboard.products')}
        icon={Package}
        current={overviewData.totalProducts}
        growth={overviewData.productsGrowth}
      />
    </div>
  )
}

function DashboardOverviewSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <Card key={i}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div className="h-4 w-24 bg-muted rounded animate-pulse" />
            <div className="h-4 w-4 bg-muted rounded animate-pulse" />
          </CardHeader>
          <CardContent>
            <div className="h-8 w-32 bg-muted rounded animate-pulse mb-2" />
            <div className="h-4 w-20 bg-muted rounded animate-pulse" />
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
