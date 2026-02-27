document.addEventListener('DOMContentLoaded', () => {
    // Simple auth check
    if (sessionStorage.getItem('adminLoggedIn') !== 'true') {
        window.location.href = 'login.html';
        return;
    }

    const tableBody = document.getElementById('chatUsersBody');
    const btnAddUser = document.getElementById('btnAddUser');
    const addUserModal = document.getElementById('addUserModal');
    const btnCancelModal = document.getElementById('btnCancelModal');
    const addUserForm = document.getElementById('addUserForm');
    const profileMenu = document.getElementById('profileMenu');
    const profileDropdown = document.getElementById('profileDropdown');

    // Profile dropdown toggle
    if (profileMenu && profileDropdown) {
        profileMenu.addEventListener('click', (e) => {
            e.stopPropagation();
            profileDropdown.classList.toggle('open');
        });

        document.addEventListener('click', () => {
            profileDropdown.classList.remove('open');
        });

        profileDropdown.addEventListener('click', (e) => {
            e.stopPropagation();
            const action = e.target.getAttribute('data-action');
            if (action === 'change-password') {
                handleChangePassword();
            } else if (action === 'logout') {
                handleLogout();
            }
        });
    }

    function handleLogout() {
        sessionStorage.removeItem('adminLoggedIn');
        window.location.href = 'login.html';
    }

    async function handleChangePassword() {
        const newPass = prompt('Enter new admin password:');
        if (!newPass) return;
        try {
            const { error } = await supabaseClient
                .from('admins')
                .update({ password: newPass })
                .eq('doc_key', 'mainAdmin');
            if (error) throw error;
            alert('Password updated successfully.');
        } catch (err) {
            alert('Failed to update password. Please try again.');
        }
    }

    // Modal open/close
    btnAddUser.addEventListener('click', () => {
        addUserModal.classList.add('open');
    });

    btnCancelModal.addEventListener('click', () => {
        addUserModal.classList.remove('open');
        addUserForm.reset();
    });

    addUserModal.addEventListener('click', (e) => {
        if (e.target === addUserModal) {
            addUserModal.classList.remove('open');
            addUserForm.reset();
        }
    });

    // Add new chat user
    addUserForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const username = document.getElementById('chatUsername').value.trim();
        const password = document.getElementById('chatPassword').value.trim();

        if (!username || !password) return;

        const saveBtn = addUserForm.querySelector('.btn-save');
        saveBtn.textContent = 'Saving...';
        saveBtn.disabled = true;

        try {
            const { error } = await supabaseClient
                .from('chat_users')
                .insert([{
                    chat_username: username,
                    chat_password: password,
                    approval: 'pending'
                }]);

            if (error) throw error;

            addUserModal.classList.remove('open');
            addUserForm.reset();
            loadChatUsers();
        } catch (err) {
            alert('Failed to add user. Username may already exist.');
        } finally {
            saveBtn.textContent = 'Save';
            saveBtn.disabled = false;
        }
    });

    // Load chat users from Supabase
    async function loadChatUsers() {
        if (!tableBody) return;
        tableBody.innerHTML = '<tr><td colspan="5">Loading chat users...</td></tr>';

        try {
            const { data, error } = await supabaseClient
                .from('chat_users')
                .select('*')
                .order('created_at', { ascending: true });

            if (error) throw error;

            if (!data || data.length === 0) {
                tableBody.innerHTML = '<tr><td colspan="5">No chat users found.</td></tr>';
                return;
            }

            let index = 1;
            const rows = [];
            data.forEach((user) => {
                const badgeClass = user.approval === 'approved' ? 'badge-approved'
                    : user.approval === 'rejected' ? 'badge-rejected'
                        : 'badge-pending';

                rows.push(`
                    <tr data-id="${user.id}">
                        <td>${index++}</td>
                        <td>${(user.chat_username || '').replace(/</g, '&lt;')}</td>
                        <td>${(user.chat_password || '').replace(/</g, '&lt;')}</td>
                                <td>
                                    <span class="${badgeClass}">${user.approval}</span>
                                </td>
                                <td>
                                    ${user.approval === 'pending' ? `
                                        <button type="button" class="action-btn approve-btn" title="Approve">
                                            <i class="fas fa-check"></i>
                                        </button>
                                        <button type="button" class="action-btn reject-btn" title="Reject">
                                            <i class="fas fa-times"></i>
                                        </button>
                                    ` : `
                                        <button type="button" class="action-btn toggle-btn" title="Toggle status">
                                            <i class="fas fa-sync-alt"></i>
                                        </button>
                                    `}
                                    ${user.approval === 'approved' ? `
                                        <!-- Ready to chat button for admin -->
                                        <button type="button" class="action-btn start-chat-btn" title="Ready to chat">
                                            <i class="fas fa-comments"></i>
                                        </button>
                                    ` : ''}
                                    <button type="button" class="action-btn delete delete-btn" title="Delete">
                                        <i class="fas fa-trash"></i>
                                    </button>
                                </td>
                    </tr>
                `);
            });

            tableBody.innerHTML = rows.join('');
        } catch (err) {
            tableBody.innerHTML = '<tr><td colspan="5">Failed to load chat users. Please refresh.</td></tr>';
        }
    }

    loadChatUsers();

    // Handle table action clicks (approve, reject, toggle, delete)
    if (tableBody) {
        tableBody.addEventListener('click', async (e) => {
            const target = e.target;
            const row = target.closest('tr');
            if (!row) return;
            const id = row.getAttribute('data-id');
            if (!id) return;

            // Approve
            if (target.closest('.approve-btn')) {
                try {
                    const { error } = await supabaseClient
                        .from('chat_users')
                        .update({ approval: 'approved' })
                        .eq('id', parseInt(id));
                    if (error) throw error;
                    loadChatUsers();
                } catch (err) {
                    alert('Failed to approve. Try again.');
                }
                return;
            }

            // Reject
            if (target.closest('.reject-btn')) {
                try {
                    const { error } = await supabaseClient
                        .from('chat_users')
                        .update({ approval: 'rejected' })
                        .eq('id', parseInt(id));
                    if (error) throw error;
                    loadChatUsers();
                } catch (err) {
                    alert('Failed to reject. Try again.');
                }
                return;
            }

            // Toggle (approved ↔ pending)
            if (target.closest('.toggle-btn')) {
                const currentBadge = row.querySelector('[class^="badge-"]');
                const currentStatus = currentBadge ? currentBadge.textContent.trim() : 'pending';
                const newStatus = currentStatus === 'approved' ? 'pending' : 'approved';
                try {
                    const { error } = await supabaseClient
                        .from('chat_users')
                        .update({ approval: newStatus })
                        .eq('id', parseInt(id));
                    if (error) throw error;
                    loadChatUsers();
                } catch (err) {
                    alert('Failed to update status. Try again.');
                }
                return;
            }

            // Start chat as admin with this user
            if (target.closest('.start-chat-btn')) {
                // Get username from the row (2nd cell)
                const usernameCell = row.querySelector('td:nth-child(2)');
                const username = usernameCell ? usernameCell.textContent.trim() : null;
                if (!username) {
                    alert('Unable to determine username. Try again.');
                    return;
                }
                // Set session storage to open chat-room in admin mode
                sessionStorage.setItem('chatUser', username);
                sessionStorage.setItem('chatUserId', id);
                sessionStorage.setItem('adminChat', 'true');
                // Navigate to chat-room for admin
                window.location.href = 'chat-room.html';
                return;
            }

            // Delete
            if (target.closest('.delete-btn')) {
                const ok = confirm('Are you sure you want to delete this chat user?');
                if (!ok) return;
                try {
                    const { error } = await supabaseClient
                        .from('chat_users')
                        .delete()
                        .eq('id', parseInt(id));
                    if (error) throw error;
                    row.remove();
                    // Check if table is empty
                    if (tableBody.children.length === 0) {
                        tableBody.innerHTML = '<tr><td colspan="5">No chat users found.</td></tr>';
                    }
                } catch (err) {
                    alert('Failed to delete. Try again.');
                }
            }
        });
    }
});
