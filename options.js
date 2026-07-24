// options.js
const AZOTS_DEBUG = false;
const _debugLog = (...args) => { if (AZOTS_DEBUG) console.log(...args); };
const _debugError = (...args) => { if (AZOTS_DEBUG) console.error(...args); };

document.addEventListener('DOMContentLoaded', () => {
  _debugLog('DOM content loaded, initializing settings page');

  const presetList = document.getElementById('preset-list');
  const addPresetButton = document.getElementById('add-preset');
  const status = document.getElementById('status');
  const presetPopup = document.getElementById('preset-popup');
  const presetLocationInput = document.getElementById('preset-location');
  const presetProjectInput = document.getElementById('preset-project');
  const presetPurposeInput = document.getElementById('preset-purpose');
  const presetStartTime = document.getElementById('preset-start-time');
  const presetSaveButton = document.getElementById('preset-save');
  const presetCancelButton = document.getElementById('preset-cancel');

  const travelPresetList = document.getElementById('travel-preset-list');
  const addTravelPresetButton = document.getElementById('add-travel-preset');
  const travelPresetPopup = document.getElementById('travel-preset-popup');
  const travelNameInput = document.getElementById('travel-name');
  const travelFromInput = document.getElementById('travel-from');
  const travelToInput = document.getElementById('travel-to');
  const travelJobInput = document.getElementById('travel-job');
  const travelProjectInput = document.getElementById('travel-project');
  const travelVehicleInput = document.getElementById('travel-vehicle');
  const travelFeeInput = document.getElementById('travel-fee');
  const travelSaveButton = document.getElementById('travel-save');
  const travelCancelButton = document.getElementById('travel-cancel');

  const mealPresetList = document.getElementById('meal-preset-list');
  const addMealPresetButton = document.getElementById('add-meal-preset');
  const mealPresetPopup = document.getElementById('meal-preset-popup');
  const mealNameInput = document.getElementById('meal-name');
  const mealProjectInput = document.getElementById('meal-project');
  const mealPurposeInput = document.getElementById('meal-purpose');
  const mealSaveButton = document.getElementById('meal-save');
  const mealCancelButton = document.getElementById('meal-cancel');

  const backdrop = document.getElementById('backdrop');

  function initCustomDropdown(container) {
    const trigger = container.querySelector('.custom-dropdown-trigger');
    const menu = container.querySelector('.custom-dropdown-menu');
    const options = container.querySelectorAll('.custom-dropdown-option');
    const hiddenInput = container.querySelector('input[type="hidden"]');
    const valueDisplay = container.querySelector('.custom-dropdown-value');

    function updateDisplay(val) {
      const opt = Array.from(options).find(o => o.dataset.value === val);
      valueDisplay.textContent = opt ? opt.textContent : '—';
      options.forEach(o => o.classList.toggle('selected', o.dataset.value === val));
    }

    hiddenInput.addEventListener('change', () => updateDisplay(hiddenInput.value));

    trigger.addEventListener('click', e => {
      e.stopPropagation();
      container.classList.toggle('open');
      if (container.classList.contains('open')) {
        const sel = container.querySelector('.custom-dropdown-option.selected');
        if (sel) sel.scrollIntoView({ block: 'nearest' });
      }
    });

    options.forEach(opt => {
      opt.addEventListener('click', () => {
        hiddenInput.value = opt.dataset.value;
        hiddenInput.dispatchEvent(new Event('change', { bubbles: true }));
        container.classList.remove('open');
      });
    });

    document.addEventListener('click', e => {
      if (!container.contains(e.target)) container.classList.remove('open');
    });

    updateDisplay(hiddenInput.value);
  }

  const dd = document.getElementById('preset-start-time-dd');
  if (dd) initCustomDropdown(dd);

  let editingRowPreset = null;
  let editingRowTravel = null;
  let editingRowMeal = null;

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
    _debugLog(`Status updated: ${message}, class: ${className}`);
    status.textContent = message;
    status.className = className;
    if (className === 'saved') {
      setTimeout(() => {
        status.className = '';
      }, 2000);
    }
  }

  // Save settings to chrome.storage.sync
  function saveSettings() {
    _debugLog('Saving settings...');
      const presets = Array.from(presetList.querySelectorAll('tbody tr')).map(row => {
      const cells = row.querySelectorAll('td');
      const preset = {
        location: cells[0].textContent,
        project: cells[1].textContent,
        purpose: cells[2].textContent,
        startTime: cells[3].textContent
      };
      _debugLog(`Preset saved: ${JSON.stringify(preset)}`);
      return preset;
    });

    const claimTravelPresets = Array.from(travelPresetList.querySelectorAll('tbody tr')).map(row => {
      const cells = row.querySelectorAll('td');
      const preset = {
        name: cells[0].textContent,
        fromLocation: cells[1].textContent,
        toLocation: cells[2].textContent,
        job: cells[3].textContent,
        projectName: cells[4].textContent,
        vehicle: cells[5].textContent,
        fee: cells[6].textContent
      };
      _debugLog(`Claim Travel Preset saved: ${JSON.stringify(preset)}`);
      return preset;
    });

    const claimMealPresets = Array.from(mealPresetList.querySelectorAll('tbody tr')).map(row => {
      const cells = row.querySelectorAll('td');
      const preset = {
        name: cells[0].textContent,
        projectName: cells[1].textContent,
        purpose: cells[2].textContent
      };
      _debugLog(`Claim Meal Preset saved: ${JSON.stringify(preset)}`);
      return preset;
    });

    showStatus('Saving...', 'saving');
    const newSettings = {
      presets,
      claimTravelPresets,
      claimMealPresets
    };
    _debugLog(`Settings to save: ${JSON.stringify(newSettings)}`);
    chrome.storage.sync.set({ azotsSettings: newSettings })
      .then(() => {
        _debugLog('Settings saved to chrome.storage.sync:', newSettings);
        showStatus('Saved', 'saved');
      })
      .catch(error => {
        _debugError('Error saving settings to chrome.storage.sync:', error);
        showStatus('Error saving settings.', 'error');
      });
  }

  const debouncedSave = debounce(saveSettings, 500);

  // Load saved settings from chrome.storage.sync
  const defaultSettings = {
    presets: [],
    claimTravelPresets: [],
    claimMealPresets: []
  };

  chrome.storage.sync.get('azotsSettings')
    .then(data => {
      const settings = data.azotsSettings || defaultSettings;
      _debugLog(`Loaded settings: ${JSON.stringify(settings)}`);

      addTableToList(presetList);
      addHeaderToTable(presetList.querySelector('table'), ['Location', 'Project Name', 'Purpose', 'Start Time', '']);
      settings.presets.forEach(preset => addPresetRow(preset.location, preset.project, preset.purpose, preset.startTime || ''));

      addTableToList(travelPresetList);
      addHeaderToTable(travelPresetList.querySelector('table'), ['Preset Name', 'From Location', 'To Location', 'Job', 'Project Name', 'Vehicle', 'Fee', '']);
      settings.claimTravelPresets.forEach(preset => addTravelPresetRow(preset.name, preset.fromLocation, preset.toLocation, preset.job, preset.projectName, preset.vehicle, preset.fee));

      addTableToList(mealPresetList);
      addHeaderToTable(mealPresetList.querySelector('table'), ['Preset Name', 'Project Name', 'Purpose', '']);
      settings.claimMealPresets.forEach(preset => addMealPresetRow(preset.name, preset.projectName, preset.purpose));
    })
    .catch(error => {
      _debugError('Error loading settings from chrome.storage.sync:', error);
    });

  function addTableToList(list) {
    const table = document.createElement('table');
    const thead = document.createElement('thead');
    const tbody = document.createElement('tbody');
    table.appendChild(thead);
    table.appendChild(tbody);
    list.appendChild(table);
  }

  function addHeaderToTable(table, headers) {
    const headerRow = document.createElement('tr');
    headers.forEach(text => {
      const th = document.createElement('th');
      th.textContent = text;
      headerRow.appendChild(th);
    });
    table.querySelector('thead').appendChild(headerRow);
  }

  // Add a new preset row for timesheet
  function addPresetRow(location, project, purpose, startTime) {
    _debugLog(`Adding preset row: location=${location}, project=${project}, purpose=${purpose}, startTime=${startTime}`);
    const row = document.createElement('tr');

    const locationCell = document.createElement('td');
    locationCell.textContent = location;
    const projectCell = document.createElement('td');
    projectCell.textContent = project;
    const purposeCell = document.createElement('td');
    purposeCell.textContent = purpose;
    const startTimeCell = document.createElement('td');
    startTimeCell.textContent = startTime || '';

    const actionsCell = document.createElement('td');
    const actions = document.createElement('div');
    actions.className = 'actions';

    const editButton = document.createElement('button');
    editButton.textContent = 'Edit';
    editButton.className = 'edit';
    editButton.onclick = () => {
      editingRowPreset = row;
      presetLocationInput.value = locationCell.textContent;
      presetProjectInput.value = projectCell.textContent;
      presetPurposeInput.value = purposeCell.textContent;
      presetStartTime.value = startTimeCell.textContent;
      presetStartTime.dispatchEvent(new Event('change'));
      presetPopup.classList.add('show');
      backdrop.classList.add('show');
      checkPresetInputs();
    };

    const removeButton = document.createElement('button');
    removeButton.innerHTML = '✕';
    removeButton.className = 'remove';
    removeButton.onclick = () => {
      _debugLog(`Removing preset: ${location}, ${project}, ${purpose}`);
      row.remove();
      debouncedSave();
    };

    actions.appendChild(editButton);
    actions.appendChild(removeButton);
    actionsCell.appendChild(actions);

    row.appendChild(locationCell);
    row.appendChild(projectCell);
    row.appendChild(purposeCell);
    row.appendChild(startTimeCell);
    row.appendChild(actionsCell);
    presetList.querySelector('tbody').appendChild(row);
  }

  // Add a new travel preset row
  function addTravelPresetRow(name, fromLocation, toLocation, job, projectName, vehicle, fee) {
    _debugLog(`Adding travel preset row: name=${name}, from=${fromLocation}, to=${toLocation}, job=${job}, project=${projectName}, vehicle=${vehicle}, fee=${fee}`);
    const row = document.createElement('tr');

    const nameCell = document.createElement('td');
    nameCell.textContent = name;
    const fromCell = document.createElement('td');
    fromCell.textContent = fromLocation;
    const toCell = document.createElement('td');
    toCell.textContent = toLocation;
    const jobCell = document.createElement('td');
    jobCell.textContent = job;
    const projectCell = document.createElement('td');
    projectCell.textContent = projectName;
    const vehicleCell = document.createElement('td');
    vehicleCell.textContent = vehicle;
    const feeCell = document.createElement('td');
    feeCell.textContent = fee;

    const actionsCell = document.createElement('td');
    const actions = document.createElement('div');
    actions.className = 'actions';

    const editButton = document.createElement('button');
    editButton.textContent = 'Edit';
    editButton.className = 'edit';
    editButton.onclick = () => {
      editingRowTravel = row;
      travelNameInput.value = nameCell.textContent;
      travelFromInput.value = fromCell.textContent;
      travelToInput.value = toCell.textContent;
      travelJobInput.value = jobCell.textContent;
      travelProjectInput.value = projectCell.textContent;
      travelVehicleInput.value = vehicleCell.textContent;
      travelFeeInput.value = feeCell.textContent;
      travelPresetPopup.classList.add('show');
      backdrop.classList.add('show');
      checkTravelPresetInputs();
    };

    const removeButton = document.createElement('button');
    removeButton.innerHTML = '✕';
    removeButton.className = 'remove';
    removeButton.onclick = () => {
      _debugLog(`Removing travel preset: ${name}`);
      row.remove();
      debouncedSave();
    };

    actions.appendChild(editButton);
    actions.appendChild(removeButton);
    actionsCell.appendChild(actions);

    row.appendChild(nameCell);
    row.appendChild(fromCell);
    row.appendChild(toCell);
    row.appendChild(jobCell);
    row.appendChild(projectCell);
    row.appendChild(vehicleCell);
    row.appendChild(feeCell);
    row.appendChild(actionsCell);
    travelPresetList.querySelector('tbody').appendChild(row);
  }

  // Add a new meal preset row
  function addMealPresetRow(name, projectName, purpose) {
    _debugLog(`Adding meal preset row: name=${name}, project=${projectName}, purpose=${purpose}`);
    const row = document.createElement('tr');

    const nameCell = document.createElement('td');
    nameCell.textContent = name;
    const projectCell = document.createElement('td');
    projectCell.textContent = projectName;
    const purposeCell = document.createElement('td');
    purposeCell.textContent = purpose;

    const actionsCell = document.createElement('td');
    const actions = document.createElement('div');
    actions.className = 'actions';

    const editButton = document.createElement('button');
    editButton.textContent = 'Edit';
    editButton.className = 'edit';
    editButton.onclick = () => {
      editingRowMeal = row;
      mealNameInput.value = nameCell.textContent;
      mealProjectInput.value = projectCell.textContent;
      mealPurposeInput.value = purposeCell.textContent;
      mealPresetPopup.classList.add('show');
      backdrop.classList.add('show');
      checkMealPresetInputs();
    };

    const removeButton = document.createElement('button');
    removeButton.innerHTML = '✕';
    removeButton.className = 'remove';
    removeButton.onclick = () => {
      _debugLog(`Removing meal preset: ${name}`);
      row.remove();
      debouncedSave();
    };

    actions.appendChild(editButton);
    actions.appendChild(removeButton);
    actionsCell.appendChild(actions);

    row.appendChild(nameCell);
    row.appendChild(projectCell);
    row.appendChild(purposeCell);
    row.appendChild(actionsCell);
    mealPresetList.querySelector('tbody').appendChild(row);
  }

  // Handle timesheet preset popup
  addPresetButton.onclick = () => {
    _debugLog('Add preset button clicked, showing popup');
    editingRowPreset = null;
    presetLocationInput.value = '';
    presetProjectInput.value = '';
    presetPurposeInput.value = '';
    presetStartTime.value = '';
    presetStartTime.dispatchEvent(new Event('change'));
    presetSaveButton.disabled = true;
    presetPopup.classList.add('show');
    backdrop.classList.add('show');
  };

  presetCancelButton.onclick = () => {
    _debugLog('Cancel button clicked, hiding popup');
    presetPopup.classList.remove('show');
    backdrop.classList.remove('show');
  };

  function checkPresetInputs() {
    const isValid = presetLocationInput.value.trim() !== '' &&
                    presetProjectInput.value.trim() !== '' &&
                    presetPurposeInput.value.trim() !== '';
    _debugLog(`Checking preset inputs, valid: ${isValid}`);
    presetSaveButton.disabled = !isValid;
  }

  presetLocationInput.addEventListener('input', checkPresetInputs);
  presetProjectInput.addEventListener('input', checkPresetInputs);
  presetPurposeInput.addEventListener('input', checkPresetInputs);

  presetSaveButton.onclick = () => {
    _debugLog('Save button clicked');
    if (!presetSaveButton.disabled) {
      const location = presetLocationInput.value.trim();
      const project = presetProjectInput.value.trim();
      const purpose = presetPurposeInput.value.trim();
      const startTime = presetStartTime.value;
      if (editingRowPreset) {
        const cells = editingRowPreset.querySelectorAll('td');
        cells[0].textContent = location;
        cells[1].textContent = project;
        cells[2].textContent = purpose;
        cells[3].textContent = startTime;
        editingRowPreset = null;
      } else {
        addPresetRow(location, project, purpose, startTime);
      }
      _debugLog('Preset saved, hiding popup');
      presetPopup.classList.remove('show');
      backdrop.classList.remove('show');
      debouncedSave();
    }
  };

  // Handle claim travel preset popup
  addTravelPresetButton.onclick = () => {
    _debugLog('Add travel preset button clicked, showing popup');
    editingRowTravel = null;
    travelNameInput.value = '';
    travelFromInput.value = '';
    travelToInput.value = '';
    travelJobInput.value = '';
    travelProjectInput.value = '';
    travelVehicleInput.value = '';
    travelFeeInput.value = '';
    travelSaveButton.disabled = true;
    travelPresetPopup.classList.add('show');
    backdrop.classList.add('show');
  };

  travelCancelButton.onclick = () => {
    _debugLog('Travel cancel button clicked, hiding popup');
    travelPresetPopup.classList.remove('show');
    backdrop.classList.remove('show');
  };

  function checkTravelPresetInputs() {
    const isValid = travelNameInput.value.trim() !== '' &&
                    travelFromInput.value.trim() !== '' &&
                    travelToInput.value.trim() !== '' &&
                    travelJobInput.value.trim() !== '' &&
                    travelProjectInput.value.trim() !== '' &&
                    travelVehicleInput.value.trim() !== '' &&
                    travelFeeInput.value.trim() !== '';
    _debugLog(`Checking travel preset inputs, valid: ${isValid}`);
    travelSaveButton.disabled = !isValid;
  }

  travelNameInput.addEventListener('input', checkTravelPresetInputs);
  travelFromInput.addEventListener('input', checkTravelPresetInputs);
  travelToInput.addEventListener('input', checkTravelPresetInputs);
  travelJobInput.addEventListener('input', checkTravelPresetInputs);
  travelProjectInput.addEventListener('input', checkTravelPresetInputs);
  travelVehicleInput.addEventListener('input', checkTravelPresetInputs);
  travelFeeInput.addEventListener('input', checkTravelPresetInputs);

  travelSaveButton.onclick = () => {
    _debugLog('Travel save button clicked');
    if (!travelSaveButton.disabled) {
      const name = travelNameInput.value.trim();
      const fromLocation = travelFromInput.value.trim();
      const toLocation = travelToInput.value.trim();
      const job = travelJobInput.value.trim();
      const projectName = travelProjectInput.value.trim();
      const vehicle = travelVehicleInput.value.trim();
      const fee = travelFeeInput.value.trim();
      if (editingRowTravel) {
        const cells = editingRowTravel.querySelectorAll('td');
        cells[0].textContent = name;
        cells[1].textContent = fromLocation;
        cells[2].textContent = toLocation;
        cells[3].textContent = job;
        cells[4].textContent = projectName;
        cells[5].textContent = vehicle;
        cells[6].textContent = fee;
        editingRowTravel = null;
      } else {
        addTravelPresetRow(name, fromLocation, toLocation, job, projectName, vehicle, fee);
      }
      _debugLog('Travel preset saved, hiding popup');
      travelPresetPopup.classList.remove('show');
      backdrop.classList.remove('show');
      debouncedSave();
    }
  };

  // Handle claim meal preset popup
  addMealPresetButton.onclick = () => {
    _debugLog('Add meal preset button clicked, showing popup');
    editingRowMeal = null;
    mealNameInput.value = '';
    mealProjectInput.value = '';
    mealPurposeInput.value = '';
    mealSaveButton.disabled = true;
    mealPresetPopup.classList.add('show');
    backdrop.classList.add('show');
  };

  mealCancelButton.onclick = () => {
    _debugLog('Meal cancel button clicked, hiding popup');
    mealPresetPopup.classList.remove('show');
    backdrop.classList.remove('show');
  };

  function checkMealPresetInputs() {
    const isValid = mealNameInput.value.trim() !== '' &&
                    mealProjectInput.value.trim() !== '' &&
                    mealPurposeInput.value.trim() !== '';
    _debugLog(`Checking meal preset inputs, valid: ${isValid}`);
    mealSaveButton.disabled = !isValid;
  }

  mealNameInput.addEventListener('input', checkMealPresetInputs);
  mealProjectInput.addEventListener('input', checkMealPresetInputs);
  mealPurposeInput.addEventListener('input', checkMealPresetInputs);

  mealSaveButton.onclick = () => {
    _debugLog('Meal save button clicked');
    if (!mealSaveButton.disabled) {
      const name = mealNameInput.value.trim();
      const projectName = mealProjectInput.value.trim();
      const purpose = mealPurposeInput.value.trim();
      if (editingRowMeal) {
        const cells = editingRowMeal.querySelectorAll('td');
        cells[0].textContent = name;
        cells[1].textContent = projectName;
        cells[2].textContent = purpose;
        editingRowMeal = null;
      } else {
        addMealPresetRow(name, projectName, purpose);
      }
      _debugLog('Meal preset saved, hiding popup');
      mealPresetPopup.classList.remove('show');
      backdrop.classList.remove('show');
      debouncedSave();
    }
  };
});