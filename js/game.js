const TIME_LIMIT = 20; // 20 seconds per round
let timeLeft = TIME_LIMIT;
let totalRounds = 0;
let currentRound = 1;
let hasPicked = false;

// ✅ Function to fetch total rounds (only after game ends)
async function fetchTotalRounds() {
    const gameId = sessionStorage.getItem("gameId");

    if (!gameId) {
        console.error("🚨 Error: No game found in session.");
        return;
    }

    try {
        const response = await fetch(`https://numbers-game-server-sdk-kpah.vercel.app/game/results?game_id=${gameId}`);
        const data = await response.json();

        if (response.ok) {
            totalRounds = data.total_rounds;
            console.log(`📊 Total rounds: ${totalRounds}`);
        } else {
            console.log("⏳ Game still running, retrying...");
            setTimeout(fetchTotalRounds, 5000); // Retry every 5s
        }
    } catch (error) {
        console.error("❌ Error fetching total rounds:", error);
        setTimeout(fetchTotalRounds, 5000);
    }
}

// ✅ Countdown Timer
function startCountdown() {
    const timer = setInterval(() => {
        timeLeft--;
        document.getElementById("time-left").innerText = timeLeft;

        if (timeLeft === 0) {
            clearInterval(timer);

            if (!hasPicked) {
                document.getElementById("player-number").value = 5;
                submitNumber(5);
            }
        }
    }, 1000);
}

// ✅ Submit Number
async function submitNumber(playerNumber) {
    const gameId = sessionStorage.getItem("gameId");
    const playerId = sessionStorage.getItem("playerId");

    if (!gameId || !playerId) {
        alert("🚨 Error: Missing game ID or player ID.");
        return;
    }

    try {
        const response = await fetch("https://numbers-game-server-sdk-kpah.vercel.app/round/submit", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ game_id: gameId, player_id: playerId, number: playerNumber })
        });

        const data = await response.json();
        console.log("📨 Response received:", data);

        if (response.ok) {
            console.log(`✅ Number ${playerNumber} submitted.`);
            hasPicked = true;
            sessionStorage.setItem("hasPicked", "true");
            sessionStorage.setItem("playerNumber", playerNumber);

            document.getElementById("player-number").disabled = true;
            document.getElementById("submit-number").disabled = true;

            document.querySelector(".container").innerHTML += `
                <p class="selected-message">You selected: <strong>${playerNumber}</strong>. Waiting for the round to finish...</p>
            `;

            waitForRoundEnd();
        } else {
            alert("❌ Error submitting number: " + data.error);
        }
    } catch (error) {
        console.error("❌ Error submitting number:", error);
        alert("Failed to submit number. Please try again.");
    }
}

// ✅ Wait for Round End
async function waitForRoundEnd() {
    const gameId = sessionStorage.getItem("gameId");

    if (!gameId) {
        console.error("🚨 Error: No game ID found in session.");
        return;
    }

    try {
        const response = await fetch(`https://numbers-game-server-sdk-kpah.vercel.app/game/status/${gameId}`, {
            method: "GET",
            headers: { "Content-Type": "application/json" }
        });

        const data = await response.json();
        console.log("📡 Game Status:", data);

        if (data.status === "round_finished") {
            console.log("🎉 Round finished! Redirecting to results...");
            window.location.href = "/pages/results.html";
        } else if (data.status === "finished") {
            console.log("🏆 Game finished! Redirecting to final results...");
            window.location.href = "/pages/final.html";
        } else {
            console.log("⏳ Round not finished yet. Checking again in 4s...");
            setTimeout(waitForRoundEnd, 4000);
        }
    } catch (error) {
        console.error("❌ Error checking game status:", error);
        setTimeout(waitForRoundEnd, 4000);
    }
}

// ✅ Wait for Next Round
async function waitForNextRound() {
    const gameId = sessionStorage.getItem("gameId");

    try {
        const response = await fetch(`https://numbers-game-server-sdk-kpah.vercel.app/game/status/${gameId}`, {
            method: "GET",
            headers: { "Content-Type": "application/json" }
        });

        const data = await response.json();
        console.log("📡 Game Status:", data);

        if (data.status === "started") {
            console.log("🚀 Next round started! Redirecting...");
            window.location.href = "/pages/game.html";
        } else if (data.status === "finished") {
            console.log("🏆 Game finished! Redirecting...");
            window.location.href = "/pages/final.html";
        } else {
            console.log("⏳ Waiting for next round... Checking in 5s...");
            setTimeout(waitForNextRound, 5000);
        }
    } catch (error) {
        console.error("❌ Error checking game status:", error);
        setTimeout(waitForNextRound, 5000);
    }
}

// ✅ Fetch Final Winner
async function fetchFinalWinner() {
    const gameId = sessionStorage.getItem("gameId");

    if (!gameId) {
        document.getElementById("winner-message").innerHTML = "<p>Error: No game found.</p>";
        return;
    }

    try {
        const response = await fetch(`https://numbers-game-server-sdk-kpah.vercel.app/game/results?game_id=${gameId}`);
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || "Failed to fetch final results");
        }

        const roundResults = data.round_results;
        if (!roundResults || Object.keys(roundResults).length === 0) {
            document.getElementById("winner-message").innerHTML = "<p>No game results available.</p>";
            return;
        }

        const winCount = {};
        for (const round in roundResults) {
            const winner = roundResults[round].winner;
            if (winner) {
                winCount[winner] = (winCount[winner] || 0) + 1;
            }
        }

        const sortedWinners = Object.entries(winCount).sort((a, b) => b[1] - a[1]);

        let resultHtml = "<h2>🏆 Final Standings</h2><ul>";
        sortedWinners.forEach(([playerId, wins]) => {
            resultHtml += `<li><strong>Player ${playerId}</strong>: ${wins} round(s) won</li>`;
        });
        resultHtml += "</ul>";

        document.getElementById("winner-message").innerHTML = resultHtml;

    } catch (error) {
        console.error("❌ Error fetching final results:", error);
        document.getElementById("winner-message").innerHTML = "<p>Error loading results. Please try again.</p>";
    }
}

// ✅ SINGLE `DOMContentLoaded` EVENT LISTENER
document.addEventListener("DOMContentLoaded", () => {
    const page = window.location.pathname;

    if (page.includes("game.html")) {
        console.log("🎮 Game page loaded. Checking previous selections...");
        fetchTotalRounds();
        startCountdown();
    } else if (page.includes("results.html")) {
        console.log("📢 Results page loaded. Waiting for next round...");
        waitForNextRound();
    } else if (page.includes("final.html")) {
        console.log("🏆 Final page loaded. Fetching winner...");
        fetchFinalWinner();
    }
});
