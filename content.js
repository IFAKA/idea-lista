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
            googleMapsUrl: null,
            image: null
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
            const featuresText = getTextContent(featuresElement).toLowerCase();
            // Check for "sin ascensor" first (explicitly no elevator)
            if (featuresText.includes('sin ascensor')) {
                info.elevator = false;
            } else if (featuresText.includes('ascensor')) {
                // Only set to true if it mentions ascensor but not "sin ascensor"
                info.elevator = true;
            } else {
                // Default to false if no mention
                info.elevator = false;
            }
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
            
            // Also check for elevator information in description as backup
            if (info.elevator === null || info.elevator === undefined) {
                if (descriptionText.includes('sin ascensor')) {
                    info.elevator = false;
                } else if (descriptionText.includes('ascensor')) {
                    info.elevator = true;
                }
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

        // Extract property image
        const mainImageElement = document.querySelector('.main-image img, .main-image_first img');
        if (mainImageElement) {
            const imageSrc = mainImageElement.src;
            if (imageSrc && imageSrc !== 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTIxIDEwYzAgNy05IDEzLTkgMTNzLTktNi05LTEzYTkgOSAwIDAgMSAxOCAweiIgc3Ryb2tlPSJjdXJyZW50Q29sb3IiIHN0cm9rZS13aWR0aD0iMiIvPgo8Y2lyY2xlIGN4PSIxMiIgY3k9IjEwIiByPSIzIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIi8+Cjwvc3ZnPgo=') {
                info.image = imageSrc;
                console.log('Property image extracted:', info.image);
            }
        }



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
        aiPromptButton.className = 'analyzer-ai-prompt-btn analyzer-ai-prompt-btn--compact particle-burst';
        aiPromptButton.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path><path d="M8 9h8"></path><path d="M8 13h6"></path></svg>';
        aiPromptButton.style.backgroundColor = '#6f42c1';
        aiPromptButton.onclick = (event) => {
            createParticleAnimation(event);
            generateAIPrompt(info);
        };
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
            // Success - no notification needed, button state shows success
        }).catch(() => {
            // Fallback for older browsers
            const textArea = document.createElement('textarea');
            textArea.value = prompt;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            // Success - no notification needed, button state shows success
        });
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
            
            // No notification needed - button state shows the current status
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

    // Apple Watch Particle Animation Function
    function createParticleAnimation(event) {
        // Check if user prefers reduced motion
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            return;
        }

        const button = event.currentTarget;
        const rect = button.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        // Create particle container if it doesn't exist
        let particleContainer = document.querySelector('.particle-container');
        if (!particleContainer) {
            particleContainer = document.createElement('div');
            particleContainer.className = 'particle-container';
            document.body.appendChild(particleContainer);
        }

        // Create particles with enhanced animation
        const particleCount = 16; // Increased particle count
        const animationTypes = ['particleFloat1', 'particleFloat2', 'particleFloat3', 'particleFloat4', 'particleFloat5'];
        
        for (let i = 0; i < particleCount; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';
            
            // Calculate random angle and distance for particle spread
            const angle = (i / particleCount) * 2 * Math.PI + (Math.random() - 0.5) * 0.3;
            const distance = 8 + Math.random() * 12; // Reduced spread area
            const startX = centerX + Math.cos(angle) * distance;
            const startY = centerY + Math.sin(angle) * distance;
            
            // Generate random movement variations for each particle
            const randomDelay = Math.random() * 50; // 0-50ms delay for staggered effect
            const randomDuration = 250 + Math.random() * 100; // 250-350ms duration (300ms average)
            const animationType = animationTypes[i % animationTypes.length]; // Cycle through animation types
            
            // Set initial position
            particle.style.left = startX + 'px';
            particle.style.top = startY + 'px';
            
            // Apply enhanced animation with compliant easing
            particle.style.animationDelay = `${randomDelay}ms`;
            particle.style.animationDuration = `${randomDuration}ms`;
            particle.style.animationName = animationType;
            particle.style.animationTimingFunction = 'cubic-bezier(0.25, 0.46, 0.45, 0.94)';
            particle.style.animationFillMode = 'forwards';
            
            // Add subtle rotation for more dynamic movement
            const rotation = (Math.random() - 0.5) * 360;
            particle.style.transform = `var(--transform-base) rotate(${rotation}deg)`;
            
            // Add to container
            particleContainer.appendChild(particle);
            
            // Remove particle after animation completes
            setTimeout(() => {
                if (particle.parentNode) {
                    particle.parentNode.removeChild(particle);
                }
            }, randomDuration + randomDelay + 100); // Extra buffer for cleanup
        }

        // Clean up particle container if empty
        setTimeout(() => {
            if (particleContainer && particleContainer.children.length === 0) {
                particleContainer.remove();
            }
        }, 500); // Cleanup timeout for faster animations
    }

})();
