document.addEventListener('DOMContentLoaded', function() {
  // DOM elements
  const startBtn = document.getElementById('start-btn');
  const stopBtn = document.getElementById('stop-btn');
  const settingsBtn = document.getElementById('settings-btn');
  const mainView = document.getElementById('main-view');
  const progressView = document.getElementById('progress-view');
  const logContainer = document.getElementById('log-container');
  const statusIndicator = document.getElementById('status-indicator');
  const statusText = document.getElementById('status-text');
  const progressBar = document.getElementById('progress-bar');
  const progressText = document.getElementById('progress-text');
  const currentJob = document.getElementById('current-job');
  const logContent = document.getElementById('log-content');

  // State variables
  let isRunning = false;
  let jobCount = 0;
  let processedCount = 0;

  // Initialize UI
  updateStatus('ready');

  // Event listeners
  startBtn.addEventListener('click', startAutomation);
  stopBtn.addEventListener('click', stopAutomation);
  settingsBtn.addEventListener('click', openSettings);

  // Communication with background script
  chrome.runtime.onMessage.addListener((message) => {
    if (message.type === 'status_update') {
      updateStatus(message.status);
    }
    if (message.type === 'job_update') {
      updateJobProgress(message);
    }
    if (message.type === 'log') {
      addLogEntry(message.text);
    }
  });

  // Functions
  function startAutomation() {
    chrome.runtime.sendMessage({ action: 'start_automation' }, (response) => {
      if (response && response.status === 'started') {
        isRunning = true;
        mainView.classList.add('hidden');
        progressView.classList.remove('hidden');
        logContainer.classList.remove('hidden');
        addLogEntry('Automation started');
      }
    });
  }

  function stopAutomation() {
    chrome.runtime.sendMessage({ action: 'stop_automation' }, () => {
      isRunning = false;
      mainView.classList.remove('hidden');
      progressView.classList.add('hidden');
      addLogEntry('Automation stopped by user');
    });
  }

  function openSettings() {
    chrome.runtime.openOptionsPage();
  }

  function updateStatus(status) {
    statusText.textContent = status.charAt(0).toUpperCase() + status.slice(1);
    
    switch(status) {
      case 'ready':
        statusIndicator.className = 'w-3 h-3 rounded-full bg-gray-300 mr-2';
        break;
      case 'running':
        statusIndicator.className = 'w-3 h-3 rounded-full bg-green-500 mr-2';
        break;
      case 'error':
        statusIndicator.className = 'w-3 h-3 rounded-full bg-red-500 mr-2';
        break;
      case 'paused':
        statusIndicator.className = 'w-3 h-3 rounded-full bg-yellow-500 mr-2';
        break;
    }
  }

  function updateJobProgress(data) {
    jobCount = data.totalJobs || 0;
    processedCount = data.processedJobs || 0;
    const progress = jobCount > 0 ? Math.round((processedCount / jobCount) * 100) : 0;
    
    progressBar.style.width = `${progress}%`;
    progressText.textContent = `${processedCount}/${jobCount} jobs processed`;
    
    if (data.currentJob) {
      currentJob.textContent = `${data.currentJob.title} at ${data.currentJob.company}`;
      addLogEntry(`Processing: ${data.currentJob.title}`);
    }
  }

  function addLogEntry(text) {
    const timestamp = new Date().toLocaleTimeString();
    const entry = document.createElement('div');
    entry.className = 'mb-1';
    entry.innerHTML = `<span class="text-gray-500">[${timestamp}]</span> ${text}`;
    logContent.appendChild(entry);
    logContent.scrollTop = logContent.scrollHeight;
  }
});