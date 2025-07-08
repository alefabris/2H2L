document.addEventListener('DOMContentLoaded', () => {
  const pastGamesContainer = document.getElementById('match-results');  // ✅ Correct ID

  async function loadMatches() {
    try {
      const [matchesRes, gamesRes] = await Promise.all([
        fetch('results/matches.json'),
        fetch('games/index.json')
      ]);

      if (!matchesRes.ok || !gamesRes.ok) throw new Error('Failed to fetch data');

      const matches = await matchesRes.json();
      const gamesIndex = await gamesRes.json();

      const gameSlugToTitle = {};
      await Promise.all(gamesIndex.map(async (entry) => {
        const res = await fetch(`games/${entry.slug}.json`);
        if (res.ok) {
          const gameData = await res.json();
          gameSlugToTitle[entry.slug] = gameData.title || entry.slug;
        } else {
          gameSlugToTitle[entry.slug] = entry.slug;
        }
      }));

      const matchesHTML = matches.map(match => {
        const gameTitle = gameSlugToTitle[match.game] || match.game;
        const playersHTML = match.players.map(p => `
          <div class="poll-label"><span>${p.name}</span><span>${p.score}</span></div>
          <div class="poll-bar-container"><div class="poll-bar" style="width: ${Math.min(100, p.score)}%;"></div></div>
        `).join('');

        return `
          <div class="poll-result">
            <div class="poll-label"><strong>${gameTitle}</strong> <small>${match.date} • ${match.duration}</small></div>
            ${playersHTML}
          </div>
        `;
      }).join('');

      pastGamesContainer.innerHTML = matchesHTML || '<p>No past matches found.</p>';
    } catch (error) {
      console.error('Failed to load past matches:', error);
      pastGamesContainer.innerHTML = '<p>Unable to load past games data.</p>';
    }
  }

  loadMatches();
});
