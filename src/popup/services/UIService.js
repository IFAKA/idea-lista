// UIService - Handles UI-related functionality
import { ScoringService } from './ScoringService.js';

export class UIService {
    constructor(propertyManager) {
        this.propertyManager = propertyManager;
        this.scoringService = new ScoringService();
    }

    updateStats(properties) {
        const totalProperties = document.getElementById('totalProperties');
        const avgScore = document.getElementById('avgScore');
        
        totalProperties.textContent = `${properties.length} propiedades`;
        
        const avgScoreValue = Math.round(
            properties.reduce((sum, p) => sum + p.score, 0) / properties.length
        );
        avgScore.textContent = `Score: ${avgScoreValue}`;
        avgScore.title = 'Haz clic para ver el cálculo del score';
    }

    renderProperty(property) {
        const scoreCategory = this.scoringService.getScoreCategory(property.score);
        const formatPrice = (price) => price ? price.toLocaleString('es-ES') + '€' : 'N/A';
        
        // Create feature specs as text
        const featureSpecs = [];
        if (property.heating) featureSpecs.push('Calefacción');
        if (property.furnished) featureSpecs.push('Amueblado');
        if (property.elevator) featureSpecs.push('Ascensor');
        if (property.seasonal) featureSpecs.push('Temporada');
        if (property.desk) featureSpecs.push(`${property.desk} escritorio${property.desk > 1 ? 's' : ''}`);
        
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
            coordinatesHtml = `<span class="property-coordinates" onclick="window.open('${googleMapsUrl}', '_blank')" title="Abrir en Google Maps"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg></span>`;
        }

        const cardClasses = `property-card score-${scoreCategory}`;

        return `
            <div class="${cardClasses}" data-id="${property.id}">
                <div class="property-compact-header">
                    <div class="property-compact-main">
                        <div class="property-compact-price-score">
                            <div class="property-compact-price-title">
                                <span class="property-compact-price">${formatPrice(property.price)}</span>
                                ${property.title ? `<span class="property-title" title="${property.title}">${property.title}</span>` : ''}
                            </div>
                            <span class="property-compact-score" data-property-id="${property.id}" title="Haz clic para ver el cálculo detallado">${property.score}</span>
                        </div>
                        <div class="property-compact-specs">
                            <span class="property-compact-spec">${property.squareMeters || 'N/A'}m²</span>
                            <span class="property-compact-spec">${property.rooms || 'N/A'}hab</span>
                            ${property.bathrooms ? `<span class="property-compact-spec">${property.bathrooms}baño</span>` : ''}
                            ${locationInfo.map(spec => `<span class="property-compact-spec">${spec}</span>`).join('')}
                            ${featureSpecs.map(spec => `<span class="property-compact-spec">${spec}</span>`).join('')}
                            ${coordinatesHtml}
                        </div>
                    </div>
                </div>
                <div class="property-compact-actions">
                    <button class="btn btn-primary btn-compact btn-icon-only" data-property-url="${property.url}" title="Ver propiedad">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                            <circle cx="12" cy="12" r="3"></circle>
                        </svg>
                    </button>
                    <button class="btn btn-danger btn-compact btn-icon-only" data-property-id="${property.id}" data-action="delete" title="Eliminar propiedad">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polyline points="3,6 5,6 21,6"></polyline>
                            <path d="M19,6v14a2,2 0 0,1 -2,2H7a2,2 0 0,1 -2,-2V6m3,0V4a2,2 0 0,1 2,-2h4a2,2 0 0,1 2,2v2"></path>
                            <line x1="10" y1="11" x2="10" y2="17"></line>
                            <line x1="14" y1="11" x2="14" y2="17"></line>
                        </svg>
                    </button>
                </div>
            </div>
        `;
    }

    setupPropertyButtonListeners() {
        // Remove existing listeners
        document.querySelectorAll('[data-property-id]').forEach(button => {
            button.removeEventListener('click', this.handlePropertyAction);
        });
        
        document.querySelectorAll('[data-property-url]').forEach(button => {
            button.removeEventListener('click', this.handleViewProperty);
        });

        // Add new listeners
        document.querySelectorAll('[data-property-id]').forEach(button => {
            button.addEventListener('click', this.handlePropertyAction.bind(this));
        });
        
        document.querySelectorAll('[data-property-url]').forEach(button => {
            button.addEventListener('click', this.handleViewProperty.bind(this));
        });
        
        // Add click listener for property scores
        document.querySelectorAll('.property-compact-score').forEach(score => {
            score.addEventListener('click', this.handleScoreClick.bind(this));
        });
    }

    async handlePropertyAction(event) {
        // Handle clicks on SVG icons inside buttons
        const button = event.target.closest('[data-property-id]');
        if (!button) return;
        
        const propertyId = button.dataset.propertyId;
        const action = button.dataset.action;
        
        if (action === 'delete') {
            await this.handleDeleteProperty(propertyId);
        }
    }

    async handleDeleteProperty(propertyId) {
        try {
            // Convert propertyId to number for consistency
            const numericId = parseInt(propertyId, 10);
            const response = await chrome.runtime.sendMessage({ 
                action: 'removeProperty', 
                propertyId: numericId 
            });
            
            if (response.success) {
                this.propertyManager.properties = response.properties;
                this.propertyManager.render();
            }
        } catch (error) {
            console.error('Error removing property:', error);
        }
    }

    handleScoreClick(event) {
        const scoreElement = event.target.closest('.property-compact-score');
        if (!scoreElement) return;
        
        const propertyId = scoreElement.dataset.propertyId;
        console.log('Score clicked for property:', propertyId);
        
        // Convert propertyId to number for comparison
        const numericId = parseInt(propertyId, 10);
        const property = this.propertyManager.properties.find(p => p.id === numericId);
        console.log('Found property:', property);
        if (property) {
            console.log('Opening modal for property:', property);
            this.propertyManager.modalService.showPropertyDetailsModal(property);
        } else {
            console.error('Property not found for ID:', propertyId, 'numericId:', numericId);
            console.log('Available properties:', this.propertyManager.properties.map(p => ({ id: p.id, type: typeof p.id })));
        }
    }

    handleViewProperty(event) {
        const url = event.target.dataset.propertyUrl;
        chrome.tabs.create({ url: url });
    }

    disableStatsBarButtons() {
        const totalProperties = document.getElementById('totalProperties');
        const avgScore = document.getElementById('avgScore');
        
        [totalProperties, avgScore].forEach(element => {
            if (element) {
                element.style.pointerEvents = 'none';
                element.style.opacity = '0.5';
                element.style.cursor = 'not-allowed';
            }
        });
    }

    enableStatsBarButtons() {
        const totalProperties = document.getElementById('totalProperties');
        const avgScore = document.getElementById('avgScore');
        
        [totalProperties, avgScore].forEach(element => {
            if (element) {
                element.style.pointerEvents = 'auto';
                element.style.opacity = '1';
                element.style.cursor = 'pointer';
            }
        });
    }


}
