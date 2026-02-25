document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('adminLoginForm');
    if (!form) return;

    const db = firebase.firestore();
    const adminDocRef = db.collection('admins').doc('mainAdmin');

    // Ensure admin credentials exist in Firestore (username: admin, password: 9489318959@123!)
  /*  const now = new Date();

    // get 12-hour format hour + AM/PM
    let manikoor = now.getHours();
    const ravileorvaikuneram = manikoor >= 12 ? 'PM' : 'AM';
    manikoor = manikoor % 12;
    if (manikoor === 0) manikoor = 12; // 0 -> 12
    
    const password = `9489318959@123!${manikoor}${ravileorvaikuneram}`;
    
    adminDocRef.set({
        username: 'admin',
        password: password
    });*/

    const statusEl = document.createElement('div');
    statusEl.style.marginTop = '1rem';
    statusEl.style.fontSize = '0.95rem';
    form.appendChild(statusEl);

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const btn = form.querySelector('.submit-btn');
        const originalText = btn.textContent;
        btn.textContent = 'Checking...';
        btn.disabled = true;
        statusEl.textContent = '';

        const username = form.username.value.trim();
        const password = form.password.value;

        try {
            const snap = await adminDocRef.get();
            if (!snap.exists) {
                statusEl.textContent = 'Admin user not configured in database.';
                statusEl.style.color = '#f87171';
            } else {
                const data = snap.data();
                if (username === data.username && password === data.password) {
                    statusEl.textContent = 'Login successful.';
                    statusEl.style.color = '#34d399';
                    // Mark session and go to dashboard
                    sessionStorage.setItem('adminLoggedIn', 'true');
                    setTimeout(() => {
                        window.location.href = 'dashboard.html';
                    }, 500);
                } else {
                    statusEl.textContent = 'Invalid username or password.';
                    statusEl.style.color = '#f87171';
                }
            }
        } catch (err) {
            statusEl.textContent = 'Error connecting to database. Please try again.';
            statusEl.style.color = '#f87171';
        } finally {
            btn.textContent = originalText;
            btn.disabled = false;
        }
    });
});

