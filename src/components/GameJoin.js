import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const GameJoin = () => {
    const [gameId, setGameId] = useState("");
    const navigate = useNavigate();

    const joinGame = async () => {
        const response = await fetch("https://numbers-game-server-sdk-kpah.vercel.app/game/join", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ game_id: gameId }),
        });
        const data = await response.json();

        if (response.ok) {
            navigate(`/game/${gameId}/${data.player_id}`);
        } else {
            alert(data.error);
        }
    };

    return (
        <div>
            <h2>Join a Game</h2>
            <input type="text" placeholder="Enter Game ID" value={gameId} onChange={(e) => setGameId(e.target.value)} />
            <button onClick={joinGame}>Join</button>
        </div>
    );
};

export default GameJoin;
