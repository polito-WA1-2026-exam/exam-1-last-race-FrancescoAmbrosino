// istruzioni di gioco
function Instructions() {
  return (
    <div>
      <h2>How to play</h2>
      <p>Last Race is a single-player game on a fixed metro network.</p>
      <ol>
        <li><b>Setup</b>: look at the full network map (stations, connections, lines).</li>
        <li><b>Planning</b>: build a route from the assigned start to the destination. Rules:
          <ul>
            <li>start and destination are random, at least 3 segments apart;</li>
            <li>you have 90 seconds (on expiry the route is auto-submitted as-is);</li>
            <li>pick segments from the full list, in the right sequence (the app validates them in order);</li>
            <li>each segment can be used only once;</li>
            <li>line changes are allowed only at interchange stations;</li>
            <li>the route must start and end at the assigned stations.</li>
          </ul>
        </li>
        <li><b>Execution</b>: the app checks your route; for each segment a random event adds or removes coins (between -4 and +4).</li>
        <li><b>Result</b>: each game starts with 20 coins; your score is the remaining coins (never below 0). An invalid or incomplete route scores 0.</li>
      </ol>
      <p>Log in to play and to see the general ranking.</p>
    </div>
  );
}

export default Instructions;
