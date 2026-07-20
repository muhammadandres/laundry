'use client'

import { useState } from 'react'

function formatRupiahInput(value) {
  const angka = value.replace(/\D/g, '')
  if (!angka) return ''
  return new Intl.NumberFormat('id-ID').format(Number(angka))
}

export default function FormBon({ onSuccess }) {
  const [form, setForm] = useState({
    nomor_bon: '',
    nama_karyawan: '',
    tanggal: new Date().toISOString().split('T')[0], // Default hari ini
    total_bon: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  function handleTotalChange(e) {
    const formatted = formatRupiahInput(e.target.value)
    setForm({ ...form, total_bon: formatted })
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const totalNumeric = Number(form.total_bon.replace(/\./g, ''))
      const res = await fetch('/api/bon', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nomor_bon: form.nomor_bon,
          nama_karyawan: form.nama_karyawan,
          tanggal: form.tanggal,
          total_bon: totalNumeric,
        }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Gagal menyimpan transaksi')

      setForm({ nomor_bon: '', nama_karyawan: '', tanggal: new Date().toISOString().split('T')[0], total_bon: '' })
      onSuccess?.()
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const inputClass =
    'w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-800 placeholder-slate-400 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition text-sm font-medium'

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 md:p-8">
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Input Transaksi Bon Baru</h2>
          <p className="text-xs text-slate-500 mt-0.5">Masukkan detail transaksi laundry secara akurat</p>
        </div>
        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-600">
          Form Input
        </span>
      </div>

      {error && (
        <div className="mb-6 bg-rose-50 border border-rose-200 text-rose-600 text-sm px-4 py-3 rounded-xl flex items-center justify-between">
          <span>{error}</span>
          <button type="button" onClick={() => setError('')} className="text-rose-400 hover:text-rose-600 font-bold">&times;</button>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-6">
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">Nomor Bon</label>
          <input type="text" name="nomor_bon" value={form.nomor_bon} onChange={handleChange} required className={inputClass} placeholder="Contoh: BON-001" />
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">Nama Karyawan</label>
          <input type="text" name="nama_karyawan" value={form.nama_karyawan} onChange={handleChange} required className={inputClass} placeholder="Nama Karyawan" />
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">Tanggal Transaksi</label>
          <input type="date" name="tanggal" value={form.tanggal} onChange={handleChange} required className={inputClass} />
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">Total Bon (Rp)</label>
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-semibold">Rp</span>
            <input type="text" inputMode="numeric" name="total_bon" value={form.total_bon} onChange={handleTotalChange} required className={`${inputClass} pl-10 font-bold text-slate-900`} placeholder="0" />
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={loading}
          className="w-full sm:w-auto bg-blue-600 text-white px-8 py-2.5 rounded-xl font-semibold hover:bg-blue-700 active:scale-[0.99] disabled:opacity-50 transition shadow-sm hover:shadow-md hover:shadow-blue-500/20 text-sm flex items-center justify-center space-x-2"
        >
          {loading ? (
            <>
              <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
              </svg>
              <span>Menyimpan...</span>
            </>
          ) : (
            <span>Simpan Transaksi Bon</span>
          )}
        </button>
      </div>
    </form>
  )
}