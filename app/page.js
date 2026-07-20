'use client'

import { useEffect, useState, useCallback } from 'react'
import Navbar from './components/Navbar'
import FormBon from './components/FormBon'
import TabelBon from './components/TabelBon'
import ChartBon from './components/ChartBon'
import EditModal from './components/EditModal'

function formatRupiah(angka) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(angka || 0)
}

function formatTanggal(tgl) {
  if (!tgl) return '-'
  return new Date(tgl).toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

const BULAN_OPTIONS = [
  { val: '', label: 'Semua Bulan' },
  { val: '1', label: 'Januari' },
  { val: '2', label: 'Februari' },
  { val: '3', label: 'Maret' },
  { val: '4', label: 'April' },
  { val: '5', label: 'Mei' },
  { val: '6', label: 'Juni' },
  { val: '7', label: 'Juli' },
  { val: '8', label: 'Agustus' },
  { val: '9', label: 'September' },
  { val: '10', label: 'Oktober' },
  { val: '11', label: 'November' },
  { val: '12', label: 'Desember' },
]

const TAHUN_OPTIONS = ['2024', '2025', '2026', '2027']

export default function Home() {
  // Navigasi
  const [activeTab, setActiveTab] = useState('dashboard')

  // Data Global Dashboard
  const [dashData, setDashData] = useState([])
  const [dashLoading, setDashLoading] = useState(true)
  const [dashMonth, setDashMonth] = useState('')
  const [dashYear, setDashYear] = useState('')

  // Data Rekap & Diagram (Halaman 2)
  const [rekapData, setRekapData] = useState([])
  const [rekapCount, setRekapCount] = useState(0)
  const [rekapLoading, setRekapLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState('10')

  // Filter Rekap
  const [fNama, setFNama] = useState('')
  const [fNomor, setFNomor] = useState('')
  const [fTanggal, setFTanggal] = useState('')
  const [fBulan, setFBulan] = useState('')
  const [fTahun, setFTahun] = useState('')

  // Data Karyawan (Halaman 3)
  const [karData, setKarData] = useState([])
  const [karLoading, setKarLoading] = useState(false)
  const [karNama, setKarNama] = useState('')
  const [karBulan, setKarBulan] = useState('')
  const [karTahun, setKarTahun] = useState(new Date().getFullYear().toString())

  // Modal Edit
  const [editingBon, setEditingBon] = useState(null)

  // 1. Fetch Dashboard Data
  const fetchDashboard = useCallback(async () => {
    setDashLoading(true)
    const params = new URLSearchParams()
    if (dashMonth) params.append('month', dashMonth)
    if (dashYear) params.append('year', dashYear)
    params.append('limit', 'all')

    try {
      const res = await fetch(`/api/bon?${params.toString()}`)
      const json = await res.json()
      setDashData(json.data || [])
    } catch (e) {
      console.error(e)
    } finally {
      setDashLoading(false)
    }
  }, [dashMonth, dashYear])

  // 2. Fetch Rekap Data
  const fetchRekap = useCallback(async () => {
    setRekapLoading(true)
    const params = new URLSearchParams()
    params.append('page', page.toString())
    params.append('limit', limit)
    if (fNama) params.append('nama_karyawan', fNama)
    if (fNomor) params.append('nomor_bon', fNomor)
    if (fTanggal) params.append('date', fTanggal)
    if (fBulan) params.append('month', fBulan)
    if (fTahun) params.append('year', fTahun)

    try {
      const res = await fetch(`/api/bon?${params.toString()}`)
      const json = await res.json()
      setRekapData(json.data || [])
      setRekapCount(json.count || 0)
    } catch (e) {
      console.error(e)
    } finally {
      setRekapLoading(false)
    }
  }, [page, limit, fNama, fNomor, fTanggal, fBulan, fTahun])

  // 3. Fetch Data Karyawan
  const fetchKaryawan = useCallback(async () => {
    setKarLoading(true)
    const params = new URLSearchParams()
    params.append('limit', 'all')
    if (karNama) params.append('nama_karyawan', karNama)
    if (karBulan) params.append('month', karBulan)
    if (karTahun) params.append('year', karTahun)

    try {
      const res = await fetch(`/api/bon?${params.toString()}`)
      const json = await res.json()
      setKarData(json.data || [])
    } catch (e) {
      console.error(e)
    } finally {
      setKarLoading(false)
    }
  }, [karNama, karBulan, karTahun])

  // Trigger useEffect sesuai Tab
  useEffect(() => {
    if (activeTab === 'dashboard') fetchDashboard()
  }, [activeTab, fetchDashboard])

  useEffect(() => {
    if (activeTab === 'rekap') fetchRekap()
  }, [activeTab, fetchRekap])

  useEffect(() => {
    if (activeTab === 'karyawan') fetchKaryawan()
  }, [activeTab, fetchKaryawan])

  // Aksi Hapus & Refresh Global
  async function handleDelete(id) {
    if (!confirm('Yakin ingin menghapus data bon ini?')) return
    await fetch(`/api/bon/${id}`, { method: 'DELETE' })
    if (activeTab === 'dashboard') fetchDashboard()
    if (activeTab === 'rekap') fetchRekap()
    if (activeTab === 'karyawan') fetchKaryawan()
  }

  function handleSuccessChange() {
    fetchDashboard()
    fetchRekap()
    fetchKaryawan()
  }

  // Hitung Statistik Dashboard
  const totalBonCount = dashData.length
  const totalPendapatan = dashData.reduce((sum, b) => sum + Number(b.total_bon), 0)

  // Cek apakah filter di Diagram & Rekap aktif
  const isRekapFiltered = Boolean(fNama || fNomor || fTanggal || fBulan || fTahun)

  // Hitung Total Pendapatan Khusus Tab Karyawan
  const totalKarPendapatan = karData.reduce((sum, b) => sum + Number(b.total_bon), 0)

  const inputFilterClass =
    'w-full border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-2xs'

  return (
    <div className="min-h-screen bg-slate-50/70 flex flex-col font-sans">
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* ========================================================
            TAB 1 : DASHBOARD UTAMA
        ======================================================== */}
        {activeTab === 'dashboard' && (
          <div className="space-y-8 animate-fadeIn">
            {/* Header & Filter Periode */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
              <div>
                <h1 className="text-xl font-bold text-slate-900">Dashboard Utama</h1>
                <p className="text-xs text-slate-500 mt-0.5">Ringkasan performa dan transaksi bon laundry harian</p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <select value={dashMonth} onChange={(e) => setDashMonth(e.target.value)} className={inputFilterClass}>
                  {BULAN_OPTIONS.map((o) => (
                    <option key={o.val} value={o.val}>{o.label}</option>
                  ))}
                </select>
                <select value={dashYear} onChange={(e) => setDashYear(e.target.value)} className={inputFilterClass}>
                  <option value="">Semua Tahun</option>
                  {TAHUN_OPTIONS.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
                {(dashMonth || dashYear) && (
                  <button
                    onClick={() => { setDashMonth(''); setDashYear('') }}
                    className="text-xs font-bold text-rose-500 hover:text-rose-700 px-2 py-1"
                  >
                    Reset
                  </button>
                )}
              </div>
            </div>

            {/* Card Statistik (Hanya 2 Card Sesuai Aturan) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Transaksi Bon</p>
                  <p className="text-3xl font-black text-slate-900 mt-2">
                    {dashLoading ? '...' : totalBonCount}
                    <span className="text-sm font-semibold text-slate-400 font-normal ml-1.5">Bon</span>
                  </p>
                </div>
                <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center shadow-inner">
                  <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Pendapatan</p>
                  <p className="text-3xl font-black text-blue-600 mt-2">
                    {dashLoading ? '...' : formatRupiah(totalPendapatan)}
                  </p>
                </div>
                <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center shadow-inner">
                  <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Form Input Bon */}
            <FormBon onSuccess={handleSuccessChange} />
          </div>
        )}

        {/* ========================================================
            TAB 2 : DIAGRAM & REKAP DATA
        ======================================================== */}
        {activeTab === 'rekap' && (
          <div className="space-y-8 animate-fadeIn">
            {/* Filter Lengkap Rekap */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Pencarian & Filter Kombinasi</h3>
                {isRekapFiltered && (
                  <button
                    onClick={() => { setFNama(''); setFNomor(''); setFTanggal(''); setFBulan(''); setFTahun(''); setPage(1) }}
                    className="text-xs font-bold text-rose-500 hover:text-rose-700 bg-rose-50 px-3 py-1 rounded-lg transition"
                  >
                    Reset Semua Filter
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Nama Karyawan</label>
                  <input
                    type="text"
                    value={fNama}
                    onChange={(e) => { setFNama(e.target.value); setPage(1) }}
                    placeholder="Cari nama..."
                    className={inputFilterClass}
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Nomor Bon</label>
                  <input
                    type="text"
                    value={fNomor}
                    onChange={(e) => { setFNomor(e.target.value); setPage(1) }}
                    placeholder="BON-xxx"
                    className={inputFilterClass}
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Tanggal Spesifik</label>
                  <input
                    type="date"
                    value={fTanggal}
                    onChange={(e) => { setFTanggal(e.target.value); setPage(1) }}
                    className={inputFilterClass}
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Bulan</label>
                  <select value={fBulan} onChange={(e) => { setFBulan(e.target.value); setPage(1) }} className={inputFilterClass} disabled={Boolean(fTanggal)}>
                    {BULAN_OPTIONS.map((o) => (
                      <option key={o.val} value={o.val}>{o.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Tahun</label>
                  <select value={fTahun} onChange={(e) => { setFTahun(e.target.value); setPage(1) }} className={inputFilterClass} disabled={Boolean(fTanggal)}>
                    <option value="">Semua Tahun</option>
                    {TAHUN_OPTIONS.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Diagram */}
            {rekapLoading ? (
              <div className="bg-white rounded-2xl p-12 text-center text-slate-400 font-medium">Memuat diagram...</div>
            ) : (
              <ChartBon data={rekapData} isFiltered={isRekapFiltered} />
            )}

            {/* Tabel Rekap dengan Pagination */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-bold text-slate-900">Rekapitulasi Data Bon</h2>
              </div>
              {rekapLoading ? (
                <div className="bg-white rounded-2xl p-16 text-center text-slate-400 font-medium">Memuat data tabel...</div>
              ) : (
                <TabelBon
                  data={rekapData}
                  onEdit={(bon) => setEditingBon(bon)}
                  onDelete={handleDelete}
                  page={page}
                  limit={limit}
                  totalCount={rekapCount}
                  onPageChange={(newPage) => setPage(newPage)}
                  onLimitChange={(newLimit) => { setLimit(newLimit); setPage(1) }}
                />
              )}
            </div>
          </div>
        )}

        {/* ========================================================
            TAB 3 : REKAP PER KARYAWAN
        ======================================================== */}
        {activeTab === 'karyawan' && (
          <div className="space-y-6 animate-fadeIn">
            {/* Filter Khusus Karyawan */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 flex-1">
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Nama Karyawan</label>
                  <input
                    type="text"
                    value={karNama}
                    onChange={(e) => setKarNama(e.target.value)}
                    placeholder="Ketik nama karyawan..."
                    className={inputFilterClass}
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Bulan</label>
                  <select value={karBulan} onChange={(e) => setKarBulan(e.target.value)} className={inputFilterClass}>
                    {BULAN_OPTIONS.map((o) => (
                      <option key={o.val} value={o.val}>{o.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Tahun</label>
                  <select value={karTahun} onChange={(e) => setKarTahun(e.target.value)} className={inputFilterClass}>
                    <option value="">Semua Tahun</option>
                    {TAHUN_OPTIONS.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
              </div>

              {(karNama || karBulan) && (
                <button
                  onClick={() => { setKarNama(''); setKarBulan('') }}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition whitespace-nowrap self-start md:self-auto"
                >
                  Reset Filter
                </button>
              )}
            </div>

            {/* Total Pendapatan Karyawan */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-6 text-white shadow-lg shadow-blue-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-blue-200">Total Pendapatan Karyawan Terpilih</p>
                <h3 className="text-2xl sm:text-3xl font-black mt-1">
                  {karNama ? `Karyawan: ${karNama}` : 'Seluruh Karyawan'}
                </h3>
              </div>
              <div className="bg-white/10 backdrop-blur-md px-6 py-3 rounded-xl border border-white/20 text-right">
                <p className="text-[11px] font-bold uppercase text-blue-100">Total Periode Ini</p>
                <p className="text-2xl font-black text-white">{formatRupiah(totalKarPendapatan)}</p>
              </div>
            </div>

            {/* Tabel Khusus Karyawan */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-slate-50 text-slate-500 uppercase text-[11px] font-bold tracking-wider border-b border-slate-100">
                    <tr>
                      <th className="px-6 py-4">Nomor Bon</th>
                      <th className="px-6 py-4">Nama Karyawan</th>
                      <th className="px-6 py-4">Tanggal Transaksi</th>
                      <th className="px-6 py-4 text-right">Total Harga Bon</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {karLoading ? (
                      <tr>
                        <td colSpan="4" className="px-6 py-12 text-center text-slate-400 font-medium">Memuat data karyawan...</td>
                      </tr>
                    ) : karData.length === 0 ? (
                      <tr>
                        <td colSpan="4" className="px-6 py-12 text-center text-slate-400 font-medium">Tidak ada transaksi bon pada kriteria ini.</td>
                      </tr>
                    ) : (
                      karData.map((bon) => (
                        <tr key={bon.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="px-6 py-4 font-bold text-slate-900">{bon.nomor_bon}</td>
                          <td className="px-6 py-4 text-slate-700 font-medium">{bon.nama_karyawan}</td>
                          <td className="px-6 py-4 text-slate-500">{formatTanggal(bon.tanggal)}</td>
                          <td className="px-6 py-4 text-right font-bold text-slate-900">{formatRupiah(bon.total_bon)}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Modal Edit Dialog */}
      <EditModal
        bon={editingBon}
        onClose={() => setEditingBon(null)}
        onSuccess={handleSuccessChange}
      />
    </div>
  )
}