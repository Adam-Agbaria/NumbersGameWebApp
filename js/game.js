const TIME_LIMIT = 20; // 20 seconds per round
let timeLeft = TIME_LIMIT;
let totalRounds = 0;
let currentRound = 1;
let hasPicked = false;

// Function to fetch total rounds (only after game ends)
async function fetchTotalRounds() {
    const gameId = sessionStorage.getItem("gameId");

    try {
        const response = await fetch(`https://numbers-game-server-sdk-kpah.vercel.app/game/results?game_id=${gameId}`);
        const data = await response.json();

        if (response.ok) {
            totalRounds = data.total_rounds;
            console.log(`Total rounds: ${totalRounds}`);
        } else if (data.error === "Game is still in progress") {
            console.log("Game is still running, retrying...");
            setTimeout(fetchTotalRounds, 5000); // ✅ Retry every 5 seconds
        } else {
            alert("Error fetching game details: " + data.error);
        }
    } catch (error) {
        console.error("Error fetching total rounds:", error);
        setTimeout(fetchTotalRounds, 5000); // ✅ Retry in case of network issues
    }
}

// ✅ Call fetchTotalRounds() only after game ends
document.addEventListener("DOMContentLoaded", () => {
    const gameId = sessionStorage.getItem("gameId");

    if (!gameId) {
        document.body.innerHTML = "<h2>Error: No game found.</h2>";
        return;
    }

    document.getElementById("time-left").innerText = timeLeft;

    fetchTotalRounds(); // ✅ Fetch rounds but wait if game is still running
    startCountdown();
});

// ✅ Function to start the countdown timer
function startCountdown() {
    const timer = setInterval(() => {
        timeLeft--;
        document.getElementById("time-left").innerText = timeLeft;

        if (timeLeft === 0) {
            clearInterval(timer);

            // If player hasn't picked, auto-select 5
            if (!hasPicked) {
                document.getElementById("player-number").value = 5;
                submitNumber(5);
            }
        }
    }, 1000);
}

// ✅ Submit number to backend and show confirmation
document.getElementById("submit-number").addEventListener("click", () => {
    const playerNumber = document.getElementById("player-number").value;
    if (playerNumber !== "") {
        submitNumber(playerNumber);
    } else {
        alert("Please pick a number between 0-100.");
    }
});

async function submitNumber(playerNumber) {
    const gameId = sessionStorage.getItem("gameId");
    const playerId = sessionStorage.getItem("playerId");

    if (!gameId || !playerId) {
        alert("Error: Missing game ID or player ID.");
        return;
    }

    try {
        const requestBody = JSON.stringify({ 
            game_id: gameId, 
            player_id: playerId, 
            number: playerNumber 
        });

        console.log("Sending request:", requestBody);

        const response = await fetch("https://numbers-game-server-sdk-kpah.vercel.app/round/submit", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: requestBody
        });

        const data = await response.json();
        console.log("Response received:", data);

        if (response.ok) {
            console.log(`Number ${playerNumber} submitted successfully`);
            hasPicked = true;

            // Disable input and button
            document.getElementById("player-number").disabled = true;
            document.getElementById("submit-number").disabled = true;

            // Show selection confirmation
            document.querySelector(".container").innerHTML += `
                <p class="selected-message">You selected: <strong>${playerNumber}</strong>. Waiting for the round to finish...</p>
            `;

            // Wait for the round to end
            waitForRoundEnd();
        } else {
            alert("Error submitting number: " + data.error);
        }
    } catch (error) {
        console.error("Error submitting number:", error);
        alert("Failed to submit number. Please try again.");
    }
}

async function waitForNextRound() {
    const gameId = sessionStorage.getItem("gameId");

    try {
        const response = await fetch(`https://numbers-game-server-sdk-kpah.vercel.app/game/status/${gameId}`, {
            method: "GET",
            headers: { "Content-Type": "application/json" }
        });

        const data = await response.json();
        console.log("Game Status Response:", data);

        if (data.status === "started") {
            console.log("🚀 Next round started! Redirecting to game...");
            window.location.href = "/pages/game.html";
            return;
        } else if (data.status === "finished") {
            console.log("🏆 Game finished! Redirecting to final results...");
            window.location.href = "/pages/final.html";
            return;
        }
    } catch (error) {
        console.error("❌ Error checking game status:", error);
    }

    // 🔄 Retry every 5 seconds if the next round hasn't started yet
    setTimeout(waitForNextRound, 5000);
}

// ✅ Run this function when results page loads
document.addEventListener("DOMContentLoaded", () => {
    const page = window.location.pathname;

    if (page.includes("results.html")) {
        console.log("📢 On results page. Waiting for next round...");
        waitForNextRound();
    } else if (page.includes("final.html")) {
        console.log("📢 On final page. Fetching final winner...");
        fetchFinalWinner();
    }
});


document.addEventListener("DOMContentLoaded", fetchFinalWinner);

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

        // ✅ Count how many rounds each player won
        const winCount = {};
        for (const round in roundResults) {
            const winner = roundResults[round].winner;
            if (winner) {
                winCount[winner] = (winCount[winner] || 0) + 1;
            }
        }

        // ✅ Sort players by most rounds won
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

async function waitForRoundEnd() {
    const gameId = sessionStorage.getItem("gameId");

    try {
        const response = await fetch(`https://numbers-game-server-sdk-kpah.vercel.app/game/status/${gameId}`, {
            method: "GET",
            headers: { "Content-Type": "application/json" }
        });

        const data = await response.json();

        if (data.status === "round_finished") {
            console.log("Round finished! Waiting 15s for results...");
            setTimeout(() => {
                window.location.href = "/pages/results.html";
            }, 15000);
            return;
        } else if (data.status === "finished") {
            console.log("Game finished! Redirecting to final results...");
            setTimeout(() => {
                window.location.href = "/pages/final.html";
            }, 15000);
            return;
        }
    } catch (error) {
        console.error("Error checking game status:", error);
    }

    // ✅ Retry every 5 seconds until round ends
    setTimeout(waitForRoundEnd, 5000);
}
