const { Firestore } = require('@google-cloud/firestore');
const { Storage }   = require('@google-cloud/storage');
const path = require('path');

const keyFile = path.join(__dirname, '../../gcp-key.json');

// Firestore client — single instance shared across the app
const db = new Firestore({
  projectId: process.env.GCP_PROJECT_ID,
  keyFilename: keyFile,
});

// GCS client
const storage = new Storage({
  projectId: process.env.GCP_PROJECT_ID,
  keyFilename: keyFile,
});

const bucket = storage.bucket(process.env.GCS_BUCKET);

module.exports = { db, storage, bucket };
