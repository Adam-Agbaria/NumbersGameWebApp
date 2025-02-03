document.addEventListener("DOMContentLoaded", function () {
    waitForGameStart();  
    fetchRoundResults(); 
});
async function waitForGameStart() {
    const gameId = sessionStorage.getItem("gameId");

    if (!gameId) {
        console.error("🚨 Error: No game ID found in session.");
        return;
    }

    try {
        const response = await fetch(`https://numbers-game-server-sdk-kpah.vercel.app/game/status/${gameId}`);
        const data = await response.json();

        console.log("📡 Game Status Response:", data);

        if (!response.ok) {
            console.warn(`⚠️ Server error ${response.status}. Retrying in 4s...`);
            setTimeout(waitForGameStart, 4000);
            return;
        }

        if (data.status === "started") {
            console.log("🚀 Game has started!");
            window.location.href = "/pages/game.html"; // ✅ Redirect to game page
        } else if (data.status === "round_finished" || data.status === "round_ended") {
            console.log("🎉 Round finished! Redirecting to results...");
            window.location.href = "/pages/results.html";
        } else if (data.status === "finished") {
            console.log("🏆 Game finished! Redirecting to final results...");
            window.location.href = "/pages/final.html";
        } else {
            console.log("⏳ Game not started yet. Checking again in 4s...");
            setTimeout(waitForGameStart, 4000);
        }
    } catch (error) {
        console.error("❌ Network error or timeout:", error);
        setTimeout(waitForGameStart, 4000);
    }
}

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

        // ✅ FIX: Ensure `data.players` and `data.players[winnerId]` exist before accessing
        let winnerPicked = "N/A";
        let winnerName = "Unknown";

        if (data.players && winnerId in data.players) {  // 🔥 Fix: Properly check if player exists
            winnerPicked = data.players[winnerId].number || "N/A";
            winnerName = data.players[winnerId].name || "Unknown";
        }

        document.getElementById("results").innerHTML = `
            <h2>${latestRoundKey} Results</h2>
            <p>🏆 <strong>Winner:</strong> Player ${winnerName} (${winnerId})</p>
            <p>🎯 <strong>Winning Number:</strong> ${winningNumber}</p>
            <p>🔢 <strong>Winner's Pick:</strong> ${winnerPicked}</p>
        `;

    } catch (error) {
        console.error("❌ Error fetching round results:", error);
        document.getElementById("results").innerHTML = "<p>Error loading results. Please try again.</p>";
    }
}
