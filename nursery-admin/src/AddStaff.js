import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const settingDays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const defaultSchedule = settingDays.reduce((schedule, day) => ({
  ...schedule,
  [day]: { enabled: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"].includes(day), startTime: "09:00", endTime: "17:00" }
}), {});

function AddStaff() {
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [hourlyRate, setHourlyRate] = useState("");
  const [normalSchedule, setNormalSchedule] = useState(defaultSchedule);
  const [address, setAddress] = useState("");
  const [contactDetails, setContactDetails] = useState("");
  const [emergencyContactName, setEmergencyContactName] = useState("");
  const [emergencyContactPhone, setEmergencyContactPhone] = useState("");
  const [emergencyContactRelationship, setEmergencyContactRelationship] = useState("");
  const [qualificationLevel, setQualificationLevel] = useState("");

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    await axios.post("http://localhost:4000/staff", {
      name,
      role,
      hourlyRate: Number(hourlyRate),
      normalSchedule,
      address,
      contactDetails,
      emergencyContactName,
      emergencyContactPhone,
      emergencyContactRelationship,
      qualificationLevel
    });

    navigate("/staff"); // go back to staff list
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>Add Staff Member</h1>

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
          <label>Role:</label><br />
          <input 
            type="text" 
            value={role}
            onChange={(e) => setRole(e.target.value)}
            required
          />
        </div>

        <div style={{ marginBottom: 10 }}>
          <label>Address:</label><br />
          <textarea rows="4" value={address} onChange={event => setAddress(event.target.value)} />
        </div>

        <div style={{ marginBottom: 10 }}>
          <label>Contact Details:</label><br />
          <textarea value={contactDetails} onChange={event => setContactDetails(event.target.value)} />
        </div>

        <div style={{ marginBottom: 10 }}>
          <label>Qualification Level:</label><br />
          <select value={qualificationLevel} onChange={event => setQualificationLevel(event.target.value)}>
            <option value="">Select level</option>
            <option value="U">U</option>
            <option value="Level 2">Level 2</option>
            <option value="Level 3">Level 3</option>
            <option value="Level 4">Level 4</option>
            <option value="Level 5">Level 5</option>
            <option value="Level 6">Level 6</option>
          </select>
        </div>

        <div style={{ marginBottom: 10 }}>
          <label>Emergency Contact Name:</label><br />
          <input value={emergencyContactName} onChange={event => setEmergencyContactName(event.target.value)} />
        </div>

        <div style={{ marginBottom: 10 }}>
          <label>Emergency Contact Phone:</label><br />
          <input type="tel" value={emergencyContactPhone} onChange={event => setEmergencyContactPhone(event.target.value)} />
        </div>

        <div style={{ marginBottom: 10 }}>
          <label>Emergency Contact Relationship:</label><br />
          <input value={emergencyContactRelationship} onChange={event => setEmergencyContactRelationship(event.target.value)} />
        </div>

        <div style={{ marginBottom: 10 }}>
          <label>Hourly Rate (£):</label><br />
          <input 
            type="number" 
            value={hourlyRate}
            onChange={(e) => setHourlyRate(e.target.value)}
            required
          />
        </div>

        <fieldset className="staff-days-fieldset">
          <legend>Normal Setting Days and Times</legend>
          {settingDays.map(day => (
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

        <button type="submit">Add Staff</button>
      </form>
    </div>
  );
}

export default AddStaff;
