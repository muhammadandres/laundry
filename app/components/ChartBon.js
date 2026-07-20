'use client'

import { Bar } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

function formatRupiah(angka) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(angka)
}

function formatRupiahShort(angka) {
  if (angka >= 1_000_000) return `${(angka / 1_000_000).toFixed(1)}jt`
  if (angka >= 1_000) return `${(angka / 1_000).toFixed(0)}rb`
  return angka
}

export default function ChartBon({ data, isFiltered }) {
  if (!data || data.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-12 text-center text-slate-400 mb-8">
        Tidak ada data diagram untuk ditampilkan pada periode ini.
      </div>
    )
  }

  // Kelompokkan data per tanggal (menghitung total nominal & jumlah transaksi bon)
  const map = {}
  data.forEach((d) => {
    if (!map[d.tanggal]) {
      map[d.tanggal] = { total: 0, count: 0 }
    }
    map[d.tanggal].total += Number(d.total_bon)
    map[d.tanggal].count += 1
  })

  // Urutkan dari tanggal lama ke baru agar grafik berjalan berurutan ke kanan
  let entries = Object.entries(map).sort(([a], [b]) => new Date(a) - new Date(b))

  // ATURAN PERSYARATAN: Jika filter kosong, tampilkan MESTI maksimal 3 tanggal terbaru
  if (!isFiltered && entries.length > 3) {
    entries = entries.slice(-3)
  }

  const labels = entries.map(([tanggal]) =>
    new Date(tanggal).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
  )
  const values = entries.map(([, val]) => val.total)
  const counts = entries.map(([, val]) => val.count)

  const chartData = {
    labels,
    datasets: [
      {
        label: 'Total Pendapatan',
        data: values,
        backgroundColor: '#3b82f6',
        hoverBackgroundColor: '#1d4ed8',
        borderRadius: 8,
        maxBarThickness: 64,
      },
    ],
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      title: { display: false },
      tooltip: {
        backgroundColor: '#0f172a',
        padding: 12,
        titleFont: { size: 13, weight: 'bold' },
        bodyFont: { size: 13 },
        cornerRadius: 8,
        displayColors: false,
        callbacks: {
          title: (items) => items[0].label,
          label: (ctx) => {
            const index = ctx.dataIndex
            const totalRp = formatRupiah(ctx.parsed.y)
            const totalBon = counts[index]
            return [
              `Total Pendapatan : ${totalRp}`,
              `Total Transaksi     : ${totalBon} Bon`,
            ]
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: { color: '#f1f5f9' },
        ticks: {
          callback: (value) => formatRupiahShort(value),
          color: '#64748b',
          font: { weight: '500' },
        },
      },
      x: {
        grid: { display: false },
        ticks: { color: '#475569', font: { weight: '600' } },
      },
    },
  }

  const minWidth = Math.max(labels.length * 140, 300)

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 md:p-8 mb-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
        <div>
          <h2 className="text-lg font-bold text-slate-900">
            {isFiltered ? 'Diagram Pendapatan (Tersaring)' : '3 Diagram Pendapatan Terbaru'}
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Arahkan kursor pada batang grafik untuk melihat rincian transaksi
          </p>
        </div>
        {!isFiltered && entries.length === 3 && (
          <span className="text-xs bg-slate-100 text-slate-600 font-semibold px-3 py-1 rounded-full self-start sm:self-auto">
            Menampilkan 3 Hari Terakhir
          </span>
        )}
      </div>
      <div className="overflow-x-auto pb-2">
        <div style={{ minWidth: `${minWidth}px`, height: '340px' }}>
          <Bar data={chartData} options={options} />
        </div>
      </div>
    </div>
  )
}