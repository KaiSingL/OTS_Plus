// content.js for AzOTS Plus Chrome Extension

// Constants
const DEFAULT_SETTINGS = {
    presets: [],
    claimTravelPresets: [],
    claimMealPresets: []
};

const PAGE_PATHS = {
    CREATE_CLAIM: '/hkots/create_claim_record.jsp',
    LOG_USER: '/hkots/ots002_log_user.jsp',
    PRINT_CLAIM: '/hkots/print_claim_record.jsp'
};

const FIELD_SELECTORS = {
    CLAIM_DATE: 'input[name="CLAIM_DATE"]',
    CLAIM_TYPE: 'select[name="CLAIM_TYPE"]',
    TRAVEL_TYPE: 'select[name="TRAVEL_TYPE"]',
    LOC_FR: 'select[name="LOC_FR"], select[name="LOC_ID"]',
    LOC_TO: 'select[name="LOC_TO"]',
    LOC_DESC_FR: 'input[name="LOC_DESC_FR"], input[name="LOC_DESC"]',
    LOC_DESC_TO: 'input[name="LOC_DESC_TO"]',
    PROJ_ID: 'select[name="PROJ_ID"]',
    JOB_ID: 'select[name="JOB_ID"]',
    AMT: 'input[name="AMT"]',
    START_TIME: 'input[name="START_TIME"]',
    END_TIME: 'input[name="END_TIME"]',
    DATE_FROM: 'input[name="DATE_FROM"]',
    DATE_TO: 'input[name="DATE_TO"]'
};

// Helper Functions for Setting Form Fields
function setClaimDate(inputDate) {
    const dateObj = new Date(inputDate.replace(/-/g, '/'));
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const day = String(dateObj.getDate()).padStart(2, '0');
    const year = dateObj.getFullYear();
    const hours = String(dateObj.getHours()).padStart(2, '0');
    const minutes = String(dateObj.getMinutes()).padStart(2, '0');
    const formattedDate = `${month}/${day}/${year} ${hours}:${minutes}`;

    const inputField = document.querySelector(FIELD_SELECTORS.CLAIM_DATE);
    if (inputField) {
        inputField.value = formattedDate;
        console.log(`Set CLAIM_DATE to: ${formattedDate}`);
    } else {
        console.error('Input field with name "CLAIM_DATE" not found');
    }
}

function setClaimType(claimType) {
    const select = document.querySelector(FIELD_SELECTORS.CLAIM_TYPE);
    if (select) {
        const option = select.querySelector(`option[value="${claimType}"]`);
        if (option) {
            select.value = claimType;
            console.log(`Set CLAIM_TYPE to: ${claimType}`);
        } else {
            console.error(`Option with value "${claimType}" not found`);
        }
    } else {
        console.error('Select element with name "CLAIM_TYPE" not found');
    }
}

function setVehicleType(travelTypeText) {
    const select = document.querySelector(FIELD_SELECTORS.TRAVEL_TYPE);
    if (!select) {
        console.error('Select element with name "TRAVEL_TYPE" not found');
        return;
    }

    const option = Array.from(select.options).find(opt => opt.text === travelTypeText);
    if (option) {
        select.value = option.value;
        select.dispatchEvent(new Event('change', { bubbles: true }));
        console.log(`Set TRAVEL_TYPE to: ${travelTypeText}`);
    } else {
        console.error(`Option with text "${travelTypeText}" not found in TRAVEL_TYPE dropdown`);
    }
}

function setLocationFrom(locationCode) {
    const select = document.querySelector(FIELD_SELECTORS.LOC_FR);
    if (!select) {
        console.error('Select element with name "LOC_FR" or "LOC_ID" not found');
        return;
    }

    let option = Array.from(select.options).find(opt => opt.text === locationCode);
    if (option) {
        select.value = option.value;
        select.dispatchEvent(new Event('change', { bubbles: true }));
        console.log(`Set location from to: ${locationCode}`);
    } else {
        option = Array.from(select.options).find(opt => opt.text === 'OTH');
        if (option) {
            select.value = option.value;
            select.dispatchEvent(new Event('change', { bubbles: true }));
            console.log('Set location from to OTH');
        } else {
            console.error('Option "OTH" not found in location dropdown');
        }

        const input = document.querySelector(FIELD_SELECTORS.LOC_DESC_FR);
        if (input) {
            input.value = locationCode;
            console.log(`Set LOC_DESC_FR/LOC_DESC to: ${locationCode}`);
        } else {
            console.error('Input field with name "LOC_DESC_FR" or "LOC_DESC" not found');
        }
    }
}

function setLocationTo(locationText) {
    const select = document.querySelector(FIELD_SELECTORS.LOC_TO);
    if (!select) {
        console.error('Select element with name "LOC_TO" not found');
        return;
    }

    let option = Array.from(select.options).find(opt => opt.text === locationText);
    if (option) {
        select.value = option.value;
        select.dispatchEvent(new Event('change', { bubbles: true }));
        console.log(`Set location to: ${locationText}`);
    } else {
        option = Array.from(select.options).find(opt => opt.text === 'OTH');
        if (option) {
            select.value = option.value;
            select.dispatchEvent(new Event('change', { bubbles: true }));
            console.log('Set location to OTH');
        } else {
            console.error('Option marked "OTH" not found in LOC_TO dropdown');
        }

        const input = document.querySelector(FIELD_SELECTORS.LOC_DESC_TO);
        if (input) {
            input.value = locationText;
            console.log(`Set LOC_DESC_TO to: ${locationText}`);
        } else {
            console.error('Input field with name "LOC_DESC_TO" not found');
        }
    }
}

function setLocation(locFrom, locTo) {
    setLocationFrom(locFrom);
    setLocationTo(locTo);
}

function setProjId(projectName) {
    const select = document.querySelector(FIELD_SELECTORS.PROJ_ID);
    if (!select) {
        console.error('Select element with name "PROJ_ID" not found');
        return;
    }

    const option = Array.from(select.options).find(opt => opt.text === projectName);
    if (option) {
        select.value = option.value;
        select.dispatchEvent(new Event('change', { bubbles: true }));
        console.log(`Set PROJ_ID to: ${projectName}`);
    } else {
        console.error(`Option with text "${projectName}" not found in PROJ_ID select`);
    }
}

function setJobId(jobType) {
    const select = document.querySelector(FIELD_SELECTORS.JOB_ID);
    if (!select) {
        console.error('Select element with name "JOB_ID" not found');
        return;
    }

    const option = Array.from(select.options).find(opt => opt.text === jobType);
    if (option) {
        select.value = option.value;
        select.dispatchEvent(new Event('change', { bubbles: true }));
        console.log(`Set JOB_ID to: ${jobType}`);
    } else {
        console.error(`Option with text "${jobType}" not found in JOB_ID select`);
    }
}

function setAmt(money) {
    const input = document.querySelector(FIELD_SELECTORS.AMT);
    if (input) {
        input.value = money;
        console.log(`Set AMT to: ${money}`);
    } else {
        console.error('Input field with name "AMT" not found');
    }
}

// Update functions for claim
function updateTravelClaim(dateStr, preset) {
    setClaimDate(dateStr + ' 09:00');
    setClaimType('TRAV');
    setVehicleType(preset.vehicle);
    setLocation(preset.fromLocation, preset.toLocation);
    setProjId(preset.projectName);
    setJobId(preset.job);
    setAmt(preset.fee);
}

function updateMealClaim(dateStr, fee, preset) {
    setClaimDate(dateStr + ' 13:00');
    setClaimType('MEAL');
    setVehicleType('Select Vehicle Type');
    setLocation('Select Location', 'Select Location');
    setProjId(preset.projectName);
    setJobId(preset.purpose);
    setAmt(fee);
}

// Settings Retrieval
async function retrieveSettingsFromChromeStorage() {
    try {
        const data = await chrome.storage.sync.get('azotsSettings');
        console.log('Raw data from chrome.storage.sync:', data);

        if (!data || !data.azotsSettings) {
            console.log('No settings found in chrome.storage.sync, using default values');
            return { ...DEFAULT_SETTINGS };
        }

        const settings = data.azotsSettings;
        console.log('Parsed settings object:', settings);

        if (typeof settings !== 'object' || settings === null) {
            console.warn('Invalid settings object, returning default values');
            return { ...DEFAULT_SETTINGS };
        }

        // Ensure arrays
        settings.presets = Array.isArray(settings.presets) ? settings.presets : [];
        settings.claimTravelPresets = Array.isArray(settings.claimTravelPresets) ? settings.claimTravelPresets : [];
        settings.claimMealPresets = Array.isArray(settings.claimMealPresets) ? settings.claimMealPresets : [];
        return settings;
    } catch (error) {
        console.error('Error retrieving settings from chrome.storage.sync:', error);
        return { ...DEFAULT_SETTINGS };
    }
}

// UI Update Functions
function updatePresetButtons(presets, containerId = 'preset-container') {
    const container = document.querySelector(`#${containerId}`);
    if (!container) {
        console.warn('Preset container not found for update');
        return;
    }
    container.innerHTML = '';

    // Add default "OFC" button
    const defaultPreset = { location: 'OFC', project: 'NA', purpose: 'NA' };
    console.log('Creating default OFC button:', defaultPreset);
    const defaultButton = createPresetButton(defaultPreset, 'OFC');
    container.appendChild(defaultButton);

    // Add user-defined presets
    if (Array.isArray(presets) && presets.length > 0) {
        presets.forEach((preset) => {
            console.log('Creating button for preset:', preset);
            const buttonText = `${preset.project} ${preset.location} ${preset.purpose}`;
            const button = createPresetButton(preset, buttonText);
            container.appendChild(button);
        });
        console.log('Preset buttons updated:', presets);
    } else {
        console.log('No user-defined presets to display');
    }
}

function createPresetButton(preset, buttonText) {
    const button = document.createElement('button');
    button.type = 'button';
    button.innerText = buttonText;
    button.style.marginRight = '5px';
    button.style.marginBottom = '5px';
    button.style.display = 'inline-block';

    button.addEventListener('click', (event) => {
        event.preventDefault();
        setLocationFrom(preset.location);
        setProjId(preset.project);
        setJobId(preset.purpose);
        console.log('Preset applied:', preset);
    });

    return button;
}

function updateTravelPresetButtons(presets, containerId) {
    const container = document.querySelector(`#${containerId}`);
    if (!container) {
        console.warn('Travel preset container not found');
        return;
    }
    container.innerHTML = '';
    presets.forEach((preset) => {
        const button = document.createElement('button');
        button.type = 'button';
        button.innerText = preset.name;
        button.style.marginRight = '5px';
        button.style.marginBottom = '5px';
        button.style.display = 'inline-block';
        button.addEventListener('click', (event) => {
            event.preventDefault();
            const dateInput = document.getElementById('claim-date');
            const date = dateInput.value;
            if (date) {
                updateTravelClaim(date, preset);
                console.log('Travel preset applied:', preset);
            } else {
                alert('Please enter a date.');
            }
        });
        container.appendChild(button);
    });
    console.log('Travel preset buttons updated:', presets);
}

function updateMealPresetButtons(presets, containerId) {
    const container = document.querySelector(`#${containerId}`);
    if (!container) {
        console.warn('Meal preset container not found');
        return;
    }
    container.innerHTML = '';
    presets.forEach((preset) => {
        const button = document.createElement('button');
        button.type = 'button';
        button.innerText = preset.name;
        button.style.marginRight = '5px';
        button.style.marginBottom = '5px';
        button.style.display = 'inline-block';
        button.addEventListener('click', (event) => {
            event.preventDefault();
            const dateInput = document.getElementById('claim-date');
            const feeInput = document.getElementById('meal-fee');
            const date = dateInput.value;
            const fee = feeInput.value;
            if (date && fee) {
                updateMealClaim(date, fee, preset);
                console.log('Meal preset applied:', preset);
            } else {
                alert('Please enter a date and meal fee.');
            }
        });
        container.appendChild(button);
    });
    console.log('Meal preset buttons updated:', presets);
}

// Page-Specific Initialization
function initCreateClaimPage(config) {
    console.log('Detected create_claim_record.jsp, initializing UI');
    const container = createCustomContainer();

    // Date picker
    const dateInput = createLabeledInput('date', 'claim-date', 'Date: ', { marginRight: '10px' });

    // Claim Travel label and container
    const travelLabel = document.createElement('label');
    travelLabel.innerText = 'Claim Travel: ';
    travelLabel.style.marginRight = '10px';
    travelLabel.style.display = 'inline-block';

    const travelContainer = document.createElement('div');
    travelContainer.id = 'travel-preset-container';
    travelContainer.style.display = 'inline-block';

    // Meal fee input
    const mealFeeInput = createLabeledInput('number', 'meal-fee', 'Meal Fee: $', {
        value: '200',
        step: '0.01',
        min: '0',
        marginRight: '10px'
    });

    // Claim Meal container
    const mealContainer = document.createElement('div');
    mealContainer.id = 'meal-preset-container';
    mealContainer.style.display = 'inline-block';

    // Append to container
    container.appendChild(dateInput.label);
    container.appendChild(dateInput.input);
    container.appendChild(document.createElement('br'));
    container.appendChild(travelLabel);
    container.appendChild(travelContainer);
    container.appendChild(document.createElement('br'));
    container.appendChild(mealFeeInput.label);
    container.appendChild(mealFeeInput.input);
    container.appendChild(mealContainer);

    document.body.appendChild(container);
    console.log('Custom UI container added to create_claim_record.jsp');

    // Update preset buttons
    updateTravelPresetButtons(config.claimTravelPresets, 'travel-preset-container');
    updateMealPresetButtons(config.claimMealPresets, 'meal-preset-container');
}

function initLogUserPage(config) {
    console.log('Detected ots002_log_user.jsp, initializing UI');
    console.log('Config.presets on initial load:', config.presets);

    addDateTimePicker(FIELD_SELECTORS.START_TIME, 'START_TIME');
    addDateTimePicker(FIELD_SELECTORS.END_TIME, 'END_TIME');

    const container = document.createElement('div');
    container.id = 'preset-container';
    container.style.padding = '10px';
    container.style.backgroundColor = '#f0f0f0';
    container.style.border = '1px solid #ccc';
    container.style.margin = '10px';
    container.style.display = 'block';

    insertContainerBeforeFormTable(container);
    updatePresetButtons(config.presets);

    // Set table width to 100%
    const formTable = document.querySelector('table[width="550"]');
    if (formTable) {
        formTable.setAttribute('width', '100%');
        formTable.style.width = '100%';
        console.log('Set form table width to 100%');
    }
}

function addDateTimePicker(selector, targetName) {
    const field = document.querySelector(selector);
    if (field) {
        field.insertAdjacentHTML(
            'afterend',
            `<input type="datetime-local" class="txtFieldLarge newTimePicker" style="display:inline;margin-left:10px;" data-target="${targetName}">`
        );
        console.log(`Added datetime picker for ${targetName}`);
    } else {
        console.warn(`${targetName} input field not found`);
    }
}

function insertContainerBeforeFormTable(container) {
    const formTable = document.querySelector('table[width="550"]');
    if (formTable) {
        formTable.parentElement.insertBefore(container, formTable);
        console.log('Container inserted before form table');
    } else {
        document.body.appendChild(container);
        console.log('Container appended to body');
        setTimeout(() => {
            const retryTable = document.querySelector('table[width="550"]');
            if (retryTable && container.parentElement === document.body) {
                container.remove();
                retryTable.parentElement.insertBefore(container, retryTable);
                console.log('Container moved before form table after retry');
            }
        }, 1000);
    }
}

function initPrintClaimPage() {
    console.log('Detected print_claim_record.jsp, initializing date fields');
    addDatePicker(FIELD_SELECTORS.DATE_FROM, 'DATE_FROM');
    addDatePicker(FIELD_SELECTORS.DATE_TO, 'DATE_TO');
}

function addDatePicker(selector, targetName) {
    const field = document.querySelector(selector);
    if (field) {
        field.insertAdjacentHTML(
            'afterend',
            `<input type="date" class="txtFieldLarge newDateField" style="display:inline;margin-left:10px;" data-target="${targetName}">`
        );
        console.log(`Added date picker for ${targetName}`);
    } else {
        console.warn(`${targetName} input field not found`);
    }
}

// Utility Functions for DOM Creation
function createCustomContainer() {
    const container = document.createElement('div');
    container.style.padding = '10px';
    container.style.backgroundColor = '#f0f0f0';
    container.style.border = '1px solid #ccc';
    container.style.margin = '10px';
    container.style.display = 'inline-block';
    return container;
}

function createLabeledInput(type, id, labelText, attrs = {}) {
    const label = document.createElement('label');
    label.innerText = labelText;
    label.htmlFor = id;

    const input = document.createElement('input');
    input.type = type;
    input.id = id;
    Object.assign(input.style, attrs.style || {});
    delete attrs.style;
    Object.assign(input, attrs);

    return { label, input };
}

// Event Listeners for Pickers
function attachPickerListeners(className, formatFn) {
    document.querySelectorAll(`.${className}`).forEach((picker) => {
        picker.addEventListener('change', (e) => {
            const targetFieldName = e.target.dataset.target;
            const targetField = document.querySelector(`input[name="${targetFieldName}"]`);

            if (e.target.value) {
                const date = new Date(e.target.value);
                targetField.value = formatFn(date);
                console.log(`Updated ${targetFieldName} to: ${targetField.value}`);
            } else {
                targetField.value = '';
                console.log(`Cleared ${targetFieldName}`);
            }
        });
    });
}

function formatDateTime(date) {
    return `${(date.getMonth() + 1).toString().padStart(2, '0')}/` +
           `${date.getDate().toString().padStart(2, '0')}/` +
           `${date.getFullYear()} ` +
           `${date.getHours().toString().padStart(2, '0')}:` +
           `${date.getMinutes().toString().padStart(2, '0')}`;
}

function formatDate(date) {
    return `${(date.getMonth() + 1).toString().padStart(2, '0')}/` +
           `${date.getDate().toString().padStart(2, '0')}/` +
           `${date.getFullYear()}`;
}

// Main Initialization
console.log('Custom script running!');

(async function() {
    let config = { ...DEFAULT_SETTINGS };

    try {
        config = await retrieveSettingsFromChromeStorage();
        console.log('Settings loaded:', config);
    } catch (error) {
        console.error('Failed to load settings:', error);
    }

    const path = window.location.pathname;

    if (path.startsWith(PAGE_PATHS.CREATE_CLAIM)) {
        initCreateClaimPage(config);
    } else if (path.startsWith(PAGE_PATHS.LOG_USER)) {
        initLogUserPage(config);
        attachPickerListeners('newTimePicker', formatDateTime);
    } else if (path.startsWith(PAGE_PATHS.PRINT_CLAIM)) {
        initPrintClaimPage();
        attachPickerListeners('newDateField', formatDate);
    }
})();