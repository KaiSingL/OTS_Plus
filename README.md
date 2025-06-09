# Claim Form Automation Extension

## Overview
This browser extension automates the process of filling out a claim form on a specific web application. It provides a user interface with input fields for date, travel fee, and lunch fee, along with buttons to submit AM Travel, PM Travel, and Lunch claims. The extension interacts with the form by setting values for claim date, type, vehicle type, locations, project ID, job ID, and amount.

## Features
- **Date Selection**: Choose a date for the claim using a date picker.
- **Travel Fee Input**: Enter the travel fee for AM and PM travel claims.
- **Lunch Fee Input**: Enter the lunch fee for lunch claims.
- **Claim Buttons**:
  - **AM Travel**: Submits a morning travel claim with predefined settings (e.g., MTR vehicle type, home to work location).
  - **PM Travel**: Submits an evening travel claim with predefined settings (e.g., MTR vehicle type, work to home location).
  - **Lunch**: Submits a lunch claim with predefined settings.
- **Automatic Form Filling**: Populates form fields including claim date, type, vehicle type, locations, project ID, job ID, and amount.
- **Error Handling**: Logs errors to the console if form elements or options are not found.

## Installation
1. Clone or download this repository to your local machine.
2. Open your browser's extension management page:
   - For Chrome: Navigate to `chrome://extensions/`.
   - For Firefox: Navigate to `about:addons`.
3. Enable "Developer mode" (usually a toggle in the top-right corner).
4. Click "Load unpacked" (Chrome) or "Load Temporary Add-on" (Firefox).
5. Select the folder containing the extension files (`content.js`, `manifest.json`, etc.).
6. The extension should now be loaded and active.

## Configuration
**Important**: You must update the URL in the `manifest.json` file to match the target web application where the claim form is hosted.

1. Open the `manifest.json` file.
2. Locate the `"matches"` field in the `content_scripts` section:
   ```json
   "matches": ["https://please-update-the-url/*"]
   ```
3. Replace `"https://please-update-the-url/*"` with the actual URL of the web application (e.g., `"https://example.com/claims/*"`).
4. Save the file and reload the extension in your browser.

## Usage
1. Navigate to the web application where the claim form is located (the URL specified in `manifest.json`).
2. The extension will add a small interface to the page, containing:
   - A date picker.
   - Input fields for travel and lunch fees.
   - Buttons labeled "Claim AM Travel," "Claim PM Travel," and "Claim Lunch."
3. Select a date and enter the appropriate fees.
4. Click the desired claim button to populate the form with the relevant details.
5. If any required fields are missing, an alert will prompt you to enter them.
6. Check the browser console (F12 → Console) for any error messages if the form does not populate as expected.

## Files
- **`content.js`**: The main JavaScript file that contains the logic for form automation and the user interface.
- **`manifest.json`**: The extension's configuration file, specifying permissions, content scripts, and the target URL.

## Notes
- The extension assumes the claim form has specific field names (e.g., `CLAIM_DATE`, `CLAIM_TYPE`, `TRAVEL_TYPE`, etc.). Ensure these match the actual form on the target web application.
- The extension uses predefined values for certain fields (e.g., `Wong Tai Sin` as home, `HKCEC` as work, `VRMS` as project ID, `T9` as job ID). Modify these in `content.js` if needed.
- The extension triggers `change` events on select elements to ensure compatibility with any form validation or event listeners.
- If the target form's structure changes, you may need to update the selectors in `content.js` to match the new field names or structure.

## Troubleshooting
- **Form not populating**: Check the browser console for error messages indicating missing elements or options.
- **Extension not loading**: Ensure the URL in `manifest.json` matches the web application's URL.
- **Incorrect values**: Verify that the predefined values in `content.js` (e.g., locations, project ID) match the options available in the form.


## Disclaimer
This extension is provided as-is. Ensure you have permission to automate form submissions on the target web application, as unauthorized automation may violate terms of service.