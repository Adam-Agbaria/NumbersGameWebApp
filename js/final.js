document.addEventListener("DOMContentLoaded", function () {
    if (document.getElementById("winner-message")) {
        fetchFinalWinner();
    }
});

async function fetchFinalWinner() {
    const gameId = sessionStorage.getItem("gameId");
    const winnerElement = document.getElementById("winner-message");

    if (!winnerElement) {
        console.error("❌ Error: Element with ID 'winner-message' not found in DOM.");
        return;
    }

    if (!gameId) {
        winnerElement.innerHTML = "<p>Error: No game found.</p>";
        return;
    }

    try {
        const response = await fetch(`https://numbers-game-server-sdk-kpah.vercel.app/game/results?game_id=${gameId}`);
        const data = await response.json();

        console.log("📡 API Response:", data);

        if (!response.ok) {
            throw new Error(data.error || "Failed to fetch final results");
        }

        if (!data.round_results || Object.keys(data.round_results).length === 0) {
            winnerElement.innerHTML = "<p>No game results available.</p>";
            return;
        }

        const players = data.players || {};

        // ✅ Count how many rounds each player won
        const winCount = {};
        for (const roundKey in data.round_results) {
            const roundWinners = data.round_results[roundKey].winners || [];
            roundWinners.forEach(winner => {
                winCount[winner] = (winCount[winner] || 0) + 1;
            });
        }

        // ✅ Sort players by most rounds won
        const sortedWinners = Object.entries(winCount).sort((a, b) => b[1] - a[1]);

        // ✅ Find the highest number of wins
        const maxWins = sortedWinners[0]?.[1] || 0;
        const finalWinners = sortedWinners.filter(([_, wins]) => wins === maxWins);

        let resultHtml = "<h2>🏆 Final Standings</h2><ul>";
        finalWinners.forEach(([playerId, wins], index) => {
            const playerName = players[playerId]?.name || `Unknown Player (${playerId})`;
            resultHtml += `<li>🥇 <strong>${playerName}</strong>: ${wins} rounds won</li>`;
        });
        resultHtml += "</ul>";

        // ✅ Display final results
        winnerElement.innerHTML = resultHtml;

    } catch (error) {
        console.error("❌ Error fetching final results:", error);
        winnerElement.innerHTML = "<p>Error loading results. Please try again.</p>";
    }
}
