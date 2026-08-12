'use client'
import { FileStack, Upload, FileText, Search } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { PageHeader } from '@/components/shared/page-header'
import { Input } from '@/components/ui/input'

const mockDocs = [
  { id: 'd001', name: 'RC - KA32AB1234 Toyota Innova',           category: 'rc',              owner: 'Vehicle',   ownerName: 'Toyota Innova Crysta',      date: '2026-08-01', status: 'pending' },
  { id: 'd002', name: 'Insurance - KL07BS3344 Kia Seltos',       category: 'insurance',       owner: 'Vehicle',   ownerName: 'Kia Seltos HTX',            date: '2026-08-01', status: 'expiring' },
  { id: 'd003', name: 'Loan Agreement - Rajesh Sharma HDFC',     category: 'loan_agreement',  owner: 'Finance',   ownerName: 'Rajesh Kumar Sharma',       date: '2024-01-20', status: 'active' },
  { id: 'd004', name: 'PAN Card - Mohammed Arif Khan',           category: 'pan',             owner: 'Customer',  ownerName: 'Mohammed Arif Khan',        date: '2024-02-10', status: 'active' },
  { id: 'd005', name: 'Form 29 - TS09GH6677 XUV700',            category: 'form_29',         owner: 'RTO',       ownerName: 'Mahindra XUV700',           date: '2025-09-01', status: 'active' },
  { id: 'd006', name: 'Invoice - Santosh Yadav Creta',           category: 'invoice',         owner: 'Vehicle',   ownerName: 'Hyundai Creta SX',          date: '2026-08-08', status: 'active' },
  { id: 'd007', name: 'NOC Application - MH04EF5566 Baleno',     category: 'noc',             owner: 'RTO',       ownerName: 'Maruti Suzuki Baleno',      date: '2026-07-20', status: 'pending' },
  { id: 'd008', name: 'Payment Receipt - Farhan Siddiqui Jul',   category: 'payment_receipt', owner: 'Finance',   ownerName: 'Farhan Akhtar Siddiqui',    date: '2026-07-18', status: 'active' },
  { id: 'd009', name: 'Aadhaar - Priya Mehta',                   category: 'aadhaar',         owner: 'Customer',  ownerName: 'Priya Mehta',               date: '2023-11-20', status: 'active' },
  { id: 'd010', name: 'Insurance - TN09BB1234 Kiger (Expired)',  category: 'insurance',       owner: 'Vehicle',   ownerName: 'Renault Kiger',             date: '2026-07-31', status: 'expired' },
]

const catColors: Record<string, string> = {
  rc: 'bg-blue-50 text-blue-700', insurance: 'bg-purple-50 text-purple-700',
  loan_agreement: 'bg-green-50 text-green-700', pan: 'bg-yellow-50 text-yellow-700',
  aadhaar: 'bg-orange-50 text-orange-700', invoice: 'bg-teal-50 text-teal-700',
  payment_receipt: 'bg-emerald-50 text-emerald-700', noc: 'bg-indigo-50 text-indigo-700',
  form_29: 'bg-pink-50 text-pink-700', other: 'bg-muted text-muted-foreground',
}

const statusVariant: Record<string, 'active'|'pending'|'overdue'|'medium'> = {
  active: 'active', pending: 'pending', expiring: 'medium', expired: 'overdue',
}

export default function DocumentsPage() {
  return (
    <div className="space-y-5 pb-8">
      <PageHeader title="KM Car Deals Files" subtitle={`${mockDocs.length} documents`}>
        <Button variant="khan" size="sm" className="gap-1.5"><Upload className="w-4 h-4" />Upload Document</Button>
      </PageHeader>

      {/* Category summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Vehicle Docs',  val: mockDocs.filter(d => d.owner === 'Vehicle').length },
          { label: 'Customer Docs', val: mockDocs.filter(d => d.owner === 'Customer').length },
          { label: 'Finance Docs',  val: mockDocs.filter(d => d.owner === 'Finance').length },
          { label: 'RTO Docs',      val: mockDocs.filter(d => d.owner === 'RTO').length },
        ].map(s => (
          <Card key={s.label}><CardContent className="p-4"><div className="text-xl font-bold">{s.val}</div><div className="text-xs text-muted-foreground">{s.label}</div></CardContent></Card>
        ))}
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input placeholder="Search documents…" className="pl-9" />
      </div>

      <div className="space-y-2">
        {mockDocs.map(d => (
          <Card key={d.id} className="hover:shadow-md transition-all cursor-pointer hover:border-khan-red/30">
            <CardContent className="p-4 flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${catColors[d.category] ?? 'bg-muted text-muted-foreground'}`}>
                <FileText className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{d.name}</p>
                <div className="flex gap-2 text-xs text-muted-foreground mt-0.5 flex-wrap">
                  <span>{d.owner}: {d.ownerName}</span>
                  <span>·</span>
                  <span className="capitalize">{d.category.replace(/_/g,' ')}</span>
                  <span>·</span>
                  <span>{d.date}</span>
                </div>
              </div>
              <Badge variant={statusVariant[d.status] ?? 'info'} className="capitalize shrink-0">{d.status}</Badge>
              <Button size="sm" variant="outline" className="h-7 text-xs shrink-0">View</Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
