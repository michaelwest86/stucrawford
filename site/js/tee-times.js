const sheetId = '1tzYsidqOyoAhSh0HQ-gPQ3vGKA-DK-bt';
const sheetName = 'Handicaps';
const url = `https://opensheet.elk.sh/${sheetId}/${sheetName}`;

fetch(url)
  .then(res => res.json())
  .then(data => {
    const tbody = document.getElementById('tee-times-body');
    tbody.innerHTML = '';

    data.forEach(entry => {
      const row = document.createElement('tr');
      row.classList.add('border-b', 'hover:bg-gray-50');

      row.innerHTML = `
        <td class="px-4 py-2 border">${entry['Time']}</td>
        <td class="px-4 py-2 border">${entry['Hole']}</td>
        <td class="px-4 py-2 border">${entry['Player 1']}</td>
        <td class="px-4 py-2 border">${entry['Player 2']}</td>
        <td class="px-4 py-2 border">${entry['Player 3']}</td>
        <td class="px-4 py-2 border">${entry['Player 4']}</td>
        <td class="px-4 py-2 border font-semibold">${entry['Team Handicap']}</td>
      `;
      tbody.appendChild(row);
    });
  })
  .catch(err => {
    console.error('Error loading tee times:', err);
    document.getElementById('tee-times-body').innerHTML = `
      <tr><td colspan="7" class="px-4 py-4 text-center text-red-500">Could not load tee times.</td></tr>
    `;
  });
