import React, { useState, useEffect } from "react";
import useEventListener from "@use-it/event-listener";

export const SettingsPage = () => {
  const [nTestTrials, setNTestTrials] = useState(() => {
    const v = localStorage.getItem("nTestTrials");
    return v ? Number(v) : 400;
  });
  const [nTrainTrials, setNTrainTrials] = useState(() => {
    const v = localStorage.getItem("nTrainTrials");
    return v ? Number(v) : 20;
  });
  const [sameKey, setSameKey] = useState(() => {
    const v = localStorage.getItem("sameKey");
    return v ? String(v).toUpperCase() : "J";
  });
  const [diffKey, setDiffKey] = useState(() => {
    const v = localStorage.getItem("diffKey");
    return v ? String(v).toUpperCase() : "F";
  });

  const handleTestTrialsChange = (event) => {
    var n = event.target.value.replace("-", "");
    setNTestTrials(n);
    localStorage.setItem("nTestTrials", n);
  };

  const handleTrainTrialsChange = (event) => {
    var n = event.target.value.replace("-", "");
    setNTrainTrials(n);
    localStorage.setItem("nTrainTrials", n);
  };

  const handleSameKeyChange = (event) => {
    setSameKey(event.target.value.toUpperCase());
    localStorage.setItem("sameKey", event.target.value.toUpperCase());
  };

  const handleDiffKeyChange = (event) => {
    setDiffKey(event.target.value.toUpperCase());
    localStorage.setItem("diffKey", event.target.value.toUpperCase());
  };

  const handlerSameKeyUp = ({ key }) => {
    const k = String(key).toUpperCase();
    setSameKey(k);
    localStorage.setItem("sameKey", k);
  };

  const handlerDiffKeyUp = ({ key }) => {
    const k = String(key).toUpperCase();
    setDiffKey(k);
    localStorage.setItem("diffKey", k);
  };

  const [activeField, setActiveField] = useState(null);

  const handleGlobalKeyUp = (e) => {
    if (!activeField) return;
    const k = String(e.key).toUpperCase();
    if (activeField === "same") {
      setSameKey(k);
      localStorage.setItem("sameKey", k);
    } else if (activeField === "diff") {
      setDiffKey(k);
      localStorage.setItem("diffKey", k);
    }
  };

  useEventListener("keyup", handleGlobalKeyUp);

  return (
    <div className="settingsTable">
      <table>
        <tbody>
          <tr>
            <td className="settingsRowText">Number of train trials</td>
            <td className="settingsRow">
              <input
                className="settingsInput"
                type="number"
                min="0"
                placeholder="Trials"
                value={nTrainTrials}
                onChange={handleTrainTrialsChange}
              />
            </td>
          </tr>
          <tr>
            <td className="settingsRowText">Number of test trials</td>
            <td className="settingsRow">
              <input
                className="settingsInput"
                type="number"
                min="0"
                placeholder="Trials"
                value={nTestTrials}
                onChange={handleTestTrialsChange}
              />
            </td>
          </tr>
          <tr>
            <td className="settingsRowText">Same colors key</td>
            <td className="settingsRow">
              <input
                className="settingsInput"
                type="text"
                placeholder="Press desired key"
                value={sameKey}
                onChange={handleSameKeyChange}
                onKeyUp={handlerSameKeyUp}
                onFocus={() => setActiveField("same")}
                onBlur={() => setActiveField(null)}
              />
            </td>
          </tr>
          <tr>
            <td className="settingsRowText"> Different colors key</td>
            <td className="settingsRow">
              <input
                className="settingsInput"
                type="text"
                placeholder="Press desired key"
                value={diffKey}
                onChange={handleDiffKeyChange}
                onKeyUp={handlerDiffKeyUp}
                onFocus={() => setActiveField("diff")}
                onBlur={() => setActiveField(null)}
              />
            </td>
          </tr>
        </tbody>
      </table>
      <p style={{ marginTop: "2em", color: "#3c763d", textAlign: "center" }}>
        Changes are saved automatically
      </p>
    </div>
  );
};
