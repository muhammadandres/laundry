import { supabase } from '@/lib/supabase'
import { NextResponse } from 'next/server'

// PUT perbarui data bon (Edit)
export async function PUT(request, { params }) {
  // PENTING: Tambahkan 'await' pada params
  const { id } = await params 
  
  const body = await request.json()
  const { nomor_bon, nama_karyawan, tanggal, total_bon } = body

  const { data, error } = await supabase
    .from('bon')
    .update({ nomor_bon, nama_karyawan, tanggal, total_bon })
    .eq('id', id)
    .select()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  return NextResponse.json(data)
}

// DELETE hapus data bon
export async function DELETE(request, { params }) {
  // PENTING: Tambahkan 'await' pada params
  const { id } = await params 

  const { error } = await supabase
    .from('bon')
    .delete()
    .eq('id', id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  return NextResponse.json({ message: 'Data bon berhasil dihapus' })
}