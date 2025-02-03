document.addEventListener("DOMContentLoaded", () => {
    const gameId = sessionStorage.getItem("gameId");

    if (!gameId) {
        document.body.innerHTML = "<h2>Error: No game found.</h2>";
        return;
    }

    document.getElementById("game-id").innerText = gameId;

    checkGameStatus(gameId);
});

async function checkGameStatus() {
    const gameId = sessionStorage.getItem("gameId");

    try {
        const response = await fetch(`/game/status/${gameId}`);
        const data = await response.json();

        if (response.ok) {
            console.log("✅ Game status:", data.status);

            if (data.status === "finished") {
                window.location.href = "/pages/final.html";
            } else if (data.status === "round_finished") {
                window.location.href = "/pages/results.html";
            } else {
                setTimeout(checkGameStatus, 4000); // 🔄 Retry after 4s
            }
        } else {
            console.error("❌ Error checking game status:", data.error);
            setTimeout(checkGameStatus, 4000); // 🔄 Retry after 4s
        }
    } catch (error) {
        console.error("❌ Network error:", error);
        setTimeout(checkGameStatus, 4000); // 🔄 Retry after 4s
    }
}

document.addEventListener("DOMContentLoaded", checkGameStatus);


document.addEventListener("DOMContentLoaded", () => {
    const gameId = sessionStorage.getItem("gameId");

    if (!gameId) {
        document.body.innerHTML = "<h2>Error: No game found.</h2>";
        return;
    }

    document.getElementById("game-id").innerText = gameId;
    waitForRoundEnd(gameId);
});

