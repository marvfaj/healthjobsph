fetch('jobs_all_rows.html')
  .then(response => response.text())
  .then(html => {
    document.getElementById('job-table-body').outerHTML = html;

    // Add mobile-friendly labels
    $('#jobs-table tbody tr').each(function () {
      $(this).find('td').eq(0).attr('data-label', 'Office');
      $(this).find('td').eq(1).attr('data-label', 'Position');
      $(this).find('td').eq(2).attr('data-label', 'Region');
      $(this).find('td').eq(3).attr('data-label', 'Posting Date');
      $(this).find('td').eq(4).attr('data-label', 'Closing Date');
      $(this).find('td').eq(5).attr('data-label', 'Details');
    });

    // Enable filtering and search
    const table = $('#jobs-table').DataTable({
      dom: 'Plfrtip',
      responsive: true,
      searchPanes: {
        cascadePanes: true,
        viewTotal: true
      },
      columnDefs: [
        { searchPanes: { show: true }, targets: [0, 2] },
        { orderable: true, targets: [3, 4] },
        { orderable: false, targets: 5 }
      ]
    });

    // Show or hide the "no jobs" message
    table.on('draw', function () {
      const visible = $('#jobs-table tbody tr:visible').length;
      $('#no-jobs-message').toggle(visible === 0);
    });
  });
