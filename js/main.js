// js/main.js — app entry point
import { fetchAllGames, searchGames } from './api.js';
import { setupUIListeners, hideLoading, showFailure, renderGames, toggleNoResults } from './ui.js';

let homeGames = [];
let searchInput = document.getElementById('search-input');
let searchBtn = document.getElementById('search-btn');

// Wait for page to load, then kick things off
document.addEventListener('DOMContentLoaded', () => {
    setupUIListeners();
    loadHomePage();

    // Search when clicking the button or pressing Enter
    searchBtn.addEventListener('click', () => doSearch(searchInput.value.trim()));
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') doSearch(searchInput.value.trim());
    });

    // If search box is cleared, go back to home games
    searchInput.addEventListener('input', () => {
        if (!searchInput.value.trim()) {
            toggleNoResults(false);
            renderGames(homeGames);
        }
    });
});

// Load the initial set of games
async function loadHomePage() {
    try {
        let data = await fetchAllGames(100);
        homeGames = data.data || [];
        hideLoading();
        renderGames(homeGames);
    } catch (error) {
        console.error('Failed to load games:', error);
        showFailure();
    }
}

// Search for games by name
async function doSearch(term) {
    if (!term) {
        toggleNoResults(false);
        renderGames(homeGames);
        return;
    }

    try {
        document.getElementById('games-grid').innerHTML = '';
        toggleNoResults(false);

        let data = await searchGames(term);
        let results = data.data || [];

        if (results.length === 0) {
            toggleNoResults(true);
        } else {
            toggleNoResults(false);
            renderGames(results);
        }
    } catch (error) {
        console.error('Search failed:', error);
        toggleNoResults(true);
    }
}
