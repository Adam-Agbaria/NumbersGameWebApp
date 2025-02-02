document.addEventListener("DOMContentLoaded", () => {
    const gameId = sessionStorage.getItem("gameId");

    if (!gameId) {
        document.body.innerHTML = "<h2>Error: No game found.</h2>";
        return;
    }

    document.getElementById("game-id").innerText = gameId;

    checkGameStatus(gameId);
});

async function checkGameStatus(gameId) {
    try {
        const response = await fetch(`https://numbers-game-server-sdk-kpah.vercel.app/game/status/${gameId}`, {
            method: "GET",
            headers: { "Content-Type": "application/json" }
        });

        const data = await response.json();

        if (data.status === "started") {
            console.log("Game started! Redirecting...");
            window.location.href = "/pages/game.html";
            return;
        }
    } catch (error) {
        console.error("Error checking game status:", error);
    }

    // **Immediately check again after receiving response (long polling)**
    setTimeout(() => checkGameStatus(gameId), 100);
}

document.addEventListener("DOMContentLoaded", () => {
    const gameId = sessionStorage.getItem("gameId");

    if (!gameId) {
        document.body.innerHTML = "<h2>Error: No game found.</h2>";
        return;
    }

    document.getElementById("game-id").innerText = gameId;
    waitForRoundEnd(gameId);
});

async function waitForRoundEnd(gameId) {
    try {
        const response = await fetch(`https://numbers-game-server-sdk-kpah.vercel.app/game/status/${gameId}`, {
            method: "GET",
            headers: { "Content-Type": "application/json" }
        });

        const data = await response.json();

        if (data.status === "round_finished") {
            console.log("Round finished! Redirecting to results...");
            window.location.href = "/pages/results.html";
            return;
        } else if (data.status === "finished") {
            console.log("Game finished! Redirecting to final results...");
            window.location.href = "/pages/final.html";
            return;
        }
    } catch (error) {
        console.error("Error checking game status:", error);
    }

    // Retry every 5 seconds
    setTimeout(() => waitForRoundEnd(gameId), 5000);
}
