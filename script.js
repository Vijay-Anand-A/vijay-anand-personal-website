document.addEventListener('DOMContentLoaded', () => {
    // Navigation menu toggle for mobile
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');

    hamburger.addEventListener('click', () => {
        navLinks.classList.toggle('active');
        const icon = hamburger.querySelector('i');
        if(navLinks.classList.contains('active')) {
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
});
