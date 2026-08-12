'use client'
import { Globe, Wallet, Link2, ShieldCheck, FileCode, Activity } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { PageHeader } from '@/components/shared/page-header'

const mockTxns = [
  { hash: '0x4f2a...c8d1', type: 'Document Hash', description: 'RC document hash — KA32AB1234', status: 'confirmed', network: 'Polygon', ts: '12 Aug 2026' },
  { hash: '0x9b1e...a3f7', type: 'Payment Verification', description: 'Finance payment — Rajesh Sharma', status: 'confirmed', network: 'Polygon', ts: '5 Jul 2026' },
  { hash: '0x3d7c...b2e9', type: 'Ownership Record', description: 'Vehicle ownership — TS09GH6677', status: 'pending',   network: 'Polygon', ts: '10 Aug 2026' },
]

export default function Web3Page() {
  return (
    <div className="space-y-5 pb-8">
      <PageHeader title="Web3" subtitle="Blockchain integration — Phase 4" />

      {/* Info banner */}
      <div className="p-4 rounded-xl border-2 border-dashed border-muted bg-muted/30">
        <div className="flex items-start gap-3">
          <Globe className="w-5 h-5 text-muted-foreground mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-semibold">Web3 — Coming in Phase 4</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Architecture is ready. Provide blockchain provider details to activate wallet connection, payment verification, document hashing, and smart contracts.
            </p>
          </div>
        </div>
      </div>

      {/* Wallet */}
      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-base flex items-center gap-2"><Wallet className="w-4 h-4" />Wallet Connection</CardTitle></CardHeader>
        <CardContent>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <p className="text-muted-foreground text-sm">No wallet connected</p>
              <p className="text-xs text-muted-foreground mt-0.5">Supports MetaMask, WalletConnect, Coinbase Wallet</p>
            </div>
            <Button variant="khan" className="gap-2"><Wallet className="w-4 h-4" />Connect Wallet</Button>
          </div>
        </CardContent>
      </Card>

      {/* Features */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {[
          { icon: ShieldCheck, title: 'Vehicle Ownership Records', desc: 'Immutable blockchain records for vehicle ownership history.', status: 'planned' },
          { icon: FileCode, title: 'Document Hash Verification', desc: 'SHA-256 document hashes stored on-chain for authenticity.', status: 'planned' },
          { icon: Link2, title: 'Payment Verification', desc: 'Blockchain-verified payment receipts for finance transactions.', status: 'planned' },
          { icon: Activity, title: 'Smart Contract Settlements', desc: 'Automated finance settlements via smart contracts.', status: 'planned' },
        ].map(f => (
          <Card key={f.title} className="opacity-75">
            <CardContent className="p-4 flex items-start gap-3">
              <div className="w-9 h-9 bg-muted rounded-lg flex items-center justify-center shrink-0">
                <f.icon className="w-5 h-5 text-muted-foreground" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2"><p className="font-semibold text-sm">{f.title}</p><Badge variant="outline" className="text-xs">Planned</Badge></div>
                <p className="text-xs text-muted-foreground mt-0.5">{f.desc}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Mock transactions */}
      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-base">Sample Blockchain Records (Demo)</CardTitle></CardHeader>
        <CardContent className="space-y-2 pt-0">
          {mockTxns.map(t => (
            <div key={t.hash} className="flex items-center gap-3 p-3 rounded-lg border text-sm">
              <Badge variant={t.status === 'confirmed' ? 'active' : 'pending'} className="shrink-0">{t.status}</Badge>
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{t.description}</p>
                <div className="flex gap-2 text-xs text-muted-foreground mt-0.5">
                  <span className="font-mono">{t.hash}</span>
                  <span>·</span>
                  <span>{t.network}</span>
                  <span>·</span>
                  <span>{t.type}</span>
                </div>
              </div>
              <span className="text-xs text-muted-foreground shrink-0">{t.ts}</span>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
