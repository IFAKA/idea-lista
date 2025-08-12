# Idea-lista Popup Architecture

This directory contains the modular architecture for the Idea-lista Chrome extension popup.

## 📁 Directory Structure

```
src/popup/
├── core/
│   └── PropertyManager.js      # Main application controller
├── services/
│   ├── UIService.js           # UI rendering and interactions
│   ├── ScoringService.js      # Property scoring algorithms
│   ├── DataService.js         # Import/export functionality
│   └── ModalService.js        # Modal management
├── utils/                     # Utility functions (future use)
├── popup.js                   # Main entry point
└── README.md                  # This file
```

## 🏗️ Architecture Overview

### Core Layer
- **PropertyManager.js**: Central controller that orchestrates all services and manages the application state.

### Service Layer
- **UIService.js**: Handles all UI-related operations including property rendering, stats updates, and button interactions.
- **ScoringService.js**: Contains all scoring algorithms, metrics calculations, and scoring breakdowns.
- **DataService.js**: Manages import/export operations, TSV parsing, and data transformation.
- **ModalService.js**: Handles all modal displays including scoring breakdowns, best property, and metrics.

## 🔧 Key Features

### Modular Design
- **Separation of Concerns**: Each service has a specific responsibility
- **Loose Coupling**: Services communicate through the PropertyManager
- **Maintainability**: Easy to modify individual components without affecting others
- **Testability**: Each service can be tested independently

### Service Responsibilities

#### PropertyManager (Core)
- Application initialization and lifecycle management
- Inter-service communication coordination
- Chrome extension message handling
- Property data management

#### UIService
- Property card rendering with compact design
- Stats bar updates and interactions
- Button event handling
- Temporary message display

#### ScoringService
- Property scoring algorithms
- Average score calculations
- Scoring breakdown generation
- Metrics calculations for property collections

#### DataService
- TSV/CSV import functionality
- Data export with sorting
- Property data parsing and validation
- File handling operations

#### ModalService
- Modal display and management
- Best property modal with financial calculations
- Properties metrics modal with comprehensive statistics
- Clear confirmation modal

## 🚀 Benefits

### Code Organization
- **Reduced Complexity**: Each file is under 500 lines
- **Clear Structure**: Easy to find specific functionality
- **Scalability**: Easy to add new features or modify existing ones

### Performance
- **Lazy Loading**: Services are initialized only when needed
- **Efficient Rendering**: Optimized DOM updates
- **Memory Management**: Proper cleanup and event listener management

### Maintainability
- **Single Responsibility**: Each service has one clear purpose
- **Dependency Injection**: Services are injected into PropertyManager
- **Error Handling**: Centralized error management

## 📝 Usage

The popup is initialized through the main entry point:

```javascript
// src/popup/popup.js
import { PropertyManager } from './core/PropertyManager.js';

const propertyManager = new PropertyManager();
window.propertyManager = propertyManager; // For modal interactions
```

## 🔄 Data Flow

1. **Initialization**: PropertyManager initializes all services
2. **Data Loading**: Properties are loaded from Chrome storage
3. **UI Rendering**: UIService renders the property list
4. **User Interactions**: Events are handled by appropriate services
5. **State Updates**: Changes are propagated through PropertyManager
6. **UI Updates**: UIService updates the display

## 🎯 Future Enhancements

- **Utils Module**: Common utility functions
- **Constants Module**: Application constants and configuration
- **Types Module**: TypeScript definitions (if migrating to TS)
- **Testing Module**: Unit tests for each service
