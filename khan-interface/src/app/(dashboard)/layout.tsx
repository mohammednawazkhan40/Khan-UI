import { Sidebar } from '@/components/layout/sidebar'
import { Header } from '@/components/layout/header'
import { QuickAdd } from '@/components/layout/quick-add'
import { GlobalSearch } from '@/components/layout/search'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto">
          <div className="container max-w-7xl mx-auto px-4 py-5 lg:px-6">
            {children}
          </div>
        </main>
      </div>
      <QuickAdd />
      <GlobalSearch />
    </div>
  )
}
