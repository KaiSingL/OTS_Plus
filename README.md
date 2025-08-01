# AzOTS Plus Chrome Extension

## Overview
AzOTS Plus is a Chrome extension designed to enhance the user experience of the time sheet and claim form system hosted at `http://192.168.1.148:8081/hkots/*`. It streamlines workflows by injecting custom UI elements and automating form filling for claim submissions and time sheet entries. The extension includes a settings page for user customization, preset buttons for quick form population, and improved date/time input fields.

## Features
- **Custom UI for Claim Forms (`create_claim_record.jsp`)**:
  - Date picker for selecting claim dates.
  - Input fields for travel and lunch fees with default values ($15.80 and $200).
  - Radio buttons for selecting projects (configurable in settings).
  - Buttons for submitting claims: "Claim AM Travel," "Claim PM Travel," "Claim Office Travel," and "Claim Lunch."
  - Automatically fills form fields (`CLAIM_DATE`, `CLAIM_TYPE`, `TRAVEL_TYPE`, `LOC_FR`, `LOC_TO`, `PROJ_ID`, `JOB_ID`, `AMT`) based on user inputs and settings.
- **Custom UI for Time Sheets (`ots002_log_user.jsp`)**:
  - Date/time pickers for `START_TIME` and `END_TIME` fields, converting inputs to `MM/dd/yyyy HH:mm` format.
  - Preset buttons to quickly set `LOC_FR`, `LOC_ID`, `PROJ_ID`, and `JOB_ID` based on user-defined or default presets.
  - Default "OFC" button applies `location: "OFC"`, `project: "NA"`, `purpose: "NA"` as the first preset.
- **Settings Page (`options.html`)**:
  - Configure home and work locations, job name, and projects.
  - Add, remove, and select default projects via radio buttons.
  - Create and manage time sheet presets (location, project, purpose) for quick application.
  - Settings are saved to `chrome.storage.sync` for synchronization across devices.
- **Enhanced Date Selection (`print_claim_record.jsp`)**:
  - Adds date pickers for `DATE_FROM` and `DATE_TO` fields, converting inputs to `MM/dd/yyyy` format.
- **Error Handling and Debugging**:
  - Extensive console logging for UI initialization, field updates, and errors (e.g., missing form elements).
  - Alerts for missing required inputs (e.g., date, fees).
- **Robust Form Interaction**:
  - Triggers `change` events on `<select>` elements to ensure compatibility with form validation.
  - Handles custom locations by selecting "OTH" and populating description fields (`LOC_DESC_FR`, `LOC_DESC`).

## Installation
1. Clone or download this repository to your local machine.
2. Open Chrome and navigate to `chrome://extensions/`.
3. Enable "Developer mode" in the top-right corner.
4. Click "Load unpacked" and select the folder containing the extension files.
5. The extension should load and be active, with its icon appearing in the Chrome toolbar (if configured).

## Disclaimer
AzOTS Plus is provided as-is. Ensure you have permission to automate form interactions on the target system, as unauthorized automation may violate terms of service. Test thoroughly to avoid unintended form submissions.