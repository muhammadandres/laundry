'use client'

import { useState, useEffect } from 'react'

function formatRupiahInput(value) {
  const angka = value.toString().replace(/\D/g, '')
  if (!angka) return ''
  return new Intl.NumberFormat('id-ID').format(Number(angka))
}

export default function EditModal({ bon, onClose, onSuccess }) {
  const [form, setForm] = useState({
    nomor_bon: '',
    nama_karyawan: '',
    tanggal: '',
    total_bon: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (bon) {
      setForm({
        nomor_bon: bon.nomor_bon || '',
        nama_karyawan: bon.nama_karyawan || '',
        tanggal: bon.tanggal || '',
        total_bon: formatRupiahInput(bon.total_bon || ''),
      })
    }
  }, [bon])

  if (!bon) return null

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
      const res = await fetch(`/api/bon/${bon.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nomor_bon: form.nomor_bon,
          nama_karyawan: form.nama_karyawan,
          tanggal: form.tanggal,
          total_bon: totalNumeric,
        }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Gagal memperbarui data')

      onSuccess?.()
      onClose()
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const inputClass =
    'w-full border border-slate-300 rounded-xl px-3.5 py-2.5 text-slate-800 placeholder-slate-400 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-medium transition'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-100 max-w-lg w-full p-6 sm:p-8 overflow-hidden transform transition-all">
        <div className="flex items-center justify-between pb-4 mb-5 border-b border-slate-100">
          <h3 className="text-lg font-bold text-slate-900">Edit Data Bon</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-xl font-bold p-1">&times;</button>
        </div>

        {error && (
          <div className="mb-4 bg-rose-50 border border-rose-200 text-rose-600 text-sm p-3 rounded-xl">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">Nomor Bon</label>
            <input type="text" name="nomor_bon" value={form.nomor_bon} onChange={handleChange} required className={inputClass} />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">Nama Karyawan</label>
            <input type="text" name="nama_karyawan" value={form.nama_karyawan} onChange={handleChange} required className={inputClass} />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">Tanggal</label>
            <input type="date" name="tanggal" value={form.tanggal} onChange={handleChange} required className={inputClass} />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">Total Bon (Rp)</label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-semibold">Rp</span>
              <input type="text" inputMode="numeric" name="total_bon" value={form.total_bon} onChange={handleTotalChange} required className={`${inputClass} pl-10 font-bold text-slate-900`} />
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4 mt-6 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 text-sm font-semibold transition"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 rounded-xl bg-blue-600 text-white hover:bg-blue-700 text-sm font-semibold shadow-sm transition disabled:opacity-50"
            >
              {loading ? 'Menyimpan...' : 'Simpan Perubahan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}