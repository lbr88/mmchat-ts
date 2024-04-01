import React, { useEffect, useState } from 'react';

const App = () => {
  const [botInfo, setBotInfo] = useState(null);

  useEffect(() => {
    fetch('/bot-info')
      .then(response => response.json())
      .then(data => setBotInfo(data));
  }, []);

  return (
    <div>
      {botInfo ? (
        <div>
          <h1>Bot Info</h1>
          <pre>{JSON.stringify(botInfo, null, 2)}</pre>
        </div>
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
};

export default App;