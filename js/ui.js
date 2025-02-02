document.getElementById("join-game").addEventListener("click", async function () {
    const playerName = document.getElementById("player-name").value.trim();
    const gameId = document.getElementById("game-id").value.trim();

    if (!playerName || !gameId) {
        alert("Please enter both your name and the Game ID.");
        return;
    }

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
        console.log("Join response:", data); // ✅ Debugging

        if (response.ok && data.player_id) {
            sessionStorage.setItem("gameId", gameId);
            sessionStorage.setItem("playerId", data.player_id); // ✅ Use server-generated ID
            sessionStorage.setItem("playerName", playerName);

            window.location.href = "/pages/waiting.html";
        } else {
            alert("Error joining game: " + (data.error || "Unknown error"));
        }
    } catch (error) {
        alert("Failed to join game. Please try again.");
        console.error("Join game error:", error);
    }
});
