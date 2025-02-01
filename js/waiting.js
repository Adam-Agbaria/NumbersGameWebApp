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
        const response = await fetch(`https://numbers-game-server-sdk-kpah.vercel.app/game/status/${gameId}`);
        const data = await response.json();

        if (data.status === "started") {
            console.log("Game started! Redirecting...");
            window.location.href = "/pages/game.html";  
            return;
        }
    } catch (error) {
        console.error("Error checking game status:", error);
    }

    // **Throttle requests:**
    // ✅ Only check if the tab is active
    if (document.visibilityState === "visible") {
        setTimeout(() => checkGameStatus(gameId), 5000); 
    } else {
        console.log("Tab is inactive. Pausing status check.");
    }
}
