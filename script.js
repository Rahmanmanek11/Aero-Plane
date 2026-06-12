let data = JSON.parse(localStorage.getItem('aeroPlaneData')) || {
    users: [], transaksi: [], pesan: [], penarikan: []
};
let penggunaAktif = null;
let grafikUtama;

function bukaModal(nama) { document.getElementById(`modal${nama.charAt(0).toUpperCase() + nama.slice(1)}`).classList.remove('hidden'); }
function tutupModal(nama) { document.getElementById(nama).classList.add('hidden'); }

function daftarAkun() {
    const user = document.getElementById('regUser').value.trim();
    const email = document.getElementById('regEmail').value.trim();
    const pass = document.getElementById('regPass').value;
    const pass2 = document.getElementById('regPass2').value;
    if(!user || !email || !pass) return alert('Isi semua data!');
    if(pass !== pass2) return alert('Password tidak cocok!');
    if(data.users.find(u => u.username === user)) return alert('Username sudah terpakai!');
    const akun = {
        username: user, email: email, password: pass, saldo: 0, bonusDiambil: false,
        investasi: [], keuntunganTotal: 0, tanggalDaftar: new Date().toLocaleDateString('id-ID')
    };
    data.users.push(akun); simpanData();
    alert('Pendaftaran berhasil! Silakan masuk.'); tutupModal('modalDaftar'); bukaModal('modalLogin');
}

function masukAkun() {
    const user = document.getElementById('loginUser').value.trim();
    const pass = document.getElementById('loginPass').value;
    const ditemukan = data.users.find(u => u.username === user && u.password === pass);
    if(!ditemukan) return alert('Username/Password salah!');
    penggunaAktif = ditemukan; tampilkanSetelahMasuk(); tutupModal('modalLogin');
}

function tampilkanSetelahMasuk() {
    document.getElementById('menuUmum').classList.add('hidden');
    document.getElementById('menuPengguna').classList.remove('hidden');
    document.getElementById('navPengguna').classList.remove('hidden');
    document.getElementById('halamanDepan').classList.add('hidden');
    document.getElementById('kontenPengguna').classList.remove('hidden');
    document.getElementById('namaPengguna').textContent = penggunaAktif.username;
    perbaruiDataTampilan(); buatGrafikUtama(); mulaiSimulasiProfit();
}

function keluarAkun() {
    penggunaAktif = null;
    document.getElementById('menuUmum').classList.remove('hidden');
    document.getElementById('menuPengguna').classList.add('hidden');
    document.getElementById('navPengguna').classList.add('hidden');
    document.getElementById('halamanDepan').classList.remove('hidden');
    document.getElementById('kontenPengguna').classList.add('hidden');
    document.querySelectorAll('section').forEach(s => s.classList.add('hidden'));
}

function tampilkanHalaman(id) {
    document.querySelectorAll('section').forEach(s => s.classList.add('hidden'));
    document.getElementById(id).classList.remove('hidden');
}

function klaimBonus() {
    if(penggunaAktif.bonusDiambil) return alert('Bonus sudah diklaim!');
    penggunaAktif.saldo += 10000; penggunaAktif.bonusDiambil = true;
    simpanData(); perbaruiDataTampilan(); alert('✅ Bonus Rp 10.000 masuk!');
}

function bukaPembayaran(jumlah) {
    window.jumlahBayarSekarang = jumlah;
    document.getElementById('jumlahBayarTeks').textContent = `Rp ${jumlah.toLocaleString('id-ID')}`;
    bukaModal('Bayar');
}

function lanjutkanDeposit() {
    const jumlah = parseInt(document.getElementById('jumlahDeposit').value);
    if(!jumlah || jumlah < 100000) return alert('Minimal Rp 100.000');
    bukaPembayaran(jumlah);
}

function kirimBuktiKeAdmin() {
    const trans = { id: Date.now(), username: penggunaAktif.username, jumlah: window.jumlahBayarSekarang, status: 'menunggu', waktu: new Date().toLocaleString('id-ID') };
    data.transaksi.push(trans); simpanData();
    const wa = `https://wa.me/62895386082201?text=Halo%20Admin,%20saya%20${penggunaAktif.username}%20ingin%20konfirmasi%20pembayaran%20Rp${window.jumlahBayarSekarang.toLocaleString('id-ID')}`;
    window.open(wa, '_blank'); tutupModal('modalBayar'); alert('Bukti terkirim! Tunggu persetujuan.');
}

function ajukanPenarikan() {
    const jumlah = parseInt(document.getElementById('jumlahTarik').value);
    const rek = document.getElementById('rekeningTarik').value.trim();
    if(!jumlah || jumlah < 50000) return alert('Minimal Rp 50.000');
    if(jumlah > penggunaAktif.saldo) return alert('Saldo tidak cukup!');
    if(!rek) return alert('Isi nomor rekening!');
    const tarik = { id: Date.now(), username: penggunaAktif.username, jumlah, rekening: rek, status: 'menunggu', waktu: new Date().toLocaleString('id-ID') };
    data.penarikan.push(tarik); penggunaAktif.saldo -= jumlah;
    simpanData(); perbaruiDataTampilan(); alert('Permintaan terkirim! Diproses maks 1x24 jam.');
}

function kirimPesan() {
    const teks = document.getElementById('inputPesan').value.trim();
    if(!teks) return;
    data.pesan.push({ dari: penggunaAktif.username, ke: 'admin', isi: teks, waktu: new Date().toLocaleString('id-ID') });
    simpanData(); tampilkanPesan(); document.getElementById('inputPesan').value = '';
}

function tampilkanPesan() {
    const kotak = document.getElementById('kotakPesan'); kotak.innerHTML = '';
    data.pesan.filter(p => p.dari === penggunaAktif.username || p.ke === penggunaAktif.username || p.ke === 'semua').forEach(p => {
        const el = document.createElement('div');
        el.className = `mb-2 p-3 rounded-lg max-w-[85%] ${p.dari === penggunaAktif.username ? 'bg-utama text-white ml-auto text-right' : 'bg-gray-200'}`;
        el.innerHTML = `<span class="text-xs opacity-70">${p.waktu}</span><br>${p.isi}`;
        kotak.appendChild(el);
    });
    kotak.scrollTop = kotak.scrollHeight;
}

function buatGrafikUtama() {
    const ctx = document.getElementById('grafikAset').getContext('2d');
    const dataAwal = Array.from({length:25}, () => 100 + Math.random()*30);
    grafikUtama = new Chart(ctx, {
        type: 'line',
        data: { labels: Array(25).fill(''), datasets: [{ label: 'Nilai Aset', data: dataAwal, borderColor: '#2563EB', backgroundColor: 'rgba(37,99,235,0.15)', tension:0.4, fill:true }] },
        options: { responsive:true, maintainAspectRatio:false }
    });
    setInterval(() => {
        const baru = Math.max(80, Math.min(180, grafikUtama.data.datasets[0].data.at(-1) + (Math.random()-0.4)*8));
        grafikUtama.data.datasets[0].data.push(baru); grafikUtama.data.datasets[0].data.shift(); grafikUtama.update();
    }, 2000);
}

function mulaiSimulasiProfit() {
    setInterval(() => {
        if(!penggunaAktif) return;
        penggunaAktif.investasi.forEach(inv => {
            if(inv.selesai) return;
            const hari = Math.floor((new Date() - new Date(inv.waktuMulai)) / (1000*60*60*24));
            if(hari >=3) {
                const untung = inv.jumlah * 0.4;
                penggunaAktif.saldo += inv.jumlah + untung; penggunaAktif.keuntunganTotal += untung; inv.selesai = true;
                alert(`✅ Investasi selesai! Masuk: Rp ${(inv.jumlah+untung).toLocaleString('id-ID')}`);
                perbaruiDataTampilan(); simpanData();
            }
        });
    }, 10000);
}

function perbaruiDataTampilan() {
    document.getElementById('saldoUtama').textContent = penggunaAktif.saldo.toLocaleString('id-ID');
    document.getElementById('saldoDompet').textContent = penggunaAktif.saldo.toLocaleString('id-ID');
    document.getElementById('totalUntung').textContent = penggunaAktif.keuntunganTotal.toLocaleString('id-ID');
    document.getElementById('totalInvestasi').textContent = penggunaAktif.investasi.filter(i=>!i.selesai).reduce((a,b)=>a+b.jumlah,0).toLocaleString('id-ID');
    tampilkanPesan();
}

function simpanData() { localStorage.setItem('aeroPlaneData', JSON.stringify(data)); }

window.onload = () => {
    const ctxDepan = document.getElementById('grafikDepan').getContext('2d');
    new Chart(ctxDepan, {
        type: 'line',
        data: {
            labels: ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des'],
            datasets: [{ label: 'Pertumbuhan Aset', data: [100,112,125,120,135,142,150,158,165,170,182,195], borderColor:'#0F4C81', backgroundColor:'rgba(15,76,129,0.15)', tension:0.3, fill:true }]
        },
        options: { responsive:true, maintainAspectRatio:false }
    });
};
