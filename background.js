// Background script for Property Manager
let properties = [];
let isInitialized = false;
let nextId = 1; // Counter for generating unique IDs

// Default configuration for apartments/houses
const defaultViviendaConfig = {
    weights: {
        // Core financial and size - Essential for vivienda
        price: 2, // Essential
        size: 2, // Essential
        rooms: 2, // Essential
        bathrooms: 2, // Essential
        floor: 1, // Valuable
        
        // Essential amenities
        heating: 2, // Essential
        elevator: 2, // Essential
        airConditioning: 1, // Valuable
        
        // Convenience features
        furnished: 1, // Valuable
        parking: 2, // Essential
        terrace: 1, // Valuable
        balcony: 1, // Valuable
        
        // Vivienda-specific features
        seasonal: 1, // Valuable
        builtInWardrobes: 1, // Valuable
        garage: 1, // Valuable
        storage: 1, // Valuable
        condition: 1, // Valuable
        propertySubType: 1, // Valuable
        hasFloorPlan: 0, // Irrelevant
        hasVirtualTour: 0, // Irrelevant
        bankAd: 0, // Irrelevant
        
        // Habitación-specific features (not used in vivienda)
        gender: 0, // Irrelevant
        smokers: 0, // Irrelevant
        bed: 0, // Irrelevant
        roommates: 0, // Irrelevant
        couplesAllowed: 0, // Irrelevant
        minorsAllowed: 0, // Irrelevant
        window: 0, // Irrelevant
        privateBathroom: 0, // Irrelevant
        cleaningIncluded: 0, // Irrelevant
        lgbtFriendly: 0, // Irrelevant
        ownerNotPresent: 0, // Irrelevant
        
        // Additional features (shared)
        desk: 1, // Valuable
        orientation: 1, // Valuable
        
        // Financial information
        deposit: 1, // Valuable
        maintenance: 1, // Valuable
        energy: 1, // Valuable
        
        // Additional amenities (shared)
        garden: 1, // Valuable
        pool: 0, // Irrelevant
        accessible: 0, // Irrelevant
        
        // Metadata
        publicationDate: 0 // Irrelevant
    },
    priceRange: { min: 400, max: 1200 },
    sizeRange: { min: 50, max: 150 },
    roomRange: { min: 1, max: 4 },
    bathroomRange: { min: 1, max: 3 }
};

// Default configuration for rooms
const defaultHabitacionConfig = {
    weights: {
        // Core financial and size - Essential for habitacion
        price: 2, // Essential
        size: 2, // Essential
        rooms: 0, // Irrelevant (always 1 for rooms)
        bathrooms: 1, // Valuable
        floor: 1, // Valuable
        
        // Essential amenities
        heating: 2, // Essential
        elevator: 2, // Essential
        airConditioning: 1, // Valuable
        
        // Convenience features
        furnished: 2, // Essential
        parking: 1, // Valuable
        terrace: 1, // Valuable
        balcony: 1, // Valuable
        
        // Vivienda-specific features (not used in habitacion)
        seasonal: 0, // Irrelevant
        builtInWardrobes: 0, // Irrelevant
        garage: 0, // Irrelevant
        storage: 0, // Irrelevant
        condition: 0, // Irrelevant
        propertySubType: 0, // Irrelevant
        hasFloorPlan: 0, // Irrelevant
        hasVirtualTour: 0, // Irrelevant
        bankAd: 0, // Irrelevant
        
        // Habitación-specific features (more important for habitacion)
        gender: 1, // Valuable
        smokers: 1, // Valuable
        bed: 1, // Valuable
        roommates: 2, // Essential
        couplesAllowed: 2, // Essential
        minorsAllowed: 1, // Valuable
        window: 2, // Essential
        privateBathroom: 2, // Essential
        cleaningIncluded: 1, // Valuable
        lgbtFriendly: 1, // Valuable
        ownerNotPresent: 1, // Valuable
        
        // Additional features (shared)
        desk: 1, // Valuable
        orientation: 1, // Valuable
        
        // Financial information
        deposit: 1, // Valuable
        maintenance: 1, // Valuable
        energy: 1, // Valuable
        
        // Additional amenities (shared)
        garden: 1, // Valuable
        pool: 0, // Irrelevant
        accessible: 1, // Valuable
        
        // Metadata
        publicationDate: 0 // Irrelevant
    },
    priceRange: { min: 300, max: 800 },
    sizeRange: { min: 10, max: 40 },
    roomRange: { min: 1, max: 1 },
    bathroomRange: { min: 1, max: 2 }
};

// Default configuration structure
const defaultConfig = {
    vivienda: defaultViviendaConfig,
    habitacion: defaultHabitacionConfig
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
    
    if (message.action === 'addVisit') {
        addVisitToProperty(message.propertyId, message.visit)
            .then(() => {
                sendResponse({ success: true });
            })
            .catch((error) => {
                console.error('Error adding visit:', error);
                sendResponse({ success: false, error: error.message });
            });
        return true;
    }
    
    if (message.action === 'updateVisit') {
        updateVisitInProperty(message.propertyId, message.visitId, message.updates)
            .then(() => {
                sendResponse({ success: true });
            })
            .catch((error) => {
                console.error('Error updating visit:', error);
                sendResponse({ success: false, error: error.message });
            });
        return true;
    }
    
    if (message.action === 'removeVisit') {
        removeVisitFromProperty(message.propertyId, message.visitId)
            .then(() => {
                sendResponse({ success: true });
            })
            .catch((error) => {
                console.error('Error removing visit:', error);
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
    // Load current configuration
    const fullConfig = await getConfiguration();
    
    // Determine property type based on URL or other indicators
    const isRoom = property.url && property.url.includes('/habitacion/');
    const config = isRoom ? fullConfig.habitacion : fullConfig.vivienda;

    if (isRoom) {
        // Room scoring algorithm
        return calculateRoomScore(property, config);
    } else {
        // Apartment/House scoring algorithm
        return calculateViviendaScore(property, config);
    }
}

// Room scoring algorithm - 3-state system
function calculateRoomScore(property, config) {
    const scores = {
        price: calculatePriceScore(property.price, config),
        size: calculateSizeScore(
            property.squareMeters !== undefined
                ? property.squareMeters
                : property.size !== undefined
                    ? property.size
                    : 0,
            config
        ),
        rooms: calculateRoomRangeScore(property.rooms ?? 0, config),
        bathrooms: calculateBathroomScore(property.bathrooms ?? 0, config),
        elevator: property.elevator ? 1 : 0,
        parking: property.parking ? 1 : 0,
        terrace: property.terrace ? 1 : 0,
        balcony: property.balcony ? 1 : 0,
        airConditioning: property.airConditioning ? 1 : 0,
        heating: property.heating ? 1 : 0
    }

    // Calculate score based on 3-state importance (Essential = 2, Valuable = 1, Irrelevant = 0)
    const totalScore = Object.entries(scores).reduce((total, [key, score]) => {
        const importance = config.weights[key] || 0
        // Only count scores for properties that are not irrelevant
        if (importance > 0) {
            const score100 = Math.round(score * 100)
            return total + (score100 * importance)
        }
        return total
    }, 0)

    const totalImportance = Object.values(config.weights).reduce((sum, importance) => sum + importance, 0)
    
    // Calculate final score as percentage of total possible score
    const finalScore = totalImportance > 0 ? Math.round(totalScore / totalImportance) : 0
    
    return finalScore
}

// Helper functions for scoring calculations
function calculatePriceScore(price, config) {
    const { min, max } = config.priceRange
    
    if (max === min) return 1
    
    // If price is within the range, give good score
    if (price >= min && price <= max) {
        // Lower price = higher score (inverted within range)
        const normalizedPrice = (price - min) / (max - min)
        return Math.max(0, 1 - normalizedPrice)
    }
    
    // If price is outside the range, give bad score
    return 0
}

function calculateSizeScore(size, config) {
    const { min, max } = config.sizeRange
    if (max === min) return 1
    
    // If size is within the range, give good score
    if (size >= min && size <= max) {
        // Higher size = higher score
        const normalizedSize = (size - min) / (max - min)
        return Math.max(0, Math.min(1, normalizedSize))
    }
    
    // If size is outside the range, give bad score
    return 0
}

function calculateRoomRangeScore(rooms, config) {
    const { min, max } = config.roomRange
    if (max === min) return 1
    
    // If rooms is within the range, give good score
    if (rooms >= min && rooms <= max) {
        // Higher rooms = higher score (up to a point)
        const normalizedRooms = (rooms - min) / (max - min)
        return Math.max(0, Math.min(1, normalizedRooms))
    }
    
    // If rooms is outside the range, give bad score
    return 0
}

function calculateBathroomScore(bathrooms, config) {
    const { min, max } = config.bathroomRange
    if (max === min) return 1
    
    // If bathrooms is within the range, give good score
    if (bathrooms >= min && bathrooms <= max) {
        // Higher bathrooms = higher score (up to a point)
        const normalizedBathrooms = (bathrooms - min) / (max - min)
        return Math.max(0, Math.min(1, normalizedBathrooms))
    }
    
    // If bathrooms is outside the range, give bad score
    return 0
}

// Apartment/House scoring algorithm - 3-state system
function calculateViviendaScore(property, config) {
    const scores = {
        price: calculatePriceScore(property.price, config),
        size: calculateSizeScore(
            property.squareMeters !== undefined
                ? property.squareMeters
                : property.size !== undefined
                    ? property.size
                    : 0,
            config
        ),
        rooms: calculateRoomRangeScore(property.rooms ?? 0, config),
        bathrooms: calculateBathroomScore(property.bathrooms ?? 0, config),
        elevator: property.elevator ? 1 : 0,
        parking: property.parking ? 1 : 0,
        terrace: property.terrace ? 1 : 0,
        balcony: property.balcony ? 1 : 0,
        airConditioning: property.airConditioning ? 1 : 0,
        heating: property.heating ? 1 : 0
    }

    // Calculate score based on 3-state importance (Essential = 2, Valuable = 1, Irrelevant = 0)
    const totalScore = Object.entries(scores).reduce((total, [key, score]) => {
        const importance = config.weights[key] || 0
        // Only count scores for properties that are not irrelevant
        if (importance > 0) {
            const score100 = Math.round(score * 100)
            return total + (score100 * importance)
        }
        return total
    }, 0)

    const totalImportance = Object.values(config.weights).reduce((sum, importance) => sum + importance, 0)
    
    // Calculate final score as percentage of total possible score
    const finalScore = totalImportance > 0 ? Math.round(totalScore / totalImportance) : 0
    
    return finalScore
}

async function removeProperty(propertyId) {
    properties = properties.filter(p => String(p.id) !== String(propertyId));
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
        const result = await chrome.storage.local.get(['scoringConfig']);
        const config = result.scoringConfig || defaultConfig;
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
        await chrome.storage.local.set({ scoringConfig: newConfig });
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

async function addVisitToProperty(propertyId, visitData) {
    try {
        console.log('Background: Adding visit to property:', propertyId, visitData);
        
        // Find the property
        const propertyIndex = properties.findIndex(p => String(p.id) === String(propertyId));
        if (propertyIndex === -1) {
            throw new Error('Property not found');
        }
        
        const property = properties[propertyIndex];
        const visitId = generateUniqueId();
        
        const newVisit = {
            ...visitData,
            id: visitId,
            date: new Date().toISOString(),
            checklist: visitData.checklist || []
        };
        
        // Add visit to property
        if (!property.visits) {
            property.visits = [];
        }
        property.visits.push(newVisit);
        
        // Update property metadata
        property.updatedAt = new Date().toISOString();
        property.lastContactDate = new Date().toISOString();
        
        // Save to storage
        await saveProperties();
        
        // Notify all components
        await notifyAllComponents();
        
        console.log('Background: Visit added successfully');
    } catch (error) {
        console.error('Background: Error adding visit:', error);
        throw error;
    }
}

async function updateVisitInProperty(propertyId, visitId, updates) {
    try {
        console.log('Background: Updating visit in property:', propertyId, visitId, updates);
        
        // Find the property
        const propertyIndex = properties.findIndex(p => String(p.id) === String(propertyId));
        if (propertyIndex === -1) {
            throw new Error('Property not found');
        }
        
        const property = properties[propertyIndex];
        
        // Find and update the visit
        if (!property.visits) {
            throw new Error('No visits found for property');
        }
        
        const visitIndex = property.visits.findIndex(v => v.id === visitId);
        if (visitIndex === -1) {
            throw new Error('Visit not found');
        }
        
        property.visits[visitIndex] = { ...property.visits[visitIndex], ...updates };
        property.updatedAt = new Date().toISOString();
        
        // Save to storage
        await saveProperties();
        
        // Notify all components
        await notifyAllComponents();
        
        console.log('Background: Visit updated successfully');
    } catch (error) {
        console.error('Background: Error updating visit:', error);
        throw error;
    }
}

async function removeVisitFromProperty(propertyId, visitId) {
    try {
        console.log('Background: Removing visit from property:', propertyId, visitId);
        
        // Find the property
        const propertyIndex = properties.findIndex(p => String(p.id) === String(propertyId));
        if (propertyIndex === -1) {
            throw new Error('Property not found');
        }
        
        const property = properties[propertyIndex];
        
        // Remove the visit
        if (!property.visits) {
            throw new Error('No visits found for property');
        }
        
        const visitIndex = property.visits.findIndex(v => v.id === visitId);
        if (visitIndex === -1) {
            throw new Error('Visit not found');
        }
        
        property.visits.splice(visitIndex, 1);
        property.updatedAt = new Date().toISOString();
        
        // Save to storage
        await saveProperties();
        
        // Notify all components
        await notifyAllComponents();
        
        console.log('Background: Visit removed successfully');
    } catch (error) {
        console.error('Background: Error removing visit:', error);
        throw error;
    }
}
