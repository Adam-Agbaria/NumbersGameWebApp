document.getElementById("join-game").addEventListener("click", async function () {
    const playerName = document.getElementById("player-name").value.trim();
    const gameId = document.getElementById("game-id").value.trim();
    const joinButton = document.getElementById("join-game");

    if (!playerName || !gameId) {
        alert("Please enter both your name and the Game ID.");
        return;
    }

    // ✅ Hide the button and show "Joining game..."
    joinButton.style.display = "none";  
    const message = document.createElement("p");
    message.id = "joining-message";
    message.innerText = "Joining game...";
    joinButton.parentNode.appendChild(message);

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
            sessionStorage.setItem("playerId", data.player_id);
            sessionStorage.setItem("playerName", playerName);

            // ✅ Redirect after successful join
            window.location.href = "/pages/waiting.html";
        } else {
            throw new Error(data.error || "Unknown error");
        }
    } catch (error) {
        alert("Error joining game: " + error.message);
        console.error("Join game error:", error);

        // ❌ Show button again if failed
        joinButton.style.display = "block";
        document.getElementById("joining-message").remove();
    }
});

