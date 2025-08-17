// DOM Content Loaded
document.addEventListener('DOMContentLoaded', function() {
    // Navigation functionality
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    const navLinks = document.querySelectorAll('.nav-link');

    // Mobile menu toggle
    hamburger.addEventListener('click', function() {
        navMenu.classList.toggle('active');
        hamburger.classList.toggle('active');
    });

    // Close mobile menu when clicking on a link
    navLinks.forEach(link => {
        link.addEventListener('click', function() {
            navMenu.classList.remove('active');
            hamburger.classList.remove('active');
        });
    });

    // Smooth scrolling for navigation links
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetSection = document.querySelector(targetId);
            
            if (targetSection) {
                const offsetTop = targetSection.offsetTop - 80;
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
            }
        });
    });

    // Active navigation highlighting
    window.addEventListener('scroll', function() {
        const sections = document.querySelectorAll('section');
        const scrollPos = window.scrollY + 100;

        sections.forEach(section => {
            const top = section.offsetTop;
            const bottom = top + section.offsetHeight;
            const id = section.getAttribute('id');

            if (scrollPos >= top && scrollPos <= bottom) {
                navLinks.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === `#${id}`) {
                        link.classList.add('active');
                    }
                });
            }
        });
    });

    // Skill bar animations
    function animateSkillBars() {
        const skillBars = document.querySelectorAll('.skill-progress');
        
        skillBars.forEach(bar => {
            const width = bar.getAttribute('data-width');
            bar.style.width = width + '%';
        });
    }

    // Intersection Observer for animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-on-scroll');
                
                // Animate skill bars when skills section comes into view
                if (entry.target.id === 'skills') {
                    setTimeout(animateSkillBars, 500);
                }
            }
        });
    }, observerOptions);

    // Observe all sections for scroll animations
    document.querySelectorAll('section').forEach(section => {
        observer.observe(section);
    });

    // Contact form validation and submission
    const contactForm = document.getElementById('contactForm');
    const nameInput = document.getElementById('name');
    const emailInput = document.getElementById('email');
    const messageInput = document.getElementById('message');

    // Validation functions
    function validateName(name) {
        return name.trim().length >= 2;
    }

    function validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    function validateMessage(message) {
        return message.trim().length >= 10;
    }

    function showError(input, errorElement, message) {
        input.style.borderColor = '#ef4444';
        errorElement.textContent = message;
        errorElement.style.display = 'block';
    }

    function clearError(input, errorElement) {
        input.style.borderColor = 'rgba(59, 130, 246, 0.2)';
        errorElement.textContent = '';
        errorElement.style.display = 'none';
    }

    // Real-time validation
    nameInput.addEventListener('blur', function() {
        const nameError = document.getElementById('nameError');
        if (!validateName(this.value)) {
            showError(this, nameError, 'Name must be at least 2 characters long');
        } else {
            clearError(this, nameError);
        }
    });

    emailInput.addEventListener('blur', function() {
        const emailError = document.getElementById('emailError');
        if (!validateEmail(this.value)) {
            showError(this, emailError, 'Please enter a valid email address');
        } else {
            clearError(this, emailError);
        }
    });

    messageInput.addEventListener('blur', function() {
        const messageError = document.getElementById('messageError');
        if (!validateMessage(this.value)) {
            showError(this, messageError, 'Message must be at least 10 characters long');
        } else {
            clearError(this, messageError);
        }
    });

    // Form submission
    contactForm.addEventListener('submit', function(e) {
        e.preventDefault();

        const name = nameInput.value;
        const email = emailInput.value;
        const message = messageInput.value;

        const nameError = document.getElementById('nameError');
        const emailError = document.getElementById('emailError');
        const messageError = document.getElementById('messageError');

        let isValid = true;

        // Validate all fields
        if (!validateName(name)) {
            showError(nameInput, nameError, 'Name must be at least 2 characters long');
            isValid = false;
        } else {
            clearError(nameInput, nameError);
        }

        if (!validateEmail(email)) {
            showError(emailInput, emailError, 'Please enter a valid email address');
            isValid = false;
        } else {
            clearError(emailInput, emailError);
        }

        if (!validateMessage(message)) {
            showError(messageInput, messageError, 'Message must be at least 10 characters long');
            isValid = false;
        } else {
            clearError(messageInput, messageError);
        }

        if (isValid) {
            // Simulate form submission
            const submitButton = contactForm.querySelector('button[type="submit"]');
            const originalText = submitButton.textContent;
            
            submitButton.textContent = 'Sending...';
            submitButton.disabled = true;

            setTimeout(() => {
                alert('Thank you for your message! I will get back to you soon.');
                contactForm.reset();
                submitButton.textContent = originalText;
                submitButton.disabled = false;
            }, 2000);
        }
    });

    // Dynamic typing effect for hero section
    function typeWriter(element, text, speed = 100) {
        let i = 0;
        element.textContent = '';
        
        function type() {
            if (i < text.length) {
                element.textContent += text.charAt(i);
                i++;
                setTimeout(type, speed);
            }
        }
        
        type();
    }

    // Initialize typing effect
    setTimeout(() => {
        const heroTagline = document.querySelector('.hero-tagline');
        const originalText = heroTagline.textContent;
        typeWriter(heroTagline, originalText, 50);
    }, 1000);

    // Parallax effect for hero section
    window.addEventListener('scroll', function() {
        const scrolled = window.pageYOffset;
        const hero = document.querySelector('.hero');
        const rate = scrolled * -0.5;
        
        if (hero) {
            hero.style.transform = `translateY(${rate}px)`;
        }
    });

    // Add floating animation to profile placeholder
    const profilePlaceholder = document.querySelector('.profile-placeholder');
    if (profilePlaceholder) {
        setInterval(() => {
            profilePlaceholder.style.transform = `translateY(${Math.sin(Date.now() * 0.003) * 10}px)`;
        }, 16);
    }

    // Random flying tools animation enhancement
    function createRandomTool() {
        const tools = ['fa-python', 'fa-js-square', 'fa-html5', 'fa-css3-alt', 'fa-react', 'fa-docker', 'fa-database', 'fa-chart-bar'];
        const tool = document.createElement('div');
        tool.className = 'tool';
        tool.innerHTML = `<i class="fab ${tools[Math.floor(Math.random() * tools.length)]}"></i>`;
        
        // Random starting position
        tool.style.left = '-100px';
        tool.style.top = Math.random() * window.innerHeight + 'px';
        tool.style.fontSize = (Math.random() * 2 + 1) + 'rem';
        tool.style.opacity = Math.random() * 0.3 + 0.1;
        tool.style.animationDuration = (Math.random() * 10 + 10) + 's';
        
        document.querySelector('.flying-tools').appendChild(tool);
        
        // Remove tool after animation
        setTimeout(() => {
            tool.remove();
        }, 20000);
    }

    // Create random tools periodically
    setInterval(createRandomTool, 3000);

    // Theme-based cursor effect
    document.addEventListener('mousemove', function(e) {
        const cursor = document.querySelector('.cursor-effect');
        if (!cursor) {
            const newCursor = document.createElement('div');
            newCursor.className = 'cursor-effect';
            newCursor.style.cssText = `
                position: fixed;
                width: 20px;
                height: 20px;
                background: radial-gradient(circle, rgba(59, 130, 246, 0.3), transparent);
                border-radius: 50%;
                pointer-events: none;
                z-index: 9999;
                transition: transform 0.1s ease;
            `;
            document.body.appendChild(newCursor);
        }
        
        const cursorEffect = document.querySelector('.cursor-effect');
        cursorEffect.style.left = e.clientX - 10 + 'px';
        cursorEffect.style.top = e.clientY - 10 + 'px';
    });
});
