import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const attendanceDays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const defaultSchedule = attendanceDays.reduce((schedule, day) => ({
  ...schedule,
  [day]: { enabled: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"].includes(day), startTime: "08:00", endTime: "17:00" }
}), {});

function AddChild() {
  const [name, setName] = useState("");
  const [dob, setDob] = useState("");
  const [room, setRoom] = useState("");
  const [rooms, setRooms] = useState([]);
  const [normalSchedule, setNormalSchedule] = useState(defaultSchedule);

  const navigate = useNavigate();

  useEffect(() => {
    axios.get("http://localhost:4000/rooms")
      .then(response => setRooms(Array.isArray(response.data) ? response.data : []))
      .catch(error => console.error(error));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    await axios.post("http://localhost:4000/children", {
      name,
      dob,
      room,
      normalSchedule
    });

    navigate("/children");
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>Add Child</h1>

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: 10 }}>
          <label>Name:</label><br />
          <input 
            type="text" 
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>

        <div style={{ marginBottom: 10 }}>
          <label>Date of Birth:</label><br />
          <input 
            type="date" 
            value={dob}
            onChange={(e) => setDob(e.target.value)}
            required
          />
        </div>

        <div style={{ marginBottom: 10 }}>
          <label>Room:</label><br />
          <select
            value={room}
            onChange={(e) => setRoom(e.target.value)}
            required
          >
            <option value="">Select room</option>
            {rooms.map(roomOption => <option key={roomOption._id} value={roomOption.name}>{roomOption.name}</option>)}
          </select>
        </div>

        <fieldset className="staff-days-fieldset">
          <legend>Attendance Days and Times</legend>
          {attendanceDays.map(day => (
            <div className="setting-day-row" key={day}>
              <label className="day-option">
                <input
                  type="checkbox"
                  checked={normalSchedule[day].enabled}
                  onChange={() => setNormalSchedule(current => ({
                    ...current,
                    [day]: { ...current[day], enabled: !current[day].enabled }
                  }))}
                />
                {day}
              </label>
              {normalSchedule[day].enabled && (
                <span className="day-times">
                  <input type="time" value={normalSchedule[day].startTime} onChange={event => setNormalSchedule(current => ({ ...current, [day]: { ...current[day], startTime: event.target.value } }))} required />
                  <span>to</span>
                  <input type="time" value={normalSchedule[day].endTime} onChange={event => setNormalSchedule(current => ({ ...current, [day]: { ...current[day], endTime: event.target.value } }))} required />
                </span>
              )}
            </div>
          ))}
        </fieldset>

        <button type="submit">Add Child</button>
      </form>
    </div>
  );
}

export default AddChild;
