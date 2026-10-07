const KEY_CANTEEN = 'DATA_CANTEEN_ORDER_APP';

// Database Menu per Stand
const DB_MENU = {
  "Stand 01 - Warung Mas Budi (Olahan Nasi & Ayam)": [
    { name: "Nasi Goreng Spesial", price: "Rp 20.000" },
    { name: "Ayam Geprek + Nasi", price: "Rp 22.000" },
    { name: "Nasi Bebek Goreng", price: "Rp 25.000" }
  ],
  "Stand 02 - Bakso & Mie Ayam Pak Joko": [
    { name: "Mie Ayam Bakso", price: "Rp 18.000" },
    { name: "Bakso Urat Urung", price: "Rp 20.000" },
    { name: "Mie Yamin Manis", price: "Rp 17.000" }
  ],
  "Stand 03 - Kedai Aneka Minuman Pok Inah": [
    { name: "Es Teh Manis Jumbo", price: "Rp 5.000" },
    { name: "Es Jeruk Peras", price: "Rp 7.000" },
    { name: "Jus Alpukat Kocok", price: "Rp 12.000" }
  ]
};

const formPesanan = document.getElementById('form-pesanan');
const tabelUserBody = document.getElementById('tabel-user-body');

window.addEventListener('DOMContentLoaded', () => {
  renderTabelUser();
});

window.loadMenuByStand = function() {
  const standSelected = document.getElementById('pilihanStand').value;
  const containerMenu = document.getElementById('container-menu');

  if (!standSelected || !DB_MENU[standSelected]) {
    containerMenu.innerHTML = '<p class="text-placeholder">Silakan pilih Stand / Tenant terlebih dahulu.</p>';
    return;
  }

  const listMenu = DB_MENU[standSelected];
  containerMenu.innerHTML = '';

  listMenu.forEach((item, index) => {
    const isChecked = index === 0 ? 'checked' : '';
    const menuHtml = `
      <label class="menu-item">
        <input type="radio" name="menuPilihan" value="${item.name} - ${item.price}" ${isChecked} required>
        <div class="menu-info">
          <strong>${item.name}</strong>
          <span>${item.price}</span>
        </div>
      </label>
    `;
    containerMenu.innerHTML += menuHtml;
  });
};

formPesanan.addEventListener('submit', function(e) {
  e.preventDefault();

  const namaPemesan = document.getElementById('namaPemesan').value.trim();
  const standSelected = document.getElementById('pilihanStand').value;
  const radioChecked = document.querySelector('input[name="menuPilihan"]:checked');
  
  if (!radioChecked) {
    alert('Pilih menu terlebih dahulu!');
    return;
  }

  const menuPilihan = radioChecked.value;
  const jumlah = document.getElementById('jumlah').value;
  const pembayaran = document.getElementById('pembayaran').value;
  const catatan = document.getElementById('catatan').value.trim() || '-';

  const noAntrean = 'ORD-' + Math.floor(1000 + Math.random() * 9000);

  const pesananBaru = {
    id: Date.now().toString(),
    antrean: noAntrean,
    pemesan: namaPemesan,
    stand: standSelected,
    menu: menuPilihan,
    jumlah: jumlah,
    pembayaran: pembayaran,
    catatan: catatan,
    status: 'Masuk',
    pesanDapur: 'Pesanan diterima oleh stand penjual.',
    waktu: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
  };

  const listPesanan = JSON.parse(localStorage.getItem(KEY_CANTEEN)) || [];
  listPesanan.unshift(pesananBaru);
  localStorage.setItem(KEY_CANTEEN, JSON.stringify(listPesanan));

  alert(`Pesanan berhasil dikirim ke ${standSelected}!\nNomor Antrean Anda: ${noAntrean}`);
  formPesanan.reset();
  document.getElementById('container-menu').innerHTML = '<p class="text-placeholder">Silakan pilih Stand / Tenant terlebih dahulu.</p>';
  renderTabelUser();
});

function renderTabelUser() {
  const listPesanan = JSON.parse(localStorage.getItem(KEY_CANTEEN)) || [];
  tabelUserBody.innerHTML = '';

  if (listPesanan.length === 0) {
    tabelUserBody.innerHTML = `
      <tr>
        <td colspan="5" class="empty-state">Belum ada pesanan aktif. Silakan pilih menu.</td>
      </tr>
    `;
    return;
  }

  listPesanan.forEach(item => {
    const tr = document.createElement('tr');
    const statusClass = item.status.toLowerCase().replace(/\s+/g, '-');

    tr.innerHTML = `
      <td><span class="badge-code">${item.antrean}</span><br><small class="text-muted">${item.waktu}</small></td>
      <td>
        <strong>${item.menu}</strong> (x${item.jumlah})<br>
        <span class="text-stand">${item.stand}</span><br>
        <span class="text-muted">An. ${item.pemesan} | Catatan: ${item.catatan}</span>
      </td>
      <td><span class="text-pay">${item.pembayaran}</span></td>
      <td><span class="pill-status status-${statusClass}">${item.status}</span></td>
      <td><span class="text-muted">${item.pesanDapur}</span></td>
    `;
    tabelUserBody.appendChild(tr);
  });
}