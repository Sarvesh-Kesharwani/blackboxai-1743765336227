document.addEventListener('DOMContentLoaded', function() {
  const form = document.getElementById('settings-form');
  const resumeOptions = document.getElementById('resume-options');
  const modifyResumeCheckbox = document.getElementById('modify-resume');

  // Load saved settings
  chrome.storage.sync.get([
    'username',
    'password',
    'autoLogin',
    'skipNonEasy',
    'modifyResume',
    'textColor',
    'fontSize'
  ], function(settings) {
    document.getElementById('username').value = settings.username || '';
    document.getElementById('password').value = settings.password || '';
    document.getElementById('auto-login').checked = settings.autoLogin !== false;
    document.getElementById('skip-non-easy').checked = settings.skipNonEasy !== false;
    document.getElementById('modify-resume').checked = settings.modifyResume !== false;
    document.getElementById('text-color').value = settings.textColor || '#ffffff';
    document.getElementById('font-size').value = settings.fontSize || 1;
    
    // Toggle resume options visibility
    resumeOptions.style.display = modifyResumeCheckbox.checked ? 'block' : 'none';
  });

  // Toggle resume options
  modifyResumeCheckbox.addEventListener('change', function() {
    resumeOptions.style.display = this.checked ? 'block' : 'none';
  });

  // Save settings
  form.addEventListener('submit', function(e) {
    e.preventDefault();
    
    const settings = {
      username: document.getElementById('username').value,
      password: document.getElementById('password').value,
      autoLogin: document.getElementById('auto-login').checked,
      skipNonEasy: document.getElementById('skip-non-easy').checked,
      modifyResume: document.getElementById('modify-resume').checked,
      textColor: document.getElementById('text-color').value,
      fontSize: parseInt(document.getElementById('font-size').value)
    };

    chrome.storage.sync.set(settings, function() {
      // Show success message
      const submitBtn = form.querySelector('button[type="submit"]');
      const originalText = submitBtn.innerHTML;
      submitBtn.innerHTML = '<i class="fas fa-check mr-2"></i> Saved!';
      submitBtn.classList.remove('bg-blue-600', 'hover:bg-blue-700');
      submitBtn.classList.add('bg-green-600', 'hover:bg-green-700');
      
      setTimeout(function() {
        submitBtn.innerHTML = originalText;
        submitBtn.classList.remove('bg-green-600', 'hover:bg-green-700');
        submitBtn.classList.add('bg-blue-600', 'hover:bg-blue-700');
      }, 2000);
    });
  });
});