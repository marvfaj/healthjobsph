// script.js – Filter and search nurse jobs using List.js
// Enhanced version with performance and reliability improvements

// Configuration
const CONFIG = {
  fetchTimeout: 10000,
  domSettleDelay: 100,
  cacheMaxAge: 300
};

// Utility functions
function showLoading(show = true) {
  const loader = document.getElementById('loading-indicator');
  if (loader) {
    loader.style.display = show ? 'block' : 'none';
  }
}

function validateRequiredElements() {
  const required = ['job-table-body', 'job-list', 'no-results'];
  const missing = required.filter(id => !document.getElementById(id));
  
  if (missing.length > 0) {
    throw new Error(`Missing required DOM elements: ${missing.join(', ')}`);
  }
}

function showError(message) {
  const tableBody = document.getElementById('job-table-body');
  if (tableBody) {
    tableBody.innerHTML = `<tr><td colspan="7">❌ ${message}</td></tr>`;
  }
  console.error(`❌ ${message}`);
}

function announceToScreenReader(message) {
  const announcement = document.createElement('div');
  announcement.setAttribute('aria-live', 'polite');
  announcement.setAttribute('aria-atomic', 'true');
  announcement.style.position = 'absolute';
  announcement.style.left = '-10000px';
  announcement.textContent = message;
  document.body.appendChild(announcement);
  
  setTimeout(() => {
    document.body.removeChild(announcement);
  }, 1000);
}

// Enhanced fetch with timeout and better error handling
function fetchJobsWithTimeout(url, timeout = CONFIG.fetchTimeout) {
  return Promise.race([
    fetch(url, {
      headers: {
        'Accept-Encoding': 'gzip, deflate',
        'Cache-Control': `max-age=${CONFIG.cacheMaxAge}`
      }
    }),
    new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Request timeout')), timeout)
    )
  ]);
}

// Optimized DOM injection using DocumentFragment
function injectJobsHTML(html) {
  const tableBody = document.getElementById('job-table-body');
  const fragment = document.createDocumentFragment();
  const tempDiv = document.createElement('div');
  
  tempDiv.innerHTML = html;
  
  while (tempDiv.firstChild) {
    fragment.appendChild(tempDiv.firstChild);
  }
  
  tableBody.appendChild(fragment);
  return tableBody;
}

// Initialize List.js with proper error handling
function initializeJobList() {
  return new Promise((resolve, reject) => {
    try {
      const jobList = new List('job-list', {
        valueNames: ['office', 'position', 'region', 'island', 'posting', 'closing'],
        listClass: 'list'
      });
      
      if (!jobList) {
        throw new Error('List.js failed to initialize');
      }
      
      if (jobList.items.length === 0) {
        throw new Error('No job items found in the list');
      }
      
      resolve(jobList);
    } catch (error) {
      reject(error);
    }
  });
}

// Pre-process island data for better filter performance
function preprocessIslandData(jobList) {
  return jobList.items.map(item => {
    const islandCell = item.el.querySelector('td[data-label="Island"]');
    return {
      item,
      island: islandCell ? islandCell.textContent.trim() : null
    };
  });
}

// Optimized filter function
function createFilterFunction(itemsWithIsland) {
  return function(targetIsland) {
    return function(item) {
      if (targetIsland === 'all') return true;
      
      const itemData = itemsWithIsland.find(data => data.item === item);
      return itemData && itemData.island === targetIsland;
    };
  };
}

// Setup filter buttons with event delegation
function setupFilterButtons(jobList, itemsWithIsland) {
  const filterFunction = createFilterFunction(itemsWithIsland);
  
  // Use event delegation for better performance
  document.addEventListener('click', (e) => {
    if (e.target.classList.contains('filter-btn')) {
      const island = e.target.dataset.filter;
      
      // Remove active class from all buttons
      document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('active');
      });
      
      // Add active class to clicked button
      e.target.classList.add('active');
      
      // Apply filter
      jobList.filter(filterFunction(island));
      
      // Announce filter change to screen readers
      const resultCount = jobList.matchingItems.length;
      announceToScreenReader(
        island === 'all' 
          ? `Showing all ${resultCount} jobs` 
          : `Filtered to ${resultCount} jobs in ${island}`
      );
    }
  });
}

// Handle no results display
function setupNoResultsHandler(jobList) {
  jobList.on('updated', () => {
    const noResults = document.getElementById('no-results');
    if (noResults) {
      if (jobList.matchingItems.length === 0) {
        noResults.style.display = 'block';
        noResults.setAttribute('aria-live', 'polite');
      } else {
        noResults.style.display = 'none';
      }
    }
  });
}

// Main initialization function
async function initializeJobTable() {
  try {
    // Show loading indicator
    showLoading(true);
    
    // Validate required DOM elements
    validateRequiredElements();
    
    // Fetch job data
    console.log('🔄 Fetching job data...');
    const response = await fetchJobsWithTimeout('jobs_all_rows.html');
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const html = await response.text();
    
    if (!html.trim()) {
      throw new Error('Empty response from server');
    }
    
    console.log(`📥 Received ${html.length} characters of HTML`);
    
    // Inject HTML into DOM
    injectJobsHTML(html);
    console.log('✅ HTML injected into DOM');
    
    // Wait for DOM to settle
    await new Promise(resolve => setTimeout(resolve, CONFIG.domSettleDelay));
    
    // Initialize List.js
    console.log('🔄 Initializing List.js...');
    const jobList = await initializeJobList();
    
    // Pre-process data for better performance
    const itemsWithIsland = preprocessIslandData(jobList);
    
    // Setup event handlers
    setupFilterButtons(jobList, itemsWithIsland);
    setupNoResultsHandler(jobList);
    
    // Hide loading indicator
    showLoading(false);
    
    console.log(`✅ Successfully loaded ${jobList.items.length} jobs`);
    announceToScreenReader(`${jobList.items.length} job listings loaded`);
    
    return jobList;
    
  } catch (error) {
    showLoading(false);
    showError(`Failed to load job listings: ${error.message}`);
    
    // Log detailed error for debugging
    console.error('❌ Job table initialization failed:', {
      message: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString()
    });
    
    throw error;
  }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeJobTable);
} else {
  // DOM is already loaded
  initializeJobTable();
}

// Export for testing (if needed)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    initializeJobTable,
    validateRequiredElements,
    preprocessIslandData
  };
}
