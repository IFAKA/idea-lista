// Content script for Idea-lista Chrome extension
// Extracts property data from Idealista.com pages

(function() {
  'use strict';

  // Check if we're on a property page
  function isPropertyPage() {
    return window.location.href.includes('idealista.com/inmueble/');
  }

  // Extract property data from the page
  function extractPropertyData() {
    try {
      const data = {
        id: generatePropertyId(),
        title: extractTitle(),
        price: extractPrice(),
        location: extractLocation(),
        rooms: extractRooms(),
        bathrooms: extractBathrooms(),
        floor: extractFloor(),
        url: window.location.href,
        squareMeters: extractSquareMeters(),
        elevator: extractFeature('elevator'),
        parking: extractFeature('parking'),
        heating: extractFeature('heating'),
        furnished: extractFeature('furnished'),
        imageUrl: extractImageUrl(),
        phone: extractPhone(),
        professional: extractProfessional(),
        contactPerson: extractContactPerson(),
        energyCert: extractEnergyCert(),
        orientation: extractOrientation(),
        pricePerM2: extractPricePerM2(),
        deposit: extractDeposit(),
        energy: extractEnergy(),
        maintenance: extractMaintenance(),
        condition: extractCondition(),
        propertySubType: extractPropertySubType()
      };

      return data;
    } catch (error) {
      console.error('Error extracting property data:', error);
      return null;
    }
  }

  // Helper functions for data extraction
  function generatePropertyId() {
    const url = window.location.href;
    const match = url.match(/\/inmueble\/([^\/]+)/);
    return match ? match[1] : Date.now().toString();
  }

  function extractTitle() {
    const titleElement = document.querySelector('h1.main-info__title-main, .info-title');
    return titleElement ? titleElement.textContent.trim() : '';
  }

  function extractPrice() {
    const priceElement = document.querySelector('.info-data-price, .price');
    if (!priceElement) return 0;
    
    const priceText = priceElement.textContent.trim();
    const match = priceText.match(/[\d.,]+/);
    return match ? parseInt(match[0].replace(/[.,]/g, '')) : 0;
  }

  function extractLocation() {
    const locationElement = document.querySelector('.main-info__title-minor, .location');
    return locationElement ? locationElement.textContent.trim() : '';
  }

  function extractRooms() {
    const roomsElement = document.querySelector('[data-testid="rooms"], .details-property-feature-one');
    if (!roomsElement) return 0;
    
    const text = roomsElement.textContent.trim();
    const match = text.match(/(\d+)/);
    return match ? parseInt(match[1]) : 0;
  }

  function extractBathrooms() {
    const bathroomsElement = document.querySelector('[data-testid="bathrooms"], .details-property-feature-two');
    if (!bathroomsElement) return 0;
    
    const text = bathroomsElement.textContent.trim();
    const match = text.match(/(\d+)/);
    return match ? parseInt(match[1]) : 0;
  }

  function extractFloor() {
    const floorElement = document.querySelector('[data-testid="floor"], .details-property-feature-three');
    return floorElement ? floorElement.textContent.trim() : '';
  }

  function extractSquareMeters() {
    const sizeElement = document.querySelector('[data-testid="size"], .details-property-feature-four');
    if (!sizeElement) return null;
    
    const text = sizeElement.textContent.trim();
    const match = text.match(/(\d+)/);
    return match ? parseInt(match[1]) : null;
  }

  function extractFeature(featureName) {
    const featureMap = {
      elevator: ['ascensor', 'elevator'],
      parking: ['parking', 'garaje', 'garage'],
      heating: ['calefacción', 'heating'],
      furnished: ['amueblado', 'furnished']
    };

    const keywords = featureMap[featureName] || [];
    const featuresText = document.body.textContent.toLowerCase();
    
    for (const keyword of keywords) {
      if (featuresText.includes(keyword)) {
        return 'has';
      }
    }
    
    return 'not_mentioned';
  }

  function extractImageUrl() {
    const imageElement = document.querySelector('.gallery-container img, .main-image img');
    return imageElement ? imageElement.src : null;
  }

  function extractPhone() {
    const phoneElement = document.querySelector('.phone-number, .contact-phone');
    return phoneElement ? phoneElement.textContent.trim() : null;
  }

  function extractProfessional() {
    const professionalElement = document.querySelector('.professional-name, .agent-name');
    return professionalElement ? professionalElement.textContent.trim() : null;
  }

  function extractContactPerson() {
    const contactElement = document.querySelector('.contact-person, .agent-contact');
    return contactElement ? contactElement.textContent.trim() : null;
  }

  function extractEnergyCert() {
    const energyElement = document.querySelector('.energy-certificate, .energy-rating');
    return energyElement ? energyElement.textContent.trim() : null;
  }

  function extractOrientation() {
    const orientationElement = document.querySelector('.orientation, .property-orientation');
    return orientationElement ? orientationElement.textContent.trim() : null;
  }

  function extractPricePerM2() {
    const pricePerM2Element = document.querySelector('.price-per-m2, .price-per-square-meter');
    if (!pricePerM2Element) return null;
    
    const text = pricePerM2Element.textContent.trim();
    const match = text.match(/[\d.,]+/);
    return match ? parseInt(match[0].replace(/[.,]/g, '')) : null;
  }

  function extractDeposit() {
    const depositElement = document.querySelector('.deposit, .fianza');
    if (!depositElement) return null;
    
    const text = depositElement.textContent.trim();
    const match = text.match(/[\d.,]+/);
    return match ? parseInt(match[0].replace(/[.,]/g, '')) : null;
  }

  function extractEnergy() {
    const energyElement = document.querySelector('.energy-consumption, .energy-class');
    return energyElement ? energyElement.textContent.trim() : null;
  }

  function extractMaintenance() {
    const maintenanceElement = document.querySelector('.maintenance, .community-fees');
    if (!maintenanceElement) return null;
    
    const text = maintenanceElement.textContent.trim();
    const match = text.match(/[\d.,]+/);
    return match ? parseInt(match[0].replace(/[.,]/g, '')) : null;
  }

  function extractCondition() {
    const conditionElement = document.querySelector('.condition, .property-condition');
    return conditionElement ? conditionElement.textContent.trim() : null;
  }

  function extractPropertySubType() {
    const subTypeElement = document.querySelector('.property-subtype, .property-category');
    return subTypeElement ? subTypeElement.textContent.trim() : null;
  }

  // Inject the property analyzer UI
  function injectPropertyAnalyzer() {
    if (!isPropertyPage()) return;

    // Remove existing analyzer if present
    const existingAnalyzer = document.getElementById('idea-lista-analyzer');
    if (existingAnalyzer) {
      existingAnalyzer.remove();
    }

    // Create analyzer container
    const analyzer = document.createElement('div');
    analyzer.id = 'idea-lista-analyzer';
    analyzer.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      width: 300px;
      background: white;
      border: 2px solid #3b82f6;
      border-radius: 8px;
      padding: 16px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      z-index: 10000;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      font-size: 14px;
    `;

    // Extract property data
    const propertyData = extractPropertyData();
    if (!propertyData) {
      analyzer.innerHTML = '<p style="color: red;">Error al extraer datos de la propiedad</p>';
      document.body.appendChild(analyzer);
      return;
    }

    // Create analyzer content
    analyzer.innerHTML = `
      <div style="margin-bottom: 12px;">
        <h3 style="margin: 0 0 8px 0; color: #1f2937; font-size: 16px; font-weight: 600;">
          🏠 Idea-lista Analyzer
        </h3>
        <p style="margin: 0; color: #6b7280; font-size: 12px;">
          ${propertyData.title}
        </p>
      </div>
      
      <div style="margin-bottom: 12px;">
        <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
          <span style="color: #374151;">Precio:</span>
          <span style="font-weight: 600; color: #059669;">${propertyData.price}€</span>
        </div>
        <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
          <span style="color: #374151;">Habitaciones:</span>
          <span>${propertyData.rooms}</span>
        </div>
        <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
          <span style="color: #374151;">Baños:</span>
          <span>${propertyData.bathrooms}</span>
        </div>
        ${propertyData.squareMeters ? `
        <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
          <span style="color: #374151;">Tamaño:</span>
          <span>${propertyData.squareMeters}m²</span>
        </div>
        ` : ''}
      </div>
      
      <div style="margin-bottom: 16px;">
        <div id="idea-lista-score" style="text-align: center; padding: 8px; background: #f3f4f6; border-radius: 4px;">
          <span style="font-size: 12px; color: #6b7280;">Calculando puntuación...</span>
        </div>
      </div>
      
      <div style="display: flex; gap: 8px;">
        <button id="idea-lista-add" style="
          flex: 1;
          padding: 8px 12px;
          background: #3b82f6;
          color: white;
          border: none;
          border-radius: 4px;
          font-size: 12px;
          font-weight: 500;
          cursor: pointer;
          transition: background 0.2s;
        " onmouseover="this.style.background='#2563eb'" onmouseout="this.style.background='#3b82f6'">
          ➕ Agregar a mi lista
        </button>
        <button id="idea-lista-close" style="
          padding: 8px;
          background: #f3f4f6;
          color: #6b7280;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 12px;
        " onmouseover="this.style.background='#e5e7eb'" onmouseout="this.style.background='#f3f4f6'">
          ✕
        </button>
      </div>
    `;

    // Add event listeners
    document.body.appendChild(analyzer);

    const addButton = document.getElementById('idea-lista-add');
    const closeButton = document.getElementById('idea-lista-close');

    addButton.addEventListener('click', () => {
      addPropertyToList(propertyData);
    });

    closeButton.addEventListener('click', () => {
      analyzer.remove();
    });

    // Calculate and display score
    calculateAndDisplayScore(propertyData);
  }

  // Calculate property score and display it
  function calculateAndDisplayScore(propertyData) {
    console.log('Sending calculateScore message to background script');
    // Send message to background script to calculate score
    chrome.runtime.sendMessage({
      action: 'calculateScore',
      propertyData: propertyData
    }, (response) => {
      if (chrome.runtime.lastError) {
        console.error('Error sending message:', chrome.runtime.lastError);
        const scoreElement = document.getElementById('idea-lista-score');
        if (scoreElement) {
          scoreElement.innerHTML = `
            <div style="font-size: 12px; color: #dc2626;">
              Error: No se pudo calcular la puntuación
            </div>
          `;
        }
        return;
      }
      
      if (response && response.score !== undefined) {
        console.log('Received score response:', response);
        const scoreElement = document.getElementById('idea-lista-score');
        if (scoreElement) {
          const score = response.score;
          let scoreColor = '#dc2626'; // red
          let scoreText = '🔴 Pobre';
          
          if (score >= 80) {
            scoreColor = '#059669'; // green
            scoreText = '🟢 Excelente';
          } else if (score >= 60) {
            scoreColor = '#2563eb'; // blue
            scoreText = '🔵 Bueno';
          } else if (score >= 40) {
            scoreColor = '#d97706'; // yellow
            scoreText = '🟡 Promedio';
          }
          
          scoreElement.innerHTML = `
            <div style="font-size: 18px; font-weight: 600; color: ${scoreColor};">
              ${score}/100
            </div>
            <div style="font-size: 12px; color: #6b7280;">
              ${scoreText}
            </div>
          `;
        }
      } else {
        console.error('Invalid response from background script:', response);
      }
    });
  }

  // Add property to the user's list
  function addPropertyToList(propertyData) {
    console.log('Sending addProperty message to background script');
    chrome.runtime.sendMessage({
      action: 'addProperty',
      propertyData: propertyData
    }, (response) => {
      if (chrome.runtime.lastError) {
        console.error('Error sending addProperty message:', chrome.runtime.lastError);
        alert('Error: No se pudo conectar con la extensión. Por favor, recarga la página.');
        return;
      }
      
      if (response && response.success) {
        console.log('Property added successfully:', response);
        const addButton = document.getElementById('idea-lista-add');
        if (addButton) {
          addButton.textContent = '✅ Agregado';
          addButton.style.background = '#059669';
          addButton.disabled = true;
          
          // Show the actual score that was stored
          if (response.score !== undefined) {
            const scoreElement = document.getElementById('idea-lista-score');
            if (scoreElement) {
              const score = response.score;
              let scoreColor = '#dc2626'; // red
              let scoreText = '🔴 Pobre';
              
              if (score >= 80) {
                scoreColor = '#059669'; // green
                scoreText = '🟢 Excelente';
              } else if (score >= 60) {
                scoreColor = '#2563eb'; // blue
                scoreText = '🔵 Bueno';
              } else if (score >= 40) {
                scoreColor = '#d97706'; // yellow
                scoreText = '🟡 Promedio';
              }
              
              scoreElement.innerHTML = `
                <div style="font-size: 18px; font-weight: 600; color: ${scoreColor};">
                  ${score}/100
                </div>
                <div style="font-size: 12px; color: #6b7280;">
                  ${scoreText} (Guardado)
                </div>
              `;
            }
          }
          
          setTimeout(() => {
            const analyzer = document.getElementById('idea-lista-analyzer');
            if (analyzer) {
              analyzer.remove();
            }
          }, 2000);
        }
      } else {
        console.error('Failed to add property:', response);
        alert('Error al agregar la propiedad a la lista: ' + (response?.error || 'Error desconocido'));
      }
    });
  }

  // Initialize the content script
  function init() {
    if (isPropertyPage()) {
      // Wait for page to load
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', injectPropertyAnalyzer);
      } else {
        // Small delay to ensure all elements are loaded
        setTimeout(injectPropertyAnalyzer, 1000);
      }
    }
  }

  // Start the content script
  init();

})();
