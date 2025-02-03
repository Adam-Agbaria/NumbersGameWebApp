document.addEventListener("DOMContentLoaded", fetchRoundResults);

async function fetchRoundResults() {
    const gameId = sessionStorage.getItem("gameId");

    if (!gameId) {
        document.getElementById("results").innerHTML = "<p>Error: No game found.</p>";
        return;
    }

    try {
        const response = await fetch(`https://numbers-game-server-sdk-kpah.vercel.app/game/results?game_id=${gameId}`);
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || "Failed to fetch round results");
        }

        const currentRound = data.current_round - 1; // Get the last round
        const roundResults = data.round_results[`Round ${currentRound}`];

        if (!roundResults) {
            document.getElementById("results").innerHTML = "<p>No results available yet.</p>";
            return;
        }

        // ✅ Ensure winnerId exists before accessing
        const winnerId = roundResults.winner || "Unknown";
        const winningNumber = roundResults.average ? roundResults.average.toFixed(2) : "N/A";
        
        // ✅ Handle case where `players` may be missing
        let winnerPicked = "N/A";
        if (data.players && data.players[winnerId]) {
            winnerPicked = data.players[winnerId].number || "N/A";
        }

        document.getElementById("results").innerHTML = `
            <h2>Round ${currentRound} Results</h2>
            <p>🏆 <strong>Winner:</strong> Player ${winnerId}</p>
            <p>🎯 <strong>Winning Number:</strong> ${winningNumber}</p>
            <p>🔢 <strong>Winner's Pick:</strong> ${winnerPicked}</p>
        `;

    } catch (error) {
        console.error("❌ Error fetching round results:", error);
        document.getElementById("results").innerHTML = "<p>Error loading results. Please try again.</p>";
    }
}
