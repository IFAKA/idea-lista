# Dynamic Premium System for Property Scoring

## Overview

The Dynamic Premium System enhances property scoring by applying intelligent multipliers to essential requirements based on their importance in the rental market. This system ensures that critical factors have more influence when comparing properties, leading to more accurate and meaningful property rankings.

**Key Enhancement**: The system now properly considers the **direction** of each parameter's value - whether higher is better or lower is better for each specific property requirement.

## How It Works

When any property requirement is marked as "Essential" (weight = 2), it receives a premium multiplier based on its importance in the rental market. This creates a more nuanced scoring system that reflects real-world rental priorities.

### Parameter Value Directions

The system correctly handles different value directions for each parameter:

#### 🟢 **Higher is Better**
- **Size**: Bigger properties score higher
- **Rooms**: More rooms score higher
- **Bathrooms**: More bathrooms score higher
- **Desk**: Higher desk rating scores higher
- **Amenities**: Having them scores higher (elevator, parking, terrace, etc.)
- **Energy Efficiency**: Better energy ratings score higher (A > B > C > D > E > F > G)
- **Property Condition**: Better condition scores higher
- **Publication Date**: Newer listings score higher

#### 🔴 **Lower is Better**
- **Price**: Cheaper properties score higher
- **Deposit**: Lower deposit relative to price scores higher
- **Maintenance**: Lower maintenance costs relative to price scores higher
- **Roommates**: Fewer roommates scores higher
- **Price per m²**: Lower price per square meter scores higher

#### 🟡 **Optimal Range**
- **Floor**: Middle floors (2-4) score highest, very high floors score lower
- **Orientation**: South-facing scores highest, north-facing scores lowest

## Premium Categories

### 🚨 CRITICAL (2.0x Premium)
These are deal-breakers for most renters and receive the highest premium:

- **Price** (2.0x) - The most critical factor for any rental decision
- **Size** (2.0x) - Directly affects livability and comfort
- **Rooms** (2.0x) - Fundamental for space requirements
- **Bathrooms** (2.0x) - Essential for daily comfort and convenience

### 🔥 HIGH (1.8x Premium)
These significantly impact daily life and receive a high premium:

- **Heating** (1.8x) - Crucial for comfort, especially in cold climates
- **Elevator** (1.8x) - Important for accessibility and convenience
- **Parking** (1.8x) - Highly valued in urban areas
- **Air Conditioning** (1.8x) - Important for comfort in warm climates

### ⭐ MEDIUM (1.5x Premium)
These enhance quality of life and receive a moderate premium:

- **Terrace** (1.5x) - Outdoor space is valuable for relaxation
- **Balcony** (1.5x) - Provides outdoor access and fresh air
- **Furnished** (1.5x) - Saves money and effort for tenants
- **Private Bathroom** (1.5x) - Preferred for privacy and convenience

### 📋 STANDARD (1.3x Premium)
These are nice-to-have features and receive a standard premium:

- **Floor** (1.3x) - Floor level has some impact on convenience
- **Seasonal** (1.3x) - Seasonal rental considerations
- **Built-in Wardrobes** (1.3x) - Storage space is valuable
- **Garage** (1.3x) - Additional parking/storage space
- **Storage** (1.3x) - Extra storage facilities
- **Condition** (1.3x) - Property maintenance level
- **Property Subtype** (1.3x) - Specific property characteristics
- **Desk** (1.3x) - Workspace availability
- **Orientation** (1.3x) - Sunlight exposure
- **Deposit** (1.3x) - Financial considerations
- **Maintenance** (1.3x) - Ongoing costs
- **Energy** (1.3x) - Energy efficiency
- **Garden** (1.3x) - Outdoor space access
- **Pool** (1.3x) - Recreational facilities
- **Accessible** (1.3x) - Accessibility features
- **Window** (1.3x) - Natural light and ventilation
- **Cleaning Included** (1.3x) - Additional services
- **LGBT Friendly** (1.3x) - Inclusive environment
- **Owner Not Present** (1.3x) - Privacy considerations
- **Couples Allowed** (1.3x) - Occupancy policies
- **Minors Allowed** (1.3x) - Family-friendly policies
- **Smokers** (1.3x) - Smoking policies
- **Roommates** (1.3x) - Shared living arrangements
- **Bed** (1.3x) - Furniture availability
- **Publication Date** (1.3x) - Listing freshness
- **Has Floor Plan** (1.3x) - Property visualization
- **Has Virtual Tour** (1.3x) - Digital viewing options
- **Bank Ad** (1.3x) - Advertisement source
- **Gender** (1.3x) - Gender restrictions

## Enhanced Scoring Methods

### Core Property Scoring
- **Price**: `1 - normalizedPrice` (lower price = higher score)
- **Size**: `normalizedSize` (higher size = higher score)
- **Rooms**: `normalizedRooms` (higher rooms = higher score)
- **Bathrooms**: `normalizedBathrooms` (higher bathrooms = higher score)

### Amenity Scoring
- **Has**: 1.0 (full score)
- **Not Has**: 0.0 (no score)
- **Not Mentioned**: 0.5 (neutral score)

### Specialized Scoring
- **Deposit**: Lower deposit relative to price scores higher
- **Maintenance**: Lower maintenance relative to price scores higher
- **Roommates**: Fewer roommates scores higher
- **Floor**: Middle floors (2-4) score highest
- **Orientation**: South-facing scores highest
- **Energy**: A > B > C > D > E > F > G
- **Condition**: Excellent > Very Good > Good > Fair > Bad
- **Publication Date**: Newer listings score higher
- **Price per m²**: Lower price per square meter scores higher

## Scoring Formula

The scoring system now uses the following formula:

```
Score = Σ(Requirement_Score × Importance × Premium_Multiplier) / Σ(Importance × Premium_Multiplier)
```

Where:
- `Requirement_Score` = Normalized score for each requirement (0-100), considering proper value direction
- `Importance` = User-defined importance (0, 1, or 2)
- `Premium_Multiplier` = Dynamic multiplier based on rental market priorities

## Benefits

### 1. **More Accurate Rankings**
Properties are ranked based on what users actually value most in the rental market, with proper consideration of value directions.

### 2. **Better Differentiation**
The premium system creates more meaningful differences between properties, making it easier to identify the best options.

### 3. **Market-Responsive**
The system reflects real rental market priorities, ensuring scores align with actual tenant preferences.

### 4. **Flexible Configuration**
Users can still customize which requirements are essential, valuable, or irrelevant, but the system intelligently applies premiums.

### 5. **Proper Value Direction**
Each parameter is scored according to its natural value direction (higher is better vs lower is better).

## Example Scenarios

### Scenario 1: Price vs. Size with Proper Direction
- **Property A**: €800/month, 60m², Price=Essential, Size=Valuable
- **Property B**: €750/month, 80m², Price=Essential, Size=Valuable

With the premium system:
- Property A: Price gets 2.0x premium (lower price = higher score), Size gets 1.0x (no premium for valuable)
- Property B: Price gets 2.0x premium (lower price = higher score), Size gets 1.0x

Property B gets a significant advantage due to both lower price AND larger size, with the price premium amplifying the difference.

### Scenario 2: Multiple Essential Factors with Direction
- **Property A**: €800/month, 60m², No elevator, Price=Essential, Size=Essential, Elevator=Valuable
- **Property B**: €750/month, 80m², Has elevator, Price=Essential, Size=Essential, Elevator=Essential

With the premium system:
- Property A: Price (2.0x), Size (2.0x), Elevator (1.0x)
- Property B: Price (2.0x), Size (2.0x), Elevator (1.8x)

Property B gets a significant advantage due to the elevator premium, reflecting its real value.

### Scenario 3: Deposit and Maintenance Considerations
- **Property A**: €800/month, €1600 deposit (2 months), €80 maintenance (10%)
- **Property B**: €750/month, €750 deposit (1 month), €37.5 maintenance (5%)

With proper direction scoring:
- Property A: Lower deposit ratio scores higher, lower maintenance ratio scores higher
- Property B: Even better deposit and maintenance ratios

## Implementation Details

The premium system is implemented in the `CalculatePropertyScore` class with:

1. **Premium Multipliers Map**: A comprehensive mapping of all requirements to their premium multipliers
2. **Direction-Aware Scoring**: Each property type has its own scoring method that considers value direction
3. **Dynamic Calculation**: Premiums are applied automatically when requirements are marked as essential
4. **Backward Compatibility**: Existing configurations continue to work, but now benefit from the premium system
5. **Enhanced Debug Support**: Comprehensive debugging tools to analyze premium effects

## Configuration

The premium system works automatically with existing configurations. Users don't need to change their settings - the system intelligently applies premiums based on the importance levels they set.

### Default Behavior
- **Essential (2)**: Receives premium multiplier
- **Valuable (1)**: No premium (1.0x multiplier)
- **Irrelevant (0)**: No impact on scoring

## Testing

The system includes comprehensive testing scenarios that demonstrate:
- Individual premium effects
- Multiple essential factor interactions
- Comparison with non-premium scoring
- Real-world property comparison examples
- Proper value direction handling

This ensures the premium system works correctly and provides meaningful improvements to property scoring while respecting the natural value direction of each parameter.
