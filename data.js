/* ============================================================
   DATA KARTU MAHASISWA
   Semua konten teks ada di file ini supaya gampang ditambah.
   Aturan: tanpa tema percintaan/pacaran/gebetan/baper.
   ============================================================ */
"use strict";

const THEMES = [
  {
    id: "fantasy",
    name: "Fantasi",
    icon: "🐉",
    tagline: "Gulungan sihir & emas kuno",
    blurb: "Zamrud, emas, dan huruf klasik.",
    dark: true,
    palette: {
      bg1: "#071712",
      bg2: "#0d2a20",
      bg3: "#14382c",
      text: "#f5edd8",
      muted: "#b9b095",
      line: "rgba(229, 199, 122, 0.2)",
      accent: "#e5c77a",
      accent2: "#5ea98a"
    }
  },
  {
    id: "cyberpunk",
    name: "Cyberpunk",
    icon: "🌆",
    tagline: "Neon, grid, dan masa depan gelap",
    blurb: "Neon cyan-magenta dan aksen glitch.",
    dark: true,
    palette: {
      bg1: "#060913",
      bg2: "#0c1024",
      bg3: "#160d2c",
      text: "#ecf7ff",
      muted: "#96a8c8",
      line: "rgba(103, 232, 249, 0.2)",
      accent: "#67e8f9",
      accent2: "#f472b6"
    }
  },
  {
    id: "anime",
    name: "Anime",
    icon: "🍥",
    tagline: "Panel pastel penuh semangat",
    blurb: "Krem pastel, halftone, dan font bulat.",
    dark: false,
    palette: {
      bg1: "#fff7ef",
      bg2: "#ffe9f1",
      bg3: "#f4e7ff",
      text: "#2c213f",
      muted: "#756a83",
      line: "rgba(44, 33, 63, 0.14)",
      accent: "#ff6f9f",
      accent2: "#9a6bff"
    }
  },
  {
    id: "retro",
    name: "Retro 90-an",
    icon: "📼",
    tagline: "Warna pop dan pola Memphis",
    blurb: "Krem-oranye, tebal, dan penuh pola.",
    dark: false,
    palette: {
      bg1: "#fbe9c8",
      bg2: "#ffd8ae",
      bg3: "#f7c4b0",
      text: "#241a2b",
      muted: "#6d5a58",
      line: "rgba(36, 26, 43, 0.16)",
      accent: "#0f9b96",
      accent2: "#ef6b3b"
    }
  }
];

const RARITIES = [
  {
    id: "common",
    label: "Common",
    chance: 55,
    tier: "C",
    color: "#b8c2d6",
    color2: "#7d899f",
    light: "#667085",
    light2: "#475467"
  },
  {
    id: "rare",
    label: "Rare",
    chance: 28,
    tier: "B",
    color: "#38bdf8",
    color2: "#0ea5e9",
    light: "#0877b9",
    light2: "#0369a1"
  },
  {
    id: "epic",
    label: "Epic",
    chance: 13,
    tier: "A",
    color: "#c084fc",
    color2: "#e879f9",
    light: "#8b2fd6",
    light2: "#a21caf"
  },
  {
    id: "legendary",
    label: "Legendary",
    chance: 4,
    tier: "S",
    color: "#fbbf24",
    color2: "#fb923c",
    light: "#b45309",
    light2: "#d97706"
  }
];

const STAT_DEFS = [
  { key: "patience", label: "Kesabaran", radar: ["Kesabaran"], icon: "🧘" },
  { key: "excuses", label: "Kemampuan Ngeles", radar: ["Kemampuan", "Ngeles"], icon: "🗣️" },
  { key: "stamina", label: "Daya Tahan Begadang", radar: ["Daya Tahan", "Begadang"], icon: "☕" },
  { key: "creativity", label: "Kreativitas", radar: ["Kreativitas"], icon: "💡" },
  { key: "luck", label: "Keberuntungan", radar: ["Keberuntungan"], icon: "🍀" }
];

const NICKNAMES = [
  "Raja Rebahan Terakhir",
  "Sultan Deadline",
  "Kolektor Tugas Tertunda",
  "Dewa Ngeles Level Max",
  "Panglima Kopi Tengah Malam",
  "Jenderal SKS",
  "Penyelamat Print Tugas",
  "Baron Wifi Kampus",
  "Pangeran Jadwal Kuliah",
  "Guardian Kos Blok C",
  "Hacker Warung Kopi",
  "Arsitek Alasan Sakti",
  "Penjaga Absen Pagi",
  "Ksatria Nongkrong",
  "Profesor Scroll Tanpa Arah",
  "Penghuni Perpustakaan Lantai 3",
  "Pemilik Alarm yang Diabaikan",
  "Ahli Rakit Alasan",
  "Kapten Diskusi Kelompok",
  "Penyintas Bimbingan Skripsi",
  "Legenda Kelas Jam 8 Pagi",
  "Penakluk Bukit Tugas",
  "Raja Catatan Pinjaman",
  "Spesialis Minta Slide",
  "Hantu Perpustakaan",
  "Pilot KRS Terakhir",
  "Petarung Mie Instan",
  "Monster Hafalan Semalam",
  "Bintang Presentasi Kelompok",
  "Tukang Remake Tugas",
  "Dalang Jadwal Nongkrong",
  "Peneliti Harga Kos",
  "Penyelamat Kelompok Bubar",
  "Pemuja Tombol Snooze",
  "Arsitek Hari Tanpa Rencana",
  "Penasihat Spiritual KRS",
  "Ahli Ngeles Kelas Online",
  "Kurir Tugas Antargeng",
  "Panglima Print Warna",
  "Detektif Kabel Proyektor"
];

const MOVES = [
  { name: "Pembalasan Snooze", desc: "Menunda alarm sembilan kali tanpa setitik rasa bersalah." },
  { name: "Ctrl + S Sebelum Badai", desc: "Menyelamatkan tugas tiga jam sebelum laptop menyerah." },
  { name: "Serangan Deadline", desc: "Menghantam tugas tepat satu menit sebelum pintu unggah menutup." },
  { name: "Teleportasi Barisan Belakang", desc: "Berpindah baris tanpa suara saat dosen menoleh." },
  { name: "Gema Ngeles", desc: "Satu alasan dipantulkan jadi lima versi yang terdengar meyakinkan." },
  { name: "Sapu Bersih Nilai B", desc: "Menyapu semua tugas dengan standar 'yang penting selesai'." },
  { name: "Mode Pesawat", desc: "Menghilang dari grup kelompok selama revisi masih berlangsung." },
  { name: "Ritual Print Terakhir", desc: "Mengubah PDF 40 halaman jadi tugas fisik dalam hitungan menit." },
  { name: "Jurus Cari Sinyal", desc: "Mengangkat laptop setinggi langit demi satu bar WiFi kampus." },
  { name: "Lempar Tugas ke Panitia", desc: "Melemparkan tanggung jawab dengan akurasi ketua kelompok sejati." },
  { name: "Perisai 'Nanti Aku Kirim'", desc: "Menahan serangan dosen dengan janji yang indah dan tanpa batas." },
  { name: "Serangan Balik Revisi", desc: "Membalas komentar pembimbing dengan versi baru dan senyum percaya diri." },
  { name: "Klon Diskusi Kelompok", desc: "Muncul di grup, tapi hanya mengirim emoji jempol." },
  { name: "Mantra 'Aku Belum Baca'", desc: "Menurunkan ekspektasi lawan sebelum diskusi kelas dimulai." },
  { name: "Email Fajar", desc: "Mengirim tugas saat matahari terbit dan berharap dosen belum bangun." },
  { name: "Split Tagihan", desc: "Membagi total belanja jadi angka yang membuat semua orang curiga." },
  { name: "Combo Hemat Ongkir", desc: "Menggabungkan pesanan geng jadi satu paket dan satu drama diskon." },
  { name: "Jurus Pinjam Pulpen", desc: "Meminjam pulpen satu-satunya dan pulang dengan koleksi baru." },
  { name: "Sutradara Presentasi", desc: "Mengarahkan slide kelompok sambil tetap tidak mau menjadi pembicara." },
  { name: "Kamuflase Kelas Kosong", desc: "Berdiam di barisan belakang saat dosen bertanya siapa yang belum hadir." },
  { name: "Rally Nongkrong", desc: "Mengumpulkan geng dalam lima menit dengan satu kata: 'lapar'." },
  { name: "Serangan Mahasiswa Abadi", desc: "Menunda sidang satu semester dengan alasan yang selalu baru." },
  { name: "Backup Grup WhatsApp", desc: "Menyimpan semua file penting di folder bernama 'nanti dicari'." },
  { name: "Doa Sebelum Nilai", desc: "Menatap pengumuman nilai sambil berjanji akan berubah." },
  { name: "Tarik Kabel Proyektor", desc: "Mematikan presentasi semua orang dengan satu kaki yang ceroboh." },
  { name: "Refactor Alasan", desc: "Merapikan alasan telat agar lebih efisien dan sulit dibantah." },
  { name: "Stack Overflow Summon", desc: "Memanggil jawaban dari internet dan berdoa semoga tidak ada error baru." },
  { name: "Push ke Branch Panik", desc: "Mengirim kode tanpa tes dan langsung berharap yang terbaik." },
  { name: "Ngoding Sambil Makan", desc: "Menggabungkan debugging, nasi, dan risiko mengetik di mangkuk." },
  { name: "Screenshot Bukti", desc: "Mengumpulkan bukti chat untuk melindungi diri dari revisi mendadak." },
  { name: "Jurus 'Coba Google'", desc: "Menjawab pertanyaan sulit dengan kalimat yang penuh keyakinan." },
  { name: "Jalan Kaki Hemat", desc: "Menempuh dua kilometer demi menghemat ongkir dan kalori." },
  { name: "Ngeles Kilat 60 Detik", desc: "Menyusun alasan lengkap sebelum dosen selesai mengucapkan nama." },
  { name: "Meditasi Sinyal", desc: "Menunggu loading bar dengan napas tenang dan timer yang berjalan." },
  { name: "Jurus Peta Kampus", desc: "Menuntun geng ke gedung yang benar tanpa satu pun akurasi." },
  { name: "Serangan Roti Sisa", desc: "Menghabisi lapar tengah malam dengan makanan yang tidak jelas tanggalnya." }
];

const WEAKNESSES = [
  "Jam 8 pagi",
  "Wifi kampus yang buffering",
  "Deadline yang dimajukan",
  "Dosen yang buka absen tepat waktu",
  "Grup WhatsApp yang ramai",
  "Baterai 5%",
  "Kos tanpa air",
  "UAS yang materinya 'semua itu penting'",
  "Tugas kelompok yang dikerjakan satu orang",
  "Diskon ongkir yang berakhir satu menit lalu",
  "Alarm yang diletakkan di luar jangkauan",
  "Antrean kantin saat jam istirahat",
  "Error tanpa pesan yang jelas",
  "Dosen tegas yang selalu benar",
  "Print shop yang tutup jam 9",
  "Sinyal hilang saat presensi online",
  "Presentasi mendadak di jam pertama",
  "Teman yang bertanya 'eh, tugasnya apa?'",
  "Kalimat 'bisa bimbingan minggu ini?'",
  "Kabel proyektor yang selalu hilang",
  "Tanggal KRS yang tidak pernah diingat",
  "Suara kasur yang memanggil saat ingin bangun",
  "Kipas angin kos yang mati dini hari",
  "Kuis dadakan tanpa peringatan",
  "Kuota internet di akhir bulan",
  "Tumpukan piring satu minggu",
  "Notifikasi tugas dari sistem yang tidak bisa dibalas"
];

const QUOTES = [
  "Tugas bisa ditunda, tapi rasa paniknya tetap datang tepat waktu.",
  "Hidup itu seperti compile: kadang sukses, kadang error tanpa alasan.",
  "Kopi bukan minuman, tapi tombol power.",
  "Deadline adalah alarm paling efektif yang pernah ada.",
  "Nilai boleh B, mental harus A.",
  "Grup chat tidak akan tenang sampai tugas selesai dibagi.",
  "Satu langkah kecil buat kamu, satu proyek besar buat panitia.",
  "Hari ini ngoding, besok ngoding, besoknya ngeluh.",
  "Tidur cukup itu bagian dari produktivitas, bukan tanda lemah.",
  "Jangan takut mulai; takutlah nggak selesai karena scroll.",
  "Bisa karena biasa, telat karena salah baca jadwal.",
  "Kemampuan ngeles akan membawamu jauh, kecuali ke ruang dosen.",
  "Versi terbaikmu tidak selalu rapi, kadang cuma mandi dan hadir.",
  "Semester bisa berganti, akun WiFi tetap harus diperbarui.",
  "Teman sejati menandai presensi, bukan cuma menagih tugas.",
  "Kalau tidak ada cara, buat cara; kalau tetap gagal, ajak geng.",
  "Wifi kampus mengajariku arti sabar lebih baik dari dosen.",
  "Jangan bandingkan progresmu dengan feed; feed itu highlight, bukan log.",
  "Satu tugas selesai hari ini lebih baik dari sepuluh rencana besok.",
  "Jangan lupa makan. Debugging butuh energi, bukan cuma kopi.",
  "Setiap bug adalah teka-teki; setiap deadline adalah pemicu panik.",
  "Geng yang baik akan bilang 'kita bagi rata' tanpa harus ditanya.",
  "Dunia tidak berakhir karena nilai jelek. Masih ada kuis berikutnya.",
  "Rencana A gagal, rencana B ngaret, rencana C: ikut geng.",
  "Kelebihan mahasiswa adalah bisa tidur di mana saja, kecuali di kelas.",
  "Kerja keras itu penting, tapi jangan lupa backup.",
  "Belajar dari error adalah cara paling jujur untuk berkembang.",
  "Revisi adalah tanda kamu masih punya kesempatan.",
  "Kalau baterai bisa durab, semangat juga.",
  "KRS beres, dunia terasa lebih ringan lima kilo.",
  "Jangan tunggu motivasi datang; mulai saja, nanti dia nyusul.",
  "Presentasi yang tenang lahir dari slide yang dibuat tengah malam.",
  "Makan siang tepat waktu adalah bentuk self-care paling murah.",
  "Kadang jalan tercepat adalah berhenti scroll dan buka tugas.",
  "Tidak semua hari harus produktif; sebagian cuma untuk bertahan.",
  "Kode yang jalan di laptop belum tentu jalan di masa depan.",
  "Jangan remehkan mahasiswa yang bawa tumbler dan kabel charger.",
  "Kampus mengajarkan bahwa 'nanti' adalah kata yang berbahaya."
];

const SAMPLE_NAMES = [
  "Raka Bintang",
  "Nadia Pramesti",
  "Bima Saputra",
  "Salsa Kirana",
  "Daffa Ramadhan",
  "Intan Maharani",
  "Yoga Pratama",
  "Kirana Ayu",
  "Rafi Akbar",
  "Maya Lestari",
  "Jovan Hutapea",
  "Citra Anjani",
  "Fajar Nugraha",
  "Nabila Zahra",
  "Dimas Prakoso",
  "Putri Wulandari",
  "Arga Firmansyah",
  "Sinta Melati",
  "Bagas Aditya",
  "Tiara Kusuma",
  "Rizky Maulana",
  "Alya Safitri",
  "Vino Saputra",
  "Dea Anggraini"
];

const EMBLEMS = [
  "🎓", "💻", "📚", "☕", "🎧", "🖨️", "🚀", "🧠",
  "🛠️", "📡", "🧩", "🎮", "🍜", "🏕️", "🛸", "🪐",
  "🔭", "🧗", "🪄", "🛹"
];
