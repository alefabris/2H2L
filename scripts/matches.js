document.addEventListener('DOMContentLoaded', () => {
  const pastGamesContainer = document.getElementById('past-games');

  async function loadMatches() {
    try {
      const [matchesRes, gamesRes] = await Promise.all([
        fetch('results/matches.json'),
        fetch('games/index.json')
      ]);

      const matches = await matchesRes.json();
      const gamesIndex = await gamesRes.json();

      const gameSlugToTitle = {};
      await Promise.all(gamesIndex.map(async (entry) => {
        const res = await fetch(`games/${entry.slug}.json`);
        const gameData = await res.json();
        gameSlugToTitle[entry.slug] = gameData.title || entry.slug;
      }));

      const matchesHTML = matches.map(match => {
        const gameTitle = gameSlugToTitle[match.game] || match.game;
        const playersHTML = match.players.map(p => `${p.name}: ${p.score}`).join('<br>');
        return `
          <div class="game">
            <h2>${gameTitle}</h2>
            <p><strong>Date:</strong> ${match.date} | <strong>Duration:</strong> ${match.duration}</p>
            <p>${playersHTML}</p>
          </div>
        `;
      }).join('');

      pastGamesContainer.innerHTML = matchesHTML;
    } catch (error) {
      console.error('Failed to load past matches:', error);
      pastGamesContainer.innerHTML = '<p>Unable to load past games data.</p>';
    }
  }

  loadMatches();
});
