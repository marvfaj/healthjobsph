// 1. Load HTML <tr> rows from external file
fetch('jobs_all_rows.html')
  .then(response => response.text())
  .then(html => {
    // 2. Insert rows into the table
    document.getElementById('job-table-body').innerHTML = html;

    // 3. Initialize List.js
    const options = {
      valueNames: ['office', 'position', 'region', 'posting', 'closing'],
      listClass: 'list'
    };
    const jobList = new List('job-list', options);

    // 4. Island group filter buttons
    document.querySelectorAll('.filter-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const island = btn.dataset.filter;
        jobList.filter(item => {
          if (island === 'all') return true;
          return item.el.dataset.island === island;
        });
      });
    });

    // 5. Show/hide "no results" message
    jobList.on('updated', () => {
      const noResults = document.getElementById('no-results');
      if (jobList.matchingItems.length === 0) {
        noResults.style.display = 'block';
      } else {
        noResults.style.display = 'none';
      }
    });

  }).catch(error => {
    document.getElementById('job-table-body').innerHTML = `<tr><td colspan="6">❌ Error loading jobs: ${error.message}</td></tr>`;
    console.error("Error loading job data:", error);
  });
