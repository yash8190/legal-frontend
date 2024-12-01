document.addEventListener('DOMContentLoaded', () => {
    const promptInput = document.getElementById('promptInput');
    const generateBtn = document.getElementById('generateBtn');
    const answerDiv = document.getElementById('answer');
    const loadingDiv = document.getElementById('loading');
    const documentTypeSelect = document.getElementById('documentType');

    if (generateBtn && promptInput && answerDiv) {
        generateBtn.addEventListener('click', async () => {
            if (!promptInput.value.trim()) {
                alert('Please enter document details first!');
                return;
            }

            // Show loading state
            answerDiv.textContent = '';
            loadingDiv.classList.remove('hidden');

            try {
                console.log('Sending request:', {
                    documentType: documentTypeSelect.value,
                    details: promptInput.value
                });

                const response = await fetch('https://legal-doc-backend.onrender.com/generate-document', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    },
                    body: JSON.stringify({
                        documentType: documentTypeSelect.value,
                        details: promptInput.value
                    })
                });

                const data = await response.json();
                console.log('Response:', data);

                if (!response.ok) {
                    throw new Error(data.error || data.details || 'Failed to generate document');
                }

                const formattedDocument = data.document.replace(/\n/g, '<br>');
                answerDiv.innerHTML = formattedDocument;
                
            } catch (error) {
                console.error('Error details:', error);
                answerDiv.textContent = `Error: ${error.message}. Please try again.`;
            } finally {
                loadingDiv.classList.add('hidden');
            }
        });

        if (documentTypeSelect) {
            addSmartSuggestions();
            addPreviewMode();
        }
    }
}); 