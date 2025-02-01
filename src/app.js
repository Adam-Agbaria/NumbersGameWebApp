import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import GameJoin from "./components/GameJoin";
import GamePlay from "./components/GamePlay";
import GameResults from "./components/GameResults";

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<GameJoin />} />
                <Route path="/game/:gameId/:playerId" element={<GamePlay />} />
                <Route path="/game/results/:gameId" element={<GameResults />} />
            </Routes>
        </Router>
    );
}

export default App;
