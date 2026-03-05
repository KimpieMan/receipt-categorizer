// Tesseract.js voor echte OCR + AI leerfunctie
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
                'nld+eng', // Nederlandse + Engelse taal
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
        
        // Toon leer-interface voor nieuwe items
        showLearningInterface(categorizedItems);
    }

    function categorizeItemsFromText(text) {
        const items = {};
        
        // Laad alle categorieën (standaard + geleerd)
        const allCategories = loadAllCategories();
        
        // Zoek naar bekende items in de tekst
        const lines = text.split('\n');
        lines.forEach(line => {
            const cleanLine = line.trim();
            if (!cleanLine) return;
            
            // Zoek naar bekende items EERST
            Object.keys(allCategories).forEach(item => {
                if (cleanLine.toLowerCase().includes(item.toLowerCase())) {
                    items[item] = allCategories[item];
                }
            });
            
            // Zoek naar mogelijke nieuwe items
            const potentialItems = extractPotentialItems(cleanLine);
            potentialItems.forEach(item => {
                if (item.length > 2 && !allCategories[item] && !items[item]) {
                    items[item] = 'Te categoriseren';
                }
            });
        });

        return items;
    }

    function loadAllCategories() {
        // Standaard categorieën
        const standardCategories = {
            // Snoep
            'KitKat': 'Snoep', 'Chocolade': 'Snoep', 'Snoep': 'Snoep', 'Drop': 'Snoep',
            'M&M': 'Snoep', 'Haribo': 'Snoep', 'Toblerone': 'Snoep', 'Lolly': 'Snoep',
            
            // Fruit
            'Bananen': 'Fruit', 'Appels': 'Fruit', 'Peren': 'Fruit', 'Sinaasappels': 'Fruit',
            'Druiven': 'Fruit', 'Kiwi': 'Fruit', 'Mandarijn': 'Fruit', 'Citroen': 'Fruit',
            'Meloen': 'Fruit', 'Ananas': 'Fruit', 'Bessen': 'Fruit',
            
            // Zuivel
            'Melk': 'Zuivel', 'Kaas': 'Zuivel', 'Yoghurt': 'Zuivel', 'Boter': 'Zuivel',
            'Room': 'Zuivel', 'Kwark': 'Zuivel', 'Crème': 'Zuivel', 'Joghurt': 'Zuivel',
            
            // Drank
            'Cola': 'Drank', 'Water': 'Drank', 'Sap': 'Drank', 'Koffie': 'Drank',
            'Thee': 'Drank', 'Frisdrank': 'Drank', 'Bier': 'Drank', 'Wijn': 'Drank',
            'Fanta': 'Drank', 'Sprite': 'Drank', 'Red Bull': 'Drank', 'Energy': 'Drank',
            
            // Bakkerij
            'Brood': 'Bakkerij', 'Croissant': 'Bakkerij', 'Banket': 'Bakkerij',
            'Taart': 'Bakkerij', 'Koek': 'Bakkerij', 'Pannenkoeken': 'Bakkerij',
            'Baguette': 'Bakkerij', 'Pistolet': 'Bakkerij', 'Worstplank': 'Bakkerij',
            
            // Vleeswaren
            'Worst': 'Vleeswaren', 'Salami': 'Vleeswaren', 'Ham': 'Vleeswaren',
            'Gevogelte': 'Vleeswaren', 'Rundvlees': 'Vleeswaren', 'Varkensvlees': 'Vleeswaren',
            'Kip': 'Vleeswaren', 'Kalkoen': 'Vleeswaren', 'Spek': 'Vleeswaren',
            
            // Groente
            'Tomaten': 'Groente', 'Komkommer': 'Groente', 'Wortels': 'Groente',
            'Aubergine': 'Groente', 'Paprika': 'Groente', 'Uien': 'Groente',
            'Sla': 'Groente', 'Bloemkool': 'Groente', 'Broccoli': 'Groente',
            'Spinazie': 'Groente', 'Mais': 'Groente', 'Avocado': 'Groente',
            
            // Droogwaren
            'Rijst': 'Droogwaren', 'Pasta': 'Droogwaren', 'Zout': 'Droogwaren',
            'Peper': 'Droogwaren', 'Kruiden': 'Droogwaren', 'Soep': 'Droogwaren',
            'Crackers': 'Droogwaren', 'Chips': 'Droogwaren', 'Noten': 'Droogwaren',
            
            // Diepvries
            'IJs': 'Diepvries', 'Gevogelte': 'Diepvries', 'Frites': 'Diepvries',
            'Vis': 'Diepvries', 'Gehakt': 'Diepvries', 'Pizza': 'Diepvries',
            
            // Huisdier
            'Hondenvoer': 'Huisdier', 'Kattenvoer': 'Huisdier', 'Voer': 'Huisdier',
            'Beau': 'Huisdier', 'Whiskas': 'Huisdier', 'Pedigree': 'Huisdier',
            
            // Huishouden
            'Wasmiddel': 'Huishouden', 'Zeep': 'Huishouden', 'Shampoo': 'Huishouden',
            'Deodorant': 'Huishouden', 'Tandpasta': 'Huishouden', 'WC-papier': 'Huishouden',
            'Keukenpapier': 'Huishouden', 'Afwas': 'Huishouden'
        };
        
        // Geleerde categorieën uit localStorage
        const learnedCategories = JSON.parse(localStorage.getItem('learnedCategories') || '{}');
        
        // Combineer beide
        return {...standardCategories, ...learnedCategories};
    }

    function extractPotentialItems(line) {
        const items = [];
        const words = line.split(/\s+/);
        
        // Zoek naar woorden die waarschijnlijk producten zijn
        words.forEach((word, index) => {
            const cleanWord = word.replace(/[^\w\s]/gi, '').trim();
            if (cleanWord.length > 2 && 
                !/^[€€0-9,\.\-\+\%]+$/.test(cleanWord) && // Geen prijzen
                !['TOT', 'TOTAAL', 'BTW', 'ITEMS', 'BON', 'BETAALD', 'CONTANT', 'PIN'].includes(cleanWord.toUpperCase()) &&
                !cleanWord.match(/^[A-Z]{1,2}[0-9]+$/) && // Geen codes als A123
                cleanWord.length < 20) { // Redelijke lengte
                items.push(cleanWord);
            }
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
            groupedItems[category].push({item, needsLearning: category === 'Te categoriseren'});
        });

        // Toon gegroepeerde items
        Object.entries(groupedItems).forEach(([category, itemList]) => {
            const categoryHeader = document.createElement('h3');
            categoryHeader.textContent = category;
            categoryHeader.style.color = '#667eea';
            categoryHeader.style.marginTop = '15px';
            categoriesDiv.appendChild(categoryHeader);
            
            itemList.forEach(({item, needsLearning}) => {
                const div = document.createElement('div');
                div.className = 'category-item';
                div.innerHTML = `<span>${item}</span> ${needsLearning ? '<small style="color: orange;">(leer mij!)</small>' : ''}`;
                categoriesDiv.appendChild(div);
            });
        });
    }

    function showLearningInterface(categorizedItems) {
        // Verwijder eventuele bestaande leer-sectie
        const existingLearnSection = document.querySelector('.learning-section');
        if (existingLearnSection) {
            existingLearnSection.remove();
        }
        
        // Zoek items die geleerd moeten worden
        const itemsToLearn = Object.entries(categorizedItems)
            .filter(([item, category]) => category === 'Te categoriseren')
            .map(([item]) => item);
        
        if (itemsToLearn.length === 0) return;

        // Voeg leer-sectie toe
        const learnSection = document.createElement('div');
        learnSection.className = 'learning-section';
        learnSection.style.marginTop = '30px';
        learnSection.style.padding = '20px';
        learnSection.style.background = '#f0f8ff';
        learnSection.style.borderRadius = '10px';
        
        learnSection.innerHTML = `
            <h3>💡 AI Leertijd!</h3>
            <p>Help de app slimmer worden door deze nieuwe items te categoriseren:</p>
            <div id="learnItemsContainer"></div>
        `;
        
        // Voeg toe aan resultaten
        resultsDiv.appendChild(learnSection);
        
        // Vul items in
        const container = document.getElementById('learnItemsContainer');
        itemsToLearn.forEach(item => {
            const itemDiv = document.createElement('div');
            itemDiv.className = 'learn-item';
            itemDiv.style.display = 'flex';
            itemDiv.style.alignItems = 'center';
            itemDiv.style.gap = '10px';
            itemDiv.style.margin = '10px 0';
            itemDiv.innerHTML = `
                <span style="flex: 1;"><strong>${item}</strong></span>
                <select data-item="${item}" style="flex: 2; padding: 5px; border-radius: 5px; border: 1px solid #ddd;">
                    <option value="">Kies categorie...</option>
                    <option value="Snoep">🍬 Snoep</option>
                    <option value="Fruit">🍎 Fruit</option>
                    <option value="Zuivel">🥛 Zuivel</option>
                    <option value="Drank">🥤 Drank</option>
                    <option value="Bakkerij">🍞 Bakkerij</option>
                    <option value="Vleeswaren">🍖 Vleeswaren</option>
                    <option value="Groente">🥬 Groente</option>
                    <option value="Droogwaren">📦 Droogwaren</option>
                    <option value="Diepvries">❄️ Diepvries</option>
                    <option value="Huishouden">🏠 Huishouden</option>
                    <option value="Huisdier">🐾 Huisdier</option>
                </select>
                <button onclick="window.saveCategory('${item}', this)" 
                        style="padding: 5px 10px; background: #667eea; color: white; border: none; border-radius: 5px; cursor: pointer;">
                    ✓ Leer
                </button>
            `;
            container.appendChild(itemDiv);
        });
    }

    // Globale functie voor opslaan categorieën
    window.saveCategory = function(item, button) {
        const select = button.previousElementSibling;
        const category = select.value;
        
        if (!category) {
            alert('Kies eerst een categorie!');
            return;
        }
        
        // Sla op in localStorage
        const learnedCategories = JSON.parse(localStorage.getItem('learnedCategories') || '{}');
        learnedCategories[item] = category;
        localStorage.setItem('learnedCategories', JSON.stringify(learnedCategories));
        
        // Update weergave
        button.textContent = '✓ Geleerd!';
        button.style.background = '#4CAF50';
        button.disabled = true;
        
        // Update categorie in lijst
        const itemSpans = document.querySelectorAll('.category-item span');
        itemSpans.forEach(span => {
            if (span.textContent === item) {
                const parent = span.parentElement;
                if (parent.innerHTML.includes('(leer mij!)')) {
                    parent.innerHTML = parent.innerHTML.replace('(leer mij!)', '');
                }
            }
        });
        
        console.log(`AI geleerd: ${item} = ${category}`);
        alert(`✓ Super! Ik weet nu dat "${item}" bij ${category} hoort.`);
    };

    function exportToCSV() {
        // Haal huidige items op uit de weergave
        const items = {};
        const allCategories = loadAllCategories();
        
        // Verzamel items uit de categorie-weergave
        const categoryHeaders = document.querySelectorAll('#categories h3');
        categoryHeaders.forEach(header => {
            const categoryName = header.textContent;
            const itemsInSection = header.nextElementSibling;
            while (itemsInSection && itemsInSection.tagName === 'DIV' && itemsInSection.className === 'category-item') {
                const itemSpan = itemsInSection.querySelector('span');
                if (itemSpan) {
                    const itemText = itemSpan.textContent.replace(' (leer mij!)', '');
                    items[itemText] = categoryName;
                }
                itemsInSection = itemsInSection.nextElementSibling;
            }
        });

        // Maak CSV content
        let csvContent = "data:text/csv;charset=utf-8," + "Item,Categorie\n";
        Object.entries(items).forEach(([item, category]) => {
            csvContent += `"${item}","${category}"\n`;
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
        
        // Verwijder leer-sectie als die er is
        const learnSection = document.querySelector('.learning-section');
        if (learnSection) {
            learnSection.remove();
        }
    }

    function showError(message) {
        processingDiv.style.display = 'none';
        resultsDiv.style.display = 'block';
        recognizedTextDiv.innerHTML = `<span style="color: red;">❌ ${message}</span>`;
        categoriesDiv.innerHTML = '';
    }
});
