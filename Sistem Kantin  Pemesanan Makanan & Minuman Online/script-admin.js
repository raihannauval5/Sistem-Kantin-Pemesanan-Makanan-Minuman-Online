const KEY_CANTEEN = 'DATA_CANTEEN_ORDER_APP';

const tabelAdminBody = document.getElementById('tabel-admin-body');
const searchInput = document.getElementById('search-input');
const filterStand = document.getElementById('filter-stand');
const filterStatus = document.getElementById('filter-status');

window.addEventListener('DOMContentLoaded', () => {
  renderTabelAdmin();
});

function renderTabelAdmin() {
  const listPesanan = JSON.parse(localStorage.getItem(KEY_CANTEEN)) || [];

  updateKpiStats(listPesanan);

  const query = searchInput.value.toLowerCase();
  const selectedStand = filterStand.value;
  const selectedStatus = filterStatus.value;

  const dataFiltered = listPesanan.filter(item => {
    const matchText = item.antrean.toLowerCase().includes(query) ||
                      item.pemesan.toLowerCase().includes(query) ||
                      item.menu.toLowerCase().includes(query);
    const matchStand = selectedStand === 'semua' || item.stand === selectedStand;
    const matchStatus = selectedStatus === 'semua' || item.status === selectedStatus;
    
    return matchText && matchStand && matchStatus;
  });

  tabelAdminBody.innerHTML = '';

  if (dataFiltered.length === 0) {
    tabelAdminBody.innerHTML = `
      <tr>
        <td colspan="5" class="empty-state">Tidak ada antrean pesanan yang sesuai.</td>
      </tr>
    `;
    return;
  }

  dataFiltered.forEach(item => {
    const tr = document.createElement('tr');

    tr.innerHTML = `
      <td>
        <span class="badge-code">${item.antrean}</span><br>
        <strong>${item.pemesan}</strong><br>
        <small class="text-muted">Jam: ${item.waktu}</small>
      </td>
      <td>
        <span class="text-stand">${item.stand}</span><br>
        <strong>${item.menu}</strong> (x${item.jumlah})<br>
        <small class="text-muted">Catatan: "${item.catatan}"</small>
      </td>
      <td><span class="text-pay">${item.pembayaran}</span></td>
      <td>
        <select class="select-compact" onchange="updateStatusPesanan('${item.id}', this.value)">
          <option value="Masuk" ${item.status === 'Masuk' ? 'selected' : ''}>Masuk</option>
          <option value="Dimasak" ${item.status === 'Dimasak' ? 'selected' : ''}>Dimasak</option>
          <option value="Siap Diambil" ${item.status === 'Siap Diambil' ? 'selected' : ''}>Siap Diambil</option>
          <option value="Selesai" ${item.status === 'Selesai' ? 'selected' : ''}>Selesai</option>
        </select>
      </td>
      <td>
        <div class="input-action-group">
          <input type="text" id="note-input-${item.id}" placeholder="Pesan dapur..." value="${item.pesanDapur !== 'Pesanan diterima oleh stand penjual.' ? item.pesanDapur : ''}">
          <button class="btn-small" onclick="simpanPesanDapur('${item.id}')">Kirim</button>
        </div>
      </td>
    `;
    tabelAdminBody.appendChild(tr);
  });
}

function updateKpiStats(data) {
  document.getElementById('stat-total').innerText = data.length;
  document.getElementById('stat-masuk').innerText = data.filter(d => d.status === 'Masuk').length;
  document.getElementById('stat-dimasak').innerText = data.filter(d => d.status === 'Dimasak').length;
  document.getElementById('stat-siap').innerText = data.filter(d => d.status === 'Siap Diambil').length;
}

window.updateStatusPesanan = function(id, statusBaru) {
  let listPesanan = JSON.parse(localStorage.getItem(KEY_CANTEEN)) || [];
  const idx = listPesanan.findIndex(d => d.id === id);

  if (idx !== -1) {
    listPesanan[idx].status = statusBaru;

    if (statusBaru === 'Dimasak') {
      listPesanan[idx].pesanDapur = 'Makanan sedang disiapkan / dimasak oleh stand.';
    } else if (statusBaru === 'Siap Diambil') {
      listPesanan[idx].pesanDapur = 'Pesanan sudah siap! Silakan ambil di stand penjual.';
    } else if (statusBaru === 'Selesai') {
      listPesanan[idx].pesanDapur = 'Pesanan telah selesai diambil. Terima kasih!';
    }

    localStorage.setItem(KEY_CANTEEN, JSON.stringify(listPesanan));
    renderTabelAdmin();
  }
};

window.simpanPesanDapur = function(id) {
  const inputEl = document.getElementById(`note-input-${id}`);
  const pesanTeks = inputEl.value.trim();

  if (!pesanTeks) {
    alert('Masukkan pesan dapur terlebih dahulu!');
    return;
  }

  let listPesanan = JSON.parse(localStorage.getItem(KEY_CANTEEN)) || [];
  const idx = listPesanan.findIndex(d => d.id === id);

  if (idx !== -1) {
    listPesanan[idx].pesanDapur = pesanTeks;
    localStorage.setItem(KEY_CANTEEN, JSON.stringify(listPesanan));
    alert('Pesan terikirim ke pelanggan!');
    renderTabelAdmin();
  }
};

window.resetDataKantin = function() {
  if (confirm('Hapus seluruh riwayat antrean pesanan kantin?')) {
    localStorage.removeItem(KEY_CANTEEN);
    renderTabelAdmin();
  }
};