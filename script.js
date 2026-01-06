// Theme System Module
const ThemeSystem = {
    init() {
        this.loadTheme();
        this.bindToggleEvent();
    },

    loadTheme() {
        const savedTheme = localStorage.getItem('theme') || 'light';
        this.setTheme(savedTheme);
    },

    setTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
        this.updateThemeIcon(theme);
    },

    toggleTheme() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        this.setTheme(newTheme);
    },

    updateThemeIcon(theme) {
        const themeToggle = document.getElementById('theme-toggle');
        if (!themeToggle) return;

        const icon = themeToggle.querySelector('i');
        if (icon) {
            icon.className = theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
        }
    },

    bindToggleEvent() {
        document.addEventListener('click', (e) => {
            if (e.target.closest('#theme-toggle')) {
                e.preventDefault();
                this.toggleTheme();
            }
        });
    }
};

// UI Module for shared components
const UI = {
    injectHeader() {
        const headerMount = document.getElementById('header-mount');
        if (!headerMount) return;

        const isHomePage = window.location.pathname === '/' || window.location.pathname.endsWith('index.html') || window.location.pathname === '';

        // Add Prism.js if not present
        if (!document.getElementById('prism-theme')) {
            const prismLink = document.createElement('link');
            prismLink.id = 'prism-theme';
            prismLink.rel = 'stylesheet';
            prismLink.href = 'https://cdnjs.cloudflare.com/ajax/libs/prism/1.24.1/themes/prism-tomorrow.min.css';
            document.head.appendChild(prismLink);
        }

        if (!document.getElementById('prism-js')) {
            const prismScript = document.createElement('script');
            prismScript.id = 'prism-js';
            prismScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/prism/1.24.1/prism.min.js';
            prismScript.onload = () => ProblemRenderer.applySyntaxHighlighting();
            document.head.appendChild(prismScript);
        }

        headerMount.innerHTML = `
            <nav id="main-nav">
                <div class="container nav-container">
                    <div class="nav-brand">
                        <h2><i class="fas fa-code"></i>FAANG Algorithms</h2>
                    </div>
                    <div class="nav-links">
                        <a href="${isHomePage ? '#home' : 'index.html#home'}"><i class="fas fa-home"></i>Home</a>
                        <a href="${isHomePage ? '#algorithms' : 'index.html#algorithms'}"><i class="fas fa-cubes"></i>Problems</a>
                        <a href="${isHomePage ? '#concepts' : 'index.html#concepts'}"><i class="fas fa-lightbulb"></i>Concepts</a>
                        <a href="${isHomePage ? '#resources' : 'index.html#resources'}"><i class="fas fa-book"></i>Resources</a>
                        <button id="theme-toggle" class="theme-toggle" aria-label="Toggle theme">
                            <i class="fas fa-moon"></i>
                        </button>
                    </div>
                </div>
            </nav>
        `;
    },

    injectFooter() {
        const footerMount = document.getElementById('footer-mount');
        if (!footerMount) return;

        footerMount.innerHTML = `
            <footer>
                <div class="container">
                    <p>&copy; ${new Date().getFullYear()} L4/L5 FAANG Algorithms Guide</p>
                </div>
            </footer>
        `;
    },

    init() {
        this.injectHeader();
        this.injectFooter();
        this.initSmoothScrolling();
        this.initScrollAnimations();
    },

    initSmoothScrolling() {
        document.addEventListener('click', function(e) {
            const link = e.target.closest('a, .btn-primary');
            if (!link) return;

            const href = link.getAttribute('href');
            if (href && href.startsWith('#')) {
                const targetId = href.substring(1);
                const targetElement = document.getElementById(targetId);

                if (targetElement) {
                    e.preventDefault();
                    targetElement.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            }
        });
    },

    initScrollAnimations() {
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

        document.querySelectorAll('.algorithm-card, .problem-card').forEach(card => {
            observer.observe(card);
        });
    }
};

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    UI.init();
    ThemeSystem.init();
    ProblemRenderer.init();
});

// Problem Renderer Module
const ProblemRenderer = {
    async loadProblems() {
        try {
            const response = await fetch('data/problems.json');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error('Failed to load problems:', error);
            return null;
        }
    },

    // Renders the new, detailed walkthrough format
    renderDetailedProblemCard(problem) {
        const difficultyClass = this.getDifficultyClass(problem.difficulty);
        const tagsHtml = problem.tags.join(', ');
        const explanation = problem.explanation;

        // Helper to format explanation text
        const format = (text) => text.replace(/\n/g, '<br>');

        return `
            <div class="problem-card detailed-walkthrough">
                <div class="card-header">
                    <h3>${problem.title}</h3>
                    <div class="card-difficulty ${difficultyClass}">${problem.difficulty}</div>
                </div>
                <div class="cf-meta">
                    <span class="cf-tags">${tagsHtml}</span>
                </div>

                <div class="explanation-section">
                    <h4>1. Understanding the Problem</h4>
                    <p>${problem.explanation.understanding_the_problem.replace(/\n/g, '<br>')}</p>
                </div>

                <div class="explanation-section">
                    <h4>2. The Naive Approach & Its Bottleneck</h4>
                    <p>${explanation.brute_force.replace(/\n/g, '<br>')}</p>
                    <p><strong>The Bottleneck:</strong> ${explanation.bottleneck.replace(/\n/g, '<br>')}</p>
                </div>

                <div class="explanation-section">
                    <h4>3. The Key Insight: Reversing the Flow</h4>
                    <p>${explanation.optimized_approach.replace(/\n/g, '<br>')}</p>
                </div>
                
                <div class="explanation-section">
                    <h4>4. The Optimized Algorithm</h4>
                    <p>${explanation.algorithm_steps.replace(/\n/g, '<br>')}</p>
                </div>

                <div class="explanation-section">
                    <h4>5. Code Implementation</h4>
                    <div class="code-snippet">
                        <pre><code class="language-javascript">${this.escapeHtml(problem.code)}</code></pre>
                    </div>
                </div>

                <div class="explanation-section">
                    <h4>6. Complexity Analysis</h4>
                    <p><strong>Time Complexity:</strong> <code class="language-text">${problem.complexity.time}</code></p>
                    <p>${problem.complexity.explanation_time.replace(/\n/g, '<br>')}</p>
                    <br>
                    <p><strong>Space Complexity:</strong> <code class="language-text">${problem.complexity.space}</code></p>
                    <p>${problem.complexity.explanation_space.replace(/\n/g, '<br>')}</p>
                </div>
            </div>
        `;
    },

    // Renders the old, simple card format
    renderSimpleProblemCard(problem) {
        const difficultyClass = this.getDifficultyClass(problem.difficulty);
        const tagsHtml = problem.tags.join(', ');

        return `
            <div class="problem-card">
                <div class="card-header">
                    <h3>${problem.title}</h3>
                    <div class="card-difficulty ${difficultyClass}">${problem.difficulty}</div>
                </div>
                <div class="cf-meta">
                    <span class="cf-tags">${tagsHtml}</span>
                </div>
                <p><strong>Problem:</strong> ${problem.description}</p>
                <p><strong>Complexity:</strong> <code class="language-text">Time: ${problem.complexity.time} | Space: ${problem.complexity.space}</code></p>
                <div class="code-snippet">
                    <pre><code class="language-javascript">${this.escapeHtml(problem.code)}</code></pre>
                </div>
                <div class="insights">
                    <strong>Key Insight:</strong> ${problem.insight}
                </div>
            </div>
        `;
    },

    getDifficultyClass(difficulty) {
        switch (difficulty.toLowerCase()) {
            case 'easy': return 'difficulty-easy';
            case 'medium': return 'difficulty-medium';
            case 'hard': return 'difficulty-hard';
            default: return 'difficulty-medium';
        }
    },

    escapeHtml(text) {
        if (typeof text !== 'string') return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    },

    async renderProblems(categoryId) {
        const problemsMount = document.getElementById('problems-mount');
        if (!problemsMount) return;

        problemsMount.innerHTML = '<div class="loading">Loading problems...</div>';

        const problemsData = await this.loadProblems();
        if (!problemsData || !problemsData[categoryId]) {
            problemsMount.innerHTML = '<div class="error">Failed to load problems.</div>';
            return;
        }

        const problemsHtml = problemsData[categoryId].map(p => {
            // If the new 'explanation' field exists, use the detailed renderer
            if (p.explanation) {
                return this.renderDetailedProblemCard(p);
            }
            // Otherwise, use the old simple renderer
            return this.renderSimpleProblemCard(p);
        }).join('');
        
        // Using 'problem-container' for detailed view, and 'problems-grid' for grid view.
        // This logic can be improved later. For now, let's see if we have any detailed cards.
        const hasDetailedCard = problemsData[categoryId].some(p => p.explanation);
        const containerClass = hasDetailedCard ? 'problem-container' : 'problems-grid';

        problemsMount.innerHTML = `<div class="${containerClass}">${problemsHtml}</div>`;

        this.applySyntaxHighlighting();
    },

    applySyntaxHighlighting() {
        if (typeof Prism !== 'undefined') {
            Prism.highlightAll();
        }
    },

    detectCategory() {
        const path = window.location.pathname;
        let filename = path.split('/').pop();
        if (!filename || filename === '') filename = 'index.html';

        const categoryMap = {
            'dp.html': 'dp',
            'graphs.html': 'graphs',
            'trees.html': 'trees',
            'strings.html': 'strings',
            'math.html': 'math',
            'geometry.html': 'geometry',
            'design.html': 'design',
            'optimization.html': 'optimization'
        };
        return categoryMap[filename] || null;
    },

    init() {
        const category = this.detectCategory();
        if (category) this.renderProblems(category);
    }
};
