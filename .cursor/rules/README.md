# Cursor Rules for Idea-lista

This directory contains Cursor rules that define the design system, architecture, and coding standards for the Idea-lista Chrome extension.

## Rule Overview

### 🎨 Design System Rules

#### `apple-design-system.mdc`
- **Purpose**: Defines the official Apple design system color palette and design principles
- **Scope**: All UI components and styling
- **Key Elements**:
  - Apple System Colors (Blue, Green, Orange, Red, etc.)
  - Apple System Grays (Dark Mode)
  - Typography Scale (XS to 3XL)
  - Spacing Scale (1 to 12)
  - Border Radius System
  - Shadow System (Dark Mode)

#### `animation-principles.mdc`
- **Purpose**: Defines Apple Watch-inspired animation principles
- **Scope**: All animations and transitions
- **Key Elements**:
  - Fast, Natural, Purposeful, Accessible, Interruptible, Hardware Accelerated
  - Animation Durations (Fast: 100ms, Quick: 150ms, etc.)
  - Easing Curves (Spring, Ease Out, Ease In)
  - Hardware Acceleration Guidelines
  - Performance Best Practices

#### `ui-ux-guidelines.mdc`
- **Purpose**: Defines interface patterns and user experience principles
- **Scope**: All UI components and interactions
- **Key Elements**:
  - Icon-Only Interface (SVG icons with titles)
  - Universal Modal System
  - Compact Property Cards
  - Button States and Loading Patterns
  - Accessibility Guidelines
  - Cursor Rules

### 🏗️ Architecture Rules

#### `chrome-extension-architecture.mdc`
- **Purpose**: Defines the modular architecture and coding standards
- **Scope**: All JavaScript files and project structure
- **Key Elements**:
  - Modular Design Principles
  - Service-Oriented Architecture
  - File Size Limits (500 lines max)
  - Communication Patterns
  - Error Handling
  - Performance Guidelines

#### `scoring-algorithm.mdc`
- **Purpose**: Defines the property evaluation system
- **Scope**: Property scoring and evaluation logic
- **Key Elements**:
  - Scoring Categories and Weights
  - Critical Penalties (Elevator Logic)
  - Score Categories (Excellent, Good, Average, Poor)
  - Calculation Methods
  - Special Cases and Edge Cases

#### `content-script-patterns.mdc`
- **Purpose**: Defines Idealista integration patterns
- **Scope**: Content script and DOM manipulation
- **Key Elements**:
  - Non-Intrusive Design Principles
  - Data Extraction Strategies
  - UI Integration Patterns
  - Error Handling
  - Performance Optimization

#### `project-structure.mdc`
- **Purpose**: Defines complete project organization and file responsibilities
- **Scope**: All project files and directories
- **Key Elements**:
  - Complete directory structure
  - File responsibilities and purposes
  - Naming conventions
  - Import/export patterns
  - Development guidelines

## How to Use These Rules

### 1. Automatic Application
Rules marked with `alwaysApply: true` are automatically included in all AI interactions:
- `apple-design-system.mdc`
- `animation-principles.mdc`
- `ui-ux-guidelines.mdc`
- `chrome-extension-architecture.mdc`

### 2. Context-Specific Application
Rules marked with `globs` are applied when working with specific file types:
- `content-script-patterns.mdc` - Applied when working with `content.js` or `styles.css`

### 3. Manual Application
Rules can be manually referenced using `@ruleName`:
```
@apple-design-system
@animation-principles
@ui-ux-guidelines
```

## Rule Categories

### 🎯 Always Applied (Core Rules)
These rules define the fundamental design and architecture principles:

1. **Apple Design System** - Color palette, typography, spacing
2. **Animation Principles** - Apple Watch-inspired animations
3. **UI/UX Guidelines** - Interface patterns and accessibility
4. **Chrome Extension Architecture** - Modular structure and standards

### 🔧 Context-Specific Rules
These rules are applied based on the files being worked with:

1. **Content Script Patterns** - Idealista integration patterns
2. **Scoring Algorithm** - Property evaluation system
3. **Project Structure** - File organization and responsibilities

## Best Practices

### When Creating New Components
1. Reference the Apple Design System for colors and spacing
2. Apply animation principles for interactions
3. Follow UI/UX guidelines for accessibility
4. Use the modular architecture pattern

### When Modifying Existing Code
1. Ensure consistency with the design system
2. Maintain animation performance standards
3. Preserve accessibility features
4. Follow the established architecture patterns

### When Adding New Features
1. Consider the scoring algorithm impact
2. Follow content script patterns for integration
3. Maintain the icon-only interface principle
4. Use the universal modal system

## Rule Maintenance

### Updating Rules
- Rules should be updated when design decisions change
- Version control all rule changes
- Document breaking changes
- Test rule application in different contexts

### Adding New Rules
- Keep rules focused and specific
- Use clear, actionable language
- Include examples and code snippets
- Maintain consistency with existing rules

### Rule Validation
- Ensure rules don't conflict with each other
- Test rule application in real scenarios
- Validate rule effectiveness
- Gather feedback on rule clarity

## Integration with Development Workflow

### Code Review
- Use rules as checklist for code reviews
- Ensure new code follows established patterns
- Validate design system compliance
- Check animation performance

### Documentation
- Rules serve as living documentation
- Update rules when patterns evolve
- Use rules for onboarding new developers
- Reference rules in commit messages

### Testing
- Test rule application in different contexts
- Validate rule effectiveness
- Ensure rules don't create conflicts
- Monitor rule impact on development speed

## Troubleshooting

### Rule Not Applying
1. Check rule file syntax and metadata
2. Verify `alwaysApply` and `globs` settings
3. Ensure rule file is in correct location
4. Restart Cursor if needed

### Conflicting Rules
1. Review rule priorities
2. Resolve conflicts in rule definitions
3. Use more specific glob patterns
4. Consolidate overlapping rules

### Performance Issues
1. Optimize rule content for faster loading
2. Use specific glob patterns to limit scope
3. Remove unused or redundant rules
4. Monitor rule application performance
