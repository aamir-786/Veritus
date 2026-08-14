const { google } = require('googleapis');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../../.env') });
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

let googleCredentials = null;

try {
  if (process.env.GOOGLE_SERVICE_ACCOUNT_KEY_PATH) {
    const keyPath = path.resolve(__dirname, '../../', process.env.GOOGLE_SERVICE_ACCOUNT_KEY_PATH);
    googleCredentials = require(keyPath);
    console.log('[Google Config] Loaded Google credentials from local file:', keyPath);
  } else {
    console.warn('[Google Config] Warning: GOOGLE_SERVICE_ACCOUNT_KEY_PATH is not set in environment variables.');
  }
} catch (error) {
  console.warn('[Google Config] Warning: Failed to parse Google credentials -', error.message);
}

let googleAuthClient = null;

if (googleCredentials) {
  googleAuthClient = new google.auth.GoogleAuth({
    credentials: googleCredentials,
    // Add scopes here based on what APIs you need, e.g., 'https://www.googleapis.com/auth/drive'
    scopes: ['https://www.googleapis.com/auth/cloud-platform'],
  });
}

module.exports = {
  google,
  googleAuthClient
};
