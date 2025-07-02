// script.js
// Main frontend script for HealthJobsPH GitHub Pages site
// Features: Load HTML rows from R-generated fragment, initialize DataTable, enable filtering, CSV export, mobile optimization, and error handling

document.addEventListener('DOMContentLoaded', function () {
  const tableBody = document.getElementById('job-table-body');
  const noMatchMsg = document.getElementById('no-jobs-message');

  // Utility: Show developer console log with row count
  function logRowCount() {
    const rowCount = document.querySelectorAll('#jobs-table tbody tr').length;
    console.log(`✅ Loaded ${rowCount} job rows into the table.`);
    if (rowCount === 0) {
      console.warn('⚠️ No job rows were loaded. Check if jobs_all_rows.html exists or is empty.');
    }
  }

  // Load HTML rows generated from R (contains <tr>…</tr> rows only)
  fetch('jobs_all_rows.html')
    .then(response => {
      if (!response.ok) {
        throw new Error(`❌ Failed to fetch jobs_all_rows.html (${response.status})`);
      }
      return response.text();
    })
    .then(html => {
      // Replace table body with loaded rows
      tableBody.outerHTML = html;

      // Mobile display: Assign data-label attributes to each cell
      document.querySelectorAll('#jobs-table tbody tr').forEach(row => {
        const labels = ['Office', 'Position', 'Region', 'Posting Date', 'Closing Date', 'Details'];
        row.querySelectorAll('td').forEach((cell, i) => {
          cell.setAttribute('data-label', labels[i] || '');
        });
      });

      // ✅ Initialize DataTable with full features
      window.table = $('#jobs-table').DataTable({
        dom: 'PlBfrtip',
        responsive: true,
        colReorder: true,
        buttons: [
          {
            extend: 'csv',
            text: '⬇ Export Filtered CSV',
            className: 'dt-button'
          }
        ],
        searchPanes: {
          cascadePanes: true,
          viewTotal: true
        },
        columnDefs: [
          { searchPanes: { show: true }, targets: [0, 2, 3] },  // Office, Region, Posting Date
          { orderable: false, targets: 5 }                      // Disable sorting on 'Details'
        ],
        language: {
          zeroRecords: "No jobs match your filter criteria.",
          searchPanes: {
            clearMessage: 'Clear filters',
            collapse: { 0: 'Filter Options', _: 'Filter Options (%d)' }
          }
        }
      });

      // UI feedback when table is filtered empty
      window.table.on('draw', function () {
        const visible = $('#jobs-table tbody tr:visible').length;
        noMatchMsg.style.display = visible === 0 ? 'block' : 'none';
      });

      logRowCount();
    })
    .catch(error => {
      console.error(error);
      tableBody.innerHTML = `<tr><td colspan="6" style="color:red; text-align:center;">
        Error loading job listings. Please check the console or contact site admin.
      </td></tr>`;
    });
});
