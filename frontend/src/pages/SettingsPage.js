import { React, useState } from "react";
import useEventListener from "@use-it/event-listener";

export const SettingsPage = () => {
  const [nTestTrials, setNTestTrials] = useState(400);
  const [nTrainTrials, setNTrainTrials] = useState(20);
  const [sameKey, setSameKey] = useState("j");
  const [diffKey, setDiffKey] = useState("f");

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
    setSameKey(event.target.value);
  };

  const handleDiffKeyChange = (event) => {
    setDiffKey(event.target.value);
  };

  const handlerSameKeyUp = ({ key }) => {
    setSameKey(String(key));
    localStorage.setItem("sameKey", String(key));
  };

  const handlerDiffKeyUp = ({ key }) => {
    setDiffKey(String(key));
    localStorage.setItem("diffKey", String(key));
  };

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
                min="0"
                placeholder="Press Desired Key"
                value={localStorage.getItem("sameKey").toUpperCase()}
                onChange={handleSameKeyChange}
                onKeyUp={handlerSameKeyUp}
              />
            </td>
          </tr>
          <tr>
            <td className="settingsRowText"> Different colors key</td>
            <td className="settingsRow">
              <input
                className="settingsInput"
                type="text"
                min="0"
                placeholder="Press Desired Key"
                value={localStorage.getItem("diffKey").toUpperCase()}
                onChange={handleDiffKeyChange}
                onKeyUp={handlerDiffKeyUp}
              />
            </td>
          </tr>
        </tbody>
      </table>
      <p style={{ marginTop: "5em", color: "#3c763d", textAlign: "center  " }}>
        Changes are saved automatically
      </p>
    </div>
  );
};
