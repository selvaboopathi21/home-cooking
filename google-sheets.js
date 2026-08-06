

const SHEETS_CONFIG = {
  // Paste your Google Apps Script Web App URL here, e.g.
  // "https://script.google.com/macros/s/AKfycbxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx/exec"
  WEB_APP_URL: "https://script.google.com/macros/s/AKfycbybS_27T9VVR5ejA2ZhMMFiPMd-FrL0vHQebcROWtXyKNujY85OeljytLCXyfjXSGIr9A/exec"
};

/**
 * Sends a form submission to the connected Google Sheet.
 * Uses no-cors mode because Apps Script web apps don't return
 * CORS headers by default — the request still goes through and
 * the row still gets added, we just can't read the response back.
 * @param {string} formType - e.g. 'Booking', 'Catering', 'Contact', 'Newsletter'
 * @param {object} data - key/value pairs to write as a row
 */
function sendToGoogleSheet(formType, data){
  if(!SHEETS_CONFIG.WEB_APP_URL || SHEETS_CONFIG.WEB_APP_URL.includes('PASTE_YOUR')){
    console.warn('Google Sheets not connected yet — skipping remote save. See js/google-sheets.js for setup steps.');
    return Promise.resolve({skipped: true});
  }

  const payload = {
    formType,
    submittedAt: new Date().toISOString(),
    ...data
  };

  return fetch(SHEETS_CONFIG.WEB_APP_URL, {
    method: 'POST',
    mode: 'no-cors',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' }, // avoids CORS preflight
    body: JSON.stringify(payload)
  }).catch(err => {
    console.error('Google Sheets submission failed:', err);
  });
}
