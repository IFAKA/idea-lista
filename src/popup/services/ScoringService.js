// ScoringService - Handles all scoring-related functionality
export class ScoringService {
    getScoreCategory(score) {
        if (score >= 80) return 'excellent';
        if (score >= 70) return 'good';
        if (score >= 60) return 'average';
        return 'poor';
    }

    calculateAverageScores(properties) {
        if (properties.length === 0) {
            return {
                price: 0,
                size: 0,
                rooms: 0,
                bathrooms: 0,
                features: 0,
                pricePerM2: 0,
                orientation: 0,
                desk: 0
            };
        }

        const totals = {
            price: 0,
            size: 0,
            rooms: 0,
            bathrooms: 0,
            features: 0,
            pricePerM2: 0,
            orientation: 0,
            desk: 0
        };

        properties.forEach(property => {
            // Price scoring (25% weight)
            if (property.price) {
                totals.price += Math.max(0, 25 - (property.price - 600) / 6);
            }

            // Size scoring (20% weight)
            if (property.squareMeters) {
                totals.size += Math.min(20, (property.squareMeters - 50) / 2);
            }

            // Rooms scoring (15% weight)
            if (property.rooms) {
                totals.rooms += Math.min(15, property.rooms * 5);
            }

            // Bathrooms scoring (10% weight)
            if (property.bathrooms) {
                totals.bathrooms += Math.min(10, property.bathrooms * 5);
            }

            // Features scoring (15% weight)
            let featuresScore = 0;
            if (property.heating) featuresScore += 5;
            if (property.furnished) featuresScore += 3;
            if (!property.seasonal) featuresScore += 5;
            
            // Elevator logic - CRITICAL FACTOR
            if (property.elevator) {
                featuresScore += 2; // Bonus for having elevator
            } else {
                // Check if it's ground floor (acceptable without elevator)
                const isGroundFloor = property.floor === '0' || 
                                    property.floor === 'Bajo' || 
                                    property.floor === 'bajo' ||
                                    property.floor === 'Planta baja' ||
                                    property.floor === 'planta baja';
                
                if (!isGroundFloor) {
                    // SEVERE PENALTY for no elevator when not ground floor
                    featuresScore -= 15; // This makes the property unacceptable
                }
                // No penalty for ground floor without elevator
            }
            
            totals.features += featuresScore;

            // Price per m² scoring (10% weight)
            if (property.pricePerM2) {
                totals.pricePerM2 += Math.max(0, 10 - (property.pricePerM2 - 8) / 0.5);
            }

            // Orientation scoring (7% weight)
            if (property.orientation) {
                const orientation = property.orientation.toLowerCase();
                let orientationScore = 0;
                
                if (orientation.includes('este') || orientation.includes('east')) {
                    orientationScore = 7;
                } else if (orientation.includes('sur') || orientation.includes('south')) {
                    orientationScore = 6;
                } else if (orientation.includes('oeste') || orientation.includes('west')) {
                    orientationScore = 4;
                } else if (orientation.includes('norte') || orientation.includes('north')) {
                    orientationScore = 3;
                } else {
                    orientationScore = 2;
                }
                
                totals.orientation += orientationScore;
            }

            // Desk scoring (8% weight)
            if (property.desk) {
                const deskScore = Math.min(8, property.desk * 4);
                totals.desk += deskScore;
            }
        });

        // Calculate averages
        const count = properties.length;
        return {
            price: Math.round((totals.price / count) * 100) / 100,
            size: Math.round((totals.size / count) * 100) / 100,
            rooms: Math.round((totals.rooms / count) * 100) / 100,
            bathrooms: Math.round((totals.bathrooms / count) * 100) / 100,
            features: Math.round((totals.features / count) * 100) / 100,
            pricePerM2: Math.round((totals.pricePerM2 / count) * 100) / 100,
            orientation: Math.round((totals.orientation / count) * 100) / 100,
            desk: Math.round((totals.desk / count) * 100) / 100
        };
    }

    generateScoringDetails(avgScores) {
        return `
            <div class="scoring-breakdown">
                <h3>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M3 3v18h18"></path>
                        <path d="M18.7 8l-5.1 5.2-2.8-2.7L7 14.3"></path>
                    </svg>
                    Scoring Breakdown
                </h3>
                <div class="scoring-categories">
                    <div class="scoring-category">
                        <span class="category-name">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <circle cx="12" cy="12" r="3"></circle>
                                <path d="M12 1v6m0 6v6"></path>
                            </svg>
                            Price (25%)
                        </span>
                        <span class="category-score">${avgScores.price.toFixed(1)}/25</span>
                        <div class="score-bar">
                            <div class="score-fill" style="width: ${(avgScores.price / 25) * 100}%"></div>
                        </div>
                    </div>
                    <div class="scoring-category">
                        <span class="category-name">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                                <line x1="9" y1="9" x2="15" y2="9"></line>
                                <line x1="9" y1="12" x2="15" y2="12"></line>
                                <line x1="9" y1="15" x2="15" y2="15"></line>
                            </svg>
                            Size (20%)
                        </span>
                        <span class="category-score">${avgScores.size.toFixed(1)}/20</span>
                        <div class="score-bar">
                            <div class="score-fill" style="width: ${(avgScores.size / 20) * 100}%"></div>
                        </div>
                    </div>
                    <div class="scoring-category">
                        <span class="category-name">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                                <polyline points="9,22 9,12 15,12 15,22"></polyline>
                            </svg>
                            Rooms (15%)
                        </span>
                        <span class="category-score">${avgScores.rooms.toFixed(1)}/15</span>
                        <div class="score-bar">
                            <div class="score-fill" style="width: ${(avgScores.rooms / 15) * 100}%"></div>
                        </div>
                    </div>
                    <div class="scoring-category">
                        <span class="category-name">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M4 12h16"></path>
                                <path d="M4 6h16"></path>
                                <path d="M4 18h16"></path>
                            </svg>
                            Bathrooms (10%)
                        </span>
                        <span class="category-score">${avgScores.bathrooms.toFixed(1)}/10</span>
                        <div class="score-bar">
                            <div class="score-fill" style="width: ${(avgScores.bathrooms / 10) * 100}%"></div>
                        </div>
                    </div>
                    <div class="scoring-category">
                        <span class="category-name">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                                <polyline points="9,22 9,12 15,12 15,22"></polyline>
                            </svg>
                            Features (15%)
                        </span>
                        <span class="category-score">${avgScores.features.toFixed(1)}/15</span>
                        <div class="score-bar">
                            <div class="score-fill" style="width: ${(avgScores.features / 15) * 100}%"></div>
                        </div>
                    </div>
                    <div class="scoring-category">
                        <span class="category-name">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <circle cx="12" cy="12" r="3"></circle>
                                <path d="M12 1v6m0 6v6"></path>
                            </svg>
                            Price/m² (10%)
                        </span>
                        <span class="category-score">${avgScores.pricePerM2.toFixed(1)}/10</span>
                        <div class="score-bar">
                            <div class="score-fill" style="width: ${(avgScores.pricePerM2 / 10) * 100}%"></div>
                        </div>
                    </div>
                    <div class="scoring-category">
                        <span class="category-name">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <circle cx="12" cy="12" r="5"></circle>
                                <path d="M12 1v22"></path>
                                <path d="M17 12H7"></path>
                            </svg>
                            Orientation (7%)
                        </span>
                        <span class="category-score">${avgScores.orientation.toFixed(1)}/7</span>
                        <div class="score-bar">
                            <div class="score-fill" style="width: ${(avgScores.orientation / 7) * 100}%"></div>
                        </div>
                    </div>
                    <div class="scoring-category">
                        <span class="category-name">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
                                <line x1="8" y1="21" x2="16" y2="21"></line>
                                <line x1="12" y1="17" x2="12" y2="21"></line>
                            </svg>
                            Desk (8%)
                        </span>
                        <span class="category-score">${avgScores.desk.toFixed(1)}/8</span>
                        <div class="score-bar">
                            <div class="score-fill" style="width: ${(avgScores.desk / 8) * 100}%"></div>
                        </div>
                    </div>
                </div>
                <div class="scoring-total">
                    <strong>Total Average Score: ${(avgScores.price + avgScores.size + avgScores.rooms + avgScores.bathrooms + avgScores.features + avgScores.pricePerM2 + avgScores.orientation + avgScores.desk).toFixed(1)}/100</strong>
                </div>
            </div>
        `;
    }

    calculatePropertyScore(property) {
        let score = 0;
        const maxScore = 100;

        // Price scoring (25% weight)
        if (property.price) {
            score += Math.max(0, 25 - (property.price - 600) / 6);
        }

        // Size scoring (20% weight)
        if (property.squareMeters) {
            score += Math.min(20, (property.squareMeters - 50) / 2);
        }

        // Rooms scoring (15% weight)
        if (property.rooms) {
            score += Math.min(15, property.rooms * 5);
        }

        // Bathrooms scoring (10% weight)
        if (property.bathrooms) {
            score += Math.min(10, property.bathrooms * 5);
        }

        // Features scoring (15% weight)
        if (property.heating) score += 5;
        if (property.furnished) score += 3;
        if (!property.seasonal) score += 5;
        
        // Elevator logic - CRITICAL FACTOR
        if (property.elevator) {
            score += 2; // Bonus for having elevator
        } else {
            // Check if it's ground floor (acceptable without elevator)
            const isGroundFloor = property.floor === '0' || 
                                property.floor === 'Bajo' || 
                                property.floor === 'bajo' ||
                                property.floor === 'Planta baja' ||
                                property.floor === 'planta baja';
            
            if (!isGroundFloor) {
                // SEVERE PENALTY for no elevator when not ground floor
                score -= 15; // This makes the property unacceptable
            }
            // No penalty for ground floor without elevator
        }

        // Price per m² scoring (10% weight)
        if (property.pricePerM2) {
            score += Math.max(0, 10 - (property.pricePerM2 - 8) / 0.5);
        }

        // Orientation scoring (7% weight)
        if (property.orientation) {
            const orientation = property.orientation.toLowerCase();
            if (orientation.includes('este') || orientation.includes('east')) {
                score += 7;
            } else if (orientation.includes('sur') || orientation.includes('south')) {
                score += 6;
            } else if (orientation.includes('oeste') || orientation.includes('west')) {
                score += 4;
            } else if (orientation.includes('norte') || orientation.includes('north')) {
                score += 3;
            } else {
                score += 2;
            }
        }

        // Desk scoring (8% weight)
        if (property.desk) {
            score += Math.min(8, property.desk * 4);
        }

        return Math.round(Math.min(maxScore, Math.max(0, score)));
    }

    calculatePropertyScores(property) {
        const scores = {
            price: 0,
            size: 0,
            rooms: 0,
            bathrooms: 0,
            features: 0,
            pricePerM2: 0,
            orientation: 0,
            desk: 0
        };

        // Price scoring (25% weight)
        if (property.price) {
            scores.price = Math.max(0, 25 - (property.price - 600) / 6);
        }

        // Size scoring (20% weight)
        if (property.squareMeters) {
            scores.size = Math.min(20, (property.squareMeters - 50) / 2);
        }

        // Rooms scoring (15% weight)
        if (property.rooms) {
            scores.rooms = Math.min(15, property.rooms * 5);
        }

        // Bathrooms scoring (10% weight)
        if (property.bathrooms) {
            scores.bathrooms = Math.min(10, property.bathrooms * 5);
        }

        // Features scoring (15% weight)
        if (property.heating) scores.features += 5;
        if (property.furnished) scores.features += 3;
        if (!property.seasonal) scores.features += 5;
        
        // Elevator logic - CRITICAL FACTOR
        if (property.elevator) {
            scores.features += 2; // Bonus for having elevator
        } else {
            // Check if it's ground floor (acceptable without elevator)
            const isGroundFloor = property.floor === '0' || 
                                property.floor === 'Bajo' || 
                                property.floor === 'bajo' ||
                                property.floor === 'Planta baja' ||
                                property.floor === 'planta baja';
            
            if (!isGroundFloor) {
                // SEVERE PENALTY for no elevator when not ground floor
                scores.features -= 15; // This makes the property unacceptable
            }
            // No penalty for ground floor without elevator
        }

        // Price per m² scoring (10% weight)
        if (property.pricePerM2) {
            scores.pricePerM2 = Math.max(0, 10 - (property.pricePerM2 - 8) / 0.5);
        }

        // Orientation scoring (7% weight)
        if (property.orientation) {
            const orientation = property.orientation.toLowerCase();
            if (orientation.includes('este') || orientation.includes('east')) {
                scores.orientation = 7;
            } else if (orientation.includes('sur') || orientation.includes('south')) {
                scores.orientation = 6;
            } else if (orientation.includes('oeste') || orientation.includes('west')) {
                scores.orientation = 4;
            } else if (orientation.includes('norte') || orientation.includes('north')) {
                scores.orientation = 3;
            } else {
                scores.orientation = 2;
            }
        }

        // Desk scoring (8% weight)
        if (property.desk) {
            scores.desk = Math.min(8, property.desk * 4);
        }

        return scores;
    }

    generatePropertyScoringDetails(property, scores) {
        const totalScore = Object.values(scores).reduce((sum, score) => sum + score, 0);
        
        return `
            <div class="property-scoring-breakdown">
                <h3>🏠 ${property.price ? property.price.toLocaleString('es-ES') + '€' : 'N/A'} - ${property.squareMeters || 'N/A'}m²</h3>
                <div class="scoring-categories">
                    <div class="scoring-category">
                        <span class="category-name">💰 Price (25%)</span>
                        <span class="category-score">${scores.price.toFixed(1)}/25</span>
                        <div class="score-bar">
                            <div class="score-fill" style="width: ${(scores.price / 25) * 100}%"></div>
                        </div>
                    </div>
                    <div class="scoring-category">
                        <span class="category-name">📐 Size (20%)</span>
                        <span class="category-score">${scores.size.toFixed(1)}/20</span>
                        <div class="score-bar">
                            <div class="score-fill" style="width: ${(scores.size / 20) * 100}%"></div>
                        </div>
                    </div>
                    <div class="scoring-category">
                        <span class="category-name">🛏️ Rooms (15%)</span>
                        <span class="category-score">${scores.rooms.toFixed(1)}/15</span>
                        <div class="score-bar">
                            <div class="score-fill" style="width: ${(scores.rooms / 15) * 100}%"></div>
                        </div>
                    </div>
                    <div class="scoring-category">
                        <span class="category-name">🚿 Bathrooms (10%)</span>
                        <span class="category-score">${scores.bathrooms.toFixed(1)}/10</span>
                        <div class="score-bar">
                            <div class="score-fill" style="width: ${(scores.bathrooms / 10) * 100}%"></div>
                        </div>
                    </div>
                    <div class="scoring-category">
                        <span class="category-name">🏠 Features (15%)</span>
                        <span class="category-score">${scores.features.toFixed(1)}/15</span>
                        <div class="score-bar">
                            <div class="score-fill" style="width: ${(scores.features / 15) * 100}%"></div>
                        </div>
                    </div>
                    <div class="scoring-category">
                        <span class="category-name">💶 Price/m² (10%)</span>
                        <span class="category-score">${scores.pricePerM2.toFixed(1)}/10</span>
                        <div class="score-bar">
                            <div class="score-fill" style="width: ${(scores.pricePerM2 / 10) * 100}%"></div>
                        </div>
                    </div>
                    <div class="scoring-category">
                        <span class="category-name">🌅 Orientation (7%)</span>
                        <span class="category-score">${scores.orientation.toFixed(1)}/7</span>
                        <div class="score-bar">
                            <div class="score-fill" style="width: ${(scores.orientation / 7) * 100}%"></div>
                        </div>
                    </div>
                    <div class="scoring-category">
                        <span class="category-name">💻 Desk (8%)</span>
                        <span class="category-score">${scores.desk.toFixed(1)}/8</span>
                        <div class="score-bar">
                            <div class="score-fill" style="width: ${(scores.desk / 8) * 100}%"></div>
                        </div>
                    </div>
                </div>
                <div class="scoring-total">
                    <strong>Total Score: ${totalScore.toFixed(1)}/100</strong>
                </div>
                <div class="property-features">
                    <h4>Features:</h4>
                    <ul>${this.getFeaturesList(property)}</ul>
                </div>
            </div>
        `;
    }

    getFeaturesList(property) {
        const features = [];
        if (property.heating) features.push('<li>🔥 Heating</li>');
        if (property.furnished) features.push('<li>🪑 Furnished</li>');
        if (property.elevator) features.push('<li>🛗 Elevator</li>');
        if (property.seasonal) features.push('<li>📅 Seasonal</li>');
        if (property.desk) features.push(`<li>💻 ${property.desk} desk${property.desk > 1 ? 's' : ''}</li>`);
        if (property.orientation) features.push(`<li>🌅 ${property.orientation} orientation</li>`);
        if (property.floor) features.push(`<li>🏢 Floor ${property.floor}</li>`);
        if (property.pricePerM2) features.push(`<li>💶 ${property.pricePerM2}€/m²</li>`);
        
        return features.length > 0 ? features.join('') : '<li>No special features</li>';
    }

    calculatePropertiesMetrics(properties) {
        if (properties.length === 0) {
            return {
                totalProperties: 0,
                averageScore: 0,
                averagePrice: 0,
                averageSize: 0,
                priceRange: { min: 0, max: 0 },
                sizeRange: { min: 0, max: 0 },
                scoreDistribution: { excellent: 0, good: 0, average: 0, poor: 0 },
                sizeDistribution: { small: 0, medium: 0, large: 0 },
                priceDistribution: { low: 0, medium: 0, high: 0 },
                features: { heating: 0, furnished: 0, elevator: 0, desk: 0 },
                orientation: { east: 0, south: 0, west: 0, north: 0, other: 0 },
                financialSavings: { monthly: 0, annual: 0 }
            };
        }

        const scores = properties.map(p => p.score);
        const prices = properties.map(p => p.price).filter(p => p);
        const sizes = properties.map(p => p.squareMeters).filter(s => s);

        // Score distribution
        const scoreDistribution = {
            excellent: scores.filter(s => s >= 80).length,
            good: scores.filter(s => s >= 70 && s < 80).length,
            average: scores.filter(s => s >= 60 && s < 70).length,
            poor: scores.filter(s => s < 60).length
        };

        // Size distribution
        const sizePropertiesOver60 = sizes.filter(s => s >= 60).length;
        const sizePropertiesOver70 = sizes.filter(s => s >= 70).length;
        const sizeDistribution = {
            small: sizes.filter(s => s < 60).length,
            medium: sizes.filter(s => s >= 60 && s < 80).length,
            large: sizes.filter(s => s >= 80).length
        };

        // Price distribution
        const scorePropertiesOver80 = scores.filter(s => s >= 80).length;
        const scorePropertiesOver70 = scores.filter(s => s >= 70).length;
        const scorePropertiesOver60 = scores.filter(s => s >= 60).length;
        const priceDistribution = {
            low: prices.filter(p => p < 600).length,
            medium: prices.filter(p => p >= 600 && p < 750).length,
            high: prices.filter(p => p >= 750).length
        };

        // Features
        const features = {
            heating: properties.filter(p => p.heating).length,
            furnished: properties.filter(p => p.furnished).length,
            elevator: properties.filter(p => p.elevator).length,
            desk: properties.filter(p => p.desk).length
        };

        // Orientation
        const orientation = {
            east: properties.filter(p => p.orientation && p.orientation.toLowerCase().includes('este')).length,
            south: properties.filter(p => p.orientation && p.orientation.toLowerCase().includes('sur')).length,
            west: properties.filter(p => p.orientation && p.orientation.toLowerCase().includes('oeste')).length,
            north: properties.filter(p => p.orientation && p.orientation.toLowerCase().includes('norte')).length,
            other: properties.filter(p => p.orientation && !p.orientation.toLowerCase().includes('este') && !p.orientation.toLowerCase().includes('sur') && !p.orientation.toLowerCase().includes('oeste') && !p.orientation.toLowerCase().includes('norte')).length
        };

        // Financial savings
        const maxBudget = 750;
        const averagePrice = prices.length > 0 ? prices.reduce((sum, p) => sum + p, 0) / prices.length : 0;
        const monthlySavings = maxBudget - averagePrice;
        const annualSavings = monthlySavings * 12;

        return {
            totalProperties: properties.length,
            averageScore: Math.round(scores.reduce((sum, s) => sum + s, 0) / scores.length * 100) / 100,
            averagePrice: Math.round(averagePrice * 100) / 100,
            averageSize: sizes.length > 0 ? Math.round(sizes.reduce((sum, s) => sum + s, 0) / sizes.length * 100) / 100 : 0,
            priceRange: { min: Math.min(...prices), max: Math.max(...prices) },
            sizeRange: { min: Math.min(...sizes), max: Math.max(...sizes) },
            scoreDistribution,
            sizeDistribution,
            priceDistribution,
            features,
            orientation,
            financialSavings: { monthly: Math.round(monthlySavings * 100) / 100, annual: Math.round(annualSavings * 100) / 100 },
            percentages: {
                scorePropertiesOver80: Math.round((scorePropertiesOver80 / properties.length) * 100),
                scorePropertiesOver70: Math.round((scorePropertiesOver70 / properties.length) * 100),
                scorePropertiesOver60: Math.round((scorePropertiesOver60 / properties.length) * 100),
                sizePropertiesOver70: Math.round((sizePropertiesOver70 / properties.length) * 100),
                sizePropertiesOver60: Math.round((sizePropertiesOver60 / properties.length) * 100)
            }
        };
    }

    updateConfiguration(newConfig) {
        // This method can be used to update the scoring service with new configuration
        // For now, we'll just log that the configuration was updated
        console.log('ScoringService: Configuration updated:', newConfig);
    }
}
