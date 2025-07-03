// script.js – Filter and search nurse jobs using List.js

// Load HTML job rows from external fragment
fetch('jobs_all_rows.html')
  .then(response => {
    if (!response.ok) throw new Error(`Fetch failed: ${response.status}`);
    return response.text();
  })
  .then(html => {
    // Inject rows into tbody
    document.getElementById('job-table-body').innerHTML = html;

    // Initialize List.js
    const jobList = new List('job-list', {
      valueNames: ['office', 'position', 'region', 'island', 'posting', 'closing'],
      listClass: 'list'
    });

    // Handle island group filter buttons
    const buttons = document.querySelectorAll('.filter-btn');
    buttons.forEach(btn => {
      btn.addEventListener('click', () => {
        const island = btn.dataset.filter;
        jobList.filter(item => {
          if (island === 'all') return true;
          const islandCell = item.el.querySelector('td[data-label="Island"]');
          return islandCell && islandCell.textContent.trim() === island;
        });
      });
    });

    // Show or hide "no results" message
    jobList.on('updated', () => {
      const noResults = document.getElementById('no-results');
      if (jobList.matchingItems.length === 0) {
        noResults.style.display = 'block';
      } else {
        noResults.style.display = 'none';
      }
    });

    console.log(`✅ Loaded ${jobList.items.length} jobs.`);
  })
  .catch(error => {
    const fallback = document.getElementById('job-table-body');
    fallback.innerHTML = `<tr><td colspan="7">❌ Error loading jobs: ${error.message}</td></tr>`;
    console.error("❌ Failed to load job listings:", error);
  });
