document.getElementById("join-game").addEventListener("click", async function () {
    const playerName = document.getElementById("player-name").value.trim();
    const gameId = document.getElementById("game-id").value.trim();

    if (!playerName || !gameId) {
        alert("Please enter both your name and the Game ID.");
        return;
    }

    // Generate a unique player ID (random 6-character string)
    const playerId = Math.random().toString(36).substr(2, 6);

    try {
        const response = await fetch("https://numbers-game-server-sdk-kpah.vercel.app/game/join", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ 
                game_id: gameId,
                player_name: playerName
            })
        });

        const data = await response.json();

        if (response.ok) {
            // ✅ Use sessionStorage to store session-specific data
            sessionStorage.setItem("gameId", gameId);
            sessionStorage.setItem("playerId", playerId);
            sessionStorage.setItem("playerName", playerName);

            // ✅ Redirect to waiting screen
            window.location.href = "/pages/waiting.html";
        } else {
            alert("Error joining game: " + data.error);
        }
    } catch (error) {
        alert("Failed to join game. Please try again.");
        console.error("Join game error:", error);
    }
});
