document.addEventListener('DOMContentLoaded', () => {
    // Determine mode: normal chat user or admin opening a chat with a user
    const adminMode = sessionStorage.getItem('adminChat') === 'true';
    const chatUser = sessionStorage.getItem('chatUser');
    const chatUserId = sessionStorage.getItem('chatUserId');

    if (adminMode) {
        // Admin must be logged in to open admin chat
        if (sessionStorage.getItem('adminLoggedIn') !== 'true') {
            window.location.href = 'login.html';
            return;
        }
    } else {
        // Regular chat user must have chat session
        if (!chatUser || !chatUserId) {
            window.location.href = 'index.html';
            return;
        }
    }

    const chatMessages = document.getElementById('chatMessages');
    const chatInput = document.getElementById('chatInput');
    const chatSendBtn = document.getElementById('chatSendBtn');
    const chatBackBtn = document.getElementById('chatBackBtn');

    // Update header (show user when admin opens chat)
    const headerNameEl = document.querySelector('.chat-header-info h3');
    const headerStatusEl = document.querySelector('.chat-header-info span');
    const avatarEl = document.querySelector('.chat-header-avatar');
    if (adminMode) {
        if (headerNameEl) headerNameEl.textContent = `${chatUser} (User)`;
        if (headerStatusEl) headerStatusEl.innerHTML = '<i class="fas fa-circle" style="font-size:0.5rem"></i> Online';
        if (avatarEl) avatarEl.textContent = chatUser ? chatUser.split(' ').map(s => s[0]).join('').slice(0, 2).toUpperCase() : 'U';
    } else {
        if (headerNameEl) headerNameEl.textContent = 'Vijay Anand (Admin)';
        if (avatarEl) avatarEl.textContent = 'VA';
    }

    // Back button
    chatBackBtn.addEventListener('click', () => {
        sessionStorage.removeItem('chatUser');
        sessionStorage.removeItem('chatUserId');
        if (adminMode) {
            sessionStorage.removeItem('adminChat');
            // Return admin to chat settings page
            window.location.href = 'chat.html';
        } else {
            window.location.href = 'index.html';
        }
    });

    // Format time
    function formatTime(dateStr) {
        const d = new Date(dateStr);
        return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }

    // Format date
    function formatDate(dateStr) {
        const d = new Date(dateStr);
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        if (d.toDateString() === today.toDateString()) return 'Today';
        if (d.toDateString() === yesterday.toDateString()) return 'Yesterday';
        return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
    }

    // Render messages
    function renderMessages(messages) {
        if (!messages || messages.length === 0) {
            chatMessages.innerHTML = `
                <div class="chat-empty">
                    <i class="fas fa-comments"></i>
                    <p>No messages yet. Start the conversation!</p>
                </div>
            `;
            return;
        }

        let html = '';
        let lastDate = '';

        messages.forEach((msg) => {
            const msgDate = formatDate(msg.created_at);
            if (msgDate !== lastDate) {
                html += `<div class="chat-date-divider"><span>${msgDate}</span></div>`;
                lastDate = msgDate;
            }

            // Determine who is the current sender in this UI
            const currentSender = adminMode ? 'admin' : chatUser;
            const isSent = msg.sender_username === currentSender;
            const bubbleClass = isSent ? 'msg-sent' : 'msg-received';
            let senderLabel = '';
            if (!isSent) {
                // Show sender name for received messages
                senderLabel = `<div class="msg-sender-name">${msg.sender_username === 'admin' ? 'Admin' : msg.sender_username}</div>`;
            }

            html += `
                <div class="msg-bubble ${bubbleClass}">
                    ${senderLabel}
                    ${(msg.message || '').replace(/</g, '&lt;').replace(/\n/g, '<br>')}
                    <div class="msg-time">${formatTime(msg.created_at)}</div>
                </div>
            `;
        });

        chatMessages.innerHTML = html;
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    // Load messages
    async function loadMessages() {
        try {
            const { data, error } = await supabaseClient
                .from('chat_messages')
                .select('*')
                .or(`and(sender_username.eq.${chatUser},receiver_username.eq.admin),and(sender_username.eq.admin,receiver_username.eq.${chatUser})`)
                .order('created_at', { ascending: true });

            if (error) throw error;
            renderMessages(data);
        } catch (err) {
            console.error('Load messages error:', err);
        }
    }

    loadMessages();

    // Send message
    async function sendMessage() {
        const text = chatInput.value.trim();
        if (!text) return;

        chatInput.value = '';
        chatSendBtn.disabled = true;

        try {
                const payload = adminMode ? {
                    sender_username: 'admin',
                    receiver_username: chatUser,
                    message: text
                } : {
                    sender_username: chatUser,
                    receiver_username: 'admin',
                    message: text
                };

                const { error } = await supabaseClient
                    .from('chat_messages')
                    .insert([payload]);

            if (error) throw error;
            loadMessages();
        } catch (err) {
            alert('Failed to send message. Try again.');
            chatInput.value = text;
        } finally {
            chatSendBtn.disabled = false;
            chatInput.focus();
        }
    }

    // Send button click
    chatSendBtn.addEventListener('click', sendMessage);

    // Enter key to send
    chatInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });

    // Real-time: listen for new messages
    supabaseClient
        .channel('chat-realtime')
        .on('postgres_changes',
            { event: 'INSERT', schema: 'public', table: 'chat_messages' },
            (payload) => {
                const msg = payload.new;
                // Only handle messages related to this chat
                if (msg.sender_username === chatUser || msg.receiver_username === chatUser || (adminMode && (msg.sender_username === 'admin' || msg.receiver_username === 'admin'))) {
                    // Append the incoming message to the DOM to avoid full reloads
                    try {
                        appendMessage(msg);
                    } catch (e) {
                        // Fallback: reload full list
                        loadMessages();
                    }
                }
            }
        )
        .subscribe();

    // Append a single message bubble to the chat messages container
    function appendMessage(msg) {
        if (!msg || !msg.message) return;

        // Determine who is the current sender in this UI
        const currentSender = adminMode ? 'admin' : chatUser;
        const isSent = msg.sender_username === currentSender;
        const bubbleClass = isSent ? 'msg-sent' : 'msg-received';
        const senderLabel = !isSent ? `<div class="msg-sender-name">${msg.sender_username === 'admin' ? 'Admin' : msg.sender_username}</div>` : '';

        const timeHtml = `<div class="msg-time">${formatTime(msg.created_at)}</div>`;
        const bubble = document.createElement('div');
        bubble.className = `msg-bubble ${bubbleClass}`;
        bubble.innerHTML = `${senderLabel}${(msg.message || '').replace(/</g, '&lt;').replace(/\n/g, '<br>')}${timeHtml}`;

        // If there's a date divider needed, add it
        const lastDivider = chatMessages.querySelector('.chat-date-divider:last-of-type');
        const lastDividerText = lastDivider ? lastDivider.textContent.trim() : '';
        const msgDate = formatDate(msg.created_at);
        if (msgDate !== lastDividerText) {
            const divider = document.createElement('div');
            divider.className = 'chat-date-divider';
            divider.innerHTML = `<span>${msgDate}</span>`;
            chatMessages.appendChild(divider);
        }

        chatMessages.appendChild(bubble);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
});
