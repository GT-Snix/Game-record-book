let allGames = [];
 
    async function fetchGames() {
      try {
        const response = await fetch('https://www.speedrun.com/api/v1/games?max=50');
        const data = await response.json();
        
        allGames = data.data.map(game => ({
          id: game.id,
          name: game.names.international
        }));
 
        displayGames(allGames);
      } catch (error) {
        document.getElementById('gamesContainer').innerHTML = '<p>Error loading games</p>';
      }
    }
 
    function displayGames(games) {
      const container = document.getElementById('gamesContainer');
      
      if (games.length === 0) {
        container.innerHTML = '<p>No games found</p>';
        return;
      }
      
      const suggestedGames = games.slice(0, 27);
 
      container.innerHTML = suggestedGames.map(game => `
        <div class="card" onclick="showRecords('${game.id}', '${game.name.replace(/'/g, "\\'")}')" style="cursor: pointer; transition: transform 0.2s;" onmouseover="this.style.transform='scale(1.02)'" onmouseout="this.style.transform='scale(1)'">
          <h3 style="margin-bottom: 0;">${game.name}</h3>
        </div>
      `).join('');
    }
    
    async function showRecords(gameId, gameName) {
        try {
            const response = await fetch(`https://www.speedrun.com/api/v1/games/${gameId}/records`);
            const data = await response.json();
            
            if (data.data && data.data.length > 0) {
                const recordsText = data.data.map(record => {
                    const topTime = (record.runs && record.runs.length > 0) ? record.runs[0].run.times.primary : 'N/A';
                    return `Link: ${record.weblink}\nTop Time: ${topTime}`;
                }).join('\n\n');
                
                alert(`Records for ${gameName}:\n\n${recordsText.slice(0, 800)}${recordsText.length > 800 ? '\n...truncated' : ''}`);
            } else {
                alert(`No records found for ${gameName}.`);
            }
        } catch (error) {
            alert(`Error fetching records for ${gameName}`);
        }
    }
 
    document.getElementById('searchInput').addEventListener('input', (e) => {
      const searchTerm = e.target.value.toLowerCase();
      
      const filtered = allGames.filter(game =>
        game.name.toLowerCase().includes(searchTerm)
      );
 
      displayGames(filtered);
    });
    
    document.getElementById('searchInput').addEventListener('keydown', async (e) => {
      if (e.key === 'Enter') {
        const searchTerm = e.target.value.toLowerCase().trim();
        if (!searchTerm) return;


        let game = allGames.find(g => g.name.toLowerCase().includes(searchTerm));
        
        if (!game) {

            try {
                const response = await fetch(`https://www.speedrun.com/api/v1/games?name=${encodeURIComponent(searchTerm)}&_limit=1`);
                const data = await response.json();
                if (data.data && data.data.length > 0) {
                    game = {
                        id: data.data[0].id,
                        name: data.data[0].names.international
                    };
                }
            } catch (error) {
                console.error('API Search Error:', error);
            }
        }

        if (game) {
            showRecords(game.id, game.name);
        } else {
            alert("No matching game found to search records.");
        }
      }
    });

    fetchGames();