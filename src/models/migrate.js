require('dotenv').config();
const { connectDB } = require('./db');

async function migrate() {
  const db = await connectDB();
  const collection = db.collection('strings');
  
  await collection.createIndex({ id: 1 }, { unique: true });
  await collection.createIndex({ value: 1 });
  await collection.createIndex({ 'properties.is_palindrome': 1 });
  await collection.createIndex({ 'properties.word_count': 1 });
  await collection.createIndex({ 'properties.length': 1 });
  
  console.log('Migration complete: indexes created on strings collection');
}

if (require.main === module) {
  migrate().then(() => process.exit(0)).catch(e => {
    console.error(e);
    process.exit(1);
  });
}

module.exports = { migrate };
