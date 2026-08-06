export const API_URL = ""
export const SUPERSET_URL = process.env.NEXT_PUBLIC_SUPERSET_URL || "http://localhost:8088"
export const AIRFLOW_URL = process.env.NEXT_PUBLIC_AIRFLOW_URL || "http://localhost:8080"

export interface Dashboard {
  id: string
  title: string
  description: string
  supersetUuid: string
  status: "active" | "pending"
  statusText?: string
  lastUpdated: string
}

export const DEFAULT_DASHBOARDS: Dashboard[] = [
  {
    id: "student-performance",
    title: "Performa Mahasiswa",
    description: "Distribusi nilai, tingkat kelulusan, dan hasil akademik",
    supersetUuid: "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    status: "active",
    lastUpdated: "2 menit lalu",
  },
  {
    id: "vle-engagement",
    title: "Interaksi VLE",
    description: "Pola interaksi lingkungan pembelajaran virtual",
    supersetUuid: "b2c3d4e5-f6a7-8901-bcde-f12345678901",
    status: "active",
    lastUpdated: "5 menit lalu",
  },
  {
    id: "outcome-analysis",
    title: "Analisis Hasil",
    description: "Korelasi antara interaksi dan kelulusan kursus",
    supersetUuid: "c3d4e5f6-a7b8-9012-cdef-123456789012",
    status: "pending",
    statusText: "Menunggu data",
    lastUpdated: "Belum dihasilkan",
  },
]
