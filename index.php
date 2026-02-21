<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Vijay Anand A | Lead PHP Software Engineer</title>
    <meta name="description" content="Portfolio of Vijay Anand A, Lead Software Engineer in PHP at SEA SENSE Softwares Pvt. Limited. Specializing in PHP, MySQL, and Web Solutions.">
    <link rel="stylesheet" href="style.css">
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;800&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
</head>
<body>
    <header>
        <nav>
            <div class="logo">Vijay Anand A.</div>
            <ul class="nav-links">
                <li><a href="#hero">Home</a></li>
                <li><a href="#about">About</a></li>
                <li><a href="#services">Services</a></li>
                <li><a href="#contact">Contact</a></li>
            </ul>
            <div class="hamburger">
                <i class="fas fa-bars"></i>
            </div>
        </nav>
    </header>

    <main>
        <section id="hero" class="hero">
            <div class="hero-content">
                <h2 class="subtitle">Hello, I'm</h2>
                <h1 class="title">Vijay Anand A</h1>
                <p class="role">Lead Software Engineer in PHP</p>
                <div class="hero-buttons">
                    <a href="#contact" class="btn btn-primary">Get in Touch</a>
                    <a href="#about" class="btn btn-secondary">Learn More</a>
                </div>
            </div>
            <div class="hero-background">
                <div class="glow-orb orb-1"></div>
                <div class="glow-orb orb-2"></div>
            </div>
        </section>

        <section id="about" class="about">
            <div class="container">
                <h2 class="section-title">About Me</h2>
                <div class="about-content">
                    <div class="about-text glass-card">
                        <p>I am a passionate and experienced <strong>Lead PHP Software Engineer</strong> focused on building robust, scalable, and beautifully crafted web applications.</p>
                        <p>Currently, I am working as a PHP Developer at <strong>SEA SENSE Softwares Pvt. Limited</strong>, an IT solution and research guidance firm based in Tamil Nadu. Our team specializes in software development, web design, and delivering innovative technology solutions.</p>
                        <div class="skills">
                            <span class="skill-tag">PHP</span>
                            <span class="skill-tag">MySQL</span>
                            <span class="skill-tag">JavaScript</span>
                            <span class="skill-tag">HTML5 / CSS3</span>
                            <span class="skill-tag">Web Development</span>
                            <span class="skill-tag">System Architecture</span>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <section id="services" class="services">
            <div class="container">
                <h2 class="section-title">What I Do</h2>
                <div class="services-grid">
                    <div class="service-card glass-card">
                        <i class="fas fa-code"></i>
                        <h3>PHP Development</h3>
                        <p>Custom backend development, REST API design, and performance optimization using modern PHP practices and frameworks.</p>
                    </div>
                    <div class="service-card glass-card">
                        <i class="fas fa-laptop-code"></i>
                        <h3>Web Solutions</h3>
                        <p>Full-stack web development ensuring seamless user experiences, responsive designs, and strong foundational architectures.</p>
                    </div>
                    <div class="service-card glass-card">
                        <i class="fas fa-server"></i>
                        <h3>System Architecture</h3>
                        <p>Designing and deploying scalable software systems tailored for dynamic business needs and long-term maintainability.</p>
                    </div>
                </div>
            </div>
        </section>

        <section id="contact" class="contact">
            <div class="container">
                <h2 class="section-title">Let's Connect</h2>
                <div class="contact-wrapper">
                    <div class="contact-info glass-card">
                        <h3>Contact Information</h3>
                        <p>Interested in collaborating or have a question? Feel free to reach out!</p>
                        <div class="info-item">
                            <i class="fas fa-briefcase"></i>
                            <span>SEA SENSE Softwares Pvt. Ltd.</span>
                        </div>
                        <div class="info-item">
                            <i class="fas fa-envelope"></i>
                            <span>vijayanand.a@example.com</span>
                        </div>
                        <div class="info-item">
                            <i class="fas fa-map-marker-alt"></i>
                            <span>Tamil Nadu, India</span>
                        </div>
                        <div class="social-links">
                            <a href="#" aria-label="LinkedIn"><i class="fab fa-linkedin"></i></a>
                            <a href="#" aria-label="GitHub"><i class="fab fa-github"></i></a>
                            <a href="#" aria-label="Twitter"><i class="fab fa-twitter"></i></a>
                        </div>
                    </div>
                    
                    <form class="contact-form glass-card" action="index.php#contact" method="POST">
                        <?php
                            if ($_SERVER["REQUEST_METHOD"] == "POST") {
                                $name = htmlspecialchars($_POST['name'] ?? '');
                                $email = htmlspecialchars($_POST['email'] ?? '');
                                $message = htmlspecialchars($_POST['message'] ?? '');
                                
                                // In a production app, integrate an actual mailing logic such as PHPMailer
                                // mail("vijayanand.a@example.com", "New Contact Form Submission from $name", $message);
                                
                                if (!empty($name) && !empty($email) && !empty($message)) {
                                    echo "<div class='success-msg'><i class='fas fa-check-circle'></i> Thank you, $name! Your message has been safely received.</div>";
                                }
                            }
                        ?>
                        <div class="form-group">
                            <label for="name">Name</label>
                            <input type="text" id="name" name="name" required placeholder="John Doe">
                        </div>
                        <div class="form-group">
                            <label for="email">Email</label>
                            <input type="email" id="email" name="email" required placeholder="john@example.com">
                        </div>
                        <div class="form-group">
                            <label for="message">Message</label>
                            <textarea id="message" name="message" rows="5" required placeholder="How can I help you?"></textarea>
                        </div>
                        <button type="submit" class="btn btn-primary submit-btn">Send Message <i class="fas fa-paper-plane" style="margin-left: 8px;"></i></button>
                    </form>
                </div>
            </div>
        </section>
    </main>

    <footer>
        <p>&copy; <?php echo date("Y"); ?> Vijay Anand A. All rights reserved.</p>
    </footer>

    <script src="script.js"></script>
</body>
</html>
