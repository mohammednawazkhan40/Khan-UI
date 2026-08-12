'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Eye, EyeOff, Zap, Car, Shield, TrendingUp, Bot } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export default function LoginPage() {
  const router = useRouter()
  const [show, setShow] = useState(false)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({ email: 'nawaz@kmcardeals.com', password: 'demo1234' })

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    await new Promise(r => setTimeout(r, 1200))
    router.push('/dashboard')
  }

  return (
    <div className="min-h-screen flex">
      {/* Left — brand panel */}
      <div className="hidden lg:flex lg:w-1/2 khan-gradient relative overflow-hidden flex-col justify-between p-12">
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-white/5" />
          <div className="absolute -bottom-32 -left-32 w-[500px] h-[500px] rounded-full bg-white/5" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-white/3" />
        </div>

        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
              <span className="text-white font-black text-xl">K</span>
            </div>
            <div>
              <div className="text-3xl font-black text-white tracking-tight">
                KHAN <span className="text-white/70 font-bold">INTERFACE</span>
              </div>
            </div>
          </div>
          <p className="mt-4 text-white/80 text-lg font-medium leading-relaxed">
            AI-Powered Business Operating System
          </p>
          <p className="mt-1 text-white/60 text-sm">
            for KM CAR DEALS
          </p>
        </div>

        <div className="relative z-10 space-y-5">
          <h2 className="text-2xl font-bold text-white leading-tight">
            Your entire business.<br />
            One intelligent platform.
          </h2>

          {[
            { icon: Bot,        text: '7 AI Agents monitoring your business 24/7' },
            { icon: Car,        text: 'Complete vehicle lifecycle management' },
            { icon: Shield,     text: 'RTO & document tracking automated' },
            { icon: TrendingUp, text: 'Real-time finance & payment tracking' },
          ].map(({ icon: Icon, text }) => (
            <div key={text} className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
                <Icon className="w-4.5 h-4.5 text-white" style={{ width: 18, height: 18 }} />
              </div>
              <span className="text-white/85 text-sm">{text}</span>
            </div>
          ))}
        </div>

        <div className="relative z-10">
          <div className="flex items-center gap-2.5 bg-white/10 rounded-2xl px-4 py-3">
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
              <span className="text-white font-black text-sm">NK</span>
            </div>
            <div>
              <p className="text-white font-semibold text-sm">Nawaz Khan</p>
              <p className="text-white/60 text-xs">Owner — KM Car Deals</p>
            </div>
            <div className="ml-auto flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-green-400 status-pulse" />
              <span className="text-green-300 text-xs">Active</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right — login form */}
      <div className="flex-1 flex items-center justify-center p-6 bg-background">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-sm"
        >
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <div className="w-9 h-9 khan-gradient rounded-xl flex items-center justify-center">
              <span className="text-white font-black">K</span>
            </div>
            <span className="font-black text-khan-red text-xl">KHAN</span>
            <span className="font-bold text-foreground">INTERFACE</span>
          </div>

          <div className="mb-8">
            <h1 className="text-2xl font-bold">Welcome back, Nawaz</h1>
            <p className="text-muted-foreground mt-1 text-sm">Sign in to KM Car Deals Command Center</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Email</label>
              <Input
                type="email"
                value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                placeholder="nawaz@kmcardeals.com"
                className="h-11"
                required
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Password</label>
              <div className="relative">
                <Input
                  type={show ? 'text' : 'password'}
                  value={form.password}
                  onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                  placeholder="Enter password"
                  className="h-11 pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShow(!show)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" defaultChecked className="rounded accent-khan-red" />
                <span className="text-muted-foreground">Remember me</span>
              </label>
              <button type="button" className="text-khan-red hover:underline">Forgot password?</button>
            </div>

            <Button type="submit" variant="khan" size="xl" className="w-full" loading={loading}>
              {!loading && <Zap className="w-4 h-4" />}
              {loading ? 'Signing in…' : 'Sign In'}
            </Button>
          </form>

          <div className="mt-6 p-3 rounded-xl bg-muted text-xs text-muted-foreground">
            <p className="font-medium text-foreground mb-1">Demo Credentials</p>
            <p>Email: nawaz@kmcardeals.com</p>
            <p>Password: demo1234</p>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
