// content.js for AzOTS Plus Chrome Extension
// Enhances HKOTS time sheet and claim forms at http://192.168.1.148:8081/hkots/*
// Injects custom UI elements, auto-fill logic, and shortcuts via vanilla JS/CSS
// Includes debug logs for troubleshooting; test in chrome://extensions/ dev mode

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
    console.log(`[AzOTS Plus Debug] Attempting to set CLAIM_DATE with input: ${inputDate}`);
    const dateObj = new Date(inputDate.replace(/-/g, '/'));
    if (isNaN(dateObj.getTime())) {
        console.error('[AzOTS Plus Debug] Invalid date provided for CLAIM_DATE');
        return;
    }
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const day = String(dateObj.getDate()).padStart(2, '0');
    const year = dateObj.getFullYear();
    const hours = String(dateObj.getHours()).padStart(2, '0');
    const minutes = String(dateObj.getMinutes()).padStart(2, '0');
    const formattedDate = `${month}/${day}/${year} ${hours}:${minutes}`;

    const inputField = document.querySelector(FIELD_SELECTORS.CLAIM_DATE);
    if (inputField) {
        inputField.value = formattedDate;
        inputField.dispatchEvent(new Event('change', { bubbles: true }));
        console.log(`[AzOTS Plus Debug] Set CLAIM_DATE to: ${formattedDate}`);
    } else {
        console.error('[AzOTS Plus Debug] Input field with name "CLAIM_DATE" not found');
    }
}

function setClaimType(claimType) {
    console.log(`[AzOTS Plus Debug] Attempting to set CLAIM_TYPE to: ${claimType}`);
    const select = document.querySelector(FIELD_SELECTORS.CLAIM_TYPE);
    if (select) {
        const option = select.querySelector(`option[value="${claimType}"]`);
        if (option) {
            select.value = claimType;
            select.dispatchEvent(new Event('change', { bubbles: true }));
            console.log(`[AzOTS Plus Debug] Set CLAIM_TYPE to: ${claimType}`);
        } else {
            console.error(`[AzOTS Plus Debug] Option with value "${claimType}" not found`);
        }
    } else {
        console.error('[AzOTS Plus Debug] Select element with name "CLAIM_TYPE" not found');
    }
}

function setVehicleType(travelTypeText) {
    console.log(`[AzOTS Plus Debug] Attempting to set TRAVEL_TYPE to text: ${travelTypeText}`);
    const select = document.querySelector(FIELD_SELECTORS.TRAVEL_TYPE);
    if (!select) {
        console.error('[AzOTS Plus Debug] Select element with name "TRAVEL_TYPE" not found');
        return;
    }

    const option = Array.from(select.options).find(opt => opt.text.trim() === travelTypeText.trim());
    if (option) {
        select.value = option.value;
        select.dispatchEvent(new Event('change', { bubbles: true }));
        console.log(`[AzOTS Plus Debug] Set TRAVEL_TYPE to: ${travelTypeText}`);
    } else {
        console.error(`[AzOTS Plus Debug] Option with text "${travelTypeText}" not found in TRAVEL_TYPE dropdown`);
    }
}

function setLocationFrom(locationCode) {
    console.log(`[AzOTS Plus Debug] Attempting to set location from: ${locationCode}`);
    const select = document.querySelector(FIELD_SELECTORS.LOC_FR);
    if (!select) {
        console.error('[AzOTS Plus Debug] Select element with name "LOC_FR" or "LOC_ID" not found');
        return;
    }

    let option = Array.from(select.options).find(opt => opt.text.trim() === locationCode.trim());
    if (option) {
        select.value = option.value;
        select.dispatchEvent(new Event('change', { bubbles: true }));
        console.log(`[AzOTS Plus Debug] Set location from to: ${locationCode}`);
    } else {
        option = Array.from(select.options).find(opt => opt.text.trim() === 'OTH');
        if (option) {
            select.value = option.value;
            select.dispatchEvent(new Event('change', { bubbles: true }));
            console.log('[AzOTS Plus Debug] Set location from to OTH');
        } else {
            console.error('[AzOTS Plus Debug] Option "OTH" not found in location dropdown');
        }

        const input = document.querySelector(FIELD_SELECTORS.LOC_DESC_FR);
        if (input) {
            input.value = locationCode;
            input.dispatchEvent(new Event('change', { bubbles: true }));
            console.log(`[AzOTS Plus Debug] Set LOC_DESC_FR/LOC_DESC to: ${locationCode}`);
        } else {
            console.error('[AzOTS Plus Debug] Input field with name "LOC_DESC_FR" or "LOC_DESC" not found');
        }
    }
}

function setLocationTo(locationText) {
    console.log(`[AzOTS Plus Debug] Attempting to set location to: ${locationText}`);
    const select = document.querySelector(FIELD_SELECTORS.LOC_TO);
    if (!select) {
        console.error('[AzOTS Plus Debug] Select element with name "LOC_TO" not found');
        return;
    }

    let option = Array.from(select.options).find(opt => opt.text.trim() === locationText.trim());
    if (option) {
        select.value = option.value;
        select.dispatchEvent(new Event('change', { bubbles: true }));
        console.log(`[AzOTS Plus Debug] Set location to: ${locationText}`);
    } else {
        option = Array.from(select.options).find(opt => opt.text.trim() === 'OTH');
        if (option) {
            select.value = option.value;
            select.dispatchEvent(new Event('change', { bubbles: true }));
            console.log('[AzOTS Plus Debug] Set location to OTH');
        } else {
            console.error('[AzOTS Plus Debug] Option "OTH" not found in LOC_TO dropdown');
        }

        const input = document.querySelector(FIELD_SELECTORS.LOC_DESC_TO);
        if (input) {
            input.value = locationText;
            input.dispatchEvent(new Event('change', { bubbles: true }));
            console.log(`[AzOTS Plus Debug] Set LOC_DESC_TO to: ${locationText}`);
        } else {
            console.error('[AzOTS Plus Debug] Input field with name "LOC_DESC_TO" not found');
        }
    }
}

function setLocation(locFrom, locTo) {
    setLocationFrom(locFrom);
    setLocationTo(locTo);
}

function setProjId(projectName) {
    console.log(`[AzOTS Plus Debug] Attempting to set PROJ_ID to: ${projectName}`);
    const select = document.querySelector(FIELD_SELECTORS.PROJ_ID);
    if (!select) {
        console.error('[AzOTS Plus Debug] Select element with name "PROJ_ID" not found');
        return;
    }

    const option = Array.from(select.options).find(opt => opt.text.trim() === projectName.trim());
    if (option) {
        select.value = option.value;
        select.dispatchEvent(new Event('change', { bubbles: true }));
        console.log(`[AzOTS Plus Debug] Set PROJ_ID to: ${projectName}`);
    } else {
        console.error(`[AzOTS Plus Debug] Option with text "${projectName}" not found in PROJ_ID select`);
    }
}

function setJobId(jobType) {
    console.log(`[AzOTS Plus Debug] Attempting to set JOB_ID to: ${jobType}`);
    const select = document.querySelector(FIELD_SELECTORS.JOB_ID);
    if (!select) {
        console.error('[AzOTS Plus Debug] Select element with name "JOB_ID" not found');
        return;
    }

    const option = Array.from(select.options).find(opt => opt.text.trim() === jobType.trim());
    if (option) {
        select.value = option.value;
        select.dispatchEvent(new Event('change', { bubbles: true }));
        console.log(`[AzOTS Plus Debug] Set JOB_ID to: ${jobType}`);
    } else {
        console.error(`[AzOTS Plus Debug] Option with text "${jobType}" not found in JOB_ID select`);
    }
}

function setAmt(money) {
    console.log(`[AzOTS Plus Debug] Attempting to set AMT to: ${money}`);
    const input = document.querySelector(FIELD_SELECTORS.AMT);
    if (input) {
        input.value = money;
        input.dispatchEvent(new Event('change', { bubbles: true }));
        console.log(`[AzOTS Plus Debug] Set AMT to: ${money}`);
    } else {
        console.error('[AzOTS Plus Debug] Input field with name "AMT" not found');
    }
}

// Update functions for claims
function updateTravelClaim(dateStr, preset) {
    console.log(`[AzOTS Plus Debug] Updating travel claim for date: ${dateStr}, preset:`, preset);
    setClaimDate(dateStr + ' 09:00');
    setClaimType('TRAV');
    setVehicleType(preset.vehicle || 'Taxi'); // Fallback to common default; adjust based on presets
    setLocation(preset.fromLocation || 'OFC', preset.toLocation || 'OFC');
    setProjId(preset.projectName || 'NA');
    setJobId(preset.job || 'NA');
}

function updateMealClaim(dateStr, fee, preset) {
    console.log(`[AzOTS Plus Debug] Updating meal claim for date: ${dateStr}, fee: ${fee}, preset:`, preset);
    setClaimDate(dateStr + ' 13:00');
    setClaimType('MEAL');
    setVehicleType('N/A'); // Placeholder; adjust to actual non-vehicle option text if needed
    setLocation('OFC', 'OFC'); // Default for meal claims
    setProjId(preset.projectName || 'NA');
    setJobId(preset.purpose || 'Lunch');
    setAmt(fee);
}

// Settings Retrieval
async function retrieveSettingsFromChromeStorage() {
    console.log('[AzOTS Plus Debug] Retrieving settings from chrome.storage.sync');
    try {
        const data = await chrome.storage.sync.get('azotsSettings');
        console.log('[AzOTS Plus Debug] Raw data from chrome.storage.sync:', data);

        if (!data || !data.azotsSettings) {
            console.log('[AzOTS Plus Debug] No settings found in chrome.storage.sync, using default values');
            return { ...DEFAULT_SETTINGS };
        }

        const settings = data.azotsSettings;
        console.log('[AzOTS Plus Debug] Parsed settings object:', settings);

        if (typeof settings !== 'object' || settings === null) {
            console.warn('[AzOTS Plus Debug] Invalid settings object, returning default values');
            return { ...DEFAULT_SETTINGS };
        }

        // Ensure arrays are initialized
        settings.presets = Array.isArray(settings.presets) ? settings.presets : [];
        settings.claimTravelPresets = Array.isArray(settings.claimTravelPresets) ? settings.claimTravelPresets : [];
        settings.claimMealPresets = Array.isArray(settings.claimMealPresets) ? settings.claimMealPresets : [];
        console.log('[AzOTS Plus Debug] Validated settings:', settings);
        return settings;
    } catch (error) {
        console.error('[AzOTS Plus Debug] Error retrieving settings from chrome.storage.sync:', error);
        return { ...DEFAULT_SETTINGS };
    }
}

// UI Update Functions
function updatePresetButtons(presets, containerId = 'preset-container') {
    console.log(`[AzOTS Plus Debug] Updating preset buttons for container: ${containerId}, presets:`, presets);
    const container = document.querySelector(`#${containerId}`);
    if (!container) {
        console.warn(`[AzOTS Plus Debug] Preset container #${containerId} not found for update`);
        return;
    }
    container.innerHTML = '';

    // Add default "OFC" button
    const defaultPreset = { location: 'OFC', project: 'NA', purpose: 'NA' };
    console.log('[AzOTS Plus Debug] Creating default OFC button:', defaultPreset);
    const defaultButton = createPresetButton(defaultPreset, 'OFC');
    container.appendChild(defaultButton);

    // Add user-defined presets
    if (Array.isArray(presets) && presets.length > 0) {
        presets.forEach((preset, index) => {
            console.log(`[AzOTS Plus Debug] Creating button for preset ${index + 1}:`, preset);
            const buttonText = `${preset.project || 'NA'} ${preset.location || 'N/A'} ${preset.purpose || 'N/A'}`;
            const button = createPresetButton(preset, buttonText);
            container.appendChild(button);
        });
        console.log(`[AzOTS Plus Debug] Preset buttons updated successfully with ${presets.length} items`);
    } else {
        console.log('[AzOTS Plus Debug] No user-defined presets to display');
    }
}

function createPresetButton(preset, buttonText) {
    const button = document.createElement('button');
    button.type = 'button';
    button.innerText = buttonText;
    button.className = 'azots-plus-button';
    button.title = `Apply preset: ${JSON.stringify(preset)}`; // Tooltip for debug
    button.addEventListener('click', (event) => {
        event.preventDefault();
        event.stopPropagation();
        setLocationFrom(preset.location || 'OFC');
        setProjId(preset.project || 'NA');
        setJobId(preset.purpose || 'NA');
        console.log('[AzOTS Plus Debug] Preset applied via button click:', preset);
    });
    return button;
}

function updateTravelPresetButtons(presets, containerId) {
    console.log(`[AzOTS Plus Debug] Updating travel preset buttons for container: ${containerId}, presets:`, presets);
    const container = document.querySelector(`#${containerId}`);
    if (!container) {
        console.warn(`[AzOTS Plus Debug] Travel preset container #${containerId} not found`);
        return;
    }
    container.innerHTML = '';
    if (!Array.isArray(presets) || presets.length === 0) {
        console.log('[AzOTS Plus Debug] No travel presets available');
        return;
    }
    presets.forEach((preset, index) => {
        console.log(`[AzOTS Plus Debug] Creating travel button for preset ${index + 1}:`, preset);
        const button = document.createElement('button');
        button.type = 'button';
        button.innerText = preset.name || `Travel ${index + 1}`;
        button.className = 'azots-plus-button';
        button.title = `Apply travel: ${JSON.stringify(preset)}`;
        button.addEventListener('click', (event) => {
            event.preventDefault();
            event.stopPropagation();
            const dateInput = document.getElementById('claim-date');
            if (!dateInput || !dateInput.value) {
                alert('Please select a date first.');
                console.warn('[AzOTS Plus Debug] Date not selected for travel preset');
                return;
            }
            updateTravelClaim(dateInput.value, preset);
            console.log('[AzOTS Plus Debug] Travel preset applied:', preset);
        });
        container.appendChild(button);
    });
    console.log(`[AzOTS Plus Debug] Travel preset buttons updated with ${presets.length} items`);
}

function updateMealPresetButtons(presets, containerId) {
    console.log(`[AzOTS Plus Debug] Updating meal preset buttons for container: ${containerId}, presets:`, presets);
    const container = document.querySelector(`#${containerId}`);
    if (!container) {
        console.warn(`[AzOTS Plus Debug] Meal preset container #${containerId} not found`);
        return;
    }
    container.innerHTML = '';
    if (!Array.isArray(presets) || presets.length === 0) {
        console.log('[AzOTS Plus Debug] No meal presets available');
        return;
    }
    presets.forEach((preset, index) => {
        console.log(`[AzOTS Plus Debug] Creating meal button for preset ${index + 1}:`, preset);
        const button = document.createElement('button');
        button.type = 'button';
        button.innerText = preset.name || `Meal ${index + 1}`;
        button.className = 'azots-plus-button';
        button.title = `Apply meal: ${JSON.stringify(preset)}`;
        button.addEventListener('click', (event) => {
            event.preventDefault();
            event.stopPropagation();
            const dateInput = document.getElementById('claim-date');
            const feeInput = document.getElementById('meal-fee');
            if (!dateInput?.value || !feeInput?.value) {
                alert('Please select a date and enter a meal fee.');
                console.warn('[AzOTS Plus Debug] Date or fee missing for meal preset');
                return;
            }
            updateMealClaim(dateInput.value, feeInput.value, preset);
            console.log('[AzOTS Plus Debug] Meal preset applied:', preset);
        });
        container.appendChild(button);
    });
    console.log(`[AzOTS Plus Debug] Meal preset buttons updated with ${presets.length} items`);
}

// Page-Specific Initialization
function initCreateClaimPage(config) {
    console.log('[AzOTS Plus Debug] Detected create_claim_record.jsp, initializing UI');
    const container = createCustomContainer();

    // Date picker
    const dateInput = createLabeledInput('date', 'claim-date', 'Date: ', { marginRight: '8px' });

    // Claim Travel label and container
    const travelLabel = document.createElement('label');
    travelLabel.innerText = 'Claim Travel: ';
    travelLabel.className = 'azots-plus-label';
    const travelContainer = document.createElement('div');
    travelContainer.id = 'travel-preset-container';
    travelContainer.className = 'azots-plus-button-container';

    // Meal fee input (default from settings if available, else 200)
    const defaultFee = config.defaultMealFee || '200';
    const mealFeeInput = createLabeledInput('number', 'meal-fee', 'Meal Fee: $', {
        value: defaultFee,
        step: '0.01',
        min: '0',
        marginRight: '8px'
    });

    // Claim Meal container
    const mealLabel = document.createElement('label');
    mealLabel.innerText = 'Claim Meal: ';
    mealLabel.className = 'azots-plus-label';
    const mealContainer = document.createElement('div');
    mealContainer.id = 'meal-preset-container';
    mealContainer.className = 'azots-plus-button-container';

    // Append elements with better structure
    container.appendChild(dateInput.label);
    container.appendChild(dateInput.input);
    container.appendChild(document.createElement('br'));
    container.appendChild(travelLabel);
    container.appendChild(travelContainer);
    container.appendChild(document.createElement('br'));
    container.appendChild(mealLabel);
    container.appendChild(mealFeeInput.label);
    container.appendChild(mealFeeInput.input);
    container.appendChild(mealContainer);

    // Inject styles (consolidated for create claim)
    injectCreateClaimStyles();

    // Position container near form (e.g., before first table or at top)
    const formArea = document.querySelector('form') || document.body;
    formArea.insertBefore(container, formArea.lastChild);
    console.log('[AzOTS Plus Debug] Custom UI container added to create_claim_record.jsp');

    // Update preset buttons after DOM insertion
    updateTravelPresetButtons(config.claimTravelPresets || [], 'travel-preset-container');
    updateMealPresetButtons(config.claimMealPresets || [], 'meal-preset-container');
}

function injectCreateClaimStyles() {
    if (document.querySelector('#azots-create-claim-styles')) {
        console.log('[AzOTS Plus Debug] Create claim styles already injected');
        return;
    }
    const style = document.createElement('style');
    style.id = 'azots-create-claim-styles';
    style.textContent = `
        .azots-plus-container {
            font-family: 'Segoe UI', -apple-system, BlinkMacSystemFont, 'Roboto', sans-serif;
            background: #fff;
            padding: 12px;
            margin: 6px;
            border-radius: 6px;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
            max-width: 450px;
            box-sizing: border-box;
        }
        .azots-plus-label {
            font-size: 0.85em;
            line-height: 24px;
            color: #34495e;
            margin-bottom: 4px;
            font-weight: 500;
            display: inline-block;
            margin-right: 8px;
        }
        .azots-plus-container input[type="date"],
        .azots-plus-container input[type="number"] {
            width: 100%;
            max-width: 140px;
            padding: 6px;
            margin-bottom: 8px;
            border: 1px solid #ecf0f1;
            border-radius: 4px;
            font-size: 0.85em;
            box-sizing: border-box;
            transition: border-color 0.3s ease;
        }
        .azots-plus-container input[type="date"]:focus,
        .azots-plus-container input[type="number"]:focus {
            border-color: #425ad5ff;
            outline: none;
            box-shadow: 0 0 3px rgba(52, 152, 219, 0.5);
        }
        .azots-plus-button {
            cursor: pointer;
            background-color: #425ad5ff;
            color: white;
            border: none;
            border-radius: 4px;
            font-size: 0.85em;
            height: 24px;
            line-height: 24px;
            margin-right: 4px;
            margin-bottom: 4px;
            display: inline-block;
            transition: background-color 0.3s ease, transform 0.2s ease;
        }
        .azots-plus-button:hover {
            background-color: #2980b9;
            transform: scale(1.03);
        }
        .azots-plus-button-container {
            display: inline-block;
        }
    `;
    document.head.appendChild(style);
    console.log('[AzOTS Plus Debug] Create claim styles injected');
}

function initLogUserPage(config) {
    console.log('[AzOTS Plus Debug] Detected ots002_log_user.jsp, initializing UI');
    console.log('[AzOTS Plus Debug] Config.presets on initial load:', config.presets);

    // Add integrated datetime pickers for START_TIME and END_TIME (keeps original visible, adds 📅 button)
    addIntegratedPicker(FIELD_SELECTORS.START_TIME, 'START_TIME');
    addIntegratedPicker(FIELD_SELECTORS.END_TIME, 'END_TIME');

    const container = createCustomContainer();
    container.id = 'preset-container';

    insertContainerBeforeFormTable(container);
    updatePresetButtons(config.presets || [], 'preset-container');

    // Set table width to 100% for better layout
    const formTable = document.querySelector('table[width="550"]');
    if (formTable) {
        formTable.setAttribute('width', '100%');
        formTable.style.width = '100%';
        console.log('[AzOTS Plus Debug] Set form table width to 100%');
    }

    // Inject styles (consolidated for log user, including integrated picker)
    injectLogUserStyles();

    console.log('[AzOTS Plus Debug] Log user page initialization complete');
}

function injectLogUserStyles() {
    if (document.querySelector('#azots-log-user-styles')) {
        console.log('[AzOTS Plus Debug] Log user styles already injected');
        return;
    }
    const style = document.createElement('style');
    style.id = 'azots-log-user-styles';
    style.textContent = `
        .azots-plus-container {
            font-family: 'Segoe UI', -apple-system, BlinkMacSystemFont, 'Roboto', sans-serif;
            background: #fff;
            padding: 12px;
            margin: 6px;
            border-radius: 6px;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
            max-width: 750px;
            box-sizing: border-box;
        }
        .azots-plus-button {
            cursor: pointer;
            background-color: #425ad5ff;
            color: white;
            border: none;
            border-radius: 4px;
            font-size: 0.85em;
            height: 24px;
            line-height: 24px;
            margin-right: 4px;
            margin-bottom: 4px;
            display: inline-block;
            transition: background-color 0.3s ease, transform 0.2s ease;
        }
        .azots-plus-button:hover {
            background-color: #2980b9;
            transform: scale(1.03);
        }
        /* Integrated Picker Styles */
        .azots-integrated-picker {
            position: relative;
            display: inline-block;
            margin-left: 8px;
        }
        .azots-picker-button {
            background: #eeeeee;
            color: #333;
            border: 1px solid #dddddd;
            border-radius: 4px;
            cursor: pointer;
            font-size: 12px; /* Smaller for tiny emoji */
            filter: grayscale(100%); /* Desaturate emoji to grey */
            transition: background 0.3s, box-shadow 0.3s;
            width: 24px;
            display: flex;
            align-items: center;
            justify-content: center;
            vertical-align: middle; /* Align with input */
        }
        .azots-picker-button:hover {
            background: #e0e0e0;
        }
        .azots-picker-button:focus {
            outline: none;
            box-shadow: 0 0 2px rgba(0,0,0,0.1);
        }
        .azots-picker-popup {
            position: absolute;
            top: 100%;
            left: 0;
            background: #fff;
            border: 1px solid #ecf0f1;
            border-radius: 4px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            padding: 16px;
            z-index: 1000;
            min-width: 280px;
            display: none;
            flex-direction: column;
            gap: 12px;
        }
        .azots-picker-popup.show {
            display: flex;
        }
        .azots-picker-row {
            display: flex;
            gap: 10px;
            align-items: end;
        }
        .azots-picker-row input, .azots-picker-row select {
            padding: 8px;
            border: 1px solid #ecf0f1;
            border-radius: 4px;
            font-size: 14px;
            box-sizing: border-box;
            flex: 1;
            transition: border-color 0.3s ease;
        }
        .azots-picker-row input:focus, .azots-picker-row select:focus {
            border-color: #425ad5;
            outline: none;
            box-shadow: 0 0 3px rgba(52, 152, 219, 0.5);
        }
    `;
    document.head.appendChild(style);
    console.log('[AzOTS Plus Debug] Log user styles injected (including integrated picker with #eeeeee theme, tiny grey button, and grayscale filter)');
}

// Integrated Picker Functions (for START_TIME and END_TIME)
function addIntegratedPicker(selector, targetName) {
    console.log(`[AzOTS Plus Debug] Adding auto-sync integrated picker (static grey 📅) for ${targetName}`);
    const field = document.querySelector(selector);
    if (!field) {
        console.warn(`[AzOTS Plus Debug] ${targetName} input field not found`);
        return;
    }

    // Do not hide or replace original field - keep it visible for manual entry
    // Button is tiny and square via CSS - no dynamic sizing

    // Create container for button (insert after field for inline positioning)
    const container = document.createElement('div');
    container.className = 'azots-integrated-picker';

    // Main button with static emoji label (tiny square via CSS)
    const pickerButton = document.createElement('button');
    pickerButton.type = 'button';
    pickerButton.className = 'azots-picker-button';
    pickerButton.innerText = '📅';
    pickerButton.title = 'Click to open date and time picker';
    container.appendChild(pickerButton);

    // Popup overlay
    const popup = document.createElement('div');
    popup.className = 'azots-picker-popup';

    // Date and time row
    const pickerRow = document.createElement('div');
    pickerRow.className = 'azots-picker-row';

    // Date input
    const dateInput = document.createElement('input');
    dateInput.type = 'date';
    dateInput.className = 'azots-date-part';
    dateInput.title = 'Select date (YYYY-MM-DD)';
    pickerRow.appendChild(dateInput);

    // Time dropdown
    const timeSelect = document.createElement('select');
    timeSelect.className = 'azots-time-part';
    timeSelect.title = 'Select time (09:00 to 19:00, 30-min steps)';

    // Default option
    const defaultOption = document.createElement('option');
    defaultOption.value = '';
    defaultOption.text = 'Select Time';
    defaultOption.disabled = true;
    defaultOption.selected = true;
    timeSelect.appendChild(defaultOption);

    // Time options: 09:00 to 19:00, 30-min increments
    const timeOptions = [
        '09:00', '09:30', '10:00', '10:30', '11:00', '11:30', 
        '12:00', '12:30', '13:00', '13:30', '14:00', '14:30', 
        '15:00', '15:30', '16:00', '16:30', '17:00', '17:30', 
        '18:00', '18:30', '19:00'
    ];
    timeOptions.forEach(time => {
        const option = document.createElement('option');
        option.value = time;
        option.text = time;
        timeSelect.appendChild(option);
    });
    pickerRow.appendChild(timeSelect);

    popup.appendChild(pickerRow);
    container.appendChild(popup);

    // Insert container after original field
    field.parentNode.insertBefore(container, field.nextSibling);

    // Event listeners for toggle
    pickerButton.addEventListener('click', (e) => {
        e.stopPropagation();
        togglePopup(popup);
    });

    // Auto-sync on change (updates original field)
    const autoSync = () => {
        syncToOriginal(dateInput, timeSelect, field, targetName);
    };
    dateInput.addEventListener('change', autoSync);
    timeSelect.addEventListener('change', autoSync);

    // Close on outside click
    document.addEventListener('click', (e) => {
        if (!container.contains(e.target)) {
            popup.classList.remove('show');
        }
    });

    // Initial parse from original field value if populated
    if (field.value) {
        const parts = field.value.split(' ');
        if (parts[0]) {
            const dateParts = parts[0].split('/'); // MM/DD/YYYY -> YYYY-MM-DD
            if (dateParts.length === 3) {
                dateInput.value = `${dateParts[2]}-${dateParts[0].padStart(2, '0')}-${dateParts[1].padStart(2, '0')}`;
            }
        }
        if (parts[1]) {
            const validTime = timeOptions.find(t => t === parts[1]);
            if (validTime) {
                timeSelect.value = validTime;
            } else {
                console.warn(`[AzOTS Plus Debug] Invalid time '${parts[1]}' in ${targetName}; using default`);
            }
        }
        console.log(`[AzOTS Plus Debug] Parsed initial value for ${targetName}: ${field.value}`);
    }

    console.log(`[AzOTS Plus Debug] Static grey 📅 integrated picker added for ${targetName} (original field preserved)`);
}

function togglePopup(popup) {
    const isVisible = popup.classList.contains('show');
    popup.classList.toggle('show', !isVisible);
    if (!isVisible) {
        const dateInput = popup.querySelector('input[type="date"]');
        const timeSelect = popup.querySelector('select.azots-time-part');
        dateInput.focus(); // Accessibility: Focus on date input when opening
        
        // Set date to today when popup opens
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        dateInput.value = `${year}-${month}-${day}`;
        
        // Set default time to the closest available option
        const currentHour = today.getHours();
        const currentMinute = today.getMinutes();
        let defaultTime = '09:00'; // Default to 9:00 AM
        
        // If current time is within working hours (9:00-19:00), use the closest 30-minute interval
        if (currentHour >= 9 && currentHour < 19) {
            const roundedMinutes = Math.round(currentMinute / 30) * 30;
            const adjustedHour = currentHour + (roundedMinutes >= 60 ? 1 : 0);
            const adjustedMinutes = roundedMinutes % 60;
            
            if (adjustedHour < 19) {
                defaultTime = `${String(adjustedHour).padStart(2, '0')}:${String(adjustedMinutes).padStart(2, '0')}`;
            }
        }
        
        timeSelect.value = defaultTime;
    }
    console.log(`[AzOTS Plus Debug] Popup toggled: ${!isVisible ? 'opened' : 'closed'}`);
}

function syncToOriginal(dateInput, timeSelect, originalField, targetName) {
    const dateVal = dateInput.value;
    const timeVal = timeSelect.value;
    console.log(`[AzOTS Plus Debug] Auto-sync attempt for ${targetName} - Date: ${dateVal}, Time: ${timeVal}`);

    if (dateVal && timeVal) {
        const dateObj = new Date(dateVal);
        if (isNaN(dateObj.getTime())) {
            console.warn(`[AzOTS Plus Debug] Invalid date object from input for ${targetName}`);
            return;
        }
        const month = String(dateObj.getMonth() + 1).padStart(2, '0');
        const day = String(dateObj.getDate()).padStart(2, '0');
        const year = dateObj.getFullYear();
        const formatted = `${month}/${day}/${year} ${timeVal}`;
        
        originalField.value = formatted;
        originalField.dispatchEvent(new Event('change', { bubbles: true }));
        console.log(`[AzOTS Plus Debug] Auto-synced to ${targetName}: ${formatted}`);
    } else {
        originalField.value = '';
        originalField.dispatchEvent(new Event('change', { bubbles: true }));
        console.log(`[AzOTS Plus Debug] Auto-cleared ${targetName} (partial selection)`);
    }
}

function initPrintClaimPage() {
    console.log('[AzOTS Plus Debug] Detected print_claim_record.jsp, initializing date fields');
    addDatePicker(FIELD_SELECTORS.DATE_FROM, 'DATE_FROM');
    addDatePicker(FIELD_SELECTORS.DATE_TO, 'DATE_TO');

    // Attach listeners
    attachPickerListeners('newDateField', formatDate);
}

function addDatePicker(selector, targetName) {
    console.log(`[AzOTS Plus Debug] Adding date picker for ${targetName}`);
    const field = document.querySelector(selector);
    if (field) {
        // Hide original
        field.style.display = 'none';

        const dateInput = document.createElement('input');
        dateInput.type = 'date';
        dateInput.className = 'newDateField';
        dateInput.dataset.target = targetName;
        if (field.value) {
            // Convert MM/DD/YYYY to YYYY-MM-DD
            const parts = field.value.split('/');
            if (parts.length === 3) {
                dateInput.value = `${parts[2]}-${parts[0].padStart(2, '0')}-${parts[1].padStart(2, '0')}`;
            }
        }
        field.parentNode.insertBefore(dateInput, field.nextSibling);

        // Initial sync
        dateInput.addEventListener('change', () => {
            if (dateInput.value) {
                const dateObj = new Date(dateInput.value);
                field.value = formatDate(dateObj);
                field.dispatchEvent(new Event('change', { bubbles: true }));
                console.log(`[AzOTS Plus Debug] Updated ${targetName} to: ${field.value}`);
            }
        });
        console.log(`[AzOTS Plus Debug] Date picker added for ${targetName}`);
    } else {
        console.warn(`[AzOTS Plus Debug] ${targetName} input field not found`);
    }
}

function insertContainerBeforeFormTable(container) {
    const formTable = document.querySelector('table[width="550"]');
    if (formTable) {
        formTable.parentElement.insertBefore(container, formTable);
        console.log('[AzOTS Plus Debug] Container inserted before form table');
    } else {
        document.body.insertBefore(container, document.body.firstChild);
        console.log('[AzOTS Plus Debug] Container appended to body top');
        // Retry after delay for dynamic content
        setTimeout(() => {
            const retryTable = document.querySelector('table[width="550"]');
            if (retryTable && container.parentElement === document.body) {
                container.remove();
                retryTable.parentElement.insertBefore(container, retryTable);
                console.log('[AzOTS Plus Debug] Container moved before form table after retry');
            }
        }, 1000);
    }
}

// Event Listeners for Pickers (updated for split in log user)
function attachPickerListeners(className, formatFn) {
    console.log(`[AzOTS Plus Debug] Attaching listeners for class: ${className}`);
    document.querySelectorAll(`.${className}`).forEach((picker, index) => {
        if (picker.classList.contains('azots-date-part') || picker.classList.contains('azots-time-part')) {
            // Handled in addSplitDateTimePicker
            return;
        }
        picker.addEventListener('change', (e) => {
            let value = e.target.value;
            console.log(`[AzOTS Plus Debug] Picker change for ${className} #${index + 1}: ${value}`);
            if (value) {
                let date = new Date(value);
                if (isNaN(date.getTime())) {
                    console.warn('[AzOTS Plus Debug] Invalid date from picker');
                    return;
                }
                
                const targetFieldName = e.target.dataset.target;
                const targetField = document.querySelector(`input[name="${targetFieldName}"]`);
                if (targetField) {
                    targetField.value = formatFn(date);
                    targetField.dispatchEvent(new Event('change', { bubbles: true }));
                    console.log(`[AzOTS Plus Debug] Updated ${targetFieldName} to: ${targetField.value}`);
                } else {
                    console.error(`[AzOTS Plus Debug] Target field ${targetFieldName} not found`);
                }
            } else {
                const targetFieldName = e.target.dataset.target;
                const targetField = document.querySelector(`input[name="${targetFieldName}"]`);
                if (targetField) {
                    targetField.value = '';
                    targetField.dispatchEvent(new Event('change', { bubbles: true }));
                    console.log(`[AzOTS Plus Debug] Cleared ${targetFieldName}`);
                }
            }
        });
    });
    console.log(`[AzOTS Plus Debug] Listeners attached for ${document.querySelectorAll(`.${className}`).length} pickers`);
}

// Updated snap function for compatibility (not used directly now with split)
function snapAndUpdateDateTime(date) {
    const stepMinutes = 30; // Or 5 for finer
    let minutes = date.getMinutes();
    minutes = Math.round(minutes / (stepMinutes * 60)) * (stepMinutes * 60) / 60; // Snap minutes
    date.setMinutes(minutes);
    return formatDateTime(date);
}

// Utility Functions for DOM Creation
function createCustomContainer() {
    const container = document.createElement('div');
    container.id = 'azots-plus-container';
    container.className = 'azots-plus-container';
    return container;
}

function createLabeledInput(type, id, labelText, attrs = {}) {
    const label = document.createElement('label');
    label.innerText = labelText;
    label.htmlFor = id;
    label.className = 'azots-plus-label';

    const input = document.createElement('input');
    input.type = type;
    input.id = id;
    if (attrs.style) {
        Object.assign(input.style, attrs.style);
        delete attrs.style;
    }
    Object.assign(input, attrs);

    return { label, input };
}

// Formatting Functions
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
console.log('[AzOTS Plus Debug] Content script loaded on HKOTS page:', window.location.href);

(async function() {
    let config = { ...DEFAULT_SETTINGS };

    try {
        config = await retrieveSettingsFromChromeStorage();
        console.log('[AzOTS Plus Debug] Settings loaded successfully:', config);
    } catch (error) {
        console.error('[AzOTS Plus Debug] Failed to load settings:', error);
    }

    const path = window.location.pathname;
    console.log(`[AzOTS Plus Debug] Current path: ${path}`);

    if (path.includes(PAGE_PATHS.CREATE_CLAIM)) {
        initCreateClaimPage(config);
    } else if (path.includes(PAGE_PATHS.LOG_USER)) {
        initLogUserPage(config);
    } else if (path.includes(PAGE_PATHS.PRINT_CLAIM)) {
        initPrintClaimPage();
    } else {
        console.log('[AzOTS Plus Debug] No matching page for enhancements');
    }
})();