// Background script for Property Manager
let properties = [];
let isInitialized = false;
let nextId = 1; // Counter for generating unique IDs

// Default configuration
const defaultConfig = {
    // Price configuration
    maxBudget: 750,
    priceWeight: 25,
    
    // Size configuration
    minSize: 50,
    sizeWeight: 20,
    
    // Rooms configuration
    minRooms: 1,
    roomsWeight: 15,
    
    // Bathrooms configuration
    minBathrooms: 1,
    bathroomsWeight: 10,
    
    // Features configuration
    featuresWeight: 15,
    heatingBonus: 5,
    furnishedBonus: 3,
    seasonalPenalty: 5,
    elevatorBonus: 2,
    elevatorPenalty: 15,
    
    // Price per m² configuration
    maxPricePerM2: 8,
    pricePerM2Weight: 10,
    
    // Orientation configuration
    orientationWeight: 7,
    eastBonus: 7,
    southBonus: 6,
    westBonus: 4,
    northBonus: 3,
    defaultOrientationBonus: 2,
    
    // Desk configuration
    deskWeight: 8,
    deskBonus: 4
};

// Load properties from storage on startup
chrome.runtime.onStartup.addListener(() => {
    loadProperties();
});

chrome.runtime.onInstalled.addListener(() => {
    loadProperties();
});

// Also load properties when the service worker starts
loadProperties();

// Listen for storage changes to keep all components in sync
chrome.storage.onChanged.addListener((changes, namespace) => {
    if (namespace === 'local' && changes.properties) {
        console.log('Background: Storage changed, updating properties');
        properties = changes.properties.newValue || [];
        
        // Notify all components of the change
        notifyAllComponents();
    }
});

async function notifyAllComponents() {
    // Notify popup if it's open
    try {
        await chrome.runtime.sendMessage({
            action: 'propertiesUpdated',
            properties: properties
        });
    } catch (error) {
        // Popup not open, that's okay
    }
    
    // Notify content scripts
    try {
        const tabs = await chrome.tabs.query({ url: 'https://www.idealista.com/inmueble/*' });
        for (const tab of tabs) {
            try {
                await chrome.tabs.sendMessage(tab.id, {
                    action: 'propertiesUpdated',
                    properties: properties
                });
            } catch (error) {
                // Tab might not have content script loaded, that's okay
            }
        }
    } catch (error) {
        // No tabs found or other error, that's okay
    }
}

async function loadProperties() {
    try {
        console.log('Background: Loading properties from storage...');
        const result = await chrome.storage.local.get(['properties', 'nextId']);
        properties = result.properties || [];
        nextId = result.nextId || 1;
        isInitialized = true;
        console.log('Background: Loaded', properties.length, 'properties from storage, nextId:', nextId);
    } catch (error) {
        console.error('Background: Error loading properties:', error);
        properties = [];
        nextId = 1;
        isInitialized = true;
    }
}

// Listen for messages from content script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'addProperty') {
        addProperty(message.property)
            .then(() => {
                sendResponse({ success: true });
            })
            .catch((error) => {
                console.error('Error adding property:', error);
                sendResponse({ success: false, error: error.message });
            });
        return true; // Keep message channel open for async response
    }
    
    if (message.action === 'getProperties') {
        // Ensure properties are loaded before responding
        if (!isInitialized) {
            loadProperties().then(() => {
                console.log('Background: getProperties requested, returning', properties.length, 'properties');
                sendResponse({ properties: properties });
            });
        } else {
            console.log('Background: getProperties requested, returning', properties.length, 'properties');
            sendResponse({ properties: properties });
        }
        return true; // Keep message channel open for async response
    }
    
    if (message.action === 'removeProperty') {
        removeProperty(message.propertyId)
            .then(() => {
                sendResponse({ success: true });
            })
            .catch((error) => {
                console.error('Error removing property:', error);
                sendResponse({ success: false, error: error.message });
            });
        return true;
    }
    
    if (message.action === 'clearProperties') {
        clearProperties()
            .then(() => {
                sendResponse({ success: true });
            })
            .catch((error) => {
                console.error('Error clearing properties:', error);
                sendResponse({ success: false, error: error.message });
            });
        return true;
    }
    

    
    if (message.action === 'importProperties') {
        importProperties(message.properties)
            .then((updatedProperties) => {
                sendResponse({ success: true, properties: updatedProperties });
            })
            .catch((error) => {
                console.error('Error importing properties:', error);
                sendResponse({ success: false, error: error.message });
            });
        return true;
    }
    
    if (message.action === 'generateUniqueId') {
        const id = generateUniqueId();
        sendResponse({ id: id });
        return true;
    }
    
    if (message.action === 'resetIdCounter') {
        nextId = 1;
        saveProperties()
            .then(() => {
                sendResponse({ success: true, nextId: nextId });
            })
            .catch((error) => {
                console.error('Error resetting ID counter:', error);
                sendResponse({ success: false, error: error.message });
            });
        return true;
    }
    
    if (message.action === 'getConfiguration') {
        getConfiguration()
            .then((config) => {
                sendResponse({ success: true, config: config });
            })
            .catch((error) => {
                console.error('Error getting configuration:', error);
                sendResponse({ success: false, error: error.message });
            });
        return true;
    }
    
    if (message.action === 'saveConfiguration') {
        saveConfiguration(message.config)
            .then(() => {
                sendResponse({ success: true });
            })
            .catch((error) => {
                console.error('Error saving configuration:', error);
                sendResponse({ success: false, error: error.message });
            });
        return true;
    }
});

// Generate unique ID for properties
function generateUniqueId() {
    const id = nextId;
    nextId++;
    return id;
}

async function addProperty(propertyData) {
    console.log('Background: Adding property:', propertyData);
    const property = {
        ...propertyData,
        id: generateUniqueId(),
        addedAt: new Date().toISOString(),
        score: await calculateScore(propertyData)
    };
    console.log('Background: Property with score:', property.score);

    // Check if property already exists (by URL)
    const existingIndex = properties.findIndex(p => p.url === property.url);
    if (existingIndex !== -1) {
        console.log('Background: Updating existing property');
        properties[existingIndex] = property;
    } else {
        console.log('Background: Adding new property');
        properties.push(property);
    }

    // Sort by score (best first)
    properties.sort((a, b) => (b.score || 0) - (a.score || 0));
    console.log('Background: Properties after sort:', properties.length);

    await saveProperties();
    
    // Notify all components of the update
    await notifyAllComponents();
}

// Professional property scoring algorithm
async function calculateScore(property) {
    let score = 0;
    const maxScore = 100;

    // Load current configuration
    const config = await getConfiguration();

    // Price scoring - using configured weight and budget
    if (property.price) {
        const priceScore = Math.max(0, config.priceWeight - (property.price - config.maxBudget) / 6);
        score += priceScore;
    }

    // Size scoring - using configured weight and minimum size
    if (property.squareMeters) {
        const sizeScore = Math.min(config.sizeWeight, (property.squareMeters - config.minSize) / 2);
        score += Math.max(0, sizeScore);
    }

    // Rooms scoring - using configured weight
    if (property.rooms) {
        const roomScore = Math.min(config.roomsWeight, property.rooms * 5);
        score += roomScore;
    }

    // Bathrooms scoring - using configured weight
    if (property.bathrooms) {
        const bathroomScore = Math.min(config.bathroomsWeight, property.bathrooms * 5);
        score += bathroomScore;
    }

    // Features scoring - using configured bonuses and penalties
    if (property.heating) score += config.heatingBonus;
    if (property.furnished) score += config.furnishedBonus;
    if (!property.seasonal) score += config.seasonalPenalty;
    
    // Elevator logic - using configured bonuses and penalties
    if (property.elevator) {
        score += config.elevatorBonus;
    } else {
        // Check if it's ground floor (acceptable without elevator)
        const isGroundFloor = property.floor === '0' || 
                            property.floor === 'Bajo' || 
                            property.floor === 'bajo' ||
                            property.floor === 'Planta baja' ||
                            property.floor === 'planta baja';
        
        if (!isGroundFloor) {
            score -= config.elevatorPenalty;
        }
    }

    // Price per m² scoring - using configured weight and max price
    if (property.pricePerM2) {
        const pricePerM2Score = Math.max(0, config.pricePerM2Weight - (property.pricePerM2 - config.maxPricePerM2) / 0.5);
        score += pricePerM2Score;
    }

    // Orientation scoring - using configured weights
    if (property.orientation) {
        const orientation = property.orientation.toLowerCase();
        let orientationScore = 0;
        
        if (orientation.includes('este') || orientation.includes('east')) {
            orientationScore = config.eastBonus;
        } else if (orientation.includes('sur') || orientation.includes('south')) {
            orientationScore = config.southBonus;
        } else if (orientation.includes('oeste') || orientation.includes('west')) {
            orientationScore = config.westBonus;
        } else if (orientation.includes('norte') || orientation.includes('north')) {
            orientationScore = config.northBonus;
        } else {
            orientationScore = config.defaultOrientationBonus;
        }
        
        score += orientationScore;
    }

    // Desk scoring - using configured weight and bonus
    if (property.desk) {
        const deskScore = Math.min(config.deskWeight, property.desk * config.deskBonus);
        score += deskScore;
    }

    return Math.round(Math.min(maxScore, Math.max(0, score)));
}

async function removeProperty(propertyId) {
    properties = properties.filter(p => p.id !== propertyId);
    await saveProperties();
    
    // Notify all components of the update
    await notifyAllComponents();
}

async function importProperties(importedProperties) {
    console.log('Background: Importing', importedProperties.length, 'properties');
    
    // Merge with existing properties, avoiding duplicates by URL
    const existingUrls = new Set(properties.map(p => p.url));
    const newProperties = importedProperties.filter(p => !existingUrls.has(p.url));
    
    if (newProperties.length === 0) {
        console.log('Background: No new properties to import (all already exist)');
        return properties;
    }
    
    // Ensure all imported properties have unique IDs and calculate scores
    const existingIds = new Set(properties.map(p => p.id));
    for (const property of newProperties) {
        // If the property has an ID that conflicts with existing ones, generate a new one
        if (existingIds.has(property.id)) {
            property.id = generateUniqueId();
        }
        existingIds.add(property.id);
        
        // Calculate score for imported property
        property.score = await calculateScore(property);
    }
    
    // Add new properties
    properties.push(...newProperties);
    
    // Sort by score (best first)
    properties.sort((a, b) => (b.score || 0) - (a.score || 0));
    
    // Save to storage
    await saveProperties();
    
    // Notify all components of the update
    await notifyAllComponents();
    
    console.log('Background: Imported', newProperties.length, 'new properties');
    return properties;
}



async function clearProperties() {
    properties = [];
    await saveProperties();
    
    // Notify all components of the update
    await notifyAllComponents();
}

async function saveProperties() {
    try {
        console.log('Background: Saving', properties.length, 'properties to storage');
        await chrome.storage.local.set({ 
            properties: properties,
            nextId: nextId
        });
        console.log('Background: Properties saved successfully, nextId:', nextId);
    } catch (error) {
        console.error('Background: Error saving properties:', error);
        throw error;
    }
}

async function getConfiguration() {
    try {
        console.log('Background: Loading configuration from storage');
        const result = await chrome.storage.local.get(['configuration']);
        const config = result.configuration || defaultConfig;
        console.log('Background: Configuration loaded:', config);
        return config;
    } catch (error) {
        console.error('Background: Error loading configuration:', error);
        return defaultConfig;
    }
}

async function saveConfiguration(newConfig) {
    try {
        console.log('Background: Saving configuration to storage');
        await chrome.storage.local.set({ configuration: newConfig });
        console.log('Background: Configuration saved successfully');
        
        // Recalculate scores for all existing properties with new configuration
        if (properties.length > 0) {
            console.log('Background: Recalculating scores for', properties.length, 'properties with new configuration');
            
            // Update each property's score with the new configuration
            for (const property of properties) {
                property.score = await calculateScore(property);
            }
            
            // Re-sort properties by new scores
            properties.sort((a, b) => (b.score || 0) - (a.score || 0));
            
            // Save updated properties
            await saveProperties();
            
            // Notify all components of the update
            await notifyAllComponents();
            
            console.log('Background: All property scores recalculated and saved');
        }
    } catch (error) {
        console.error('Background: Error saving configuration:', error);
        throw error;
    }
}
