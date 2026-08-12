'use client'
import { Settings, User, Bell, Shield, Palette, Bot, Database, Globe } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { PageHeader } from '@/components/shared/page-header'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { useTheme } from 'next-themes'

export default function SettingsPage() {
  const { theme, setTheme } = useTheme()
  return (
    <div className="space-y-5 pb-8 max-w-2xl">
      <PageHeader title="Settings" subtitle="Application & account configuration" />

      <Tabs defaultValue="profile">
        <TabsList className="flex-wrap h-auto gap-1 p-1">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="appearance">Appearance</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="integrations">Integrations</TabsTrigger>
          <TabsTrigger value="agents">AI Agents</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-4 mt-4">
          <Card>
            <CardHeader><CardTitle className="text-base flex items-center gap-2"><User className="w-4 h-4" />Profile</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 khan-gradient rounded-full flex items-center justify-center">
                  <span className="text-white text-xl font-black">NK</span>
                </div>
                <div><p className="font-semibold">Nawaz Khan</p><p className="text-sm text-muted-foreground">Admin · KM Car Deals</p></div>
              </div>
              {[['Full Name','Nawaz Khan'],['Email','nawaz@kmcardeals.com'],['Phone','+91 98765 43210'],['Business','KM Car Deals'],['City','Jaipur, Rajasthan']].map(([l,v]) => (
                <div key={l} className="space-y-1"><label className="text-xs font-medium text-muted-foreground">{l}</label><Input defaultValue={v} /></div>
              ))}
              <Button variant="khan" className="w-full">Save Profile</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="appearance" className="space-y-4 mt-4">
          <Card>
            <CardHeader><CardTitle className="text-base flex items-center gap-2"><Palette className="w-4 h-4" />Theme</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div className="flex gap-3">
                {(['light','dark','system'] as const).map(t => (
                  <button key={t} onClick={() => setTheme(t)}
                    className={`flex-1 py-3 rounded-xl border-2 text-sm font-medium capitalize transition-all ${theme === t ? 'border-khan-red bg-khan-red/5 text-khan-red' : 'border-border hover:border-khan-red/50'}`}>
                    {t}
                  </button>
                ))}
              </div>
              <p className="text-xs text-muted-foreground">Brand colors (KHAN red + INTERFACE black) remain consistent in all modes.</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-4 mt-4">
          <Card>
            <CardHeader><CardTitle className="text-base flex items-center gap-2"><Bell className="w-4 h-4" />Notification Preferences</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {['Finance payment alerts','RTO task reminders','Customer follow-ups','AI agent alerts','Document expiry alerts','Daily briefing'].map(n => (
                <div key={n} className="flex items-center justify-between py-1 border-b last:border-0">
                  <span className="text-sm">{n}</span>
                  <input type="checkbox" defaultChecked className="accent-khan-red w-4 h-4" />
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="integrations" className="space-y-4 mt-4">
          <Card>
            <CardHeader><CardTitle className="text-base flex items-center gap-2"><Database className="w-4 h-4" />Backend API</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              <div className="space-y-1"><label className="text-xs font-medium text-muted-foreground">API Base URL</label><Input placeholder="https://api.kmcardeals.com/v1" /></div>
              <Badge variant="medium">Not Connected — Using Mock Data</Badge>
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle className="text-base flex items-center gap-2"><Bot className="w-4 h-4" />LLM Provider</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              <div className="space-y-1"><label className="text-xs font-medium text-muted-foreground">AI Provider</label><Input placeholder="openai / anthropic / gemini / custom" /></div>
              <div className="space-y-1"><label className="text-xs font-medium text-muted-foreground">API Key</label><Input type="password" placeholder="sk-…" /></div>
              <Badge variant="medium">Not Connected — Using Mock Responses</Badge>
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle className="text-base flex items-center gap-2"><Globe className="w-4 h-4" />WhatsApp / SMS</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              <div className="space-y-1"><label className="text-xs font-medium text-muted-foreground">WhatsApp API URL</label><Input placeholder="https://api.whatsapp.com/…" /></div>
              <Badge variant="medium">Not Connected — Messages are previews only</Badge>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="agents" className="space-y-4 mt-4">
          <Card>
            <CardHeader><CardTitle className="text-base">AI Agent Configuration</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {['RTO Agent','Finance Agent','Sales Agent','Accountant Agent','Customer Agent','Vehicle Agent','Business Manager'].map(a => (
                <div key={a} className="flex items-center justify-between py-2 border-b last:border-0">
                  <div><p className="text-sm font-medium">{a}</p><p className="text-xs text-muted-foreground">Enabled · Using mock data</p></div>
                  <input type="checkbox" defaultChecked className="accent-khan-red w-4 h-4" />
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
