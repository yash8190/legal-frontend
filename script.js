document.addEventListener('DOMContentLoaded', () => {
    const promptInput = document.getElementById('promptInput');
    const generateBtn = document.getElementById('generateBtn');
    const answerDiv = document.getElementById('answer');
    const loadingDiv = document.getElementById('loading');
    const documentTypeSelect = document.getElementById('documentType');

    generateBtn.addEventListener('click', async () => {
        if (!promptInput.value.trim()) {
            alert('Please enter document details first!');
            return;
        }

        // Show loading state
        answerDiv.textContent = '';
        loadingDiv.classList.remove('hidden');

        try {
            const response = await fetch('https://legal-doc-backend.onrender.com/generate-document', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    documentType: documentTypeSelect.value,
                    details: promptInput.value
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to generate document');
            }

            const data = await response.json();
            
            // Format the response with proper line breaks
            const formattedDocument = data.document.replace(/\n/g, '<br>');
            answerDiv.innerHTML = formattedDocument;
            
        } catch (error) {
            console.error('Error:', error);
            answerDiv.textContent = `Error: ${error.message || 'Failed to generate document. Please try again.'}`;
        } finally {
            loadingDiv.classList.add('hidden');
        }
    });

    // Add field validation
    function validateInput(details) {
        const requiredFields = {
            'employment': ['job title', 'salary', 'start date'],
            'nda': ['company name', 'confidential information', 'duration'],
            'contract': ['parties involved', 'terms', 'duration']
        };

        const missingFields = [];
        const selectedType = documentTypeSelect.value;
        
        requiredFields[selectedType].forEach(field => {
            if (!details.toLowerCase().includes(field)) {
                missingFields.push(field);
            }
        });

        return missingFields;
    }

    // Add smart suggestions
    function addSmartSuggestions() {
        const suggestionsDiv = document.createElement('div');
        suggestionsDiv.className = 'suggestions';
        
        documentTypeSelect.addEventListener('change', () => {
            const type = documentTypeSelect.value;
            const suggestions = {
                'employment': 'Include: Job Title, Salary, Start Date, Work Hours, Responsibilities',
                'nda': 'Include: Company Name, Confidential Information, Duration, Penalties',
                'contract': 'Include: Parties Involved, Terms, Duration, Payment Details'
            };
            
            suggestionsDiv.textContent = suggestions[type];
        });

        promptInput.parentNode.appendChild(suggestionsDiv);
    }

    // Add document preview
    function addPreviewMode() {
        const previewBtn = document.createElement('button');
        previewBtn.className = 'action-btn';
        previewBtn.innerHTML = '<i class="fas fa-eye"></i> Preview';
        previewBtn.onclick = () => {
            const previewWindow = window.open('', 'Preview', 'width=800,height=600');
            previewWindow.document.write(`
                <html>
                    <head>
                        <title>Document Preview</title>
                        <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600&display=swap" rel="stylesheet">
                        <style>
                            body { font-family: 'Poppins', sans-serif; padding: 2rem; }
                            @media print { body { padding: 0; } }
                        </style>
                    </head>
                    <body>
                        ${document.getElementById('answer').innerHTML}
                    </body>
                </html>
            `);
        };
        document.querySelector('.action-buttons').appendChild(previewBtn);
    }

    // Initialize new features
    addSmartSuggestions();
    addPreviewMode();

    // Tab Navigation
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const tabId = btn.dataset.tab;
            
            // Update buttons
            tabBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            // Update content
            tabContents.forEach(content => {
                content.classList.remove('active');
                if (content.id === tabId) {
                    content.classList.add('active');
                }
            });
        });
    });

    // Training Functionality
    const submitTrainingBtn = document.getElementById('submitTrainingBtn');
    const trainingMessage = document.getElementById('trainingMessage');
    const totalSamples = document.getElementById('totalSamples');
    const categoryCoverage = document.getElementById('categoryCoverage');

    submitTrainingBtn.addEventListener('click', async () => {
        const category = document.getElementById('trainingCategory').value;
        const content = document.getElementById('lawContent').value;
        const expectedOutput = document.getElementById('expectedOutput').value;

        if (!content || !expectedOutput) {
            alert('Please fill in both the content and expected output fields');
            return;
        }

        try {
            submitTrainingBtn.disabled = true;
            trainingMessage.textContent = 'Submitting training data...';
            trainingMessage.classList.remove('hidden');

            const response = await fetch('https://legal-doc-backend.onrender.com/submit-training', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    category,
                    content,
                    expectedOutput
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error);
            }

            // Update stats
            totalSamples.textContent = data.stats.totalSamples;
            categoryCoverage.textContent = `${data.stats.categoryCoverage}%`;

            trainingMessage.textContent = 'Training data submitted successfully!';
            trainingMessage.style.color = '#4CAF50';

            // Clear inputs
            document.getElementById('lawContent').value = '';
            document.getElementById('expectedOutput').value = '';

        } catch (error) {
            trainingMessage.textContent = `Error: ${error.message}`;
            trainingMessage.style.color = '#f44336';
        } finally {
            submitTrainingBtn.disabled = false;
        }
    });

    // Add this to your existing script.js

    function initializeFileUpload() {
        const fileInput = document.getElementById('trainingFiles');
        const fileList = document.getElementById('fileList');
        const uploadContainer = document.querySelector('.upload-container');

        // Drag and drop functionality
        uploadContainer.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadContainer.classList.add('drag-over');
        });

        uploadContainer.addEventListener('dragleave', () => {
            uploadContainer.classList.remove('drag-over');
        });

        uploadContainer.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadContainer.classList.remove('drag-over');
            fileInput.files = e.dataTransfer.files;
            handleFileSelection();
        });

        fileInput.addEventListener('change', handleFileSelection);

        async function handleFileSelection() {
            const files = fileInput.files;
            if (files.length === 0) return;

            const category = document.getElementById('trainingCategory').value;
            const formData = new FormData();
            
            // Add files to form data
            for (let file of files) {
                formData.append('files', file);
            }
            formData.append('category', category);

            // Show loading state
            fileList.innerHTML = '<div class="loading">Processing files...</div>';

            try {
                const response = await fetch('https://legal-doc-backend.onrender.com/upload-training-files', {
                    method: 'POST',
                    body: formData
                });

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.error);
                }

                // Update file list
                fileList.innerHTML = data.processedFiles.map(file => `
                    <div class="file-item success">
                        <i class="fas fa-check-circle"></i>
                        ${file.filename} - Processed successfully
                    </div>
                `).join('');

                // Update stats
                document.getElementById('totalSamples').textContent = data.stats.totalSamples;
                document.getElementById('categoryCoverage').textContent = 
                    `${data.stats.categoryCoverage}%`;

            } catch (error) {
                fileList.innerHTML = `
                    <div class="file-item error">
                        <i class="fas fa-exclamation-circle"></i>
                        Error: ${error.message}
                    </div>
                `;
            }
        }
    }

    // Call this in your DOMContentLoaded event
    initializeFileUpload();
}); 