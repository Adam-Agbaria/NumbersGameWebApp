const TIME_LIMIT = 10; // X seconds to pick a number
let timeLeft = TIME_LIMIT;
let totalRounds = 0;
let currentRound = 1;

// Fetch total rounds from the server
async function fetchTotalRounds() {
    const gameId = localStorage.getItem("gameId");

    const response = await fetch(`https://numbers-game-server-sdk-kpah.vercel.app/game/results?game_id=${gameId}`);
    const data = await response.json();

    if (response.ok) {
        totalRounds = data.total_rounds;
    } else {
        alert("Error fetching game details: " + data.error);
    }
}

fetchTotalRounds();

document.getElementById("time-left").innerText = timeLeft;

// Start countdown
const timer = setInterval(() => {
    timeLeft--;
    document.getElementById("time-left").innerText = timeLeft;

    if (timeLeft === 0) {
        clearInterval(timer);
        submitNumber();
    }
}, 1000);

// Submit number to backend
document.getElementById("submit-number").addEventListener("click", submitNumber);

async function submitNumber() {
    const gameId = localStorage.getItem("gameId");
    const playerNumber = document.getElementById("player-number").value;

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
}

async function fetchFinalWinner() {
    const gameId = localStorage.getItem("gameId");

    const response = await fetch(`https://numbers-game-server-sdk-kpah.vercel.app/game/results?game_id=${gameId}`);
    const data = await response.json();

    if (!response.ok) {
        document.getElementById("winner-message").innerText = "Error fetching final results.";
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
}

// Run only if on final.html
if (document.getElementById("winner-message")) {
    fetchFinalWinner();
}

