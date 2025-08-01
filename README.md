# AzOTS Plus Chrome Extension

## Overview
AzOTS Plus is a Chrome extension designed to enhance the user experience of the time sheet and claim form system. It streamlines workflows by injecting custom UI elements, automating form filling, and providing preset buttons for quick data entry in claim submissions and time sheets. The extension includes a configurable settings page where users can manage presets for timesheets, travel claims, and meal claims. All settings are stored in `chrome.storage.sync` for cross-device synchronization.

## Features
- **Settings Page (`options.html`)**:
  - Manage **Timesheet Presets**: Add, edit, or remove presets with fields for Location, Project Name, and Purpose.
  - Manage **Claim Travel Presets**: Add, edit, or remove presets with fields for Preset Name, From Location, To Location, Job, Project Name, Vehicle, and Fee.
  - Manage **Claim Meal Presets**: Add, edit, or remove presets with fields for Preset Name, Project Name, and Purpose.
  - Presets are displayed in tables with Edit and Remove buttons.
  - Changes are debounced and saved automatically to `chrome.storage.sync`.
  - Includes a backdrop and popup modals for adding/editing presets, with input validation to enable/disable the Save button.

- **Custom UI for Claim Forms (`create_claim_record.jsp`)**:
  - Adds a date picker input for selecting the claim date.
  - Displays buttons for user-defined travel presets (e.g., auto-fills fields like `CLAIM_DATE`, `CLAIM_TYPE="TRAV"`, `TRAVEL_TYPE`, `LOC_FR/LOC_TO`, `PROJ_ID`, `JOB_ID`, `AMT`).
  - Adds a meal fee input (default not set, user must enter).
  - Displays buttons for user-defined meal presets (e.g., auto-fills fields like `CLAIM_DATE`, `CLAIM_TYPE="MEAL"`, `PROJ_ID`, `JOB_ID`, `AMT`).
  - Alerts if required fields (date or fee) are missing.
  - Custom styles for inputs and buttons to improve usability.

- **Custom UI for Time Sheets (`ots002_log_user.jsp`)**:
  - Adds datetime pickers for `START_TIME` and `END_TIME` fields, converting selections to `MM/dd/yyyy HH:mm` format.
  - Displays preset buttons (including a default "OFC" button) to quickly populate `LOC_ID` (or `LOC_FR`), `PROJ_ID`, and `JOB_ID`.
  - User-defined presets from settings are loaded as buttons (e.g., `${project} ${location} ${purpose}`).
  - Adjusts the form table width to 100% for better layout.
  - Custom styles for buttons and inputs.

- **Enhanced Date Selection for Print Claim (`print_claim_record.jsp`)**:
  - Adds date pickers for `DATE_FROM` and `DATE_TO` fields, converting selections to `MM/dd/yyyy` format.

- **Extension Action and Context Menu**:
  - Left-click the extension icon to open the settings page.
  - Right-click the extension icon and select "Settings" from the context menu to open the settings page.

- **Error Handling and Debugging**:
  - Extensive console logging for initialization, field updates, preset loading/saving, and errors (e.g., missing form elements or invalid settings).
  - Handles custom locations by selecting "OTH" and filling description fields (`LOC_DESC_FR`, `LOC_DESC_TO`, `LOC_DESC`).
  - Dispatches `change` events on select elements to trigger any native form logic.
  - Fallback to default settings if storage retrieval fails.

## Installation
1. Clone or download this repository to your local machine.
2. Open Chrome and navigate to `chrome://extensions/`.
3. Enable "Developer mode" in the top-right corner.
4. Click "Load unpacked" and select the folder containing the extension files (including `manifest.json`).
5. The extension should load and be active. Its icon will appear in the Chrome toolbar.

## Usage
1. **Configure Settings**:
   - Click the extension icon or right-click it and select "Settings" to open the options page.
   - Add presets for timesheets, travel claims, and meal claims as needed.
   - Changes save automatically after a short debounce delay.

2. **On Time Sheet Pages**:
   - Use the preset buttons to quickly fill location, project, and purpose fields.
   - Select start/end times via the datetime pickers.

3. **On Claim Form Pages**:
   - Enter a date and use travel/meal preset buttons to auto-fill forms.
   - For meals, enter a fee before applying a preset.

4. **On Print Claim Pages**:
   - Use the date pickers to set from/to dates easily.


## Disclaimer
AzOTS Plus is provided as-is. Ensure you have permission to automate form interactions on the target system, as unauthorized automation may violate terms of service. Test thoroughly to avoid unintended form submissions or data issues. Debug logs are included in the console for effective troubleshooting.