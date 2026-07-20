-- Jalankan ini di Supabase SQL Editor

create table if not exists bon (
  id uuid default gen_random_uuid() primary key,
  nomor_bon text not null,
  nama_karyawan text not null,
  tanggal date not null,
  total_bon numeric not null,
  created_at timestamp default now()
);

-- (Opsional tapi disarankan) Aktifkan Row Level Security
alter table bon enable row level security;

-- Izinkan akses publik penuh (cocok untuk internal tool / prototipe)
-- Untuk produksi, sebaiknya ganti dengan auth yang lebih ketat.
create policy "Allow all access" on bon
  for all
  using (true)
  with check (true);



