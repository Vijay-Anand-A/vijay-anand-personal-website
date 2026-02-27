document.addEventListener('DOMContentLoaded', async () => {
    try {
        // Ensure Supabase client is available
        if (typeof supabaseClient === 'undefined' || !supabaseClient) {
            console.error('[chat-room] supabaseClient is not initialized. Check supabase-config.js and CDN load order.');
            return;
        }
    } catch (e) {
        console.error('[chat-room] error checking supabaseClient', e);
        return;
    }
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

    // Basic DOM sanity checks
    if (!chatMessages || !chatInput || !chatSendBtn || !chatBackBtn) {
        console.error('[chat-room] missing DOM elements:', {
            chatMessages: !!chatMessages,
            chatInput: !!chatInput,
            chatSendBtn: !!chatSendBtn,
            chatBackBtn: !!chatBackBtn
        });
        return;
    }

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

    // Track appended message ids to avoid duplicates when both realtime and polling run
    const appendedMessageIds = new Set();

    // Last fetched message timestamp (used by polling). Declare early so functions can reference it.
    let lastFetchedAt = null;

    // Polling config and timer (declare early to avoid TDZ when startPolling is called)
    const POLL_INTERVAL_MS = 3000;
    let pollTimer = null;

    // When we load the full list, mark existing ids
    function markLoadedMessageIds(messages) {
        if (!messages) return;
        messages.forEach(m => {
            if (m && m.id) appendedMessageIds.add(String(m.id));
        });
        // Update last fetched timestamp to the latest message timestamp
        if (messages.length > 0) {
            const last = messages[messages.length - 1];
            lastFetchedAt = last.created_at;
        }
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
            markLoadedMessageIds(data || []);
            // After loading the conversation (message area reload), mark notification as handled ('no')
            try {
                await supabaseClient
                    .from('chat_notifications')
                    .upsert([{ chat_username: chatUser, status: 'no' }], { onConflict: 'chat_username' });
            } catch (e) {
                console.error('[chat-room] failed to clear notification', e);
            }
        } catch (err) {
            console.error('Load messages error:', err);
        }
    }

    // Load messages first, then start polling
    try {
        await loadMessages();
    } catch (e) {
        console.error('[chat-room] loadMessages failed on init', e);
    }
    // Start polling for notifications and new messages
    startPolling();

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

                    console.debug('[chat-room] sendMessage payload', { payload, adminMode, chatUser });
                    if (typeof supabaseClient === 'undefined' || !supabaseClient) {
                        console.error('[chat-room] supabaseClient missing when sending message');
                        throw new Error('supabaseClient not initialized');
                    }

                    const { data, error } = await supabaseClient
                        .from('chat_messages')
                        .insert([payload])
                        .select();

                    console.debug('[chat-room] sendMessage result', { data, error });
                    if (error) throw error;

                // Set conversation-level notification to 'new' so the other side knows to reload message area
                try {
                    await supabaseClient
                        .from('chat_notifications')
                        .upsert([{ chat_username: chatUser, status: 'new' }], { onConflict: 'chat_username' });
                } catch (e) {
                    console.error('[chat-room] failed to set notification to new', e);
                }

                // Render newly sent message locally (avoid waiting for realtime)
                if (data && data.length > 0) {
                    data.forEach(m => appendMessage(m));
                } else {
                    loadMessages();
                }
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
    console.debug('[chat-room] initializing realtime subscription', { adminMode, chatUser });
    supabaseClient
        .channel('chat-realtime')
        .on('postgres_changes',
            { event: 'INSERT', schema: 'public', table: 'chat_messages' },
            (payload) => {
                console.debug('[chat-room] realtime payload received', payload);
                const msg = payload.new;

                // Only handle messages strictly between admin and this chatUser
                const relates = (msg.sender_username === chatUser && msg.receiver_username === 'admin')
                    || (msg.sender_username === 'admin' && msg.receiver_username === chatUser);

                if (relates) {
                    // Append the incoming message to the DOM to avoid full reloads
                    try {
                        console.debug('[chat-room] appending message', { msg, chatUser, adminMode });
                        appendMessage(msg);
                    } catch (e) {
                        console.error('[chat-room] appendMessage failed, falling back to loadMessages', e);
                        // Fallback: reload full list
                        loadMessages();
                    }
                } else {
                    console.debug('[chat-room] payload not related to this chat, ignoring', { msg, chatUser });
                }
            }
        )
        .subscribe((status) => {
            console.debug('[chat-room] subscription status', status);
        });

    // Append a single message bubble to the chat messages container
    function appendMessage(msg) {
        if (!msg || !msg.message) return;
        // ignore duplicate
        if (msg.id && appendedMessageIds.has(String(msg.id))) return;

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

        if (msg.id) appendedMessageIds.add(String(msg.id));
        // keep lastFetchedAt up-to-date
        lastFetchedAt = msg.created_at;
    }

    // Polling fallback: fetch messages newer than lastFetchedAt every few seconds

    async function pollNewMessages() {
        if (!chatUser) return;
        try {
            // If we don't have lastFetchedAt, fetch the latest message timestamp
            const filter = lastFetchedAt
                ? `and(or(and(sender_username.eq.${chatUser},receiver_username.eq.admin),and(sender_username.eq.admin,receiver_username.eq.${chatUser})),created_at.gt.${lastFetchedAt})`
                : `or(and(sender_username.eq.${chatUser},receiver_username.eq.admin),and(sender_username.eq.admin,receiver_username.eq.${chatUser}))`;

            const { data, error } = await supabaseClient
                .from('chat_messages')
                .select('*')
                .or(filter)
                .order('created_at', { ascending: true });

            if (error) throw error;
            if (data && data.length > 0) {
                data.forEach(m => appendMessage(m));
            }
        } catch (err) {
            console.error('[chat-room] polling error', err);
        }
    }

    // Poll conversation notification row for 'new' status and trigger message-area reload
    async function pollNotifications() {
        if (!chatUser) return;
        try {
            const { data, error } = await supabaseClient
                .from('chat_notifications')
                .select('status')
                .eq('chat_username', chatUser)
                .single();

            if (error) {
                // If row doesn't exist yet, ignore
                // console.debug('[chat-room] pollNotifications error', error);
                return;
            }

            if (data && data.status === 'new') {
                console.debug('[chat-room] pollNotifications found new -> reloading messages');
                await loadMessages();
                // loadMessages will clear the notification to 'no'
            }
        } catch (err) {
            console.error('[chat-room] pollNotifications error', err);
        }
    }

    // Start polling after initial load
    function startPolling() {
        if (pollTimer) return;
        pollTimer = setInterval(() => {
            pollNotifications();
            pollNewMessages();
        }, POLL_INTERVAL_MS);
    }

    function stopPolling() {
        if (pollTimer) {
            clearInterval(pollTimer);
            pollTimer = null;
        }
    }

    // Ensure we stop polling on unload
    window.addEventListener('beforeunload', () => {
        stopPolling();
    });
});
