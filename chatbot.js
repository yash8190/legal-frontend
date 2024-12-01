document.addEventListener('DOMContentLoaded', () => {
    const chatInput = document.getElementById('chatInput');
    const sendButton = document.getElementById('sendMessage');
    const chatMessages = document.getElementById('chatMessages');
    const clearButton = document.getElementById('clearChat');
    const exportButton = document.getElementById('exportChat');
    const topicButtons = document.querySelectorAll('.topic-btn');
    const quickReplyButtons = document.querySelectorAll('.quick-reply-btn');
    const attachButton = document.getElementById('attachFile');
    const typingIndicator = document.querySelector('.typing-indicator');

    let chatHistory = [];

    function showTypingIndicator() {
        typingIndicator.classList.remove('hidden');
    }

    function hideTypingIndicator() {
        typingIndicator.classList.add('hidden');
    }

    function formatTimestamp(date) {
        return new Intl.DateTimeFormat('en-US', {
            hour: '2-digit',
            minute: '2-digit'
        }).format(date);
    }

    async function sendMessage(message, isQuickReply = false) {
        if (!message.trim()) return;

        // Add user message to chat
        appendMessage('user', message);
        chatInput.value = '';

        // Show typing indicator
        showTypingIndicator();

        try {
            const response = await fetch('http://localhost:3000/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ message })
            });

            const data = await response.json();
            
            // Hide typing indicator
            hideTypingIndicator();

            // Add bot response to chat
            appendMessage('bot', data.response);

            // Save to chat history
            saveChatHistory(message, data.response);

        } catch (error) {
            hideTypingIndicator();
            appendMessage('bot', 'Sorry, I encountered an error. Please try again.');
        }
    }

    function appendMessage(type, content) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${type}`;
        
        const timestamp = formatTimestamp(new Date());

        if (type === 'bot') {
            messageDiv.innerHTML = `
                <div class="message-content">
                    <i class="fas fa-balance-scale bot-icon"></i>
                    <div class="text-content">
                        <p>${content}</p>
                    </div>
                </div>
                <div class="message-time">${timestamp}</div>
            `;
        } else {
            messageDiv.innerHTML = `
                <div class="message-content">
                    <p>${content}</p>
                </div>
                <div class="message-time">${timestamp}</div>
            `;
        }

        chatMessages.appendChild(messageDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    function saveChatHistory(question, answer) {
        chatHistory.push({
            timestamp: new Date(),
            question,
            answer
        });
        updateChatHistoryUI();
    }

    function updateChatHistoryUI() {
        const historyList = document.getElementById('chatHistoryList');
        historyList.innerHTML = chatHistory
            .slice(-5)
            .map(chat => `
                <div class="history-item" onclick="loadChat(${chat.timestamp})">
                    <div class="history-question">${chat.question.substring(0, 30)}...</div>
                    <div class="history-time">${formatTimestamp(chat.timestamp)}</div>
                </div>
            `)
            .join('');
    }

    function exportChatHistory() {
        const chatContent = chatHistory
            .map(chat => `Q: ${chat.question}\nA: ${chat.answer}\n`)
            .join('\n');
        
        const blob = new Blob([chatContent], { type: 'text/plain' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'chat-history.txt';
        a.click();
    }

    // Event Listeners
    sendButton.addEventListener('click', () => sendMessage(chatInput.value));

    chatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage(chatInput.value);
        }
    });

    clearButton.addEventListener('click', () => {
        chatMessages.innerHTML = '';
        appendMessage('bot', 'Chat cleared. How can I help you?');
        chatHistory = [];
        updateChatHistoryUI();
    });

    exportButton.addEventListener('click', exportChatHistory);

    topicButtons.forEach(button => {
        button.addEventListener('click', () => {
            const topic = button.dataset.topic;
            const questions = {
                employment: "What are the basic employment rights in India?",
                property: "What is the process for property registration in India?",
                family: "What are the grounds for divorce in India?",
                criminal: "What is the bail process in India?"
            };
            sendMessage(questions[topic], true);
        });
    });

    quickReplyButtons.forEach(button => {
        button.addEventListener('click', () => {
            sendMessage(button.textContent, true);
        });
    });

    // Auto-resize textarea
    chatInput.addEventListener('input', () => {
        chatInput.style.height = 'auto';
        chatInput.style.height = chatInput.scrollHeight + 'px';
    });
}); 