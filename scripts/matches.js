document.addEventListener('DOMContentLoaded', () => {
  const pastGamesContainer = document.getElementById('match-results');

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

        const maxScore = Math.max(...match.players.map(p => p.score), 1);  // avoid division by zero

        const playersHTML = match.players.map(p => {
          const widthPercent = Math.round((p.score / maxScore) * 100);
          return `
            <div class="poll-label"><span>${p.name}</span><span>${p.score}</span></div>
            <div class="poll-bar-container">
              <div class="poll-bar" style="width: ${widthPercent}%;"></div>
            </div>
          `;
        }).join('');

        return `
          <div class="poll-result">
            <h3 class="match-title">${gameTitle}</h3>
            <small>${match.date} • ${match.duration}</small>
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
