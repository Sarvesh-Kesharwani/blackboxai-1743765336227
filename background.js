// Background service worker for automation
chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.sync.set({ jobs: [], resume: null });
});

// Listen for messages from content script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "extract_jd") {
    chrome.storage.sync.get(['jobs'], (data) => {
      const updatedJobs = [...(data.jobs || []), request.job];
      chrome.storage.sync.set({ jobs: updatedJobs });
    });
  }
  if (request.action === "download_resume") {
    chrome.downloads.download({
      url: request.url,
      filename: 'resume.pdf'
    });
  }
});

// Automation controller
async function processJobs() {
  const { jobs } = await chrome.storage.sync.get(['jobs']);
  for (const job of jobs) {
    if (job.easyApply) {
      await applyToJob(job);
    }
  }
}

async function applyToJob(job) {
  try {
    // Open job page
    const tab = await chrome.tabs.create({ url: job.url, active: false });
    
    // Wait for page to load
    await new Promise(resolve => {
      chrome.tabs.onUpdated.addListener(function listener(tabId, info) {
        if (tabId === tab.id && info.status === 'complete') {
          chrome.tabs.onUpdated.removeListener(listener);
          resolve();
        }
      });
    });

    // Inject content script to apply
    await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      files: ['content_scripts.js']
    });

    // Close tab after applying
    await chrome.tabs.remove(tab.id);
  } catch (error) {
    console.error('Error applying to job:', error);
  }
}

// Expose to popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request === 'start_automation') {
    processJobs();
    sendResponse({ status: 'started' });
  }
});