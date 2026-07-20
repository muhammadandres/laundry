'use client'

function formatRupiah(angka) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(angka)
}

function formatTanggal(tgl) {
  if (!tgl) return '-'
  return new Date(tgl).toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

export default function TabelBon({
  data,
  onEdit,
  onDelete,
  page,
  limit,
  totalCount,
  onPageChange,
  onLimitChange,
}) {
  if (!data || data.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-16 text-center text-slate-400 font-medium">
        Tidak ada data bon laundry yang ditemukan.
      </div>
    )
  }

  // Hitung jumlah halaman pagination
  const isAll = limit === 'all'
  const totalPages = isAll ? 1 : Math.ceil(totalCount / Number(limit))

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden flex flex-col justify-between">
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-50 text-slate-500 uppercase text-[11px] font-bold tracking-wider border-b border-slate-100">
            <tr>
              <th className="px-6 py-4">Nomor Bon</th>
              <th className="px-6 py-4">Karyawan</th>
              <th className="px-6 py-4">Tanggal</th>
              <th className="px-6 py-4 text-right">Total Nominal</th>
              <th className="px-6 py-4 text-center w-28">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {data.map((bon) => (
              <tr key={bon.id} className="hover:bg-slate-50/80 transition-colors">
                <td className="px-6 py-4 font-bold text-slate-900 whitespace-nowrap">
                  {bon.nomor_bon}
                </td>
                <td className="px-6 py-4 text-slate-700 font-medium whitespace-nowrap">
                  {bon.nama_karyawan}
                </td>
                <td className="px-6 py-4 text-slate-500 whitespace-nowrap">
                  {formatTanggal(bon.tanggal)}
                </td>
                <td className="px-6 py-4 text-right font-bold text-slate-900 whitespace-nowrap">
                  {formatRupiah(bon.total_bon)}
                </td>
                <td className="px-6 py-4 text-center whitespace-nowrap">
                  <div className="flex items-center justify-center space-x-2">
                    <button
                      onClick={() => onEdit(bon)}
                      className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-md text-xs font-semibold transition"
                      title="Edit Bon"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => onDelete(bon.id)}
                      className="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-md text-xs font-semibold transition"
                      title="Hapus Bon"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Bagian Pagination Profesional */}
      <div className="bg-slate-50/50 px-6 py-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs font-medium text-slate-600">
        <div className="flex items-center space-x-2">
          <span>Tampilkan:</span>
          <select
            value={limit}
            onChange={(e) => onLimitChange(e.target.value)}
            className="border border-slate-200 rounded-lg px-2.5 py-1.5 bg-white text-slate-800 font-semibold focus:outline-none focus:ring-1 focus:ring-blue-500 shadow-2xs"
          >
            <option value="10">10</option>
            <option value="25">25</option>
            <option value="50">50</option>
            <option value="100">100</option>
            <option value="all">All</option>
          </select>
          <span>data per halaman <span className="text-slate-400 font-normal">(Total: {totalCount} Bon)</span></span>
        </div>

        {!isAll && totalPages > 1 && (
          <div className="flex items-center space-x-1.5 self-end sm:self-auto">
            <button
              onClick={() => onPageChange(Math.max(1, page - 1))}
              disabled={page === 1}
              className="px-3 py-1.5 border border-slate-200 rounded-lg bg-white hover:bg-slate-100 disabled:opacity-40 disabled:hover:bg-white font-semibold transition shadow-2xs"
            >
              Previous
            </button>
            
            <div className="flex items-center space-x-1 px-1">
              {[...Array(totalPages)].map((_, idx) => {
                const pName = idx + 1
                // Tampilkan halaman pertama, terakhir, dan sekitar halaman saat ini
                if (pName === 1 || pName === totalPages || (pName >= page - 1 && pName <= page + 1)) {
                  return (
                    <button
                      key={pName}
                      onClick={() => onPageChange(pName)}
                      className={`w-8 h-8 rounded-lg font-bold flex items-center justify-center transition shadow-2xs ${
                        page === pName
                          ? 'bg-blue-600 text-white border border-blue-600'
                          : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      {pName}
                    </button>
                  )
                } else if (pName === page - 2 || pName === page + 2) {
                  return <span key={pName} className="px-1 text-slate-400 font-bold">...</span>
                }
                return null
              })}
            </div>

            <button
              onClick={() => onPageChange(Math.min(totalPages, page + 1))}
              disabled={page === totalPages}
              className="px-3 py-1.5 border border-slate-200 rounded-lg bg-white hover:bg-slate-100 disabled:opacity-40 disabled:hover:bg-white font-semibold transition shadow-2xs"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  )
}