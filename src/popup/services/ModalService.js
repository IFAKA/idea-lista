// ModalService - Handles all modal-related functionality with dynamic mounting
import { ScoringService } from './ScoringService.js';

export class ModalService {
    constructor() {
        this.propertyManager = null;
        this.scoringService = new ScoringService();
        this.currentModal = null;
        this.isAnimating = false;
    }

    setPropertyManager(propertyManager) {
        this.propertyManager = propertyManager;
    }

    // Create modal HTML structure dynamically
    createModalHTML(title, content, variant = '') {
        const modalClass = variant ? `modal-content ${variant}` : 'modal-content';
        return `
            <div id="dynamicModal" class="modal-overlay">
                <div class="${modalClass}">
                    <div class="modal-header">
                        <h2 id="modalTitle">${title}</h2>
                        <button class="close-btn" id="closeModal" title="Cerrar modal">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <line x1="18" y1="6" x2="6" y2="18"></line>
                                <line x1="6" y1="6" x2="18" y2="18"></line>
                            </svg>
                        </button>
                    </div>
                    <div class="modal-body" id="modalBody">
                        ${content}
                    </div>
                </div>
            </div>
        `;
    }

    // Mount modal to DOM
    mountModal(title, content, variant = '') {
        // Remove any existing modal
        this.unmountModal();
        
        // Create and insert modal HTML
        const modalHTML = this.createModalHTML(title, content, variant);
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        
        // Get the newly created modal
        this.currentModal = document.getElementById('dynamicModal');
        
        // Setup event listeners
        this.setupModalListeners();
        
        // Trigger open animation
        this.animateModalOpen();
    }

    // Setup event listeners for the current modal
    setupModalListeners() {
        if (!this.currentModal) return;

        // Close button
        const closeBtn = this.currentModal.querySelector('#closeModal');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.closeModal());
        }

        // Click outside to close
        this.currentModal.addEventListener('click', (e) => {
            if (e.target === this.currentModal) {
                this.closeModal();
            }
        });

        // Escape key to close
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.currentModal) {
                this.closeModal();
            }
        });
    }

    // Animate modal opening
    animateModalOpen() {
        if (!this.currentModal || this.isAnimating) return;
        
        this.isAnimating = true;
        
        // Explicitly set initial state
        this.currentModal.style.opacity = '0';
        this.currentModal.querySelector('.modal-content').style.transform = 'scale(0.9)';
        
        // Force a reflow to ensure the initial state is applied
        this.currentModal.offsetHeight;
        
        // Animate to final state
        this.currentModal.style.opacity = '1';
        this.currentModal.querySelector('.modal-content').style.transform = 'scale(1)';
        
        // Remove animation class after animation completes
        setTimeout(() => {
            this.isAnimating = false;
        }, 250); // Match CSS animation duration
    }

    // Animate modal closing
    animateModalClose() {
        if (!this.currentModal || this.isAnimating) return;
        
        this.isAnimating = true;
        
        // Animate to hidden state
        this.currentModal.style.opacity = '0';
        this.currentModal.querySelector('.modal-content').style.transform = 'scale(0.9)';
        
        // Wait for animation to complete, then unmount
        setTimeout(() => {
            this.unmountModal();
            this.isAnimating = false;
        }, 200); // Match CSS animation duration
    }

    // Close modal with animation
    closeModal() {
        if (this.isAnimating) return;
        this.animateModalClose();
    }

    // Unmount modal from DOM
    unmountModal() {
        if (this.currentModal) {
            // Remove event listeners
            const closeBtn = this.currentModal.querySelector('#closeModal');
            if (closeBtn) {
                closeBtn.removeEventListener('click', () => this.closeModal());
            }
            
            // Remove escape key listener
            document.removeEventListener('keydown', (e) => {
                if (e.key === 'Escape' && this.currentModal) {
                    this.closeModal();
                }
            });
            
            // Remove from DOM
            this.currentModal.remove();
            this.currentModal = null;
        }
    }

    // Show modal with dynamic mounting
    showModal(title, content, variant = '') {
        this.mountModal(title, content, variant);
    }

    showScoringModal(scoringDetails) {
        this.showModal('Cálculo del Score', scoringDetails);
    }

    showPropertyDetailsModal(property) {
        const maxBudget = 750;
        const monthlySavings = maxBudget - (property.price || 0);
        const annualSavings = monthlySavings * 12;
        
        const savingsText = monthlySavings >= 0 
            ? `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"></circle><path d="M12 1v6m0 6v6"></path></svg> Ahorro mensual: ${monthlySavings.toFixed(0)}€ | Anual: ${annualSavings.toFixed(0)}€`
            : `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 1-1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg> Exceso mensual: ${Math.abs(monthlySavings).toFixed(0)}€ | Anual: ${Math.abs(annualSavings).toFixed(0)}€`;

        const content = `
            <div class="property-details-header">
                <h3>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                        <polyline points="9,22 9,12 15,12 15,22"></polyline>
                    </svg>
                    Detalles de la Propiedad
                </h3>
            </div>
            <div class="property-details-content">
                <div class="property-main-info">
                    <div class="property-price-score">
                        <span class="property-price">${property.price ? property.price.toLocaleString('es-ES') + '€' : 'N/A'}</span>
                        <span class="property-score">${property.score}</span>
                    </div>
                    <div class="property-specs">
                        <span>${property.squareMeters || 'N/A'}m²</span>
                        <span>${property.rooms || 'N/A'} hab</span>
                        ${property.bathrooms ? `<span>${property.bathrooms} baño</span>` : ''}
                        ${property.floor ? `<span>P${property.floor}</span>` : ''}
                        ${property.orientation ? `<span>${property.orientation}</span>` : ''}
                    </div>
                </div>
                <div class="property-features">
                    ${this.getPropertyFeatures(property)}
                </div>
                <div class="financial-info">
                    <p>${savingsText}</p>
                </div>
                <div class="property-actions">
                    <button class="btn btn-primary btn-icon-only" onclick="chrome.tabs.create({url: '${property.url}'})" title="Ver propiedad en Idealista">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                            <circle cx="12" cy="12" r="3"></circle>
                        </svg>
                    </button>
                </div>
            </div>
        `;
        
        this.showModal('Detalles de la Propiedad', content, 'modal-success modal-large');
    }

    showPropertiesMetricsModal(metrics) {
        const content = `
            <div class="metrics-header">
                <h3>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M3 3v18h18"></path>
                        <path d="M18.7 8l-5.1 5.2-2.8-2.7L7 14.3"></path>
                    </svg>
                    Métricas de Propiedades
                </h3>
            </div>
            <div class="metrics-content">
                <div class="metrics-section">
                    <h4>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M3 3v18h18"></path>
                            <path d="M18.7 8l-5.1 5.2-2.8-2.7L7 14.3"></path>
                        </svg>
                        Estadísticas Generales
                    </h4>
                    <div class="metrics-grid">
                        <div class="metric-item">
                            <span class="metric-label">Total Propiedades:</span>
                            <span class="metric-value">${metrics.totalProperties}</span>
                        </div>
                        <div class="metric-item">
                            <span class="metric-label">Score Promedio:</span>
                            <span class="metric-value">${metrics.averageScore}</span>
                        </div>
                        <div class="metric-item">
                            <span class="metric-label">Precio Promedio:</span>
                            <span class="metric-value">${metrics.averagePrice.toFixed(0)}€</span>
                        </div>
                        <div class="metric-item">
                            <span class="metric-label">Tamaño Promedio:</span>
                            <span class="metric-value">${metrics.averageSize.toFixed(0)}m²</span>
                        </div>
                    </div>
                </div>
                
                <div class="metrics-section">
                    <h4>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <circle cx="12" cy="12" r="3"></circle>
                            <path d="M12 1v6m0 6v6"></path>
                        </svg>
                        Distribución de Precios
                    </h4>
                    <div class="metrics-grid">
                        <div class="metric-item">
                            <span class="metric-label">Rango de Precios:</span>
                            <span class="metric-value">${metrics.priceRange.min}€ - ${metrics.priceRange.max}€</span>
                        </div>
                        <div class="metric-item">
                            <span class="metric-label">Bajo (< 600€):</span>
                            <span class="metric-value">${metrics.priceDistribution.low} (${Math.round((metrics.priceDistribution.low / metrics.totalProperties) * 100)}%)</span>
                        </div>
                        <div class="metric-item">
                            <span class="metric-label">Medio (600-750€):</span>
                            <span class="metric-value">${metrics.priceDistribution.medium} (${Math.round((metrics.priceDistribution.medium / metrics.totalProperties) * 100)}%)</span>
                        </div>
                        <div class="metric-item">
                            <span class="metric-label">Alto (> 750€):</span>
                            <span class="metric-value">${metrics.priceDistribution.high} (${Math.round((metrics.priceDistribution.high / metrics.totalProperties) * 100)}%)</span>
                        </div>
                    </div>
                </div>
                
                <div class="metrics-section">
                    <h4>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                            <line x1="9" y1="9" x2="15" y2="9"></line>
                            <line x1="9" y1="12" x2="15" y2="12"></line>
                            <line x1="9" y1="15" x2="15" y2="15"></line>
                        </svg>
                        Distribución de Tamaños
                    </h4>
                    <div class="metrics-grid">
                        <div class="metric-item">
                            <span class="metric-label">Rango de Tamaños:</span>
                            <span class="metric-value">${metrics.sizeRange.min}m² - ${metrics.sizeRange.max}m²</span>
                        </div>
                        <div class="metric-item">
                            <span class="metric-label">Pequeño (< 60m²):</span>
                            <span class="metric-value">${metrics.sizeDistribution.small} (${Math.round((metrics.sizeDistribution.small / metrics.totalProperties) * 100)}%)</span>
                        </div>
                        <div class="metric-item">
                            <span class="metric-label">Medio (60-80m²):</span>
                            <span class="metric-value">${metrics.sizeDistribution.medium} (${Math.round((metrics.sizeDistribution.medium / metrics.totalProperties) * 100)}%)</span>
                        </div>
                        <div class="metric-item">
                            <span class="metric-label">Grande (> 80m²):</span>
                            <span class="metric-value">${metrics.sizeDistribution.large} (${Math.round((metrics.sizeDistribution.large / metrics.totalProperties) * 100)}%)</span>
                        </div>
                    </div>
                </div>
                
                <div class="metrics-section">
                    <h4>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"></path>
                        </svg>
                        Distribución de Scores
                    </h4>
                    <div class="metrics-grid">
                        <div class="metric-item">
                            <span class="metric-label">Excelente (≥ 80):</span>
                            <span class="metric-value">${metrics.scoreDistribution.excellent} (${Math.round((metrics.scoreDistribution.excellent / metrics.totalProperties) * 100)}%)</span>
                        </div>
                        <div class="metric-item">
                            <span class="metric-label">Bueno (70-79):</span>
                            <span class="metric-value">${metrics.scoreDistribution.good} (${Math.round((metrics.scoreDistribution.good / metrics.totalProperties) * 100)}%)</span>
                        </div>
                        <div class="metric-item">
                            <span class="metric-label">Promedio (60-69):</span>
                            <span class="metric-value">${metrics.scoreDistribution.average} (${Math.round((metrics.scoreDistribution.average / metrics.totalProperties) * 100)}%)</span>
                        </div>
                        <div class="metric-item">
                            <span class="metric-label">Bajo (< 60):</span>
                            <span class="metric-value">${metrics.scoreDistribution.poor} (${Math.round((metrics.scoreDistribution.poor / metrics.totalProperties) * 100)}%)</span>
                        </div>
                    </div>
                </div>
                
                <div class="metrics-section">
                    <h4>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                            <polyline points="9,22 9,12 15,12 15,22"></polyline>
                        </svg>
                        Características
                    </h4>
                    <div class="metrics-grid">
                        <div class="metric-item">
                            <span class="metric-label">Con Calefacción:</span>
                            <span class="metric-value">${metrics.features.heating} (${Math.round((metrics.features.heating / metrics.totalProperties) * 100)}%)</span>
                        </div>
                        <div class="metric-item">
                            <span class="metric-label">Amueblado:</span>
                            <span class="metric-value">${metrics.features.furnished} (${Math.round((metrics.features.furnished / metrics.totalProperties) * 100)}%)</span>
                        </div>
                        <div class="metric-item">
                            <span class="metric-label">Con Ascensor:</span>
                            <span class="metric-value">${metrics.features.elevator} (${Math.round((metrics.features.elevator / metrics.totalProperties) * 100)}%)</span>
                        </div>
                        <div class="metric-item">
                            <span class="metric-label">Con Escritorio:</span>
                            <span class="metric-value">${metrics.features.desk} (${Math.round((metrics.features.desk / metrics.totalProperties) * 100)}%)</span>
                        </div>
                    </div>
                </div>
                
                <div class="metrics-section">
                    <h4>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <circle cx="12" cy="12" r="5"></circle>
                            <path d="M12 1v22"></path>
                            <path d="M17 12H7"></path>
                        </svg>
                        Orientación
                    </h4>
                    <div class="metrics-grid">
                        <div class="metric-item">
                            <span class="metric-label">Este:</span>
                            <span class="metric-value">${metrics.orientation.east} (${Math.round((metrics.orientation.east / metrics.totalProperties) * 100)}%)</span>
                        </div>
                        <div class="metric-item">
                            <span class="metric-label">Sur:</span>
                            <span class="metric-value">${metrics.orientation.south} (${Math.round((metrics.orientation.south / metrics.totalProperties) * 100)}%)</span>
                        </div>
                        <div class="metric-item">
                            <span class="metric-label">Oeste:</span>
                            <span class="metric-value">${metrics.orientation.west} (${Math.round((metrics.orientation.west / metrics.totalProperties) * 100)}%)</span>
                        </div>
                        <div class="metric-item">
                            <span class="metric-label">Norte:</span>
                            <span class="metric-value">${metrics.orientation.north} (${Math.round((metrics.orientation.north / metrics.totalProperties) * 100)}%)</span>
                        </div>
                    </div>
                </div>
                
                <div class="metrics-section">
                    <h4>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <circle cx="12" cy="12" r="3"></circle>
                            <path d="M12 1v6m0 6v6"></path>
                        </svg>
                        Ahorro Financiero
                    </h4>
                    <div class="metrics-grid">
                        <div class="metric-item">
                            <span class="metric-label">Ahorro Mensual:</span>
                            <span class="metric-value">${metrics.financialSavings.monthly.toFixed(0)}€</span>
                        </div>
                        <div class="metric-item">
                            <span class="metric-label">Ahorro Anual:</span>
                            <span class="metric-value">${metrics.financialSavings.annual.toFixed(0)}€</span>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        this.showModal('Métricas de Propiedades', content);
    }

    showClearConfirmationModal() {
        const content = `
            <div class="clear-confirmation">
                <h3>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="3,6 5,6 21,6"></polyline>
                        <path d="M19,6v14a2,2 0 0,1 -2,2H7a2,2 0 0,1 -2,-2V6m3,0V4a2,2 0 0,1 2,-2h4a2,2 0 0,1 2,2v2"></path>
                        <line x1="10" y1="11" x2="10" y2="17"></line>
                        <line x1="14" y1="11" x2="14" y2="17"></line>
                    </svg>
                    Confirmar Limpieza
                </h3>
                <p>¿Estás seguro de que quieres eliminar todas las propiedades? Esta acción no se puede deshacer.</p>
                <div class="clear-actions">
                    <button class="btn btn-outline btn-icon-only" onclick="this.closest('.modal-overlay').remove()" title="Cancelar limpieza">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                    </button>
                    <button class="btn btn-danger btn-icon-only" onclick="propertyManager.performClearAll(); this.closest('.modal-overlay').remove()" title="Eliminar todas las propiedades">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polyline points="3,6 5,6 21,6"></polyline>
                            <path d="M19,6v14a2,2 0 0,1 -2,2H7a2,2 0 0,1 -2,-2V6m3,0V4a2,2 0 0,1 2,-2h4a2,2 0 0,1 2,2v2"></path>
                            <line x1="10" y1="11" x2="10" y2="17"></line>
                            <line x1="14" y1="11" x2="14" y2="17"></line>
                        </svg>
                    </button>
                </div>
            </div>
        `;
        
        this.showModal('Confirmar Limpieza', content);
    }

    getPropertyFeatures(property) {
        const features = [];
        if (property.heating) features.push('<span class="feature-tag"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 12l2 2 4-4"></path><path d="M21 12c-1 0-2-1-2-2s1-2 2-2 2 1 2 2-1 2-2 2z"></path><path d="M3 12c1 0 2-1 2-2s-1-2-2-2-2 1-2 2 1 2 2 2z"></path><path d="M12 3c0 1-1 2-2 2s-2-1-2-2 1-2 2-2 2 1 2 2z"></path><path d="M12 21c0-1 1-2 2-2s2 1 2 2-1 2-2 2-2-1-2-2z"></path></svg> Calefacción</span>');
        if (property.furnished) features.push('<span class="feature-tag"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="9" y1="9" x2="15" y2="9"></line><line x1="9" y1="12" x2="15" y2="12"></line><line x1="9" y1="15" x2="15" y2="15"></line></svg> Amueblado</span>');
        if (property.elevator) features.push('<span class="feature-tag"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M7 10l5 5 5-5"></path><path d="M17 17V5H7v12"></path></svg> Ascensor</span>');
        if (property.seasonal) features.push('<span class="feature-tag"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg> Temporada</span>');
        if (property.desk) features.push(`<span class="feature-tag"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect><line x1="8" y1="21" x2="16" y2="21"></line><line x1="12" y1="17" x2="12" y2="21"></line></svg> ${property.desk} escritorio${property.desk > 1 ? 's' : ''}</span>`);
        if (property.pricePerM2) features.push(`<span class="feature-tag"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"></circle><path d="M12 1v6m0 6v6"></path></svg> ${property.pricePerM2}€/m²</span>`);
        
        return features.length > 0 ? features.join('') : '<span class="feature-tag">Sin características especiales</span>';
    }

    showConfigurationModal(configForm) {
        const content = `
            <div class="config-modal-content">
                ${configForm}
                <div class="config-actions">
                    <button id="saveConfigBtn" class="btn btn-primary" title="Guardar configuración">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
                            <polyline points="17,21 17,13 7,13 7,21"></polyline>
                            <polyline points="7,3 7,8 15,8"></polyline>
                        </svg>
                        Guardar
                    </button>
                    <button id="resetConfigBtn" class="btn btn-secondary" title="Restablecer valores por defecto">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polyline points="1,4 1,10 7,10"></polyline>
                            <polyline points="23,20 23,14 17,14"></polyline>
                            <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15"></path>
                        </svg>
                        Restablecer
                    </button>
                </div>
            </div>
        `;
        
        this.showModal('Configuración de Búsqueda', content);
    }
}
