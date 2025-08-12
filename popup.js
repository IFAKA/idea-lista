// Property Manager Popup Script
class PropertyManager {
    constructor() {
        this.properties = [];
        this.init();
    }

    async init() {
        // Only initialize once
        if (this.initialized) {
            console.log('Popup: Already initialized, skipping init');
            return;
        }
        
        console.log('Popup: Initializing...');
        await this.loadProperties();
        this.setupEventListeners();
        this.setupMessageListener();
        this.render();
        
        // Ensure stats bar buttons are properly disabled if no properties
        if (this.properties.length === 0) {
            this.disableStatsBarButtons();
        }
        
        this.initialized = true;
        console.log('Popup: Initialization complete');
    }

    setupEventListeners() {
        document.getElementById('importBtn').addEventListener('click', () => this.importData());
        document.getElementById('exportBtn').addEventListener('click', () => this.exportData());
        document.getElementById('updateBtn').addEventListener('click', () => this.updateScores());
        document.getElementById('clearBtn').addEventListener('click', () => this.clearAll());
        
        // Add click listener to "Mejor" stat
        document.getElementById('bestPrice').addEventListener('click', () => this.showBestProperty());
        
        // Add click listener to score display
        document.getElementById('avgScore').addEventListener('click', () => this.showScoringBreakdown());
        
        // Add click listener to total properties
        document.getElementById('totalProperties').addEventListener('click', () => this.showPropertiesMetrics());
        
        // Modal close functionality
        document.getElementById('closeModal').addEventListener('click', () => this.closeModal());
        document.getElementById('scoringModal').addEventListener('click', (e) => {
            if (e.target.id === 'scoringModal') {
                this.closeModal();
            }
        });
    }

    setupMessageListener() {
        // Remove any existing listeners to prevent duplicates
        if (this.messageListener) {
            chrome.runtime.onMessage.removeListener(this.messageListener);
        }
        
        // Create the message listener
        this.messageListener = (message, sender, sendResponse) => {
            if (message.action === 'propertiesUpdated') {
                console.log('Popup: Received propertiesUpdated message with', message.properties.length, 'properties');
                this.properties = message.properties;
                this.render();
            }
        };
        
        // Add the listener
        chrome.runtime.onMessage.addListener(this.messageListener);
        
        // Also listen for focus events to refresh data when popup is opened
        window.addEventListener('focus', () => {
            console.log('Popup: Window focused, refreshing properties');
            this.refreshProperties();
        });
    }

    async refreshProperties() {
        // Only refresh if we're already initialized
        if (this.initialized) {
            await this.loadProperties();
            this.render();
        }
    }

    showScoringBreakdown() {
        const modal = document.getElementById('scoringModal');
        const scoringDetails = document.getElementById('scoringDetails');
        
        // Calculate average scores for each category
        const avgScores = this.calculateAverageScores();
        
        // Populate scoring details
        scoringDetails.innerHTML = this.generateScoringDetails(avgScores);
        
        // Show modal
        modal.style.display = 'block';
    }

    closeModal() {
        const modal = document.getElementById('scoringModal');
        modal.style.display = 'none';
    }

    calculateAverageScores() {
        if (this.properties.length === 0) {
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

        this.properties.forEach(property => {
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

            // Features scoring (15% weight) - Adjusted for remote work priorities
            let featuresScore = 0;
            if (property.heating) featuresScore += 5; // Essential for comfort
            if (property.furnished) featuresScore += 3; // Convenience
            if (!property.seasonal) featuresScore += 5; // Prefer long-term rentals
            
            // Elevator logic - penalty for no elevator unless it's ground floor
            if (property.elevator) {
                featuresScore += 2; // Bonus for having elevator
            } else if (property.floor && property.floor !== '0' && property.floor !== 'Bajo' && property.floor !== 'bajo') {
                featuresScore -= 3; // Penalty for no elevator when not ground floor
            }
            // No penalty for ground floor (floor 0, Bajo) without elevator
            
            totals.features += featuresScore;

            // Price per m² scoring (10% weight)
            if (property.pricePerM2) {
                totals.pricePerM2 += Math.max(0, 10 - (property.pricePerM2 - 8) / 0.5);
            }

            // Orientation scoring (7% weight) - East is best (sunrise), then South, West, North
            if (property.orientation) {
                const orientation = property.orientation.toLowerCase();
                let orientationScore = 0;
                
                if (orientation.includes('este') || orientation.includes('east')) {
                    orientationScore = 7; // Best case - sunrise
                } else if (orientation.includes('sur') || orientation.includes('south')) {
                    orientationScore = 6; // Good - full sun exposure
                } else if (orientation.includes('oeste') || orientation.includes('west')) {
                    orientationScore = 4; // Moderate - afternoon sun
                } else if (orientation.includes('norte') || orientation.includes('north')) {
                    orientationScore = 3; // Lower - limited sun exposure
                } else {
                    orientationScore = 2; // Unknown orientation
                }
                
                totals.orientation += orientationScore;
            }

            // Desk scoring (8% weight) - Critical for remote work
            if (property.desk) {
                const deskScore = Math.min(8, property.desk * 4); // 1 desk = 4 points, 2+ desks = 8 points
                totals.desk += deskScore;
            }
        });

        // Calculate averages
        const count = this.properties.length;
        return {
            price: Math.round(totals.price / count),
            size: Math.round(totals.size / count),
            rooms: Math.round(totals.rooms / count),
            bathrooms: Math.round(totals.bathrooms / count),
            features: Math.round(totals.features / count),
            pricePerM2: Math.round(totals.pricePerM2 / count),
            orientation: Math.round(totals.orientation / count),
            desk: Math.round(totals.desk / count)
        };
    }

    generateScoringDetails(avgScores) {
        const categories = [
            {
                name: '💰 Precio (25% peso)',
                score: avgScores.price,
                weight: 25,
                description: 'Precio mensual del alquiler. Menor precio = mayor puntuación.',
                formula: '25 - (precio - 600€) / 6',
                marketData: 'Precio promedio en Madrid: 750€/mes'
            },
            {
                name: '📏 Tamaño (20% peso)',
                score: avgScores.size,
                weight: 20,
                description: 'Metros cuadrados de la propiedad. Mayor tamaño = mayor puntuación.',
                formula: '(m² - 50) / 2 (máx. 20 puntos)',
                marketData: 'Tamaño promedio en Madrid: 65m²'
            },
            {
                name: '🛏️ Habitaciones (15% peso)',
                score: avgScores.rooms,
                weight: 15,
                description: 'Número de habitaciones. Más habitaciones = mayor puntuación.',
                formula: 'habitaciones × 5 (máx. 15 puntos)',
                marketData: 'Promedio de habitaciones: 2.5'
            },
            {
                name: '🚿 Baños (10% peso)',
                score: avgScores.bathrooms,
                weight: 10,
                description: 'Número de baños. Más baños = mayor puntuación.',
                formula: 'baños × 5 (máx. 10 puntos)',
                marketData: 'Promedio de baños: 1.2'
            },
            {
                name: '🏠 Características (15% peso)',
                score: avgScores.features,
                weight: 15,
                description: 'Calefacción (+5), Amueblado (+3), Ascensor (+2), Largo plazo (+5).',
                formula: 'Suma de características disponibles',
                marketData: 'Características más valoradas: calefacción y largo plazo'
            },
            {
                name: '📊 Precio/m² (10% peso)',
                score: avgScores.pricePerM2,
                weight: 10,
                description: 'Precio por metro cuadrado. Menor precio/m² = mayor puntuación.',
                formula: '10 - (precio/m² - 8€) / 0.5',
                marketData: 'Precio promedio por m²: 12€/m²'
            },
            {
                name: '🌅 Orientación (7% peso)',
                score: avgScores.orientation,
                weight: 7,
                description: 'Orientación de la propiedad. Este (amanecer) = mejor, Sur = bueno, Oeste = moderado, Norte = limitado.',
                formula: 'Este (+7), Sur (+6), Oeste (+4), Norte (+3), Otros (+2)',
                marketData: 'Orientación más valorada: Este (amanecer)'
            },
            {
                name: '💼 Escritorios (8% peso)',
                score: avgScores.desk,
                weight: 8,
                description: 'Escritorios disponibles para trabajo remoto. Más escritorios = mayor puntuación.',
                formula: '1 escritorio (+4), 2+ escritorios (+8)',
                marketData: 'Ideal para trabajo remoto: 2+ escritorios'
            }
        ];

        return categories.map(category => {
            const scoreClass = this.getScoreCategory(category.score);
            return `
                <div class="scoring-category ${scoreClass}">
                    <div>
                        <div class="category-name">${category.name}</div>
                        <div class="category-weight">${category.description}</div>
                        <div class="category-weight">📐 Fórmula: ${category.formula}</div>
                        <div class="category-weight">📈 ${category.marketData}</div>
                    </div>
                    <div class="category-score">${category.score}/${category.weight}</div>
                </div>
            `;
        }).join('');
    }

    getScoreCategory(score) {
        if (score >= 80) return 'excellent';
        if (score >= 60) return 'good';
        if (score >= 40) return 'average';
        return 'poor';
    }

    async loadProperties() {
        try {
            console.log('Popup: Loading properties...');
            const response = await chrome.runtime.sendMessage({ action: 'getProperties' });
            console.log('Popup: Response from background:', response);
            
            // Only update if we actually have new data
            const newProperties = response.properties || [];
            if (JSON.stringify(this.properties) !== JSON.stringify(newProperties)) {
                this.properties = newProperties;
                console.log('Popup: Properties updated, now have', this.properties.length, 'properties');
            } else {
                console.log('Popup: Properties unchanged, keeping current data');
            }
        } catch (error) {
            console.error('Popup: Error loading properties:', error);
            this.properties = [];
        }
    }

    async removeProperty(propertyId) {
        try {
            const response = await chrome.runtime.sendMessage({
                action: 'removeProperty',
                propertyId: propertyId
            });
            if (response && response.success) {
                this.properties = this.properties.filter(p => p.id !== propertyId);
                this.render();
            }
        } catch (error) {
            console.error('Error removing property:', error);
        }
    }

    setupPropertyButtonListeners() {
        // Add event listeners to all property action buttons
        document.querySelectorAll('.property-actions .btn').forEach(button => {
            button.addEventListener('click', (e) => {
                e.stopPropagation();
                
                if (button.classList.contains('btn-outline')) {
                    // Remove button
                    const propertyId = parseInt(button.getAttribute('data-property-id'));
                    this.removeProperty(propertyId);
                } else if (button.classList.contains('btn-primary')) {
                    // View button
                    const propertyUrl = button.getAttribute('data-property-url');
                    window.open(propertyUrl, '_blank');
                }
            });
        });

        // Add click listeners to individual property scores
        document.querySelectorAll('.property-score').forEach(scoreElement => {
            scoreElement.addEventListener('click', (e) => {
                e.stopPropagation();
                const propertyId = parseInt(scoreElement.closest('.property-card').getAttribute('data-id'));
                const property = this.properties.find(p => p.id === propertyId);
                if (property) {
                    this.showPropertyScoringBreakdown(property);
                }
            });
        });
    }

    showPropertyScoringBreakdown(property) {
        const modal = document.getElementById('scoringModal');
        const scoringDetails = document.getElementById('scoringDetails');
        
        // Calculate individual property scores
        const scores = this.calculatePropertyScores(property);
        
        // Populate scoring details for this specific property
        scoringDetails.innerHTML = this.generatePropertyScoringDetails(property, scores);
        
        // Update modal title
        document.querySelector('.modal-header h2').textContent = `📊 Score: ${property.score}/100`;
        
        // Show modal
        modal.style.display = 'block';
    }

    calculatePropertyScores(property) {
        const scores = {};

        // Price scoring (25% weight)
        if (property.price) {
            scores.price = Math.max(0, 25 - (property.price - 600) / 6);
        } else {
            scores.price = 0;
        }

        // Size scoring (20% weight)
        if (property.squareMeters) {
            scores.size = Math.min(20, (property.squareMeters - 50) / 2);
        } else {
            scores.size = 0;
        }

        // Rooms scoring (15% weight)
        if (property.rooms) {
            scores.rooms = Math.min(15, property.rooms * 5);
        } else {
            scores.rooms = 0;
        }

        // Bathrooms scoring (10% weight)
        if (property.bathrooms) {
            scores.bathrooms = Math.min(10, property.bathrooms * 5);
        } else {
            scores.bathrooms = 0;
        }

        // Features scoring (15% weight) - Adjusted for remote work priorities
        let featuresScore = 0;
        if (property.heating) featuresScore += 5; // Essential for comfort
        if (property.furnished) featuresScore += 3; // Convenience
        if (!property.seasonal) featuresScore += 5; // Prefer long-term rentals
        
        // Elevator logic - penalty for no elevator unless it's ground floor
        if (property.elevator) {
            featuresScore += 2; // Bonus for having elevator
        } else if (property.floor && property.floor !== '0' && property.floor !== 'Bajo' && property.floor !== 'bajo') {
            featuresScore -= 3; // Penalty for no elevator when not ground floor
        }
        // No penalty for ground floor (floor 0, Bajo) without elevator
        
        scores.features = featuresScore;

        // Price per m² scoring (10% weight)
        if (property.pricePerM2) {
            scores.pricePerM2 = Math.max(0, 10 - (property.pricePerM2 - 8) / 0.5);
        } else {
            scores.pricePerM2 = 0;
        }

        // Orientation scoring (7% weight) - East is best (sunrise), then South, West, North
        if (property.orientation) {
            const orientation = property.orientation.toLowerCase();
            let orientationScore = 0;
            
            if (orientation.includes('este') || orientation.includes('east')) {
                orientationScore = 7; // Best case - sunrise
            } else if (orientation.includes('sur') || orientation.includes('south')) {
                orientationScore = 6; // Good - full sun exposure
            } else if (orientation.includes('oeste') || orientation.includes('west')) {
                orientationScore = 4; // Moderate - afternoon sun
            } else if (orientation.includes('norte') || orientation.includes('north')) {
                orientationScore = 3; // Lower - limited sun exposure
            } else {
                orientationScore = 2; // Unknown orientation
            }
            
            scores.orientation = orientationScore;
        } else {
            scores.orientation = 0;
        }

        // Desk scoring (8% weight) - Critical for remote work
        if (property.desk) {
            const deskScore = Math.min(8, property.desk * 4); // 1 desk = 4 points, 2+ desks = 8 points
            scores.desk = deskScore;
        } else {
            scores.desk = 0;
        }

        return scores;
    }

    generatePropertyScoringDetails(property, scores) {
        const categories = [
            {
                name: '💰 Precio (25% peso)',
                score: Math.round(scores.price),
                weight: 25,
                value: property.price ? `${property.price}€` : 'N/A',
                description: 'Precio mensual del alquiler',
                formula: property.price ? `25 - (${property.price}€ - 600€) / 6 = ${Math.round(scores.price)}` : 'Sin datos'
            },
            {
                name: '📏 Tamaño (20% peso)',
                score: Math.round(scores.size),
                weight: 20,
                value: property.squareMeters ? `${property.squareMeters}m²` : 'N/A',
                description: 'Metros cuadrados de la propiedad',
                formula: property.squareMeters ? `(${property.squareMeters}m² - 50) / 2 = ${Math.round(scores.size)}` : 'Sin datos'
            },
            {
                name: '🛏️ Habitaciones (15% peso)',
                score: Math.round(scores.rooms),
                weight: 15,
                value: property.rooms ? `${property.rooms} hab.` : 'N/A',
                description: 'Número de habitaciones',
                formula: property.rooms ? `${property.rooms} × 5 = ${Math.round(scores.rooms)}` : 'Sin datos'
            },
            {
                name: '🚿 Baños (10% peso)',
                score: Math.round(scores.bathrooms),
                weight: 10,
                value: property.bathrooms ? `${property.bathrooms} baño(s)` : 'N/A',
                description: 'Número de baños',
                formula: property.bathrooms ? `${property.bathrooms} × 5 = ${Math.round(scores.bathrooms)}` : 'Sin datos'
            },
            {
                name: '🏠 Características (15% peso)',
                score: Math.round(scores.features),
                weight: 15,
                value: this.getFeaturesList(property),
                description: 'Características disponibles',
                formula: this.getFeaturesFormula(property)
            },
            {
                name: '📊 Precio/m² (10% peso)',
                score: Math.round(scores.pricePerM2),
                weight: 10,
                value: property.pricePerM2 ? `${property.pricePerM2}€/m²` : 'N/A',
                description: 'Precio por metro cuadrado',
                formula: property.pricePerM2 ? `10 - (${property.pricePerM2}€/m² - 8€/m²) / 0.5 = ${Math.round(scores.pricePerM2)}` : 'Sin datos'
            },
            {
                name: '🌅 Orientación (7% peso)',
                score: Math.round(scores.orientation),
                weight: 7,
                value: property.orientation || 'N/A',
                description: 'Orientación de la propiedad',
                formula: this.getOrientationFormula(property.orientation, scores.orientation)
            },
            {
                name: '💼 Escritorios (8% peso)',
                score: Math.round(scores.desk),
                weight: 8,
                value: property.desk ? `${property.desk} escritorio${property.desk > 1 ? 's' : ''}` : 'N/A',
                description: 'Escritorios para trabajo remoto',
                formula: this.getDeskFormula(property.desk, scores.desk)
            }
        ];

        return categories.map(category => {
            const scoreClass = this.getScoreCategory(category.score);
            return `
                <div class="scoring-category ${scoreClass}">
                    <div>
                        <div class="category-name">${category.name}</div>
                        <div class="category-weight">${category.description}: ${category.value}</div>
                        <div class="category-weight">📐 ${category.formula}</div>
                    </div>
                    <div class="category-score">${category.score}/${category.weight}</div>
                </div>
            `;
        }).join('');
    }

    getFeaturesList(property) {
        const features = [];
        if (property.heating) features.push('Calefacción');
        if (property.furnished) features.push('Amueblado');
        if (property.elevator) features.push('Ascensor');
        if (!property.seasonal) features.push('Largo plazo');
        return features.length > 0 ? features.join(', ') : 'Ninguna';
    }

    getFeaturesFormula(property) {
        const parts = [];
        if (property.heating) parts.push('+5 (calefacción)');
        if (property.furnished) parts.push('+3 (amueblado)');
        if (!property.seasonal) parts.push('+5 (largo plazo)');
        
        // Elevator logic
        if (property.elevator) {
            parts.push('+2 (ascensor)');
        } else if (property.floor && property.floor !== '0' && property.floor !== 'Bajo' && property.floor !== 'bajo') {
            parts.push('-3 (sin ascensor, no es bajo)');
        } else {
            parts.push('+0 (sin ascensor, pero es bajo)');
        }
        
        return parts.length > 0 ? parts.join(' + ') : '0 puntos';
    }

    getOrientationFormula(orientation, score) {
        if (!orientation) return 'Sin datos';
        
        const orientationText = orientation.toLowerCase();
        if (orientationText.includes('este') || orientationText.includes('east')) {
            return '+7 (Este - amanecer)';
        } else if (orientationText.includes('sur') || orientationText.includes('south')) {
            return '+6 (Sur - sol completo)';
        } else if (orientationText.includes('oeste') || orientationText.includes('west')) {
            return '+4 (Oeste - sol tarde)';
        } else if (orientationText.includes('norte') || orientationText.includes('north')) {
            return '+3 (Norte - sol limitado)';
        } else {
            return '+2 (Orientación desconocida)';
        }
    }

    getDeskFormula(desk, score) {
        if (!desk) return 'Sin datos';
        
        if (desk >= 2) {
            return '+8 (2+ escritorios - ideal para trabajo remoto)';
        } else if (desk === 1) {
            return '+4 (1 escritorio)';
        } else {
            return '0 puntos (sin escritorios)';
        }
    }

    showBestProperty() {
        if (this.properties.length === 0) {
            this.showTemporaryMessage('No hay propiedades para analizar', 'warning');
            return;
        }

        this.showBestPropertyModal();
    }

    showBestPropertyModal() {
        const bestProperty = this.properties[0];
        const reasons = this.getPropertyAdvantages(bestProperty);
        const maxBudget = 750;

        // Create modal overlay
        const modalOverlay = document.createElement('div');
        modalOverlay.className = 'modal-overlay';
        modalOverlay.id = 'bestPropertyModal';
        
        // Calculate financial info
        let financialInfo = '';
        let financialClass = '';
        if (bestProperty.price && bestProperty.price < maxBudget) {
            const monthlySavings = maxBudget - bestProperty.price;
            const annualSavings = monthlySavings * 12;
            financialInfo = `
                <div class="financial-info savings">
                    <h4>💵 AHORRO FINANCIERO</h4>
                    <div class="financial-details">
                        <div class="financial-item">
                            <span class="label">Ahorro mensual:</span>
                            <span class="value">${monthlySavings.toLocaleString('es-ES')}€</span>
                        </div>
                        <div class="financial-item">
                            <span class="label">Ahorro anual:</span>
                            <span class="value">${annualSavings.toLocaleString('es-ES')}€</span>
                        </div>
                        <div class="financial-item">
                            <span class="label">Presupuesto máximo:</span>
                            <span class="value">${maxBudget.toLocaleString('es-ES')}€</span>
                        </div>
                    </div>
                </div>
            `;
            financialClass = 'savings';
        } else if (bestProperty.price && bestProperty.price > maxBudget) {
            const monthlyOverspend = bestProperty.price - maxBudget;
            const annualOverspend = monthlyOverspend * 12;
            financialInfo = `
                <div class="financial-info overspend">
                    <h4>⚠️ SOBREPRESUPUESTO</h4>
                    <div class="financial-details">
                        <div class="financial-item">
                            <span class="label">Exceso mensual:</span>
                            <span class="value">${monthlyOverspend.toLocaleString('es-ES')}€</span>
                        </div>
                        <div class="financial-item">
                            <span class="label">Exceso anual:</span>
                            <span class="value">${annualOverspend.toLocaleString('es-ES')}€</span>
                        </div>
                        <div class="financial-item">
                            <span class="label">Presupuesto máximo:</span>
                            <span class="value">${maxBudget.toLocaleString('es-ES')}€</span>
                        </div>
                    </div>
                </div>
            `;
            financialClass = 'overspend';
        }

        // Generate location info
        let locationInfo = '';
        if (bestProperty.coordinates) {
            const lat = bestProperty.coordinates.lat;
            const lng = bestProperty.coordinates.lng;
            const latDeg = Math.abs(lat);
            const lngDeg = Math.abs(lng);
            const latMin = (latDeg - Math.floor(latDeg)) * 60;
            const lngMin = (lngDeg - Math.floor(lngDeg)) * 60;
            const latSec = (latMin - Math.floor(latMin)) * 60;
            const lngSec = (lngMin - Math.floor(lngMin)) * 60;
            
            const latDir = lat >= 0 ? 'N' : 'S';
            const lngDir = lng >= 0 ? 'E' : 'W';
            
            const latFormatted = `${Math.floor(latDeg)}°${Math.floor(latMin)}'${latSec.toFixed(1)}"${latDir}`;
            const lngFormatted = `${Math.floor(lngDeg)}°${Math.floor(lngMin)}'${lngSec.toFixed(1)}"${lngDir}`;
            
            const googleMapsUrl = `https://www.google.com/maps/place/${latFormatted}+${lngFormatted}/`;
            
            locationInfo = `
                <div class="location-info">
                    <h4>📍 UBICACIÓN</h4>
                    <div class="location-details">
                        <div class="location-item">
                            <span class="label">Coordenadas:</span>
                            <span class="value">${lat.toFixed(6)}, ${lng.toFixed(6)}</span>
                        </div>
                        <div class="location-item">
                            <span class="label">Formato DMS:</span>
                            <span class="value">${latFormatted}, ${lngFormatted}</span>
                        </div>
                        <a href="${googleMapsUrl}" target="_blank" class="maps-link">🗺️ Ver en Google Maps</a>
                    </div>
                </div>
            `;
        }

        // Generate comparison info
        let comparisonInfo = '';
        if (this.properties.length > 1) {
            const secondBest = this.properties[1];
            const scoreDiff = bestProperty.score - secondBest.score;
            comparisonInfo = `
                <div class="comparison-info">
                    <h4>📈 COMPARACIÓN</h4>
                    <div class="comparison-details">
                        <div class="comparison-item">
                            <span class="label">Diferencia con segunda opción:</span>
                            <span class="value">${scoreDiff} puntos</span>
                        </div>
                        <div class="comparison-item">
                            <span class="label">Total de propiedades:</span>
                            <span class="value">${this.properties.length}</span>
                        </div>
                    </div>
                </div>
            `;
        }

        // Create modal content
        const modalContent = document.createElement('div');
        modalContent.className = 'modal-content best-property-modal';
        
        modalContent.innerHTML = `
            <div class="modal-header">
                <h3>🏆 MEJOR PROPIEDAD</h3>
                <button class="close-btn" id="closeBestPropertyModal">×</button>
            </div>
            <div class="modal-body">
                <div class="property-compact-header">
                    <div class="property-main-compact">
                        <div class="property-score-compact">
                            <span class="score-value-compact">${bestProperty.score}</span>
                            <span class="score-max-compact">/100</span>
                        </div>
                        <div class="property-price-compact">${bestProperty.price}€</div>
                        <a href="${bestProperty.url}" target="_blank" class="property-link-compact">🔗</a>
                    </div>
                    <div class="property-specs-compact">
                        <span class="spec-compact">📏${bestProperty.squareMeters}m²</span>
                        <span class="spec-compact">🛏️${bestProperty.rooms}hab</span>
                        <span class="spec-compact">🚿${bestProperty.bathrooms}baño</span>
                        ${bestProperty.desk ? `<span class="spec-compact">💼${bestProperty.desk}esc</span>` : ''}
                        ${bestProperty.heating ? '<span class="spec-compact">🔥</span>' : ''}
                        ${bestProperty.furnished ? '<span class="spec-compact">🪑</span>' : ''}
                        ${bestProperty.elevator ? '<span class="spec-compact">🛗</span>' : ''}
                    </div>
                </div>

                <div class="info-grid">
                    ${financialInfo ? `
                        <div class="info-card financial-card">
                            <div class="card-header">${bestProperty.price < maxBudget ? '💵' : '⚠️'} ${bestProperty.price < maxBudget ? 'AHORRO' : 'SOBREPRESUPUESTO'}</div>
                            <div class="card-content">
                                ${bestProperty.price < maxBudget ? 
                                    `<div class="financial-item-compact">
                                        <span class="label-compact">Ahorro:</span>
                                        <span class="value-compact">${(maxBudget - bestProperty.price).toLocaleString('es-ES')}€/mes</span>
                                    </div>
                                    <div class="financial-item-compact">
                                        <span class="label-compact">Anual:</span>
                                        <span class="value-compact">${((maxBudget - bestProperty.price) * 12).toLocaleString('es-ES')}€</span>
                                    </div>` :
                                    `<div class="financial-item-compact">
                                        <span class="label-compact">Exceso:</span>
                                        <span class="value-compact">${(bestProperty.price - maxBudget).toLocaleString('es-ES')}€/mes</span>
                                    </div>
                                    <div class="financial-item-compact">
                                        <span class="label-compact">Anual:</span>
                                        <span class="value-compact">${((bestProperty.price - maxBudget) * 12).toLocaleString('es-ES')}€</span>
                                    </div>`
                                }
                            </div>
                        </div>
                    ` : ''}

                    ${locationInfo ? `
                        <div class="info-card location-card">
                            <div class="card-header">📍 UBICACIÓN</div>
                            <div class="card-content">
                                <div class="location-item-compact">
                                    <span class="label-compact">Coords:</span>
                                    <span class="value-compact">${bestProperty.coordinates.lat.toFixed(4)}, ${bestProperty.coordinates.lng.toFixed(4)}</span>
                                </div>
                                <a href="https://www.google.com/maps/place/${bestProperty.coordinates.lat.toFixed(6)}+${bestProperty.coordinates.lng.toFixed(6)}/" target="_blank" class="maps-link-compact">🗺️ Maps</a>
                            </div>
                        </div>
                    ` : ''}

                    <div class="info-card advantages-card">
                        <div class="card-header">🎯 VENTAJAS</div>
                        <div class="card-content">
                            <div class="advantages-grid">
                                ${reasons.slice(0, 6).map(reason => `<div class="advantage-compact">• ${reason}</div>`).join('')}
                                ${reasons.length > 6 ? `<div class="advantage-compact">... y ${reasons.length - 6} más</div>` : ''}
                            </div>
                        </div>
                    </div>

                    ${comparisonInfo ? `
                        <div class="info-card comparison-card">
                            <div class="card-header">📈 COMPARACIÓN</div>
                            <div class="card-content">
                                <div class="comparison-item-compact">
                                    <span class="label-compact">Diferencia:</span>
                                    <span class="value-compact">${bestProperty.score - this.properties[1].score} pts</span>
                                </div>
                                <div class="comparison-item-compact">
                                    <span class="label-compact">Total:</span>
                                    <span class="value-compact">${this.properties.length} props</span>
                                </div>
                            </div>
                        </div>
                    ` : ''}
                </div>
            </div>
            <div class="modal-actions">
                <button class="btn btn-primary" id="closeBestPropertyBtn">Cerrar</button>
            </div>
        `;
        
        modalOverlay.appendChild(modalContent);
        document.body.appendChild(modalOverlay);
        
        // Add event listeners
        document.getElementById('closeBestPropertyModal').addEventListener('click', () => {
            this.hideBestPropertyModal();
        });
        
        document.getElementById('closeBestPropertyBtn').addEventListener('click', () => {
            this.hideBestPropertyModal();
        });
        
        // Close modal when clicking overlay
        modalOverlay.addEventListener('click', (e) => {
            if (e.target === modalOverlay) {
                this.hideBestPropertyModal();
            }
        });
        
        // Show modal with animation
        setTimeout(() => {
            modalOverlay.classList.add('show');
        }, 10);
    }

    hideBestPropertyModal() {
        const modal = document.getElementById('bestPropertyModal');
        if (modal) {
            modal.classList.remove('show');
            setTimeout(() => {
                if (modal.parentNode) {
                    modal.parentNode.removeChild(modal);
                }
            }, 300);
        }
    }

    showPropertiesMetrics() {
        if (this.properties.length === 0) {
            this.showTemporaryMessage('No hay propiedades para analizar', 'warning');
            return;
        }

        this.showPropertiesMetricsModal();
    }

    showPropertiesMetricsModal() {
        // Calculate comprehensive metrics
        const metrics = this.calculatePropertiesMetrics();

        // Create modal overlay
        const modalOverlay = document.createElement('div');
        modalOverlay.className = 'modal-overlay';
        modalOverlay.id = 'propertiesMetricsModal';
        
        // Create modal content
        const modalContent = document.createElement('div');
        modalContent.className = 'modal-content metrics-modal';
        
        modalContent.innerHTML = `
            <div class="modal-header">
                <h3>📊 MÉTRICAS DEL CONJUNTO</h3>
                <button class="close-btn" id="closeMetricsModal">×</button>
            </div>
            <div class="modal-body">
                <div class="metrics-overview">
                    <div class="metric-card primary">
                        <div class="metric-value">${metrics.totalProperties}</div>
                        <div class="metric-label">Propiedades</div>
                    </div>
                    <div class="metric-card">
                        <div class="metric-value">${metrics.avgScore}</div>
                        <div class="metric-label">Score Promedio</div>
                    </div>
                    <div class="metric-card">
                        <div class="metric-value">${metrics.avgPrice}€</div>
                        <div class="metric-label">Precio Promedio</div>
                    </div>
                    <div class="metric-card">
                        <div class="metric-value">${metrics.avgSize}m²</div>
                        <div class="metric-label">Tamaño Promedio</div>
                    </div>
                </div>

                <div class="metrics-grid">
                    <div class="metrics-section">
                        <h4>💰 ANÁLISIS DE PRECIOS</h4>
                        <div class="metric-item">
                            <span class="label">Precio más bajo:</span>
                            <span class="value">${metrics.minPrice}€</span>
                        </div>
                        <div class="metric-item">
                            <span class="label">Precio más alto:</span>
                            <span class="value">${metrics.maxPrice}€</span>
                        </div>
                        <div class="metric-item">
                            <span class="label">Rango de precios:</span>
                            <span class="value">${metrics.priceRange}€</span>
                        </div>
                        <div class="metric-item">
                            <span class="label">Propiedades ≤ 600€:</span>
                            <span class="value">${metrics.propertiesUnder600} (${metrics.percentageUnder600}%)</span>
                        </div>
                        <div class="metric-item">
                            <span class="label">Propiedades ≤ 750€:</span>
                            <span class="value">${metrics.propertiesUnder750} (${metrics.percentageUnder750}%)</span>
                        </div>
                    </div>

                    <div class="metrics-section">
                        <h4>📏 ANÁLISIS DE TAMAÑOS</h4>
                        <div class="metric-item">
                            <span class="label">Tamaño más pequeño:</span>
                            <span class="value">${metrics.minSize}m²</span>
                        </div>
                        <div class="metric-item">
                            <span class="label">Tamaño más grande:</span>
                            <span class="value">${metrics.maxSize}m²</span>
                        </div>
                        <div class="metric-item">
                            <span class="label">Propiedades ≥ 60m²:</span>
                            <span class="value">${metrics.sizePropertiesOver60} (${metrics.percentageSizeOver60}%)</span>
                        </div>
                        <div class="metric-item">
                            <span class="label">Propiedades ≥ 70m²:</span>
                            <span class="value">${metrics.sizePropertiesOver70} (${metrics.percentageSizeOver70}%)</span>
                        </div>
                    </div>

                    <div class="metrics-section">
                        <h4>🏠 DISTRIBUCIÓN DE HABITACIONES</h4>
                        <div class="metric-item">
                            <span class="label">Promedio habitaciones:</span>
                            <span class="value">${metrics.avgRooms}</span>
                        </div>
                        <div class="metric-item">
                            <span class="label">Propiedades 1 hab:</span>
                            <span class="value">${metrics.oneBedroom} (${metrics.percentageOneBedroom}%)</span>
                        </div>
                        <div class="metric-item">
                            <span class="label">Propiedades 2 hab:</span>
                            <span class="value">${metrics.twoBedroom} (${metrics.percentageTwoBedroom}%)</span>
                        </div>
                        <div class="metric-item">
                            <span class="label">Propiedades 3+ hab:</span>
                            <span class="value">${metrics.threePlusBedroom} (${metrics.percentageThreePlusBedroom}%)</span>
                        </div>
                    </div>

                    <div class="metrics-section">
                        <h4>🚿 ANÁLISIS DE BAÑOS</h4>
                        <div class="metric-item">
                            <span class="label">Promedio baños:</span>
                            <span class="value">${metrics.avgBathrooms}</span>
                        </div>
                        <div class="metric-item">
                            <span class="label">1 baño:</span>
                            <span class="value">${metrics.oneBathroom} (${metrics.percentageOneBathroom}%)</span>
                        </div>
                        <div class="metric-item">
                            <span class="label">2+ baños:</span>
                            <span class="value">${metrics.twoPlusBathroom} (${metrics.percentageTwoPlusBathroom}%)</span>
                        </div>
                    </div>

                    <div class="metrics-section">
                        <h4>🎯 DISTRIBUCIÓN DE SCORES</h4>
                        <div class="metric-item">
                            <span class="label">Score más alto:</span>
                            <span class="value">${metrics.maxScore}</span>
                        </div>
                        <div class="metric-item">
                            <span class="label">Score más bajo:</span>
                            <span class="value">${metrics.minScore}</span>
                        </div>
                        <div class="metric-item">
                            <span class="label">Propiedades ≥ 80:</span>
                            <span class="value">${metrics.scorePropertiesOver80} (${metrics.percentageScoreOver80}%)</span>
                        </div>
                        <div class="metric-item">
                            <span class="label">Propiedades ≥ 70:</span>
                            <span class="value">${metrics.scorePropertiesOver70} (${metrics.percentageScoreOver70}%)</span>
                        </div>
                        <div class="metric-item">
                            <span class="label">Propiedades ≥ 60:</span>
                            <span class="value">${metrics.scorePropertiesOver60} (${metrics.percentageScoreOver60}%)</span>
                        </div>
                    </div>

                    <div class="metrics-section">
                        <h4>💼 CARACTERÍSTICAS ESPECIALES</h4>
                        <div class="metric-item">
                            <span class="label">Con calefacción:</span>
                            <span class="value">${metrics.withHeating} (${metrics.percentageHeating}%)</span>
                        </div>
                        <div class="metric-item">
                            <span class="label">Amuebladas:</span>
                            <span class="value">${metrics.furnished} (${metrics.percentageFurnished}%)</span>
                        </div>
                        <div class="metric-item">
                            <span class="label">Con ascensor:</span>
                            <span class="value">${metrics.withElevator} (${metrics.percentageElevator}%)</span>
                        </div>
                        <div class="metric-item">
                            <span class="label">Con escritorios:</span>
                            <span class="value">${metrics.withDesk} (${metrics.percentageDesk}%)</span>
                        </div>
                        <div class="metric-item">
                            <span class="label">Temporada:</span>
                            <span class="value">${metrics.seasonal} (${metrics.percentageSeasonal}%)</span>
                        </div>
                    </div>
                </div>
            </div>
            <div class="modal-actions">
                <button class="btn btn-primary" id="closeMetricsBtn">Cerrar</button>
            </div>
        `;
        
        modalOverlay.appendChild(modalContent);
        document.body.appendChild(modalOverlay);
        
        // Add event listeners
        document.getElementById('closeMetricsModal').addEventListener('click', () => {
            this.hidePropertiesMetricsModal();
        });
        
        document.getElementById('closeMetricsBtn').addEventListener('click', () => {
            this.hidePropertiesMetricsModal();
        });
        
        // Close modal when clicking overlay
        modalOverlay.addEventListener('click', (e) => {
            if (e.target === modalOverlay) {
                this.hidePropertiesMetricsModal();
            }
        });
        
        // Show modal with animation
        setTimeout(() => {
            modalOverlay.classList.add('show');
        }, 10);
    }

    calculatePropertiesMetrics() {
        const properties = this.properties;
        const totalProperties = properties.length;

        // Basic metrics
        const prices = properties.map(p => p.price).filter(p => p !== null && p !== undefined);
        const sizes = properties.map(p => p.squareMeters).filter(s => s !== null && s !== undefined);
        const scores = properties.map(p => p.score).filter(s => s !== null && s !== undefined);
        const rooms = properties.map(p => p.rooms).filter(r => r !== null && r !== undefined);
        const bathrooms = properties.map(p => p.bathrooms).filter(b => b !== null && b !== undefined);

        // Price metrics
        const avgPrice = prices.length > 0 ? Math.round(prices.reduce((a, b) => a + b, 0) / prices.length) : 0;
        const minPrice = prices.length > 0 ? Math.min(...prices) : 0;
        const maxPrice = prices.length > 0 ? Math.max(...prices) : 0;
        const priceRange = maxPrice - minPrice;
        const propertiesUnder600 = prices.filter(p => p <= 600).length;
        const propertiesUnder750 = prices.filter(p => p <= 750).length;
        const percentageUnder600 = totalProperties > 0 ? Math.round((propertiesUnder600 / totalProperties) * 100) : 0;
        const percentageUnder750 = totalProperties > 0 ? Math.round((propertiesUnder750 / totalProperties) * 100) : 0;

        // Size metrics
        const avgSize = sizes.length > 0 ? Math.round(sizes.reduce((a, b) => a + b, 0) / sizes.length) : 0;
        const minSize = sizes.length > 0 ? Math.min(...sizes) : 0;
        const maxSize = sizes.length > 0 ? Math.max(...sizes) : 0;
        const sizePropertiesOver60 = sizes.filter(s => s >= 60).length;
        const sizePropertiesOver70 = sizes.filter(s => s >= 70).length;
        const percentageSizeOver60 = totalProperties > 0 ? Math.round((sizePropertiesOver60 / totalProperties) * 100) : 0;
        const percentageSizeOver70 = totalProperties > 0 ? Math.round((sizePropertiesOver70 / totalProperties) * 100) : 0;

        // Score metrics
        const avgScore = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;
        const minScore = scores.length > 0 ? Math.min(...scores) : 0;
        const maxScore = scores.length > 0 ? Math.max(...scores) : 0;
        const scorePropertiesOver80 = scores.filter(s => s >= 80).length;
        const scorePropertiesOver70 = scores.filter(s => s >= 70).length;
        const scorePropertiesOver60 = scores.filter(s => s >= 60).length;
        const percentageScoreOver80 = totalProperties > 0 ? Math.round((scorePropertiesOver80 / totalProperties) * 100) : 0;
        const percentageScoreOver70 = totalProperties > 0 ? Math.round((scorePropertiesOver70 / totalProperties) * 100) : 0;
        const percentageScoreOver60 = totalProperties > 0 ? Math.round((scorePropertiesOver60 / totalProperties) * 100) : 0;

        // Room metrics
        const avgRooms = rooms.length > 0 ? Math.round((rooms.reduce((a, b) => a + b, 0) / rooms.length) * 10) / 10 : 0;
        const oneBedroom = rooms.filter(r => r === 1).length;
        const twoBedroom = rooms.filter(r => r === 2).length;
        const threePlusBedroom = rooms.filter(r => r >= 3).length;
        const percentageOneBedroom = totalProperties > 0 ? Math.round((oneBedroom / totalProperties) * 100) : 0;
        const percentageTwoBedroom = totalProperties > 0 ? Math.round((twoBedroom / totalProperties) * 100) : 0;
        const percentageThreePlusBedroom = totalProperties > 0 ? Math.round((threePlusBedroom / totalProperties) * 100) : 0;

        // Bathroom metrics
        const avgBathrooms = bathrooms.length > 0 ? Math.round((bathrooms.reduce((a, b) => a + b, 0) / bathrooms.length) * 10) / 10 : 0;
        const oneBathroom = bathrooms.filter(b => b === 1).length;
        const twoPlusBathroom = bathrooms.filter(b => b >= 2).length;
        const percentageOneBathroom = totalProperties > 0 ? Math.round((oneBathroom / totalProperties) * 100) : 0;
        const percentageTwoPlusBathroom = totalProperties > 0 ? Math.round((twoPlusBathroom / totalProperties) * 100) : 0;

        // Feature metrics
        const withHeating = properties.filter(p => p.heating).length;
        const furnished = properties.filter(p => p.furnished).length;
        const withElevator = properties.filter(p => p.elevator).length;
        const withDesk = properties.filter(p => p.desk && p.desk > 0).length;
        const seasonal = properties.filter(p => p.seasonal).length;
        const percentageHeating = totalProperties > 0 ? Math.round((withHeating / totalProperties) * 100) : 0;
        const percentageFurnished = totalProperties > 0 ? Math.round((furnished / totalProperties) * 100) : 0;
        const percentageElevator = totalProperties > 0 ? Math.round((withElevator / totalProperties) * 100) : 0;
        const percentageDesk = totalProperties > 0 ? Math.round((withDesk / totalProperties) * 100) : 0;
        const percentageSeasonal = totalProperties > 0 ? Math.round((seasonal / totalProperties) * 100) : 0;

        return {
            totalProperties,
            avgScore,
            avgPrice,
            avgSize,
            minPrice,
            maxPrice,
            priceRange,
            propertiesUnder600,
            propertiesUnder750,
            percentageUnder600,
            percentageUnder750,
            minSize,
            maxSize,
            sizePropertiesOver60,
            sizePropertiesOver70,
            percentageSizeOver60,
            percentageSizeOver70,
            minScore,
            maxScore,
            scorePropertiesOver80,
            scorePropertiesOver70,
            scorePropertiesOver60,
            percentageScoreOver80,
            percentageScoreOver70,
            percentageScoreOver60,
            avgRooms,
            oneBedroom,
            twoBedroom,
            threePlusBedroom,
            percentageOneBedroom,
            percentageTwoBedroom,
            percentageThreePlusBedroom,
            avgBathrooms,
            oneBathroom,
            twoPlusBathroom,
            percentageOneBathroom,
            percentageTwoPlusBathroom,
            withHeating,
            furnished,
            withElevator,
            withDesk,
            seasonal,
            percentageHeating,
            percentageFurnished,
            percentageElevator,
            percentageDesk,
            percentageSeasonal
        };
    }

    hidePropertiesMetricsModal() {
        const modal = document.getElementById('propertiesMetricsModal');
        if (modal) {
            modal.classList.remove('show');
            setTimeout(() => {
                if (modal.parentNode) {
                    modal.parentNode.removeChild(modal);
                }
            }, 300);
        }
    }

    disableStatsBarButtons() {
        const totalProperties = document.getElementById('totalProperties');
        const avgScore = document.getElementById('avgScore');
        const bestPrice = document.getElementById('bestPrice');
        
        if (totalProperties) {
            totalProperties.style.pointerEvents = 'none';
            totalProperties.style.opacity = '0.5';
            totalProperties.style.cursor = 'not-allowed';
            totalProperties.title = 'No hay propiedades para analizar';
        }
        
        if (avgScore) {
            avgScore.style.pointerEvents = 'none';
            avgScore.style.opacity = '0.5';
            avgScore.style.cursor = 'not-allowed';
            avgScore.title = 'No hay propiedades para analizar';
        }
        
        if (bestPrice) {
            bestPrice.style.pointerEvents = 'none';
            bestPrice.style.opacity = '0.5';
            bestPrice.style.cursor = 'not-allowed';
            bestPrice.title = 'No hay propiedades para analizar';
        }
    }

    enableStatsBarButtons() {
        const totalProperties = document.getElementById('totalProperties');
        const avgScore = document.getElementById('avgScore');
        const bestPrice = document.getElementById('bestPrice');
        
        if (totalProperties) {
            totalProperties.style.pointerEvents = 'auto';
            totalProperties.style.opacity = '1';
            totalProperties.style.cursor = 'pointer';
            totalProperties.title = 'Haz clic para ver métricas del conjunto';
        }
        
        if (avgScore) {
            avgScore.style.pointerEvents = 'auto';
            avgScore.style.opacity = '1';
            avgScore.style.cursor = 'pointer';
            avgScore.title = 'Haz clic para ver el cálculo del score';
        }
        
        if (bestPrice) {
            bestPrice.style.pointerEvents = 'auto';
            bestPrice.style.opacity = '1';
            bestPrice.style.cursor = 'pointer';
            bestPrice.title = 'Haz clic para ver detalles de la mejor propiedad';
        }
    }

    getPropertyAdvantages(property) {
        const reasons = [];
        const maxBudget = 750;
        
        // Price advantages with savings calculation
        if (property.price && property.price <= 700) {
            const monthlySavings = maxBudget - property.price;
            const annualSavings = monthlySavings * 12;
            reasons.push(`Precio excelente: ${property.price}€ (ahorro ${monthlySavings}€/mes, ${annualSavings}€/año)`);
        } else if (property.price && property.price <= 750) {
            const monthlySavings = maxBudget - property.price;
            const annualSavings = monthlySavings * 12;
            reasons.push(`Precio bueno: ${property.price}€ (ahorro ${monthlySavings}€/mes, ${annualSavings}€/año)`);
        } else if (property.price && property.price > 750) {
            const monthlyOverspend = property.price - maxBudget;
            const annualOverspend = monthlyOverspend * 12;
            reasons.push(`Precio alto: ${property.price}€ (exceso ${monthlyOverspend}€/mes, ${annualOverspend}€/año)`);
        }
        
        // Size advantages
        if (property.squareMeters && property.squareMeters >= 70) {
            reasons.push(`Tamaño grande: ${property.squareMeters}m² (≥70m²)`);
        } else if (property.squareMeters && property.squareMeters >= 60) {
            reasons.push(`Tamaño adecuado: ${property.squareMeters}m² (≥60m²)`);
        }
        
        // Rooms advantages
        if (property.rooms && property.rooms >= 3) {
            reasons.push(`Múltiples habitaciones: ${property.rooms} hab.`);
        } else if (property.rooms && property.rooms >= 2) {
            reasons.push(`Habitaciones suficientes: ${property.rooms} hab.`);
        }
        
        // Features advantages
        if (property.heating) reasons.push('Incluye calefacción');
        if (property.furnished) reasons.push('Está amueblado');
        if (!property.seasonal) reasons.push('Alquiler a largo plazo');
        
        // Elevator logic
        if (property.elevator) {
            reasons.push('Tiene ascensor');
        } else if (property.floor && property.floor !== '0' && property.floor !== 'Bajo' && property.floor !== 'bajo') {
            reasons.push('Sin ascensor (desventaja)');
        } else {
            reasons.push('Sin ascensor (pero es bajo, no es problema)');
        }
        
        // Desk advantages
        if (property.desk && property.desk >= 2) {
            reasons.push(`Ideal para trabajo remoto: ${property.desk} escritorios`);
        } else if (property.desk && property.desk === 1) {
            reasons.push(`Adecuado para trabajo remoto: ${property.desk} escritorio`);
        }
        
        // Price per m² advantages
        if (property.pricePerM2 && property.pricePerM2 <= 10) {
            reasons.push(`Excelente precio/m²: ${property.pricePerM2}€/m²`);
        } else if (property.pricePerM2 && property.pricePerM2 <= 12) {
            reasons.push(`Buen precio/m²: ${property.pricePerM2}€/m²`);
        }
        
        // Orientation advantages
        if (property.orientation) {
            const orientation = property.orientation.toLowerCase();
            if (orientation.includes('este') || orientation.includes('east')) {
                reasons.push('Orientación Este (amanecer) - excelente');
            } else if (orientation.includes('sur') || orientation.includes('south')) {
                reasons.push('Orientación Sur (sol completo) - muy buena');
            } else if (orientation.includes('oeste') || orientation.includes('west')) {
                reasons.push('Orientación Oeste (sol tarde) - buena');
            } else if (orientation.includes('norte') || orientation.includes('north')) {
                reasons.push('Orientación Norte (sol limitado) - aceptable');
            }
        }
        
        return reasons;
    }

    importData() {
        // Create file input element
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.accept = '.tsv,.txt,.csv';
        fileInput.style.display = 'none';
        
        fileInput.addEventListener('change', async (event) => {
            const file = event.target.files[0];
            if (!file) return;
            
            try {
                const text = await file.text();
                const lines = text.split('\n').filter(line => line.trim());
                
                if (lines.length < 2) {
                    this.showTemporaryMessage('Archivo vacío o formato inválido', 'error');
                    return;
                }
                
                // Parse TSV/CSV
                const headers = lines[0].split('\t');
                const dataLines = lines.slice(1);
                
                const importedProperties = [];
                let successCount = 0;
                let errorCount = 0;
                
                dataLines.forEach((line, index) => {
                    try {
                        const values = line.split('\t');
                        if (values.length < headers.length) return;
                        
                        // Map values to property object based on new TSV structure
                        const property = {
                            url: values[2] || '', // URL
                            price: values[3] ? parseFloat(values[3]) : null, // Precio_€
                            squareMeters: values[4] ? parseInt(values[4]) : null, // Metros_Cuadrados
                            rooms: values[5] ? parseInt(values[5]) : null, // Habitaciones
                            bathrooms: values[6] ? parseInt(values[6]) : null, // Baños
                            floor: values[7] || null, // Planta
                            orientation: values[8] || null, // Orientación
                            furnished: values[9] === 'Sí', // Amueblado
                            heating: values[10] === 'Sí', // Calefacción
                            elevator: values[11] === 'Sí', // Ascensor
                            seasonal: values[12] === 'Sí', // Temporada
                            desk: values[13] ? parseInt(values[13]) : null, // Escritorios
                            professional: values[14] || null, // Profesional
                            // Phone field removed
                            pricePerM2: values[15] ? parseFloat(values[15]) : null, // Precio_por_m2_€
                            deposit: values[16] || null, // Fianza
                            energyCert: values[17] || null, // Certificado_Energético
                            lastUpdated: values[18] || null, // Última_Actualización
                            monthsMentioned: values[19] ? values[19].split(', ') : [], // Meses_Mencionados
                            score: values[1] ? parseInt(values[1]) : null, // Score
                            id: Date.now() + index, // Generate new ID
                            addedAt: new Date().toISOString()
                        };
                        
                        // Parse coordinates if available (separate lat/lng columns)
                        const lat = values[20] ? parseFloat(values[20]) : null; // Coordenadas_Latitud
                        const lng = values[21] ? parseFloat(values[21]) : null; // Coordenadas_Longitud
                        if (lat && lng && !isNaN(lat) && !isNaN(lng)) {
                            property.coordinates = { lat, lng };
                        }
                        
                        if (property.url && property.price) {
                            importedProperties.push(property);
                            successCount++;
                        } else {
                            errorCount++;
                        }
                    } catch (error) {
                        console.error('Error parsing line:', line, error);
                        errorCount++;
                    }
                });
                
                if (importedProperties.length === 0) {
                    this.showTemporaryMessage('No se encontraron propiedades válidas para importar', 'error');
                    return;
                }
                
                // Send to background script
                const response = await chrome.runtime.sendMessage({
                    action: 'importProperties',
                    properties: importedProperties
                });
                
                if (response && response.success) {
                    // Update local properties
                    this.properties = response.properties;
                    this.render();
                    
                    this.showTemporaryMessage(
                        `✅ Importadas ${successCount} propiedades${errorCount > 0 ? ` (${errorCount} errores)` : ''}`,
                        'success'
                    );
                } else {
                    this.showTemporaryMessage('Error al importar las propiedades', 'error');
                }
                
            } catch (error) {
                console.error('Error importing file:', error);
                this.showTemporaryMessage('Error al leer el archivo', 'error');
            }
            
            // Clean up
            document.body.removeChild(fileInput);
        });
        
        // Trigger file selection
        document.body.appendChild(fileInput);
        fileInput.click();
    }

    async updateScores() {
        if (this.properties.length === 0) {
            this.showTemporaryMessage('No hay propiedades para actualizar', 'warning');
            return;
        }

        const updateBtn = document.getElementById('updateBtn');
        const originalText = updateBtn.textContent;
        
        try {
            console.log('Popup: Updating scores for', this.properties.length, 'properties');
            
            // Show loading animation
            updateBtn.textContent = '⏳ Actualizando...';
            updateBtn.disabled = true;
            updateBtn.style.backgroundColor = '#6c757d';
            
            // Simulate a small delay for better UX
            await new Promise(resolve => setTimeout(resolve, 300));
            
            // Recalculate scores for all properties
            this.properties.forEach(property => {
                const newScore = this.calculatePropertyScore(property);
                const oldScore = property.score;
                property.score = newScore;
                console.log(`Popup: Property ${property.id} - Old score: ${oldScore}, New score: ${newScore}`);
            });

            // Sort properties by new scores (best first)
            this.properties.sort((a, b) => (b.score || 0) - (a.score || 0));
            
            // Update the background script with new scores
            await chrome.runtime.sendMessage({
                action: 'updatePropertyScores',
                properties: this.properties
            });

            // Re-render the popup with updated scores
            this.render();
            
            console.log('Popup: Scores updated and properties re-sorted');
            
            // Show success message
            updateBtn.textContent = '✅ Actualizado';
            updateBtn.style.backgroundColor = '#28a745';
            this.showTemporaryMessage(`Puntuaciones actualizadas para ${this.properties.length} propiedades`, 'success');
            
            // Reset button after 2 seconds
            setTimeout(() => {
                updateBtn.textContent = originalText;
                updateBtn.disabled = false;
                updateBtn.style.backgroundColor = '#007bff';
            }, 2000);
            
        } catch (error) {
            console.error('Popup: Error updating scores:', error);
            
            // Show error message
            updateBtn.textContent = '❌ Error';
            updateBtn.style.backgroundColor = '#dc3545';
            this.showTemporaryMessage('Error al actualizar las puntuaciones', 'error');
            
            // Reset button after 3 seconds
            setTimeout(() => {
                updateBtn.textContent = originalText;
                updateBtn.disabled = false;
                updateBtn.style.backgroundColor = '#007bff';
            }, 3000);
        }
    }

    // Function to show temporary messages
    showTemporaryMessage(message, type = 'info') {
        // Remove any existing message
        const existingMessage = document.getElementById('temporary-message');
        if (existingMessage) {
            existingMessage.remove();
        }

        // Create message element
        const messageElement = document.createElement('div');
        messageElement.id = 'temporary-message';
        messageElement.className = `temporary-message temporary-message--${type}`;
        messageElement.textContent = message;

        // Add to popup
        const popupContainer = document.querySelector('.popup-container');
        popupContainer.appendChild(messageElement);

        // Show with animation
        setTimeout(() => {
            messageElement.classList.add('show');
        }, 10);

        // Hide after 3 seconds
        setTimeout(() => {
            messageElement.classList.remove('show');
            setTimeout(() => {
                if (messageElement.parentNode) {
                    messageElement.remove();
                }
            }, 300);
        }, 3000);
    }

    // Function to calculate property score (same as background script)
    calculatePropertyScore(property) {
        let score = 0;
        const maxScore = 100;

        // Price scoring (25% weight) - Lower is better, adjusted for remote work budget
        if (property.price) {
            const priceScore = Math.max(0, 25 - (property.price - 600) / 6);
            score += priceScore;
        }

        // Size scoring (20% weight) - Bigger is better for remote work
        if (property.squareMeters) {
            const sizeScore = Math.min(20, (property.squareMeters - 50) / 2);
            score += Math.max(0, sizeScore);
        }

        // Rooms scoring (15% weight) - More rooms is better for separate workspaces
        if (property.rooms) {
            const roomScore = Math.min(15, property.rooms * 5);
            score += roomScore;
        }

        // Bathrooms scoring (10% weight) - More bathrooms is better
        if (property.bathrooms) {
            const bathroomScore = Math.min(10, property.bathrooms * 5);
            score += bathroomScore;
        }

        // Features scoring (15% weight) - Adjusted for remote work priorities
        if (property.heating) score += 5; // Essential for comfort
        if (property.furnished) score += 3; // Convenience
        if (!property.seasonal) score += 5; // Prefer long-term rentals
        
        // Elevator logic - penalty for no elevator unless it's ground floor
        if (property.elevator) {
            score += 2; // Bonus for having elevator
        } else if (property.floor && property.floor !== '0' && property.floor !== 'Bajo' && property.floor !== 'bajo') {
            score -= 3; // Penalty for no elevator when not ground floor
        }
        // No penalty for ground floor (floor 0, Bajo) without elevator

        // Price per m² scoring (10% weight) - Lower is better
        if (property.pricePerM2) {
            const pricePerM2Score = Math.max(0, 10 - (property.pricePerM2 - 8) / 0.5);
            score += pricePerM2Score;
        }

        // Orientation scoring (7% weight) - East is best (sunrise), then South, West, North
        if (property.orientation) {
            const orientation = property.orientation.toLowerCase();
            let orientationScore = 0;
            
            if (orientation.includes('este') || orientation.includes('east')) {
                orientationScore = 7; // Best case - sunrise
            } else if (orientation.includes('sur') || orientation.includes('south')) {
                orientationScore = 6; // Good - full sun exposure
            } else if (orientation.includes('oeste') || orientation.includes('west')) {
                orientationScore = 4; // Moderate - afternoon sun
            } else if (orientation.includes('norte') || orientation.includes('north')) {
                orientationScore = 3; // Lower - limited sun exposure
            } else {
                orientationScore = 2; // Unknown orientation
            }
            
            score += orientationScore;
        }

        // Desk scoring (8% weight) - Critical for remote work
        if (property.desk) {
            const deskScore = Math.min(8, property.desk * 4); // 1 desk = 4 points, 2+ desks = 8 points
            score += deskScore;
        }

        return Math.round(Math.min(maxScore, Math.max(0, score)));
    }

    async clearAll() {
        this.showClearConfirmationModal();
    }

    showClearConfirmationModal() {
        // Create modal overlay
        const modalOverlay = document.createElement('div');
        modalOverlay.className = 'modal-overlay';
        modalOverlay.id = 'clearConfirmationModal';
        
        // Create modal content
        const modalContent = document.createElement('div');
        modalContent.className = 'modal-content clear-modal';
        
        modalContent.innerHTML = `
            <div class="modal-header">
                <h3>🗑️ Limpiar Todas las Propiedades</h3>
            </div>
            <div class="modal-body">
                <p>¿Estás seguro de que quieres eliminar <strong>todas las ${this.properties.length} propiedades</strong>?</p>
                <p class="warning-text">⚠️ Esta acción no se puede deshacer.</p>
            </div>
            <div class="modal-actions">
                <button class="btn btn-secondary" id="cancelClearBtn">❌ Cancelar</button>
                <button class="btn btn-danger" id="confirmClearBtn">🗑️ Sí, Eliminar Todo</button>
            </div>
        `;
        
        modalOverlay.appendChild(modalContent);
        document.body.appendChild(modalOverlay);
        
        // Add event listeners
        document.getElementById('cancelClearBtn').addEventListener('click', () => {
            this.hideClearConfirmationModal();
        });
        
        document.getElementById('confirmClearBtn').addEventListener('click', async () => {
            await this.performClearAll();
        });
        
        // Close modal when clicking overlay
        modalOverlay.addEventListener('click', (e) => {
            if (e.target === modalOverlay) {
                this.hideClearConfirmationModal();
            }
        });
        
        // Show modal with animation
        setTimeout(() => {
            modalOverlay.classList.add('show');
        }, 10);
    }

    hideClearConfirmationModal() {
        const modal = document.getElementById('clearConfirmationModal');
        if (modal) {
            modal.classList.remove('show');
            setTimeout(() => {
                if (modal.parentNode) {
                    modal.parentNode.removeChild(modal);
                }
            }, 300);
        }
    }

    async performClearAll() {
            try {
                const response = await chrome.runtime.sendMessage({
                    action: 'clearProperties'
                });
            
                if (response && response.success) {
                    this.properties = [];
                    this.render();
                this.hideClearConfirmationModal();
                this.showTemporaryMessage(`✅ Se eliminaron ${this.properties.length} propiedades`, 'success');
            } else {
                this.showTemporaryMessage('❌ Error al eliminar las propiedades', 'error');
                }
            } catch (error) {
                console.error('Error clearing properties:', error);
            this.showTemporaryMessage('❌ Error al eliminar las propiedades', 'error');
        }
    }

    exportData() {
        if (this.properties.length === 0) {
            this.showTemporaryMessage('No hay propiedades para exportar', 'warning');
            return;
        }

        // Sort properties by score (best first) for export
        const sortedProperties = [...this.properties].sort((a, b) => (b.score || 0) - (a.score || 0));

        // Create headers based on actual property structure
        const headers = [
            'Posición',
            'Score',
            'URL',
            'Precio_€',
            'Metros_Cuadrados',
            'Habitaciones',
            'Baños',
            'Planta',
            'Orientación',
            'Amueblado',
            'Calefacción',
            'Ascensor',
            'Temporada',
            'Escritorios',
            'Profesional',

            'Precio_por_m2_€',
            'Fianza',
            'Certificado_Energético',
            'Última_Actualización',
            'Meses_Mencionados',
            'Coordenadas_Latitud',
            'Coordenadas_Longitud',
            'Fecha_Agregado'
        ];

        // Helper function to safely get property value
        const getPropertyValue = (property, field, defaultValue = '') => {
            const value = property[field];
            if (value === null || value === undefined) return defaultValue;
            if (typeof value === 'boolean') return value ? 'Sí' : 'No';
            if (typeof value === 'number') return value.toString();
            if (Array.isArray(value)) return value.join(', ');
            
            // Clean HTML content from string values
            let cleanValue = value.toString();
            // Remove HTML tags from string fields
            cleanValue = cleanValue.replace(/<[^>]*>/g, '').trim();
            
            return cleanValue || defaultValue;
        };

        // Helper function to get coordinates
        const getCoordinates = (property, coord) => {
            if (!property.coordinates) return '';
            return property.coordinates[coord] ? property.coordinates[coord].toString() : '';
        };



        // Generate CSV content
        const rows = [headers.join('\t')];
        
        sortedProperties.forEach((property, index) => {
            const row = [
                (index + 1).toString(), // Posición
                getPropertyValue(property, 'score', '0'), // Score
                getPropertyValue(property, 'url', ''), // URL
                getPropertyValue(property, 'price', ''), // Precio_€
                getPropertyValue(property, 'squareMeters', ''), // Metros_Cuadrados
                getPropertyValue(property, 'rooms', ''), // Habitaciones
                getPropertyValue(property, 'bathrooms', ''), // Baños
                getPropertyValue(property, 'floor', ''), // Planta
                getPropertyValue(property, 'orientation', ''), // Orientación
                getPropertyValue(property, 'furnished', 'No'), // Amueblado
                getPropertyValue(property, 'heating', 'No'), // Calefacción
                getPropertyValue(property, 'elevator', 'No'), // Ascensor
                getPropertyValue(property, 'seasonal', 'No'), // Temporada
                getPropertyValue(property, 'desk', ''), // Escritorios
                getPropertyValue(property, 'professional', ''), // Profesional

                getPropertyValue(property, 'pricePerM2', ''), // Precio_por_m2_€
                getPropertyValue(property, 'deposit', ''), // Fianza
                getPropertyValue(property, 'energyCert', ''), // Certificado_Energético
                getPropertyValue(property, 'lastUpdated', ''), // Última_Actualización
                getPropertyValue(property, 'monthsMentioned', ''), // Meses_Mencionados
                getCoordinates(property, 'lat'), // Coordenadas_Latitud
                getCoordinates(property, 'lng'), // Coordenadas_Longitud
                property.addedAt ? new Date(property.addedAt).toLocaleDateString('es-ES') : '' // Fecha_Agregado
            ];
            
            // Clean any remaining HTML or special characters from all fields
            const cleanRow = row.map(cell => {
                if (typeof cell === 'string') {
                    // Remove HTML tags, extra whitespace, and normalize
                    return cell.replace(/<[^>]*>/g, '')
                              .replace(/\s+/g, ' ')
                              .trim()
                              .replace(/\n/g, ' ')
                              .replace(/\r/g, '')
                              .replace(/\t/g, ' ');
                }
                return cell;
            });
            
            rows.push(cleanRow.join('\t'));
        });

        const csvContent = rows.join('\n');

        // Debug: Log the first few rows to console
        console.log('TSV Export Debug - First 3 rows:');
        console.log(rows.slice(0, 3));
        
        // Additional debug: Check for HTML content in the first property
        if (sortedProperties.length > 0) {
            console.log('First property data:', sortedProperties[0]);
        }

        const blob = new Blob([csvContent], { type: 'text/tab-separated-values' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        const timestamp = new Date().toISOString().split('T')[0];
        a.download = `propiedades_ordenadas_por_score_${timestamp}.tsv`;
        a.click();
        URL.revokeObjectURL(url);
        
        // Show success message
        this.showTemporaryMessage(`✅ Exportadas ${sortedProperties.length} propiedades`, 'success');
    }

    render() {
        console.log('Popup: Rendering with', this.properties.length, 'properties');
        const propertiesList = document.getElementById('propertiesList');
        const emptyState = document.getElementById('emptyState');
        const totalProperties = document.getElementById('totalProperties');
        const avgScore = document.getElementById('avgScore');
        const bestPrice = document.getElementById('bestPrice');

        if (this.properties.length === 0) {
            console.log('Popup: No properties, showing empty state');
            propertiesList.style.display = 'none';
            emptyState.style.display = 'flex';
            totalProperties.textContent = '0 propiedades';
            avgScore.textContent = 'Score: 0';
            avgScore.title = 'Haz clic para ver el cálculo del score';
            bestPrice.textContent = '🏆 Mejor: 0€';
            bestPrice.title = '';
            
            // Disable stats bar buttons when no properties
            this.disableStatsBarButtons();
            return;
        }

        propertiesList.style.display = 'block';
        emptyState.style.display = 'none';

        // Update stats
        totalProperties.textContent = `${this.properties.length} propiedades`;
        
        const avgScoreValue = Math.round(
            this.properties.reduce((sum, p) => sum + p.score, 0) / this.properties.length
        );
        avgScore.textContent = `Score: ${avgScoreValue}`;
        avgScore.title = 'Haz clic para ver el cálculo del score';

        const bestPriceValue = Math.min(...this.properties.map(p => p.price || Infinity));
        bestPrice.textContent = `🏆 Mejor: ${bestPriceValue !== Infinity ? bestPriceValue + '€' : '0€'}`;
        bestPrice.title = 'Haz clic para ver detalles de la mejor propiedad';

        // Enable stats bar buttons when properties exist
        this.enableStatsBarButtons();

        // Generate new HTML for properties
        const newHTML = this.properties.map(property => this.renderProperty(property)).join('');
        
        // Only update DOM if content has changed
        if (propertiesList.innerHTML !== newHTML) {
            console.log('Popup: Updating properties list HTML');
            propertiesList.innerHTML = newHTML;
        // Add event listeners to buttons
        this.setupPropertyButtonListeners();
        } else {
            console.log('Popup: Properties list unchanged, skipping DOM update');
        }
    }

    renderProperty(property) {
        const scoreCategory = this.getScoreCategory(property.score);
        const formatPrice = (price) => price ? price.toLocaleString('es-ES') + '€' : 'N/A';
        
        // Create compact feature icons
        const features = [];
        if (property.heating) features.push('🔥');
        if (property.furnished) features.push('🪑');
        if (property.elevator) features.push('🛗');
        if (property.seasonal) features.push('📅');
        if (property.desk) features.push(`💻${property.desk > 1 ? property.desk : ''}`);
        
        // Create compact location info
        const locationInfo = [];
        if (property.floor) locationInfo.push(`P${property.floor}`);
        if (property.orientation) locationInfo.push(property.orientation);
        if (property.pricePerM2) locationInfo.push(`${property.pricePerM2}€/m²`);
        
        // Create compact coordinates
        let coordinatesHtml = '';
        if (property.coordinates) {
            const lat = property.coordinates.lat;
            const lng = property.coordinates.lng;
            const googleMapsUrl = `https://www.google.com/maps/place/${lat.toFixed(6)},${lng.toFixed(6)}/`;
            coordinatesHtml = `<span class="property-coordinates" onclick="window.open('${googleMapsUrl}', '_blank')" title="Abrir en Google Maps">📍</span>`;
        }

        return `
            <div class="property-card score-${scoreCategory}" data-id="${property.id}">
                <div class="property-compact-header">
                    <div class="property-compact-main">
                        <div class="property-compact-price-score">
                            <span class="property-compact-price">${formatPrice(property.price)}</span>
                            <span class="property-compact-score" title="Haz clic para ver el cálculo detallado">${property.score}</span>
                    </div>
                        <div class="property-compact-specs">
                            <span class="property-compact-spec">${property.squareMeters || 'N/A'}m²</span>
                            <span class="property-compact-spec">${property.rooms || 'N/A'}hab</span>
                            ${property.bathrooms ? `<span class="property-compact-spec">${property.bathrooms}baño</span>` : ''}
                            ${locationInfo.length > 0 ? `<span class="property-compact-spec">${locationInfo.join(' ')}</span>` : ''}
                </div>
                </div>
                    <div class="property-compact-features">
                        ${features.join('')}
                        ${coordinatesHtml}
                    </div>
                </div>
                <div class="property-compact-actions">
                    <button class="btn btn-outline btn-compact" data-property-id="${property.id}" title="Eliminar">🗑️</button>
                    <button class="btn btn-primary btn-compact" data-property-url="${property.url}" title="Ver propiedad">👁️</button>
                </div>
            </div>
        `;
    }
}

// Initialize
console.log('Popup script starting...');
const propertyManager = new PropertyManager();
