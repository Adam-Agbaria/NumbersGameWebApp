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

        // ✅ Get the current page URL
        const currentPage = window.location.pathname;

        if (data.status === "started" && !currentPage.includes("game.html")) {
            console.log("🚀 Game has started! Redirecting...");
            sessionStorage.setItem("lastRedirect", "game");
            window.location.href = "/pages/game.html"; // ✅ Redirect to game page
        } else if ((data.status === "round_finished" || data.status === "round_ended") && !currentPage.includes("results.html")) {
            console.log("🎉 Round finished! Redirecting to results...");
            sessionStorage.setItem("lastRedirect", "results");
            window.location.href = "/pages/results.html"; // ✅ Redirect only if not already here
        } else if (data.status === "finished" && !currentPage.includes("final.html")) {
            console.log("🏆 Game finished! Redirecting to final results...");
            sessionStorage.setItem("lastRedirect", "final");
            window.location.href = "/pages/final.html"; // ✅ Redirect only if not already here
        } else {
            console.log("⏳ Game not started yet. Checking again in 4s...");
            setTimeout(waitForGameStart, 4000); // ✅ Keep checking, but no redirect
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

        // 🔥 Extract the latest round
        const roundKeys = Object.keys(data.round_results).sort((a, b) => {
            return parseInt(b.replace("Round ", "")) - parseInt(a.replace("Round ", ""));
        });

        const latestRoundKey = roundKeys[0]; // ✅ Get the highest round

        console.log(`✅ Latest round detected: ${latestRoundKey}`);

        const roundResults = data.round_results[latestRoundKey];

        if (!roundResults) {
            console.warn(`⚠️ No data found for ${latestRoundKey}.`);
            document.getElementById("results").innerHTML = "<p>No results available yet.</p>";
            return;
        }

        // ✅ Fetch multiple winners
        const winners = roundResults.winners || [];
        const winningNumber = roundResults.winning_number !== undefined ? roundResults.winning_number : "N/A";

        let winnerDetails = winners.map(winnerId => {
            const player = data.players[winnerId] || { name: `Unknown (${winnerId})`, number: "N/A" };
            return `<li>🏆 <strong>${player.name}</strong> (Chose: ${player.number})</li>`;
        }).join("");

        // ✅ Display multiple winners
        document.getElementById("results").innerHTML = `
            <h2>${latestRoundKey} Results</h2>
            <p>🎯 <strong>Winning Number:</strong> ${winningNumber}</p>
            <ul>${winnerDetails}</ul>
        `;

    } catch (error) {
        console.error("❌ Error fetching round results:", error);
        document.getElementById("results").innerHTML = "<p>Error loading results. Please try again.</p>";
    }
}

