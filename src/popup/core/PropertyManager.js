// PropertyManager - Core class for managing properties
import { UIService } from '../services/UIService.js';
import { ScoringService } from '../services/ScoringService.js';
import { DataService } from '../services/DataService.js';
import { ModalService } from '../services/ModalService.js';
import { ConfigurationService } from '../services/ConfigurationService.js';

export class PropertyManager {
        constructor() {
        this.properties = [];
        this.initialized = false;
        this.messageListener = null;

        // Initialize services
        this.uiService = new UIService(this);
        this.scoringService = new ScoringService();
        this.dataService = new DataService();
        this.modalService = new ModalService();
        this.configService = new ConfigurationService();

        // Connect services to PropertyManager
        this.dataService.setPropertyManager(this);
        this.modalService.setPropertyManager(this);
        this.configService.setPropertyManager(this);

        this.init();
    }

    async init() {
        if (this.initialized) {
            console.log('Popup: Already initialized, skipping init');
            return;
        }
        
        console.log('Popup: Initializing...');
        await this.loadProperties();
        this.setupEventListeners();
        this.setupMessageListener();
        this.render();
        
        if (this.properties.length === 0) {
            this.uiService.disableStatsBarButtons();
        }
        
        this.initialized = true;
        console.log('Popup: Initialization complete');
    }

    setupEventListeners() {
        document.getElementById('configBtn').addEventListener('click', () => this.showConfiguration());
        document.getElementById('importBtn').addEventListener('click', () => this.dataService.importData());
        document.getElementById('exportBtn').addEventListener('click', () => this.dataService.exportData());
        document.getElementById('clearBtn').addEventListener('click', () => this.clearAll());
        

        document.getElementById('avgScore').addEventListener('click', () => this.showScoringBreakdown());
        document.getElementById('totalProperties').addEventListener('click', () => this.showPropertiesMetrics());
    }

    setupMessageListener() {
        if (this.messageListener) {
            chrome.runtime.onMessage.removeListener(this.messageListener);
        }
        
        this.messageListener = (message, sender, sendResponse) => {
            if (message.action === 'propertiesUpdated') {
                console.log('Popup: Received propertiesUpdated message with', message.properties.length, 'properties');
                this.properties = message.properties;
                this.render();
            }
        };
        
        chrome.runtime.onMessage.addListener(this.messageListener);
        
        window.addEventListener('focus', () => {
            console.log('Popup: Window focused, refreshing properties');
            this.refreshProperties();
        });
    }

    async refreshProperties() {
        if (this.initialized) {
            await this.loadProperties();
            this.render();
        }
    }

    async loadProperties() {
        try {
            const response = await chrome.runtime.sendMessage({ action: 'getProperties' });
            this.properties = response.properties || [];
            console.log('Popup: Loaded', this.properties.length, 'properties');
        } catch (error) {
            console.error('Popup: Error loading properties:', error);
            this.properties = [];
        }
    }



    async clearAll() {
        this.modalService.showClearConfirmationModal();
    }

    async performClearAll() {
        try {
            const response = await chrome.runtime.sendMessage({ action: 'clearProperties' });
            if (response.success) {
                this.properties = [];
                this.render();
            }
        } catch (error) {
            console.error('Popup: Error clearing properties:', error);
        }
    }

    showScoringBreakdown() {
        const avgScores = this.scoringService.calculateAverageScores(this.properties);
        const scoringDetails = this.scoringService.generateScoringDetails(avgScores);
        this.modalService.showScoringModal(scoringDetails);
    }

    showBestProperty() {
        if (this.properties.length === 0) {
            return;
        }
        
        const bestProperty = this.properties.reduce((best, current) => 
            current.score > best.score ? current : best
        );
        
        this.modalService.showPropertyDetailsModal(bestProperty);
    }

    showPropertiesMetrics() {
        if (this.properties.length === 0) {
            return;
        }
        
        const metrics = this.scoringService.calculatePropertiesMetrics(this.properties);
        this.modalService.showPropertiesMetricsModal(metrics);
    }

    async showConfiguration() {
        try {
            // Load current configuration
            await this.configService.loadConfiguration();
            
            // Get configuration form
            const configForm = this.configService.getConfigurationForm();
            
            // Show configuration modal
            this.modalService.showConfigurationModal(configForm);
            
            // Setup configuration form event listeners
            this.setupConfigurationListeners();
        } catch (error) {
            console.error('Error showing configuration:', error);
        }
    }

    setupConfigurationListeners() {
        // Save configuration button
        const saveBtn = document.getElementById('saveConfigBtn');
        if (saveBtn) {
            saveBtn.addEventListener('click', async () => {
                await this.saveConfiguration();
            });
        }

        // Reset configuration button
        const resetBtn = document.getElementById('resetConfigBtn');
        if (resetBtn) {
            resetBtn.addEventListener('click', () => {
                this.resetConfiguration();
            });
        }
    }

    async saveConfiguration() {
        try {
            // Get form data
            const formData = this.configService.getFormData();
            
            // Validate configuration
            const errors = this.configService.validateConfiguration(formData);
            
            if (errors.length > 0) {
                alert('Errores en la configuración:\n' + errors.join('\n'));
                return;
            }
            
            // Save configuration
            const success = await this.configService.saveConfiguration(formData);
            
            if (success) {
                // Update button state to show success
                const saveBtn = document.getElementById('saveConfigBtn');
                if (saveBtn) {
                    const originalText = saveBtn.innerHTML;
                    saveBtn.innerHTML = `
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polyline points="20,6 9,17 4,12"></polyline>
                        </svg>
                        Guardado
                    `;
                    saveBtn.classList.remove('btn-primary');
                    saveBtn.classList.add('btn-success');
                    saveBtn.disabled = true;
                    
                    // Reset button state after 2 seconds
                    setTimeout(() => {
                        saveBtn.innerHTML = originalText;
                        saveBtn.classList.remove('btn-success');
                        saveBtn.classList.add('btn-primary');
                        saveBtn.disabled = false;
                    }, 2000);
                }
                
                // Update scoring service with new configuration
                this.scoringService.updateConfiguration(formData);
            } else {
                alert('Error al guardar la configuración');
            }
        } catch (error) {
            console.error('Error saving configuration:', error);
            alert('Error al guardar la configuración');
        }
    }

    resetConfiguration() {
        if (confirm('¿Estás seguro de que quieres restablecer los pesos a valores por defecto y limpiar los otros campos?')) {
            // Reset weights to default values
            const weightInputs = document.querySelectorAll('.config-form input[id*="Weight"], .config-form input[id*="Bonus"], .config-form input[id*="Penalty"]');
            const defaultConfig = this.configService.defaultConfig;
            
            weightInputs.forEach(input => {
                if (defaultConfig[input.id] !== undefined) {
                    input.value = defaultConfig[input.id];
                }
            });
            
            // Clear other fields (budget, sizes, rooms, etc.)
            const otherInputs = document.querySelectorAll('.config-form input[id*="maxBudget"], .config-form input[id*="minSize"], .config-form input[id*="minRooms"], .config-form input[id*="minBathrooms"], .config-form input[id*="maxPricePerM2"]');
            
            otherInputs.forEach(input => {
                input.value = '';
            });
        }
    }

    render() {
        const propertiesList = document.getElementById('propertiesList');
        const emptyState = document.getElementById('emptyState');
        
        if (this.properties.length === 0) {
            propertiesList.style.display = 'none';
            emptyState.style.display = 'block';
            this.uiService.disableStatsBarButtons();
            return;
        }

        propertiesList.style.display = 'block';
        emptyState.style.display = 'none';

        this.uiService.updateStats(this.properties);
        this.uiService.enableStatsBarButtons();

        const newHTML = this.properties.map(property => this.uiService.renderProperty(property)).join('');
        
        if (propertiesList.innerHTML !== newHTML) {
            console.log('Popup: Updating properties list HTML');
            propertiesList.innerHTML = newHTML;
            this.uiService.setupPropertyButtonListeners();
        } else {
            console.log('Popup: Properties list unchanged, skipping DOM update');
        }
    }
}
