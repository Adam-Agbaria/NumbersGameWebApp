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

        console.log("📡 API Response:", data); // 🔥 Debugging: See full data

        if (!response.ok) {
            throw new Error(data.error || "Failed to fetch round results");
        }

        if (!data.round_results || Object.keys(data.round_results).length === 0) {
            console.warn("⚠️ No round results found.");
            document.getElementById("results").innerHTML = "<p>No results available yet.</p>";
            return;
        }

        // 🔥 Fix: Extract latest round from the keys like "Round 1", "Round 2"
        const roundKeys = Object.keys(data.round_results).sort((a, b) => {
            return parseInt(b.replace("Round ", "")) - parseInt(a.replace("Round ", ""));
        });

        const latestRoundKey = roundKeys[0]; // ✅ Get the highest round (e.g., "Round 1")

        console.log(`✅ Latest round detected: ${latestRoundKey}`);

        const roundResults = data.round_results[latestRoundKey];

        if (!roundResults) {
            console.warn(`⚠️ No data found for ${latestRoundKey}.`);
            document.getElementById("results").innerHTML = "<p>No results available yet.</p>";
            return;
        }

        const winnerId = roundResults.winner || "Unknown";
        const winningNumber = roundResults.winning_number !== undefined ? roundResults.winning_number : "N/A";
        const chosenNumber = roundResults.chosen_number || "N/A";

        // ✅ Fix: Get winner's picked number from `players`
        let winnerPicked = "N/A";
        if (data.players && data.players[winnerId]) {
            winnerPicked = data.players[winnerId].number || "N/A";
        }

        document.getElementById("results").innerHTML = `
            <h2>${latestRoundKey} Results</h2>
            <p>🏆 <strong>Winner:</strong> Player ${winnerId} (${data.players[winnerId]?.name || "Unknown"})</p>
            <p>🎯 <strong>Winning Number:</strong> ${winningNumber}</p>
            <p>🔢 <strong>Winner's Pick:</strong> ${winnerPicked}</p>
        `;

    } catch (error) {
        console.error("❌ Error fetching round results:", error);
        document.getElementById("results").innerHTML = "<p>Error loading results. Please try again.</p>";
    }
}
