document.addEventListener('DOMContentLoaded', () => {
    const submitTrainingBtn = document.getElementById('submitTrainingBtn');
    const trainingMessage = document.getElementById('trainingMessage');
    const totalSamples = document.getElementById('totalSamples');
    const categoryCoverage = document.getElementById('categoryCoverage');

    function initializeFileUpload() {
        const fileInput = document.getElementById('trainingFiles');
        const fileList = document.getElementById('fileList');
        const uploadContainer = document.querySelector('.upload-container');

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
            
            for (let file of files) {
                formData.append('files', file);
            }
            formData.append('category', category);

            fileList.innerHTML = '<div class="loading">Processing files...</div>';

            try {
                const response = await fetch('http://localhost:3000/upload-training-files', {
                    method: 'POST',
                    body: formData
                });

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.error);
                }

                fileList.innerHTML = data.processedFiles.map(file => `
                    <div class="file-item success">
                        <i class="fas fa-check-circle"></i>
                        ${file.filename} - Processed successfully
                    </div>
                `).join('');

                updateStats(data.stats);

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

    function updateStats(stats) {
        totalSamples.textContent = stats.totalSamples;
        categoryCoverage.textContent = `${stats.categoryCoverage}%`;
    }

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

            const response = await fetch('http://localhost:3000/submit-training', {
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

            updateStats(data.stats);
            trainingMessage.textContent = 'Training data submitted successfully!';
            trainingMessage.style.color = '#4CAF50';

            document.getElementById('lawContent').value = '';
            document.getElementById('expectedOutput').value = '';

        } catch (error) {
            trainingMessage.textContent = `Error: ${error.message}`;
            trainingMessage.style.color = '#f44336';
        } finally {
            submitTrainingBtn.disabled = false;
        }
    });

    initializeFileUpload();
}); 