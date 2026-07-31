"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import {
  HomeIcon,
  ArrowLeftIcon,
  LightningBoltIcon,
  MixIcon,
} from "@radix-ui/react-icons"
import { motion, type Variants } from "motion/react"
import Link from "next/link"
import { useRouter } from "next/navigation"

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.06 },
  },
} satisfies Variants

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
} satisfies Variants

function GlitchText() {
  return (
    <div className="relative">
      <motion.h1
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="text-[120px] md:text-[180px] font-bold font-mono leading-none tracking-tighter text-foreground"
      >
        404
      </motion.h1>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.4 }}
        className="absolute inset-0 text-[120px] md:text-[180px] font-bold font-mono leading-none tracking-tighter text-pulse/20"
        style={{ transform: "translate(2px, 2px)" }}
      >
        404
      </motion.div>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.35, duration: 0.4 }}
        className="absolute inset-0 text-[120px] md:text-[180px] font-bold font-mono leading-none tracking-tighter text-red-500/10"
        style={{ transform: "translate(-2px, -2px)" }}
      >
        404
      </motion.div>
    </div>
  )
}

function TerminalLine() {
  return (
    <motion.div
      initial={{ opacity: 0, width: 0 }}
      animate={{ opacity: 1, width: "100%" }}
      transition={{ delay: 0.5, duration: 0.8, ease: "easeOut" }}
      className="font-mono text-xs text-muted-foreground overflow-hidden whitespace-nowrap"
    >
      <span className="text-pulse">root@edupulse</span>
      <span className="text-muted-foreground/50">:</span>
      <span className="text-emerald-500">~</span>
      <span className="text-muted-foreground/50">$ </span>
      <span className="text-foreground">curl /api/route-not-found</span>
      <motion.span
        animate={{ opacity: [1, 0] }}
        transition={{ duration: 0.8, repeat: Infinity, repeatType: "reverse" }}
        className="inline-block w-2 h-4 bg-pulse ml-0.5"
      />
    </motion.div>
  )
}

export default function NotFound() {
  const router = useRouter()

  return (
    <div className="min-h-[100dvh] bg-background flex items-center justify-center p-4">
      {/* Grid pattern background */}
      <div
        className="fixed inset-0 opacity-[0.02] pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(var(--foreground) 1px, transparent 1px), linear-gradient(90deg, var(--foreground) 1px, transparent 1px)`,
          backgroundSize: "40px 40px",
        }}
      />

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="relative z-10 w-full max-w-lg"
      >
        <Card className="border-border/50 bg-card/50 backdrop-blur-sm overflow-hidden">
          <CardContent className="p-0">
            {/* Header strip */}
            <div className="h-1 bg-gradient-to-r from-pulse via-pulse/50 to-transparent" />

            <div className="p-8 md:p-12 flex flex-col items-center text-center space-y-8">
              {/* 404 Glitch */}
              <motion.div variants={itemVariants}>
                <GlitchText />
              </motion.div>

              {/* Terminal */}
              <motion.div variants={itemVariants} className="w-full">
                <div className="rounded-lg border border-border/50 bg-background/50 p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="size-2.5 rounded-full bg-red-500/80" />
                    <div className="size-2.5 rounded-full bg-amber-500/80" />
                    <div className="size-2.5 rounded-full bg-emerald-500/80" />
                    <span className="ml-2 text-[10px] text-muted-foreground font-mono">bash</span>
                  </div>
                  <TerminalLine />
                </div>
              </motion.div>

              {/* Message */}
              <motion.div variants={itemVariants} className="space-y-2">
                <h2 className="text-lg font-semibold">Halaman Tidak Ditemukan</h2>
                <p className="text-sm text-muted-foreground leading-relaxed max-w-sm">
                  Route yang kamu tuhi tidak ada di sistem.
                  Mungkin sudah dipindahkan atau URL-nya salah.
                </p>
              </motion.div>

              {/* Status codes */}
              <motion.div variants={itemVariants} className="flex items-center gap-4 text-xs font-mono">
                <div className="flex items-center gap-1.5">
                  <LightningBoltIcon className="size-3 text-pulse" />
                  <span className="text-muted-foreground">HTTP</span>
                  <span className="text-foreground">404</span>
                </div>
                <Separator orientation="vertical" className="h-3" />
                <div className="flex items-center gap-1.5">
                  <MixIcon className="size-3 text-muted-foreground" />
                  <span className="text-muted-foreground">Status</span>
                  <span className="text-amber-500">Not Found</span>
                </div>
              </motion.div>

              {/* Actions */}
              <motion.div variants={itemVariants} className="flex items-center gap-3 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1.5"
                  onClick={() => router.back()}
                >
                  <ArrowLeftIcon className="size-3.5" />
                  Kembali
                </Button>
                <Link href="/home">
                  <Button size="sm" className="bg-pulse hover:bg-pulse/90 text-background gap-1.5">
                    <HomeIcon className="size-3.5" />
                    Beranda
                  </Button>
                </Link>
              </motion.div>
            </div>
          </CardContent>
        </Card>

        {/* Footer hint */}
        <motion.p
          variants={itemVariants}
          className="text-center text-[10px] text-muted-foreground/50 mt-4 font-mono"
        >
          edupulse analytics platform v1.0.0
        </motion.p>
      </motion.div>
    </div>
  )
}
