// Property Manager Popup Script
class PropertyManager {
    constructor() {
        this.properties = [];
        this.init();
    }

    async init() {
        await this.loadProperties();
        this.setupEventListeners();
        this.setupMessageListener();
        this.render();
    }

    setupEventListeners() {
        document.getElementById('debugBtn').addEventListener('click', () => this.debugInfo());
        document.getElementById('exportBtn').addEventListener('click', () => this.exportData());
        document.getElementById('clearBtn').addEventListener('click', () => this.clearAll());
        
        // Add click listener to "Mejor" stat
        document.getElementById('bestPrice').addEventListener('click', () => this.showBestProperty());
        
        // Add click listener to score display
        document.getElementById('avgScore').addEventListener('click', () => this.showScoringBreakdown());
        
        // Modal close functionality
        document.getElementById('closeModal').addEventListener('click', () => this.closeModal());
        document.getElementById('scoringModal').addEventListener('click', (e) => {
            if (e.target.id === 'scoringModal') {
                this.closeModal();
            }
        });
    }

    setupMessageListener() {
        // Listen for updates from background script
        chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
            if (message.action === 'propertiesUpdated') {
                this.properties = message.properties;
                this.render();
            }
        });
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
                pricePerM2: 0
            };
        }

        const totals = {
            price: 0,
            size: 0,
            rooms: 0,
            bathrooms: 0,
            features: 0,
            pricePerM2: 0
        };

        this.properties.forEach(property => {
            // Price scoring (30% weight)
            if (property.price) {
                totals.price += Math.max(0, 30 - (property.price - 600) / 5);
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
            if (property.elevator) featuresScore += 2;
            if (!property.seasonal) featuresScore += 5;
            totals.features += featuresScore;

            // Price per m² scoring (10% weight)
            if (property.pricePerM2) {
                totals.pricePerM2 += Math.max(0, 10 - (property.pricePerM2 - 8) / 0.5);
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
            pricePerM2: Math.round(totals.pricePerM2 / count)
        };
    }

    generateScoringDetails(avgScores) {
        const categories = [
            {
                name: '💰 Precio (30% peso)',
                score: avgScores.price,
                weight: 30,
                description: 'Precio mensual del alquiler. Menor precio = mayor puntuación.',
                formula: '30 - (precio - 600€) / 5',
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
            console.log('Loading properties...');
            const response = await chrome.runtime.sendMessage({ action: 'getProperties' });
            console.log('Response from background:', response);
            this.properties = response.properties || [];
            console.log('Properties loaded:', this.properties.length);
        } catch (error) {
            console.error('Error loading properties:', error);
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

        // Price scoring (30% weight)
        if (property.price) {
            scores.price = Math.max(0, 30 - (property.price - 600) / 5);
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

        // Features scoring (15% weight)
        let featuresScore = 0;
        if (property.heating) featuresScore += 5;
        if (property.furnished) featuresScore += 3;
        if (property.elevator) featuresScore += 2;
        if (!property.seasonal) featuresScore += 5;
        scores.features = featuresScore;

        // Price per m² scoring (10% weight)
        if (property.pricePerM2) {
            scores.pricePerM2 = Math.max(0, 10 - (property.pricePerM2 - 8) / 0.5);
        } else {
            scores.pricePerM2 = 0;
        }

        return scores;
    }

    generatePropertyScoringDetails(property, scores) {
        const categories = [
            {
                name: '💰 Precio (30% peso)',
                score: Math.round(scores.price),
                weight: 30,
                value: property.price ? `${property.price}€` : 'N/A',
                description: 'Precio mensual del alquiler',
                formula: property.price ? `30 - (${property.price}€ - 600€) / 5 = ${Math.round(scores.price)}` : 'Sin datos'
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
        if (property.elevator) parts.push('+2 (ascensor)');
        if (!property.seasonal) parts.push('+5 (largo plazo)');
        return parts.length > 0 ? parts.join(' + ') : '0 puntos';
    }

    showBestProperty() {
        if (this.properties.length === 0) {
            alert('No hay propiedades para comparar');
            return;
        }

        const bestProperty = this.properties[0]; // Already sorted by score
        const reasons = this.getPropertyAdvantages(bestProperty);
        
        let message = `🏆 MEJOR PROPIEDAD\n\n`;
        message += `📍 ${bestProperty.url}\n`;
        message += `💰 Precio: ${bestProperty.price ? bestProperty.price.toLocaleString('es-ES') + '€' : 'N/A'}\n`;
        message += `📊 Score: ${bestProperty.score}/100\n\n`;
        message += `🎯 VENTAJAS:\n`;
        reasons.forEach(reason => {
            message += `• ${reason}\n`;
        });
        
        message += `\n📈 COMPARACIÓN:\n`;
        if (this.properties.length > 1) {
            const secondBest = this.properties[1];
            const scoreDiff = bestProperty.score - secondBest.score;
            message += `• ${scoreDiff} puntos mejor que la segunda opción\n`;
            message += `• ${this.properties.length} propiedades en total\n`;
        }
        
        alert(message);
    }

    getPropertyAdvantages(property) {
        const reasons = [];
        
        // Price advantages
        if (property.price && property.price <= 700) {
            reasons.push(`Precio excelente: ${property.price}€ (≤700€)`);
        } else if (property.price && property.price <= 750) {
            reasons.push(`Precio bueno: ${property.price}€ (≤750€)`);
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
        if (property.elevator) reasons.push('Tiene ascensor');
        if (!property.seasonal) reasons.push('Alquiler a largo plazo');
        
        // Price per m² advantages
        if (property.pricePerM2 && property.pricePerM2 <= 10) {
            reasons.push(`Excelente precio/m²: ${property.pricePerM2}€/m²`);
        } else if (property.pricePerM2 && property.pricePerM2 <= 12) {
            reasons.push(`Buen precio/m²: ${property.pricePerM2}€/m²`);
        }
        
        return reasons;
    }

    debugInfo() {
        console.log('=== DEBUG INFO ===');
        console.log('Properties in popup:', this.properties);
        console.log('Properties count:', this.properties.length);
        
        // Test communication with background
        chrome.runtime.sendMessage({ action: 'getProperties' }, (response) => {
            console.log('Background response:', response);
        });
        
        alert(`Debug info logged to console.\nProperties in popup: ${this.properties.length}`);
    }

    async clearAll() {
        if (confirm('¿Estás seguro de que quieres eliminar todas las propiedades?')) {
            try {
                const response = await chrome.runtime.sendMessage({
                    action: 'clearProperties'
                });
                if (response && response.success) {
                    this.properties = [];
                    this.render();
                }
            } catch (error) {
                console.error('Error clearing properties:', error);
            }
        }
    }

    exportData() {
        if (this.properties.length === 0) {
            alert('No hay propiedades para exportar');
            return;
        }

        const headers = [
            'URL', 'Precio', 'm²', 'Habitaciones', 'Baños', 'Planta', 'Orientación',
            'Amueblado', 'Calefacción', 'Ascensor', 'Temporada', 'Profesional',
            'Teléfono', 'Precio/m²', 'Fianza', 'Certificado', 'Score', 'Fecha'
        ];

        const csvContent = [
            headers.join('\t'),
            ...this.properties.map(p => [
                p.url,
                p.price || '',
                p.squareMeters || '',
                p.rooms || '',
                p.bathrooms || '',
                p.floor || '',
                p.orientation || '',
                p.furnished ? 'Sí' : 'No',
                p.heating ? 'Sí' : 'No',
                p.elevator ? 'Sí' : 'No',
                p.seasonal ? 'Sí' : 'No',
                p.professional || '',
                p.phone || '',
                p.pricePerM2 || '',
                p.deposit || '',
                p.energyCert || '',
                p.score,
                new Date(p.addedAt).toLocaleDateString('es-ES')
            ].join('\t'))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/tab-separated-values' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `propiedades_${new Date().toISOString().split('T')[0]}.tsv`;
        a.click();
        URL.revokeObjectURL(url);
    }

    render() {
        console.log('Rendering popup with', this.properties.length, 'properties');
        const propertiesList = document.getElementById('propertiesList');
        const emptyState = document.getElementById('emptyState');
        const totalProperties = document.getElementById('totalProperties');
        const avgScore = document.getElementById('avgScore');
        const bestPrice = document.getElementById('bestPrice');

        if (this.properties.length === 0) {
            console.log('No properties, showing empty state');
            propertiesList.style.display = 'none';
            emptyState.style.display = 'flex';
            totalProperties.textContent = '0 propiedades';
            avgScore.textContent = 'Score: 0';
            avgScore.title = 'Haz clic para ver el cálculo del score';
            bestPrice.textContent = '🏆 Mejor: 0€';
            bestPrice.title = '';
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

        // Render properties
        propertiesList.innerHTML = this.properties.map(property => this.renderProperty(property)).join('');
        
        // Add event listeners to buttons
        this.setupPropertyButtonListeners();
    }

    renderProperty(property) {
        const scoreCategory = this.getScoreCategory(property.score);
        const formatPrice = (price) => price ? price.toLocaleString('es-ES') + '€' : 'N/A';
        
        const chips = [];
        if (property.squareMeters) chips.push(`<span class="property-chip highlight">${property.squareMeters}m²</span>`);
        if (property.rooms) chips.push(`<span class="property-chip">${property.rooms}hab</span>`);
        if (property.bathrooms) chips.push(`<span class="property-chip">${property.bathrooms}baño</span>`);
        if (property.heating) chips.push(`<span class="property-chip success">Calefacción</span>`);
        if (property.furnished) chips.push(`<span class="property-chip success">Amueblado</span>`);
        if (property.elevator) chips.push(`<span class="property-chip">Ascensor</span>`);
        if (property.seasonal) chips.push(`<span class="property-chip warning">Temporada</span>`);
        if (property.pricePerM2) chips.push(`<span class="property-chip highlight">${property.pricePerM2}€/m²</span>`);

        return `
            <div class="property-card score-${scoreCategory}" data-id="${property.id}">
                <div class="property-header">
                    <div class="property-main-info">
                        <span class="property-price">${formatPrice(property.price)}</span>
                        <span class="property-chip">${property.squareMeters || 'N/A'}m²</span>
                        <span class="property-chip">${property.rooms || 'N/A'}hab</span>
                        ${property.bathrooms ? `<span class="property-chip">${property.bathrooms}baño</span>` : ''}
                    </div>
                    <span class="property-score" title="Haz clic para ver el cálculo detallado">${property.score}</span>
                </div>
                <div class="property-details">
                    ${chips.join('')}
                </div>
                <div class="property-actions">
                    <button class="btn btn-outline" data-property-id="${property.id}">Eliminar</button>
                    <button class="btn btn-primary" data-property-url="${property.url}">Ver</button>
                </div>
            </div>
        `;
    }
}

// Initialize
console.log('Popup script starting...');
const propertyManager = new PropertyManager();
