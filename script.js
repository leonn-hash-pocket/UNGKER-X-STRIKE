// UNGKER-X-STRIKE - Frontend Script (Connected to Backend)
// Configuration
const API_BASE_URL = localStorage.getItem('api_base_url') || 'http://localhost:3000/api';
const GEMINI_API_KEY = localStorage.getItem('gemini_api_key') || '';

// State management
let currentPage = 'headline';
let favorites = JSON.parse(localStorage.getItem('favorites') || '[]');

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    // Check API configuration
    const savedApiUrl = localStorage.getItem('api_base_url');
    if (!savedApiUrl) {
        const apiUrl = prompt('🔗 Enter Backend API URL (default: http://localhost:3000/api):', 'http://localhost:3000/api');
        if (apiUrl) {
            localStorage.setItem('api_base_url', apiUrl);
        }
    }

    initializeEventListeners();
    loadFavorites();
    console.log('✅ UNGKER-X-STRIKE Initialized');
    console.log('🔗 API URL:', localStorage.getItem('api_base_url'));
});

// Event listeners
function initializeEventListeners() {
    // Navigation
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.addEventListener('click', (e) => switchPage(e.target.closest('.nav-btn').dataset.page));
    });

    // Generate buttons
    document.getElementById('headline-generate').addEventListener('click', generateHeadlines);
    document.getElementById('cta-generate').addEventListener('click', generateCTAs);
    document.getElementById('rewrite-generate').addEventListener('click', generateRewrite);

    // Theme toggle
    document.getElementById('themeToggle').addEventListener('click', toggleTheme);

    // Modal
    document.getElementById('modal-close').addEventListener('click', closeModal);
    document.getElementById('modal-close-btn').addEventListener('click', closeModal);

    // Character counter
    document.getElementById('rewrite-text').addEventListener('input', updateCharCount);

    // Urgency slider
    document.getElementById('cta-urgency').addEventListener('input', (e) => {
        const labels = ['Low', 'Medium', 'High'];
        document.getElementById('urgency-label').textContent = labels[parseInt(e.target.value) - 1];
    });
}

// Page switching
function switchPage(page) {
    currentPage = page;
    
    document.querySelectorAll('.page-section').forEach(section => {
        section.classList.add('hidden');
    });
    document.getElementById(`${page}-page`).classList.remove('hidden');

    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.remove('border-blue-500');
        btn.classList.add('border-transparent');
    });
    document.querySelector(`[data-page="${page}"]`).classList.remove('border-transparent');
    document.querySelector(`[data-page="${page}"]`).classList.add('border-blue-500');
}

// ==================== HEADLINE GENERATION ====================
async function generateHeadlines() {
    const product = document.getElementById('headline-product').value.trim();
    const audience = document.getElementById('headline-audience').value.trim();
    const tone = document.getElementById('headline-tone').value;

    if (!product || !audience) {
        alert('❌ Please fill all fields');
        return;
    }

    showLoading('headline-results');
    
    try {
        const apiUrl = localStorage.getItem('api_base_url') || 'http://localhost:3000/api';
        
        const response = await fetch(`${apiUrl}/headline/generate`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                product,
                audience,
                tone
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error?.message || 'Failed to generate headlines');
        }

        const data = await response.json();
        
        if (data.status === 'success' && Array.isArray(data.data)) {
            displayHeadlines(data.data);
        } else {
            throw new Error('Invalid response format');
        }
    } catch (error) {
        console.error('❌ Error:', error);
        showError('headline-results', error.message);
    }
}

// ==================== CTA GENERATION ====================
async function generateCTAs() {
    const description = document.getElementById('cta-description').value.trim();
    const action = document.getElementById('cta-action').value;
    const urgency = ['low', 'medium', 'high'][document.getElementById('cta-urgency').value - 1];

    if (!description) {
        alert('❌ Please fill the description field');
        return;
    }

    showLoading('cta-results');

    try {
        const apiUrl = localStorage.getItem('api_base_url') || 'http://localhost:3000/api';

        const response = await fetch(`${apiUrl}/cta/generate`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                description,
                action,
                urgency
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error?.message || 'Failed to generate CTAs');
        }

        const data = await response.json();

        if (data.status === 'success' && data.data) {
            displayCTAs(data.data);
        } else {
            throw new Error('Invalid response format');
        }
    } catch (error) {
        console.error('❌ Error:', error);
        showError('cta-results', error.message);
    }
}

// ==================== REWRITE GENERATION ====================
async function generateRewrite() {
    const text = document.getElementById('rewrite-text').value.trim();

    if (text.length < 10) {
        alert('❌ Text must be at least 10 characters');
        return;
    }

    if (text.length > 1000) {
        alert('❌ Text must not exceed 1000 characters');
        return;
    }

    showLoading('rewrite-results');

    try {
        const apiUrl = localStorage.getItem('api_base_url') || 'http://localhost:3000/api';

        const response = await fetch(`${apiUrl}/rewrite/generate`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                text
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error?.message || 'Failed to rewrite text');
        }

        const data = await response.json();

        if (data.status === 'success' && data.data) {
            displayRewrites(data.data);
        } else {
            throw new Error('Invalid response format');
        }
    } catch (error) {
        console.error('❌ Error:', error);
        showError('rewrite-results', error.message);
    }
}

// Display Headlines
function displayHeadlines(headlines) {
    const container = document.getElementById('headline-results');
    container.innerHTML = '';

    headlines.forEach((headline, index) => {
        const card = createCard(headline, 'headline', index);
        container.appendChild(card);
    });
}

// Display CTAs
function displayCTAs(ctas) {
    const container = document.getElementById('cta-results');
    container.innerHTML = '';

    const ctaTypes = [
        { label: 'Short CTA', key: 'short', badge: 'badge-short' },
        { label: 'Long CTA', key: 'long', badge: 'badge-long' },
        { label: 'Urgent CTA', key: 'urgent', badge: 'badge-urgent' }
    ];

    ctaTypes.forEach(({ label, key, badge }) => {
        const card = document.createElement('div');
        card.className = 'card cursor-pointer';
        card.innerHTML = `
            <div class="card-header">
                <span class="card-badge ${badge}">${label}</span>
            </div>
            <p class="text-slate-200 mb-4 min-h-12">${ctas[key] || 'N/A'}</p>
            <div class="flex gap-2">
                <button class="btn-small flex-1" onclick="copyToClipboard('${escapeQuotes(ctas[key] || '')}')">📋 Copy</button>
                <button class="btn-small flex-1" onclick="testCTA('${escapeQuotes(ctas[key] || '')}')">🔗 Test</button>
            </div>
        `;
        container.appendChild(card);
    });
}

// Display Rewrites
function displayRewrites(rewrites) {
    const container = document.getElementById('rewrite-results');
    container.innerHTML = '';

    const types = [
        { label: 'Formal', key: 'formal', badge: 'badge-formal' },
        { label: 'Casual', key: 'casual', badge: 'badge-casual' },
        { label: 'Persuasive', key: 'persuasive', badge: 'badge-persuasive' }
    ];

    types.forEach(({ label, key, badge }) => {
        const card = document.createElement('div');
        card.className = 'card cursor-pointer';
        card.innerHTML = `
            <div class="card-header">
                <span class="card-badge ${badge}">${label}</span>
            </div>
            <p class="text-slate-200 mb-4 text-sm line-clamp-4">${rewrites[key] || 'N/A'}</p>
            <div class="flex gap-2">
                <button class="btn-small flex-1" onclick="copyToClipboard('${escapeQuotes(rewrites[key] || '')}')">📋 Copy</button>
                <button class="btn-small flex-1" onclick="showModal('${label}', '${escapeQuotes(rewrites[key] || '')}')">👁️ Full</button>
            </div>
        `;
        container.appendChild(card);
    });
}

// Helper: Create Card
function createCard(text, type, index) {
    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `
        <p class="text-slate-200 mb-3 text-sm min-h-16">${text}</p>
        <div class="flex gap-2">
            <button class="btn-small flex-1" onclick="copyToClipboard('${escapeQuotes(text)}')">📋 Copy</button>
            <button class="btn-small" onclick="toggleFavorite(this, '${escapeQuotes(text)}')">🤍</button>
        </div>
    `;
    return card;
}

// Helper: Copy to Clipboard
function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        alert('✅ Copied to clipboard!');
    }).catch(() => {
        alert('❌ Failed to copy');
    });
}

// Helper: Toggle Favorite
function toggleFavorite(btn, text) {
    if (favorites.includes(text)) {
        favorites = favorites.filter(fav => fav !== text);
        btn.textContent = '🤍';
    } else {
        favorites.push(text);
        btn.textContent = '❤️';
    }
    localStorage.setItem('favorites', JSON.stringify(favorites));
}

// Helper: Load Favorites
function loadFavorites() {
    document.querySelectorAll('button[onclick*="toggleFavorite"]').forEach(btn => {
        const match = btn.getAttribute('onclick').match(/'([^']+)'/);
        if (match) {
            const text = match[1];
            if (favorites.includes(text)) {
                btn.textContent = '❤️';
            }
        }
    });
}

// Helper: Test CTA
function testCTA(cta) {
    alert(`🎯 CTA: ${cta}\n\nReady to test on your landing page!`);
}

// Helper: Show Modal
function showModal(title, content) {
    document.getElementById('modal-title').textContent = title;
    document.getElementById('modal-content').textContent = content;
    document.getElementById('modal').classList.remove('hidden');
}

// Helper: Close Modal
function closeModal() {
    document.getElementById('modal').classList.add('hidden');
}

// Helper: Escape Quotes
function escapeQuotes(text) {
    return text.replace(/'/g, "\\'").replace(/"/g, '\\"');
}

// Helper: Update Char Count
function updateCharCount() {
    const text = document.getElementById('rewrite-text').value;
    document.getElementById('char-count').textContent = text.length;
}

// Helper: Show Loading
function showLoading(containerId) {
    document.getElementById(containerId).innerHTML = `
        <div class="col-span-full flex justify-center py-8">
            <div class="loading text-4xl">⚙️</div>
        </div>
    `;
}

// Helper: Show Error
function showError(containerId, message) {
    document.getElementById(containerId).innerHTML = `
        <div class="col-span-full bg-red-900/20 border border-red-700 rounded-lg p-4 text-red-300">
            ❌ Error: ${message}
        </div>
    `;
}

// Theme Toggle
function toggleTheme() {
    document.documentElement.classList.toggle('dark');
    localStorage.setItem('theme', document.documentElement.classList.contains('dark') ? 'dark' : 'light');
}

// Load saved theme
if (localStorage.getItem('theme') === 'dark') {
    document.documentElement.classList.add('dark');
}