function filterByIsland(group) {
  if (group === 'All') {
    $('#jobs-table tbody tr').show();
  } else {
    $('#jobs-table tbody tr').each(function () {
      const island = $(this).data('island');
      $(this).toggle(island === group);
    });
  }
  table.draw();
}

fetch('jobs_all_rows.html')
  .then(res => res.text())
  .then(html => {
    document.getElementById('job-table-body').outerHTML = html;

    // Mobile-friendly labels
    $('#jobs-table tbody tr').each(function () {
      $(this).find('td').eq(0).attr('data-label', 'Office');
      $(this).find('td').eq(1).attr('data-label', 'Position');
      $(this).find('td').eq(2).attr('data-label', 'Region');
      $(this).find('td').eq(3).attr('data-label', 'Posting Date');
      $(this).find('td').eq(4).attr('data-label', 'Closing Date');
      $(this).find('td').eq(5).attr('data-label', 'Details');
    });

    // Initialize table
    window.table = $('#jobs-table').DataTable({
      dom: 'PlBfrtip',
      searchPanes: {
        cascadePanes: true,
        viewTotal: true
      },
      buttons: [
        {
          extend: 'csv',
          text: '⬇ Export CSV',
          className: 'dt-button'
        }
      ],
      responsive: true,
      columnDefs: [
        { searchPanes: { show: true }, targets: [0, 2, 3] },
        { orderable: false, targets: 5 }
      ]
    });

    table.on('draw', function () {
      const visible = $('#jobs-table tbody tr:visible').length;
      $('#no-jobs-message').toggle(visible === 0);
    });
  });

document.getElementById("download-btn").addEventListener("click", function () {
  table.button('.buttons-csv').trigger();
});
