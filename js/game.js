//const TIME_LIMIT = 20; // 20 seconds per round
//let timeLeft = TIME_LIMIT;
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

    //document.getElementById("time-left").innerText = timeLeft;

    // ✅ Restore picked number if already submitted
    if (sessionStorage.getItem("hasPicked") === "true") {
        hasPicked = true;
        const playerNumber = sessionStorage.getItem("playerNumber");

        // Disable input and button
        document.getElementById("player-number").disabled = true;
        document.getElementById("submit-number").disabled = true;

        // Show confirmation message
        document.querySelector(".container").innerHTML += `
            <p class="selected-message">You selected: <strong>${playerNumber}</strong>. Waiting for the round to finish...</p>
        `;

    }

    fetchTotalRounds();
    //startCountdown();
});


// ✅ Function to start the countdown timer
/*
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
*/

// ✅ Submit number to backend and show confirmation
// ✅ Submit number to backend and show confirmation
document.getElementById("submit-number").addEventListener("click", () => {
    const playerNumber = document.getElementById("player-number").value.trim();

    if (!isValidNumber(playerNumber)) {
        alert("Please enter a valid number between 0 and 100.");
        return;
    }

    submitNumber(parseFloat(playerNumber));
});

// ✅ Validate if the input is a number between 0 and 100
function isValidNumber(value) {
    const num = parseFloat(value);
    return !isNaN(num) && num >= 0 && num <= 100;
}

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

            // ✅ Save in sessionStorage to prevent re-picking after refresh
            sessionStorage.setItem("hasPicked", "true");
            sessionStorage.setItem("playerNumber", playerNumber);
            sessionStorage.setItem("lastRound", data.current_round);

            // Disable input and button
            document.getElementById("player-number").disabled = true;
            document.getElementById("submit-number").disabled = true;

            // Show selection confirmation
            document.querySelector(".container").innerHTML += `
                <p class="selected-message">You selected: <strong>${playerNumber}</strong>. Waiting for the round to finish...</p>
            `;

            // ✅ Now we correctly call `waitForRoundEnd()`
            waitForRoundEnd();
        } else {
            alert("Error submitting number: " + data.error);
        }
    } catch (error) {
        console.error("Error submitting number:", error);
        alert("Failed to submit number. Please try again.");
    }
}




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

        if (!response.ok) {
            console.warn(`⚠️ Server returned error ${response.status}. Retrying in 4s...`);
            setTimeout(waitForRoundEnd, 4000);
            return;
        }

        const data = await response.json();
        console.log("📡 Game Status Response:", data);

        // ✅ Check if we started a new round
        if (data.current_round > sessionStorage.getItem("lastRound")) {
            console.log("🔄 New round detected! Resetting selection.");
            sessionStorage.removeItem("hasPicked"); // ✅ Reset selection
            sessionStorage.removeItem("playerNumber"); // ✅ Clear old selection
            sessionStorage.setItem("lastRound", data.current_round); // ✅ Save the new round number
        }

        if (data.status === "round_finished" || data.status === "round_ended") {
            console.log("🎉 Round finished! Redirecting to results...");
            sessionStorage.removeItem("hasPicked");
            window.location.href = "/pages/results.html";
        } else if (data.status === "finished") {
            console.log("🏆 Game finished! Redirecting to final results...");
            window.location.href = "/pages/final.html";
        } else {
            console.log("⏳ Round not finished yet. Checking again in 4s...");
            setTimeout(waitForRoundEnd, 4000);
        }
    } catch (error) {
        console.error("❌ Network error or timeout:", error);
        setTimeout(waitForRoundEnd, 4000);
    }
}

// ✅ Start checking status automatically when the page loads
document.addEventListener("DOMContentLoaded", () => {
    waitForRoundEnd();
});
