// ---- CONFIG ----
const SHEET_ID = '1tzYsidqOyoAhSh0HQ-gPQ3vGKA-DK-bt';
const TAB_NAME = 'Handicaps'; // change if your sheet tab is named differently

// Use OpenSheet by tab name (simpler than gid-based CSV)
const URL = `https://opensheet.elk.sh/${SHEET_ID}/${encodeURIComponent(TAB_NAME)}`;

// Elements
const tbody = document.getElementById('tee-times-body');
const searchInput = document.getElementById('search');
const holeFilter = document.getElementById('holeFilter');
const lastUpdated = document.getElementById('last-updated');

// Utility: get the first present field from a list of possible header names (trim-insensitive)
function pick(entry, keys) {
  for (const k of keys) {
    // try exact, then try trimmed-match among entry keys
    if (entry[k] != null && entry[k] !== '') return entry[k];
    const hit = Object.keys(entry).find(ek => ek.trim().toLowerCase() === k.trim().toLowerCase());
    if (hit && entry[hit] != null && entry[hit] !== '') return entry[hit];
  }
  return '';
}

let rows = [];
let filtered = [];

function render(data) {
  tbody.innerHTML = '';
  if (!data.length) {
    tbody.innerHTML = `<tr><td colspan="4" class="px-4 py-6 text-center text-gray-500">No results.</td></tr>`;
    return;
  }
  const frag = document.createDocumentFragment();
  data.forEach(r => {
    const time = pick(r, ['Time']);
    const hole = pick(r, ['Hole']);
    const captain = pick(r, ['Player 1', 'Captain']); // supports either header
    const hcap = pick(r, ['Team Handicap', 'Team handicap', 'Handicap']);

    const tr = document.createElement('tr');
    tr.className = 'border-b hover:bg-gray-50';
    tr.innerHTML = `
      <td class="px-4 py-2 border">${time}</td>
      <td class="px-4 py-2 border">${hole}</td>
      <td class="px-4 py-2 border">${captain}</td>
      <td class="px-4 py-2 border font-semibold">${hcap}</td>
    `;
    frag.appendChild(tr);
  });
  tbody.appendChild(frag);
}

function applyFilters() {
  const q = (searchInput?.value || '').toLowerCase().trim();
  const hole = holeFilter?.value || '';
  filtered = rows.filter(r => {
    const rHole = String(pick(r, ['Hole'])).trim();
    const captain = pick(r, ['Player 1', 'Captain']);
    const time = pick(r, ['Time']);
    const hcap = pick(r, ['Team Handicap', 'Handicap']);
    const holeOk = !hole || rHole === hole;
    if (!q) return holeOk;
    const hay = `${captain} ${time} ${hcap}`.toLowerCase();
    return holeOk && hay.includes(q);
  });
  render(filtered);
}

function parseMinutes(t) {
  // Support "9:10 AM" style; fall back to 0 if unknown
  if (!t) return 0;
  const m = String(t).match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
  if (!m) return 0;
  let hh = parseInt(m[1], 10), mm = parseInt(m[2], 10);
  const ap = m[3].toUpperCase();
  if (ap === 'PM' && hh !== 12) hh += 12;
  if (ap === 'AM' && hh === 12) hh = 0;
  return hh * 60 + mm;
}

async function loadData() {
  try {
    const res = await fetch(URL, { cache: 'no-store' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();

    rows = Array.isArray(data) ? data : [];
    // Sort by time if present
    rows.sort((a, b) => parseMinutes(pick(a, ['Time'])) - parseMinutes(pick(b, ['Time'])));

    applyFilters();
    if (lastUpdated) lastUpdated.textContent = `Last updated: ${new Date().toLocaleString()}`;
  } catch (err) {
    console.error('Tee times load error:', err);
    tbody.innerHTML = `<tr><td colspan="4" class="px-4 py-6 text-center text-red-600">
      Could not load tee times. Check that the sheet is public (Viewer) and the tab name is “${TAB_NAME}”.
    </td></tr>`;
  }
}

// Wire up controls (if present)
if (searchInput) searchInput.addEventListener('input', applyFilters);
if (holeFilter) holeFilter.addEventListener('change', applyFilters);

// Go!
loadData();
