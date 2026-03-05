// Simulatie van OCR en categorisatie (voor demo doeleinden)
// In productie zou je hier Google Cloud Vision API gebruiken

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

    function processFile(file) {
        // Toon processing state
        document.querySelector('.upload-section').style.display = 'none';
        processingDiv.style.display = 'block';

        // Simuleer OCR processing (in productie gebruik je Google Cloud Vision)
        setTimeout(() => {
            simulateOCR(file);
        }, 2000);
    }

    function simulateOCR(file) {
        // Simulatie data
        const recognizedText = `BON
DATUM: 01-01-2024
ITEMS:
KitKat                 €1,20
Bananen                €0,80
Melk                   €1,50
Cola                   €1,80
Brood                  €2,30
TOTAAL                 €7,60`;

        const categorizedItems = {
            'KitKat': 'Snoep',
            'Bananen': 'Fruit',
            'Melk': 'Zuivel',
            'Cola': 'Drank',
            'Brood': 'Bakkerij'
        };

        // Toon resultaten
        processingDiv.style.display = 'none';
        resultsDiv.style.display = 'block';
        recognizedTextDiv.textContent = recognizedText;
        
        // Toon gecategoriseerde items
        categoriesDiv.innerHTML = '';
        for (const [item, category] of Object.entries(categorizedItems)) {
            const div = document.createElement('div');
            div.className = 'category-item';
            div.innerHTML = `<span>${item}</span><span>${category}</span>`;
            categoriesDiv.appendChild(div);
        }
    }

    function exportToCSV() {
        const csvContent = "data:text/csv;charset=utf-8," 
            + "Item,Categorie\n"
            + "KitKat,Snoep\n"
            + "Bananen,Fruit\n"
            + "Melk,Zuivel\n"
            + "Cola,Drank\n"
            + "Brood,Bakkerij";

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "bon_categorisatie.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    function resetApp() {
        document.querySelector('.upload-section').style.display = 'flex';
        resultsDiv.style.display = 'none';
        fileInput.value = '';
    }
});

// Categorie database (uitbreidbaar)
const CATEGORIES = {
    // Snoep
    'KitKat': 'Snoep',
    'Chocolade': 'Snoep',
    'Snoep': 'Snoep',
    'Drop': 'Snoep',
    
    // Fruit
    'Bananen': 'Fruit',
    'Appels': 'Fruit',
    'Peren': 'Fruit',
    'Sinaasappels': 'Fruit',
    'Druiven': 'Fruit',
    
    // Zuivel
    'Melk': 'Zuivel',
    'Kaas': 'Zuivel',
    'Yoghurt': 'Zuivel',
    'Boter': 'Zuivel',
    
    // Drank
    'Cola': 'Drank',
    'Water': 'Drank',
    'Sap': 'Drank',
    'Koffie': 'Drank',
    'Thee': 'Drank',
    
    // Bakkerij
    'Brood': 'Bakkerij',
    'Croissant': 'Bakkerij',
    'Banket': 'Bakkerij',
    
    // Vleeswaren
    'Worst': 'Vleeswaren',
    'Salami': 'Vleeswaren',
    'Ham': 'Vleeswaren',
    
    // Groente
    'Tomaten': 'Groente',
    'Komkommer': 'Groente',
    'Wortels': 'Groente',
    
    // Droogwaren
    'Rijst': 'Droogwaren',
    'Pasta': 'Droogwaren',
    'Zout': 'Droogwaren'
};