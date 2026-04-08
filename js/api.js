// js/api.js — all Speedrun.com API calls

const BASE = 'https://www.speedrun.com/api/v1';

export async function fetchAllGames(max = 100) {
    let res = await fetch(`${BASE}/games?max=${max}&embed=assets`);
    if (!res.ok) throw new Error('Failed to fetch games');
    return res.json();
}

export async function searchGames(term) {
    let res = await fetch(`${BASE}/games?name=${encodeURIComponent(term)}&embed=assets`);
    if (!res.ok) throw new Error('Search failed');
    return res.json();
}

export async function fetchGameCategories(gameId) {
    let res = await fetch(`${BASE}/games/${gameId}/categories`);
    if (!res.ok) throw new Error('Failed to fetch categories');
    return res.json();
}

export async function fetchGameRecords(gameId, top = 100) {
    let res = await fetch(`${BASE}/games/${gameId}/records?top=${top}`);
    if (!res.ok) throw new Error('Failed to fetch records');
    return res.json();
}
