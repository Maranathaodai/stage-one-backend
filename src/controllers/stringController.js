const { connectDB } = require('../models/db');
const { analyzeString } = require('../services/stringAnalyzer');

async function createString(req, res) {
  try {
    const { value } = req.body;
    
    // Validation
    if (value === undefined || value === null) {
      return res.status(400).json({ error: 'Missing "value" field' });
    }
    
    if (typeof value !== 'string') {
      return res.status(422).json({ error: 'Invalid data type for "value" (must be string)' });
    }
    
    const props = analyzeString(value);
    const db = await connectDB();
    const collection = db.collection('strings');
    
    // Check for duplicate
    const existing = await collection.findOne({ id: props.sha256_hash });
    if (existing) {
      return res.status(409).json({ error: 'String already exists in the system' });
    }
    
    // Insert into DB
    const document = {
      id: props.sha256_hash,
      value,
      properties: {
        length: props.length,
        is_palindrome: props.is_palindrome,
        unique_characters: props.unique_characters,
        word_count: props.word_count,
        sha256_hash: props.sha256_hash,
        character_frequency_map: props.character_frequency_map
      },
      created_at: new Date().toISOString()
    };
    
    await collection.insertOne(document);
    
    return res.status(201).json(document);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

async function getStringByValue(req, res) {
  try {
    const { string_value } = req.params;
    const db = await connectDB();
    const collection = db.collection('strings');
    
    const result = await collection.findOne({ value: string_value });
    
    if (!result) {
      return res.status(404).json({ error: 'String does not exist in the system' });
    }
    
    return res.status(200).json(result);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

async function deleteString(req, res) {
  try {
    const { string_value } = req.params;
    const db = await connectDB();
    const collection = db.collection('strings');
    
    const result = await collection.deleteOne({ value: string_value });
    
    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'String does not exist in the system' });
    }
    
    return res.status(204).send();
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

async function getAllStrings(req, res) {
  try {
    const { is_palindrome, min_length, max_length, word_count, contains_character } = req.query;
    const db = await connectDB();
    const collection = db.collection('strings');
    
    // Build filter object
    const filter = {};
    const filters_applied = {};
    
    if (is_palindrome !== undefined) {
      const isPalin = is_palindrome === 'true';
      filter['properties.is_palindrome'] = isPalin;
      filters_applied.is_palindrome = isPalin;
    }
    
    if (min_length !== undefined) {
      const minLen = parseInt(min_length);
      if (isNaN(minLen)) {
        return res.status(400).json({ error: 'Invalid query parameter: min_length must be an integer' });
      }
      filter['properties.length'] = { ...filter['properties.length'], $gte: minLen };
      filters_applied.min_length = minLen;
    }
    
    if (max_length !== undefined) {
      const maxLen = parseInt(max_length);
      if (isNaN(maxLen)) {
        return res.status(400).json({ error: 'Invalid query parameter: max_length must be an integer' });
      }
      filter['properties.length'] = { ...filter['properties.length'], $lte: maxLen };
      filters_applied.max_length = maxLen;
    }
    
    if (word_count !== undefined) {
      const wc = parseInt(word_count);
      if (isNaN(wc)) {
        return res.status(400).json({ error: 'Invalid query parameter: word_count must be an integer' });
      }
      filter['properties.word_count'] = wc;
      filters_applied.word_count = wc;
    }
    
    if (contains_character !== undefined) {
      if (typeof contains_character !== 'string' || contains_character.length !== 1) {
        return res.status(400).json({ error: 'Invalid query parameter: contains_character must be a single character' });
      }
      filter[`properties.character_frequency_map.${contains_character}`] = { $exists: true };
      filters_applied.contains_character = contains_character;
    }
    
    const results = await collection.find(filter).toArray();
    
    return res.status(200).json({
      data: results,
      count: results.length,
      filters_applied
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

async function filterByNaturalLanguage(req, res) {
  try {
    const { query } = req.query;
    
    if (!query) {
      return res.status(400).json({ error: 'Missing query parameter' });
    }
    
    const queryLower = query.toLowerCase();
    const parsed_filters = {};
    
    // Parse natural language
    if (queryLower.includes('palindrom')) {
      parsed_filters.is_palindrome = true;
    }
    
    if (queryLower.includes('single word')) {
      parsed_filters.word_count = 1;
    }
    
    // Extract "longer than X" or "more than X characters"
  const longerThanMatch = queryLower.match(/(?:longer than (\d+))|(?:more than (\d+) characters?)/);
    if (longerThanMatch) {
      const num = parseInt(longerThanMatch[1] || longerThanMatch[2]);
      parsed_filters.min_length = num + 1;
    }
    
    // Extract "shorter than X" or "less than X characters"
  const shorterThanMatch = queryLower.match(/(?:shorter than (\d+))|(?:less than (\d+) characters?)/);
    if (shorterThanMatch) {
      const num = parseInt(shorterThanMatch[1] || shorterThanMatch[2]);
      parsed_filters.max_length = num - 1;
    }
    
    // Extract "containing letter X" or "contains the letter X"
    const containsMatch = queryLower.match(/contain(?:ing|s)? (?:the )?letter ([a-z])/);
    if (containsMatch) {
      parsed_filters.contains_character = containsMatch[1];
    }
    
    // Handle "first vowel" heuristic
    if (queryLower.includes('first vowel')) {
      parsed_filters.contains_character = 'a';
    }
    
    if (Object.keys(parsed_filters).length === 0) {
      return res.status(400).json({ error: 'Unable to parse natural language query' });
    }
    
    // Build MongoDB filter
    const db = await connectDB();
    const collection = db.collection('strings');
    const filter = {};
    
    if (parsed_filters.is_palindrome !== undefined) {
      filter['properties.is_palindrome'] = parsed_filters.is_palindrome;
    }
    
    if (parsed_filters.min_length !== undefined) {
      filter['properties.length'] = { ...filter['properties.length'], $gte: parsed_filters.min_length };
    }
    
    if (parsed_filters.max_length !== undefined) {
      filter['properties.length'] = { ...filter['properties.length'], $lte: parsed_filters.max_length };
    }
    
    if (parsed_filters.word_count !== undefined) {
      filter['properties.word_count'] = parsed_filters.word_count;
    }
    
    if (parsed_filters.contains_character !== undefined) {
      filter[`properties.character_frequency_map.${parsed_filters.contains_character}`] = { $exists: true };
    }
    
    const results = await collection.find(filter).toArray();
    
    return res.status(200).json({
      data: results,
      count: results.length,
      interpreted_query: {
        original: query,
        parsed_filters
      }
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

module.exports = { 
  createString, 
  getStringByValue, 
  deleteString, 
  getAllStrings,
  filterByNaturalLanguage
};
