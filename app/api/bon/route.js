import { supabase } from '@/lib/supabase'
import { NextResponse } from 'next/server'

// GET data dengan filter fleksibel & server-side pagination
export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const month = searchParams.get('month')
  const year = searchParams.get('year')
  const date = searchParams.get('date')
  const nama = searchParams.get('nama_karyawan')
  const nomor = searchParams.get('nomor_bon')
  const limit = searchParams.get('limit') || 'all'
  const page = parseInt(searchParams.get('page') || '1', 10)

  let query = supabase.from('bon').select('*', { count: 'exact' })

  // Filter teks opsional
  if (nomor) query = query.ilike('nomor_bon', `%${nomor}%`)
  if (nama) query = query.ilike('nama_karyawan', `%${nama}%`)

  // Filter waktu (Tanggal spesifik ATAU Bulan+Tahun)
  if (date) {
    query = query.eq('tanggal', date)
  } else if (year) {
    if (month && month !== '') {
      const m = month.padStart(2, '0')
      const lastDay = new Date(year, parseInt(month, 10), 0).getDate()
      query = query.gte('tanggal', `${year}-${m}-01`).lte('tanggal', `${year}-${m}-${lastDay}`)
    } else {
      query = query.gte('tanggal', `${year}-01-01`).lte('tanggal', `${year}-12-31`)
    }
  }

  // Urutkan dari tanggal & ID terbaru
  query = query.order('tanggal', { ascending: false }).order('id', { ascending: false })

  // Pagination (jika tidak memilih 'all')
  if (limit !== 'all') {
    const l = parseInt(limit, 10)
    const from = (page - 1) * l
    const to = from + l - 1
    query = query.range(from, to)
  }

  const { data, error, count } = await query

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ data, count })
}

// POST tambah bon baru
export async function POST(request) {
  const body = await request.json()
  const { nomor_bon, nama_karyawan, tanggal, total_bon } = body

  if (!nomor_bon || !nama_karyawan || !tanggal || !total_bon) {
    return NextResponse.json({ error: 'Semua field wajib diisi' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('bon')
    .insert([{ nomor_bon, nama_karyawan, tanggal, total_bon }])
    .select()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  return NextResponse.json(data[0], { status: 201 })
}