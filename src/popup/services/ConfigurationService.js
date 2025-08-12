// ConfigurationService - Handles search parameters configuration
export class ConfigurationService {
    constructor() {
        this.propertyManager = null;
        this.defaultConfig = {
            // Price configuration
            maxBudget: 750,
            priceWeight: 25,
            
            // Size configuration
            minSize: 50,
            sizeWeight: 20,
            
            // Rooms configuration
            minRooms: 1,
            roomsWeight: 15,
            
            // Bathrooms configuration
            minBathrooms: 1,
            bathroomsWeight: 10,
            
            // Features configuration
            featuresWeight: 15,
            heatingBonus: 5,
            furnishedBonus: 3,
            seasonalPenalty: 5,
            elevatorBonus: 2,
            elevatorPenalty: 15,
            
            // Price per m² configuration
            maxPricePerM2: 8,
            pricePerM2Weight: 10,
            
            // Orientation configuration
            orientationWeight: 7,
            eastBonus: 7,
            southBonus: 6,
            westBonus: 4,
            northBonus: 3,
            defaultOrientationBonus: 2,
            
            // Desk configuration
            deskWeight: 8,
            deskBonus: 4
        };
        
        this.config = { ...this.defaultConfig };
    }

    setPropertyManager(propertyManager) {
        this.propertyManager = propertyManager;
    }

    async loadConfiguration() {
        try {
            const response = await chrome.runtime.sendMessage({ action: 'getConfiguration' });
            this.config = { ...this.defaultConfig, ...response.config };
            return this.config;
        } catch (error) {
            console.error('Error loading configuration:', error);
            return this.config;
        }
    }

    async saveConfiguration(newConfig) {
        try {
            const response = await chrome.runtime.sendMessage({ 
                action: 'saveConfiguration', 
                config: newConfig 
            });
            
            if (response.success) {
                this.config = { ...newConfig };
                return true;
            }
            return false;
        } catch (error) {
            console.error('Error saving configuration:', error);
            return false;
        }
    }

    getConfiguration() {
        return { ...this.config };
    }

    getConfigurationForm() {
        const config = this.config;
        
        return `
            <div class="config-form">
                <div class="config-section">
                    <h3>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"></path>
                        </svg>
                        Configuración de Precios
                    </h3>
                    <div class="config-row">
                        <label for="maxBudget">Presupuesto máximo (€):</label>
                        <input type="number" id="maxBudget" value="${config.maxBudget}" min="100" max="2000" step="50">
                    </div>
                    <div class="config-row">
                        <label for="priceWeight">Peso del precio (%):</label>
                        <input type="number" id="priceWeight" value="${config.priceWeight}" min="0" max="50" step="1">
                    </div>
                </div>

                <div class="config-section">
                    <h3>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                            <circle cx="9" cy="9" r="2"></circle>
                            <path d="M21 15l-3.086-3.086a2 2 0 0 0-2.828 0L6 21"></path>
                        </svg>
                        Configuración de Tamaño
                    </h3>
                    <div class="config-row">
                        <label for="minSize">Tamaño mínimo (m²):</label>
                        <input type="number" id="minSize" value="${config.minSize}" min="20" max="200" step="5">
                    </div>
                    <div class="config-row">
                        <label for="sizeWeight">Peso del tamaño (%):</label>
                        <input type="number" id="sizeWeight" value="${config.sizeWeight}" min="0" max="50" step="1">
                    </div>
                </div>

                <div class="config-section">
                    <h3>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                            <polyline points="9,22 9,12 15,12 15,22"></polyline>
                        </svg>
                        Configuración de Habitaciones
                    </h3>
                    <div class="config-row">
                        <label for="minRooms">Habitaciones mínimas:</label>
                        <input type="number" id="minRooms" value="${config.minRooms}" min="1" max="10" step="1">
                    </div>
                    <div class="config-row">
                        <label for="roomsWeight">Peso de habitaciones (%):</label>
                        <input type="number" id="roomsWeight" value="${config.roomsWeight}" min="0" max="50" step="1">
                    </div>
                    <div class="config-row">
                        <label for="minBathrooms">Baños mínimos:</label>
                        <input type="number" id="minBathrooms" value="${config.minBathrooms}" min="1" max="5" step="1">
                    </div>
                    <div class="config-row">
                        <label for="bathroomsWeight">Peso de baños (%):</label>
                        <input type="number" id="bathroomsWeight" value="${config.bathroomsWeight}" min="0" max="50" step="1">
                    </div>
                </div>

                <div class="config-section">
                    <h3>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M9 12l2 2 4-4"></path>
                            <path d="M21 12c-1 0-2-1-2-2s1-2 2-2 2 1 2 2-1 2-2 2z"></path>
                            <path d="M3 12c1 0 2-1 2-2s-1-2-2-2-2 1-2 2 1 2 2 2z"></path>
                            <path d="M12 3c0 1-1 2-2 2s-2-1-2-2 1-2 2-2 2 1 2 2z"></path>
                            <path d="M12 21c0-1 1-2 2-2s2 1 2 2-1 2-2 2-2-1-2-2z"></path>
                        </svg>
                        Configuración de Características
                    </h3>
                    <div class="config-row">
                        <label for="featuresWeight">Peso de características (%):</label>
                        <input type="number" id="featuresWeight" value="${config.featuresWeight}" min="0" max="50" step="1">
                    </div>
                    <div class="config-row">
                        <label for="heatingBonus">Bonus calefacción:</label>
                        <input type="number" id="heatingBonus" value="${config.heatingBonus}" min="0" max="20" step="1">
                    </div>
                    <div class="config-row">
                        <label for="furnishedBonus">Bonus amueblado:</label>
                        <input type="number" id="furnishedBonus" value="${config.furnishedBonus}" min="0" max="20" step="1">
                    </div>
                    <div class="config-row">
                        <label for="seasonalPenalty">Penalización temporal:</label>
                        <input type="number" id="seasonalPenalty" value="${config.seasonalPenalty}" min="0" max="20" step="1">
                    </div>
                    <div class="config-row">
                        <label for="elevatorBonus">Bonus ascensor:</label>
                        <input type="number" id="elevatorBonus" value="${config.elevatorBonus}" min="0" max="20" step="1">
                    </div>
                    <div class="config-row">
                        <label for="elevatorPenalty">Penalización sin ascensor:</label>
                        <input type="number" id="elevatorPenalty" value="${config.elevatorPenalty}" min="0" max="50" step="1">
                    </div>
                </div>

                <div class="config-section">
                    <h3>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
                        </svg>
                        Configuración de Precio por m²
                    </h3>
                    <div class="config-row">
                        <label for="maxPricePerM2">Precio máximo por m² (€):</label>
                        <input type="number" id="maxPricePerM2" value="${config.maxPricePerM2}" min="5" max="20" step="0.5">
                    </div>
                    <div class="config-row">
                        <label for="pricePerM2Weight">Peso precio/m² (%):</label>
                        <input type="number" id="pricePerM2Weight" value="${config.pricePerM2Weight}" min="0" max="50" step="1">
                    </div>
                </div>

                <div class="config-section">
                    <h3>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <circle cx="12" cy="12" r="5"></circle>
                            <line x1="12" y1="1" x2="12" y2="3"></line>
                            <line x1="12" y1="21" x2="12" y2="23"></line>
                            <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
                            <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
                            <line x1="1" y1="12" x2="3" y2="12"></line>
                            <line x1="21" y1="12" x2="23" y2="12"></line>
                            <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
                            <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
                        </svg>
                        Configuración de Orientación
                    </h3>
                    <div class="config-row">
                        <label for="orientationWeight">Peso de orientación (%):</label>
                        <input type="number" id="orientationWeight" value="${config.orientationWeight}" min="0" max="50" step="1">
                    </div>
                    <div class="config-row">
                        <label for="eastBonus">Bonus Este:</label>
                        <input type="number" id="eastBonus" value="${config.eastBonus}" min="0" max="20" step="1">
                    </div>
                    <div class="config-row">
                        <label for="southBonus">Bonus Sur:</label>
                        <input type="number" id="southBonus" value="${config.southBonus}" min="0" max="20" step="1">
                    </div>
                    <div class="config-row">
                        <label for="westBonus">Bonus Oeste:</label>
                        <input type="number" id="westBonus" value="${config.westBonus}" min="0" max="20" step="1">
                    </div>
                    <div class="config-row">
                        <label for="northBonus">Bonus Norte:</label>
                        <input type="number" id="northBonus" value="${config.northBonus}" min="0" max="20" step="1">
                    </div>
                    <div class="config-row">
                        <label for="defaultOrientationBonus">Bonus orientación por defecto:</label>
                        <input type="number" id="defaultOrientationBonus" value="${config.defaultOrientationBonus}" min="0" max="20" step="1">
                    </div>
                </div>

                <div class="config-section">
                    <h3>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
                            <line x1="8" y1="21" x2="16" y2="21"></line>
                            <line x1="12" y1="17" x2="12" y2="21"></line>
                        </svg>
                        Configuración de Escritorio
                    </h3>
                    <div class="config-row">
                        <label for="deskWeight">Peso de escritorio (%):</label>
                        <input type="number" id="deskWeight" value="${config.deskWeight}" min="0" max="50" step="1">
                    </div>
                    <div class="config-row">
                        <label for="deskBonus">Bonus por escritorio:</label>
                        <input type="number" id="deskBonus" value="${config.deskBonus}" min="0" max="20" step="1">
                    </div>
                </div>
            </div>
        `;
    }

    getFormData() {
        const formData = {};
        const inputs = document.querySelectorAll('.config-form input');
        
        inputs.forEach(input => {
            const value = input.type === 'number' ? parseFloat(input.value) : input.value;
            formData[input.id] = value;
        });
        
        return formData;
    }

    validateConfiguration(config) {
        const errors = [];
        
        // Check if weights sum to reasonable total
        const totalWeight = config.priceWeight + config.sizeWeight + config.roomsWeight + 
                           config.bathroomsWeight + config.featuresWeight + config.pricePerM2Weight + 
                           config.orientationWeight + config.deskWeight;
        
        if (totalWeight > 100) {
            errors.push(`Los pesos suman ${totalWeight}%, que es más del 100%`);
        }
        
        // Check for negative values
        Object.entries(config).forEach(([key, value]) => {
            if (typeof value === 'number' && value < 0) {
                errors.push(`${key} no puede ser negativo`);
            }
        });
        
        return errors;
    }
}
