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
        const roundKeys = Object.keys(data.round_results).sort((a, b) => {
            return parseInt(b.replace("Round ", "")) - parseInt(a.replace("Round ", ""));
        });

        // ✅ Get the last round's results
        const latestRoundKey = roundKeys[0];
        const finalRoundResults = data.round_results[latestRoundKey] || {};
        const finalRoundWinners = finalRoundResults.winners || [];
        const rawAverage = finalRoundResults.raw_average || "N/A";
        const winningNumber = finalRoundResults.winning_number || "N/A";

        let finalRoundWinnersHtml = finalRoundWinners.map(winnerId => {
            const player = players[winnerId] || { name: `Unknown (${winnerId})`, number: "N/A" };
            return `<li>🏆 <strong>${player.name}</strong> (Chose: ${player.number})</li>`;
        }).join("");

        // ✅ Count how many rounds each player won
        const winCount = {};
        for (const roundKey in data.round_results) {
            const roundWinners = data.round_results[roundKey].winners || [];
            roundWinners.forEach(winner => {
                winCount[winner] = (winCount[winner] || 0) + 1;
            });
        }

        console.log("🏆 Win Count for Each Player:", winCount);

        // ✅ Find the maximum number of rounds won
        const maxWins = Math.max(...Object.values(winCount), 0);
        const finalWinners = Object.entries(winCount).filter(([_, wins]) => wins === maxWins);

        console.log("🥇 Final Winners:", finalWinners);

        let finalWinnersHtml = finalWinners.map(([playerId, wins]) => {
            const playerName = players[playerId]?.name || `Unknown Player (${playerId})`;
            return `<li>🥇 <strong>${playerName}</strong>: ${wins} rounds won</li>`;
        }).join("");

        let allPlayersResultsHtml = "<h2>📊 Game Summary</h2><ul>";
        Object.entries(winCount).forEach(([playerId, wins]) => {
            const playerName = players[playerId]?.name || `Unknown Player (${playerId})`;
            allPlayersResultsHtml += `<li><strong>${playerName}</strong>: ${wins} rounds won</li>`;
        });
        allPlayersResultsHtml += "</ul>";

        // ✅ Display final round results + full game results
        winnerElement.innerHTML = `
            <h2>🔥 Final Round Results</h2>
            <p>📊 <strong>Average:</strong> ${rawAverage}</p>
            <p>🎯 <strong>Winning Number:</strong> ${rawAverage} * 0.8 = ${winningNumber}</p>
            <ul>${finalRoundWinnersHtml}</ul>

            <h2>🏆 Final Standings</h2>
            <ul>${finalWinnersHtml}</ul>

            ${allPlayersResultsHtml} <!-- ✅ Shows how many rounds all players won -->
        `;

    } catch (error) {
        console.error("❌ Error fetching final results:", error);
        winnerElement.innerHTML = "<p>Error loading results. Please try again.</p>";
    }
}
