# 🏠 Idea-lista - Professional Property Analyzer

[![Version](https://img.shields.io/badge/version-2.0.0-blue.svg)](https://github.com/your-username/idea-lista)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![Chrome Extension](https://img.shields.io/badge/Chrome-Extension-yellow.svg)](https://chrome.google.com/webstore)

> **Transform your Idealista property search with AI-powered analysis, intelligent scoring, and professional property management.**

## 📋 Table of Contents

- [🎯 Overview](#-overview)
- [✨ Features](#-features)
- [🏗️ Architecture](#️-architecture)
- [🚀 Installation](#-installation)
- [📖 Usage](#-usage)
- [🔧 Development](#-development)
- [📊 API Reference](#-api-reference)
- [🤝 Contributing](#-contributing)

## 🎯 Overview

**Idea-lista** is a sophisticated Chrome extension that revolutionizes property search on Idealista.com. It combines advanced data extraction, intelligent scoring algorithms, and comprehensive property management to help you find your perfect home efficiently.

### 🎯 Key Benefits

- **⚡ Real-time Analysis**: Instant property evaluation as you browse
- **🧠 Intelligent Scoring**: Professional algorithm (0-100) based on real estate criteria
- **💾 Smart Management**: Save, compare, and organize properties effortlessly
- **📊 Data Export**: Export to TSV/Excel for further analysis
- **🎨 Modern UI**: Beautiful, responsive interface with dark/light themes

## ✨ Features

### 🎯 **Core Functionality**

#### **Automatic Data Extraction**
```
┌─────────────────────────────────────────────────────────────┐
│                    Data Extraction Pipeline                 │
├─────────────────────────────────────────────────────────────┤
│ 1. Property Details    │ 2. Amenities        │ 3. Location │
│    • Price (€/month)   │    • Heating        │    • GPS    │
│    • Size (m²)         │    • Elevator       │    • Floor  │
│    • Rooms/Bathrooms   │    • Furnished      │    • Area   │
│    • Energy Rating     │    • Parking        │    • URL    │
└─────────────────────────────────────────────────────────────┘
```

#### **Intelligent Scoring System**
```
┌─────────────────────────────────────────────────────────────┐
│                    Scoring Algorithm                       │
├─────────────────────────────────────────────────────────────┤
│ 🟢 Excellent (80-100) │ Outstanding properties - Act fast! │
│ 🔵 Good (60-79)       │ Very good options - Strong choice │
│ 🟡 Average (40-59)    │ Decent properties - Consider      │
│ 🔴 Poor (0-39)        │ Below average - Skip              │
└─────────────────────────────────────────────────────────────┘

**Price Priority**: When price is marked as "Essential", it receives a 50% weight premium
to better reflect its critical role in property comparison decisions.
```

#### **Property Management**
```
┌─────────────────────────────────────────────────────────────┐
│                    Property Manager                        │
├─────────────────────────────────────────────────────────────┤
│ 📋 Collection View    │ 🏆 Best Analysis    │ 📊 Export   │
│    • Score-sorted     │    • Detailed       │    • TSV    │
│    • Quick actions    │    • Advantages     │    • Excel  │
│    • Visual filters   │    • Comparisons    │    • Backup │
└─────────────────────────────────────────────────────────────┘
```

### 🎨 **Advanced Features**

#### **Smart UI Components**
- **Responsive Design**: Works on all screen sizes
- **Theme Support**: Dark/light mode with system detection
- **Real-time Updates**: Instant feedback on all actions
- **Accessibility**: Keyboard navigation and screen reader support

#### **Data Intelligence**
- **Duplicate Prevention**: Automatic detection and handling
- **Smart Validation**: Ensures data integrity
- **Persistent Storage**: Chrome storage with sync support
- **Export Formats**: TSV, JSON, and Excel-ready formats

## 🏗️ Architecture

### **System Architecture**

![Architecture Diagram](docs/architecture-diagram.svg)

*The Idea-lista system uses a sophisticated architecture with content scripts for data extraction, background scripts for scoring and storage, and a popup interface for property management.*

### **Data Flow**

![Scoring Algorithm](docs/scoring-algorithm.svg)

*The scoring algorithm processes property data through feature extraction, weight application, and range validation to produce a final score from 0-100.*

### **Component Structure**
```
src/
├── components/
│   ├── ui/                    # Reusable UI components
│   │   ├── button.tsx         # Button component
│   │   ├── card.tsx           # Card component
│   │   ├── dialog.tsx         # Modal dialogs
│   │   ├── input.tsx          # Input fields
│   │   ├── select.tsx         # Dropdown selects
│   │   ├── tabs.tsx           # Tab navigation
│   │   └── ...
│   ├── PropertyCard.tsx       # Property display card
│   ├── SettingsView.tsx       # Configuration interface
│   ├── StatisticsModal.tsx    # Analytics modal
│   ├── VisitManagementView.tsx # Visit tracking
│   └── ...
├── services/
│   └── scoring-service.ts     # Scoring algorithm
├── store/
│   └── property-store.ts      # State management
├── lib/
│   ├── utils.ts               # Utility functions
│   └── theme.ts               # Theme configuration
└── App.tsx                    # Main application
```

## 🚀 Installation

### **Prerequisites**
- Chrome browser (version 88+)
- Node.js (for development)
- Git (for cloning)

### **Quick Start**

#### **1. Clone the Repository**
```bash
git clone https://github.com/your-username/idea-lista.git
cd idea-lista
```

#### **2. Install Dependencies**
```bash
npm install
```

#### **3. Build the Extension**
```bash
npm run build:extension
```

#### **4. Load in Chrome**
1. Open Chrome and navigate to `chrome://extensions/`
2. Enable "Developer mode" (top right toggle)
3. Click "Load unpacked"
4. Select the project directory
5. Verify the extension appears in your toolbar

### **Development Setup**

#### **Development Mode**
```bash
npm run dev:extension
```

#### **Type Checking**
```bash
npm run type-check
```

#### **Linting**
```bash
npm run lint
```

## 📖 Usage

### **Basic Workflow**

![User Workflow](docs/workflow-diagram.svg)

*The complete workflow from browsing properties to making informed decisions.*

#### **1. Browse Properties**
```
┌─────────────────────────────────────────────────────────────┐
│                    Property Analysis                        │
├─────────────────────────────────────────────────────────────┤
│ 🏠 Beautiful 2-bedroom apartment in Madrid                 │
│ 📍 Location: Salamanca, Madrid                             │
│ 💰 Price: €1,200/month                                     │
│ 📏 Size: 75m²                                              │
│ 🛏️ Rooms: 2 | 🚿 Bathrooms: 1                             │
│ 🏆 Score: 85/100 (Excellent)                               │
│                                                             │
│ [➕ Add to Collection] [🏆 View Analysis] [🔗 Open Link]   │
└─────────────────────────────────────────────────────────────┘
```

#### **2. Manage Your Collection**
```
┌─────────────────────────────────────────────────────────────┐
│                    Property Manager                        │
├─────────────────────────────────────────────────────────────┤
│ 📊 Statistics: 12 properties | Avg Score: 72               │
│                                                             │
│ 🏆 Best Property: 85/100 - €1,200/month                    │
│ 🔵 Good Options: 3 properties (70-79)                      │
│ 🟡 Average: 5 properties (40-69)                           │
│ 🔴 Below Average: 3 properties (0-39)                      │
│                                                             │
│ [📊 Export Data] [⚙️ Settings] [🗑️ Clear All]             │
└─────────────────────────────────────────────────────────────┘
```

#### **3. Smart Navigation Features**
- **Auto-Scroll to Current Property**: When you open the popup while on a property page, it automatically scrolls to and highlights that property in your collection
- **Smooth Scrolling**: Seamless navigation with smooth scroll animations
- **Visual Highlighting**: The current property gets a subtle highlight effect for easy identification
- **Quick Access**: Instantly find the property you're currently viewing in your saved collection

#### **4. Advanced Features**

##### **Property Analysis**
- Click "🏆 View Analysis" to see detailed scoring breakdown
- Compare properties side-by-side
- Understand why a property scored high/low

##### **Data Export**
- Export to TSV format for Excel analysis
- Include all extracted data points
- Sort by score, price, or location

##### **Settings Configuration**
- Customize scoring weights
- Set property type preferences
- Configure export options

### **Scoring System**

#### **Algorithm Overview**
```
Score = Σ(Feature_Weight × Feature_Score) / Max_Possible_Score × 100

Where:
- Feature_Weight: 0 (Irrelevant), 1 (Valuable), 2 (Essential)
- Price_Weight: 3 when Essential (50% premium) to reflect decision-making priority
- Feature_Score: 0-1 based on how well it matches preferences
- Max_Possible_Score: Sum of all relevant feature weights (including price premium)
```

#### **Scoring Factors**

| Factor | Weight | Description |
|--------|--------|-------------|
| **Price** | Essential (3)* | Lower prices score higher within range |
| **Size** | Essential (2) | Bigger properties score higher |
| **Rooms** | Essential (2) | More rooms score higher |
| **Bathrooms** | Essential (2) | More bathrooms score higher |
| **Heating** | Essential (2) | Critical for comfort |
| **Elevator** | Essential (2) | Important for accessibility |
| **Furnished** | Valuable (1) | Adds convenience |
| **Parking** | Valuable (1) | Important for cars |

*Price gets a 50% premium when marked as essential (2 × 1.5 = 3) to reflect its critical role in decision-making

## 🔧 Development

### **Project Structure**
```
idea-lista/
├── src/                      # Source code
│   ├── components/           # React components
│   ├── services/             # Business logic
│   ├── store/                # State management
│   └── lib/                  # Utilities
├── content.js                # Content script
├── background.js             # Background script
├── popup.html                # Popup interface
├── manifest.json             # Extension manifest
├── package.json              # Dependencies
└── README.md                 # Documentation
```

### **Key Technologies**

#### **Frontend**
- **React 18**: Modern UI framework
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Utility-first styling
- **shadcn/ui**: High-quality components
- **Zustand**: Lightweight state management

#### **Extension**
- **Manifest V3**: Latest Chrome extension API
- **Content Scripts**: Page interaction
- **Background Scripts**: Data processing
- **Chrome Storage**: Persistent data

### **Development Commands**

```bash
# Development
npm run dev              # Start development server
npm run dev:extension    # Build extension for development

# Building
npm run build            # Build for production
npm run build:extension  # Build extension
npm run verify:extension # Verify build

# Quality
npm run lint             # Run ESLint
npm run type-check       # TypeScript checking
```

### **Code Style**

#### **TypeScript**
- Strict mode enabled
- No `any` types
- Proper interface definitions
- Generic type usage

#### **React**
- Functional components
- Hooks for state management
- Proper prop typing
- Component composition

#### **CSS**
- Tailwind utility classes
- Component-scoped styles
- Responsive design
- Dark/light theme support

## 📊 API Reference

### **Store API**

#### **Property Store**
```typescript
interface PropertyStore {
  // Properties
  properties: Property[]
  currentConfigs: PropertyTypeConfigs
  
  // Actions
  addProperty: (property: Property) => void
  removeProperty: (id: string) => void
  updateProperty: (id: string, updates: Partial<Property>) => void
  clearProperties: () => void
  importProperties: (properties: Property[]) => void
  exportProperties: () => Property[]
}
```

#### **Property Interface**
```typescript
interface Property {
  id: string
  title: string
  price: number
  location: string
  size?: number
  squareMeters?: number
  rooms?: number
  bathrooms?: number
  floor?: string
  heating?: boolean
  elevator?: boolean
  furnished?: boolean
  parking?: boolean
  score?: number
  url: string
  imageUrl?: string
  createdAt: Date
  updatedAt: Date
}
```

### **Scoring Service**

#### **Scoring Algorithm**
```typescript
class ScoringService {
  calculateScore(property: Property): number
  updateConfig(type: PropertyType, config: ScoringConfig): void
  getDefaultConfigs(): PropertyTypeConfigs
}
```

#### **Configuration**
```typescript
interface ScoringConfig {
  weights: {
    price: number
    size: number
    rooms: number
    bathrooms: number
    heating: number
    elevator: number
    // ... other factors
  }
  ranges: {
    priceRange: { min: number, max: number }
    sizeRange: { min: number, max: number }
    roomRange: { min: number, max: number }
    bathroomRange: { min: number, max: number }
  }
}
```

### **Content Script API**

#### **Data Extraction**
```typescript
interface PropertyInfo {
  title: string
  price: number
  location: string
  size?: number
  rooms?: number
  bathrooms?: number
  // ... other extracted data
}

function extractPropertyInfo(): PropertyInfo
```

#### **UI Injection**
```typescript
function injectPropertyAnalyzer(info: PropertyInfo): void
function updateAnalyzerUI(score: number): void
```

## 🤝 Contributing

### **Getting Started**

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Make your changes**
4. **Run tests and linting**
   ```bash
   npm run lint
   npm run type-check
   ```
5. **Commit your changes**
   ```bash
   git commit -m 'Add amazing feature'
   ```
6. **Push to the branch**
   ```bash
   git push origin feature/amazing-feature
   ```
7. **Open a Pull Request**

### **Development Guidelines**

#### **Code Style**
- Follow TypeScript best practices
- Use meaningful variable names
- Add JSDoc comments for functions
- Keep functions small and focused

#### **Testing**
- Write unit tests for new features
- Test edge cases and error handling
- Ensure cross-browser compatibility

#### **Documentation**
- Update README for new features
- Add inline code comments
- Document API changes

### **Issue Reporting**

When reporting issues, please include:
- Browser version and OS
- Steps to reproduce
- Expected vs actual behavior
- Console error messages
- Screenshots if applicable

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Idealista.com** for providing the property data
- **Chrome Extension API** for the platform
- **React** and **TypeScript** communities
- **shadcn/ui** for the beautiful components

---

**Made with ❤️ for property hunters everywhere**

*Transform your property search with professional-grade analysis and management tools!* 🏠✨
