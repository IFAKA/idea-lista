// Idea-lista Content Script
(function () {
  "use strict";

  // Spanish month names for detection
  const months = [
    "enero",
    "febrero",
    "marzo",
    "abril",
    "mayo",
    "junio",
    "julio",
    "agosto",
    "septiembre",
    "octubre",
    "noviembre",
    "diciembre",
  ];

  // Function to extract text content safely
  function getTextContent(element) {
    return element ? element.textContent.trim() : "";
  }

  // Function to extract numeric value from text
  function extractNumber(text) {
    // Remove all non-numeric characters except dots and commas
    const cleanText = text.replace(/[^\d.,]/g, "");

    // Handle Spanish number format (1.450 = 1450)
    if (cleanText.includes(".")) {
      // If there are multiple dots, it's likely Spanish format (1.450)
      const parts = cleanText.split(".");
      if (parts.length > 2) {
        // Spanish format: 1.450 -> 1450
        return parseInt(parts.join(""));
      } else if (parts.length === 2) {
        // Could be decimal: 1.45 -> 1.45
        const decimalPart = parts[1];
        if (decimalPart.length <= 2) {
          // Likely decimal format
          return parseFloat(cleanText.replace(",", "."));
        } else {
          // Likely Spanish format with thousands separator
          return parseInt(parts.join(""));
        }
      }
    }

    // Default parsing
    return parseFloat(cleanText.replace(",", "."));
  }

  // Function to detect months in text
  function detectMonths(text) {
    const detectedMonths = [];
    const lowerText = text.toLowerCase();

    months.forEach((month) => {
      if (lowerText.includes(month)) {
        detectedMonths.push(month.charAt(0).toUpperCase() + month.slice(1));
      }
    });

    return detectedMonths;
  }

  // Function to extract property information
  function extractPropertyInfo() {
    console.log('🏠 Starting property extraction from:', window.location.href);
    
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
      contactPerson: null,

      lastUpdated: null,
      monthsMentioned: [],
      seasonal: null,
      energyCert: null,
      pricePerM2: null,
      deposit: null,
      desk: null,
      googleMapsUrl: null,
      image: null,

      // Additional properties
      parking: null,
      terrace: null,
      balcony: null,
      airConditioning: null,
      garden: null,
      pool: null,
      accessible: null,
      cleaningIncluded: null,
      lgbtFriendly: null,
      ownerNotPresent: null,
      privateBathroom: null,
      window: null,
      couplesAllowed: null,
      minorsAllowed: null,
      builtInWardrobes: null,
      garage: null,
      storage: null,
      condition: null,
      propertySubType: null,
      hasFloorPlan: null,
      hasVirtualTour: null,
      bankAd: null,
      gender: null,
      smokers: null,
      bed: null,
      roommates: null,
      maintenance: null,
    };

    // Extract price
    const priceElement = document.querySelector(".info-data-price");
    if (priceElement) {
      const priceText = getTextContent(priceElement);
      info.price = extractNumber(priceText);
    }

    // Extract title
    const propertyTitleElement = document.querySelector(
      ".main-info__title-main, h1"
    );
    if (propertyTitleElement) {
      let title = getTextContent(propertyTitleElement);

      // Remove common prefixes
      title = title.replace(/^Alquiler de piso en /i, "");
      title = title.replace(/^Alquiler de habitación en /i, "");

      info.title = title;
    }

    // Extract square meters with improved logic
    const featuresElement = document.querySelector(".info-features");
    if (featuresElement) {
      const featuresText = getTextContent(featuresElement);

      // First, look for "number m²" in sentences that DON'T contain "habitacion" (with or without accent)
      const sentences = featuresText.split(/[.!?]/);
      let foundSquareMeters = false;

      for (const sentence of sentences) {
        // Try multiple patterns for square meters
        const m2Match =
          sentence.match(/(\d+)\s*m²/) ||
          sentence.match(/(\d+)\s*m2/) ||
          sentence.match(/(\d+)\s*metros?\s*cuadrados?/i) ||
          sentence.match(/(\d+)\s*metros?\s*²/i);
        if (
          m2Match &&
          !sentence.toLowerCase().includes("habitacion") &&
          !sentence.toLowerCase().includes("habitación")
        ) {
          info.squareMeters = parseInt(m2Match[1]);
          foundSquareMeters = true;
          break;
        }
      }

      // If not found, then look for "m²" in sentences that DO contain "habitacion" (with or without accent)
      if (!foundSquareMeters) {
        for (const sentence of sentences) {
          // Try multiple patterns for square meters
          const m2Match =
            sentence.match(/(\d+)\s*m²/) ||
            sentence.match(/(\d+)\s*m2/) ||
            sentence.match(/(\d+)\s*metros?\s*cuadrados?/i) ||
            sentence.match(/(\d+)\s*metros?\s*²/i);
          if (
            m2Match &&
            (sentence.toLowerCase().includes("habitacion") ||
              sentence.toLowerCase().includes("habitación"))
          ) {
            info.squareMeters = parseInt(m2Match[1]);
            break;
          }
        }
      }
    }

    // Also try to extract square meters from other common selectors
    if (!info.squareMeters) {
      const alternativeSelectors = [
        ".details-property-feature-one .details-property_features ul",
        ".property-features",
        ".features-list",
        ".property-details",
      ];

      for (const selector of alternativeSelectors) {
        const element = document.querySelector(selector);
        if (element) {
          const text = getTextContent(element);
          // Try multiple patterns for square meters
          const m2Match =
            text.match(/(\d+)\s*m²/) ||
            text.match(/(\d+)\s*m2/) ||
            text.match(/(\d+)\s*metros?\s*cuadrados?/i) ||
            text.match(/(\d+)\s*metros?\s*²/i);
          if (m2Match) {
            info.squareMeters = parseInt(m2Match[1]);
            break;
          }
        }
      }
    }

    // Extract rooms with improved logic
    if (featuresElement) {
      const featuresText = getTextContent(featuresElement);

      // Look for "X hab." pattern
      const roomsMatch = featuresText.match(/(\d+)\s*hab\./);
      if (roomsMatch) {
        info.rooms = parseInt(roomsMatch[1]);
      } else {
        // Look for "X habitaciones" pattern
        const habitacionesMatch = featuresText.match(/(\d+)\s*habitaciones?/i);
        if (habitacionesMatch) {
          info.rooms = parseInt(habitacionesMatch[1]);
        } else {
          // Look for "X dormitorios" pattern
          const dormitoriosMatch = featuresText.match(/(\d+)\s*dormitorios?/i);
          if (dormitoriosMatch) {
            info.rooms = parseInt(dormitoriosMatch[1]);
          }
        }
      }
    }

    // Also try to extract rooms from other selectors if not found
    if (!info.rooms) {
      const alternativeSelectors = [
        ".details-property-feature-one .details-property_features ul",
        ".property-features",
        ".features-list",
        ".property-details",
        ".main-info",
        ".description",
      ];

      for (const selector of alternativeSelectors) {
        const element = document.querySelector(selector);
        if (element) {
          const text = getTextContent(element);

          const roomsMatch = text.match(/(\d+)\s*hab\./);
          if (roomsMatch) {
            info.rooms = parseInt(roomsMatch[1]);
            break;
          }

          const habitacionesMatch = text.match(/(\d+)\s*habitaciones?/i);
          if (habitacionesMatch) {
            info.rooms = parseInt(habitacionesMatch[1]);
            break;
          }

          const dormitoriosMatch = text.match(/(\d+)\s*dormitorios?/i);
          if (dormitoriosMatch) {
            info.rooms = parseInt(dormitoriosMatch[1]);
            break;
          }
        }
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
      if (featuresText.includes("sin ascensor")) {
        info.elevator = false;
      } else if (featuresText.includes("ascensor")) {
        // Only set to true if it mentions ascensor but not "sin ascensor"
        info.elevator = true;
      } else {
        // Default to false if no mention
        info.elevator = false;
      }
    }

    // Extract basic characteristics and bathrooms
    const basicFeatures = document.querySelector(
      ".details-property-feature-one .details-property_features ul"
    );
    if (basicFeatures) {
      const featuresList = basicFeatures.querySelectorAll("li");
      featuresList.forEach((feature) => {
        const featureText = getTextContent(feature);

        if (featureText.includes("Orientación")) {
          info.orientation = featureText.replace("Orientación", "").trim();
        }
        if (featureText.includes("Amueblado")) {
          info.furnished = featureText.includes("Amueblado");
        }
        if (featureText.includes("Calefacción")) {
          info.heating = featureText.includes("Calefacción");
        }
      });
    }

    // Extract bathrooms with comprehensive logic
    if (featuresElement) {
      const featuresText = getTextContent(featuresElement);

      // Extract bathrooms with improved logic
      const bathroomsMatch = featuresText.match(/(\d+)\s*baños?/i);
      if (bathroomsMatch) {
        info.bathrooms = parseInt(bathroomsMatch[1]);
      } else if (
        featuresText.includes("sin baño") ||
        featuresText.includes("no tiene baño")
      ) {
        // Explicitly no bathroom
        info.bathrooms = 0;
      } else if (featuresText.includes("baños")) {
        // Plural form without number - assume 2 or more
        info.bathrooms = 2;
      } else if (featuresText.includes("baño")) {
        // Singular form without number - assume 1
        info.bathrooms = 1;
      }
    }

    // Also try to extract bathrooms from other common selectors if not found
    if (info.bathrooms === null || info.bathrooms === undefined) {
      const alternativeSelectors = [
        ".info-features",
        ".property-features",
        ".features-list",
        ".property-details",
        ".main-info",
        ".description",
      ];

      for (const selector of alternativeSelectors) {
        const element = document.querySelector(selector);
        if (element) {
          const text = getTextContent(element);

          // Extract bathrooms with improved logic
          const bathroomsMatch = text.match(/(\d+)\s*baños?/i);
          if (bathroomsMatch) {
            info.bathrooms = parseInt(bathroomsMatch[1]);
            break;
          } else if (
            text.includes("sin baño") ||
            text.includes("no tiene baño")
          ) {
            info.bathrooms = 0;
            break;
          } else if (text.includes("baños")) {
            info.bathrooms = 2;
            break;
          } else if (text.includes("baño")) {
            info.bathrooms = 1;
            break;
          }
        }
      }
    }

    // Extract desk information from description
    const descriptionElement = document.querySelector(".comment");
    if (descriptionElement) {
      const descriptionText = getTextContent(descriptionElement).toLowerCase();

      // Look for desk-related keywords
      const deskKeywords = [
        "escritorio",
        "escritorios",
        "desk",
        "desks",
        "mesa de trabajo",
        "mesas de trabajo",
        "oficina",
        "zona de trabajo",
        "espacio de trabajo",
        "rincón de trabajo",
        "área de trabajo",
        "puesto de trabajo",
      ];

      let deskCount = 0;
      deskKeywords.forEach((keyword) => {
        const matches = descriptionText.match(new RegExp(keyword, "gi"));
        if (matches) {
          deskCount += matches.length;
        }
      });

      // Also look for specific numbers
      const deskNumberMatch = descriptionText.match(
        /(\d+)\s*(escritorio|desk|mesa de trabajo)/gi
      );
      if (deskNumberMatch) {
        deskNumberMatch.forEach((match) => {
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
        if (descriptionText.includes("sin ascensor")) {
          info.elevator = false;
        } else if (descriptionText.includes("ascensor")) {
          info.elevator = true;
        }
      }
    }

    // Extract professional information
    const professionalElement = document.querySelector(
      ".professional-name .name"
    );
    if (professionalElement) {
      info.professional = getTextContent(professionalElement);
    }

    // Extract contact person name
    try {
      // First try to find the hidden input with user-name
      const userNameInput = document.querySelector('input[name="user-name"]');
      if (userNameInput && userNameInput.value) {
        info.contactPerson = userNameInput.value.trim();
      } else {
        // Fallback: Look for the chat info banner text
        const chatInfoBanner = document.querySelector(".chat-info-banner-text");
        if (chatInfoBanner) {
          const strongElement = chatInfoBanner.querySelector("strong");
          if (strongElement) {
            info.contactPerson = strongElement.textContent?.trim() || "";
          }
        }
        
        // Additional fallback: Look for the professional-name div structure
        if (!info.contactPerson) {
          const professionalNameDiv = document.querySelector('.professional-name .name');
          if (professionalNameDiv) {
            info.contactPerson = professionalNameDiv.textContent?.trim() || "";
          }
        }
      }
    } catch (error) {
      console.warn("Could not extract contact person name:", error);
    }

    // Extract last updated information
    const updateElement = document.querySelector(".date-update-text");
    if (updateElement) {
      info.lastUpdated = getTextContent(updateElement);
    }

    // Extract months mentioned in comments
    const commentElement = document.querySelector(
      ".comment .adCommentsLanguage"
    );
    if (commentElement) {
      const commentText = getTextContent(commentElement);
      info.monthsMentioned = detectMonths(commentText);
    }

    // Extract seasonal rental information
    const seasonalTags = document.querySelectorAll(
      ".detail-info-tags .tag, .tag"
    );
    seasonalTags.forEach((tag) => {
      const tagText = getTextContent(tag).toLowerCase();
      if (
        tagText.includes("temporada") ||
        tagText.includes("vacacional") ||
        tagText.includes("vacaciones")
      ) {
        info.seasonal = true;
      }
    });

    // Also check in the main title and description
    const titleElement = document.querySelector(".main-info__title-main, h1");
    if (titleElement) {
      const titleText = getTextContent(titleElement).toLowerCase();
      if (
        titleText.includes("temporada") ||
        titleText.includes("vacacional") ||
        titleText.includes("vacaciones")
      ) {
        info.seasonal = true;
      }
    }

    // Check in the comment text as well
    if (commentElement) {
      const commentText = getTextContent(commentElement).toLowerCase();
      if (
        commentText.includes("temporada") ||
        commentText.includes("vacacional") ||
        commentText.includes("vacaciones")
      ) {
        info.seasonal = true;
      }
    }

    // Default to false if not found
    if (info.seasonal === null) {
      info.seasonal = false;
    }

    // Extract energy certificate
    const energyCertElement = document.querySelector(
      ".details-property-feature-two .details-property_features ul li"
    );
    if (energyCertElement) {
      const energyText = getTextContent(energyCertElement);
      if (energyText && energyText !== "En trámite") {
        info.energyCert = energyText;
      }
    }

    // Extract price per m² and deposit
    const priceFeatures = document.querySelector(".price-features__container");
    if (priceFeatures) {
      const pricePerM2Element =
        priceFeatures.querySelector(".squaredmeterprice");
      if (pricePerM2Element) {
        const pricePerM2Text = getTextContent(pricePerM2Element);
        const pricePerM2Match = pricePerM2Text.match(/(\d+[.,]\d+)\s*€\/m²/);
        if (pricePerM2Match) {
          info.pricePerM2 = parseFloat(pricePerM2Match[1].replace(",", "."));
        }
      }

      const depositElement = priceFeatures.querySelector(
        ".flex-feature:not(.squaredmeterprice)"
      );
      if (depositElement) {
        const depositText = getTextContent(depositElement);
        if (depositText.includes("Fianza")) {
          info.deposit = depositText;
        }
      }
    }

    // Extract property image
    const mainImageElement = document.querySelector(
      ".main-image img, .main-image_first img"
    );
    if (mainImageElement) {
      const imageSrc = mainImageElement.src;
      if (
        imageSrc &&
        imageSrc !==
          "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTIxIDEwYzAgNy05IDEzLTkgMTNzLTktNi05LTEzYTkgOSAwIDAgMSAxOCAweiIgc3Ryb2tlPSJjdXJyZW50Q29sb3IiIHN0cm9rZS13aWR0aD0iMiIvPgo8Y2lyY2xlIGN4PSIxMiIgY3k9IjEwIiByPSIzIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIi8+Cjwvc3ZnPgo="
      ) {
        info.image = imageSrc;
      }
    }

    // Extract additional features from description and features
    const descriptionText = descriptionElement
      ? getTextContent(descriptionElement).toLowerCase()
      : "";
    const featuresText = featuresElement
      ? getTextContent(featuresElement).toLowerCase()
      : "";

    // Extract parking information
    if (
      descriptionText.includes("parking") ||
      descriptionText.includes("garaje") ||
      descriptionText.includes("plaza de parking") ||
      featuresText.includes("parking") ||
      featuresText.includes("garaje") ||
      featuresText.includes("plaza de parking")
    ) {
      info.parking = true;
    } else if (
      descriptionText.includes("sin parking") ||
      descriptionText.includes("sin garaje") ||
      featuresText.includes("sin parking") ||
      featuresText.includes("sin garaje")
    ) {
      info.parking = false;
    }

    // Extract terrace information
    if (
      descriptionText.includes("terraza") ||
      descriptionText.includes("terrace")
    ) {
      info.terrace = true;
    } else if (descriptionText.includes("sin terraza")) {
      info.terrace = false;
    }

    // Extract balcony information
    if (
      descriptionText.includes("balcón") ||
      descriptionText.includes("balcony")
    ) {
      info.balcony = true;
    } else if (descriptionText.includes("sin balcón")) {
      info.balcony = false;
    }

    // Extract air conditioning information
    if (
      descriptionText.includes("aire acondicionado") ||
      descriptionText.includes("air conditioning") ||
      descriptionText.includes("a/c")
    ) {
      info.airConditioning = true;
    } else if (descriptionText.includes("sin aire acondicionado")) {
      info.airConditioning = false;
    }

    // Extract garden information
    if (
      descriptionText.includes("jardín") ||
      descriptionText.includes("garden")
    ) {
      info.garden = true;
    } else if (descriptionText.includes("sin jardín")) {
      info.garden = false;
    }

    // Extract pool information
    if (
      descriptionText.includes("piscina") ||
      descriptionText.includes("pool")
    ) {
      info.pool = true;
    } else if (descriptionText.includes("sin piscina")) {
      info.pool = false;
    }

    // Extract accessible information
    if (
      descriptionText.includes("accesible") ||
      descriptionText.includes("accessible") ||
      descriptionText.includes("silla de ruedas")
    ) {
      info.accessible = true;
    }

    // Extract cleaning included information
    if (
      descriptionText.includes("limpieza incluida") ||
      descriptionText.includes("cleaning included")
    ) {
      info.cleaningIncluded = true;
    }

    // Extract LGBT friendly information
    if (
      descriptionText.includes("lgbt") ||
      descriptionText.includes("lgbtq") ||
      descriptionText.includes("diversidad")
    ) {
      info.lgbtFriendly = true;
    }

    // Extract owner not present information
    if (
      descriptionText.includes("propietario no presente") ||
      descriptionText.includes("owner not present")
    ) {
      info.ownerNotPresent = true;
    }

    // Extract private bathroom information
    if (
      descriptionText.includes("baño privado") ||
      descriptionText.includes("private bathroom")
    ) {
      info.privateBathroom = true;
    } else if (
      descriptionText.includes("baño compartido") ||
      descriptionText.includes("shared bathroom")
    ) {
      info.privateBathroom = false;
    }

    // Extract window information
    if (
      descriptionText.includes("ventana") ||
      descriptionText.includes("window")
    ) {
      info.window = true;
    } else if (descriptionText.includes("sin ventana")) {
      info.window = false;
    }

    // Extract couples allowed information
    if (
      descriptionText.includes("parejas permitidas") ||
      descriptionText.includes("couples allowed")
    ) {
      info.couplesAllowed = true;
    } else if (
      descriptionText.includes("no parejas") ||
      descriptionText.includes("no couples")
    ) {
      info.couplesAllowed = false;
    }

    // Extract minors allowed information
    if (
      descriptionText.includes("menores permitidos") ||
      descriptionText.includes("minors allowed")
    ) {
      info.minorsAllowed = true;
    } else if (
      descriptionText.includes("no menores") ||
      descriptionText.includes("no minors")
    ) {
      info.minorsAllowed = false;
    }

    // Extract built-in wardrobes information
    if (
      descriptionText.includes("armarios empotrados") ||
      descriptionText.includes("built-in wardrobes")
    ) {
      info.builtInWardrobes = true;
    } else if (descriptionText.includes("sin armarios empotrados")) {
      info.builtInWardrobes = false;
    }

    // Extract garage information
    if (
      descriptionText.includes("garaje") ||
      descriptionText.includes("garage")
    ) {
      info.garage = true;
    } else if (descriptionText.includes("sin garaje")) {
      info.garage = false;
    }

    // Extract storage information
    if (
      descriptionText.includes("trastero") ||
      descriptionText.includes("storage")
    ) {
      info.storage = true;
    } else if (descriptionText.includes("sin trastero")) {
      info.storage = false;
    }

    // Extract property condition
    if (descriptionText.includes("obra nueva")) {
      info.condition = "obra nueva";
    } else if (descriptionText.includes("buen estado")) {
      info.condition = "buen estado";
    } else if (descriptionText.includes("a reformar")) {
      info.condition = "a reformar";
    }

    // Extract property subtype
    if (
      descriptionText.includes("ático") ||
      descriptionText.includes("atico")
    ) {
      info.propertySubType = "ático";
    } else if (
      descriptionText.includes("dúplex") ||
      descriptionText.includes("duplex")
    ) {
      info.propertySubType = "dúplex";
    } else if (descriptionText.includes("casa")) {
      info.propertySubType = "casa";
    } else if (descriptionText.includes("chalet")) {
      info.propertySubType = "chalet";
    } else if (descriptionText.includes("estudio")) {
      info.propertySubType = "estudio";
    }

    // Extract has floor plan information
    if (
      descriptionText.includes("con plano") ||
      descriptionText.includes("floor plan")
    ) {
      info.hasFloorPlan = true;
    }

    // Extract has virtual tour information
    if (
      descriptionText.includes("visita virtual") ||
      descriptionText.includes("virtual tour")
    ) {
      info.hasVirtualTour = true;
    }

    // Extract bank ad information
    if (descriptionText.includes("banco") || descriptionText.includes("bank")) {
      info.bankAd = true;
    }

    // Extract gender information (for rooms)
    if (
      descriptionText.includes("chico") ||
      descriptionText.includes("hombre")
    ) {
      info.gender = "chico";
    } else if (
      descriptionText.includes("chica") ||
      descriptionText.includes("mujer")
    ) {
      info.gender = "chica";
    }

    // Extract smokers information
    if (
      descriptionText.includes("fumadores") ||
      descriptionText.includes("smokers")
    ) {
      info.smokers = true;
    } else if (
      descriptionText.includes("no fumadores") ||
      descriptionText.includes("no smokers")
    ) {
      info.smokers = false;
    }

    // Extract bed information
    if (descriptionText.includes("cama") || descriptionText.includes("bed")) {
      info.bed = true;
    } else if (descriptionText.includes("sin cama")) {
      info.bed = false;
    }

    // Extract roommates information
    const roommatesMatch = descriptionText.match(
      /(\d+)\s*(compañero|roommate|persona)/
    );
    if (roommatesMatch) {
      info.roommates = parseInt(roommatesMatch[1]);
    }

    // Extract maintenance information
    const maintenanceMatch = descriptionText.match(
      /(\d+)\s*€\s*(comunidad|maintenance|gastos)/
    );
    if (maintenanceMatch) {
      info.maintenance = parseInt(maintenanceMatch[1]);
    }

    // Log the extracted property data
    console.log('📊 Extracted property data:', {
      url: info.url,
      title: info.title,
      price: info.price,
      squareMeters: info.squareMeters,
      rooms: info.rooms,
      bathrooms: info.bathrooms,
      floor: info.floor,
      heating: info.heating,
      elevator: info.elevator,
      furnished: info.furnished,
      parking: info.parking,
      terrace: info.terrace,
      balcony: info.balcony,
      airConditioning: info.airConditioning,
      energyCert: info.energyCert,
      pricePerM2: info.pricePerM2,
      deposit: info.deposit,
      maintenance: info.maintenance,
      professional: info.professional,
      contactPerson: info.contactPerson,
      image: info.image
    });

    return info;
  }

  // Function to create the analysis table (compact chip layout)
  function createAnalysisTable(info, isAlreadyAdded = false, isLoading = false) {
    const container = document.createElement("div");
    container.id = "idea-lista-analyzer-table";
    container.className = "analyzer-container analyzer-compact";

    const row = document.createElement("div");
    row.className = "analyzer-row";

    const inline = document.createElement("div");
    inline.className = "analyzer-inline";

    // Handle loading state or no info
    if (isLoading) {
      const loadingPlaceholder = document.createElement("div");
      loadingPlaceholder.className = "analyzer-loading";
      loadingPlaceholder.innerHTML = `
        <div style="text-align: center; padding: 20px; color: hsl(var(--muted-foreground));">
          <div style="display: flex; align-items: center; justify-content: center; gap: 8px;">
            <div style="width: 16px; height: 16px; border: 2px solid hsl(var(--border)); border-top: 2px solid hsl(var(--primary)); border-radius: 50%; animation: spin 1s linear infinite;"></div>
            <p>Cargando datos de la propiedad...</p>
          </div>
        </div>
      `;
      inline.appendChild(loadingPlaceholder);
    } else if (!info) {
      const placeholder = document.createElement("div");
      placeholder.className = "analyzer-placeholder";
      placeholder.innerHTML = `
        <div style="text-align: center; padding: 20px; color: hsl(var(--muted-foreground));">
          <p>Haz clic en "Agregar" para extraer y analizar los datos de la propiedad</p>
        </div>
      `;
      inline.appendChild(placeholder);
    } else {
      // helpers
      const formatPriceEUR = (n) =>
        n != null ? n.toLocaleString("es-ES") + "€" : "N/A";
      const addChip = (text, className, title) => {
        if (!text) return;
        const span = document.createElement("span");
        span.className = `chip ${className || ""}`.trim();
        span.textContent = text;
        if (title) span.title = title;
        inline.appendChild(span);
      };

      // main chips
      addChip(info.price != null ? formatPriceEUR(info.price) : null, "price");
      addChip(info.squareMeters ? `${info.squareMeters}m²` : null, "size");
      addChip(info.rooms ? `${info.rooms}hab` : null, "rooms");
      addChip(
        info.bathrooms != null
          ? `${info.bathrooms} ${info.bathrooms > 1 ? "baños" : "baño"}`
          : null,
        "bathrooms"
      );
      addChip(info.floor ? `P${info.floor}` : null, "floor");

      if (info.heating) addChip("Calefacción", "heating");
      if (info.furnished) addChip("Amueblado", "furnished");
      if (info.elevator) addChip("Ascensor", "elevator");
      if (info.seasonal) addChip("Temporada", "seasonal");
      if (info.orientation) addChip(info.orientation, "orientation");
      if (info.desk)
        addChip(`${info.desk} escritorio${info.desk > 1 ? "s" : ""}`, "desk");

      // Additional amenities
      if (info.parking) addChip("Parking", "parking");
      if (info.terrace) addChip("Terraza", "terrace");
      if (info.balcony) addChip("Balcón", "balcony");
      if (info.airConditioning) addChip("A/C", "air-conditioning");
      if (info.garden) addChip("Jardín", "garden");
      if (info.pool) addChip("Piscina", "pool");
      if (info.accessible) addChip("Accesible", "accessible");
      if (info.cleaningIncluded) addChip("Limpieza", "cleaning");
      if (info.lgbtFriendly) addChip("LGBT+", "lgbt");
      if (info.ownerNotPresent) addChip("Sin Propietario", "owner-absent");
      if (info.privateBathroom) addChip("Baño Privado", "private-bathroom");
      if (info.window) addChip("Ventana", "window");
      if (info.couplesAllowed) addChip("Parejas", "couples");
      if (info.minorsAllowed) addChip("Menores", "minors");
      if (info.builtInWardrobes) addChip("Armarios", "wardrobes");
      if (info.garage) addChip("Garaje", "garage");
      if (info.storage) addChip("Trastero", "storage");
      if (info.hasFloorPlan) addChip("Plano", "floor-plan");
      if (info.hasVirtualTour) addChip("Visita Virtual", "virtual-tour");
      if (info.bankAd) addChip("Banco", "bank");
      if (info.smokers) addChip("Fumadores", "smokers");
      if (info.bed) addChip("Cama", "bed");
      if (info.roommates) addChip(`${info.roommates} compañeros`, "roommates");

      // Property type and condition
      if (info.propertySubType) addChip(info.propertySubType, "property-type");
      if (info.condition) addChip(info.condition, "condition");
      if (info.gender) addChip(info.gender, "gender");

      if (info.professional) addChip(info.professional, "pro");

      // Financial information
      if (info.pricePerM2) addChip(`${info.pricePerM2}€/m²`, "price-m2");
      if (info.deposit) addChip(info.deposit, "deposit");
      if (info.energyCert) addChip(info.energyCert, "energy");
      if (info.maintenance)
        addChip(`${info.maintenance}€ comunidad`, "maintenance");

      if (info.lastUpdated) addChip(info.lastUpdated, "muted", info.lastUpdated);
      if (info.monthsMentioned && info.monthsMentioned.length > 0) {
        addChip(`Meses: ${info.monthsMentioned.join(", ")}`, "muted");
      }

      // property id
      try {
        const urlParts = info.url.split("/");
        const propertyId = urlParts[urlParts.length - 2] || "";
        if (propertyId) addChip(`ID: ${propertyId}`, "id muted");
      } catch (e) {
        // Ignore errors when extracting property ID
      }
    }

    row.appendChild(inline);

    // Only create buttons if we have property info
    if (info) {
      // Add AI prompt button
      const aiPromptButton = document.createElement("button");
      aiPromptButton.className =
        "analyzer-ai-prompt-btn analyzer-ai-prompt-btn--compact particle-burst";
      aiPromptButton.innerHTML =
        '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path><path d="M8 9h8"></path><path d="M8 13h6"></path></svg>';
      aiPromptButton.style.backgroundColor = "hsl(262 83% 58%)";
      aiPromptButton.onclick = (event) => {
        createParticleAnimation(event);
        generateAIPrompt(info);
      };
      aiPromptButton.title = "Generar mensaje para el propietario";

      // Add/Delete button
      const addButton = document.createElement("button");
      addButton.className = "analyzer-add-btn analyzer-add-btn--compact";

      if (isLoading) {
        // Disable button during loading
        addButton.innerHTML =
          '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><path d="m9 12 2 2 4-4"></path></svg>';
        addButton.style.color = "hsl(var(--muted-foreground))";
        addButton.disabled = true;
        addButton.title = "Cargando...";
      } else if (isAlreadyAdded) {
        addButton.innerHTML =
          '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"></path></svg>';
        addButton.style.color = "hsl(var(--destructive))";
        addButton.disabled = false;
        addButton.classList.add("delete-mode");
        addButton.onclick = () => {
          const propertyInfo = extractPropertyInfo();
          showDeleteConfirmation(propertyInfo);
        };
        addButton.title = "Eliminar del gestor de propiedades";
      } else {
        addButton.innerHTML =
          '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>';
        addButton.style.color = "hsl(var(--primary))";
        addButton.onclick = () => {
          const propertyInfo = extractPropertyInfo();
          addToManager(propertyInfo);
        };
        addButton.title = "Agregar al gestor de propiedades";
      }

      row.appendChild(aiPromptButton);
      row.appendChild(addButton);
    }
    container.appendChild(row);
    return container;
  }

  // Function to add property to manager
  function addToManager(info) {
    console.log('🚀 Sending property data to popup clean architecture system:', {
      action: 'addPropertyToCleanArchitecture',
      property: {
        url: info.url,
        title: info.title,
        price: info.price,
        squareMeters: info.squareMeters,
        rooms: info.rooms,
        bathrooms: info.bathrooms,
        floor: info.floor,
        heating: info.heating,
        elevator: info.elevator,
        furnished: info.furnished,
        parking: info.parking,
        terrace: info.terrace,
        balcony: info.balcony,
        airConditioning: info.airConditioning,
        energyCert: info.energyCert,
        pricePerM2: info.pricePerM2,
        deposit: info.deposit,
        maintenance: info.maintenance,
        professional: info.professional,
        contactPerson: info.contactPerson,
        image: info.image
      }
    });
    
    // Send property data to popup's clean architecture system
    chrome.runtime.sendMessage(
      {
        action: "addPropertyToCleanArchitecture",
        property: info,
      },
      (response) => {
        if (response && response.success) {
          // Find the button that was clicked (event target)
          const buttons = document.querySelectorAll(".analyzer-add-btn");
          let targetButton = null;
          
          // Find the button that corresponds to this property
          for (const button of buttons) {
            // Individual property page
            targetButton = button;
            break;
          }

          if (targetButton) {
            targetButton.innerHTML =
              '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"></path></svg>';
            targetButton.style.color = "hsl(var(--destructive))";
            targetButton.disabled = false;
            targetButton.classList.add("delete-mode");
            targetButton.onclick = () => showDeleteConfirmation(info);
            targetButton.title = "Eliminar del gestor de propiedades";
          }
        } else {
          // Show error message
          const button = document.querySelector(".analyzer-add-btn");
          if (button) {
            const originalText = button.textContent;
            const originalColor = button.style.color;

            button.textContent = "❌ Error";
            button.style.color = "hsl(var(--destructive))";

            setTimeout(() => {
              button.textContent = originalText;
              button.style.color = originalColor;
            }, 2000);
          }
        }
      }
    );
  }

  // Function to show delete confirmation modal
  function showDeleteConfirmation(info) {
    // Create modal overlay
    const modalOverlay = document.createElement("div");
    modalOverlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: hsl(0 0% 0% / 0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10000;
            backdrop-filter: blur(4px);
        `;

    // Create modal content
    const modalContent = document.createElement("div");
    modalContent.style.cssText = `
            background-color: hsl(var(--card));
            color: hsl(var(--card-foreground));
            padding: 24px;
            border-radius: 12px;
            max-width: 400px;
            width: 90%;
            box-shadow: 0 20px 25px -5px hsl(0 0% 0% / 0.1), 0 8px 10px -6px hsl(0 0% 0% / 0.1);
            border: 1px solid hsl(var(--border));
            transform: translateZ(0);
            backface-visibility: hidden;
        `;

    modalContent.innerHTML = `
            <h3 style="margin: 0 0 16px 0; font-size: 18px; font-weight: 600; color: hsl(var(--foreground));">
                Eliminar Propiedad
            </h3>
            <p style="margin: 0 0 24px 0; color: hsl(var(--muted-foreground)); line-height: 1.5;">
                ¿Estás seguro de que quieres eliminar esta propiedad de tu gestor? Esta acción no se puede deshacer.
            </p>
            <div style="display: flex; gap: 12px; justify-content: flex-end;">
                <button id="cancel-delete" style="
                    padding: 8px 16px;
                    border: 1px solid hsl(var(--border));
                    background-color: hsl(var(--background));
                    color: hsl(var(--foreground));
                    border-radius: 6px;
                    cursor: pointer;
                    font-size: 14px;
                    font-weight: 500;
                    transition: all 150ms cubic-bezier(0.25, 0.46, 0.45, 0.94);
                    transform: translateZ(0);
                    backface-visibility: hidden;
                " onmouseover="this.style.backgroundColor='hsl(var(--accent))'" onmouseout="this.style.backgroundColor='hsl(var(--background))'">Cancelar</button>
                <button id="confirm-delete" style="
                    padding: 8px 16px;
                    border: none;
                    background-color: hsl(var(--destructive));
                    color: hsl(var(--destructive-foreground));
                    border-radius: 6px;
                    cursor: pointer;
                    font-size: 14px;
                    font-weight: 500;
                    transition: all 150ms cubic-bezier(0.25, 0.46, 0.45, 0.94);
                    transform: translateZ(0);
                    backface-visibility: hidden;
                " onmouseover="this.style.backgroundColor='hsl(var(--destructive) / 0.9)'" onmouseout="this.style.backgroundColor='hsl(var(--destructive))'">Eliminar</button>
            </div>
        `;

    modalOverlay.appendChild(modalContent);
    document.body.appendChild(modalOverlay);

    // Add event listeners
    document.getElementById("cancel-delete").onclick = () => {
      document.body.removeChild(modalOverlay);
    };

    document.getElementById("confirm-delete").onclick = () => {
      removeFromManager(info);
      document.body.removeChild(modalOverlay);
    };

    // Close modal when clicking outside
    modalOverlay.onclick = (e) => {
      if (e.target === modalOverlay) {
        document.body.removeChild(modalOverlay);
      }
    };
  }



  // Function to remove property from manager
  function removeFromManager(info) {
    // Get the property ID by URL first
    chrome.runtime.sendMessage(
      {
        action: "getProperties",
      },
      (response) => {
        if (response && response.properties) {
          const property = response.properties.find((p) => p.url === info.url);
          if (property) {
            // Send remove request
            chrome.runtime.sendMessage(
              {
                action: "removeProperty",
                propertyId: property.id,
              },
              (removeResponse) => {
                if (removeResponse && removeResponse.success) {
                  // Update button to add mode immediately
                  const button = document.querySelector(".analyzer-add-btn");
                  if (button) {
                    button.innerHTML =
                      '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>';
                    button.style.color = "hsl(var(--primary))";
                    button.disabled = false;
                    button.classList.remove("delete-mode");
                    button.onclick = () => addToManager(info);
                    button.title = "Agregar al gestor de propiedades";
                  }
                  
                  // Force a complete refresh of the button state
                  setTimeout(() => {
                    refreshButtonState();
                  }, 200);
                } else {
                  // Show error message
                  const button = document.querySelector(".analyzer-add-btn");
                  if (button) {
                    const originalText = button.textContent;
                    const originalColor = button.style.color;

                    button.textContent = "❌ Error";
                    button.style.color = "hsl(var(--destructive))";

                    setTimeout(() => {
                      button.textContent = originalText;
                      button.style.color = originalColor;
                    }, 2000);
                  }
                }
              }
            );
          } else {
            // Property not found in list
          }
        } else {
          // No properties response
        }
      }
    );
  }

  // Function to generate AI prompt from property data
  function generateAIPrompt(info) {
    const prompt = `Genera un mensaje personalizado y profesional para contactar al propietario de esta propiedad. El mensaje debe ser cordial, específico sobre la propiedad y mostrar interés genuino.

**Datos de la Propiedad:**
- Precio: ${
      info.price ? info.price.toLocaleString("es-ES") + "€" : "No especificado"
    }
- Tamaño: ${info.squareMeters ? info.squareMeters + "m²" : "No especificado"}
- Habitaciones: ${info.rooms ? info.rooms : "No especificado"}
- Baños: ${info.bathrooms ? info.bathrooms : "No especificado"}
- Planta: ${info.floor ? "P" + info.floor : "No especificado"}
- Orientación: ${info.orientation ? info.orientation : "No especificado"}
- Precio por m²: ${
      info.pricePerM2 ? info.pricePerM2 + "€/m²" : "No especificado"
    }
- Fianza: ${info.deposit ? info.deposit : "No especificado"}
- Gastos comunidad: ${
      info.maintenance ? info.maintenance + "€" : "No especificado"
    }

**Características Principales:**
${info.heating ? "- Calefacción" : ""}
${info.furnished ? "- Amueblado" : ""}
${info.elevator ? "- Ascensor" : ""}
${info.seasonal ? "- Alquiler temporal" : ""}
${info.desk ? `- ${info.desk} escritorio${info.desk > 1 ? "s" : ""}` : ""}

**Amenidades Adicionales:**
${info.parking ? "- Parking" : ""}
${info.terrace ? "- Terraza" : ""}
${info.balcony ? "- Balcón" : ""}
${info.airConditioning ? "- Aire acondicionado" : ""}
${info.garden ? "- Jardín" : ""}
${info.pool ? "- Piscina" : ""}
${info.accessible ? "- Accesible" : ""}
${info.cleaningIncluded ? "- Limpieza incluida" : ""}
${info.lgbtFriendly ? "- LGBT friendly" : ""}
${info.ownerNotPresent ? "- Propietario no presente" : ""}
${info.privateBathroom ? "- Baño privado" : ""}
${info.window ? "- Ventana" : ""}
${info.couplesAllowed ? "- Parejas permitidas" : ""}
${info.minorsAllowed ? "- Menores permitidos" : ""}
${info.builtInWardrobes ? "- Armarios empotrados" : ""}
${info.garage ? "- Garaje" : ""}
${info.storage ? "- Trastero" : ""}
${info.hasFloorPlan ? "- Con plano" : ""}
${info.hasVirtualTour ? "- Con visita virtual" : ""}
${info.bankAd ? "- Anuncio de banco" : ""}
${info.smokers ? "- Fumadores permitidos" : ""}
${info.bed ? "- Cama incluida" : ""}
${info.roommates ? `- ${info.roommates} compañeros de casa` : ""}

**Tipo y Estado:**
${info.propertySubType ? `- Tipo: ${info.propertySubType}` : ""}
${info.condition ? `- Estado: ${info.condition}` : ""}
${info.gender ? `- Género: ${info.gender}` : ""}

**Ubicación:**
${info.title ? `- Dirección: ${info.title}` : ""}

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
    navigator.clipboard
      .writeText(prompt)
      .then(() => {
        // Success - no notification needed, button state shows success
      })
      .catch(() => {
        // Fallback for older browsers
        const textArea = document.createElement("textarea");
        textArea.value = prompt;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand("copy");
        document.body.removeChild(textArea);
        // Success - no notification needed, button state shows success
      });
  }

  // Function to initialize the analyzer
  async function initAnalyzer() {
    // Only handle individual property pages
    await initPropertyPageAnalyzer();
  }








  // Track if we've already extracted property data for this page
  let propertyDataExtracted = false;
  let extractedPropertyInfo = null;

  // Function to initialize analyzer for individual property pages
  async function initPropertyPageAnalyzer() {
    // Remove existing table if present
    const existingTable = document.getElementById("idea-lista-analyzer-table");
    if (existingTable) {
      existingTable.remove();
    }

    // Check if property is already in the manager and get its data
    const currentUrl = window.location.href;
    const existingProperty = await getExistingProperty(currentUrl);
    const isAlreadyAdded = !!existingProperty;

    // Check if page is ready for property extraction
    const isPageReady = isPropertyPageReady();
    
    if (!isPageReady) {
      // Show loading state
      const table = createAnalysisTable(null, isAlreadyAdded, true); // true = loading state
      insertTable(table);
      return;
    }

    // Page is ready, extract property data only once
    if (!propertyDataExtracted) {
      console.log('🏠 Page is ready, extracting property data...');
      extractedPropertyInfo = extractPropertyInfo();
      propertyDataExtracted = true;
      console.log('✅ Property data extracted successfully');
    }

    // Create and insert the analysis table with extracted data
    const table = createAnalysisTable(extractedPropertyInfo, isAlreadyAdded, false); // false = not loading
    insertTable(table);
  }

  // Function to check if the property page is ready for data extraction
  function isPropertyPageReady() {
    // Check if essential elements are present
    const hasPrice = document.querySelector(".info-data-price");
    const hasTitle = document.querySelector(".main-info__title-main, h1");
    const hasFeatures = document.querySelector(".info-features");
    const hasDetailContainer = document.querySelector(".detail-container");
    
    // Check if we have the minimum required data
    const isReady = hasPrice && hasTitle && hasFeatures && hasDetailContainer;
    
    if (!isReady) {
      console.log('⏳ Page not ready yet. Missing elements:', {
        hasPrice: !!hasPrice,
        hasTitle: !!hasTitle,
        hasFeatures: !!hasFeatures,
        hasDetailContainer: !!hasDetailContainer
      });
    }
    
    return isReady;
  }

  // Function to insert table in the correct location
  function insertTable(table) {
    const detailContainer = document.querySelector(".detail-container");
    if (detailContainer) {
      detailContainer.parentNode.insertBefore(table, detailContainer);
    }
  }

  // Function to get existing property data
  async function getExistingProperty(propertyUrl) {
    try {
      const response = await chrome.runtime.sendMessage({
        action: "getProperties",
      });
      const properties = response.properties || [];
      return properties.find((property) => property.url === propertyUrl);
    } catch (error) {
      console.error("Error getting existing property:", error);
      return null;
    }
  }



  // Function to check if property already exists in manager
  async function checkIfPropertyExists(propertyUrl) {
    try {
      const response = await chrome.runtime.sendMessage({
        action: "getProperties",
      });
      const properties = response.properties || [];
      return properties.some((property) => property.url === propertyUrl);
    } catch (error) {
      console.error("Error checking if property exists:", error);
      return false;
    }
  }

  // Initialize when DOM is ready
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initAnalyzer);
  } else {
    initAnalyzer();
  }

  // Listen for property updates from background script
  chrome.runtime.onMessage.addListener((message) => {
    if (message.action === "propertiesUpdated") {
      // Update button state based on current property
      updateButtonState(message.properties);

      // No notification needed - button state shows the current status
    }
    
    if (message.action === "propertyDeleted") {
      // Force refresh of button states for the specific property
      const currentUrl = window.location.href;
      
      // Individual property page
      if (currentUrl === message.propertyUrl) {
        const button = document.querySelector(".analyzer-add-btn");
        if (button) {
          updateSingleButtonState(button, false);
        }
      }
    }
  });

  // Function to update button state based on current property
  function updateButtonState(properties) {
    const currentUrl = window.location.href;
    
    // Individual property page - single button
    const isAlreadyAdded = properties.some(
      (property) => property.url === currentUrl
    );
    
    const button = document.querySelector(".analyzer-add-btn");
    if (button) {
      updateSingleButtonState(button, isAlreadyAdded);
    }
  }

  // Function to update a single button state
  function updateSingleButtonState(button, isAlreadyAdded) {
    if (isAlreadyAdded) {
      button.innerHTML =
        '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"></path></svg>';
      button.style.color = "hsl(var(--destructive))";
      button.disabled = false;
      button.classList.add("delete-mode");
      button.title = "Eliminar del gestor de propiedades";
      button.onclick = () => {
        const propertyInfo = extractPropertyInfo();
        showDeleteConfirmation(propertyInfo);
      };
    } else {
      button.innerHTML =
        '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>';
      button.style.color = "hsl(var(--primary))";
      button.disabled = false;
      button.classList.remove("delete-mode");
      button.title = "Agregar al gestor de propiedades";
      button.onclick = () => {
        const propertyInfo = extractPropertyInfo();
        addToManager(propertyInfo);
      };
    }
  }

  // Function to refresh button state (useful for navigation)
  async function refreshButtonState() {
    try {
      const response = await chrome.runtime.sendMessage({
        action: "getProperties",
      });
      const properties = response.properties || [];
      updateButtonState(properties);
    } catch (error) {
      console.error("Error refreshing button state:", error);
    }
  }

  // Re-initialize when page content changes (for SPA navigation)
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.type === "childList" && mutation.addedNodes.length > 0) {
        // For individual property pages, check if detail-container was added
        const hasDetailContainer = Array.from(mutation.addedNodes).some(
          (node) =>
            node.nodeType === 1 &&
            (node.classList?.contains("detail-container") ||
              node.querySelector?.(".detail-container"))
        );

        if (hasDetailContainer) {
          // Reset extraction state for new page
          propertyDataExtracted = false;
          extractedPropertyInfo = null;
          setTimeout(initAnalyzer, 1000); // Small delay to ensure content is loaded
        }
      }
    });
  });

  // Also listen for URL changes (for SPA navigation)
  let currentUrl = window.location.href;
  setInterval(() => {
    if (window.location.href !== currentUrl) {
      currentUrl = window.location.href;
      // Reset extraction state for new URL
      propertyDataExtracted = false;
      extractedPropertyInfo = null;
      setTimeout(initAnalyzer, 500);
    }
  }, 1000);

  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });

  // Apple Watch Particle Animation Function
  function createParticleAnimation(event) {
    // Check if user prefers reduced motion
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    const button = event.currentTarget;
    const rect = button.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    // Create particle container if it doesn't exist
    let particleContainer = document.querySelector(".particle-container");
    if (!particleContainer) {
      particleContainer = document.createElement("div");
      particleContainer.className = "particle-container";
      document.body.appendChild(particleContainer);
    }

    // Create particles with enhanced animation
    const particleCount = 16; // Increased particle count
    const animationTypes = [
      "particleFloat1",
      "particleFloat2",
      "particleFloat3",
      "particleFloat4",
      "particleFloat5",
    ];

    for (let i = 0; i < particleCount; i++) {
      const particle = document.createElement("div");
      particle.className = "particle";

      // Calculate random angle and distance for particle spread
      const angle =
        (i / particleCount) * 2 * Math.PI + (Math.random() - 0.5) * 0.3;
      const distance = 8 + Math.random() * 12; // Reduced spread area
      const startX = centerX + Math.cos(angle) * distance;
      const startY = centerY + Math.sin(angle) * distance;

      // Generate random movement variations for each particle
      const randomDelay = Math.random() * 50; // 0-50ms delay for staggered effect
      const randomDuration = 250 + Math.random() * 100; // 250-350ms duration (300ms average)
      const animationType = animationTypes[i % animationTypes.length]; // Cycle through animation types

      // Set initial position
      particle.style.left = startX + "px";
      particle.style.top = startY + "px";

      // Apply enhanced animation with compliant easing
      particle.style.animationDelay = `${randomDelay}ms`;
      particle.style.animationDuration = `${randomDuration}ms`;
      particle.style.animationName = animationType;
      particle.style.animationTimingFunction =
        "cubic-bezier(0.25, 0.46, 0.45, 0.94)";
      particle.style.animationFillMode = "forwards";

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
