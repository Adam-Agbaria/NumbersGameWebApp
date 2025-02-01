document.getElementById("join-game").addEventListener("click", async function () {
    const playerName = document.getElementById("player-name").value.trim();
    const gameId = document.getElementById("game-id").value.trim();

    if (!playerName || !gameId) {
        alert("Please enter both name and game ID.");
        return;
    }

    const response = await fetch("https://numbers-game-server-sdk-kpah.vercel.app/game/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ game_id: gameId })
    });

    const data = await response.json();

    if (response.ok) {
        localStorage.setItem("gameId", gameId);
        localStorage.setItem("playerName", playerName);
        window.location.href = "waiting.html";
    } else {
        alert("Error joining game: " + data.error);
    }
});
