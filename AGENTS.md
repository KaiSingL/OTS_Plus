# AzOTS Plus — Agent Notes

## What this is

Chrome extension (Manifest V3) that injects custom UI into an internal JSP timesheet/claim system. Vanilla JS, no build system, no bundler, no tests, no lint.

## Architecture

| File | Role |
|---|---|
| `manifest.json` | Extension manifest (MV3). Content script matches `http://192.168.1.148:8081/hkots/*`. |
| `content.js` | Content script. Routes by `window.location.pathname` to one of three page handlers: `create_claim_record.jsp`, `ots002_log_user.jsp`, `print_claim_record.jsp`. |
| `background.js` | Service worker. Opens options page on icon click or context menu. |
| `options.html` / `options.js` | Settings UI. Manages three preset types (timesheet, travel claim, meal claim). |

## Key facts

- **Storage key**: Settings live at `chrome.storage.sync` under key `azotsSettings` (not `settings` or anything generic).
- **Preset shape**: `{ presets: [...], claimTravelPresets: [...], claimMealPresets: [...] }` — all three arrays must be initialized.
- **Select fields are matched by option text, not value**: `content.js` uses `opt.text.trim()` to find options in `<select>` dropdowns. Changing option values without updating the text-matching logic will break presets.
- **Custom locations**: If a location isn't found in the dropdown, code falls back to selecting "OTH" and fills a description input. Editing this logic requires understanding both paths.
- **Form field names are hardcoded**: See `FIELD_SELECTORS` constant in `content.js`. Field names like `LOC_FR`, `LOC_ID`, `PROJ_ID`, `JOB_ID`, `AMT` are specific to the target JSP forms.
- **Date format**: The target system uses `MM/dd/yyyy HH:mm`; the content script converts from HTML date/time inputs to this format.

## Testing changes

Manual testing only.