const TIME_LIMIT = 10; // X seconds to pick a number
let timeLeft = TIME_LIMIT;
let totalRounds = 0;
let currentRound = 1;

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

// Call `fetchTotalRounds()` only after game ends
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

// Function to start the countdown timer
function startCountdown() {
    const timer = setInterval(() => {
        timeLeft--;
        document.getElementById("time-left").innerText = timeLeft;

        if (timeLeft === 0) {
            clearInterval(timer);
            submitNumber();
        }
    }, 1000);
}

// Submit number to backend
document.getElementById("submit-number").addEventListener("click", submitNumber);

async function submitNumber() {
    const gameId = sessionStorage.getItem("gameId");
    const playerNumber = document.getElementById("player-number").value;

    if (!totalRounds) {
        console.log("Total rounds not loaded yet. Waiting...");
        setTimeout(submitNumber, 2000); // ✅ Wait and retry
        return;
    }

    try {
        const response = await fetch("https://numbers-game-server-sdk-kpah.vercel.app/round/submit", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ game_id: gameId, number: playerNumber })
        });

        if (response.ok) {
            currentRound++;
            if (currentRound > totalRounds) {
                window.location.href = "final.html";
            } else {
                window.location.href = "results.html";
            }
        } else {
            alert("Error submitting number: " + (await response.json()).error);
        }
    } catch (error) {
        console.error("Error submitting number:", error);
        setTimeout(submitNumber, 2000); // ✅ Retry in case of network failure
    }
}

// Fetch final winner after the game ends
async function fetchFinalWinner() {
    const gameId = sessionStorage.getItem("gameId");

    try {
        const response = await fetch(`https://numbers-game-server-sdk-kpah.vercel.app/game/results?game_id=${gameId}`);
        const data = await response.json();

        if (!response.ok || data.error === "Game is still in progress") {
            console.log("Game is still running, waiting for results...");
            setTimeout(fetchFinalWinner, 5000); // ✅ Retry every 5 seconds
            return;
        }

        const roundResults = data.round_results;
        const winCount = {};

        for (const round in roundResults) {
            const winner = roundResults[round].winner;
            winCount[winner] = (winCount[winner] || 0) + 1;
        }

        let finalWinner = Object.keys(winCount).reduce((a, b) => (winCount[a] > winCount[b] ? a : b));

        document.getElementById("winner-message").innerText = `🏆 The overall winner is Player ${finalWinner} with ${winCount[finalWinner]} rounds won! 🎉`;

    } catch (error) {
        console.error("Error fetching final results:", error);
        setTimeout(fetchFinalWinner, 5000); // ✅ Retry in case of network issues
    }
}

// ✅ Run this only if we're on final.html
if (document.getElementById("winner-message")) {
    fetchFinalWinner();
}
