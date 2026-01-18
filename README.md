# To-Do List Application - UAS Pemrograman Website II

Aplikasi To-Do List modern dengan PHP REST API, MySQL Database, dan Bootstrap 5.

## Fitur

- ✅ Tambah, Edit, Hapus tugas
- ✅ Tandai tugas selesai/belum selesai
- ✅ **Deadline untuk setiap tugas**
- ✅ Filter tugas (Semua, Belum Selesai, Selesai, Deadline Hari Ini)
- ✅ Statistik tugas real-time
- ✅ Penanda visual untuk tugas deadline & terlambat
- ✅ REST API dengan PHP
- ✅ Database MySQL
- ✅ Desain responsif dengan Bootstrap 5
- ✅ UI modern dan menarik

## Teknologi

- PHP (REST API)
- MySQL (Database)
- JavaScript (Vanilla)
- Bootstrap 5

## Cara Menjalankan

### 1. Setup Database
1. Buka XAMPP Control Panel
2. Start Apache dan MySQL
3. Buka phpMyAdmin (http://localhost/phpmyadmin)
4. Buat database baru dengan nama `todolist_db`
5. Import file `database/todolist_db.sql` atau jalankan query SQL di dalamnya

### 2. Konfigurasi
File `api/config.php` sudah dikonfigurasi dengan setting default XAMPP:
- Host: localhost
- User: root
- Password: (kosong)
- Database: todolist_db

Jika konfigurasi MySQL Anda berbeda, edit file `api/config.php`



### 3. Jalankan Aplikasi
1. Copy folder project ke `C:\xampp\htdocs\todolist`
2. Pastikan Apache dan MySQL di XAMPP sudah running
3. Buka browser: http://localhost/todolist
4. Aplikasi siap digunakan!

## Struktur Folder

```
todolist/
├── index.html              # Halaman utama
├── .htaccess              # Apache configuration
├── api/
│   ├── config.php         # Konfigurasi database
│   └── tasks.php          # REST API endpoint
├── database/
│   └── todolist_db.sql    # SQL database schema
├── assets/
│   ├── css/
│   │   └── style.css      # Styling
│   └── js/
│       └── app.js         # JavaScript logic
└── README.md
```

## API Endpoints

| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| GET | /api/tasks.php | Ambil semua tugas |
| POST | /api/tasks.php | Tambah tugas baru |
| PUT | /api/tasks.php?id=1 | Update tugas |
| DELETE | /api/tasks.php?id=1 | Hapus tugas |


### Contoh Request

**Tambah Tugas (POST)**
```json
{
  "title": "Belajar PHP REST API",
  "deadline": "2026-01-20"
}
```

**Update Tugas (PUT)**
```json
{
  "action": "update",
  "title": "Belajar PHP REST API - Updated",
  "deadline": "2026-01-25"
}
```

**Toggle Status (PUT)**
```json
{
  "action": "toggle"
}
```

## Database Schema

```sql
Table: tasks
- id (INT, PRIMARY KEY, AUTO_INCREMENT)
- title (VARCHAR 255)
- deadline (DATE, NULL)
- status (ENUM: 'pending', 'completed')
- created_at (DATETIME)
- updated_at (DATETIME)

```
```

## Troubleshooting

### Error Koneksi Database
- Pastikan MySQL di XAMPP sudah running
- Cek konfigurasi di `api/config.php`
- Pastikan database `todolist_db` sudah dibuat

### Error 404
- Pastikan path folder sudah benar di htdocs
- Cek apakah Apache di XAMPP sudah running

### Data Tidak Muncul
- Buka Console Browser (F12) untuk cek error API
- Pastikan file `api/tasks.php` bisa diakses
- Cek apakah tabel `tasks` sudah dibuat di database

## Fitur REST API

Aplikasi ini mengimplementasikan konsep REST API dengan:
- HTTP Methods (GET, POST, PUT, DELETE)
- JSON Response Format
- HTTP Status Codes
- CORS Headers
- Error Handling

## Screenshot

Aplikasi memiliki tampilan modern dengan:
- Gradient background (purple theme)
- Sidebar navigasi dengan filter deadline
- Statistik real-time
- Badge deadline (Hari Ini, Terlambat)
- Integrasi WhatsApp
- Animasi smooth
- Responsive design

## Dibuat Untuk

UAS Pemrograman Website II
Teknologi: PHP, MySQL, REST API, Bootstrap 5
