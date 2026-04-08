// ui.js — rendering, modal, theme
import { fetchGameCategories, fetchGameRecords } from './api.js';
const el = id => document.getElementById(id);
const grid = el('games-grid'), loading = el('games-loading'), noResults = el('no-results');
const modal = el('game-modal'), backdrop = el('modal-backdrop'), closeBtn = el('close-modal');
const mTitle = el('modal-game-title'), mYear = el('modal-game-year'), mCats = el('modal-categories');
const recList = el('records-list'), recLoading = el('records-loading'), recEmpty = el('empty-records');
const moreBox = el('load-more-container'), moreBtn = el('load-more-btn'), recContainer = el('modal-records-container');
let darkMode = true, tabs = {}, activeTab = '', showing = 10;

export function setupUIListeners() {
    closeBtn.onclick = backdrop.onclick = closeModal;
    moreBtn.onclick = () => { showing += 10; renderRecords(); };
    document.onkeydown = e => { if (e.key === 'Escape') closeModal(); };
    el('theme-toggle').onclick = () => {
        darkMode = !darkMode;
        document.body.classList.toggle('dark', darkMode);
        document.body.classList.toggle('light', !darkMode);
        el('icon-sun').classList.toggle('hidden', !darkMode);
        el('icon-moon').classList.toggle('hidden', darkMode);
    };
}
function getCover(g) { return g.assets?.['cover-large']?.uri || ''; }
function fmtTime(s) {
    if (!s) return 'N/A';
    let h=Math.floor(s/3600), m=Math.floor((s%3600)/60), sec=(s%60).toFixed(3), r='';
    if (h) r+=h+'h '; if (m||h) r+=m+'m '; return r+sec+'s';
}
export function hideLoading() { loading.classList.add('hidden'); }
export function showFailure() { loading.innerHTML = '<p class="text-red-400">Failed to load. Refresh the page.</p>'; }
export function toggleNoResults(show) { noResults.classList.toggle('hidden',!show); grid.classList.toggle('hidden',show); }

export function renderGames(games) {
    grid.innerHTML = '';
    games.forEach((game, i) => {
        let card = document.createElement('div'), cover = getCover(game), name = game.names.international;
        card.className = 'game-card cursor-pointer flex flex-col fade-in bg-dark-card';
        card.style.animationDelay = (i%20)*30+'ms';
        card.innerHTML = `<div class="aspect-[3/4] overflow-hidden bg-dark-surface">${cover
            ? `<img src="${cover}" alt="${name}" class="w-full h-full object-cover" loading="lazy">`
            : `<div class="w-full h-full flex items-center justify-center text-2xl opacity-20">🎮</div>`
        }</div><div class="p-3"><h3 class="font-semibold text-sm line-clamp-2">${name}</h3>
        <p class="text-xs opacity-40 mt-1">${game.released||'Records'}</p></div>`;
        card.onclick = () => openModal(game);
        grid.appendChild(card);
    });
}
export async function openModal(game) {
    mTitle.textContent = game.names.international;
    mYear.textContent = game.released || 'N/A';
    mCats.innerHTML=''; recList.innerHTML='';
    moreBox.classList.add('hidden'); recLoading.classList.remove('hidden'); recEmpty.classList.add('hidden');
    document.body.classList.add('modal-open'); modal.classList.add('modal-active');
    try {
        let [cats,recs] = await Promise.all([fetchGameCategories(game.id), fetchGameRecords(game.id,100)]);
        let catNames = {}; (cats.data||[]).forEach(c => catNames[c.id]=c.name);
        let records = recs.data||[], firstTab = null;
        tabs = {};
        records.forEach(r => {
            let name=catNames[r.category]||'Unknown', runs=r.runs||[];
            if (runs.length) { tabs[name]=runs; if (!firstTab) firstTab=name; }
        });
        if (!firstTab) { recLoading.classList.add('hidden'); recEmpty.classList.remove('hidden'); return; }
        for (let name in tabs) {
            let btn = document.createElement('button');
            btn.className='px-4 py-1.5 rounded-full text-xs font-medium whitespace-nowrap tab-inactive';
            btn.textContent=name; btn.dataset.cat=name;
            btn.onclick=()=>switchTab(name); mCats.appendChild(btn);
        }
        recLoading.classList.add('hidden'); switchTab(firstTab);
    } catch(e) { console.error(e); recLoading.classList.add('hidden'); recEmpty.classList.remove('hidden'); }
}
function switchTab(name) {
    activeTab=name; showing=10;
    mCats.querySelectorAll('button').forEach(b => { b.classList.toggle('tab-active',b.dataset.cat===name); b.classList.toggle('tab-inactive',b.dataset.cat!==name); });
    renderRecords();
}
function renderRecords() {
    recList.innerHTML='';
    let runs = tabs[activeTab]||[];
    if (!runs.length) { recEmpty.classList.remove('hidden'); moreBox.classList.add('hidden'); return; }
    recEmpty.classList.add('hidden');
    runs.slice(0,showing).forEach(entry => {
        let run=entry.run, rank=entry.place, player=run.players?.[0]?.name||'Unknown', time=fmtTime(run.times?.primary_t);
        let date=run.date?new Date(run.date).toLocaleDateString(undefined,{year:'numeric',month:'short',day:'numeric'}):'—';
        let badge=rank===1?'bg-accent text-black':rank===2?'bg-gray-300 text-black':rank===3?'bg-amber-600 text-white':'bg-dark-surface text-white/50';
        let row=document.createElement('div');
        row.className='record-row flex items-center gap-4 px-6 py-3 fade-in';
        row.innerHTML=`<div class="w-8 h-8 rounded-full ${badge} flex items-center justify-center text-xs font-bold">${rank}</div>
            <div class="flex-1 min-w-0"><p class="font-medium text-sm truncate">${player}</p><p class="text-xs opacity-40">${date}</p></div>
            <div class="font-mono text-sm font-semibold text-accent">${time}</div>
            ${run.weblink?`<a href="${run.weblink}" target="_blank" class="opacity-40 hover:opacity-100">↗</a>`:''}`;
        recList.appendChild(row);
    });
    moreBox.classList.toggle('hidden', runs.length<=showing);
    if (showing===10) recContainer.scrollTop=0;
}
function closeModal() { modal.classList.remove('modal-active'); document.body.classList.remove('modal-open'); }
