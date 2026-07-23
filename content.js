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
    PRINT_CLAIM: '/hkots/print_claim_record.jsp',
    VIEW_USER: '/hkots/ots002b_view_user.jsp'
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

const STORAGE_KEY_LAST_CLAIM_DATE = 'azotsLastClaimDate';

// DOM Helpers (migrated from stylesheet IIFE)

function addClass(element, className) {
  if (!element) return;
  if (element.classList) {
    element.classList.add(className);
  } else if ((" " + element.className + " ").indexOf(" " + className + " ") === -1) {
    element.className = (element.className ? element.className + " " : "") + className;
  }
}

function hasClass(element, className) {
  if (!element) return false;
  return (" " + element.className + " ").indexOf(" " + className + " ") !== -1;
}

function closestTable(element) {
  while (element && element.nodeType === 1) {
    if (element.tagName.toLowerCase() === "table") return element;
    element = element.parentNode;
  }
  return null;
}

function closestRow(element) {
  while (element && element.nodeType === 1) {
    if (element.tagName.toLowerCase() === "tr") return element;
    element = element.parentNode;
  }
  return null;
}

function removeNode(element) {
  if (element && element.parentNode) element.parentNode.removeChild(element);
}

function markNearbyBreaks(table) {
  if (!table) return;
  var node = table.previousSibling;
  while (node) {
    if (node.nodeType === 3 && !node.nodeValue.replace(/\s/g, "")) {
      node = node.previousSibling;
      continue;
    }
    if (node.nodeType === 1 && node.tagName.toLowerCase() === "br") {
      addClass(node, "azots-legacy-break");
      node = node.previousSibling;
      continue;
    }
    break;
  }
}

function wrapResultsTable(table) {
  if (!table || !table.parentNode) return;
  if (hasClass(table.parentNode, "azots-results-scroll")) return;

  var wrapper = document.createElement("div");
  wrapper.className = "azots-results-scroll";
  table.parentNode.insertBefore(wrapper, table);
  wrapper.appendChild(table);
}

function rowHasMeaningfulContent(row) {
  if (!row) return false;
  if (row.querySelector(".trHeader, input")) return true;
  if (hasClass(row, "trOdd") || hasClass(row, "trEven")) return true;
  var text = row.textContent || row.innerText || "";
  return text.replace(/\u00a0/g, "").replace(/\s/g, "") !== "";
}

function styleResultTable(table) {
  if (!table) return;

  addClass(table, "azots-results-table");

  if (table.querySelector('input[name="ENTRY_CODE"]')) {
    addClass(table, "azots-has-checkboxes");
  }

  var headers = table.querySelectorAll("td.trHeader");
  if (headers.length) addClass(closestRow(headers[0]), "azots-results-header-row");

  var rows = table.querySelectorAll("tr.trOdd, tr.trEven");
  for (var r = 0; r < rows.length; r++) {
    addClass(rows[r], "azots-results-data-row");
    if (r % 2 === 1) addClass(rows[r], "azots-results-data-row-even");
  }

  var allRows = table.getElementsByTagName("tr");
  for (var x = allRows.length - 1; x >= 0; x--) {
    if (!rowHasMeaningfulContent(allRows[x])) removeNode(allRows[x]);
  }

  markNearbyBreaks(table);
  wrapResultsTable(table);
}

function prepareResultsTables() {
  var checks = document.querySelectorAll('input[name="ENTRY_CODE"]');
  var seen = [];

  for (var i = 0; i < checks.length; i++) {
    var table = closestTable(checks[i]);
    if (!table || seen.indexOf(table) !== -1) continue;
    seen.push(table);
    styleResultTable(table);
  }

  // Fallback for pages without ENTRY_CODE (e.g. view_user):
  // find tables whose first row has 3+ direct td.trHeader cells
  // AND the table has trOdd/trEven data rows.
  // Only checks the first row's DIRECT cells (not descendants) to avoid
  // matching layout wrapper tables.
  if (!seen.length) {
    var allTables = document.querySelectorAll("table");
    for (var t = 0; t < allTables.length; t++) {
      if (seen.indexOf(allTables[t]) !== -1) continue;
      if (allTables[t].querySelectorAll("tr.trOdd, tr.trEven").length === 0) continue;
      var firstRow = allTables[t].rows[0];
      if (!firstRow) continue;
      var headerCount = 0;
      for (var c = 0; c < firstRow.cells.length; c++) {
        if (hasClass(firstRow.cells[c], "trHeader")) headerCount++;
      }
      if (headerCount >= 3) {
        seen.push(allTables[t]);
        styleResultTable(allTables[t]);
      }
    }
  }
}

function preparePage() {
  addClass(document.documentElement, "azots-modern-page");
  addClass(document.body, "azots-modern-body");

  // Outer wrapper — centering fix
  var wrapper = document.querySelector('table[width="760"], table[width="780"]');
  addClass(wrapper, "azots-page-wrapper");

  // User header
  var title = document.querySelector("td.lblTitle");
  addClass(closestTable(title), "azots-user-header");

  // Navigation
  var menu = document.querySelector('a[href*="index.jsp"]');
  addClass(closestTable(menu), "azots-navigation");

  // Date card
  var clock = document.querySelector('input[name="TIMENOW"]');
  addClass(closestTable(clock), "azots-date-card");

  // Date long-text cleanup
  var dateCell = document.querySelector("td.lblLongDate");
  if (dateCell) {
    var dateBreaks = dateCell.getElementsByTagName("br");
    while (dateBreaks.length) removeNode(dateBreaks[0]);
  }

  // Clock decoration
  var clockImage = document.querySelector('img[src*="clockRight"]');
  if (clockImage) {
    var clockCell = clockImage.parentNode;
    removeNode(clockImage);
    addClass(clockCell, "azots-clock-decoration");
  }

  // Editor card — handles both preset container IDs
  var presets = document.getElementById("preset-container") || document.getElementById("azots-plus-container");
  if (presets) addClass(presets, "azots-plus-container");
  addClass(closestTable(presets), "azots-editor-card");

  // Form table — match any known form selector
  var formField = document.querySelector(
    'select[name="LOC_ID"], select[name="LOC_FR"], ' +
    'input[name="CLAIM_DATE"], input[name="DATE_FROM"]'
  );
  var formTable = closestTable(formField);
  addClass(formTable, "azots-entry-form");

  // Description inputs — remove trailing <br> siblings
  var descNames = ["LOC_DESC", "LOC_DESC_FR", "LOC_DESC_TO", "PROJ_DESC", "JOB_DESC", "TRAVEL_DESC", "CLAIM_DESC"];
  for (var d = 0; d < descNames.length; d++) {
    var input = document.querySelector('input[name="' + descNames[d] + '"]');
    if (!input || !input.parentNode) continue;
    var children = input.parentNode.childNodes;
    for (var c = children.length - 1; c >= 0; c--) {
      if (children[c].nodeType === 1 && children[c].tagName.toLowerCase() === "br") {
        removeNode(children[c]);
      }
    }
  }

  // Action rows
  var submit = document.querySelector('input[name="SUBMIT"]');
  addClass(closestRow(submit), "azots-action-row");

  // Login page detection
  if (document.querySelector('input[name="SCREEN_NAME"]')) {
    addClass(document.body, "azots-login-page");
    if (!document.getElementById('azots-remove-white')) {
      var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      svg.setAttribute('id', 'azots-svg-filter');
      svg.style.cssText = 'position:absolute;width:0;height:0;overflow:hidden';
      var filter = document.createElementNS('http://www.w3.org/2000/svg', 'filter');
      filter.setAttribute('id', 'azots-remove-white');
      var matrix = document.createElementNS('http://www.w3.org/2000/svg', 'feColorMatrix');
      matrix.setAttribute('type', 'matrix');
      matrix.setAttribute('values', '1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  -1 -1 -1 3 0');
      filter.appendChild(matrix);
      svg.appendChild(filter);
      document.body.appendChild(svg);
    }
  }

  prepareResultsTables();
}

function schedulePrepare() {
  if (window._azotsScheduled) return;
  window._azotsScheduled = true;
  var fn = function () {
    window._azotsScheduled = false;
    preparePage();
  };
  if (window.requestAnimationFrame) {
    window.requestAnimationFrame(fn);
  } else {
    setTimeout(fn, 0);
  }
}

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
        console.warn(`[AzOTS Plus Debug] Option with text "${jobType}" not found in JOB_ID select; leaving unchanged`);
    }
}

function setStartTime(timeStr) {
    console.log(`[AzOTS Plus Debug] Attempting to set START_TIME to: ${timeStr}`);
    const input = document.querySelector(FIELD_SELECTORS.START_TIME);
    if (!input) {
        console.error('[AzOTS Plus Debug] Input field with name "START_TIME" not found');
        return;
    }
    let datePart;
    if (input.value && input.value.includes(' ')) {
        datePart = input.value.split(' ')[0];
    } else {
        const now = new Date();
        datePart = `${String(now.getMonth() + 1).padStart(2, '0')}/${String(now.getDate()).padStart(2, '0')}/${now.getFullYear()}`;
    }
    input.value = `${datePart} ${timeStr}`;
    input.dispatchEvent(new Event('change', { bubbles: true }));
    console.log(`[AzOTS Plus Debug] Set START_TIME to: ${input.value}`);
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
    setAmt(preset.fee || '0.00')
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
        if (preset.startTime) setStartTime(preset.startTime);
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

function enableDisabledClaimControls() {
    const deleteBtn = document.querySelector('input[name="DELETE"]');
    if (deleteBtn) {
        deleteBtn.removeAttribute('disabled');
        console.log('[AzOTS Plus Debug] Enabled DELETE button');
    }

    document.querySelectorAll('input[name="ENTRY_CODE"]').forEach((cb, i) => {
        cb.removeAttribute('disabled');
        console.log(`[AzOTS Plus Debug] Enabled ENTRY_CODE checkbox #${i + 1}`);
    });
}

// Page-Specific Initialization
async function initCreateClaimPage(config) {
    console.log('[AzOTS Plus Debug] Detected create_claim_record.jsp, initializing UI');
    const container = createCustomContainer();

    // Date picker
    const dateInput = createLabeledInput('date', 'claim-date', 'Date: ', { marginRight: '8px' });

    // Restore last used date if field is empty
    try {
        const data = await chrome.storage.sync.get(STORAGE_KEY_LAST_CLAIM_DATE);
        if (data[STORAGE_KEY_LAST_CLAIM_DATE] && !dateInput.input.value) {
            dateInput.input.value = data[STORAGE_KEY_LAST_CLAIM_DATE];
            console.log(`[AzOTS Plus Debug] Restored last claim date: ${dateInput.input.value}`);
        }
    } catch (error) {
        console.error('[AzOTS Plus Debug] Error restoring last claim date:', error);
    }

    // Persist date on change
    dateInput.input.addEventListener('change', () => {
        const val = dateInput.input.value;
        chrome.storage.sync.set({ [STORAGE_KEY_LAST_CLAIM_DATE]: val })
            .then(() => console.log(`[AzOTS Plus Debug] Saved last claim date: ${val}`))
            .catch(err => console.error('[AzOTS Plus Debug] Error saving last claim date:', err));
    });

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

    // Position container near form (e.g., before first table or at top)
    const formArea = document.querySelector('form') || document.body;
    formArea.insertBefore(container, formArea.lastChild);
    console.log('[AzOTS Plus Debug] Custom UI container added to create_claim_record.jsp');

    // Update preset buttons after DOM insertion
    updateTravelPresetButtons(config.claimTravelPresets || [], 'travel-preset-container');
    updateMealPresetButtons(config.claimMealPresets || [], 'meal-preset-container');

    enableDisabledClaimControls();
}

function highlightNonTodayStartTime() {
    const startTimeField = document.querySelector(FIELD_SELECTORS.START_TIME);
    if (!startTimeField) {
        console.warn('[AzOTS Plus Debug] START_TIME field not found for date highlight');
        return;
    }

    function applyHighlight() {
        const val = startTimeField.value;
        if (!val) {
            startTimeField.style.removeProperty('color');
            startTimeField.style.removeProperty('background-color');
            return;
        }
        const parts = val.split(' ');
        const dateParts = parts[0].split('/');
        if (dateParts.length !== 3) return;

        const fieldMonth = parseInt(dateParts[0], 10);
        const fieldDay = parseInt(dateParts[1], 10);
        const fieldYear = parseInt(dateParts[2], 10);

        const now = new Date();
        const isToday = fieldYear === now.getFullYear() &&
                        fieldMonth === (now.getMonth() + 1) &&
                        fieldDay === now.getDate();

        if (!isToday) {
            startTimeField.style.color = '#b33a3a';
            startTimeField.style.backgroundColor = '#fff0f0';
        } else {
            startTimeField.style.removeProperty('color');
            startTimeField.style.removeProperty('background-color');
        }
    }

    applyHighlight();
    startTimeField.addEventListener('change', applyHighlight);

    const observer = new MutationObserver(() => applyHighlight());
    observer.observe(startTimeField, { attributes: true, attributeFilter: ['value'] });

    console.log('[AzOTS Plus Debug] START_TIME date highlight initialized');
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

    // Highlight START_TIME if date is not today
    highlightNonTodayStartTime();

    enableDisabledClaimControls();

    console.log('[AzOTS Plus Debug] Log user page initialization complete');
}

// (injectLogUserStyles removed — styles now come from styles.css)

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
                const timeParts = parts[1].split(':');
                if (timeParts.length === 2) {
                    const totalMin = parseInt(timeParts[0], 10) * 60 + parseInt(timeParts[1], 10);
                    const roundedMin = Math.round(totalMin / 30) * 30;
                    const hh = String(Math.floor(roundedMin / 60)).padStart(2, '0');
                    const mm = String(roundedMin % 60).padStart(2, '0');
                    const rounded = `${hh}:${mm}`;
                    const nearest = timeOptions.find(t => t === rounded);
                    if (nearest) {
                        timeSelect.value = nearest;
                        console.warn(`[AzOTS Plus Debug] Time '${parts[1]}' in ${targetName} rounded to nearest 30-min interval: ${nearest}`);
                    } else {
                        console.warn(`[AzOTS Plus Debug] Invalid time '${parts[1]}' in ${targetName}; using default`);
                    }
                } else {
                    console.warn(`[AzOTS Plus Debug] Invalid time '${parts[1]}' in ${targetName}; using default`);
                }
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

function initViewUserPage() {
    console.log('[AzOTS Plus Debug] Detected ots002b_view_user.jsp, initializing calendar');

    // Determine selected date from URL param or use today
    var params = new URLSearchParams(window.location.search);
    var dateParam = params.get('DATE');
    var now = new Date();
    var year, month, selectedDay;

    if (dateParam) {
        month = parseInt(dateParam.substring(0, 2), 10) - 1;
        selectedDay = parseInt(dateParam.substring(2, 4), 10);
        year = parseInt(dateParam.substring(4, 8), 10);
    } else {
        year = now.getFullYear();
        month = now.getMonth();
        selectedDay = now.getDate();
    }

    var container = document.createElement('div');
    container.className = 'azots-calendar';
    buildCalendar(container, year, month, selectedDay);

    // Insert above the results table
    var results = document.querySelector('.azots-results-scroll');
    if (results) {
        results.parentNode.insertBefore(container, results);
    } else {
        // Before the results table is styled, insert before the data table
        var dataTable = document.querySelector('table.azots-results-table, table[width="760"][cellspacing="1"]');
        if (dataTable && dataTable.parentNode) {
            dataTable.parentNode.insertBefore(container, dataTable);
        } else {
            document.body.appendChild(container);
        }
    }

    console.log('[AzOTS Plus Debug] Calendar inserted for view_user page');
}

function buildCalendar(container, year, month, selectedDay) {
    var monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
                      'July', 'August', 'September', 'October', 'November', 'December'];
    var dayNames = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

    function pad(n) { return n < 10 ? '0' + n : '' + n; }

    function normalizeMonth(yr, mo) {
        if (mo < 0) { yr -= Math.ceil(Math.abs(mo) / 12); mo = ((mo % 12) + 12) % 12; }
        if (mo > 11) { yr += Math.floor(mo / 12); mo = mo % 12; }
        return { yr: yr, mo: mo };
    }

    function render(yr, mo, selDay) {
        var norm = normalizeMonth(yr, mo);
        yr = norm.yr; mo = norm.mo;

        container.innerHTML = '';

        // Header: nav + title
        var header = document.createElement('div');
        header.className = 'azots-calendar-header';

        var prevBtn = document.createElement('button');
        prevBtn.type = 'button';
        prevBtn.className = 'azots-calendar-nav';
        prevBtn.innerText = '\u25C0';
        prevBtn.addEventListener('click', function (e) { e.stopPropagation(); render(yr, mo - 1, selDay); });

        var title = document.createElement('div');
        title.className = 'azots-calendar-title';
        title.innerText = monthNames[mo] + ' ' + yr;

        var nextBtn = document.createElement('button');
        nextBtn.type = 'button';
        nextBtn.className = 'azots-calendar-nav';
        nextBtn.innerText = '\u25B6';
        nextBtn.addEventListener('click', function (e) { e.stopPropagation(); render(yr, mo + 1, selDay); });

        header.appendChild(prevBtn);
        header.appendChild(title);
        header.appendChild(nextBtn);
        container.appendChild(header);

        // Weekday headers
        var weekdays = document.createElement('div');
        weekdays.className = 'azots-calendar-weekdays';
        for (var d = 0; d < 7; d++) {
            var wd = document.createElement('div');
            wd.innerText = dayNames[d];
            weekdays.appendChild(wd);
        }
        container.appendChild(weekdays);

        // Day grid
        var grid = document.createElement('div');
        grid.className = 'azots-calendar-grid';

        var firstDay = new Date(yr, mo, 1).getDay();
        var daysInMonth = new Date(yr, mo + 1, 0).getDate();
        var daysInPrev = new Date(yr, mo, 0).getDate();
        var today = new Date();
        var isTodayDate = today.getFullYear() === yr && today.getMonth() === mo && today.getDate() === selDay;

        // Empty cells before 1st
        for (var e = firstDay - 1; e >= 0; e--) {
            var emptyCell = document.createElement('button');
            emptyCell.type = 'button';
            emptyCell.className = 'azots-cal-day azots-cal-other-month';
            emptyCell.disabled = true;
            emptyCell.innerText = daysInPrev - e;
            grid.appendChild(emptyCell);
        }

        // Day cells
        for (var day = 1; day <= daysInMonth; day++) {
            var cell = document.createElement('button');
            cell.type = 'button';
            cell.className = 'azots-cal-day';
            cell.innerText = day;

            var dateStr = pad(mo + 1) + pad(day) + pad(yr);

            if (day === selDay) {
                cell.className += ' azots-cal-selected';
            }

            if (yr === today.getFullYear() && mo === today.getMonth() && day === today.getDate()) {
                cell.className += ' azots-cal-today';
            }

            (function (ds, d, y, m) {
                cell.addEventListener('click', function () {
                    var href = 'ots002b_view_user.jsp';
                    var isToday = y === today.getFullYear() && m === today.getMonth() && d === today.getDate();
                    if (!isToday) {
                        href += '?DATE=' + ds;
                    }
                    window.location.href = href;
                });
            })(dateStr, day, yr, mo);

            grid.appendChild(cell);
        }

        // Fill remaining cells from next month
        var totalCells = firstDay + daysInMonth;
        var remaining = totalCells % 7;
        if (remaining > 0) {
            for (var f = 1; f <= 7 - remaining; f++) {
                var nextCell = document.createElement('button');
                nextCell.type = 'button';
                nextCell.className = 'azots-cal-day azots-cal-other-month';
                nextCell.disabled = true;
                nextCell.innerText = f;
                grid.appendChild(nextCell);
            }
        }

        container.appendChild(grid);
    }

    render(year, month, selectedDay);
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
    // Apply base styling immediately
    preparePage();

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
        await initCreateClaimPage(config);
    } else if (path.includes(PAGE_PATHS.LOG_USER)) {
        initLogUserPage(config);
    } else if (path.includes(PAGE_PATHS.VIEW_USER)) {
        initViewUserPage();
    } else if (path.includes(PAGE_PATHS.PRINT_CLAIM)) {
        initPrintClaimPage();
    } else {
        console.log('[AzOTS Plus Debug] No matching page for enhancements');
        // For index page — preparePage() already ran
    }

    // Re-apply on events for dynamically rendered content
    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", preparePage);
    }
    window.addEventListener("load", preparePage);
    setTimeout(preparePage, 100);
    setTimeout(preparePage, 500);
    setTimeout(preparePage, 1500);

    // MutationObserver for dynamic DOM changes
    if (window.MutationObserver) {
        var observer = new MutationObserver(function (mutations) {
            for (var i = 0; i < mutations.length; i++) {
                if (mutations[i].addedNodes && mutations[i].addedNodes.length) {
                    schedulePrepare();
                    break;
                }
            }
        });
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }
})();