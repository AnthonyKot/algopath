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
            prismScript.onload = () => {
                setTimeout(() => ProblemRenderer.applySyntaxHighlighting(), 100);
            };
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
                        
                        <div class="nav-search">
                            <input type="text" class="search-input" placeholder="Search..." aria-label="Search problems">
                            <i class="fas fa-search search-icon"></i>
                            <div class="search-results"></div>
                        </div>

                        ${!isHomePage ? '<button class="print-btn" onclick="window.print()"><i class="fas fa-print"></i>Print</button>' : ''}
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
                    title: problem.title,
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

        this.showResults(results);
    },

    showResults(results) {
        const container = document.querySelector('.search-results');
        if (!container) return;

        if (results.length === 0) {
            container.innerHTML = '<div class="search-no-results">No problems found</div>';
        } else {
            container.innerHTML = results.map(p => `
                <a href="${p.category}.html#${p.id}" class="search-result-item">
                    <div class="search-result-info">
                        <span class="search-result-title">${p.title}</span>
                        <span class="search-result-category">${p.category}</span>
                    </div>
                    <span class="card-difficulty difficulty-${p.difficulty.toLowerCase()}">${p.difficulty}</span>
                </a>
            `).join('');
        }
        container.classList.add('active');
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
            feedback.textContent = '✅ Correct!';
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
document.addEventListener('DOMContentLoaded', function () {
    UI.init();
    ThemeSystem.init();
    ProblemRenderer.init();
    AnnotationTooltip.init();
    SearchSystem.init();
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

    // Renders the new, detailed walkthrough format with quiz-gated progressive reveal
    renderDetailedProblemCard(problem) {
        const difficultyClass = this.getDifficultyClass(problem.difficulty);
        const tagsHtml = problem.tags.join(', ');
        const explanation = problem.explanation;
        const quizzes = problem.quizzes || [];

        // Helper to format markdown-style explanation text to HTML
        const formatMarkdown = (text) => {
            if (!text) return '';

            // Process inline styles first
            const processInline = (s) => s
                .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
                .replace(/`([^`]+)`/g, '<code>$1</code>');

            const lines = text.split('\n');
            const result = [];
            let inList = false;

            for (const line of lines) {
                // Match bullet/numbered lists: "- item", "* item", "1. item", "a. item"
                // Allow leading whitespace for indented items
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
                        result.push('<br>');
                    } else {
                        // Add callout-box class for paragraphs starting with bold text
                        const processed = processInline(line);
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
            const guideTooltip = followUp.answering_guide
                ? `<div class="tip-badge">
                     <i class="fas fa-lightbulb"></i> Interview Tip
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
                            <h4>Senior Engineer's Corner</h4>
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
                        Check Answer
                    </button>
                    <div class="quiz-feedback"></div>
                </div>
            `;
        };

        // Build sections with quiz gates
        const sections = [
            {
                id: 'naive',
                title: '2. The Naive Approach & Its Bottleneck',
                content: `<div>${formatMarkdown(explanation.brute_force)}</div>
                         <p><strong>The Bottleneck:</strong> ${formatMarkdown(explanation.bottleneck)}</p>`
            },
            {
                id: 'insight',
                title: '3. The Key Insight',
                content: `<div>${formatMarkdown(explanation.optimized_approach)}</div>`
            },
            {
                id: 'algorithm',
                title: '4. The Optimized Algorithm',
                content: `<div>${formatMarkdown(explanation.algorithm_steps)}</div>`
            },
            {
                id: 'code',
                title: '5. Code Implementation',
                content: `<div class="code-snippet">
                            <pre><code class="language-javascript" data-annotations="${this.escapeHtml(JSON.stringify(problem.annotations || []))}">${this.escapeHtml(problem.code)}</code></pre>
                         </div>`
            },
            {
                id: 'complexity',
                title: '6. Complexity Analysis',
                content: `<p><strong>Time Complexity:</strong> <code class="language-text">${problem.complexity.time}</code></p>
                         <div>${formatMarkdown(problem.complexity.explanation_time)}</div>
                         <br>
                         <p><strong>Space Complexity:</strong> <code class="language-text">${problem.complexity.space}</code></p>
                         <div>${formatMarkdown(problem.complexity.explanation_space)}</div>`
            }
        ];

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
                    <h3>${problem.title}</h3>
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
                    <div class="explanation-section">
                        <h4>1. Understanding the Problem</h4>
                        <div>${formatMarkdown(problem.explanation.understanding_the_problem)}</div>
                    </div>

                    <!-- Quiz-Gated Sections -->
                    ${renderSections()}

                    <!-- Senior Follow-up -->
                    ${renderFollowUp(problem.follow_up)}





                    ${problem.leetcode_url ? `
                    <div class="practice-actions">
                        <a href="${problem.leetcode_url}" target="_blank" rel="noopener noreferrer" class="btn-leetcode">
                            <i class="fas fa-code"></i> Solve on LeetCode
                        </a>
                    </div>
                    ` : ''}

                    ${problem.related ? `
                    <div class="related-section">
                        <div class="related-header"><i class="fas fa-random"></i> Practice Next</div>
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
            'optimization.html': 'optimization'
        };
        return categoryMap[filename] || null;
    },

    init() {
        const category = this.detectCategory();
        if (category) this.renderProblems(category);
        window.addEventListener('hashchange', () => this.handleDeepLink());
    }
};
