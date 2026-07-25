"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { MixIcon, PersonIcon, LockClosedIcon, EyeOpenIcon, EyeClosedIcon } from "@radix-ui/react-icons"
import { motion, useMotionValue, useTransform, useSpring } from "motion/react"
import * as React from "react"
import { useRouter } from "next/navigation"
import { setAuth, isAuthenticated } from "@/lib/auth"
import { API_URL } from "@/lib/constants"

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.1 },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" as const } },
}

// Official Apache Superset logo (Simple Icons - CC0)
function SupersetLogo({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M11.25 0v6.156a6.14 6.14 0 0 1 2.25.656V0h-2.25zm0 8.469V12h2.25V6.563a3.919 3.919 0 0 0-2.25-.656v2.562zM5.25 3v9.188a3.9 3.9 0 0 0 2.25.656V3H5.25zm0 11.438V18h2.25v-4.688a1.65 1.65 0 0 1-2.25-.656v-.219zm6-3.844v6.156a6.14 6.14 0 0 1 2.25.656V8.594h-2.25zm0 8.469V18h2.25v-3.438a3.919 3.919 0 0 0-2.25-.656v.156zm6-10.219v12a6.14 6.14 0 0 1-2.25-.656V6.563a6.14 6.14 0 0 1 2.25-.656v2.438zm0 14.438V18h-2.25v1.313a3.919 3.919 0 0 0 2.25.656v-2.438z" />
    </svg>
  )
}

// Official Apache Airflow logo (Simple Icons - CC0)
function AirflowLogo({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12.527 1.495a.695.695 0 0 0-.512-.083.711.711 0 0 0-.458.308l-2.54 4.064a.706.706 0 0 0 .056.852l2.04 1.898-3.666 3.073a.706.706 0 0 0 .074 1.117l2.512 1.793-4.468 2.94a.706.706 0 0 0 .094 1.224l3.66 1.658-5.064 2.472a.706.706 0 0 0 .112 1.312l4.68 1.384-3.296 3.476a.706.706 0 0 0 .13 1.37l4.992.695-.796 4.332a.706.706 0 0 0 .537.821.71.71 0 0 0 .863-.397l1.38-4.035 1.38 4.035a.71.71 0 0 0 .863.397.706.706 0 0 0 .537-.821l-.796-4.332 4.992-.695a.706.706 0 0 0 .13-1.37l-3.296-3.476 4.68-1.384a.706.706 0 0 0 .112-1.312l-5.064-2.472 3.66-1.658a.706.706 0 0 0 .094-1.224l-4.468-2.94 2.512-1.793a.706.706 0 0 0 .074-1.117l-3.666-3.073 2.04-1.898a.706.706 0 0 0 .056-.852L12.955 1.72a.711.711 0 0 0-.458-.308.695.695 0 0 0-.512.083h.042zm-.245 2.285l1.965 3.144-2.364 1.995-1.964-3.144 2.364-1.995zm-1.46 4.063l3.252 2.729-2.23 1.88-3.252-2.729 2.23-1.88zm-.214 3.71l4.116 3.455-2.564 2.162-4.116-3.455 2.564-2.162zm-.45 3.946l4.82 4.048-2.944 2.484-4.82-4.048 2.944-2.484zm-.23 3.93l5.448 4.577-3.18 2.683-5.448-4.577 3.18-2.683zm1.53 4.094l3.886 3.262-.678 3.706-2.616-.854.678-3.706-1.87-.518-.4 1.11zm2.526.392l2.756 2.313-.582 3.183-2.174-.71.582-3.183-.582-.603zm2.702-1.893l.79 2.672-1.816 1.995-.972-2.47 1.998-2.197z" />
    </svg>
  )
}

// Official Google Gemini logo (Simple Icons - Apache 2.0)
function GeminiLogo({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 24A14.304 14.304 0 0 0 0 12 14.304 14.304 0 0 0 12 0a14.304 14.304 0 0 0 0 24zm0-4.185a10.14 10.14 0 0 1-7.828-3.659l1.674-1.674a7.936 7.936 0 0 0 6.154 2.936 7.936 7.936 0 0 0 6.154-2.936l1.674 1.674A10.14 10.14 0 0 1 12 19.815zM12 2.185A10.14 10.14 0 0 1 22.14 12 10.14 10.14 0 0 1 12 21.815 10.14 10.14 0 0 1 1.86 12 10.14 10.14 0 0 1 12 2.185zm0 3.87a7.936 7.936 0 0 0-6.154 2.936L4.172 7.317A10.14 10.14 0 0 1 12 4.185a10.14 10.14 0 0 1 7.828 3.132l-1.674 1.674A7.936 7.936 0 0 0 12 6.055zM7.936 12a7.936 7.936 0 0 0 4.064 6.91V12H7.936zm4.064-4.064A7.936 7.936 0 0 0 7.936 12h4.064V7.936zm0 8.128V12h4.064a7.936 7.936 0 0 1-4.064 4.064zm4.064-8.128A7.936 7.936 0 0 1 16.064 12h-4.064V7.936z" />
    </svg>
  )
}

interface FloatingLogo {
  icon: React.FC<{ className?: string }>
  label: string
  color: string
  bg: string
  border: string
  size: string
  position: string
  animClass: string
}

const floatingLogos: FloatingLogo[] = [
  {
    icon: SupersetLogo,
    label: "Apache Superset",
    color: "text-cyan-400",
    bg: "bg-cyan-400/10",
    border: "border-cyan-400/20",
    size: "size-11",
    position: "top-[8%] right-[18%]",
    animClass: "float-slow",
  },
  {
    icon: AirflowLogo,
    label: "Apache Airflow",
    color: "text-orange-400",
    bg: "bg-orange-400/10",
    border: "border-orange-400/20",
    size: "size-10",
    position: "bottom-[22%] left-[28%]",
    animClass: "float-medium",
  },
  {
    icon: GeminiLogo,
    label: "Google Gemini",
    color: "text-purple-400",
    bg: "bg-purple-400/10",
    border: "border-purple-400/20",
    size: "size-9",
    position: "bottom-[32%] right-[12%]",
    animClass: "float-fast",
  },
]

function FloatingLogos() {
  return (
    <div className="absolute inset-0 pointer-events-none">
      {floatingLogos.map((logo) => (
        <div
          key={logo.label}
          className={`absolute ${logo.position} ${logo.animClass}`}
        >
          <div
            className={`${logo.size} rounded-xl ${logo.bg} ${logo.border} border flex items-center justify-center backdrop-blur-sm`}
          >
            <logo.icon className={`size-5 ${logo.color}`} />
          </div>
        </div>
      ))}

      {/* Subtle connecting lines (decorative) */}
      <svg className="absolute inset-0 w-full h-full opacity-[0.04]" viewBox="0 0 600 600">
        <line x1="420" y1="100" x2="300" y2="250" stroke="currentColor" strokeWidth="0.5" />
        <line x1="180" y1="420" x2="300" y2="250" stroke="currentColor" strokeWidth="0.5" />
        <line x1="480" y1="380" x2="300" y2="250" stroke="currentColor" strokeWidth="0.5" />
      </svg>
    </div>
  )
}

function ParallaxPanel() {
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)

  const smoothX = useSpring(mouseX, { stiffness: 50, damping: 20, mass: 0.5 })
  const smoothY = useSpring(mouseY, { stiffness: 50, damping: 20, mass: 0.5 })

  const gridX = useTransform(smoothX, [-0.5, 0.5], [-10, 10])
  const gridY = useTransform(smoothY, [-0.5, 0.5], [-10, 10])

  const glowX = useTransform(smoothX, [-0.5, 0.5], [-25, 25])
  const glowY = useTransform(smoothY, [-0.5, 0.5], [-25, 25])

  const logoX = useTransform(smoothX, [-0.5, 0.5], [-15, 15])
  const logoY = useTransform(smoothY, [-0.5, 0.5], [-15, 15])

  const textX = useTransform(smoothX, [-0.5, 0.5], [-8, 8])
  const textY = useTransform(smoothY, [-0.5, 0.5], [-8, 8])

  const badgeX = useTransform(smoothX, [-0.5, 0.5], [-20, 20])
  const badgeY = useTransform(smoothY, [-0.5, 0.5], [-20, 20])

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = (e.clientX - rect.left) / rect.width - 0.5
    const y = (e.clientY - rect.top) / rect.height - 0.5
    mouseX.set(x)
    mouseY.set(y)
  }

  const handleMouseLeave = () => {
    mouseX.set(0)
    mouseY.set(0)
  }

  return (
    <div
      className="hidden lg:flex lg:w-1/2 relative flex-col items-center justify-center p-12 overflow-hidden cursor-default"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {/* Grid pattern — slowest layer */}
      <motion.div
        className="absolute inset-0 opacity-[0.04] pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(var(--foreground) 1px, transparent 1px), linear-gradient(90deg, var(--foreground) 1px, transparent 1px)`,
          backgroundSize: "48px 48px",
          x: gridX,
          y: gridY,
        }}
      />

      {/* Accent glow — medium layer */}
      <motion.div
        className="absolute top-1/4 left-1/2 -translate-x-1/2 size-[400px] rounded-full bg-pulse/[0.07] blur-[120px] pointer-events-none"
        style={{
          x: glowX,
          y: glowY,
        }}
      />

      {/* Secondary glow — subtle depth */}
      <motion.div
        className="absolute bottom-1/3 right-1/4 size-[250px] rounded-full bg-emerald-500/[0.04] blur-[100px] pointer-events-none"
        style={{
          x: useTransform(smoothX, [-0.5, 0.5], [12, -12]),
          y: useTransform(smoothY, [-0.5, 0.5], [12, -12]),
        }}
      />

      {/* Floating tech logos */}
      <motion.div
        className="absolute inset-0 z-0"
        style={{
          x: useTransform(smoothX, [-0.5, 0.5], [-4, 4]),
          y: useTransform(smoothY, [-0.5, 0.5], [-4, 4]),
        }}
      >
        <FloatingLogos />
      </motion.div>

      {/* Content — layered parallax */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 flex flex-col items-center text-center max-w-sm"
      >
        {/* Logo — fast layer */}
        <motion.div
          className="mb-6 relative"
          style={{ x: logoX, y: logoY }}
        >
          <img
            src="/logo/edupulse-logo.png"
            alt="EduPulse Logo"
            className="h-24 w-auto object-contain rounded-[10px]"
          />
          {/* Logo glow */}
          <div className="absolute inset-0 rounded-2xl bg-pulse/5 blur-xl" />
        </motion.div>

        {/* Description — slow */}
        <motion.p
          className="text-sm text-muted-foreground leading-relaxed"
          style={{
            x: useTransform(smoothX, [-0.5, 0.5], [-5, 5]),
            y: useTransform(smoothY, [-0.5, 0.5], [-5, 5]),
          }}
        >
          Platform analitik akademik untuk visualisasi data, pemantauan pipeline, dan pengambilan keputusan berbasis data.
        </motion.p>

        {/* Status badges — fast layer */}
        <motion.div
          className="flex items-center gap-4 mt-8 text-xs text-muted-foreground"
          style={{ x: badgeX, y: badgeY }}
        >
          <div className="flex items-center gap-1.5">
            <div className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Pipeline aktif
          </div>
          <div className="w-px h-3 bg-border" />
          <div className="flex items-center gap-1.5">
            <div className="size-1.5 rounded-full bg-pulse animate-pulse" />
            Dashboard real-time
          </div>
        </motion.div>
      </motion.div>

      {/* Floating decorative dots — ambient parallax */}
      <motion.div
        className="absolute top-[15%] left-[20%] size-1 rounded-full bg-pulse/30"
        style={{
          x: useTransform(smoothX, [-0.5, 0.5], [-30, 30]),
          y: useTransform(smoothY, [-0.5, 0.5], [-30, 30]),
        }}
      />
      <motion.div
        className="absolute top-[70%] left-[75%] size-1 rounded-full bg-emerald-500/25"
        style={{
          x: useTransform(smoothX, [-0.5, 0.5], [25, -25]),
          y: useTransform(smoothY, [-0.5, 0.5], [25, -25]),
        }}
      />
      <motion.div
        className="absolute top-[30%] right-[15%] size-1.5 rounded-full bg-pulse/20"
        style={{
          x: useTransform(smoothX, [-0.5, 0.5], [-18, 18]),
          y: useTransform(smoothY, [-0.5, 0.5], [-18, 18]),
        }}
      />
      <motion.div
        className="absolute bottom-[20%] left-[30%] size-1 rounded-full bg-muted-foreground/20"
        style={{
          x: useTransform(smoothX, [-0.5, 0.5], [22, -22]),
          y: useTransform(smoothY, [-0.5, 0.5], [22, -22]),
        }}
      />

      {/* Inject keyframes */}
      <style>{`
        @keyframes float-slow {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          33% { transform: translateY(-8px) rotate(1deg); }
          66% { transform: translateY(4px) rotate(-1deg); }
        }
        @keyframes float-medium {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-12px) rotate(-1.5deg); }
        }
        @keyframes float-fast {
          0%, 100% { transform: translateY(0px); }
          25% { transform: translateY(-6px); }
          75% { transform: translateY(6px); }
        }
        .float-slow { animation: float-slow 8s ease-in-out infinite; }
        .float-medium { animation: float-medium 6s ease-in-out infinite; }
        .float-fast { animation: float-fast 5s ease-in-out infinite; }
      `}</style>
    </div>
  )
}

export default function LoginPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = React.useState(false)
  const [showPassword, setShowPassword] = React.useState(false)
  const [email, setEmail] = React.useState("")
  const [password, setPassword] = React.useState("")
  const [error, setError] = React.useState("")

  React.useEffect(() => {
    if (isAuthenticated()) {
      router.replace("/home")
    }
  }, [router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")
    try {
      const formData = new URLSearchParams()
      formData.append("username", email)
      formData.append("password", password)
      const res = await fetch(`${API_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: formData.toString(),
      })
      if (!res.ok) {
        const data = await res.json()
        setError(data.detail || "Login gagal")
        return
      }
      const data = await res.json()
      setAuth(data.access_token, data.refresh_token, data.user)
      router.push("/home")
    } catch {
      setError("Gagal terhubung ke server")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-[100dvh] flex bg-background overflow-hidden">
      <ParallaxPanel />

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center p-6 relative">
        <div
          className="absolute inset-0 opacity-[0.02] pointer-events-none lg:hidden"
          style={{
            backgroundImage: `linear-gradient(var(--foreground) 1px, transparent 1px), linear-gradient(90deg, var(--foreground) 1px, transparent 1px)`,
            backgroundSize: "40px 40px",
          }}
        />

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="w-full max-w-[380px] relative z-10"
        >
          {/* Mobile logo */}
          <motion.div variants={itemVariants} className="flex justify-center mb-8 lg:hidden">
            <img
              src="/logo/edupulse-logo.png"
              alt="EduPulse Logo"
              className="h-12 w-auto object-contain rounded-[10px]"
            />
          </motion.div>

          <motion.div variants={itemVariants}>
            <Card className="border-border/60 bg-card/50 backdrop-blur-sm">
              <CardHeader className="space-y-1 pb-4">
                <CardTitle className="text-xl font-semibold tracking-tight">Masuk</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Gunakan kredensial Anda untuk mengakses platform
                </p>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  {error && (
                    <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                      {error}
                    </div>
                  )}
                  <div className="space-y-2">
                    <label htmlFor="email" className="text-sm font-medium">
                      Surel
                    </label>
                    <div className="relative">
                      <PersonIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                      <input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="admin@edupulse.dev"
                        className="w-full h-10 pl-10 pr-4 rounded-lg border border-border/60 bg-background text-sm placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-pulse/30 focus:border-pulse/50 transition-colors cursor-text"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="password" className="text-sm font-medium">
                      Kata Sandi
                    </label>
                    <div className="relative">
                      <LockClosedIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                      <input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Masukkan kata sandi Anda"
                        className="w-full h-10 pl-10 pr-10 rounded-lg border border-border/60 bg-background text-sm placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-pulse/30 focus:border-pulse/50 transition-colors cursor-text"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                      >
                        {showPassword ? (
                          <EyeClosedIcon className="size-4" />
                        ) : (
                          <EyeOpenIcon className="size-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <input type="checkbox" id="remember" className="rounded border-input cursor-pointer" />
                    <label htmlFor="remember" className="text-sm text-muted-foreground cursor-pointer">
                      Ingat saya
                    </label>
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-pulse hover:bg-pulse/90 text-background font-medium cursor-pointer h-10 transition-all active:scale-[0.98]"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <span className="flex items-center gap-2">
                        <svg className="animate-spin size-4" viewBox="0 0 24 24" fill="none">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        Masuk...
                      </span>
                    ) : (
                      "Masuk"
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </motion.div>

          <motion.p variants={itemVariants} className="text-center text-xs text-muted-foreground/60 mt-6">
            Kredensial demo: admin@edupulse.dev / admin123
          </motion.p>
        </motion.div>
      </div>
    </div>
  )
}
