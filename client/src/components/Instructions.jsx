// istruzioni di gioco
function Instructions() {
  return (
    <div>
      <h2>How to play</h2>
      <p>Last Race is a single-player game on a fixed metro network. Each game starts with 20 coins.</p>
      <ol>
        <li><b>Setup</b>: look at the full network map (stations, connections, lines).</li>
        <li><b>Planning</b>: you get a random start and destination (at least 3 stops apart). You have 90 seconds to build a route by selecting adjacent segments in sequence, then submit it.</li>
        <li><b>Execution</b>: the server checks your route; for each segment a random event adds or removes coins (between -4 and +4).</li>
        <li><b>Result</b>: your score is the remaining coins (never below 0). An invalid or incomplete route scores 0.</li>
      </ol>
      <p>Log in to play and to see the general ranking.</p>
    </div>
  );
}

export default Instructions;
