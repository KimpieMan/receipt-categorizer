// Tesseract.js voor echte OCR
document.addEventListener('DOMContentLoaded', function() {
    const dropZone = document.getElementById('dropZone');
    const fileInput = document.getElementById('fileInput');
    const processingDiv = document.getElementById('processing');
    const resultsDiv = document.getElementById('results');
    const recognizedTextDiv = document.getElementById('recognizedText');
    const categoriesDiv = document.getElementById('categories');
    const exportBtn = document.getElementById('exportBtn');
    const newScanBtn = document.getElementById('newScanBtn');

    // Event listeners
    dropZone.addEventListener('click', () => fileInput.click());
    fileInput.addEventListener('change', handleFileSelect);
    exportBtn.addEventListener('click', exportToCSV);
    newScanBtn.addEventListener('click', resetApp);

    // Drag and drop functionaliteit
    dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZone.style.borderColor = '#667eea';
        dropZone.style.backgroundColor = 'rgba(255, 255, 255, 1)';
    });

    dropZone.addEventListener('dragleave', () => {
        dropZone.style.borderColor = 'rgba(102, 126, 234, 0.5)';
        dropZone.style.backgroundColor = 'rgba(255, 255, 255, 0.9)';
    });

    dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.style.borderColor = 'rgba(102, 126, 234, 0.5)';
        dropZone.style.backgroundColor = 'rgba(255, 255, 255, 0.9)';
        
        if (e.dataTransfer.files.length) {
            processFile(e.dataTransfer.files[0]);
        }
    });

    function handleFileSelect(event) {
        const file = event.target.files[0];
        if (file) {
            processFile(file);
        }
    }

    async function processFile(file) {
        // Toon processing state
        document.querySelector('.upload-section').style.display = 'none';
        processingDiv.style.display = 'block';
        processingDiv.innerHTML = `
            <div class="spinner"></div>
            <p>Bon wordt verwerkt...</p>
            <p id="ocrStatus">OCR initialiseren...</p>
        `;

        try {
            // Gebruik Tesseract.js voor echte OCR
            const result = await Tesseract.recognize(
                file,
                'nld', // Nederlandse taal
                {
                    logger: m => {
                        // Update status tijdens OCR
                        const statusElement = document.getElementById('ocrStatus');
                        if (statusElement) {
                            if (m.status === 'recognizing text') {
                                statusElement.textContent = `OCR bezig... ${Math.round(m.progress * 100)}%`;
                            } else {
                                statusElement.textContent = `Status: ${m.status}`;
                            }
                        }
                    }
                }
            );
            
            // Verwerk herkende tekst
            processRecognizedText(result.data.text);
        } catch (error) {
            console.error('OCR Error:', error);
            showError("OCR mislukt. Probeer een andere afbeelding.");
        }
    }

    function processRecognizedText(text) {
        // Verberg processing, toon resultaten
        processingDiv.style.display = 'none';
        resultsDiv.style.display = 'block';
        recognizedTextDiv.textContent = text;
        
        // Categoriseer gevonden items
        const categorizedItems = categorizeItemsFromText(text);
        displayCategories(categorizedItems);
    }

    function categorizeItemsFromText(text) {
        const items = {};
        
        // Bekende categorieën (uitbreidbaar)
        const categories = {
            // Snoep
            'KitKat': 'Snoep', 'Chocolade': 'Snoep', 'Snoep': 'Snoep', 'Drop': 'Snoep',
            
            // Fruit
            'Bananen': 'Fruit', 'Appels': 'Fruit', 'Peren': 'Fruit', 'Sinaasappels': 'Fruit',
            'Druiven': 'Fruit', 'Kiwi': 'Fruit', 'Mandarijn': 'Fruit',
            
            // Zuivel
            'Melk': 'Zuivel', 'Kaas': 'Zuivel', 'Yoghurt': 'Zuivel', 'Boter': 'Zuivel',
            'Room': 'Zuivel', 'Kwark': 'Zuivel',
            
            // Drank
            'Cola': 'Drank', 'Water': 'Drank', 'Sap': 'Drank', 'Koffie': 'Drank',
            'Thee': 'Drank', 'Frisdrank': 'Drank', 'Bier': 'Drank', 'Wijn': 'Drank',
            
            // Bakkerij
            'Brood': 'Bakkerij', 'Croissant': 'Bakkerij', 'Banket': 'Bakkerij',
            'Taart': 'Bakkerij', 'Koek': 'Bakkerij', 'Pannenkoeken': 'Bakkerij',
            
            // Vleeswaren
            'Worst': 'Vleeswaren', 'Salami': 'Vleeswaren', 'Ham': 'Vleeswaren',
            'Gevogelte': 'Vleeswaren', 'Rundvlees': 'Vleeswaren', 'Varkensvlees': 'Vleeswaren',
            
            // Groente
            'Tomaten': 'Groente', 'Komkommer': 'Groente', 'Wortels': 'Groente',
            'Aubergine': 'Groente', 'Paprika': 'Groente', 'Uien': 'Groente',
            'Sla': 'Groente', 'Bloemkool': 'Groente', 'Broccoli': 'Groente',
            
            // Droogwaren
            'Rijst': 'Droogwaren', 'Pasta': 'Droogwaren', 'Zout': 'Droogwaren',
            'Peper': 'Droogwaren', 'Kruiden': 'Droogwaren', 'Soep': 'Droogwaren',
            
            // Diepvries
            'IJs': 'Diepvries', 'Gevogelte': 'Diepvries', 'Frites': 'Diepvries',
            
            // Huisdier
            'Hondenvoer': 'Huisdier', 'Kattenvoer': 'Huisdier', 'Voer': 'Huisdier'
        };

        // Zoek naar items in de herkende tekst
        const lines = text.split('\n');
        lines.forEach(line => {
            // Clean up de regel
            const cleanLine = line.trim();
            
            // Zoek naar bekende items in de tekst
            Object.keys(categories).forEach(item => {
                if (cleanLine.toLowerCase().includes(item.toLowerCase()) && !items[item]) {
                    items[item] = categories[item];
                }
            });
            
            // Probeer ook losse woorden te matchen
            const words = cleanLine.split(/\s+/);
            words.forEach(word => {
                const cleanWord = word.replace(/[^\w\s]/gi, '').trim();
                if (categories[cleanWord] && !items[cleanWord]) {
                    items[cleanWord] = categories[cleanWord];
                }
            });
        });

        return items;
    }

    function displayCategories(items) {
        categoriesDiv.innerHTML = '';
        
        if (Object.keys(items).length === 0) {
            categoriesDiv.innerHTML = '<p>Geen items herkend. Probeer een scherpere foto.</p>';
            return;
        }

        // Groepeer items per categorie
        const groupedItems = {};
        Object.entries(items).forEach(([item, category]) => {
            if (!groupedItems[category]) {
                groupedItems[category] = [];
            }
            groupedItems[category].push(item);
        });

        // Toon gegroepeerde items
        Object.entries(groupedItems).forEach(([category, itemList]) => {
            const categoryHeader = document.createElement('h3');
            categoryHeader.textContent = category;
            categoryHeader.style.color = '#667eea';
            categoryHeader.style.marginTop = '15px';
            categoriesDiv.appendChild(categoryHeader);
            
            itemList.forEach(item => {
                const div = document.createElement('div');
                div.className = 'category-item';
                div.innerHTML = `<span>${item}</span>`;
                categoriesDiv.appendChild(div);
            });
        });
    }

    function exportToCSV() {
        // Haal huidige items op uit de weergave
        const items = {};
        const itemElements = document.querySelectorAll('.category-item span');
        itemElements.forEach(span => {
            const text = span.textContent;
            if (text && !items[text]) {
                // Vind de categorie (dit is een simpele aanpak)
                items[text] = 'Onbekend'; // In echte versie haal je dit uit de data
            }
        });

        // Maak CSV content
        let csvContent = "data:text/csv;charset=utf-8," + "Item,Categorie\n";
        Object.entries(items).forEach(([item, category]) => {
            csvContent += `${item},${category}\n`;
        });

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "bon_categorisatie_" + new Date().toISOString().slice(0,10) + ".csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    function resetApp() {
        document.querySelector('.upload-section').style.display = 'flex';
        resultsDiv.style.display = 'none';
        fileInput.value = '';
    }

    function showError(message) {
        processingDiv.style.display = 'none';
        resultsDiv.style.display = 'block';
        recognizedTextDiv.innerHTML = `<span style="color: red;">❌ ${message}</span>`;
        categoriesDiv.innerHTML = '';
    }
});

// Categorie database (uitbreidbaar)
const CATEGORIES = {
    // Snoep
    'KitKat': 'Snoep', 'Chocolade': 'Snoep', 'Snoep': 'Snoep', 'Drop': 'Snoep',
    
    // Fruit
    'Bananen': 'Fruit', 'Appels': 'Fruit', 'Peren': 'Fruit', 'Sinaasappels': 'Fruit',
    'Druiven': 'Fruit', 'Kiwi': 'Fruit', 'Mandarijn': 'Fruit',
    
    // Zuivel
    'Melk': 'Zuivel', 'Kaas': 'Zuivel', 'Yoghurt': 'Zuivel', 'Boter': 'Zuivel',
    'Room': 'Zuivel', 'Kwark': 'Zuivel',
    
    // Drank
    'Cola': 'Drank', 'Water': 'Drank', 'Sap': 'Drank', 'Koffie': 'Drank',
    'Thee': 'Drank', 'Frisdrank': 'Drank', 'Bier': 'Drank', 'Wijn': 'Drank',
    
    // Bakkerij
    'Brood': 'Bakkerij', 'Croissant': 'Bakkerij', 'Banket': 'Bakkerij',
    'Taart': 'Bakkerij', 'Koek': 'Bakkerij', 'Pannenkoeken': 'Bakkerij',
    
    // Vleeswaren
    'Worst': 'Vleeswaren', 'Salami': 'Vleeswaren', 'Ham': 'Vleeswaren',
    'Gevogelte': 'Vleeswaren', 'Rundvlees': 'Vleeswaren', 'Varkensvlees': 'Vleeswaren',
    
    // Groente
    'Tomaten': 'Groente', 'Komkommer': 'Groente', 'Wortels': 'Groente',
    'Aubergine': 'Groente', 'Paprika': 'Groente', 'Uien': 'Groente',
    'Sla': 'Groente', 'Bloemkool': 'Groente', 'Broccoli': 'Groente',
    
    // Droogwaren
    'Rijst': 'Droogwaren', 'Pasta': 'Droogwaren', 'Zout': 'Droogwaren',
    'Peper': 'Droogwaren', 'Kruiden': 'Droogwaren', 'Soep': 'Droogwaren',
    
    // Diepvries
    'IJs': 'Diepvries', 'Gevogelte': 'Diepvries', 'Frites': 'Diepvries',
    
    // Huisdier
    'Hondenvoer': 'Huisdier', 'Kattenvoer': 'Huisdier', 'Voer': 'Huisdier'
};
