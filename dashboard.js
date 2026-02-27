document.addEventListener('DOMContentLoaded', () => {
    // Simple auth check
    if (sessionStorage.getItem('adminLoggedIn') !== 'true') {
        window.location.href = 'login.html';
        return;
    }

    const profileMenu = document.getElementById('profileMenu');
    const profileDropdown = document.getElementById('profileDropdown');
    const tableBody = document.getElementById('enquiryTableBody');

    // Dropdown toggle
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

    // Load enquiries from Supabase
    async function loadEnquiries() {
        if (!tableBody) return;
        tableBody.innerHTML = `
            <tr>
                <td colspan="8">Loading enquiries...</td>
            </tr>
        `;

        try {
            const { data, error } = await supabaseClient
                .from('contact_submissions')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;

            if (!data || data.length === 0) {
                tableBody.innerHTML = `
                    <tr>
                        <td colspan="8">No enquiries found.</td>
                    </tr>
                `;
                return;
            }

            let index = 1;
            const rows = [];
            data.forEach((d) => {
                const created = d.created_at
                    ? new Date(d.created_at)
                    : null;
                const createdStr = created
                    ? created.toLocaleString()
                    : '-';
                const isRead = !!d.is_read;

                rows.push(`
                    <tr data-id="${d.id}" data-read="${isRead ? '1' : '0'}">
                        <td>${index++}</td>
                        <td>${(d.name || '').replace(/</g, '&lt;')}</td>
                        <td>${(d.mobile || '').replace(/</g, '&lt;')}</td>
                        <td>${(d.email || '').replace(/</g, '&lt;')}</td>
                        <td>${(d.message || '').replace(/</g, '&lt;')}</td>
                        <td>${createdStr}</td>
                        <td class="read-cell">
                            <button type="button" class="icon-btn read-toggle" title="Mark as read/unread">
                                ${isRead ? '<i class="fas fa-check-circle read-icon"></i>' : '<span class="new-badge">NEW</span>'}
                            </button>
                        </td>
                        <td class="actions-cell">
                            <button type="button" class="icon-btn delete-enquiry" title="Delete enquiry">
                                <i class="fas fa-trash"></i>
                            </button>
                        </td>
                    </tr>
                `);
            });

            tableBody.innerHTML = rows.join('');
        } catch (err) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="8">Failed to load enquiries. Please refresh.</td>
                </tr>
            `;
        }
    }

    loadEnquiries();

    // Handle read/unread toggle and delete using event delegation
    if (tableBody) {
        tableBody.addEventListener('click', async (e) => {
            const target = e.target;
            const row = target.closest('tr');
            if (!row) return;
            const id = row.getAttribute('data-id');
            if (!id) return;

            if (target.closest('.delete-enquiry')) {
                const ok = confirm('Are you sure you want to delete this enquiry?');
                if (!ok) return;
                try {
                    const { error } = await supabaseClient
                        .from('contact_submissions')
                        .delete()
                        .eq('id', parseInt(id));

                    if (error) throw error;
                    row.remove();
                } catch (err) {
                    alert('Failed to delete. Please try again.');
                }
                return;
            }

            if (target.closest('.read-toggle')) {
                const current = row.getAttribute('data-read') === '1';
                const next = !current;
                try {
                    const { error } = await supabaseClient
                        .from('contact_submissions')
                        .update({ is_read: next })
                        .eq('id', parseInt(id));

                    if (error) throw error;
                    row.setAttribute('data-read', next ? '1' : '0');
                    const btn = row.querySelector('.read-toggle');
                    if (btn) {
                        btn.innerHTML = next
                            ? '<i class="fas fa-check-circle read-icon"></i>'
                            : '<span class="new-badge">NEW</span>';
                    }
                } catch (err) {
                    alert('Failed to update read status. Please try again.');
                }
            }
        });
    }
});
