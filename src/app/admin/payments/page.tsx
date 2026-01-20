"use client"

import { useEffect, useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { 
  DollarSign, 
  CheckCircle2, 
  Clock, 
  TrendingUp,
  RefreshCw,
  Eye,
  Copy,
  ExternalLink,
  CreditCard,
  Edit2
} from 'lucide-react'
import {
  PageHeader,
  StatsGrid,
  StatsCard,
  SearchWithFilters,
  LoadingSpinner,
  EmptyState,
  StatusBadge,
  Pagination,
  usePagination,
  ExportButtons
} from '@/components/admin'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface Payment {
  id: string
  team_name: string
  college_name: string
  captain_name: string
  captain_email: string
  has_paid: boolean
  total_amount_payable: number
  payment_gateway: string | null
  payment_order_id: string | null
  razorpay_payment_id: string | null
  payment_status: string
  created_at: string
  event: {
    name: string
    slug: string
  } | null
}

interface PaymentStats {
  totalRevenue: number
  totalTeams: number
  paidCount: number
  pendingCount: number
  avgPaymentAmount: number
}

const filterOptions = [
  { id: 'all', label: 'All Teams' },
  { id: 'paid', label: 'Paid' },
  { id: 'pending', label: 'Pending' },
]

const exportColumns = [
  { key: 'team_name' as const, header: 'Team Name' },
  { key: 'college_name' as const, header: 'College' },
  { key: 'captain_name' as const, header: 'Captain Name' },
  { key: 'captain_email' as const, header: 'Email' },
  { key: 'event_name' as const, header: 'Event' },
  { key: 'status' as const, header: 'Status' },
  { key: 'amount' as const, header: 'Amount' },
  { key: 'payment_gateway' as const, header: 'Payment Mode' },
  { key: 'payment_order_id' as const, header: 'Order ID' },
  { key: 'created_at' as const, header: 'Date' },
]

export default function PaymentsPage() {
  const router = useRouter()
  const [payments, setPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null)
  const [copied, setCopied] = useState<string | null>(null)
  
  const pagination = usePagination(10)

  const fetchPayments = async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true)
      else setLoading(true)
      
      // Use admin API route which uses service client (bypasses RLS)
      const res = await fetch('/api/admin/teams')
      if (!res.ok) throw new Error('Failed to fetch teams')
      
      const data = await res.json()
      
      const transformedData: Payment[] = (data.teams || []).map((team: any) => ({
        id: team.id,
        team_name: team.team_name,
        college_name: team.college_name,
        captain_name: team.captain_name,
        captain_email: team.captain_email,
        has_paid: team.has_paid,
        total_amount_payable: team.total_amount_payable,
        payment_gateway: team.payment_gateway,
        payment_order_id: team.payment_order_id,
        razorpay_payment_id: team.razorpay_payment_id,
        payment_status: team.payment_status || 'created',
        created_at: team.created_at,
        event: team.events ? {
          name: team.events.name,
          slug: team.events.slug
        } : null
      }))
      
      setPayments(transformedData)
    } catch (error) {
      console.error('Error fetching payments:', error)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    fetchPayments()
  }, [])

  // Reset pagination when filter/search changes
  useEffect(() => {
    pagination.resetPagination()
  }, [filter, search])

  // Filter payments
  const filteredPayments = useMemo(() => {
    return payments.filter(payment => {
      const matchesFilter = filter === 'all' || 
        (filter === 'paid' && payment.has_paid) ||
        (filter === 'pending' && !payment.has_paid)
      const matchesSearch = search === '' || 
        payment.team_name.toLowerCase().includes(search.toLowerCase()) ||
        payment.captain_name.toLowerCase().includes(search.toLowerCase()) ||
        payment.captain_email.toLowerCase().includes(search.toLowerCase()) ||
        payment.college_name.toLowerCase().includes(search.toLowerCase()) ||
        payment.payment_order_id?.toLowerCase().includes(search.toLowerCase()) ||
        payment.event?.name.toLowerCase().includes(search.toLowerCase())
      return matchesFilter && matchesSearch
    })
  }, [payments, filter, search])

  // Calculate stats
  const stats: PaymentStats = useMemo(() => {
    const paidPayments = payments.filter(p => p.has_paid)
    const totalRevenue = paidPayments.reduce((sum, p) => sum + (p.total_amount_payable || 0), 0)
    
    return {
      totalRevenue,
      totalTeams: payments.length,
      paidCount: paidPayments.length,
      pendingCount: payments.filter(p => !p.has_paid).length,
      avgPaymentAmount: paidPayments.length > 0 ? Math.round(totalRevenue / paidPayments.length) : 0
    }
  }, [payments])

  // Paginate data
  const paginatedPayments = pagination.paginateData(filteredPayments)
  const totalPages = pagination.getTotalPages(filteredPayments.length)

  // Export data formatting
  const exportData = useMemo(() => {
    return filteredPayments.map(p => ({
      team_name: p.team_name,
      college_name: p.college_name,
      captain_name: p.captain_name,
      captain_email: p.captain_email,
      event_name: p.event?.name || '',
      status: p.has_paid ? 'Paid' : 'Pending',
      amount: p.total_amount_payable || 0,
      payment_gateway: p.payment_gateway || '',
      payment_order_id: p.payment_order_id || '',
      created_at: new Date(p.created_at).toLocaleDateString()
    }))
  }, [filteredPayments])

  const markAsPaid = async (paymentId: string) => {
    try {
      const res = await fetch(`/api/admin/teams/${paymentId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          has_paid: true,
          payment_gateway: 'cash'
        })
      })
      
      if (res.ok) {
        fetchPayments(true)
        setSelectedPayment(null)
      }
    } catch (error) {
      console.error('Error marking as paid:', error)
    }
  }

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text)
    setCopied(field)
    setTimeout(() => setCopied(null), 2000)
  }

  if (loading) {
    return <LoadingSpinner />
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader
        title="Payments"
        description="Track revenue and manage team payment statuses"
        backLink="/admin"
        actions={
          <div className="flex items-center gap-3">
            <ExportButtons
              data={exportData}
              filename={`payments-${new Date().toISOString().split('T')[0]}`}
              columns={exportColumns}
              sheetName="Payments"
            />
            <Button
              variant="outline"
              size="sm"
              onClick={() => fetchPayments(true)}
              disabled={refreshing}
              className="border-zinc-700 bg-transparent hover:bg-zinc-800"
            >
              <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
              <span className="ml-2 hidden sm:inline">Refresh</span>
            </Button>
          </div>
        }
      />

      {/* Stats Cards */}
      <StatsGrid columns={4}>
        <StatsCard
          title="Total Revenue"
          value={`₹${stats.totalRevenue.toLocaleString()}`}
          icon={DollarSign}
          iconColor="text-green-500"
          bgColor="bg-green-500/10"
        />
        <StatsCard
          title="Total Registrations"
          value={stats.totalTeams}
          icon={TrendingUp}
          iconColor="text-orange-500"
        />
        <StatsCard
          title="Paid"
          value={stats.paidCount}
          icon={CheckCircle2}
          iconColor="text-green-500"
          bgColor="bg-green-500/10"
        />
        <StatsCard
          title="Pending"
          value={stats.pendingCount}
          icon={Clock}
          iconColor="text-yellow-500"
          bgColor="bg-yellow-500/10"
        />
      </StatsGrid>

      {/* Search & Filters */}
      <SearchWithFilters
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search by team, captain, email, or order ID..."
        filterOptions={filterOptions.map(f => ({ value: f.id, label: f.label }))}
        filterValue={filter}
        onFilterChange={setFilter}
      />

      {/* Payments Table (Desktop) */}
      <div className="hidden md:block bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-zinc-800/50">
              <tr>
                <th className="text-left p-4 text-sm font-medium text-zinc-400">Team</th>
                <th className="text-left p-4 text-sm font-medium text-zinc-400">Event</th>
                <th className="text-left p-4 text-sm font-medium text-zinc-400">Captain</th>
                <th className="text-left p-4 text-sm font-medium text-zinc-400">Status</th>
                <th className="text-left p-4 text-sm font-medium text-zinc-400">Amount</th>
                <th className="text-left p-4 text-sm font-medium text-zinc-400">Mode</th>
                <th className="text-left p-4 text-sm font-medium text-zinc-400">Date</th>
                <th className="text-left p-4 text-sm font-medium text-zinc-400">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {paginatedPayments.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8">
                    <EmptyState
                      title="No payments found"
                      description={search || filter !== 'all' ? "Try adjusting your search or filters" : "Payments will appear here once teams register"}
                    />
                  </td>
                </tr>
              ) : (
                paginatedPayments.map((payment) => (
                  <tr key={payment.id} className="hover:bg-zinc-800/50 transition-colors">
                    <td className="p-4">
                      <div>
                        <span className="font-medium text-white">{payment.team_name}</span>
                        <p className="text-xs text-zinc-500">{payment.college_name}</p>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="text-zinc-300">{payment.event?.name || '-'}</span>
                    </td>
                    <td className="p-4">
                      <div>
                        <p className="text-white">{payment.captain_name}</p>
                        <p className="text-sm text-zinc-400">{payment.captain_email}</p>
                      </div>
                    </td>
                    <td className="p-4">
                      <StatusBadge 
                        status={payment.has_paid ? 'Paid' : 'Pending'} 
                        type={payment.has_paid ? 'success' : 'warning'} 
                      />
                    </td>
                    <td className="p-4">
                      <span className="text-white font-medium">
                        ₹{payment.total_amount_payable?.toLocaleString() || 0}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className="text-zinc-400 text-sm capitalize">
                        {payment.payment_gateway || '-'}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className="text-zinc-400 text-sm">
                        {new Date(payment.created_at).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedPayment(payment)}
                          className="text-zinc-400 hover:text-white"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => router.push(`/admin/teams/${payment.id}`)}
                          className="text-zinc-400 hover:text-white"
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Payments Cards (Mobile) */}
      <div className="md:hidden space-y-3">
        {paginatedPayments.length === 0 ? (
          <EmptyState
            title="No payments found"
            description={search || filter !== 'all' ? "Try adjusting your search or filters" : "Payments will appear here once teams register"}
          />
        ) : (
          paginatedPayments.map((payment) => (
            <div
              key={payment.id}
              className="bg-zinc-900 border border-zinc-800 rounded-lg p-4 space-y-3"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-medium text-white">{payment.team_name}</h3>
                  <p className="text-sm text-zinc-400">{payment.event?.name || 'No event'}</p>
                </div>
                <StatusBadge 
                  status={payment.has_paid ? 'Paid' : 'Pending'} 
                  type={payment.has_paid ? 'success' : 'warning'} 
                />
              </div>

              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-zinc-500">Captain</p>
                  <p className="text-white">{payment.captain_name}</p>
                </div>
                <div>
                  <p className="text-zinc-500">Amount</p>
                  <p className="text-white font-medium">
                    ₹{payment.total_amount_payable?.toLocaleString() || 0}
                  </p>
                </div>
                <div>
                  <p className="text-zinc-500">Date</p>
                  <p className="text-zinc-300">
                    {new Date(payment.created_at).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short'
                    })}
                  </p>
                </div>
                <div>
                  <p className="text-zinc-500">Mode</p>
                  <p className="text-zinc-300 capitalize">
                    {payment.payment_gateway || '-'}
                  </p>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => setSelectedPayment(payment)}
                  className="flex-1 py-2 text-sm text-orange-500 hover:bg-orange-500/10 rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  <Eye className="w-4 h-4" />
                  View
                </button>
                <button
                  onClick={() => router.push(`/admin/teams/${payment.id}`)}
                  className="flex-1 py-2 text-sm text-zinc-400 hover:bg-zinc-800 rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  <Edit2 className="w-4 h-4" />
                  Edit
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      {filteredPayments.length > 0 && (
        <Pagination
          currentPage={pagination.currentPage}
          totalPages={totalPages}
          totalItems={filteredPayments.length}
          itemsPerPage={pagination.itemsPerPage}
          onPageChange={pagination.setCurrentPage}
          onItemsPerPageChange={pagination.setItemsPerPage}
        />
      )}

      {/* Payment Details Modal */}
      <Dialog open={!!selectedPayment} onOpenChange={() => setSelectedPayment(null)}>
        <DialogContent className="bg-zinc-900 border-zinc-800 w-[95vw] max-w-md sm:max-w-lg mx-auto max-h-[90vh] overflow-y-auto">
          <DialogHeader className="pb-2">
            <DialogTitle className="text-white text-lg sm:text-xl">Payment Details</DialogTitle>
            <DialogDescription className="text-zinc-400 text-sm">
              Complete payment information
            </DialogDescription>
          </DialogHeader>
          
          {selectedPayment && (
            <div className="space-y-4">
              {/* Status Banner */}
              <div className={`p-3 sm:p-4 rounded-lg flex items-center gap-3 ${
                selectedPayment.has_paid 
                  ? 'bg-green-500/10 border border-green-500/20' 
                  : 'bg-yellow-500/10 border border-yellow-500/20'
              }`}>
                {selectedPayment.has_paid ? (
                  <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6 text-green-500 shrink-0" />
                ) : (
                  <Clock className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-500 shrink-0" />
                )}
                <div className="min-w-0">
                  <p className={`font-medium text-sm sm:text-base ${
                    selectedPayment.has_paid ? 'text-green-500' : 'text-yellow-500'
                  }`}>
                    Payment {selectedPayment.has_paid ? 'Completed' : 'Pending'}
                  </p>
                  <p className="text-xl sm:text-2xl font-bold text-white">
                    ₹{selectedPayment.total_amount_payable?.toLocaleString() || 0}
                  </p>
                </div>
              </div>

              {/* Quick Action */}
              {!selectedPayment.has_paid && (
                <Button
                  onClick={() => markAsPaid(selectedPayment.id)}
                  className="w-full bg-green-600 hover:bg-green-700 h-10 sm:h-11"
                >
                  <CreditCard className="w-4 h-4 mr-2" />
                  Mark as Paid (Cash)
                </Button>
              )}

              {/* Team Info */}
              <div className="space-y-2 sm:space-y-3">
                <h4 className="text-xs sm:text-sm font-medium text-zinc-400 uppercase tracking-wider">Team Information</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                  <DetailItem label="Team Name" value={selectedPayment.team_name} />
                  <DetailItem label="Event" value={selectedPayment.event?.name || '-'} />
                  <DetailItem label="College" value={selectedPayment.college_name} className="sm:col-span-2" />
                </div>
              </div>

              {/* Captain Info */}
              <div className="space-y-2 sm:space-y-3">
                <h4 className="text-xs sm:text-sm font-medium text-zinc-400 uppercase tracking-wider">Captain Information</h4>
                <div className="space-y-2 sm:space-y-3">
                  <DetailItem label="Name" value={selectedPayment.captain_name} />
                  <DetailItem 
                    label="Email" 
                    value={selectedPayment.captain_email} 
                    copyable
                    onCopy={() => copyToClipboard(selectedPayment.captain_email, 'email')}
                    copied={copied === 'email'}
                  />
                </div>
              </div>

              {/* Payment Info */}
              <div className="space-y-2 sm:space-y-3">
                <h4 className="text-xs sm:text-sm font-medium text-zinc-400 uppercase tracking-wider">Payment Information</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                  <DetailItem 
                    label="Registration Date" 
                    value={new Date(selectedPayment.created_at).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric'
                    })} 
                  />
                  <DetailItem 
                    label="Payment Mode" 
                    value={selectedPayment.payment_gateway || 'Not specified'} 
                  />
                </div>
                {selectedPayment.payment_order_id && (
                  <DetailItem 
                    label="Razorpay Order ID" 
                    value={selectedPayment.payment_order_id}
                    copyable
                    onCopy={() => copyToClipboard(selectedPayment.payment_order_id!, 'orderId')}
                    copied={copied === 'orderId'}
                    mono
                  />
                )}
                {selectedPayment.razorpay_payment_id && (
                  <DetailItem 
                    label="Razorpay Payment ID" 
                    value={selectedPayment.razorpay_payment_id}
                    copyable
                    onCopy={() => copyToClipboard(selectedPayment.razorpay_payment_id!, 'rpayId')}
                    copied={copied === 'rpayId'}
                    mono
                  />
                )}
              </div>

              {/* Actions */}
              <div className="pt-2 flex flex-col sm:flex-row gap-2 sm:gap-3 border-t border-zinc-800">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSelectedPayment(null)
                    router.push(`/admin/teams/${selectedPayment.id}`)
                  }}
                  className="border-zinc-700 text-zinc-300 hover:text-white w-full sm:w-auto"
                >
                  <Edit2 className="w-4 h-4 mr-2" />
                  Edit Team
                </Button>
                {selectedPayment.razorpay_payment_id && (
                  <a
                    href={`https://dashboard.razorpay.com/app/payments/${selectedPayment.razorpay_payment_id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 text-sm text-orange-500 hover:text-orange-400 py-2 px-3 rounded-md hover:bg-orange-500/10 transition-colors w-full sm:w-auto"
                  >
                    <ExternalLink className="w-4 h-4" />
                    View in Razorpay
                  </a>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

// Helper component for detail items
function DetailItem({ 
  label, 
  value, 
  copyable, 
  onCopy, 
  copied,
  mono,
  className
}: { 
  label: string
  value: string
  copyable?: boolean
  onCopy?: () => void
  copied?: boolean
  mono?: boolean
  className?: string
}) {
  return (
    <div className={`bg-zinc-800/50 rounded-lg p-2.5 sm:p-3 ${className || ''}`}>
      <p className="text-[10px] sm:text-xs text-zinc-500 mb-0.5 sm:mb-1">{label}</p>
      <div className="flex items-center gap-2">
        <p className={`text-white text-sm sm:text-base ${mono ? 'font-mono text-xs sm:text-sm' : ''} break-all min-w-0 truncate`}>
          {value}
        </p>
        {copyable && onCopy && (
          <button onClick={onCopy} className="p-1.5 hover:bg-zinc-700 rounded shrink-0 touch-manipulation">
            <Copy className={`w-3.5 h-3.5 ${copied ? 'text-green-500' : 'text-zinc-500'}`} />
          </button>
        )}
      </div>
    </div>
  )
}
