document.addEventListener('DOMContentLoaded', () => {
    // Navigation menu toggle for mobile
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');

    hamburger.addEventListener('click', () => {
        navLinks.classList.toggle('active');
        const icon = hamburger.querySelector('i');
        if (navLinks.classList.contains('active')) {
            icon.classList.remove('fa-bars');
            icon.classList.add('fa-times');
        } else {
            icon.classList.remove('fa-times');
            icon.classList.add('fa-bars');
        }
    });

    // Smooth scrolling for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            navLinks.classList.remove('active');

            // reset hamburger icon
            const icon = hamburger.querySelector('i');
            icon.classList.remove('fa-times');
            icon.classList.add('fa-bars');

            const targetId = this.getAttribute('href');
            if (targetId === '#') return;

            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // Reveal elements on scroll via Intersection Observer
    const revealElements = document.querySelectorAll('.glass-card, .section-title');

    const revealCallback = (entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = 1;
                entry.target.style.transform = 'translateY(0)';
                observer.unobserve(entry.target);
            }
        });
    };

    const revealOptions = {
        threshold: 0.1,
        rootMargin: "0px 0px -50px 0px"
    };

    const revealObserver = new IntersectionObserver(revealCallback, revealOptions);

    revealElements.forEach(el => {
        el.style.opacity = 0;
        el.style.transform = 'translateY(40px)';
        el.style.transition = 'opacity 0.8s ease-out, transform 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
        revealObserver.observe(el);
    });

    //------------------------------- Contact form submit handler - Supabase
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', async function (e) {
            e.preventDefault();
            const btn = this.querySelector('.submit-btn');
            const originalText = btn.textContent;
            btn.textContent = 'Sending...';
            btn.disabled = true;

            const name = this.name.value.trim();
            const mobile = this.mobile.value.trim();
            const email = this.email.value.trim();
            const message = this.message.value.trim();

            try {
                console.log('Supabase client:', supabaseClient);
                const { data, error } = await supabaseClient
                    .from('contact_submissions')
                    .insert([{
                        name: name,
                        mobile: mobile,
                        email: email,
                        message: message,
                        is_read: false
                    }]);

                console.log('Insert result:', { data, error });
                if (error) throw error;

                btn.textContent = 'Message Sent!';
                btn.style.background = 'linear-gradient(135deg, #10b981, #059669)';
                contactForm.reset();
            } catch (err) {
                console.error('Contact form error:', err);
                btn.textContent = 'Error. Try again';
                btn.style.background = 'linear-gradient(135deg, #ef4444, #dc2626)';
            } finally {
                setTimeout(() => {
                    btn.textContent = originalText;
                    btn.disabled = false;
                    btn.style.background = '';
                }, 3000);
            }
        });
    }

    // Dynamic Header background on scroll
    const header = document.querySelector('header');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.style.background = 'rgba(15, 23, 42, 0.95)';
            header.style.boxShadow = '0 4px 20px rgba(0,0,0,0.3)';
        } else {
            header.style.background = 'rgba(15, 23, 42, 0.85)';
            header.style.boxShadow = 'none';
        }
    });

    // --------------------------------- Chat Login Modal
    const chatMenuLink = document.getElementById('chatMenuLink');
    const chatLoginModal = document.getElementById('chatLoginModal');
    const chatCancelBtn = document.getElementById('chatCancelBtn');
    const chatLoginForm = document.getElementById('chatLoginForm');
    const chatStatus = document.getElementById('chatStatus');

    if (chatMenuLink && chatLoginModal) {
        // Open modal when Chat menu clicked
        chatMenuLink.addEventListener('click', (e) => {
            e.preventDefault();
            navLinks.classList.remove('active');
            const icon = hamburger.querySelector('i');
            icon.classList.remove('fa-times');
            icon.classList.add('fa-bars');
            chatLoginModal.classList.add('open');
            chatStatus.textContent = '';
        });

        // Cancel button
        chatCancelBtn.addEventListener('click', () => {
            chatLoginModal.classList.remove('open');
            chatLoginForm.reset();
            chatStatus.textContent = '';
        });

        // Click outside modal to close
        chatLoginModal.addEventListener('click', (e) => {
            if (e.target === chatLoginModal) {
                chatLoginModal.classList.remove('open');
                chatLoginForm.reset();
                chatStatus.textContent = '';
            }
        });

        // Chat login form submit
        chatLoginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const username = document.getElementById('chatUser').value.trim();
            const password = document.getElementById('chatPass').value;
            const loginBtn = chatLoginForm.querySelector('.chat-btn-login');

            loginBtn.textContent = 'Checking...';
            loginBtn.disabled = true;
            chatStatus.textContent = '';

            try {
                const { data, error } = await supabaseClient
                    .from('chat_users')
                    .select('*')
                    .eq('chat_username', username)
                    .eq('chat_password', password)
                    .single();

                if (error || !data) {
                    chatStatus.textContent = 'Invalid username or password.';
                    chatStatus.style.color = '#f87171';
                } else if (data.approval !== 'approved') {
                    chatStatus.textContent = "Can't able to chat. Your account is not approved yet.";
                    chatStatus.style.color = '#fbbf24';
                } else {
                    chatStatus.textContent = 'Login successful! Redirecting...';
                    chatStatus.style.color = '#34d399';
                    // Save chat user info in session
                    sessionStorage.setItem('chatUser', data.chat_username);
                    sessionStorage.setItem('chatUserId', data.id);
                    setTimeout(() => {
                        window.location.href = 'chat-room.html';
                    }, 500);
                }
            } catch (err) {
                chatStatus.textContent = 'Error connecting to server. Try again.';
                chatStatus.style.color = '#f87171';
            } finally {
                loginBtn.textContent = 'Login';
                loginBtn.disabled = false;
            }
        });
    }
});
