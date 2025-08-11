// Background script for Property Manager
let properties = [];

// Load properties from storage on startup
chrome.runtime.onStartup.addListener(() => {
    loadProperties();
});

chrome.runtime.onInstalled.addListener(() => {
    loadProperties();
});

async function loadProperties() {
    try {
        const result = await chrome.storage.local.get(['properties']);
        properties = result.properties || [];
    } catch (error) {
        console.error('Error loading properties:', error);
        properties = [];
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
        console.log('Background: getProperties requested, returning', properties.length, 'properties');
        sendResponse({ properties: properties });
        return false;
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
});

async function addProperty(propertyData) {
    console.log('Background: Adding property:', propertyData);
    const property = {
        ...propertyData,
        id: Date.now(),
        addedAt: new Date().toISOString(),
        score: calculateScore(propertyData)
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
    
    // Notify popup if it's open
    try {
        console.log('Background: Notifying popup of update');
        await chrome.runtime.sendMessage({
            action: 'propertiesUpdated',
            properties: properties
        });
    } catch (error) {
        console.log('Background: Popup not open, that\'s okay');
    }
}

// Professional property scoring algorithm
function calculateScore(property) {
    let score = 0;
    const maxScore = 100;

    // Price scoring (30% weight) - Lower is better
    if (property.price) {
        const priceScore = Math.max(0, 30 - (property.price - 600) / 5);
        score += priceScore;
    }

    // Size scoring (20% weight) - Bigger is better
    if (property.squareMeters) {
        const sizeScore = Math.min(20, (property.squareMeters - 50) / 2);
        score += Math.max(0, sizeScore);
    }

    // Rooms scoring (15% weight) - More rooms is better
    if (property.rooms) {
        const roomScore = Math.min(15, property.rooms * 5);
        score += roomScore;
    }

    // Bathrooms scoring (10% weight) - More bathrooms is better
    if (property.bathrooms) {
        const bathroomScore = Math.min(10, property.bathrooms * 5);
        score += bathroomScore;
    }

    // Features scoring (15% weight)
    if (property.heating) score += 5;
    if (property.furnished) score += 3;
    if (property.elevator) score += 2;
    if (!property.seasonal) score += 5; // Prefer long-term rentals

    // Price per m² scoring (10% weight) - Lower is better
    if (property.pricePerM2) {
        const pricePerM2Score = Math.max(0, 10 - (property.pricePerM2 - 8) / 0.5);
        score += pricePerM2Score;
    }

    return Math.round(Math.min(maxScore, Math.max(0, score)));
}

async function removeProperty(propertyId) {
    properties = properties.filter(p => p.id !== propertyId);
    await saveProperties();
    
    // Notify popup if it's open
    try {
        await chrome.runtime.sendMessage({
            action: 'propertiesUpdated',
            properties: properties
        });
    } catch (error) {
        // Popup might not be open, that's okay
    }
}

async function clearProperties() {
    properties = [];
    await saveProperties();
    
    // Notify popup if it's open
    try {
        await chrome.runtime.sendMessage({
            action: 'propertiesUpdated',
            properties: properties
        });
    } catch (error) {
        // Popup might not be open, that's okay
    }
}

async function saveProperties() {
    try {
        await chrome.storage.local.set({ properties: properties });
    } catch (error) {
        console.error('Error saving properties:', error);
        throw error;
    }
}
