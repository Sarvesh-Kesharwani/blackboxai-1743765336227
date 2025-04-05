// Content script for Naukri.com interaction
(function() {
  'use strict';

  // Extract job details from current page
  function extractJobDetails() {
    const jobTitle = document.querySelector('.jd-header-title')?.textContent?.trim();
    const company = document.querySelector('.jd-header-comp-name')?.textContent?.trim();
    const description = document.querySelector('.dang-inner-html')?.textContent?.trim();
    const easyApply = !!document.querySelector('.easy-apply');

    if (jobTitle && description) {
      return {
        title: jobTitle,
        company: company,
        description: description,
        easyApply: easyApply,
        url: window.location.href,
        timestamp: new Date().toISOString()
      };
    }
    return null;
  }

  // Process job recommendations on page load
  function processRecommendations() {
    const jobCards = document.querySelectorAll('.jobTuple');
    jobCards.forEach(card => {
      const easyApply = card.querySelector('.easy-apply');
      if (easyApply) {
        const job = {
          title: card.querySelector('.title')?.textContent?.trim(),
          company: card.querySelector('.comp-name')?.textContent?.trim(),
          url: card.querySelector('a.title')?.href,
          easyApply: true
        };
        chrome.runtime.sendMessage({
          action: 'extract_jd',
          job: job
        });
      }
    });
  }

  // Handle Easy Apply form submission
  function handleEasyApply() {
    const applyButton = document.querySelector('.easy-apply');
    if (applyButton) {
      applyButton.addEventListener('click', async () => {
        // Wait for form to appear
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Fill form if needed
        const form = document.querySelector('.apply-form');
        if (form) {
          // Add logic to handle form filling here
          // This would need to be customized based on Naukri's form structure
        }
      });
    }
  }

  // Main execution
  if (window.location.href.includes('naukri.com/mnjuser')) {
    // Profile page - handle resume download
    const resumeDownload = document.querySelector('.downloadResume');
    if (resumeDownload) {
      chrome.runtime.sendMessage({
        action: 'download_resume',
        url: resumeDownload.href
      });
    }
  } else if (window.location.href.includes('naukri.com/job-listings')) {
    // Job listings page
    processRecommendations();
  } else if (window.location.href.includes('naukri.com/job-details')) {
    // Job details page
    handleEasyApply();
  }
})();