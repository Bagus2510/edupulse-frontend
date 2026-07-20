import type { Dashboard } from "./constants"

// ── Home Page ──────────────────────────────────────────────

export interface Stat {
  label: string
  value: string
  change: string
  trend: "up" | "down"
  icon: string
}

export const HOME_STATS: Stat[] = [
  { label: "Total Mahasiswa", value: "42,354", change: "+12.5%", trend: "up", icon: "PersonIcon" },
  { label: "Kursus Aktif", value: "22", change: "+2", trend: "up", icon: "DashboardIcon" },
  { label: "Rata-rata Nilai", value: "71.3", change: "-2.1%", trend: "down", icon: "BarChartIcon" },
  { label: "Tingkat Kelulusan", value: "68.7%", change: "+5.4%", trend: "up", icon: "LapTimerIcon" },
]

export interface Activity {
  time: string
  action: string
  status: "success" | "running"
}

export const HOME_ACTIVITIES: Activity[] = [
  { time: "2 menit lalu", action: "Pipeline selesai", status: "success" },
  { time: "1 jam lalu", action: "Dashboard diperbarui", status: "success" },
  { time: "3 jam lalu", action: "Transformasi data dimulai", status: "running" },
  { time: "1 hari lalu", action: "ETL pipeline dijalankan", status: "success" },
]

export const ARCHITECTURE_STEPS = [
  { label: "Data CSV", sub: "Dataset OULAD" },
  { label: "Lapisan Mentah", sub: "PostgreSQL" },
  { label: "DAG Airflow", sub: "Pipeline ETL" },
  { label: "Data Mart", sub: "Teragregasi" },
  { label: "Superset", sub: "Dashboard" },
  { label: "Aplikasi Web", sub: "Next.js" },
]

export const QUICK_ACCESS = [
  { title: "Performa Mahasiswa", desc: "Distribusi nilai & tren", href: "/dashboard", color: "pulse" },
  { title: "Interaksi VLE", desc: "Interaksi pembelajaran virtual", href: "/dashboard", color: "amber-500" },
  { title: "Analisis Hasil", desc: "Korelasi lulus/gagal", href: "/dashboard", color: "emerald-500" },
]

// ── Pipeline Page ──────────────────────────────────────────

export type PipelineStatus = "idle" | "running" | "success" | "failed"

export interface DAG {
  id: string
  name: string
  description: string
  schedule: string
  lastRun: string
  lastStatus: PipelineStatus
  tasks: number
  duration: string
}

export const PIPELINE_DAGS: DAG[] = [
  {
    id: "oulad_etl",
    name: "OULAD ETL Pipeline",
    description: "Extract OULAD CSV → Transform → Load to data mart",
    schedule: "@daily",
    lastRun: "2026-07-19 06:00",
    lastStatus: "success",
    tasks: 4,
    duration: "1m 32s",
  },
  {
    id: "oulad_validate",
    name: "Data Validation",
    description: "Validate raw data integrity & schema checks",
    schedule: "@daily",
    lastRun: "2026-07-19 06:02",
    lastStatus: "success",
    tasks: 3,
    duration: "45s",
  },
  {
    id: "oulad_refresh_mart",
    name: "Mart Refresh",
    description: "Refresh aggregated data mart tables",
    schedule: "Manual",
    lastRun: "2026-07-18 14:30",
    lastStatus: "success",
    tasks: 2,
    duration: "28s",
  },
]

export interface RunRecord {
  dag: string
  run: string
  status: string
  duration: string
  tasks: string
}

export const PIPELINE_RUN_HISTORY: RunRecord[] = [
  { dag: "oulad_etl", run: "manual__2026-07-19T06:00:00", status: "success", duration: "1m 32s", tasks: "4/4" },
  { dag: "oulad_validate", run: "manual__2026-07-19T06:02:00", status: "success", duration: "45s", tasks: "3/3" },
  { dag: "oulad_etl", run: "scheduled__2026-07-18T06:00:00", status: "success", duration: "1m 28s", tasks: "4/4" },
  { dag: "oulad_etl", run: "scheduled__2026-07-17T06:00:00", status: "failed", duration: "32s", tasks: "1/4" },
  { dag: "oulad_refresh_mart", run: "manual__2026-07-18T14:30:00", status: "success", duration: "28s", tasks: "2/2" },
]

// ── AI Analytics Page ──────────────────────────────────────

export type TrendType = "naik" | "turun" | "stabil"

export interface DashboardInsight {
  dashboard_type: string
  summary: string
  key_findings: string[]
  trend: TrendType
  business_recommendation: string
  potential_issue: string | null
  confidence: number
}

export const MOCK_INSIGHTS: Record<string, DashboardInsight> = {
  "student-performance": {
    dashboard_type: "Akademik - Performa Mahasiswa",
    summary: "Dashboard menunjukkan tren peningkatan rata-rata nilai mahasiswa selama 3 semester terakhir, dengan penurunan signifikan pada tingkat partisipasi VLE.",
    key_findings: [
      "Rata-rata nilai meningkat dari 72 ke 78 dalam 3 semester terakhir",
      "Tingkat kelulusan tepat waktu stabil di 85%",
      "Program Studi Teknik Informatika memiliki dropout rate tertinggi",
      "Semester 3 menunjukkan lonjakan interaksi VLE yang belum diikuti peningkatan nilai",
    ],
    trend: "naik",
    business_recommendation: "Fokuskan intervensi akademik pada program studi dengan dropout rate di atas 15%. Pertimbangkan untuk meningkatkan dukungan mentor pada semester awal.",
    potential_issue: "Penurunan jumlah mahasiswa aktif di semester 6 dan 7 belum teridentifikasi penyebabnya",
    confidence: 0.85,
  },
  "vle-engagement": {
    dashboard_type: "Engagement - Interaksi VLE",
    summary: "Pola interaksi VLE menunjukkan pola mingguan yang konsisten dengan puncak aktivitas di hari Selasa dan Rabu.",
    key_findings: [
      "Puncak aktivitas terjadi pada Selasa-Rabu (35% dari total interaksi)",
      "Interaksi weekend sangat rendah (< 5% dari total)",
      "Forum diskusi memiliki engagement 3x lipat dibanding resource download",
      "Materi interaktif menunjukkan retensi belajar 20% lebih tinggi",
    ],
    trend: "stabil",
    business_recommendation: "Optimalkan jadwal konten baru di hari Selasa. Tambahkan elemen interaktif untuk resource yang memiliki engagement rendah.",
    potential_issue: "Tidak ada peningkatan signifikan dalam interaksi selama 2 bulan terakhir",
    confidence: 0.78,
  },
  "outcome-analysis": {
    dashboard_type: "Outcome - Analisis Hasil",
    summary: "Korelasi positif kuat antara frekuensi interaksi VLE dan kelulusan kursus, namun data belum lengkap untuk semua program studi.",
    key_findings: [
      "Korelasi 0.72 antara frekuensi VLE dan nilai akhir",
      "Mahasiswa dengan interaksi > 50x per bulan memiliki kemungkinan lulus 2.3x lebih tinggi",
      "Program studi yang belum memiliki data cukup: 3 dari 8 program",
    ],
    trend: "naik",
    business_recommendation: "Lengkapi data untuk 3 program studi yang belum terpantau. Gunakan threshold 50 interaksi/bulan sebagai indikator awal risiko.",
    potential_issue: "Belum semua program studi memiliki data yang cukup untuk analisis mendalam",
    confidence: 0.65,
  },
}
