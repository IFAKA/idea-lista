// Idealista Property Analyzer Content Script
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
            phone: null,
            lastUpdated: null,
            monthsMentioned: [],
            seasonal: null,
            energyCert: null,
            pricePerM2: null,
            deposit: null
        };

        // Extract price
        const priceElement = document.querySelector('.info-data-price');
        if (priceElement) {
            const priceText = getTextContent(priceElement);
            info.price = extractNumber(priceText);
            console.log('Price extraction:', { original: priceText, extracted: info.price });
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

        // Extract professional information
        const professionalElement = document.querySelector('.professional-name .name');
        if (professionalElement) {
            info.professional = getTextContent(professionalElement);
        }

        // Extract phone information
        const phoneElement = document.querySelector('.phone-number');
        if (phoneElement) {
            const phoneText = getTextContent(phoneElement);
            // Try to extract actual phone number from various sources
            if (phoneText && phoneText !== 'Llamar') {
                info.phone = phoneText;
            } else {
                // Look for phone number in hidden elements or data attributes
                const hiddenPhoneElement = document.querySelector('.phone-number[data-phone]');
                if (hiddenPhoneElement) {
                    info.phone = hiddenPhoneElement.getAttribute('data-phone');
                } else {
                    // Try to find phone in the contact section
                    const contactPhoneElement = document.querySelector('.contact-phone, .phone-btn, [class*="phone"]');
                    if (contactPhoneElement) {
                        const contactPhoneText = getTextContent(contactPhoneElement);
                        if (contactPhoneText && contactPhoneText !== 'Llamar' && contactPhoneText !== 'Ver teléfono') {
                            info.phone = contactPhoneText;
                        }
                    }
                }
            }
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

        return info;
    }

    // Function to create the analysis table (compact chip layout)
    function createAnalysisTable(info) {
        const container = document.createElement('div');
        container.id = 'idealista-analyzer-table';
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

        if (info.professional) addChip(info.professional, 'pro');
        if (info.phone) addChip(info.phone, 'phone');

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

        // copy button
        // Add button
        const addButton = document.createElement('button');
        addButton.className = 'analyzer-add-btn analyzer-add-btn--compact';
        addButton.textContent = '➕ Agregar';
        addButton.onclick = () => addToManager(info);

        row.appendChild(inline);
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
                // Show success message
                const button = document.querySelector('.analyzer-add-btn');
                const originalText = button.textContent;
                const originalBg = button.style.backgroundColor;
                
                button.textContent = '✅ Agregado';
                button.style.backgroundColor = '#28a745';
                button.disabled = true;
                
                setTimeout(() => {
                    button.textContent = originalText;
                    button.style.backgroundColor = originalBg;
                    button.disabled = false;
                }, 2000);
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

    // Function to initialize the analyzer
    function initAnalyzer() {
        // Remove existing table if present
        const existingTable = document.getElementById('idealista-analyzer-table');
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
            heating: propertyInfo.heating
        });
        
        // Create and insert the analysis table
        const table = createAnalysisTable(propertyInfo);
        
        // Insert before the detail-container
        const detailContainer = document.querySelector('.detail-container');
        if (detailContainer) {
            detailContainer.parentNode.insertBefore(table, detailContainer);
        }
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initAnalyzer);
    } else {
        initAnalyzer();
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

    observer.observe(document.body, {
        childList: true,
        subtree: true
    });

})();
