// Config
const SHEET_ID = '1tzYsidqOyoAhSh0HQ-gPQ3vGKA-DK-bt';
const TAB_NAME = 'websiteintegration'; // your exact tab name
const URL = `https://opensheet.elk.sh/${SHEET_ID}/${encodeURIComponent(TAB_NAME)}`;

const tbody = document.getElementById('tee-times-body');

fetch(URL)
  .then(res => res.json())
  .then(data => {
    tbody.innerHTML = '';
    data.forEach(row => {
      const tr = document.createElement('tr');
      tr.className = 'border-b hover:bg-gray-50';
      tr.innerHTML = `
        <td class="px-4 py-2 border">${row['Time'] || ''}</td>
        <td class="px-4 py-2 border">${row['Hole'] || ''}</td>
        <td class="px-4 py-2 border">${row['Player 1'] || ''}</td>
        <td class="px-4 py-2 border font-semibold">${row['Team Handicap'] || ''}</td>
      `;
      tbody.appendChild(tr);
    });
  })
  .catch(err => {
    console.error('Error loading tee times:', err);
    tbody.innerHTML = `<tr><td colspan="4" class="px-4 py-2 text-center text-red-600">
      Could not load tee times.
    </td></tr>`;
  });

