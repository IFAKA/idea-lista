# Idea-lista Features List

## Core Features

### 1. Property Data Extraction
- **Automatic extraction** from Idealista.com property pages
- **Extracted data points**:
  - Title, Price, Location, URL
  - Size (square meters), Rooms, Bathrooms, Floor
  - Property features: Heating, Elevator, Parking, Terrace, Balcony, Air Conditioning, Furnished
  - Energy rating, Condition, Property type/subtype
  - Contact information: Phone, Professional, Contact person
  - Additional features: Garden, Pool, Garage, Storage, etc.

### 2. Intelligent Scoring System
- **Professional algorithm** (0-100 score)
- **Configurable weights** for different property features
- **Price priority system** (50% premium when marked as essential)
- **Score categories**:
  - 🟢 Excellent (80-100): Outstanding properties
  - 🔵 Good (60-79): Very good options
  - 🟡 Average (40-59): Decent properties
  - 🔴 Poor (0-39): Below average

### 3. Property Management
- **Add properties** to collection from Idealista pages
- **View all properties** in organized list
- **Delete individual properties**
- **Clear all properties** with confirmation
- **Property cards** with detailed information display

### 4. Visit Management System
- **Track property visits** with detailed records
- **Visit statuses**: Requested, Confirmed, Scheduled, Completed, Cancelled, Rescheduled
- **Visit checklist** with customizable items
- **Contact management** with methods and status tracking
- **Follow-up scheduling** and notes
- **Visit statistics** and success rates

### 5. Data Export & Sharing
- **TSV export** for Excel analysis
- **JSON export** for visit data
- **WhatsApp sharing** with property summaries
- **Sortable exports** by score, price, or other criteria
- **Include visit data** in exports

### 6. Settings & Configuration
- **Scoring weights configuration** for different property types
- **Property type selection** (Vivienda, Habitación)
- **Range settings** for price, size, rooms, bathrooms
- **Feature importance** settings (Irrelevant, Valuable, Essential)

### 7. User Interface Features
- **Modern responsive design** with Tailwind CSS
- **Dark/light theme** support with system detection
- **Smooth animations** using Motion
- **Auto-scroll to current property** when popup opens
- **Visual highlighting** of current property
- **Loading states** and error handling
- **Confirmation modals** for destructive actions

### 8. Statistics & Analytics
- **Property count** and average scores
- **Score distribution** (Excellent, Good, Average, Poor)
- **Best property identification**
- **Visit statistics** and success rates
- **Contact tracking** and response rates

### 9. Chrome Extension Features
- **Content script** for data extraction
- **Background script** for data processing
- **Popup interface** for property management
- **Chrome storage** for data persistence
- **Message passing** between scripts
- **Tab detection** for current property

### 10. Advanced Features
- **Duplicate prevention** when adding properties
- **Data validation** and integrity checks
- **Immutable property updates** with proper state management
- **Priority levels** for properties (High, Medium, Low)
- **Property status tracking** (Available, Under Contract, Sold, etc.)
- **Contact status tracking** (Pending, Contacted, Responded, etc.)
- **Notes system** for properties and visits
- **Follow-up scheduling** with reminders

### 11. Technical Features
- **TypeScript** for type safety
- **React 18** with functional components and hooks
- **Zustand** for state management
- **Clean architecture** with domain, application, and infrastructure layers
- **shadcn/ui** components for consistent UI
- **Vite** for fast development and building
- **ESLint** for code quality
- **PostCSS** and **Tailwind** for styling

### 12. Data Persistence
- **Chrome storage** for local data
- **Sync storage** for cross-device access
- **Data migration** support for updates
- **Backup and restore** capabilities

### 13. Performance Features
- **Lazy loading** of components
- **Memoized calculations** for scoring
- **Efficient re-renders** with React optimization
- **Background processing** for heavy operations

### 14. Accessibility Features
- **Keyboard navigation** support
- **Screen reader** compatibility
- **High contrast** theme support
- **Focus management** for modals and forms

### 15. Error Handling
- **Graceful error recovery**
- **User-friendly error messages**
- **Retry mechanisms** for failed operations
- **Data validation** and sanitization

## File Structure Requirements

### Core Files to Preserve
- `package.json` - Dependencies and scripts
- `manifest.json` - Chrome extension configuration
- `vite.config.ts` - Build configuration
- `tailwind.config.js` - Styling configuration
- `tsconfig.json` - TypeScript configuration
- `components.json` - shadcn/ui configuration
- `postcss.config.js` - CSS processing
- `.eslintrc.cjs` - Code linting
- `README.md` - Documentation
- Icon files (icon16.png, icon48.png, icon128.png)

### Build Scripts
- `scripts/build.sh` - Extension build script
- `scripts/dev.sh` - Development script
- `scripts/verify-build.sh` - Build verification

### Documentation
- `docs/` folder with architecture diagrams
- `THEME_README.md` - Theme documentation

## Dependencies to Maintain
- React 18.2.0
- TypeScript 5.2.2
- Tailwind CSS 3.3.5
- shadcn/ui components
- Zustand 4.4.7
- Framer Motion 12.23.12
- Chrome extension APIs
- Vite 4.5.0
- ESLint and related tools
