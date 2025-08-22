// Background script for Idea-lista Chrome extension
// Handles property data storage and scoring calculations

console.log('🎯 Idea-lista background script loaded successfully!');

// Default scoring configuration
const defaultConfigs = {
  vivienda: {
    weights: {
      price: 2, // Essential
      size: 2, // Essential
      rooms: 2, // Essential
      bathrooms: 2, // Essential
      heating: 2, // Essential
      elevator: 2, // Essential
      furnished: 1, // Valuable
      parking: 1, // Valuable
    },
    ranges: {
      priceRange: { min: 500, max: 3000 },
      sizeRange: { min: 30, max: 150 },
      roomRange: { min: 1, max: 5 },
      bathroomRange: { min: 1, max: 3 },
    },
  },
  habitacion: {
    weights: {
      price: 2, // Essential
      size: 1, // Valuable
      rooms: 0, // Irrelevant (always 1)
      bathrooms: 1, // Valuable
      heating: 2, // Essential
      elevator: 1, // Valuable
      furnished: 2, // Essential
      parking: 1, // Valuable
    },
    ranges: {
      priceRange: { min: 200, max: 800 },
      sizeRange: { min: 8, max: 25 },
      roomRange: { min: 1, max: 1 },
      bathroomRange: { min: 1, max: 1 },
    },
  },
};

// Storage keys
const PROPERTIES_KEY = 'idea-lista-properties';
const CONFIG_KEY = 'idea-lista-config';
const BACKUPS_KEY = 'idea-lista-properties-backups';

// Keep up to this many snapshots
const MAX_BACKUPS = 10;

async function backupSnapshot(rawProperties) {
  try {
    const result = await chrome.storage.local.get([BACKUPS_KEY]);
    const backups = Array.isArray(result[BACKUPS_KEY]) ? result[BACKUPS_KEY] : [];
    const newBackups = [
      ...backups,
      { timestamp: new Date().toISOString(), properties: rawProperties }
    ];
    const trimmed = newBackups.slice(-MAX_BACKUPS);
    await chrome.storage.local.set({ [BACKUPS_KEY]: trimmed });
  } catch (error) {
    console.warn('Warning: failed to create backup snapshot', error);
  }
}

// Initialize storage with default configs
chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.get([CONFIG_KEY], (result) => {
    if (!result[CONFIG_KEY]) {
      chrome.storage.local.set({ [CONFIG_KEY]: defaultConfigs });
    }
  });
});

// Calculate property score
function calculatePropertyScore(propertyData, config) {
  let totalScore = 0;
  let maxPossibleScore = 0;

  // Price scoring (with 50% premium when essential)
  if (config.weights.price > 0) {
    const priceWeight = config.weights.price === 2 ? 3 : config.weights.price; // 50% premium for essential
    const priceScore = calculatePriceScore(propertyData.price, config.ranges.priceRange);
    totalScore += priceScore * priceWeight;
    maxPossibleScore += priceWeight;
  }

  // Size scoring
  if (config.weights.size > 0 && propertyData.squareMeters) {
    const sizeScore = calculateSizeScore(propertyData.squareMeters, config.ranges.sizeRange);
    totalScore += sizeScore * config.weights.size;
    maxPossibleScore += config.weights.size;
  }

  // Rooms scoring
  if (config.weights.rooms > 0) {
    const roomScore = calculateRoomScore(propertyData.rooms, config.ranges.roomRange);
    totalScore += roomScore * config.weights.rooms;
    maxPossibleScore += config.weights.rooms;
  }

  // Bathrooms scoring
  if (config.weights.bathrooms > 0) {
    const bathroomScore = calculateBathroomScore(propertyData.bathrooms, config.ranges.bathroomRange);
    totalScore += bathroomScore * config.weights.bathrooms;
    maxPossibleScore += config.weights.bathrooms;
  }

  // Feature scoring
  if (config.weights.heating > 0) {
    const heatingScore = calculateFeatureScore(propertyData.heating);
    totalScore += heatingScore * config.weights.heating;
    maxPossibleScore += config.weights.heating;
  }

  if (config.weights.elevator > 0) {
    const elevatorScore = calculateFeatureScore(propertyData.elevator);
    totalScore += elevatorScore * config.weights.elevator;
    maxPossibleScore += config.weights.elevator;
  }

  if (config.weights.furnished > 0) {
    const furnishedScore = calculateFeatureScore(propertyData.furnished);
    totalScore += furnishedScore * config.weights.furnished;
    maxPossibleScore += config.weights.furnished;
  }

  if (config.weights.parking > 0) {
    const parkingScore = calculateFeatureScore(propertyData.parking);
    totalScore += parkingScore * config.weights.parking;
    maxPossibleScore += config.weights.parking;
  }

  // Calculate final score (0-100)
  return maxPossibleScore > 0 ? Math.round((totalScore / maxPossibleScore) * 100) : 0;
}

// Helper functions for scoring
function calculatePriceScore(price, range) {
  if (price <= range.min) return 1.0; // Best score for lowest price
  if (price >= range.max) return 0.0; // Worst score for highest price
  
  // Linear interpolation: lower price = higher score
  const normalizedPrice = (price - range.min) / (range.max - range.min);
  return 1.0 - normalizedPrice;
}

function calculateSizeScore(size, range) {
  if (size <= range.min) return 0.0; // Too small
  if (size >= range.max) return 1.0; // Perfect size
  
  // Linear interpolation: bigger size = higher score (up to max)
  const normalizedSize = (size - range.min) / (range.max - range.min);
  return normalizedSize;
}

function calculateRoomScore(rooms, range) {
  if (rooms < range.min) return 0.0;
  if (rooms >= range.max) return 1.0;
  
  // Linear interpolation: more rooms = higher score (up to max)
  const normalizedRooms = (rooms - range.min) / (range.max - range.min);
  return normalizedRooms;
}

function calculateBathroomScore(bathrooms, range) {
  if (bathrooms < range.min) return 0.0;
  if (bathrooms >= range.max) return 1.0;
  
  // Linear interpolation: more bathrooms = higher score (up to max)
  const normalizedBathrooms = (bathrooms - range.min) / (range.max - range.min);
  return normalizedBathrooms;
}

function calculateFeatureScore(feature) {
  switch (feature) {
    case 'has': return 1.0;
    case 'not_has': return 0.0;
    case 'not_mentioned': return 0.5; // Neutral score for unknown
    default: return 0.5;
  }
}

// Add property to storage
async function addProperty(propertyData) {
  try {
    // Get current properties
    const result = await chrome.storage.local.get([PROPERTIES_KEY]);
    const propertiesRaw = result[PROPERTIES_KEY];
    if (!Array.isArray(propertiesRaw)) {
      console.error('Storage data is not an array. Aborting add to avoid data loss.');
      return { success: false, error: 'Datos de almacenamiento inconsistentes. No se agregó la propiedad para evitar pérdida de datos.' };
    }
    const properties = propertiesRaw;
    // Backup before mutation
    await backupSnapshot(properties);
    
    // Get scoring configuration
    const configResult = await chrome.storage.local.get([CONFIG_KEY]);
    const configs = configResult[CONFIG_KEY] || defaultConfigs;
    const config = configs.vivienda; // Default to vivienda config
    
    // Calculate score for the property
    const calculatedScore = calculatePropertyScore(propertyData, config);
    console.log('Calculated score for property:', calculatedScore);
    
    // Check if property already exists (by URL)
    const existingIndex = properties.findIndex(p => p.url === propertyData.url);
    
    if (existingIndex >= 0) {
      // Update existing property
      properties[existingIndex] = {
        ...properties[existingIndex],
        ...propertyData,
        score: calculatedScore, // Ensure score is updated
        updatedAt: new Date().toISOString()
      };
    } else {
      // Add new property
      const newProperty = {
        ...propertyData,
        score: calculatedScore, // Ensure score is included
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        visits: [],
        contacts: []
      };
      properties.push(newProperty);
    }
    
    // Save to storage
    await chrome.storage.local.set({ [PROPERTIES_KEY]: properties });
    
    // Notify popup about the update
    chrome.runtime.sendMessage({ action: 'propertiesUpdated' });
    
    return { success: true, score: calculatedScore };
  } catch (error) {
    console.error('Error adding property:', error);
    return { success: false, error: error.message };
  }
}

// Message listener
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('Background script received message:', message);
  
  if (message.action === 'calculateScore') {
    // Get config for property type (default to vivienda)
    chrome.storage.local.get([CONFIG_KEY], (result) => {
      const configs = result[CONFIG_KEY] || defaultConfigs;
      const config = configs.vivienda; // Default to vivienda config
      
      const score = calculatePropertyScore(message.propertyData, config);
      console.log('Calculated score:', score);
      sendResponse({ score });
    });
    return true; // Keep message channel open for async response
  }
  
  if (message.action === 'addProperty') {
    console.log('Adding property:', message.propertyData);
    addProperty(message.propertyData).then((result) => {
      console.log('Property added result:', result);
      sendResponse(result);
    }).catch((error) => {
      console.error('Error in addProperty:', error);
      sendResponse({ success: false, error: error.message });
    });
    return true; // Keep message channel open for async response
  }
  
  if (message.action === 'getProperties') {
    chrome.storage.local.get([PROPERTIES_KEY], (result) => {
      sendResponse({ properties: result[PROPERTIES_KEY] || [] });
    });
    return true;
  }
  
  if (message.action === 'removeProperty') {
    chrome.storage.local.get([PROPERTIES_KEY], (result) => {
      const propertiesRaw = result[PROPERTIES_KEY];
      if (!Array.isArray(propertiesRaw)) {
        console.error('Storage data is not an array. Aborting delete to avoid data loss.');
        sendResponse({ success: false, error: 'Datos de almacenamiento inconsistentes. No se eliminó para evitar pérdida de datos.' });
        return;
      }
      const properties = propertiesRaw;
      // Backup before mutation
      backupSnapshot(properties).finally(() => {
        const filteredProperties = properties.filter(p => p.id !== message.propertyId);
        chrome.storage.local.set({ [PROPERTIES_KEY]: filteredProperties }, () => {
          chrome.runtime.sendMessage({ action: 'propertyDeleted' });
          sendResponse({ success: true });
        });
      });
    });
    return true;
  }
  
  if (message.action === 'clearProperties') {
    chrome.storage.local.get([PROPERTIES_KEY], (result) => {
      const properties = Array.isArray(result[PROPERTIES_KEY]) ? result[PROPERTIES_KEY] : [];
      backupSnapshot(properties).finally(() => {
        chrome.storage.local.remove([PROPERTIES_KEY], () => {
          chrome.runtime.sendMessage({ action: 'propertiesUpdated' });
          sendResponse({ success: true });
        });
      });
    });
    return true;
  }
  
  if (message.action === 'getConfig') {
    chrome.storage.local.get([CONFIG_KEY], (result) => {
      sendResponse({ config: result[CONFIG_KEY] || defaultConfigs });
    });
    return true;
  }
  
  if (message.action === 'updateConfig') {
    chrome.storage.local.set({ [CONFIG_KEY]: message.config }, () => {
      sendResponse({ success: true });
    });
    return true;
  }
  
  // If no action matches, send an error response
  console.warn('Unknown action:', message.action);
  sendResponse({ success: false, error: 'Unknown action' });
});

// Handle extension icon click
chrome.action.onClicked.addListener((tab) => {
  if (tab.url && tab.url.includes('idealista.com/inmueble/')) {
    // Inject content script if not already injected
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      files: ['content.js']
    });
  }
});
