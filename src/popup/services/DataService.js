// DataService - Handles import/export functionality
export class DataService {
    constructor() {
        this.propertyManager = null;
    }

    setPropertyManager(propertyManager) {
        this.propertyManager = propertyManager;
    }

    async importData() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.tsv,.csv,.txt';
        
        input.onchange = async (event) => {
            const file = event.target.files[0];
            if (!file) return;

            try {
                const text = await file.text();
                const properties = await this.parseTSVData(text);
                
                if (properties.length === 0) {
                    return;
                }

                const response = await chrome.runtime.sendMessage({ 
                    action: 'importProperties', 
                    properties: properties 
                });

                if (response.success) {
                    this.propertyManager.properties = response.properties;
                    this.propertyManager.render();
                }
            } catch (error) {
                console.error('Error importing data:', error);
            }
        };

        input.click();
    }

    async parseTSVData(text) {
        const lines = text.trim().split('\n');
        if (lines.length < 2) return [];

        const headers = lines[0].split('\t');
        const properties = [];

        for (let i = 1; i < lines.length; i++) {
            const values = lines[i].split('\t');
            if (values.length < headers.length) continue;

            try {
                const property = {
                    id: values[0] || await this.generateId(),
                    url: values[1] || '',
                    title: values[2] || null,
                    price: values[3] ? parseFloat(values[3]) : null,
                    squareMeters: values[4] ? parseFloat(values[4]) : null,
                    rooms: values[5] ? parseInt(values[5]) : null,
                    bathrooms: values[6] ? parseInt(values[6]) : null,
                    floor: values[7] || null,
                    heating: values[8] === 'true',
                    furnished: values[9] === 'true',
                    elevator: values[10] === 'true',
                    seasonal: values[11] === 'true',
                    orientation: values[12] || null,
                    deposit: values[13] || null,
                    energyCert: values[14] || null,
                    lastUpdated: values[15] || null,
                    pricePerM2: values[16] ? parseFloat(values[16]) : null,
                    deposit: values[17] || null,
                    energyCert: values[18] || null,
                    lastUpdated: values[19] || null,
                    monthsMentioned: values[20] ? values[20].split(', ') : [],
                    coordinates: null
                };

                const lat = values[20] ? parseFloat(values[20]) : null;
                const lng = values[21] ? parseFloat(values[21]) : null;
                if (lat && lng) {
                    property.coordinates = { lat, lng };
                }

                // Calculate score
                property.score = this.calculatePropertyScore(property);
                properties.push(property);
            } catch (error) {
                console.error('Error parsing property:', error);
            }
        }

        return properties;
    }

    async generateId() {
        // Request a unique ID from the background script
        try {
            const response = await chrome.runtime.sendMessage({ 
                action: 'generateUniqueId' 
            });
            return response.id;
        } catch (error) {
            console.error('Error generating ID:', error);
            // Fallback to timestamp-based ID if background script is unavailable
            const timestamp = Date.now();
            const randomSuffix = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
            return `imported_${timestamp}_${randomSuffix}`;
        }
    }

    calculatePropertyScore(property) {
        let score = 0;

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

        return Math.round(score * 100) / 100;
    }

    async exportData() {
        if (!this.propertyManager || this.propertyManager.properties.length === 0) {
            return;
        }

        try {
            const sortedProperties = [...this.propertyManager.properties].sort((a, b) => b.score - a.score);
            const tsvContent = this.generateTSVContent(sortedProperties);
            
            const blob = new Blob([tsvContent], { type: 'text/tab-separated-values' });
            const url = URL.createObjectURL(blob);
            
            const a = document.createElement('a');
            a.href = url;
            a.download = `propiedades_ordenadas_por_score_${new Date().toISOString().split('T')[0]}.tsv`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Error exporting data:', error);
        }
    }

    generateTSVContent(properties) {
        const headers = [
            'ID',
            'URL',
            'Título',
            'Precio_€',
            'Metros_Cuadrados',
            'Habitaciones',
            'Baños',
            'Piso',
            'Calefacción',
            'Amueblado',
            'Ascensor',
            'Temporada',
            'Orientación',
            'Fianza',
            'Certificado_Energético',
            'Última_Actualización',
            'Precio_por_m2_€',
            'Fianza',
            'Certificado_Energético',
            'Última_Actualización',
            'Meses_Mencionados',
            'Coordenadas_Latitud',
            'Coordenadas_Longitud'
        ];

        const rows = properties.map((property, index) => [
            property.id || '',
            property.url || '',
            this.getPropertyValue(property.title),
            this.getPropertyValue(property.price),
            this.getPropertyValue(property.squareMeters),
            this.getPropertyValue(property.rooms),
            this.getPropertyValue(property.bathrooms),
            this.getPropertyValue(property.floor),
            this.getPropertyValue(property.heating),
            this.getPropertyValue(property.furnished),
            this.getPropertyValue(property.elevator),
            this.getPropertyValue(property.seasonal),
            this.getPropertyValue(property.orientation),
            this.getPropertyValue(property.deposit),
            this.getPropertyValue(property.energyCert),
            this.getPropertyValue(property.lastUpdated),
            this.getPropertyValue(property.pricePerM2),
            this.getPropertyValue(property.deposit),
            this.getPropertyValue(property.energyCert),
            this.getPropertyValue(property.lastUpdated),
            this.getPropertyValue(property.monthsMentioned),
            this.getCoordinates(property.coordinates, 'lat'),
            this.getCoordinates(property.coordinates, 'lng')
        ]);

        return [headers, ...rows].map(row => row.join('\t')).join('\n');
    }

    getPropertyValue(value) {
        if (value === null || value === undefined) return '';
        if (Array.isArray(value)) return value.join(', ');
        if (typeof value === 'boolean') return value.toString();
        if (typeof value === 'number') return value.toString();
        return value.toString();
    }

    getCoordinates(coordinates, type) {
        if (!coordinates) return '';
        return type === 'lat' ? coordinates.lat.toString() : coordinates.lng.toString();
    }


}
