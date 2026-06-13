const DATA_KEY = "aeroPlaneData";
let penggunaAktif = null;
let chartKeuntungan;

// Inisialisasi data
function muatData() {
    const data = JSON.parse(localStorage.getItem(DATA_KEY)) || {
        users: [], transaksi: [], pesan: [], penarikan: []
    };
    return data;
}

function simpanData(dataBaru) {
    localStorage.setItem(DATA_KEY, JSON.stringify(dataBaru));
}

// Perbarui status aktif setiap 1 menit
setInterval(() => {
    if (penggunaAktif) {
        const data = muatData();
        const idx = data.users.findIndex(u => u.username === penggunaAktif.username);
        if (idx >= 0) {
            data.users[idx].terakhirAktif = Date.now();
            simpanData(data);
        }
    }
}, 60000);

// Fungsi daftar akun
function daftarAkun() {
    const user = document.getElementById("daftar-user").value.trim();
    const email = document.getElementById("daftar-email").value.trim();
    const pass = document.getElementById("daftar-pass").value.trim();
    const data = muatData();

    if (!user || !email || !pass) return alert("Semua kolom harus diisi!");
    if (data.users.some(u => u.username === user)) return alert("Nama pengguna sudah terdaftar!");

    const kodeUnik = 'AP-' + Math.random().toString(36).substring(2, 10).toUpperCase();
    data.users.push({
        username: user,
        email: email,
        password: pass,
        kodeUnik: kodeUnik,
        saldo: 0,
        investasi: [],
        riwayat: [],
        terakhirAktif: Date.now()
    });
    simpanData(data);
    alert(`✅ Akun berhasil dibuat! Kode unik kamu: ${kodeUnik}`);
    tampilLogin();
}

// Sisanya fungsi masuk, keluar, transaksi, pesan tetap seperti sebelumnya
function masukAkun() {
    const user = document.getElementById("login-user").value.trim();
    const pass = document.getElementById("login-pass").value.trim();
    const data = muatData();

    const ditemukan = data.users.find(u => u.username === user && u.password === pass);
    if (!ditemukan) return alert("Nama pengguna atau sandi salah!");

    penggunaAktif = ditemukan;
    document.getElementById("auth-screen").classList.add("hidden");
    document.getElementById("main-app").classList.remove("hidden");
    document.getElementById("nama-pengguna").textContent = user;
    bukaMenu("dashboard");
    tampilkanDataPengguna();
    jalankanChart();
    // Tandai aktif
    const idx = data.users.findIndex(u => u.username === user);
    data.users[idx].terakhirAktif = Date.now();
    simpanData(data);
}

function kirimPesan() {
    const teks = document.getElementById("pesan-admin").value.trim();
    if (!teks) return;
    const data = muatData();
    data.pesan.push({
        dari: penggunaAktif.username,
        isi: teks,
        waktu: new Date().toLocaleString("id-ID")
    });
    simpanData(data);
    alert("✅ Pesan terkirim ke admin!");
    document.getElementById("pesan-admin").value = "";
}

// Sisanya fungsi lain tetap sama seperti versi sebelumnya
