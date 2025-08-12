// Idea-lista Content Script
(function() {
    'use strict';

    // Spanish month names for detection
    const months = [
        'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
        'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
    ];

    // Function to extract text content safely
    function getTextContent(element) {
        return element ? element.textContent.trim() : '';
    }

    // Function to extract numeric value from text
    function extractNumber(text) {
        // Remove all non-numeric characters except dots and commas
        const cleanText = text.replace(/[^\d.,]/g, '');
        
        // Handle Spanish number format (1.450 = 1450)
        if (cleanText.includes('.')) {
            // If there are multiple dots, it's likely Spanish format (1.450)
            const parts = cleanText.split('.');
            if (parts.length > 2) {
                // Spanish format: 1.450 -> 1450
                return parseInt(parts.join(''));
            } else if (parts.length === 2) {
                // Could be decimal: 1.45 -> 1.45
                const decimalPart = parts[1];
                if (decimalPart.length <= 2) {
                    // Likely decimal format
                    return parseFloat(cleanText.replace(',', '.'));
                } else {
                    // Likely Spanish format with thousands separator
                    return parseInt(parts.join(''));
                }
            }
        }
        
        // Default parsing
        return parseFloat(cleanText.replace(',', '.'));
    }

    // Function to detect months in text
    function detectMonths(text) {
        const detectedMonths = [];
        const lowerText = text.toLowerCase();
        
        months.forEach(month => {
            if (lowerText.includes(month)) {
                detectedMonths.push(month.charAt(0).toUpperCase() + month.slice(1));
            }
        });
        
        return detectedMonths;
    }

    // Function to extract coordinates from Google Maps response
    function extractCoordinates(info) {
        try {
            // Look for Google Maps API responses in the page
            const scripts = document.querySelectorAll('script');
            let coordinatesFound = false;
            
            scripts.forEach(script => {
                if (script.textContent && !coordinatesFound) {
                    // Look for coordinates pattern in the response
                    const coordMatch = script.textContent.match(/\[\[null,null,([-\d.]+),([-\d.]+)\],\d+\]/);
                    if (coordMatch) {
                        const lat = parseFloat(coordMatch[1]);
                        const lng = parseFloat(coordMatch[2]);
                        
                        if (lat && lng && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
                            info.coordinates = { lat, lng };
                            
                            // Create Google Maps URL
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
                            
                            info.googleMapsUrl = `https://www.google.com/maps/place/${latFormatted}+${lngFormatted}/`;
                            
                            coordinatesFound = true;
                            console.log('Coordinates extracted:', info.coordinates);
                            console.log('Google Maps URL:', info.googleMapsUrl);
                        }
                    }
                }
            });
            
            // Alternative: Look for coordinates in network requests
            if (!coordinatesFound) {
                // Try to find coordinates in any data attributes or hidden elements
                const mapElements = document.querySelectorAll('[data-lat], [data-lng], [data-coordinates]');
                mapElements.forEach(element => {
                    if (!coordinatesFound) {
                        const lat = parseFloat(element.getAttribute('data-lat') || element.getAttribute('data-coordinates')?.split(',')[0]);
                        const lng = parseFloat(element.getAttribute('data-lng') || element.getAttribute('data-coordinates')?.split(',')[1]);
                        
                        if (lat && lng && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
                            info.coordinates = { lat, lng };
                            
                            // Create Google Maps URL
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
                            
                            info.googleMapsUrl = `https://www.google.com/maps/place/${latFormatted}+${lngFormatted}/`;
                            
                            coordinatesFound = true;
                            console.log('Coordinates extracted from data attributes:', info.coordinates);
                            console.log('Google Maps URL:', info.googleMapsUrl);
                        }
                    }
                });
            }
            
        } catch (error) {
            console.log('Error extracting coordinates:', error);
        }
    }

    // Function to extract property information
    function extractPropertyInfo() {
        const info = {
            url: window.location.href,
            title: null,
            price: null,
            squareMeters: null,
            rooms: null,
            bathrooms: null,
            floor: null,
            orientation: null,
            furnished: null,
            heating: null,
            elevator: null,
            professional: null,
    
            lastUpdated: null,
            monthsMentioned: [],
            seasonal: null,
            energyCert: null,
            pricePerM2: null,
            deposit: null,
            desk: null,
            coordinates: null,
            googleMapsUrl: null
        };

        // Extract price
        const priceElement = document.querySelector('.info-data-price');
        if (priceElement) {
            const priceText = getTextContent(priceElement);
            info.price = extractNumber(priceText);
            console.log('Price extraction:', { original: priceText, extracted: info.price });
        }

        // Extract title
        const propertyTitleElement = document.querySelector('.main-info__title-main, h1');
        if (propertyTitleElement) {
            let title = getTextContent(propertyTitleElement);
            
            // Remove common prefixes
            title = title.replace(/^Alquiler de piso en /i, '');
            title = title.replace(/^Alquiler de habitación en /i, '');
            
            info.title = title;
            console.log('Title extraction:', info.title);
        }

        // Extract square meters
        const featuresElement = document.querySelector('.info-features');
        if (featuresElement) {
            const featuresText = getTextContent(featuresElement);
            const m2Match = featuresText.match(/(\d+)\s*m²/);
            if (m2Match) {
                info.squareMeters = parseInt(m2Match[1]);
            }
        }

        // Extract rooms and bathrooms
        if (featuresElement) {
            const featuresText = getTextContent(featuresElement);
            const roomsMatch = featuresText.match(/(\d+)\s*hab\./);
            if (roomsMatch) {
                info.rooms = parseInt(roomsMatch[1]);
            }
        }

        // Extract floor information
        if (featuresElement) {
            const featuresText = getTextContent(featuresElement);
            const floorMatch = featuresText.match(/Planta\s*(\d+)/i);
            if (floorMatch) {
                info.floor = floorMatch[1];
            }
        }

        // Extract elevator information
        if (featuresElement) {
            const featuresText = getTextContent(featuresElement);
            info.elevator = featuresText.toLowerCase().includes('ascensor');
        }

        // Extract basic characteristics
        const basicFeatures = document.querySelector('.details-property-feature-one .details-property_features ul');
        if (basicFeatures) {
            const featuresList = basicFeatures.querySelectorAll('li');
            featuresList.forEach(feature => {
                const featureText = getTextContent(feature);
                if (featureText.includes('Orientación')) {
                    info.orientation = featureText.replace('Orientación', '').trim();
                }
                if (featureText.includes('Amueblado')) {
                    info.furnished = featureText.includes('Amueblado');
                }
                if (featureText.includes('Calefacción')) {
                    info.heating = featureText.includes('Calefacción');
                }
                // Extract bathrooms
                const bathroomsMatch = featureText.match(/(\d+)\s*baños?/i);
                if (bathroomsMatch) {
                    info.bathrooms = parseInt(bathroomsMatch[1]);
                }
            });
        }

        // Extract desk information from description
        const descriptionElement = document.querySelector('.comment');
        if (descriptionElement) {
            const descriptionText = getTextContent(descriptionElement).toLowerCase();
            
            // Look for desk-related keywords
            const deskKeywords = [
                'escritorio', 'escritorios', 'desk', 'desks', 'mesa de trabajo', 
                'mesas de trabajo', 'oficina', 'zona de trabajo', 'espacio de trabajo',
                'rincón de trabajo', 'área de trabajo', 'puesto de trabajo'
            ];
            
            let deskCount = 0;
            deskKeywords.forEach(keyword => {
                const matches = descriptionText.match(new RegExp(keyword, 'gi'));
                if (matches) {
                    deskCount += matches.length;
                }
            });
            
            // Also look for specific numbers
            const deskNumberMatch = descriptionText.match(/(\d+)\s*(escritorio|desk|mesa de trabajo)/gi);
            if (deskNumberMatch) {
                deskNumberMatch.forEach(match => {
                    const numberMatch = match.match(/(\d+)/);
                    if (numberMatch) {
                        deskCount = Math.max(deskCount, parseInt(numberMatch[1]));
                    }
                });
            }
            
            if (deskCount > 0) {
                info.desk = deskCount;
            }
        }

        // Extract professional information
        const professionalElement = document.querySelector('.professional-name .name');
        if (professionalElement) {
            info.professional = getTextContent(professionalElement);
        }



        // Extract last updated information
        const updateElement = document.querySelector('.date-update-text');
        if (updateElement) {
            info.lastUpdated = getTextContent(updateElement);
        }

        // Extract months mentioned in comments
        const commentElement = document.querySelector('.comment .adCommentsLanguage');
        if (commentElement) {
            const commentText = getTextContent(commentElement);
            info.monthsMentioned = detectMonths(commentText);
        }

        // Extract seasonal rental information
        const seasonalTags = document.querySelectorAll('.detail-info-tags .tag, .tag');
        seasonalTags.forEach(tag => {
            const tagText = getTextContent(tag).toLowerCase();
            if (tagText.includes('temporada') || tagText.includes('vacacional') || tagText.includes('vacaciones')) {
                info.seasonal = true;
            }
        });

        // Also check in the main title and description
        const titleElement = document.querySelector('.main-info__title-main, h1');
        if (titleElement) {
            const titleText = getTextContent(titleElement).toLowerCase();
            if (titleText.includes('temporada') || titleText.includes('vacacional') || titleText.includes('vacaciones')) {
                info.seasonal = true;
            }
        }

        // Check in the comment text as well
        if (commentElement) {
            const commentText = getTextContent(commentElement).toLowerCase();
            if (commentText.includes('temporada') || commentText.includes('vacacional') || commentText.includes('vacaciones')) {
                info.seasonal = true;
            }
        }

        // Default to false if not found
        if (info.seasonal === null) {
            info.seasonal = false;
        }

        // Extract energy certificate
        const energyCertElement = document.querySelector('.details-property-feature-two .details-property_features ul li');
        if (energyCertElement) {
            const energyText = getTextContent(energyCertElement);
            if (energyText && energyText !== 'En trámite') {
                info.energyCert = energyText;
            }
        }

        // Extract price per m² and deposit
        const priceFeatures = document.querySelector('.price-features__container');
        if (priceFeatures) {
            const pricePerM2Element = priceFeatures.querySelector('.squaredmeterprice');
            if (pricePerM2Element) {
                const pricePerM2Text = getTextContent(pricePerM2Element);
                const pricePerM2Match = pricePerM2Text.match(/(\d+[.,]\d+)\s*€\/m²/);
                if (pricePerM2Match) {
                    info.pricePerM2 = parseFloat(pricePerM2Match[1].replace(',', '.'));
                }
            }

            const depositElement = priceFeatures.querySelector('.flex-feature:not(.squaredmeterprice)');
            if (depositElement) {
                const depositText = getTextContent(depositElement);
                if (depositText.includes('Fianza')) {
                    info.deposit = depositText;
                }
            }
        }

        // Extract coordinates from Google Maps response
        extractCoordinates(info);

        return info;
    }

    // Function to create the analysis table (compact chip layout)
    function createAnalysisTable(info, isAlreadyAdded = false) {
        const container = document.createElement('div');
        container.id = 'idea-lista-analyzer-table';
        container.className = 'analyzer-container analyzer-compact';

        const row = document.createElement('div');
        row.className = 'analyzer-row';

        const inline = document.createElement('div');
        inline.className = 'analyzer-inline';

        // helpers
        const formatPriceEUR = (n) => n != null ? n.toLocaleString('es-ES') + '€' : 'N/A';
        function addChip(text, className, title) {
            if (!text) return;
            const span = document.createElement('span');
            span.className = `chip ${className || ''}`.trim();
            span.textContent = text;
            if (title) span.title = title;
            inline.appendChild(span);
        }

        // main chips
        addChip(info.price != null ? formatPriceEUR(info.price) : null, 'price');
        addChip(info.squareMeters ? `${info.squareMeters}m²` : null, 'size');
        addChip(info.rooms ? `${info.rooms}hab` : null, 'rooms');
        addChip(info.bathrooms ? `${info.bathrooms}baño` : null, 'bathrooms');
        addChip(info.floor ? `P${info.floor}` : null, 'floor');

        if (info.heating) addChip('Calefacción', 'heating');
        if (info.furnished) addChip('Amueblado', 'furnished');
        if (info.elevator) addChip('Ascensor', 'elevator');
        if (info.seasonal) addChip('Temporada', 'seasonal');
        if (info.orientation) addChip(info.orientation, 'orientation');
        if (info.desk) addChip(`${info.desk} escritorio${info.desk > 1 ? 's' : ''}`, 'desk');

        if (info.professional) addChip(info.professional, 'pro');


        // Add coordinates chip if available
        if (info.coordinates) {
            const coordChip = document.createElement('span');
            coordChip.className = 'chip coordinates';
            coordChip.innerHTML = `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg> ${info.coordinates.lat.toFixed(6)}, ${info.coordinates.lng.toFixed(6)}`;
            coordChip.title = 'Haz clic para abrir en Google Maps';
            coordChip.style.cursor = 'pointer';
            coordChip.onclick = () => {
                if (info.googleMapsUrl) {
                    window.open(info.googleMapsUrl, '_blank');
                }
            };
            inline.appendChild(coordChip);
        }

        if (info.pricePerM2) addChip(`${info.pricePerM2}€/m²`, 'price-m2');
        if (info.deposit) addChip(info.deposit, 'deposit');
        if (info.energyCert) addChip(info.energyCert, 'energy');

        if (info.lastUpdated) addChip(info.lastUpdated, 'muted', info.lastUpdated);
        if (info.monthsMentioned && info.monthsMentioned.length > 0) {
            addChip(`Meses: ${info.monthsMentioned.join(', ')}`, 'muted');
        }

        // property id
        try {
            const urlParts = info.url.split('/');
            const propertyId = urlParts[urlParts.length - 2] || '';
            if (propertyId) addChip(`ID: ${propertyId}`, 'id muted');
        } catch (e) {}

        // Add AI prompt button
        const aiPromptButton = document.createElement('button');
        aiPromptButton.className = 'analyzer-ai-prompt-btn analyzer-ai-prompt-btn--compact';
        aiPromptButton.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path><path d="M8 9h8"></path><path d="M8 13h6"></path></svg>';
        aiPromptButton.style.backgroundColor = '#6f42c1';
        aiPromptButton.onclick = () => generateAIPrompt(info);
        aiPromptButton.title = 'Generar mensaje para el propietario';

        // Add button
        const addButton = document.createElement('button');
        addButton.className = 'analyzer-add-btn analyzer-add-btn--compact';
        
        if (isAlreadyAdded) {
            addButton.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 12l2 2 4-4"></path><circle cx="12" cy="12" r="10"></circle></svg>';
            addButton.style.backgroundColor = '#28a745';
            addButton.disabled = true;
            addButton.title = 'Esta propiedad ya está en tu gestor';
        } else {
            addButton.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>';
            addButton.style.backgroundColor = '#007bff';
            addButton.onclick = () => addToManager(info);
            addButton.title = 'Agregar al gestor de propiedades';
        }

        row.appendChild(inline);
        row.appendChild(aiPromptButton);
        row.appendChild(addButton);
        container.appendChild(row);
        return container;
    }

    // Function to add property to manager
    function addToManager(info) {
        // Send property data to background script
        chrome.runtime.sendMessage({
            action: 'addProperty',
            property: info
        }, (response) => {
            if (response && response.success) {
                // Show success message and update button permanently
                const button = document.querySelector('.analyzer-add-btn');
                
                button.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 12l2 2 4-4"></path><circle cx="12" cy="12" r="10"></circle></svg>';
                button.style.backgroundColor = '#28a745';
                button.disabled = true;
                button.title = 'Esta propiedad ya está en tu gestor';
                
                // Remove the onclick handler since it's now added
                button.onclick = null;
                
                // Show a notification that the popup has been updated
                showNotification('Propiedad agregada al gestor. Abre el popup para verla.');
            } else {
                // Show error message
                const button = document.querySelector('.analyzer-add-btn');
                const originalText = button.textContent;
                const originalBg = button.style.backgroundColor;
                
                button.textContent = '❌ Error';
                button.style.backgroundColor = '#dc3545';
                
                setTimeout(() => {
                    button.textContent = originalText;
                    button.style.backgroundColor = originalBg;
                }, 2000);
            }
        });
    }

    // Function to generate AI prompt from property data
    function generateAIPrompt(info) {
        const prompt = `Genera un mensaje personalizado y profesional para contactar al propietario de esta propiedad. El mensaje debe ser cordial, específico sobre la propiedad y mostrar interés genuino.

**Datos de la Propiedad:**
- Precio: ${info.price ? info.price.toLocaleString('es-ES') + '€' : 'No especificado'}
- Tamaño: ${info.squareMeters ? info.squareMeters + 'm²' : 'No especificado'}
- Habitaciones: ${info.rooms ? info.rooms : 'No especificado'}
- Baños: ${info.bathrooms ? info.bathrooms : 'No especificado'}
- Planta: ${info.floor ? 'P' + info.floor : 'No especificado'}
- Orientación: ${info.orientation ? info.orientation : 'No especificado'}
- Precio por m²: ${info.pricePerM2 ? info.pricePerM2 + '€/m²' : 'No especificado'}

**Características:**
${info.heating ? '- Calefacción' : ''}
${info.furnished ? '- Amueblado' : ''}
${info.elevator ? '- Ascensor' : ''}
${info.seasonal ? '- Alquiler temporal' : ''}
${info.desk ? `- ${info.desk} escritorio${info.desk > 1 ? 's' : ''}` : ''}

**Ubicación:**
${info.coordinates ? `- Coordenadas: ${info.coordinates.lat.toFixed(6)}, ${info.coordinates.lng.toFixed(6)}` : ''}
${info.title ? `- Dirección: ${info.title}` : ''}

**URL:** ${info.url}

Por favor, genera un mensaje que incluya:
1. Saludo profesional y presentación breve
2. Mencionar específicamente qué te gusta de la propiedad (usando los datos disponibles)
3. Explicar por qué te interesa esa ubicación/tipo de propiedad
4. Mencionar tu perfil como inquilino (responsable, trabajo remoto, etc.)
5. Solicitar información adicional o visita
6. Cierre cordial con datos de contacto

El mensaje debe ser natural, específico sobre esta propiedad y mostrar que has leído la descripción.`;

        // Copy to clipboard
        navigator.clipboard.writeText(prompt).then(() => {
            showNotification('Mensaje para propietario copiado al portapapeles. ¡Pégalo en tu IA favorita!');
        }).catch(() => {
            // Fallback for older browsers
            const textArea = document.createElement('textarea');
            textArea.value = prompt;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            showNotification('Mensaje para propietario copiado al portapapeles. ¡Pégalo en tu IA favorita!');
        });
    }

    // Function to show notification
    function showNotification(message) {
        // Remove existing notification if any
        const existingNotification = document.getElementById('idealista-notification');
        if (existingNotification) {
            existingNotification.remove();
        }

        const notification = document.createElement('div');
        notification.id = 'idealista-notification';
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: rgba(40, 167, 69, 0.95);
            backdrop-filter: blur(20px);
            -webkit-backdrop-filter: blur(20px);
            color: white;
            padding: 16px 24px;
            border-radius: 16px;
            border: 1px solid rgba(255, 255, 255, 0.1);
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
            z-index: 10000;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            font-size: 14px;
            font-weight: 500;
            max-width: 320px;
            animation: slideIn 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            cursor: pointer;
            transition: all 0.2s ease;
        `;
        notification.textContent = message;

        // Add animation styles
        const style = document.createElement('style');
        style.textContent = `
            @keyframes slideIn {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
        `;
        document.head.appendChild(style);

        document.body.appendChild(notification);

        // Auto-remove after 3 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 3000);
    }

    // Function to initialize the analyzer
    async function initAnalyzer() {
        // Remove existing table if present
        const existingTable = document.getElementById('idea-lista-analyzer-table');
        if (existingTable) {
            existingTable.remove();
        }

        // Extract property information
        const propertyInfo = extractPropertyInfo();
        
        // Debug logging
        console.log('Property analysis:', {
            price: propertyInfo.price,
            squareMeters: propertyInfo.squareMeters,
            rooms: propertyInfo.rooms,
            heating: propertyInfo.heating,

        });
        
        // Check if property is already in the manager
        const isAlreadyAdded = await checkIfPropertyExists(propertyInfo.url);
        
        // Create and insert the analysis table
        const table = createAnalysisTable(propertyInfo, isAlreadyAdded);
        
        // Insert before the detail-container
        const detailContainer = document.querySelector('.detail-container');
        if (detailContainer) {
            detailContainer.parentNode.insertBefore(table, detailContainer);
        }
        

    }



    // Function to check if property already exists in manager
    async function checkIfPropertyExists(propertyUrl) {
        try {
            const response = await chrome.runtime.sendMessage({ action: 'getProperties' });
            const properties = response.properties || [];
            return properties.some(property => property.url === propertyUrl);
        } catch (error) {
            console.error('Error checking if property exists:', error);
            return false;
        }
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initAnalyzer);
    } else {
        initAnalyzer();
    }

    // Listen for property updates from background script
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
        if (message.action === 'propertiesUpdated') {
            console.log('Content script: Received propertiesUpdated message');
            
            // Update button state based on current property
            updateButtonState(message.properties);
            
            // Optionally show a notification that the popup has been updated
            if (document.querySelector('.analyzer-add-btn') && 
                document.querySelector('.analyzer-add-btn').textContent === '✅ Agregado') {
                showNotification('El gestor de propiedades ha sido actualizado. Abre el popup para ver los cambios.');
            }
        }
    });

    // Function to update button state based on current property
    function updateButtonState(properties) {
        const currentUrl = window.location.href;
        const isAlreadyAdded = properties.some(property => property.url === currentUrl);
        const button = document.querySelector('.analyzer-add-btn');
        
        if (button) {
            if (isAlreadyAdded) {
                button.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 12l2 2 4-4"></path><circle cx="12" cy="12" r="10"></circle></svg>';
                button.style.backgroundColor = '#28a745';
                button.disabled = true;
                button.title = 'Esta propiedad ya está en tu gestor';
                button.onclick = null;
            } else {
                button.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>';
                button.style.backgroundColor = '#007bff';
                button.disabled = false;
                button.title = 'Agregar al gestor de propiedades';
                // Re-add the onclick handler
                const propertyInfo = extractPropertyInfo();
                button.onclick = () => addToManager(propertyInfo);
            }
        }
    }

    // Function to refresh button state (useful for navigation)
    async function refreshButtonState() {
        try {
            const response = await chrome.runtime.sendMessage({ action: 'getProperties' });
            const properties = response.properties || [];
            updateButtonState(properties);
        } catch (error) {
            console.error('Error refreshing button state:', error);
        }
    }

    // Re-initialize when page content changes (for SPA navigation)
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                // Check if detail-container was added
                const hasDetailContainer = Array.from(mutation.addedNodes).some(node => 
                    node.nodeType === 1 && (
                        node.classList?.contains('detail-container') ||
                        node.querySelector?.('.detail-container')
                    )
                );
                
                if (hasDetailContainer) {
                    setTimeout(initAnalyzer, 1000); // Small delay to ensure content is loaded
                }
            }
        });
    });

    // Also listen for URL changes (for SPA navigation)
    let currentUrl = window.location.href;
    const urlObserver = setInterval(() => {
        if (window.location.href !== currentUrl) {
            currentUrl = window.location.href;
            console.log('URL changed, refreshing analyzer');
            setTimeout(initAnalyzer, 500);
        }
    }, 1000);

    observer.observe(document.body, {
        childList: true,
        subtree: true
    });

})();
