// content.js for AzOTS Plus Chrome Extension

// Constants
const DEFAULT_SETTINGS = {
    home: 'OFC',
    work: 'OFC',
    job: 'T9',
    projects: [{ name: 'VRMS', checked: true }, { name: 'RTPCS', checked: false }],
    presets: []
};

const PAGE_PATHS = {
    CREATE_CLAIM: '/hkots/create_claim_record.jsp',
    LOG_USER: '/hkots/ots002_log_user.jsp',
    PRINT_CLAIM: '/hkots/print_claim_record.jsp'
};

const CLAIM_TYPES = {
    AM_TRAVEL: 'am-travel',
    PM_TRAVEL: 'pm-travel',
    LUNCH: 'lunch',
    OFFICE_TRAVEL: 'office-travel'
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

// Exposed Window Function
window.updateClaimForm = (dateStr, claimType, money, proj, config) => {
    switch (claimType) {
        case CLAIM_TYPES.AM_TRAVEL:
            setClaimDate(dateStr + ' 07:15');
            setClaimType('TRAV');
            setVehicleType('MTR');
            setLocation(config.home, config.work);
            break;
        case CLAIM_TYPES.PM_TRAVEL:
            setClaimDate(dateStr + ' 18:00');
            setClaimType('TRAV');
            setVehicleType('MTR');
            setLocation(config.work, config.home);
            break;
        case CLAIM_TYPES.LUNCH:
            setClaimDate(dateStr + ' 13:00');
            setClaimType('MEAL');
            setVehicleType('Select Vehicle Type');
            setLocation('Select Location', 'Select Location');
            break;
        case CLAIM_TYPES.OFFICE_TRAVEL:
            setClaimDate(dateStr + ' 15:30');
            setClaimType('TRAV');
            setVehicleType('MTR');
            setLocation('OFC', 'WKGO');
            break;
        default:
            console.error(`Unknown claim type: "${claimType}"`);
            break;
    }
    setProjId(proj);
    setJobId(config.job);
    setAmt(money);
};

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

        // Ensure presets is an array
        settings.presets = Array.isArray(settings.presets) ? settings.presets : [];
        return settings;
    } catch (error) {
        console.error('Error retrieving settings from chrome.storage.sync:', error);
        return { ...DEFAULT_SETTINGS };
    }
}

// UI Update Functions
function updateProjectRadios(projects, containerId = 'project-container') {
    const projectContainer = document.querySelector(`#${containerId}`);
    if (!projectContainer) {
        console.warn('Project container not found for update');
        return;
    }
    projectContainer.innerHTML = '';
    projects.forEach((project) => {
        const radio = document.createElement('input');
        radio.type = 'radio';
        radio.id = `project-${project.name}`;
        radio.name = 'project';
        radio.value = project.name;
        radio.checked = project.checked;

        const label = document.createElement('label');
        label.htmlFor = radio.id;
        label.innerText = project.name;
        label.style.marginRight = '10px';

        projectContainer.appendChild(radio);
        projectContainer.appendChild(label);
    });
    console.log('Updated project radio buttons:', projects);
}

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

// Page-Specific Initialization
function initCreateClaimPage(config) {
    console.log('Detected create_claim_record.jsp, initializing UI');
    const container = createCustomContainer();

    // Date picker
    const dateInput = createLabeledInput('date', 'claim-date', 'Date: ', { marginRight: '10px' });

    // Travel fee input
    const travelInput = createLabeledInput('number', 'travel-fee', 'Travel Fee: $', {
        value: '15.8',
        step: '0.01',
        min: '0',
        marginRight: '10px'
    });

    // Lunch fee input
    const lunchInput = createLabeledInput('number', 'lunch-fee', 'Lunch Fee: $', {
        value: '200',
        step: '0.01',
        min: '0',
        marginRight: '10px'
    });

    // Project radios
    const projectLabel = document.createElement('label');
    projectLabel.innerText = 'Project: ';
    projectLabel.style.marginRight = '10px';
    projectLabel.style.display = 'inline-block';

    const projectContainer = document.createElement('div');
    projectContainer.id = 'project-container';
    projectContainer.style.display = 'inline-block';

    // Buttons
    const amTravelButton = createButton('Claim AM Travel', { marginRight: '5px' });
    const pmTravelButton = createButton('Claim PM Travel', { marginRight: '5px' });
    const officeTravelButton = createButton('Claim Office Travel', { marginRight: '5px' });
    const lunchButton = createButton('Claim Lunch');

    // Append to container
    container.appendChild(dateInput.label);
    container.appendChild(dateInput.input);
    container.appendChild(document.createElement('br'));
    container.appendChild(travelInput.label);
    container.appendChild(travelInput.input);
    container.appendChild(document.createElement('br'));
    container.appendChild(projectLabel);
    container.appendChild(projectContainer);
    container.appendChild(document.createElement('br'));
    container.appendChild(amTravelButton);
    container.appendChild(pmTravelButton);
    container.appendChild(officeTravelButton);
    container.appendChild(document.createElement('br'));
    container.appendChild(lunchInput.label);
    container.appendChild(lunchInput.input);
    container.appendChild(lunchButton);

    document.body.appendChild(container);
    console.log('Custom UI container added to create_claim_record.jsp');

    // Update project radios after appending to DOM
    updateProjectRadios(config.projects);

    // Event listeners
    amTravelButton.addEventListener('click', () => handleClaimClick(CLAIM_TYPES.AM_TRAVEL, dateInput.input, travelInput.input, projectContainer, config));
    pmTravelButton.addEventListener('click', () => handleClaimClick(CLAIM_TYPES.PM_TRAVEL, dateInput.input, travelInput.input, projectContainer, config));
    officeTravelButton.addEventListener('click', () => handleClaimClick(CLAIM_TYPES.OFFICE_TRAVEL, dateInput.input, travelInput.input, projectContainer, config));
    lunchButton.addEventListener('click', () => handleClaimClick(CLAIM_TYPES.LUNCH, dateInput.input, lunchInput.input, projectContainer, config, true));
}

function handleClaimClick(claimType, dateInput, feeInput, projectContainer, config, isLunch = false) {
    const date = dateInput.value;
    const fee = feeInput.value;
    const project = projectContainer.querySelector('input[name="project"]:checked')?.value;
    if (date && fee && project) {
        window.updateClaimForm(date, claimType, fee, project, config);
        console.log(`${claimType} claim submitted:`, { date, fee, project });
    } else {
        alert(`Please enter a date and ${isLunch ? 'lunch' : 'travel'} fee.`);
        console.warn(`${claimType} claim failed: Missing date, fee, or project`);
    }
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

function createButton(text, styles = {}) {
    const button = document.createElement('button');
    button.innerText = text;
    Object.assign(button.style, styles);
    return button;
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