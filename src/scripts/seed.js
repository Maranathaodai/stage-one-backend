require('dotenv').config();
const { connectDB } = require('../models/db');
const { analyzeString } = require('../services/stringAnalyzer');

async function seed() {
  const db = await connectDB();
  const col = db.collection('strings');

  const samples = [
    'racecar',
    'hello world',
    'level',
    'test string analyzer',
    'a man a plan a canal panama'
  ];

  for (const value of samples) {
    const props = analyzeString(value);
    const doc = {
      id: props.sha256_hash,
      value,
      properties: props,
      created_at: new Date().toISOString()
    };
    try {
      await col.updateOne({ id: doc.id }, { $setOnInsert: doc }, { upsert: true });
    } catch (e) {
      
    }
  }
  process.exit(0);
}

seed().catch((e) => { process.exit(1); });
