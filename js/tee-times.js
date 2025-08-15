<!-- PapaParse (CSV parser) -->
<script src="https://cdn.jsdelivr.net/npm/papaparse@5.4.1/papaparse.min.js"></script>

<script>
  // Your published-to-web CSV URL:
  const CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSSbDxvnbZVZxVI7m6c06W3964FARBY-wvYTvbLMPpGvDMlAcuaQU90BST0QLJa4w/pub?gid=88495620&single=true&output=csv';

  const tbody = document.getElementById('tee-times-body');
  const statusEl = document.getElementById('status'); // optional
  const searchInput = document.getElementById('search'); // optional
  const holeFilter = document.getElementById('holeFilter'); // optional
  const lastUpdated = document.getElementById('last-updated'); // optional

  let rows = [];
  let filtered = [];

  const toMins = s => {
    const m = String(s || '').match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
    if (!m) return 0;
    let h = +m[1], mm = +m[2]; const ap = m[3].toUpperCase();
    if (ap === 'PM' && h !== 12) h += 12;
    if (ap === 'AM' && h === 12) h = 0;
    return h * 60 + mm;
  };

  function render(data) {
    tbody.innerHTML = '';
    if (!data.length) {
      tbody.innerHTML = `<tr><td colspan="4" class="px-4 py-6 text-center text-gray-500">No results.</td></tr>`;
      return;
    }
    const frag = document.createDocumentFragment();
    for (const r of data) {
      const tr = document.createElement('tr');
      tr.className = 'border-b hover:bg-gray-50';
      tr.innerHTML = `
        <td class="px-4 py-2 border">${r['Time'] || ''}</td>
        <td class="px-4 py-2 border">${r['Hole'] || ''}</td>
        <td class="px-4 py-2 border">${r['Player 1'] || ''}</td>  <!-- shown as Captain -->
        <td class="px-4 py-2 border font-semibold">${r['Team Handicap'] || ''}</td>
      `;
      frag.appendChild(tr);
    }
    tbody.appendChild(frag);
  }

  function applyFilters() {
    const q = (searchInput?.value || '').toLowerCase().trim();
    const hole = holeFilter?.value || '';
    filtered = rows.filter(r => {
      const holeOk = !hole || String(r['Hole'] || '').trim() === hole;
      if (!q) return holeOk;
      const hay = `${r['Player 1'] || ''} ${r['Time'] || ''} ${r['Team Handicap'] || ''}`.toLowerCase();
      return holeOk && hay.includes(q);
    });
    render(filtered);
  }

  fetch(CSV_URL, { cache: 'no-store' })
    .then(r => {
      if (!r.ok) throw new Error('HTTP ' + r.status);
      return r.text();
    })
    .then(text => {
      const parsed = Papa.parse(text, { header: true, skipEmptyLines: true });
      rows = parsed.data || [];

      // Sort by Time (e.g., "9:10 AM")
      rows.sort((a, b) => toMins(a['Time']) - toMins(b['Time']));

      applyFilters();
      if (statusEl) statusEl.textContent = `Loaded ${rows.length} rows.`;
      if (lastUpdated) lastUpdated.textContent = `Last updated: ${new Date().toLocaleString()}`;
    })
    .catch(err => {
      console.error(err);
      tbody.innerHTML = `<tr><td colspan="4" class="px-4 py-6 text-center text-red-600">Could not load tee times.</td></tr>`;
      if (statusEl) statusEl.textContent = `Fetch failed: ${err.message}`;
    });

  // Hook up filters if present
  if (searchInput) searchInput.addEventListener('input', applyFilters);
  if (holeFilter) holeFilter.addEventListener('change', applyFilters);
</script>
