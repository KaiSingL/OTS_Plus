document.addEventListener('DOMContentLoaded', () => {
  const projectList = document.getElementById('project-list');
  const addProjectButton = document.getElementById('add-project');
  const status = document.getElementById('status');
  const homeInput = document.getElementById('home');
  const workInput = document.getElementById('work');
  const jobInput = document.getElementById('job');
  const presetList = document.getElementById('preset-list');
  const addPresetButton = document.getElementById('add-preset');
  const presetPopup = document.getElementById('preset-popup');
  const presetLocationInput = document.getElementById('preset-location');
  const presetProjectInput = document.getElementById('preset-project');
  const presetPurposeInput = document.getElementById('preset-purpose');
  const presetSaveButton = document.getElementById('preset-save');
  const presetCancelButton = document.getElementById('preset-cancel');

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

  // Save settings to localStorage
  function saveSettings() {
    const projects = Array.from(projectList.getElementsByClassName('project-entry')).map(entry => {
      const input = entry.querySelector('input[type="text"]');
      const radio = entry.querySelector('input[type="radio"]');
      return { name: input.value.trim(), checked: radio.checked };
    }).filter(project => project.name !== '');

    const presets = Array.from(presetList.getElementsByClassName('preset-row')).map(row => {
      const cells = row.querySelectorAll('span');
      return {
        location: cells[0].textContent,
        project: cells[1].textContent,
        purpose: cells[2].textContent
      };
    });

    if (projects.length === 0) {
      showStatus('Please add at least one project.', 'error');
      return;
    }

    if (!projects.some(project => project.checked)) {
      showStatus('Please select a default project.', 'error');
      return;
    }

    showStatus('Saving...', 'saving');
    const newSettings = {
      home: homeInput.value.trim(),
      work: workInput.value.trim(),
      job: jobInput.value.trim(),
      projects,
      presets
    };
    localStorage.setItem('azotsSettings', JSON.stringify(newSettings));
    showStatus('Saved', 'saved');
  }

  const debouncedSave = debounce(saveSettings, 500);

  // Load saved settings from localStorage
  const defaultSettings = {
    home: 'Wong Tai Sin',
    work: 'HKCEC',
    job: 'T9',
    projects: [{ name: 'VRMS', checked: true }, { name: 'RTPCS', checked: false }],
    presets: []
  };
  const settings = JSON.parse(localStorage.getItem('azotsSettings')) || defaultSettings;
  homeInput.value = settings.home;
  workInput.value = settings.work;
  jobInput.value = settings.job;
  settings.projects.forEach(project => addProjectField(project.name, project.checked));
  settings.presets.forEach(preset => addPresetRow(preset.location, preset.project, preset.purpose));

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

  // Add a new preset row
  function addPresetRow(location, project, purpose) {
    const row = document.createElement('div');
    row.className = 'preset-row';

    const locationCell = document.createElement('span');
    locationCell.textContent = location;
    const projectCell = document.createElement('span');
    projectCell.textContent = project;
    const purposeCell = document.createElement('span');
    purposeCell.textContent = purpose;

    const removeButton = document.createElement('button');
    removeButton.innerHTML = '&times;'; // Use × symbol
    removeButton.onclick = () => {
      row.remove();
      debouncedSave();
    };

    row.appendChild(locationCell);
    row.appendChild(projectCell);
    row.appendChild(purposeCell);
    row.appendChild(removeButton);
    presetList.appendChild(row);
  }

  // Handle preset popup
  addPresetButton.onclick = () => {
    presetPopup.classList.add('show');
    presetLocationInput.value = '';
    presetProjectInput.value = '';
    presetPurposeInput.value = '';
    presetSaveButton.disabled = true;
  };

  presetCancelButton.onclick = () => {
    presetPopup.classList.remove('show');
  };

  function checkPresetInputs() {
    const isValid = presetLocationInput.value.trim() !== '' &&
                    presetProjectInput.value.trim() !== '' &&
                    presetPurposeInput.value.trim() !== '';
    presetSaveButton.disabled = !isValid;
  }

  presetLocationInput.addEventListener('input', checkPresetInputs);
  presetProjectInput.addEventListener('input', checkPresetInputs);
  presetPurposeInput.addEventListener('input', checkPresetInputs);

  presetSaveButton.onclick = () => {
    if (!presetSaveButton.disabled) {
      addPresetRow(
        presetLocationInput.value.trim(),
        presetProjectInput.value.trim(),
        presetPurposeInput.value.trim()
      );
      presetPopup.classList.remove('show');
      debouncedSave();
    }
  };
});