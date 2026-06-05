// istruzioni di gioco
function Instructions() {
  return (
    <div>
      <h2>How to play 🚇</h2>
      <p>Last Race is a single-player game on a fixed metro network. Plan smart, ride fast, grab the coins!</p>
      <ol>
        <li><b>Setup</b>: look at the full network map (stations, segments, lines).</li>
        <li><b>Planning</b>: build a route from the assigned start to the destination. Rules:
          <ul>
            <li>start and destination are random;</li>
            <li>you have 90 seconds ⏱️;</li>
            <li>select the correct segments in the right order from the list;</li>
            <li>each segment is bidirectional and can be selected only once;</li>
            <li>line changes are allowed only at interchange stations;</li>
            <li>the route must start and end at the assigned stations.</li>
          </ul>
        </li>
        <li><b>Execution</b>: the app checks your route:
          <ul>
            <li>{'→'} if correct: good luck! For each segment a random event adds or removes coins (between -4 and +4 per event);</li>
            <li>{'→'} if wrong: ouch! An invalid or incomplete route scores 0 coins.</li>
          </ul>
        </li>
        <li><b>Result</b>: each game starts with 20 coins; your score is the remaining coins (never below 0).</li>
      </ol>
      <p>Log in, hop on, and climb the ranking! 🏆</p>
    </div>
  );
}

export default Instructions;
