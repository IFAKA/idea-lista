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
                    <span class="property-score">${property.score}</span>
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
