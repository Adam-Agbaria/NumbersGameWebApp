document.getElementById("join-game").addEventListener("click", async function () {
    const playerName = document.getElementById("player-name").value.trim();
    const gameId = document.getElementById("game-id").value.trim();

    if (!playerName || !gameId) {
        alert("Please enter both your name and the Game ID.");
        return;
    }

    // Generate a unique player ID (UUID-like short ID)
    const playerId = Math.random().toString(36).substr(2, 6);

    const response = await fetch("https://numbers-game-server-sdk-kpah.vercel.app/game/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
            game_id: gameId,
            player_id: playerId  
         })
    });

    const data = await response.json();

    if (response.ok) {
        // Store game and player details for later use
        localStorage.setItem("gameId", gameId);
        localStorage.setItem("playerId", playerId);
        localStorage.setItem("playerName", playerName);

        // Redirect to waiting screen
        window.location.href = "waiting.html";
    } else {
        alert("Error joining game: " + data.error);
    }
});
