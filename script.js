// script.js

// ========== Constants ==========
const JOBS_FILE = 'jobs_all_rows.html';  // HTML fragment with <tr> rows
const JOB_TABLE_ID = '#jobs-table';
const JOB_BODY_ID = '#job-table-body';
const NO_MATCH_MSG = '#no-jobs-message';

// ========== Load Job Rows ==========
fetch(JOBS_FILE)
  .then(response => {
    if (!response.ok) throw new Error(`🚨 Failed to fetch ${JOBS_FILE}`);
    return response.text();
  })
  .then(html => {
    document.querySelector(JOB_BODY_ID).outerHTML = html;

    // Add mobile labels to each <td>
    $(`${JOB_TABLE_ID} tbody tr`).each(function () {
      $(this).find('td').eq(0).attr('data-label', 'Office');
      $(this).find('td').eq(1).attr('data-label', 'Position');
      $(this).find('td').eq(2).attr('data-label', 'Region');
      $(this).find('td').eq(3).attr('data-label', 'Posting Date');
      $(this).find('td').eq(4).attr('data-label', 'Closing Date');
      $(this).find('td').eq(5).attr('data-label', 'Details');
    });

    // ========== Initialize DataTable ==========
    window.table = $(JOB_TABLE_ID).DataTable({
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

    // ========== Handle No Matches ==========
    table.on('draw', function () {
      const visibleRows = $(`${JOB_TABLE_ID} tbody tr:visible`).length;
      $(NO_MATCH_MSG).toggle(visibleRows === 0);
    });

    // ========== Island Filter Buttons ==========
    $(document).on("click", ".filter-button", function () {
      const selected = $(this).attr("data-island");

      $(".filter-button").removeClass("active");
      $(this).addClass("active");

      if (selected === "all") {
        table.rows().every(function () {
          $(this.node()).show();
        });
      } else {
        table.rows().every(function () {
          const island = $(this.node()).data("island");
          $(this.node()).toggle(island === selected);
        });
      }

      table.draw();
    });

    console.log("✅ Job listings loaded and DataTable initialized.");
  })
  .catch(error => {
    console.error("❌ Error loading job listings:", error);
    $(JOB_BODY_ID).html('<tr><td colspan="6">⚠️ Failed to load job listings. Please try again later.</td></tr>');
  });
