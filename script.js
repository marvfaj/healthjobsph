fetch('jobs_all_rows.html')
  .then(response => response.text())
  .then(html => {
    document.getElementById('job-table-body').outerHTML = html;

    // Add mobile data-labels
    $('#jobs-table tbody tr').each(function () {
      $(this).find('td').eq(0).attr('data-label', 'Office');
      $(this).find('td').eq(1).attr('data-label', 'Position');
      $(this).find('td').eq(2).attr('data-label', 'Region');
      $(this).find('td').eq(3).attr('data-label', 'Posting Date');
      $(this).find('td').eq(4).attr('data-label', 'Closing Date');
      $(this).find('td').eq(5).attr('data-label', 'Details');
    });

    // Initialize full-featured DataTable
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
        { orderable: false, targets: 5 } // Disable sort on 'Details'
      ]
    });

    // No match message
    table.on('draw', function () {
      const visibleRows = $('#jobs-table tbody tr:visible').length;
      $('#no-jobs-message').toggle(visibleRows === 0);
    });
  });
