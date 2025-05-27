// Performance optimized script with error handling
(function() {
    'use strict';
    
    // Utility functions
    const debounce = (func, wait) => {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    };

    const throttle = (func, limit) => {
        let inThrottle;
        return function() {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    };

    // Error handling wrapper
    const safeExecute = (fn, context = 'Unknown') => {
        try {
            return fn();
        } catch (error) {
            console.error(`Error in ${context}:`, error);
            return null;
        }
    };

    // Loading state management
    const showLoading = () => {
        document.body.classList.add('loading');
    };

    const hideLoading = () => {
        document.body.classList.remove('loading');
        document.body.classList.add('loaded');
    };

    // Initialize loading state
    showLoading();

    // Mobile Navigation Toggle
    document.addEventListener('DOMContentLoaded', function() {
        // Hide loading state once DOM is ready
        setTimeout(hideLoading, 100);
        
        const hamburger = document.getElementById('hamburger');
        const navMenu = document.getElementById('nav-menu');
        const navbar = document.querySelector('.navbar');
        
        if (hamburger && navMenu) {
            hamburger.addEventListener('click', function() {
                safeExecute(() => {
                    hamburger.classList.toggle('active');
                    navMenu.classList.toggle('active');
                    
                    // Add body scroll lock when menu is open
                    if (navMenu.classList.contains('active')) {
                        document.body.style.overflow = 'hidden';
                    } else {
                        document.body.style.overflow = '';
                    }
                }, 'Mobile navigation toggle');
            });
            
            // Close menu when clicking on a link
            const navLinks = document.querySelectorAll('.nav-link');
            navLinks.forEach(link => {
                link.addEventListener('click', () => {
                    safeExecute(() => {
                        hamburger.classList.remove('active');
                        navMenu.classList.remove('active');
                        document.body.style.overflow = '';
                    }, 'Navigation link click');
                });
            });
            
            // Close menu when clicking outside
            document.addEventListener('click', (e) => {
                safeExecute(() => {
                    if (!hamburger.contains(e.target) && !navMenu.contains(e.target)) {
                        hamburger.classList.remove('active');
                        navMenu.classList.remove('active');
                        document.body.style.overflow = '';
                    }
                }, 'Outside click handler');
            });
        }
        
        // Enhanced Navbar scroll effect with throttling
        let lastScrollTop = 0;
        const handleScroll = throttle(function() {
            safeExecute(() => {
                const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
                
                if (scrollTop > 100) {
                    navbar?.classList.add('scrolled');
                } else {
                    navbar?.classList.remove('scrolled');
                }

                // Auto-hide navbar on scroll down (mobile)
                if (window.innerWidth <= 768 && navbar) {
                    if (scrollTop > lastScrollTop && scrollTop > 100) {
                        navbar.style.transform = 'translateY(-100%)';
                    } else {
                        navbar.style.transform = 'translateY(0)';
                    }
                }
                
                // Back to top button
                const backToTopBtn = document.querySelector('.back-to-top');
                if (backToTopBtn) {
                    if (scrollTop > 300) {
                        backToTopBtn.classList.add('visible');
                    } else {
                        backToTopBtn.classList.remove('visible');
                    }
                }
                
                lastScrollTop = scrollTop;
            }, 'Scroll handler');
        }, 16); // ~60fps

        window.addEventListener('scroll', handleScroll, { passive: true });
        
        // Back to top button click
        const backToTopBtn = document.querySelector('.back-to-top');
        if (backToTopBtn) {
            backToTopBtn.addEventListener('click', function() {
                safeExecute(() => {
                    window.scrollTo({
                        top: 0,
                        behavior: 'smooth'
                    });
                }, 'Back to top click');
            });
        }
        
        // YouTube Carousel functionality
        const carouselTrack = document.getElementById('carousel-track');
        const prevBtn = document.getElementById('prev-btn');
        const nextBtn = document.getElementById('next-btn');
        
        if (carouselTrack && prevBtn && nextBtn) {
            let currentIndex = 0;
            const shorts = document.querySelectorAll('.youtube-short');
            const totalShorts = shorts.length;
            
            // Calculate how many shorts to show based on screen size
            function getShortsToShow() {
                if (window.innerWidth <= 480) return 1;
                if (window.innerWidth <= 768) return 2;
                if (window.innerWidth <= 1024) return 3;
                return 4;
            }
            
            function updateCarousel() {
                const shortsToShow = getShortsToShow();
                const shortWidth = shorts[0].offsetWidth;
                const gap = 20;
                const translateX = currentIndex * (shortWidth + gap);
                
                carouselTrack.style.transform = `translateX(-${translateX}px)`;
                
                // Update button states
                prevBtn.style.opacity = currentIndex === 0 ? '0.5' : '1';
                nextBtn.style.opacity = currentIndex >= totalShorts - shortsToShow ? '0.5' : '1';
            }

            // Button functionality
            nextBtn.addEventListener('click', function() {
                const shortsToShow = getShortsToShow();
                if (currentIndex < totalShorts - shortsToShow) {
                    currentIndex++;
                    updateCarousel();
                }
            });

            prevBtn.addEventListener('click', function() {
                if (currentIndex > 0) {
                    currentIndex--;
                    updateCarousel();
                }
            });

            // Touch/Swipe support for mobile
            let startX = 0;
            let currentX = 0;
            let isDragging = false;

            carouselTrack.addEventListener('touchstart', (e) => {
                startX = e.touches[0].clientX;
                isDragging = true;
                carouselTrack.style.transition = 'none';
            });

            carouselTrack.addEventListener('touchmove', (e) => {
                if (!isDragging) return;
                e.preventDefault();
                currentX = e.touches[0].clientX;
                const diffX = startX - currentX;
                const currentTransform = currentIndex * (shorts[0].offsetWidth + 20);
                carouselTrack.style.transform = `translateX(-${currentTransform + diffX}px)`;
            });

            carouselTrack.addEventListener('touchend', () => {
                if (!isDragging) return;
                isDragging = false;
                carouselTrack.style.transition = 'transform 0.5s ease';
                
                const diffX = startX - currentX;
                const threshold = 50;
                
                if (diffX > threshold && currentIndex < totalShorts - getShortsToShow()) {
                    currentIndex++;
                } else if (diffX < -threshold && currentIndex > 0) {
                    currentIndex--;
                }
                
                updateCarousel();
            });

            // Auto-resize handling
            window.addEventListener('resize', () => {
                const shortsToShow = getShortsToShow();
                if (currentIndex >= totalShorts - shortsToShow) {
                    currentIndex = Math.max(0, totalShorts - shortsToShow);
                }
                updateCarousel();
            });

            // Initialize carousel
            updateCarousel();
        }
        
        // Basic Form Handling
        const forms = document.querySelectorAll('form');
        forms.forEach(form => {
            form.addEventListener('submit', function(e) {
                e.preventDefault();
                alert('Thank you for your message! We will get back to you soon.');
            });
        });

        // Smooth scrolling for anchor links
        const anchorLinks = document.querySelectorAll('a[href^="#"]');
        anchorLinks.forEach(link => {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                const targetId = this.getAttribute('href');
                const targetElement = document.querySelector(targetId);
                
                if (targetElement) {
                    const offsetTop = targetElement.offsetTop - 80;
                    window.scrollTo({
                        top: offsetTop,
                        behavior: 'smooth'
                    });
                }
            });
        });

        console.log('Sadhu Baba Foundation website loaded successfully!');
    });
})(); 