// Main entry point for the popup
import { PropertyManager } from './core/PropertyManager.js';

// Initialize the application
console.log('Popup script starting...');
const propertyManager = new PropertyManager();

// Make propertyManager globally accessible for modal interactions
window.propertyManager = propertyManager;
