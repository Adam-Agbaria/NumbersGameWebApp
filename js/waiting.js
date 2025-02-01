document.addEventListener("DOMContentLoaded", () => {
    const gameId = sessionStorage.getItem("gameId");

    if (!gameId) {
        document.body.innerHTML = "<h2>Error: No game found.</h2>";
        return;
    }

    document.getElementById("game-id").innerText = gameId;
});


async function checkGameStatus() {
    const response = await fetch(`https://numbers-game-server-sdk-kpah.vercel.app/game/status/${gameId}`);
    const data = await response.json();

    if (data.status === "started") {
        window.location.href = "game.html";
    } else {
        setTimeout(checkGameStatus, 3000);
    }
}

checkGameStatus();
