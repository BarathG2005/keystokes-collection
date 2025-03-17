import React, { useState, useRef } from 'react';

function App() {
  // State for recording the typed text and keystroke events
  const [text, setText] = useState("");
  const [metrics, setMetrics] = useState(null);
  // Array to store keystroke events
  const [events, setEvents] = useState([]);
  // A ref object to track active keys so that each keydown is only recorded once until keyup
  const currentKeys = useRef({});

  // Handler to update the text area
  const handleTextChange = (e) => {
    setText(e.target.value);
  };

  // Record keydown event if not already active for that key
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
      // Save the index of the key event in our reference object
      currentKeys.current[e.code] = newEvents.length - 1;
      return newEvents;
    });
  };

  // On keyup, update the corresponding event with the release time
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

  // Function to compute the five scores
  const calculateMetrics = () => {
    // Filter out events that have both a press and a release time
    const validEvents = events.filter(ev => ev.upTime !== null);
    if (validEvents.length === 0) {
      alert("Not enough keystroke data to calculate metrics.");
      return;
    }

    // 1. Average Dwell Time (ms)
    const dwellTimes = validEvents.map(ev => ev.upTime - ev.downTime);
    const avgDwellTime = dwellTimes.reduce((acc, cur) => acc + cur, 0) / dwellTimes.length;

    // 2. Average Flight Time (ms)
    const flightTimes = [];
    for (let i = 0; i < validEvents.length - 1; i++) {
      // Calculate the interval between the release of the current key and the press of the next key
      const flight = validEvents[i + 1].downTime - validEvents[i].upTime;
      flightTimes.push(flight);
    }
    const avgFlightTime = flightTimes.length ? (flightTimes.reduce((acc, cur) => acc + cur, 0) / flightTimes.length) : 0;

    // 3. Flight Time Standard Deviation (ms)
    let flightStdDev = 0;
    if (flightTimes.length) {
      const flightMean = avgFlightTime;
      const variance = flightTimes.reduce((sum, ft) => sum + Math.pow(ft - flightMean, 2), 0) / flightTimes.length;
      flightStdDev = Math.sqrt(variance);
    }

    // 4. Words Per Minute (WPM)
    // Use the total time from the first key press to the last key release
    const totalTimeSec = (validEvents[validEvents.length - 1].upTime - validEvents[0].downTime) / 1000;
    // Approximate word count (1 word ≈ 5 characters)
    const wordCount = text.length / 5;
    const wpm = totalTimeSec > 0 ? (wordCount * 60) / totalTimeSec : 0;

    // 5. Human-Like Typing Score (H-Score)
    // Lower variability (i.e. small std deviation) results in a lower score.
    const hScore = 1 / (flightStdDev + 1);

    // Create the computed metrics object (with rounded values)
    const computedMetrics = {
      avgDwellTime: avgDwellTime.toFixed(2),
      avgFlightTime: avgFlightTime.toFixed(2),
      flightStdDev: flightStdDev.toFixed(2),
      wpm: wpm.toFixed(2),
      hScore: hScore.toFixed(4),
    };
    
    setMetrics(computedMetrics);

    // Send the metrics data to the API endpoint
    sendToAPI(computedMetrics);
  };

  // Function to send computed metrics to API endpoint
  const sendToAPI = async (data) => {
    try {
      const response = await fetch("https://keystokes-collection.vercel.app/api/save-metrics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const result = await response.json();
      console.log("Metrics saved:", result);
      alert("Keystroke metrics saved to the database!");
    } catch (error) {
      console.error("Error saving metrics:", error);
      alert("Error saving metrics. See console for details.");
    }
  };

  // Reset the text and keystroke events along with metrics
  const resetData = () => {
    setText("");
    setEvents([]);
    setMetrics(null);
    currentKeys.current = {};
  };

  return (
    <div className="p-8 bg-gray-100 min-h-screen text-gray-900">
      <h1 className="text-4xl font-bold mb-6 text-center">Keystroke Dynamics Metrics</h1>
      <p className="text-center mb-4">Type in the box below to record your keystroke dynamics. When finished, click "Calculate Metrics".</p>
      <textarea
        value={text}
        onChange={handleTextChange}
        onKeyDown={handleKeyDown}
        onKeyUp={handleKeyUp}
        placeholder="Start typing here..."
        className="w-full p-4 border-2 rounded mb-4 focus:outline-none focus:ring-2 focus:ring-blue-400"
        rows="6"
      />
      <div className="flex justify-center space-x-4 mb-6">
        <button
          onClick={calculateMetrics}
          className="px-6 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition"
        >
          Calculate Metrics
        </button>
        <button
          onClick={resetData}
          className="px-6 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition"
        >
          Reset
        </button>
      </div>
      {metrics && (
        <div className="max-w-md mx-auto bg-white p-6 rounded shadow">
          <h2 className="text-2xl font-bold mb-4 text-center">Results</h2>
          <p><strong>Average Dwell Time:</strong> {metrics.avgDwellTime} ms</p>
          <p><strong>Average Flight Time:</strong> {metrics.avgFlightTime} ms</p>
          <p><strong>Flight Time Std. Dev.:</strong> {metrics.flightStdDev} ms</p>
          <p><strong>Words Per Minute (WPM):</strong> {metrics.wpm}</p>
          <p><strong>Human-Like Typing Score (H-Score):</strong> {metrics.hScore}</p>
        </div>
      )}
      <div className="mt-8">
        <h3 className="text-xl font-bold mb-2 text-center">Keystroke Events (Debug Info)</h3>
        <div className="max-h-60 overflow-auto border p-2">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="bg-gray-800 text-white">
                <th className="border p-1">Key</th>
                <th className="border p-1">Code</th>
                <th className="border p-1">Down Time</th>
                <th className="border p-1">Up Time</th>
              </tr>
            </thead>
            <tbody>
              {events.map((ev, index) => (
                <tr key={index} className="hover:bg-gray-200">
                  <td className="border p-1">{ev.key}</td>
                  <td className="border p-1">{ev.code}</td>
                  <td className="border p-1">{ev.downTime}</td>
                  <td className="border p-1">{ev.upTime ? ev.upTime : "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default App;
