'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Eye, EyeOff, Zap, Car, Shield, TrendingUp, Bot, Award, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { login } from '@/lib/services'
import Image from 'next/image'

export default function LoginPage() {
  const router = useRouter()
  const [show, setShow] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({ email: 'nawaz@kmcardeals.com', password: 'nawaz1234' })

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      await login(form.email, form.password)
      router.push('/dashboard')
    } catch (err: any) {
      setError(err.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex">

      {/* ── Left Panel ─────────────────────────────────────────────────── */}
      <div className="hidden lg:flex lg:w-[55%] relative overflow-hidden flex-col bg-[#0A0A0A]">

        {/* Dark background base */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#0A0A0A] via-[#111] to-[#1a0a0a]" />

        {/* 
          NAWAZ KHAN — ROLLS-ROYCE PHOTO
          Full photo shown, anchored to top-left
          object-contain keeps the entire body + car visible
        */}
        <div className="absolute inset-0 flex items-start justify-start">
          <div className="relative w-full h-full">
            <Image
              src="/images/nawaz-2.jpg"
              alt="Mr. Nawaz Khan — Founder, KM Car Deals"
              fill
              className="object-contain object-left-top"
              priority
              sizes="55vw"
              style={{ objectPosition: '0% 0%' }}
            />
            {/* Right-side fade so text on right edge remains readable */}
            <div className="absolute inset-0 bg-gradient-to-l from-black/20 via-transparent to-transparent" />
            {/* Bottom fade for founder card */}
            <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-black/95 via-black/50 to-transparent" />
            {/* Top fade for logo area */}
            <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-black/80 via-black/30 to-transparent" />
          </div>
        </div>

        {/* Content over photo */}
        <div className="relative z-10 flex flex-col justify-between h-full p-10">

          {/* Top — Logo (top-left, over photo) */}
          <div>
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 bg-khan-red rounded-xl flex items-center justify-center shadow-lg shadow-red-900/60">
                <span className="text-white font-black text-lg">K</span>
              </div>
              <div>
                <div className="text-2xl font-black tracking-tight leading-none">
                  <span className="text-khan-red">KHAN</span>
                  <span className="text-white font-bold ml-2">INTERFACE</span>
                </div>
                <p className="text-white/50 text-xs mt-1">AI-Powered Business Command Centre</p>
              </div>
            </div>
          </div>

          {/* Spacer — lets the photo breathe in the middle */}
          <div />

          {/* Bottom — founder name tag + features */}
          <div className="space-y-4">
            {/* Features row */}
            <div className="grid grid-cols-2 gap-2">
              {[
                { icon: Bot,        text: '7 AI Agents' },
                { icon: Car,        text: 'Vehicle Lifecycle' },
                { icon: Shield,     text: 'RTO Tracking' },
                { icon: TrendingUp, text: 'Finance Intel' },
              ].map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-center gap-2 bg-white/8 backdrop-blur-sm rounded-lg px-3 py-2 border border-white/10">
                  <Icon className="w-3.5 h-3.5 text-khan-red shrink-0" style={{ width: 14, height: 14 }} />
                  <span className="text-white/80 text-xs font-medium">{text}</span>
                </div>
              ))}
            </div>

            {/* Founder identity card */}
            <div className="flex items-center gap-4 bg-black/60 backdrop-blur-md rounded-2xl px-5 py-4 border border-white/10 shadow-2xl">
              {/* Small round avatar (nawaz-1 — mirror photo) */}
              <div className="relative w-14 h-14 shrink-0">
                <Image
                  src="/images/nawaz-1.jpg"
                  alt="Mr. Nawaz Khan"
                  fill
                  className="object-cover object-top rounded-full border-2 border-khan-red shadow-lg"
                />
                <span className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-green-500 rounded-full border-2 border-black" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-white font-bold text-sm">Mr. Nawaz Khan</p>
                  <Award className="w-3.5 h-3.5 text-khan-red shrink-0" />
                </div>
                <p className="text-white/60 text-xs">Founder & Owner — KM Car Deals</p>
                <p className="text-white/40 text-xs mt-0.5">Multi-brand Pre-Owned Cars</p>
              </div>
              <div className="text-right shrink-0">
                <div className="flex items-center gap-1.5 justify-end">
                  <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                  <span className="text-green-400 text-xs font-medium">Online</span>
                </div>
                <span className="text-white/30 text-xs">Admin</span>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* ── Right Panel — Login Form ─────────────────────────────────── */}
      <div className="flex-1 flex items-center justify-center p-6 bg-background">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-sm"
        >
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <div className="w-9 h-9 bg-khan-red rounded-xl flex items-center justify-center">
              <span className="text-white font-black">K</span>
            </div>
            <span className="font-black text-khan-red text-xl">KHAN</span>
            <span className="font-bold text-foreground">INTERFACE</span>
          </div>

          {/* Mobile founder */}
          <div className="lg:hidden flex items-center gap-3 mb-8 p-3 rounded-xl border bg-muted/30">
            <div className="relative w-10 h-10 shrink-0">
              <Image
                src="/images/nawaz-1.jpg"
                alt="Mr. Nawaz Khan"
                fill
                className="object-cover object-top rounded-full border border-khan-red"
                onError={(e) => {
                  const parent = (e.target as HTMLImageElement).parentElement
                  if (parent) parent.innerHTML = '<div style="width:40px;height:40px;background:#DC2626;border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:700;color:white;font-size:12px">NK</div>'
                }}
              />
            </div>
            <div>
              <p className="text-sm font-bold">Mr. Nawaz Khan</p>
              <p className="text-xs text-muted-foreground">Founder — KM Car Deals</p>
            </div>
          </div>

          <div className="mb-8">
            <h1 className="text-2xl font-bold">Welcome back, Nawaz</h1>
            <p className="text-muted-foreground mt-1 text-sm">Sign in to KM Car Deals Command Centre</p>
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
              {loading ? 'Signing in…' : 'Sign In to Command Centre'}
            </Button>
          </form>

          {error && (
            <div className="mt-4 p-3 rounded-xl bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              <p className="text-xs text-red-700 dark:text-red-400">{error}</p>
            </div>
          )}

          <div className="mt-6 p-3 rounded-xl bg-muted text-xs text-muted-foreground">
            <p className="font-medium text-foreground mb-1">Admin Credentials</p>
            <p>Email: nawaz@kmcardeals.com</p>
            <p>Password: nawaz1234</p>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
