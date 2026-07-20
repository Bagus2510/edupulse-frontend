"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { PageSkeletonWrapper } from "@/components/skeletons/page-skeleton-wrapper"
import { HomeSkeleton } from "@/components/skeletons/home-skeleton"
import {
  BarChartIcon,
  RocketIcon,
  PersonIcon,
  LapTimerIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  MixIcon,
  DashboardIcon,
} from "@radix-ui/react-icons"
import { motion } from "motion/react"
import Link from "next/link"
import { HOME_STATS, HOME_ACTIVITIES, ARCHITECTURE_STEPS, QUICK_ACCESS } from "@/lib/mock-data"

const iconMap = { PersonIcon, DashboardIcon, BarChartIcon, LapTimerIcon } as const
const colorMap = {
  "pulse": { bg: "bg-pulse/10", hover: "group-hover:bg-pulse/20", text: "text-pulse", icon: "text-pulse" },
  "amber-500": { bg: "bg-amber-500/10", hover: "group-hover:bg-amber-500/20", text: "text-amber-500", icon: "text-amber-500" },
  "emerald-500": { bg: "bg-emerald-500/10", hover: "group-hover:bg-emerald-500/20", text: "text-emerald-500", icon: "text-emerald-500" },
} as const

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" as const } },
}

export default function HomePage() {
  return (
    <PageSkeletonWrapper skeleton={<HomeSkeleton />}>
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="space-y-6 max-w-7xl mx-auto"
    >
      {/* Hero Header */}
      <motion.div variants={itemVariants} className="space-y-2">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center size-10 rounded-xl bg-pulse/10 border border-pulse/20">
            <MixIcon className="size-5 text-pulse" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Ringkasan</h1>
            <p className="text-sm text-muted-foreground">
              Analitik akademik dalam sekilas
            </p>
          </div>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <motion.div
        variants={itemVariants}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        {HOME_STATS.map((stat) => {
          const Icon = iconMap[stat.icon as keyof typeof iconMap]
          return (
            <Card key={stat.label} className="relative overflow-hidden group">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardDescription className="text-[11px] uppercase tracking-widest">
                    {stat.label}
                  </CardDescription>
                  {Icon && <Icon className="size-4 text-muted-foreground" />}
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-end justify-between">
                  <span className="text-3xl font-bold tracking-tighter font-mono">
                    {stat.value}
                  </span>
                  <div
                    className={`flex items-center gap-1 text-xs font-medium ${
                      stat.trend === "up" ? "text-emerald-500" : "text-red-400"
                    }`}
                  >
                    {stat.trend === "up" ? (
                      <ArrowUpIcon className="size-3" />
                    ) : (
                      <ArrowDownIcon className="size-3" />
                    )}
                    {stat.change}
                  </div>
                </div>
                <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-pulse/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              </CardContent>
            </Card>
          )
        })}
      </motion.div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Architecture Overview */}
        <motion.div variants={itemVariants} className="lg:col-span-2">
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="text-base">Arsitektur</CardTitle>
              <CardDescription>Alur data platform</CardDescription>
            </CardHeader>
            <CardContent className="overflow-hidden">
              <div className="relative">
                <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
                  {ARCHITECTURE_STEPS.map((step, i) => (
                    <div key={step.label} className="flex items-center gap-1.5 shrink-0">
                      <div className="flex items-center gap-2 p-2.5 rounded-lg border bg-card/50 hover:border-pulse/30 transition-colors min-w-0">
                        <div className="size-7 rounded-md bg-pulse/10 flex items-center justify-center shrink-0">
                          <span className="text-[10px] font-bold text-pulse font-mono">
                            {String(i + 1).padStart(2, "0")}
                          </span>
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className="text-xs font-medium truncate">{step.label}</span>
                          <span className="text-[10px] text-muted-foreground truncate">{step.sub}</span>
                        </div>
                      </div>
                      {i < ARCHITECTURE_STEPS.length - 1 && (
                        <div className="text-muted-foreground/40 shrink-0">
                          <svg width="16" height="6" viewBox="0 0 16 6" fill="none">
                            <path
                              d="M0 3H14M14 3L11 0.5M14 3L11 5.5"
                              stroke="currentColor"
                              strokeWidth="1.2"
                            />
                          </svg>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Recent Activity */}
        <motion.div variants={itemVariants}>
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="text-base">Aktivitas Terkini</CardTitle>
              <CardDescription>Run pipeline terbaru</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {HOME_ACTIVITIES.map((activity, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="mt-1 relative">
                      <div
                        className={`size-2 rounded-full ${
                          activity.status === "success"
                            ? "bg-emerald-500"
                            : "bg-amber-500 animate-pulse"
                        }`}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{activity.action}</p>
                      <p className="text-xs text-muted-foreground">{activity.time}</p>
                    </div>
                    <Badge
                      variant={activity.status === "success" ? "success" : "warning"}
                      className="shrink-0"
                    >
                      {activity.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Quick Access Cards */}
      <motion.div variants={itemVariants}>
        <Separator className="my-2" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          {QUICK_ACCESS.map((item) => {
            const c = colorMap[item.color as keyof typeof colorMap]
            const quickIcons = [BarChartIcon, RocketIcon, LapTimerIcon]
            const qi = QUICK_ACCESS.indexOf(item)
            const QIcon = quickIcons[qi]
            return (
              <Link key={item.title} href={item.href} className="block">
                <Card className="group cursor-pointer hover:border-pulse/30 transition-all duration-300">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className={`size-10 rounded-lg ${c.bg} flex items-center justify-center ${c.hover} transition-colors`}>
                        <QIcon className={`size-5 ${c.icon}`} />
                      </div>
                      <div>
                        <CardTitle className="text-sm">{item.title}</CardTitle>
                        <CardDescription className="text-xs">
                          {item.desc}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              </Link>
            )
          })}
        </div>
      </motion.div>
    </motion.div>
    </PageSkeletonWrapper>
  )
}
