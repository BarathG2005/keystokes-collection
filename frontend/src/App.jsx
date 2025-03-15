import React, { useState, useRef } from 'react';

const keyboardMapping = {
  'q': [0, 0], 'w': [1, 0], 'e': [2, 0], 'r': [3, 0], 't': [4, 0],
  'y': [5, 0], 'u': [6, 0], 'i': [7, 0], 'o': [8, 0], 'p': [9, 0],
  'a': [0.5, 1], 's': [1.5, 1], 'd': [2.5, 1], 'f': [3.5, 1], 'g': [4.5, 1],
  'h': [5.5, 1], 'j': [6.5, 1], 'k': [7.5, 1], 'l': [8.5, 1],
  'z': [1, 2], 'x': [2, 2], 'c': [3, 2], 'v': [4, 2], 'b': [5, 2],
  'n': [6, 2], 'm': [7, 2]
};

function App() {
  const [events, setEvents] = useState([]);
  const [text, setText] = useState("");
  const currentKeys = useRef({});

  // Update the text area value
  const handleTextChange = (e) => {
    setText(e.target.value);
  };

  // Record keydown events
  const handleKeyDown = (e) => {
    if (currentKeys.current[e.code] !== undefined) return;

    const eventObj = {
      key: e.key,
      code: e.code,
      downTime: Date.now(),
      upTime: null,
    };

    setEvents((prevEvents) => {
      const newEvents = [...prevEvents, eventObj];
      currentKeys.current[e.code] = newEvents.length - 1;
      return newEvents;
    });
  };

  // Record keyup events
  const handleKeyUp = (e) => {
    const index = currentKeys.current[e.code];
    if (index !== undefined) {
      setEvents((prevEvents) => {
        const newEvents = [...prevEvents];
        newEvents[index] = { ...newEvents[index], upTime: Date.now() };
        return newEvents;
      });
      delete currentKeys.current[e.code];
    }
  };

  // Compute averages
  const dwellTimes = events
    .filter((ev) => ev.upTime !== null)
    .map((ev) => ev.upTime - ev.downTime);
  const dwellAvg = dwellTimes.length
    ? (dwellTimes.reduce((a, b) => a + b, 0) / dwellTimes.length).toFixed(2)
    : 0;

  const flightTimes = [];
  for (let i = 0; i < events.length - 1; i++) {
    if (events[i].upTime && events[i + 1].downTime) {
      flightTimes.push(events[i + 1].downTime - events[i].upTime);
    }
  }
  const flightAvg = flightTimes.length
    ? (flightTimes.reduce((a, b) => a + b, 0) / flightTimes.length).toFixed(2)
    : 0;

  const trajDistances = [];
  for (let i = 0; i < events.length - 1; i++) {
    const key1 = events[i].key.toLowerCase();
    const key2 = events[i + 1].key.toLowerCase();
    if (keyboardMapping[key1] && keyboardMapping[key2]) {
      const [x1, y1] = keyboardMapping[key1];
      const [x2, y2] = keyboardMapping[key2];
      const dist = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
      trajDistances.push(dist);
    }
  }
  const trajAvg = trajDistances.length
    ? (trajDistances.reduce((a, b) => a + b, 0) / trajDistances.length).toFixed(2)
    : 0;

  // Send metrics to the backend using fetch (you can switch to axios if preferred)
  // const saveToDatabase = async () => {
  //   if (events.length === 0) {
  //     alert("No keystroke data to save!");
  //     return;
  //   }
  //   const dataToSend = { dwellAvg, flightAvg, trajAvg };
  //   try {
  //     const response = await fetch('http://localhost:8000/api/save-metrics', {
  //       method: 'POST',
  //       headers: { 'Content-Type': 'application/json' },
  //       body: JSON.stringify(dataToSend),
  //     });
  //     const result = await response.json();
  //     console.log('Metrics saved:', result);
  //     alert('Keystroke metrics saved to the database!');
  //     // Clear events and reset text field so the placeholder appears
  //     setEvents([]);
  //     setText("");
  //   } catch (error) {
  //     console.error('Error saving metrics:', error);
  //     alert('Error saving metrics. See console for details.');
  //   }
  // };
  const saveToDatabase = async () => {
    if (events.length === 0) {
      alert("No keystroke data to save!");
      return;
    }
  
    const dataToSend = { dwellAvg,flightAvg,trajAvg};
  
    try {
      const response = await fetch("http://localhost:8000/api/save-metrics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dataToSend),
      });
  
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
  
      const result = await response.json();
      console.log("Metrics saved:", result);
      alert("Keystroke metrics saved to the database!");
  
      // Clear input fields after saving
      setEvents([]);
      setText("");
    } catch (error) {
      console.error("Error saving metrics:", error);
      alert("Error saving metrics. See console for details.");
    }
  };

  return (
    <div className="p-8 bg-gray-200 min-h-screen text-gray-900 transition-all duration-500">
      <h1 className="text-4xl font-extrabold mb-6 text-center drop-shadow-lg">
        Keystroke Dynamics Metrics
      </h1>
      <p className="mb-6 text-center text-lg">
        Type in the box below and observe the computed averages:
      </p>
      <textarea
        rows="5"
        cols="50"
        value={text}
        onChange={handleTextChange}
        onKeyDown={handleKeyDown}
        onKeyUp={handleKeyUp}
        placeholder="Start typing here..."
        className="w-full p-4 mb-6 border-2 border-gray-400 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-4 focus:ring-yellow-400 transition-all duration-300"
      />
      <div className="mb-6">
        <p className="mb-2 text-xl">
          <span className="font-bold text-yellow-600">Dwell Average:</span> {dwellAvg} ms
        </p>
        <p className="mb-2 text-xl">
          <span className="font-bold text-yellow-600">Flight Average:</span> {flightAvg} ms
        </p>
        <p className="mb-2 text-xl">
          <span className="font-bold text-yellow-600">Trajectory Average:</span> {trajAvg}
        </p>
      </div>
      <button
        onClick={saveToDatabase}
        className="mb-8 px-6 py-3 bg-yellow-500 text-gray-900 rounded-full shadow-lg hover:bg-yellow-600 focus:outline-none focus:ring-4 focus:ring-yellow-300 transition-all duration-300"
      >
        Save to Database
      </button>
      <div className="max-h-80 overflow-auto border-t-2 border-gray-400 pt-4">
        <h2 className="text-2xl font-semibold mb-4 text-center">Keystroke Events</h2>
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-800">
              <th className="border border-gray-600 p-2 text-white">Key</th>
              <th className="border border-gray-600 p-2 text-white">Code</th>
              <th className="border border-gray-600 p-2 text-white">Down Time</th>
              <th className="border border-gray-600 p-2 text-white">Up Time</th>
            </tr>
          </thead>
          <tbody>
            {events.map((ev, index) => (
              <tr key={index} className="hover:bg-gray-300 transition-all duration-300">
                <td className="border border-gray-400 p-2">{ev.key}</td>
                <td className="border border-gray-400 p-2">{ev.code}</td>
                <td className="border border-gray-400 p-2">{ev.downTime}</td>
                <td className="border border-gray-400 p-2">{ev.upTime}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default App;
