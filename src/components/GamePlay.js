import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

const GamePlay = () => {
    const { gameId, playerId } = useParams();
    const [number, setNumber] = useState("");
    const [message, setMessage] = useState("");
    const navigate = useNavigate();

    const submitNumber = async () => {
        const response = await fetch(`https://numbers-game-server-sdk-kpah.vercel.app/round/submit`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ game_id: gameId, player_id: playerId, number: parseInt(number) }),
        });

        const data = await response.json();

        if (response.ok) {
            setMessage("Number submitted successfully!");
        } else {
            setMessage(data.error);
        }
    };

    const calculateWinner = async () => {
        const response = await fetch(`https://numbers-game-server-sdk-kpah.vercel.app/round/calculate_winner`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ game_id: gameId }),
        });

        const data = await response.json();

        if (response.ok) {
            alert(`Winner: ${data.winner}, Average: ${data.average}`);
            if (data.current_round > 3) {
                navigate(`/game/results/${gameId}`);
            }
        } else {
            setMessage(data.error);
        }
    };

    return (
        <div>
            <h2>Playing Game {gameId}</h2>
            <input
                type="number"
                placeholder="Enter a number (0-100)"
                value={number}
                onChange={(e) => setNumber(e.target.value)}
            />
            <button onClick={submitNumber}>Submit</button>
            <button onClick={calculateWinner}>Calculate Winner</button>
            <p>{message}</p>
        </div>
    );
};

export default GamePlay;
