// Smooth scrolling for navigation
document.addEventListener('DOMContentLoaded', function() {
    const navLinks = document.querySelectorAll('nav a, .btn-primary');

    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            const href = this.getAttribute('href');

            if (href.startsWith('#')) {
                e.preventDefault();
                const targetId = href.substring(1);
                const targetElement = document.getElementById(targetId);

                if (targetElement) {
                    targetElement.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            }
        });
    });

    // Add scroll animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate');
            }
        });
    }, observerOptions);

    // Observe algorithm cards
    document.querySelectorAll('.algorithm-card').forEach(card => {
        observer.observe(card);
    });
});

// Add loading states for algorithm pages
function loadAlgorithmPage(page) {
    // This would typically load content dynamically
    // For now, just smooth scroll to algorithm section
    const algorithmsSection = document.getElementById('algorithms');
    if (algorithmsSection) {
        algorithmsSection.scrollIntoView({ behavior: 'smooth' });
    }
}