document.addEventListener('DOMContentLoaded', () => {
  const projectList = document.getElementById('project-list');
  const addProjectButton = document.getElementById('add-project');
  const status = document.getElementById('status');
  const homeInput = document.getElementById('home');
  const workInput = document.getElementById('work');
  const jobInput = document.getElementById('job');

  // Load saved settings
  chrome.storage.sync.get({
    home: 'Wong Tai Sin',
    work: 'HKCEC',
    job: 'T9',
    projects: [{ name: 'VRMS', checked: true }, { name: 'RTPCS', checked: false }]
  }, (items) => {
    homeInput.value = items.home;
    workInput.value = items.work;
    jobInput.value = items.job;
    items.projects.forEach(project => addProjectField(project.name, project.checked));
  });

  // Debounce function to limit save frequency
  function debounce(func, wait) {
    let timeout;
    return function (...args) {
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(this, args), wait);
    };
  }

  // Show status message
  function showStatus(message, className) {
    status.textContent = message;
    status.className = className;
    if (className === 'saved') {
      setTimeout(() => {
        status.className = '';
      }, 2000);
    }
  }

  // Save settings
  function saveSettings() {
    const projects = Array.from(projectList.getElementsByClassName('project-entry')).map(entry => {
      const input = entry.querySelector('input[type="text"]');
      const radio = entry.querySelector('input[type="radio"]');
      return { name: input.value.trim(), checked: radio.checked };
    }).filter(project => project.name !== '');

    if (projects.length === 0) {
      showStatus('Please add at least one project.', 'error');
      return;
    }

    if (!projects.some(project => project.checked)) {
      showStatus('Please select a default project.', 'error');
      return;
    }

    showStatus('Saving...', 'saving');
    chrome.storage.sync.set({
      home: homeInput.value.trim(),
      work: workInput.value.trim(),
      job: jobInput.value.trim(),
      projects
    }, () => {
      showStatus('Saved', 'saved');
    });
  }

  const debouncedSave = debounce(saveSettings, 500);

  // Add a new project input field
  function addProjectField(name = '', checked = false) {
    const entry = document.createElement('div');
    entry.className = 'project-entry';

    const input = document.createElement('input');
    input.type = 'text';
    input.value = name;
    input.placeholder = 'e.g., VRMS';
    input.addEventListener('input', debouncedSave);

    const radio = document.createElement('input');
    radio.type = 'radio';
    radio.name = 'default-project';
    radio.checked = checked;
    radio.addEventListener('change', debouncedSave);

    const removeButton = document.createElement('button');
    removeButton.textContent = 'Remove';
    removeButton.onclick = () => {
      entry.remove();
      debouncedSave();
    };

    entry.appendChild(input);
    entry.appendChild(radio);
    entry.appendChild(removeButton);
    projectList.appendChild(entry);
  }

  // Add project button click
  addProjectButton.onclick = () => {
    addProjectField();
    debouncedSave();
  };

  // Auto-save on input changes
  homeInput.addEventListener('input', debouncedSave);
  workInput.addEventListener('input', debouncedSave);
  jobInput.addEventListener('input', debouncedSave);
});