/* =========================================================
   HomeTaste Kitchen — Google Apps Script Backend
   =========================================================
   SETUP
   1. Go to https://sheets.google.com and create a new blank Sheet.
      Name it anything, e.g. "HomeTaste Kitchen — Responses".
   2. In the Sheet, go to Extensions → Apps Script.
   3. Delete any starter code in Code.gs and paste this entire file in.
   4. Click Deploy → New deployment.
      - Click the gear icon next to "Select type" → choose "Web app".
      - Description: anything, e.g. "HomeTaste form handler".
      - Execute as: Me
      - Who has access: Anyone
      - Click Deploy, then authorize the script when prompted
        (click "Advanced" → "Go to project (unsafe)" if you see a
        Google warning — this is normal for your own scripts).
   5. Copy the "Web app URL" you're given.
   6. Paste that URL into js/google-sheets.js as WEB_APP_URL.
   7. Reload your website — form submissions will now appear as new
      rows in this Sheet, in tabs named Bookings, Catering, Contact,
      and Newsletter (created automatically on first submission).
   ========================================================= */

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const sheet = getOrCreateSheet(data.formType);
    appendRow(sheet, data);
    return ContentService
      .createTextOutput(JSON.stringify({ result: 'success' }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ result: 'error', message: err.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function getOrCreateSheet(formType) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const tabName = (formType || 'Submissions').toString();
  let sheet = ss.getSheetByName(tabName);
  if (!sheet) {
    sheet = ss.insertSheet(tabName);
  }
  return sheet;
}

function appendRow(sheet, data) {
  // Build/refresh header row from the keys of the incoming object,
  // so any form shape "just works" without manual column setup.
  const keys = Object.keys(data);
  const existingHeaders = sheet.getRange(1, 1, 1, Math.max(sheet.getLastColumn(), 1)).getValues()[0];

  if (sheet.getLastRow() === 0 || existingHeaders.every(h => h === '')) {
    sheet.getRange(1, 1, 1, keys.length).setValues([keys]);
    sheet.getRange(1, 1, 1, keys.length).setFontWeight('bold');
    sheet.setFrozenRows(1);
  }

  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  const row = headers.map(h => {
    const val = data[h];
    if (val === undefined || val === null) return '';
    if (typeof val === 'object') return JSON.stringify(val);
    return val;
  });
  sheet.appendRow(row);
}
