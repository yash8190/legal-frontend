document.addEventListener('DOMContentLoaded', () => {
    const submitTrainingBtn = document.getElementById('submitTrainingBtn');
    const trainingMessage = document.getElementById('trainingMessage');

    if (submitTrainingBtn && trainingMessage) {
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
    }

    const uploadContainer = document.querySelector('.upload-container');
    if (uploadContainer) {
        initializeFileUpload();
    }
}); 