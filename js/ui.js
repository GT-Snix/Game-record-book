// js/ui.js — DOM rendering, cards, modal, theme toggle
import { fetchGameCategories, fetchGameRecords } from './api.js';

// ─── DOM References ─────────────────────────────────────────
const $ = (id) => document.getElementById(id);

const elements = {
    gamesGrid:       $('games-grid'),
    loadingState:    $('games-loading'),
    noResultsState:  $('no-results'),
    modal:           $('game-modal'),
    closeBtn:        $('close-modal'),
    backdrop:        $('modal-backdrop'),
    modalTitle:      $('modal-game-title'),
    modalYear:       $('modal-game-year'),
    modalCategories: $('modal-categories'),
    modalRecords:    $('modal-records-container'),
    recordsList:     $('records-list'),
    loadMoreContainer: $('load-more-container'),
    loadMoreBtn:     $('load-more-btn'),
    recordsLoading:  $('records-loading'),
    emptyRecords:    $('empty-records'),
    trailerContainer: $('modal-trailer-container'),
    themeToggle:     $('theme-toggle'),
    iconSun:         $('icon-sun'),
    iconMoon:        $('icon-moon'),
};

const DEFAULT_COVER = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="640" height="360" fill="%231a1a1a"><rect width="100%" height="100%"/><text x="50%" y="50%" fill="%23555" font-family="sans-serif" font-size="18" text-anchor="middle" dominant-baseline="middle">No Image</text></svg>';

let currentModalData = { recordsByTab: {}, activeTab: '', visibleCount: 10 };

// ─── Theme ──────────────────────────────────────────────────
let isDark = true;

function applyTheme() {
    const body = document.body;
    if (isDark) {
        body.classList.add('dark');
        body.classList.remove('light');
        elements.iconSun.classList.remove('hidden');
        elements.iconMoon.classList.add('hidden');
    } else {
        body.classList.remove('dark');
        body.classList.add('light');
        elements.iconSun.classList.add('hidden');
        elements.iconMoon.classList.remove('hidden');
    }
}

// ─── Public Setup ───────────────────────────────────────────
export function setupUIListeners() {
    elements.closeBtn.addEventListener('click', closeModal);
    elements.backdrop.addEventListener('click', closeModal);
    elements.loadMoreBtn.addEventListener('click', loadMoreRecords);

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && elements.modal.classList.contains('modal-active')) closeModal();
    });

    // Theme toggle
    elements.themeToggle.addEventListener('click', () => {
        isDark = !isDark;
        applyTheme();
    });

    applyTheme();
}

// ─── Utilities ──────────────────────────────────────────────
function formatTime(seconds) {
    if (!seconds) return 'N/A';
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    let f = '';
    if (h > 0) f += `${h}h `;
    if (m > 0 || h > 0) f += `${m}m `;
    f += `${s.toFixed(3)}s`;
    return f;
}

function getCoverUri(game) {
    return game.assets?.['cover-large']?.uri || DEFAULT_COVER;
}

// ─── Loading / Error States ─────────────────────────────────
export function hideLoading() { elements.loadingState.classList.add('hidden'); }

export function showFailure() {
    elements.loadingState.innerHTML = '<p class="text-red-400 font-medium">Failed to load games. Please refresh.</p>';
}

export function toggleNoResults(show) {
    elements.noResultsState.classList.toggle('hidden', !show);
    elements.gamesGrid.classList.toggle('hidden', show);
}

// ─── Game Grid Rendering ────────────────────────────────────
export function renderGames(gamesArray) {
    elements.gamesGrid.innerHTML = '';
    gamesArray.forEach((game, i) => {
        const card = createGameCard(game);
        card.style.animationDelay = `${(i % 20) * 40}ms`;
        elements.gamesGrid.appendChild(card);
    });
}

function createGameCard(game) {
    const div = document.createElement('div');
    div.className = 'game-card cursor-pointer flex flex-col group fade-in bg-dark-card relative';

    const cover = getCoverUri(game);
    const year = game.released || '';

    div.innerHTML = `
        <!-- Poster -->
        <div class="aspect-[3/4] overflow-hidden relative bg-dark-surface">
            <img src="${cover}" alt="${game.names.international}" class="card-poster w-full h-full object-cover" loading="lazy">
            
            <!-- Netflix-style slide-up info overlay -->
            <div class="card-info-overlay absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black via-black/90 to-transparent p-4 pt-10">
                <div class="flex items-center gap-2 mb-2">
                    <button class="w-10 h-10 rounded-full bg-accent flex items-center justify-center hover:bg-accentHover transition-colors flex-shrink-0">
                        <svg class="w-5 h-5 text-black ml-0.5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                    </button>
                    <span class="bg-white/20 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider">WR</span>
                </div>
                <p class="text-xs text-gray-300">${year ? 'Released ' + year : 'View Records →'}</p>
            </div>
        </div>

        <!-- Title below card -->
        <div class="card-meta-area p-3">
            <h3 class="card-title font-semibold text-sm line-clamp-2 leading-snug text-white">${game.names.international}</h3>
            <p class="card-subtitle text-xs opacity-50 mt-1">${year || 'Speedrun Records'}</p>
        </div>
    `;

    div.addEventListener('click', () => openModal(game));
    return div;
}

// ─── Modal ──────────────────────────────────────────────────
export async function openModal(game) {
    const cover = getCoverUri(game);
    elements.modalTitle.textContent = game.names.international;
    elements.modalYear.textContent = game.released || 'N/A';

    // Cinematic hero poster with "Watch Trailer" button
    const ytSearchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(game.names.international + ' official trailer')}`;
    elements.trailerContainer.innerHTML = `
        <img src="${cover}" alt="${game.names.international}" class="w-full h-full object-cover opacity-60">
        <div class="absolute inset-0 bg-gradient-to-t from-dark-card via-black/40 to-black/20"></div>
        <a href="${ytSearchUrl}" target="_blank" rel="noopener noreferrer" 
           class="absolute inset-0 flex items-center justify-center">
            <div class="flex items-center gap-3 bg-black/60 backdrop-blur-sm px-5 py-3 rounded-full border border-white/10 hover:bg-red-600/90 hover:border-red-500 transition-all duration-300">
                <svg class="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                <span class="text-white text-sm font-medium">Watch Trailer on YouTube</span>
            </div>
        </a>
    `;

    // Reset states
    elements.modalCategories.innerHTML = '';
    elements.recordsList.innerHTML = '';
    elements.loadMoreContainer.classList.add('hidden');
    elements.recordsLoading.classList.remove('hidden');
    elements.emptyRecords.classList.add('hidden');

    document.body.classList.add('modal-open');
    elements.modal.classList.add('modal-active');

    try {
        const [catsData, recordsData] = await Promise.all([
            fetchGameCategories(game.id),
            fetchGameRecords(game.id, 100)
        ]);

        const catMap = {};
        (catsData.data || []).forEach(c => { catMap[c.id] = c.name; });

        const records = recordsData.data || [];

        if (records.length === 0) {
            elements.recordsLoading.classList.add('hidden');
            elements.emptyRecords.classList.remove('hidden');
            return;
        }

        currentModalData.recordsByTab = {};
        let firstTab = null;

        records.forEach(catRecord => {
            const catName = catMap[catRecord.category] || 'Unknown';
            const runs = catRecord.runs || [];
            if (runs.length > 0) {
                currentModalData.recordsByTab[catName] = runs;
                if (!firstTab) firstTab = catName;
            }
        });

        if (!firstTab) {
            elements.recordsLoading.classList.add('hidden');
            elements.emptyRecords.classList.remove('hidden');
            return;
        }

        // Build category tabs
        Object.keys(currentModalData.recordsByTab).forEach(catName => {
            const btn = document.createElement('button');
            btn.className = 'px-4 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors tab-inactive';
            btn.textContent = catName;
            btn.dataset.cat = catName;
            btn.addEventListener('click', () => switchTab(catName));
            elements.modalCategories.appendChild(btn);
        });

        elements.recordsLoading.classList.add('hidden');
        switchTab(firstTab);

    } catch (err) {
        console.error('Modal data error:', err);
        elements.recordsLoading.classList.add('hidden');
        elements.emptyRecords.classList.remove('hidden');
    }
}

function switchTab(tabName) {
    currentModalData.activeTab = tabName;
    currentModalData.visibleCount = 10;

    elements.modalCategories.querySelectorAll('button').forEach(btn => {
        btn.classList.toggle('tab-active', btn.dataset.cat === tabName);
        btn.classList.toggle('tab-inactive', btn.dataset.cat !== tabName);
    });

    renderRecords();
}

function renderRecords() {
    elements.recordsList.innerHTML = '';
    const runs = currentModalData.recordsByTab[currentModalData.activeTab] || [];

    if (runs.length === 0) {
        elements.emptyRecords.classList.remove('hidden');
        elements.loadMoreContainer.classList.add('hidden');
        return;
    }
    elements.emptyRecords.classList.add('hidden');

    const visible = runs.slice(0, currentModalData.visibleCount);

    visible.forEach((entry, i) => {
        const rank = entry.place;
        const run = entry.run;

        let playerName = 'Unknown Runner';
        if (run.players?.[0]) {
            const p = run.players[0];
            playerName = p.name || `Runner ${(p.id || '').substring(0, 5).toUpperCase()}`;
        }

        const time = formatTime(run.times?.primary_t);
        const date = run.date ? new Date(run.date).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) : '—';
        const link = run.weblink || '#';

        const rankColor = rank === 1 ? 'bg-accent text-black' 
            : rank === 2 ? 'bg-gray-300 text-black' 
            : rank === 3 ? 'bg-amber-600 text-white' 
            : 'bg-dark-surface text-white/50';

        const row = document.createElement('div');
        row.className = 'record-row flex items-center gap-4 px-6 py-3 fade-in';
        row.style.animationDelay = `${(i % 10) * 30}ms`;

        row.innerHTML = `
            <div class="w-8 h-8 rounded-full ${rankColor} flex items-center justify-center text-xs font-bold flex-shrink-0">${rank}</div>
            <div class="flex-1 min-w-0">
                <p class="font-medium text-sm truncate">${playerName}</p>
                <p class="text-xs opacity-40">${date}</p>
            </div>
            <div class="font-mono text-sm font-semibold text-accent flex-shrink-0">${time}</div>
            ${link !== '#' ? `<a href="${link}" target="_blank" rel="noopener noreferrer" class="flex-shrink-0 opacity-40 hover:opacity-100 transition-opacity" title="View on Speedrun.com">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25"></path></svg>
            </a>` : ''}
        `;
        elements.recordsList.appendChild(row);
    });

    elements.loadMoreContainer.classList.toggle('hidden', runs.length <= currentModalData.visibleCount);

    if (currentModalData.visibleCount === 10) {
        elements.modalRecords.scrollTop = 0;
    }
}

function loadMoreRecords() {
    currentModalData.visibleCount += 10;
    renderRecords();
}

function closeModal() {
    elements.modal.classList.remove('modal-active');
    document.body.classList.remove('modal-open');
}
