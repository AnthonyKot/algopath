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

// Language System Module
const LanguageSystem = {
    currentLang: 'en',
    meta: null,
    availableLanguages: {
        'en': { name: 'English', flag: '🇬🇧' },
        'ua': { name: 'Українська', flag: '🇺🇦' }
    },

    init() {
        this.loadLanguage();
        this.bindToggleEvent();
    },

    loadLanguage() {
        this.currentLang = localStorage.getItem('language') || 'ua';
        document.documentElement.setAttribute('data-lang', this.currentLang);
    },

    async setLanguage(lang) {
        if (!this.availableLanguages[lang]) return;

        this.currentLang = lang;
        localStorage.setItem('language', lang);
        document.documentElement.setAttribute('data-lang', lang);

        // Reload meta for new language
        await this.loadMeta();

        // Update UI elements
        this.updateLanguageIcon();

        // Reload problems and update hero if on a category page
        const category = ProblemRenderer.detectCategory();
        if (category) {
            await ProblemRenderer.renderProblems(category);
            this.updateCategoryHero(category);
        }

        // Update homepage category cards if on homepage
        this.updateHomepageContent();

        // Reinject header with new language strings
        UI.injectHeader();
    },

    async loadMeta() {
        // Load meta from language-specific directory
        const metaFile = `data/${this.currentLang}/meta.json`;
        try {
            const response = await fetch(metaFile);
            if (response.ok) {
                this.meta = await response.json();
                return this.meta;
            }
        } catch (e) {
            console.warn(`Failed to load ${metaFile}, falling back to English`);
        }

        // Fallback to English if not already tried
        if (this.currentLang !== 'en') {
            try {
                const response = await fetch('data/en/meta.json');
                this.meta = await response.json();
                return this.meta;
            } catch (e) {
                console.error('Failed to load fallback meta.json');
                return null;
            }
        }
        return null;
    },

    // Get translated UI string with fallback
    t(path) {
        const keys = path.split('.');
        let value = this.meta?.ui;
        for (const key of keys) {
            value = value?.[key];
        }
        return value || path;
    },

    toggleLanguage() {
        const langs = Object.keys(this.availableLanguages);
        const currentIndex = langs.indexOf(this.currentLang);
        const nextIndex = (currentIndex + 1) % langs.length;
        this.setLanguage(langs[nextIndex]);
    },

    updateLanguageIcon() {
        const langToggle = document.getElementById('language-toggle');
        if (!langToggle) return;

        // Show the flag of the OTHER language (the one we will switch to)
        const otherLang = this.currentLang === 'en' ? 'ua' : 'en';
        const langInfo = this.availableLanguages[otherLang];
        langToggle.innerHTML = `<span class="lang-flag">${langInfo.flag}</span>`;
        // Title should say "Switch to [Language]"
        langToggle.title = `Switch to ${langInfo.name}`;
    },

    bindToggleEvent() {
        document.addEventListener('click', (e) => {
            if (e.target.closest('#language-toggle')) {
                e.preventDefault();
                this.toggleLanguage();
            }
        });
    },

    // Update category hero section with translated content
    updateCategoryHero(categoryId) {
        if (!categoryId || !this.meta?.categories?.[categoryId]) return;

        const categoryMeta = this.meta.categories[categoryId];
        const heroSection = document.querySelector(`#${categoryId}.category-hero`);
        if (!heroSection) return;

        // Update title
        const title = heroSection.querySelector('h1');
        if (title && categoryMeta.name) {
            title.textContent = categoryMeta.name;
        }

        // Update description
        const description = heroSection.querySelector('.hero-text');
        if (description && categoryMeta.description) {
            description.textContent = categoryMeta.description;
        }

        // Update section title (Key DP Problems, etc.)
        const sectionTitle = document.querySelector('.problems-section h2');
        if (sectionTitle && categoryMeta.sectionTitle) {
            sectionTitle.textContent = categoryMeta.sectionTitle;
        }

        // Update stats labels
        const statItems = heroSection.querySelectorAll('.stat-item');
        if (statItems.length >= 3) {
            // Problems count label
            const problemsLabel = statItems[0].querySelector('.stat-label');
            if (problemsLabel) {
                problemsLabel.textContent = this.t('labels.problems') || 'Problems';
            }

            // Interview Priority
            const priorityNumber = statItems[1].querySelector('.stat-number');
            const priorityLabel = statItems[1].querySelector('.stat-label');
            if (priorityNumber && categoryMeta.stats?.priority) {
                priorityNumber.textContent = categoryMeta.stats.priority;
                priorityNumber.style.color = categoryMeta.stats.priorityColor || '#e67e22';
            }
            if (priorityLabel) {
                const labelText = categoryMeta.stats?.priorityLabel || this.t('labels.interviewPriority') || 'Interview Priority';
                priorityLabel.textContent = labelText;
            }

            // CF Rating / Metric
            const metricNumber = statItems[2].querySelector('.stat-number');
            const metricLabel = statItems[2].querySelector('.stat-label');
            if (metricNumber && categoryMeta.stats?.metric) {
                metricNumber.textContent = categoryMeta.stats.metric;
            }
            if (metricLabel && categoryMeta.stats?.metricLabel) {
                metricLabel.textContent = categoryMeta.stats.metricLabel;
            }
        }

        // Update page title
        if (categoryMeta.seo?.title) {
            document.title = categoryMeta.seo.title;
        }
    },

    // Get translated problem title with fallback to original
    getProblemTitle(problemId, fallback) {
        return this.meta?.problemTitles?.[problemId] || fallback || problemId;
    },

    // Update homepage content (category cards, section titles)
    updateHomepageContent() {
        if (!this.meta?.categories) return;

        // --- Hero Section Update ---
        const heroData = this.meta.ui?.homepage?.hero;
        if (heroData) {
            // Title (with HTML for highlight)
            const heroTitle = document.querySelector('.hero h1');
            if (heroTitle && heroData.titleHtml) {
                heroTitle.innerHTML = heroData.titleHtml;
            }

            // Description
            const heroDesc = document.querySelector('.hero .hero-text');
            if (heroDesc && heroData.description) {
                heroDesc.textContent = heroData.description;
            }

            // CTA Button
            const startBtn = document.querySelector('.hero .btn-primary');
            if (startBtn && heroData.startBtn) {
                const icon = startBtn.querySelector('i');
                // Clear existing content to prevent duplication
                startBtn.innerHTML = '';
                if (icon) {
                    startBtn.appendChild(icon);
                    // Add a small space after icon if needed, though CSS usually handles padding
                    // pure text node avoids HTML parsing issues
                }
                startBtn.appendChild(document.createTextNode(heroData.startBtn));
            }

            // Stats Labels
            if (heroData.statLabels) {
                const statLabels = document.querySelectorAll('.hero .stat-label');
                if (statLabels.length >= 3) {
                    if (heroData.statLabels.problems) statLabels[0].textContent = heroData.statLabels.problems;
                    if (heroData.statLabels.categories) statLabels[1].textContent = heroData.statLabels.categories;
                    if (heroData.statLabels.metric) statLabels[2].textContent = heroData.statLabels.metric;
                }
            }
        }

        // --- Algorithm Categories Update ---
        // Update "Algorithm Categories" section title
        const sectionTitle = document.querySelector('#algorithms h2');
        if (sectionTitle) {
            sectionTitle.textContent = this.t('homepage.algorithmCategories') || 'Algorithm Categories';
        }

        // Update each category card
        document.querySelectorAll('.algorithm-card').forEach(card => {
            const categoryId = card.getAttribute('data-category');
            const categoryMeta = this.meta.categories[categoryId];
            if (!categoryMeta) return;

            // Update card title
            const title = card.querySelector('h3');
            if (title && categoryMeta.shortName) {
                title.textContent = categoryMeta.shortName;
            }

            // Update card description
            const desc = card.querySelector('p:not(.bridge-algo)');
            if (desc && categoryMeta.description) {
                desc.textContent = categoryMeta.description;
            }

            // Update priority label
            const priority = card.querySelector('.card-difficulty');
            if (priority && categoryMeta.stats?.priority) {
                priority.textContent = categoryMeta.stats.priority;
                if (categoryMeta.stats.priorityColor) {
                    priority.style.backgroundColor = categoryMeta.stats.priorityColor;
                    priority.style.color = '#fff'; // Ensure white text for contrast
                    priority.style.borderColor = categoryMeta.stats.priorityColor;
                }
            }

            // Update "View Problems" button
            const viewBtn = card.querySelector('.btn-outline');
            if (viewBtn) {
                viewBtn.textContent = this.t('homepage.viewProblems') || 'View Problems';
            }
        });

        // --- Wisdom Cards Update ---
        const wisdomData = this.meta.ui?.homepage?.wisdom;
        if (wisdomData) {
            // Update Section Title
            const sectionTitle = document.querySelector('#concepts h2');
            if (sectionTitle) {
                sectionTitle.textContent = wisdomData.title;
            }

            // Render Cards
            const grid = document.querySelector('.concepts-grid');
            if (grid) {
                grid.innerHTML = wisdomData.cards.map(card => `
                    <div class="concept-item wisdom-card">
                        <h3><i class="${card.icon}"></i>${card.title}</h3>
                        <blockquote class="wisdom-quote">"${card.quote}"</blockquote>
                        <div class="wisdom-footer">
                            <span class="wisdom-author">— ${card.author}</span>
                            <p class="wisdom-lesson"><strong>Lesson:</strong> ${card.lesson}</p>
                        </div>
                    </div>
                `).join('');
            }
        }

        // --- Resources Section Update ---
        const resourcesTitle = document.querySelector('#resources h2');
        if (resourcesTitle) {
            resourcesTitle.textContent = this.t('homepage.additionalResources') || 'Additional Resources';
        }

        const resourcesList = document.querySelector('.resource-list');
        const resourcesData = this.meta.ui?.homepage?.resourcesList;
        if (resourcesList && resourcesData) {
            resourcesList.innerHTML = resourcesData.map(res =>
                `<li><a href="${res.url}">${res.name}</a> - ${res.description}</li>`
            ).join('');
        }
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
            prismLink.href = 'vendor/prism/prism-tomorrow.min.css';
            document.head.appendChild(prismLink);
        }

        if (!document.getElementById('prism-js')) {
            const prismScript = document.createElement('script');
            prismScript.id = 'prism-js';
            prismScript.src = 'vendor/prism/prism.min.js';
            prismScript.onload = () => {
                setTimeout(() => ProblemRenderer.applySyntaxHighlighting(), 100);
            };
            document.head.appendChild(prismScript);
        }

        // Get translated strings
        const t = (key) => LanguageSystem.t(`nav.${key}`);
        // Show flag of the OTHER language
        const otherLang = LanguageSystem.currentLang === 'en' ? 'ua' : 'en';
        const langInfo = LanguageSystem.availableLanguages[otherLang];

        headerMount.innerHTML = `
            <nav id="main-nav">
                <div class="container nav-container">
                    <div class="nav-brand">
                        <h2><i class="fas fa-code"></i>AlgoPath</h2>
                    </div>
                    <div class="nav-links">
                        <a href="${isHomePage ? '#home' : 'index.html#home'}"><i class="fas fa-home"></i>${t('home')}</a>
                        <a href="${isHomePage ? '#algorithms' : 'index.html#algorithms'}"><i class="fas fa-cubes"></i>${t('problems')}</a>
                        <a href="${isHomePage ? '#concepts' : 'index.html#concepts'}"><i class="fas fa-lightbulb"></i>${t('concepts')}</a>
                        <a href="${isHomePage ? '#resources' : 'index.html#resources'}"><i class="fas fa-book"></i>${t('resources')}</a>
                        
                        <div class="nav-search">
                            <input type="text" class="search-input" placeholder="${t('search')}" aria-label="Search problems">
                            <i class="fas fa-search search-icon"></i>
                            <div class="search-results"></div>
                        </div>

                        ${!isHomePage ? `<button class="print-btn" onclick="window.print()"><i class="fas fa-print"></i>${t('print')}</button>` : ''}
                        <button id="language-toggle" class="language-toggle" aria-label="Toggle language" title="${langInfo?.name || 'Language'}">
                            <span class="lang-flag">${langInfo?.flag || '🌐'}</span>
                        </button>
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
        document.addEventListener('click', function (e) {
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

// Annotation Tooltip Module for code hover explanations
const AnnotationTooltip = {
    tooltip: null,

    init() {
        this.createTooltipElement();
        this.bindEvents();
    },

    createTooltipElement() {
        this.tooltip = document.createElement('div');
        this.tooltip.className = 'code-tooltip';
        this.tooltip.style.display = 'none';
        document.body.appendChild(this.tooltip);
    },

    bindEvents() {
        // Use event delegation on the document for dynamically rendered content
        document.addEventListener('mouseenter', (e) => {
            if (e.target && e.target.classList && e.target.classList.contains('annotated-line')) {
                this.showTooltip(e.target);
            }
        }, true);

        document.addEventListener('mouseleave', (e) => {
            if (e.target && e.target.classList && e.target.classList.contains('annotated-line')) {
                this.hideTooltip(e.target);
            }
        }, true);
    },

    showTooltip(element) {
        const annotation = element.getAttribute('data-annotation');
        const blockId = element.getAttribute('data-block');

        if (!annotation) return;

        // Highlight all lines in the same block
        document.querySelectorAll(`.annotated-line[data-block="${blockId}"]`).forEach(el => {
            el.classList.add('annotation-hover');
        });

        // Show tooltip
        this.tooltip.textContent = annotation;
        this.tooltip.style.display = 'block';

        // Position tooltip near the element
        const rect = element.getBoundingClientRect();
        this.tooltip.style.left = `${rect.left + 20}px`;
        this.tooltip.style.top = `${rect.bottom + window.scrollY + 8}px`;
    },

    hideTooltip(element) {
        const blockId = element.getAttribute('data-block');

        // Remove highlight from all lines in the block
        document.querySelectorAll(`.annotated-line[data-block="${blockId}"]`).forEach(el => {
            el.classList.remove('annotation-hover');
        });

        this.tooltip.style.display = 'none';
    }
};

// Search System Module
const SearchSystem = {
    index: [],

    async init() {
        const data = await ProblemRenderer.loadProblems();
        if (data) {
            this.buildIndex(data);
            this.bindEvents();
        }
    },

    buildIndex(data) {
        this.index = [];
        Object.keys(data).forEach(category => {
            data[category].forEach(problem => {
                this.index.push({
                    id: problem.id,
                    title: LanguageSystem.getProblemTitle(problem.id, problem.title),
                    category: category,
                    difficulty: problem.difficulty
                });
            });
        });
    },

    bindEvents() {
        // Wait for header injection
        setTimeout(() => {
            const input = document.querySelector('.search-input');
            const resultsContainer = document.querySelector('.search-results');
            if (!input || !resultsContainer) return;

            input.addEventListener('input', (e) => this.handleInput(e.target.value));
            input.addEventListener('focus', () => {
                if (input.value.trim().length > 0) this.handleInput(input.value);
            });

            document.addEventListener('click', (e) => {
                if (!e.target.closest('.nav-search')) {
                    this.hideResults();
                }
            });
        }, 100);
    },

    handleInput(query) {
        if (!query || query.trim() === '') {
            this.hideResults();
            return;
        }

        const normalizedQuery = query.toLowerCase();
        const results = this.index.filter(p =>
            p.title.toLowerCase().includes(normalizedQuery) ||
            p.id.toLowerCase().includes(normalizedQuery)
        ).slice(0, 8);

        this.showResults(results, normalizedQuery);
    },

    showResults(results, query) {
        const container = document.querySelector('.search-results');
        if (!container) return;

        if (results.length === 0) {
            container.innerHTML = '<div class="search-no-results">No problems found</div>';
        } else {
            container.innerHTML = results.map(p => `
                <a href="${p.category}.html#${p.id}" class="search-result-item" onclick="SearchSystem.hideResults()">
                    <div class="search-result-info">
                        <span class="search-result-title">${this.highlightMatch(p.title, query)}</span>
                        <span class="search-result-category">${p.category}</span>
                    </div>
                    <span class="card-difficulty difficulty-${p.difficulty.toLowerCase()}">${p.difficulty}</span>
                </a>
            `).join('');
        }
        container.classList.add('active');
    },

    highlightMatch(text, query) {
        if (!query) return text;
        // Escape special regex characters in query
        const safeQuery = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        return text.replace(new RegExp(`(${safeQuery})`, 'gi'), '<span class="search-match">$1</span>');
    },

    hideResults() {
        const container = document.querySelector('.search-results');
        if (container) container.classList.remove('active');
    }
};

// Quiz System Module for progressive reveal
const QuizSystem = {
    checkAnswer(problemId, quizIndex, correctAnswer) {
        const quizGate = document.querySelector(`.quiz-gate[data-problem-id="${problemId}"][data-quiz-index="${quizIndex}"]`);
        const selectedOption = document.querySelector(`input[name="quiz-${problemId}-${quizIndex}"]:checked`);
        const feedback = quizGate.querySelector('.quiz-feedback');

        if (!selectedOption) {
            feedback.textContent = 'Please select an answer!';
            feedback.className = 'quiz-feedback error';
            return;
        }

        const selectedValue = parseInt(selectedOption.value);

        if (selectedValue === correctAnswer) {
            // Correct answer - unlock the section
            feedback.textContent = `✅ ${LanguageSystem.t('quiz.correct') || 'Correct!'}`;
            feedback.className = 'quiz-feedback success';
            quizGate.classList.add('answered');

            // Reveal the corresponding section
            const section = document.querySelector(`.gated-section[data-problem-id="${problemId}"][data-section-index="${quizIndex}"]`);
            if (section) {
                section.classList.remove('locked');
                section.classList.add('revealed');
            }

            // Show next quiz if exists
            const nextQuiz = document.querySelector(`.quiz-gate[data-problem-id="${problemId}"][data-quiz-index="${quizIndex + 1}"]`);
            if (nextQuiz) {
                nextQuiz.classList.add('active');
            }

            // Re-apply syntax highlighting for revealed code
            setTimeout(() => {
                if (typeof Prism !== 'undefined') {
                    Prism.highlightAll();
                }
                ProblemRenderer.applyAnnotations();
            }, 100);
        } else {
            // Wrong answer
            feedback.textContent = '❌ Try again!';
            feedback.className = 'quiz-feedback error';
        }
    }
};

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', async function () {
    // Initialize language system first and load meta
    LanguageSystem.init();
    await LanguageSystem.loadMeta();

    UI.init();
    ThemeSystem.init();
    ProblemRenderer.init();
    AnnotationTooltip.init();
    SearchSystem.init();

    // Apply translations to category hero on initial load
    const category = ProblemRenderer.detectCategory();
    if (category) {
        LanguageSystem.updateCategoryHero(category);
    }

    // Apply translations to homepage category cards on initial load
    LanguageSystem.updateHomepageContent();
});

// Problem Renderer Module
const ProblemRenderer = {
    // Current code language for multi-language support (future)
    currentCodeLanguage: 'javascript',

    async loadProblems() {
        try {
            // Use meta from LanguageSystem (which handles language selection)
            const meta = LanguageSystem.meta;
            if (meta && meta.categories) {
                const categories = Object.keys(meta.categories);

                // Load all problems from individual files
                const data = {};
                for (const categoryId of categories) {
                    data[categoryId] = await this.loadCategoryProblems(categoryId);
                }

                // Store meta reference
                this.meta = meta;
                return data;
            }
        } catch (e) {
            console.error('Error loading problems:', e);
            return null;
        }
    },

    async loadCategoryProblems(categoryId) {
        const problems = [];
        const currentLang = LanguageSystem.currentLang;

        // Get problem IDs from manifest if available (use LanguageSystem.meta for language support)
        const categoryMeta = LanguageSystem.meta?.categories?.[categoryId];
        const problemIds = categoryMeta?.problemIds || [];

        if (problemIds.length > 0) {
            // Use manifest for efficient loading
            for (const problemId of problemIds) {
                try {
                    let problem = null;

                    // Try language-specific file first
                    const langPath = `data/${currentLang}/problems/${categoryId}/${problemId}.json`;
                    try {
                        const langResponse = await fetch(langPath);
                        if (langResponse.ok) {
                            problem = await langResponse.json();
                        }
                    } catch (e) {
                        // Ignore error and try fallback
                    }

                    // Fallback to English if not found and we aren't already trying English
                    if (!problem && currentLang !== 'en') {
                        const enPath = `data/en/problems/${categoryId}/${problemId}.json`;
                        const enResponse = await fetch(enPath);
                        if (enResponse.ok) {
                            problem = await enResponse.json();
                            // Optional: Mark as fallback content UI-wise?
                        }
                    }

                    if (problem) {
                        problems.push(this.normalizeProblem(problem));
                    }
                } catch (e) {
                    console.error(`Failed to load problem ${problemId}:`, e);
                }
            }
        } else {
            // Fallback to iterating directory not possible in client-side JS without a manifest logic
            // But existing code relies on problemIds from meta.json, so this block is fine.
            // Fallback: try loading by common ID patterns (up to 20 per category)
            for (let i = 1; i <= 20; i++) {
                try {
                    const response = await fetch(`data/problems/${categoryId}/${categoryId}-${i}.json`);
                    if (response.ok) {
                        const problem = await response.json();
                        problems.push(this.normalizeProblem(problem));
                    }
                } catch (e) {
                    // Problem doesn't exist, continue
                }
            }
        }

        return problems;
    },

    // Normalize new problem structure to be compatible with existing rendering
    normalizeProblem(problem) {
        // If already in old format, return as-is
        if (problem.problem_statement && !problem.content) {
            return problem;
        }

        // Extract from new nested structure
        const content = problem.content || {};
        const codeData = problem.code?.[this.currentCodeLanguage] || {};

        return {
            ...problem,
            // Flatten content for backward compatibility
            problem_statement: content.problem_statement || problem.problem_statement,
            explanation: content.explanation || problem.explanation,
            quizzes: content.quizzes || problem.quizzes || [],
            // Flatten code for backward compatibility
            code: codeData.solution || problem.code,
            annotations: codeData.annotations || problem.annotations || []
        };
    },

    // Renders the new, detailed walkthrough format with quiz-gated progressive reveal
    renderDetailedProblemCard(problem) {
        const difficultyClass = this.getDifficultyClass(problem.difficulty);
        const tagsHtml = problem.tags.join(', ');
        const explanation = problem.explanation;
        const quizzes = problem.quizzes || [];

        // Helper to format markdown-style explanation text to HTML
        const formatMarkdown = (text) => {
            if (!text) return '';

            // 1. Extract fenced code blocks and replace with placeholders
            const codeBlocks = [];
            let processedText = text.replace(/```(\w*)\n([\s\S]*?)```/g, (match, lang, code) => {
                codeBlocks.push({ lang, code });
                return `__CODE_BLOCK_${codeBlocks.length - 1}__`;
            });

            // 2. Process inline styles
            const processInline = (s) => s
                .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
                .replace(/`([^`]+)`/g, '<code>$1</code>');

            const lines = processedText.split('\n');
            const result = [];
            let inList = false;

            for (const line of lines) {
                // Check if line is a code block placeholder
                const codeBlockMatch = line.match(/__CODE_BLOCK_(\d+)__/);
                if (codeBlockMatch) {
                    if (inList) {
                        result.push('</ul>');
                        inList = false;
                    }
                    const index = parseInt(codeBlockMatch[1]);
                    const { lang, code } = codeBlocks[index];
                    // Clean up whitespace but preserve structure
                    result.push(`<pre><code class="language-${lang || 'text'}">${code.trim()}</code></pre>`);
                    continue;
                }

                // Match bullet/numbered lists: "- item", "* item", "1. item", "a. item"
                const listMatch = line.match(/^\s*([-*]|\d+\.|[a-z]\.)\s+(.+)$/);

                if (listMatch) {
                    if (!inList) {
                        result.push('<ul>');
                        inList = true;
                    }
                    result.push(`<li>${processInline(listMatch[2])}</li>`);
                } else {
                    if (inList) {
                        result.push('</ul>');
                        inList = false;
                    }
                    if (line.trim() === '') {
                        // Only add break if previous line wasn't a code block (for cleaner spacing)
                        const lastElement = result[result.length - 1];
                        if (lastElement && !lastElement.startsWith('<pre>')) {
                            result.push('<br>');
                        }
                    } else {
                        const processed = processInline(line);
                        // Add callout-box class for paragraphs starting with bold text
                        if (processed.startsWith('<strong>')) {
                            result.push(`<p class="callout-box">${processed}</p>`);
                        } else {
                            result.push(`<p>${processed}</p>`);
                        }
                    }
                }
            }

            if (inList) result.push('</ul>');
            return result.join('');
        };

        // Helper to render Senior Follow-up
        const renderFollowUp = (followUp) => {
            if (!followUp) return '';
            const senCorner = LanguageSystem.t('problem.seniorCorner') || "Senior Engineer's Corner";
            const intTip = LanguageSystem.t('problem.interviewTip') || "Interview Tip";

            const guideTooltip = followUp.answering_guide
                ? `<div class="tip-badge">
                     <i class="fas fa-lightbulb"></i> ${intTip}
                     <div class="tooltip-content">
                        ${followUp.answering_guide}
                     </div>
                   </div>`
                : '';

            return `
                <div class="senior-section collapsed" onclick="this.classList.toggle('collapsed')">
                    <div class="senior-header">
                        <div class="senior-title">
                            <i class="fas fa-level-up-alt"></i>
                            <h4>${senCorner}</h4>
                        </div>
                        <div class="header-right-group">
                            ${guideTooltip}
                            <span class="collapse-chevron">▼</span>
                        </div>
                    </div>
                    <div class="senior-content">
                        ${followUp.scenario ? `<p><strong>Scenario:</strong> ${followUp.scenario}</p>` : ''}
                        ${followUp.trade_off ? `<p><strong>Trade-off:</strong> ${followUp.trade_off}</p>` : ''}
                        ${followUp.strategy ? `<p><strong>Strategy:</strong> ${followUp.strategy}</p>` : ''}
                    </div>
                </div>
            `;
        };

        // Helper to render a quiz
        const renderQuiz = (quiz, index, problemId) => {
            if (!quiz) return '';
            const checkBtn = LanguageSystem.t('problem.checkAnswer') || 'Check Answer';
            return `
                <div class="quiz-gate" data-quiz-index="${index}" data-problem-id="${problemId}">
                    <div class="quiz-question">🤔 ${quiz.question}</div>
                    <div class="quiz-options">
                        ${quiz.options.map((opt, i) => `
                            <label class="quiz-option">
                                <input type="radio" name="quiz-${problemId}-${index}" value="${i}">
                                <span class="quiz-option-text">${opt}</span>
                            </label>
                        `).join('')}
                    </div>
                    <button class="quiz-check-btn" onclick="QuizSystem.checkAnswer('${problemId}', ${index}, ${quiz.correct})">
                        ${checkBtn}
                    </button>
                    <div class="quiz-feedback"></div>
                </div>
            `;
        };

        // Build sections with quiz gates
        const sections = [
            {
                id: 'naive',
                title: `2. ${LanguageSystem.t('problem.naiveTitle') || 'The Naive Approach & Its Bottleneck'}`,
                content: `<div>${formatMarkdown(explanation.brute_force)}</div>
                          <p><strong>${LanguageSystem.t('problem.bottleneckTitle') || 'The Bottleneck'}:</strong> ${formatMarkdown(explanation.bottleneck)}</p>`
            },
            {
                id: 'insight',
                title: `3. ${LanguageSystem.t('problem.insightTitle') || 'The Key Insight'}`,
                content: `<div>${formatMarkdown(explanation.optimized_approach)}</div>`
            },
            {
                id: 'algorithm',
                title: `4. ${LanguageSystem.t('problem.optimizedTitle') || 'The Optimized Algorithm'}`,
                content: `<div>${formatMarkdown(explanation.algorithm_steps)}</div>`
            }
        ];

        // Add Result Analysis section if it exists (for physics problems)
        if (explanation.result_analysis) {
            sections.push({
                id: 'result_analysis',
                title: `${sections.length + 2}. Result Analysis & Applications`,
                content: `<div class="result-analysis">${formatMarkdown(explanation.result_analysis)}</div>`
            });
        }


        // Only add code section if problem.code exists
        if (problem.code) {
            sections.push({
                id: 'code',
                title: `${sections.length + 2}. ${LanguageSystem.t('problem.codeTitle') || 'Code Implementation'}`,
                content: `<div class="code-snippet">
                            <pre><code class="language-javascript" data-annotations="${this.escapeHtml(JSON.stringify(problem.annotations || []))}">${this.escapeHtml(problem.code)}</code></pre>
                          </div>`
            });
        }

        // Only add complexity section if problem.complexity exists
        if (problem.complexity) {
            sections.push({
                id: 'complexity',
                title: `${sections.length + 2}. ${LanguageSystem.t('problem.complexityTitle') || 'Complexity Analysis'}`,
                content: `<p><strong>${LanguageSystem.t('problem.timeComplexity') || 'Time Complexity'}:</strong> <code class="language-text">${problem.complexity.time}</code></p>
                         <div>${formatMarkdown(problem.complexity.explanation_time)}</div>
                         <br>
                         <p><strong>${LanguageSystem.t('problem.spaceComplexity') || 'Space Complexity'}:</strong> <code class="language-text">${problem.complexity.space}</code></p>
                         <div>${formatMarkdown(problem.complexity.explanation_space)}</div>`
            });
        }


        // Render sections with quiz gates (if quizzes exist)
        const hasQuizzes = quizzes.length > 0;
        const renderSections = () => {
            return sections.map((section, idx) => {
                const quiz = quizzes[idx];
                const isLocked = hasQuizzes;
                return `
                    ${quiz ? renderQuiz(quiz, idx, problem.id) : ''}
                    <div class="explanation-section gated-section ${isLocked ? 'locked' : ''}" 
                         data-section-index="${idx}" data-problem-id="${problem.id}">
                        <h4>${section.title}</h4>
                        ${section.content}
                    </div>
                `;
            }).join('');
        };

        return `
            <div id="${problem.id}" class="problem-card detailed-walkthrough collapsed" data-has-quizzes="${hasQuizzes}">
                <div class="card-header" onclick="this.parentElement.classList.toggle('collapsed')">
                    <h3>
                        ${problem.tags.includes('bridges') ? '<i class="fas fa-archway" style="color:var(--accent-primary); margin-right:8px; font-size:0.9em;" title="Graph Bridge Problem"></i>' : ''}
                        ${LanguageSystem.getProblemTitle(problem.id, problem.title)}
                    </h3>
                    <div class="header-right">
                        <div class="card-difficulty ${difficultyClass}">${problem.difficulty}</div>
                        <span class="collapse-chevron">▼</span>
                    </div>
                </div>
                <div class="card-body">
                    <div class="cf-meta">
                        <span class="cf-tags">${tagsHtml}</span>
                    </div>

                    <!-- Problem Statement - Always Visible -->
                    <div class="problem-definition">
                        <h4><i class="fas fa-file-alt"></i> ${LanguageSystem.t('problem.problemStatement') || 'Problem Statement'}</h4>
                        <div>${formatMarkdown(problem.problem_statement)}</div>
                    </div>

                    ${problem.diagram ? `
                    <div class="diagram-section" style="margin: 1.5rem 0; text-align: center;">
                        <h4 style="margin-bottom: 1rem; color: var(--text-primary);"><i class="fas fa-project-diagram"></i> ${LanguageSystem.t('problem.visualization') || 'Visualization'}</h4>
                        <div class="mermaid">
                            ${problem.diagram}
                        </div>
                    </div>
                    ` : ''}

                    ${problem.custom_visual ? `
                    <div class="diagram-section" style="margin: 1.5rem 0; text-align: center;">
                        <h4 style="margin-bottom: 1rem; color: var(--text-primary);"><i class="fas fa-th"></i> ${LanguageSystem.t('problem.visualization') || 'Visualization'}</h4>
                        <div class="custom-visual-container">
                            ${problem.custom_visual}
                        </div>
                    </div>
                    ` : ''}

                    <div class="explanation-section">
                        <h4>${LanguageSystem.t('problem.understanding') || '1. Understanding the Problem'}</h4>
                        <div>${formatMarkdown(problem.explanation.understanding_the_problem)}</div>
                    </div>

                    <!-- Quiz-Gated Sections -->
                    ${renderSections()}

                    <!-- Senior Follow-up -->
                    ${renderFollowUp(problem.follow_up)}





                    ${problem.leetcode_url ? `
                    <div class="practice-actions">
                        <a href="${problem.leetcode_url}" target="_blank" rel="noopener noreferrer" class="btn-leetcode">
                            <i class="fas fa-code"></i> ${LanguageSystem.t('problem.solveOnLeetcode') || 'Solve on LeetCode'}
                        </a>
                    </div>
                    ` : ''}

                    ${problem.related ? `
                    <div class="related-section">
                        <div class="related-header"><i class="fas fa-random"></i> ${LanguageSystem.t('problem.practiceNext') || 'Practice Next'}</div>
                        <div class="related-chips">
                            ${problem.related.map(r => `
                                <a href="${r.category}.html#${r.id}" class="related-chip">
                                    <i class="fas fa-link"></i> ${r.title}
                                </a>
                            `).join('')}
                        </div>
                    </div>
                    ` : ''}
                </div>
            </div>
        `;
    },

    // Renders the old, simple card format
    renderSimpleProblemCard(problem) {
        const difficultyClass = this.getDifficultyClass(problem.difficulty);
        const tags = problem.tags || [];
        const tagsHtml = tags.join(', ');

        return `
            <div class="problem-card">
                <div class="card-header">
                    <h3>${LanguageSystem.getProblemTitle(problem.id, problem.title)}</h3>
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
        return text.replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    },

    // Render code with annotation spans for lines that have annotations
    renderAnnotatedCode(code, annotations) {
        if (!code) return '';
        if (!annotations || annotations.length === 0) {
            return this.escapeHtml(code);
        }

        // Build a map of line -> annotation text
        const lineAnnotations = new Map();
        for (const ann of annotations) {
            const lines = ann.lines || [];
            const text = ann.text || '';
            for (const line of lines) {
                lineAnnotations.set(line, { text, blockLines: lines });
            }
        }

        // Split code into lines and wrap annotated ones
        const lines = code.split('\n');
        const result = lines.map((line, idx) => {
            const lineNum = idx + 1;
            const escapedLine = this.escapeHtml(line);

            if (lineAnnotations.has(lineNum)) {
                const ann = lineAnnotations.get(lineNum);
                const blockId = ann.blockLines.join('-');
                return `<span class="annotated-line" data-annotation="${this.escapeHtml(ann.text)}" data-block="${blockId}">${escapedLine}</span>`;
            }
            return escapedLine;
        });

        return result.join('\n');
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

        this.handleDeepLink();
        setTimeout(() => this.applySyntaxHighlighting(), 50);

        // Initialize Mermaid diagrams if present
        // Initialize Mermaid diagrams if present
        const initMermaid = async () => {
            try {
                if (!document.querySelector('.mermaid')) return;

                if (!window.mermaid) {
                    // Load Mermaid via script tag (ES module import doesn't work offline)
                    await new Promise((resolve, reject) => {
                        const script = document.createElement('script');
                        script.src = 'vendor/mermaid/mermaid.min.js';
                        script.onload = resolve;
                        script.onerror = reject;
                        document.head.appendChild(script);
                    });
                    window.mermaid.initialize({ startOnLoad: false, theme: 'default' });
                }

                await window.mermaid.run({
                    nodes: document.querySelectorAll('.mermaid')
                });
            } catch (e) {
                console.warn('Mermaid rendering failed:', e);
            }
        };

        // Start initialization
        initMermaid();

        // Dispatch event for any page-specific post-processing (e.g., KaTeX rendering)
        document.dispatchEvent(new Event('problemsLoaded'));
    },

    applySyntaxHighlighting() {
        if (typeof Prism !== 'undefined') {
            Prism.highlightAll();
        }
        this.applyAnnotations();
    },

    applyAnnotations() {
        document.querySelectorAll('code[data-annotations]').forEach(codeEl => {
            const annotationsAttr = codeEl.getAttribute('data-annotations');
            if (!annotationsAttr || annotationsAttr === '[]') return;

            try {
                // Decode HTML entities before parsing JSON
                const decoded = annotationsAttr.replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');
                const annotations = JSON.parse(decoded);
                if (!annotations || annotations.length === 0) return;

                // Build map of line number -> annotation info
                const lineAnnotations = new Map();
                for (const ann of annotations) {
                    const lines = ann.lines || [];
                    const text = ann.text || '';
                    for (const line of lines) {
                        lineAnnotations.set(line, { text, blockLines: lines });
                    }
                }

                // Wrap annotated lines with spans
                let html = codeEl.innerHTML;
                let lines = html.split('\n');
                let result = lines.map((line, idx) => {
                    const lineNum = idx + 1;
                    if (lineAnnotations.has(lineNum)) {
                        const ann = lineAnnotations.get(lineNum);
                        const blockId = ann.blockLines.join('-');
                        const escapedText = ann.text.replace(/"/g, '&quot;');
                        return `<span class="annotated-line" data-annotation="${escapedText}" data-block="${blockId}">${line}</span>`;
                    }
                    return line;
                });
                codeEl.innerHTML = result.join('\n');
            } catch (e) {
                console.error('Error applying annotations:', e);
            }
        });
    },

    handleDeepLink() {
        const hash = window.location.hash;
        if (!hash) return;
        const id = hash.substring(1);
        const card = document.getElementById(id);
        if (card && card.classList.contains('problem-card')) {
            card.classList.remove('collapsed');
            setTimeout(() => {
                card.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }, 100);
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
            'optimization.html': 'optimization',
            'physics.html': 'physics'
        };
        return categoryMap[filename] || null;
    },

    init() {
        const category = this.detectCategory();
        if (category) this.renderProblems(category);
        window.addEventListener('hashchange', () => this.handleDeepLink());
    }
};
