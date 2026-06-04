import { useEffect, useRef, useState } from 'react';

// countdown di `seconds` secondi; chiama onExpire UNA volta allo scadere.
function CountdownTimer({ seconds, onExpire }) {
  const [remaining, setRemaining] = useState(seconds);
  const onExpireRef = useRef(onExpire);
  const firedRef = useRef(false);

  // tengo il ref aggiornato all'ultima onExpire in un effetto (NON durante la render)
  useEffect(() => { onExpireRef.current = onExpire; }, [onExpire]);

  useEffect(() => {
    const deadline = Date.now() + seconds * 1000;
    const id = setInterval(() => {
      const left = Math.max(0, Math.round((deadline - Date.now()) / 1000));
      setRemaining(left);
      if (left <= 0 && !firedRef.current) {
        firedRef.current = true;
        clearInterval(id);
        onExpireRef.current(); // auto-submit allo scadere
      }
    }, 250);
    return () => clearInterval(id); // cleanup
  }, [seconds]);

  return <div><b>Time left: {remaining}s</b></div>;
}

export default CountdownTimer;
