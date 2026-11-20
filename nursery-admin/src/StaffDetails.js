import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link, useParams } from "react-router-dom";

const settingDays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const createSchedule = (staffMember) => staffMember.normalSchedule || settingDays.reduce((schedule, day) => ({
  ...schedule,
  [day]: { enabled: (staffMember.normalDays || []).includes(day), startTime: staffMember.normalStartTime || "09:00", endTime: staffMember.normalEndTime || "17:00" }
}), {});

function StaffDetails() {
  const { staffId } = useParams();
  const [staffMember, setStaffMember] = useState(null);
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    axios.get(`http://localhost:4000/staff/${staffId}`)
      .then(response => setStaffMember({ ...response.data, normalSchedule: createSchedule(response.data) }))
      .catch(() => setError("Unable to load this staff member's information."));
  }, [staffId]);

  const handleSave = async (event) => {
    event.preventDefault();
    const response = await axios.put(`http://localhost:4000/staff/${staffMember._id}`, staffMember);
    setStaffMember(response.data);
    setEditing(false);
  };

  if (error) return <p>{error}</p>;
  if (!staffMember) return <p>Loading...</p>;

  return (
    <div className="details-page" style={{ padding: 20 }}>
      <Link to="/staff">Back to Staff</Link>
      <h1>{staffMember.name}</h1>
      <h2>Staff Information</h2>
      {editing ? (
        <form className="details-grid" onSubmit={handleSave}>
          <p>Name: <input value={staffMember.name} onChange={event => setStaffMember({ ...staffMember, name: event.target.value })} required /></p>
          <p>Role: <input value={staffMember.role} onChange={event => setStaffMember({ ...staffMember, role: event.target.value })} required /></p>
          <p>Hourly Rate: <input type="number" value={staffMember.hourlyRate} onChange={event => setStaffMember({ ...staffMember, hourlyRate: event.target.value })} required /></p>
          <fieldset className="staff-days-fieldset">
            <legend>Normal Setting Days and Times</legend>
            {settingDays.map(day => (
              <div className="setting-day-row" key={day}>
              <label className="day-option">
                <input
                  type="checkbox"
                  checked={staffMember.normalSchedule[day].enabled}
                  onChange={() => setStaffMember({
                    ...staffMember,
                    normalSchedule: {
                      ...staffMember.normalSchedule,
                      [day]: { ...staffMember.normalSchedule[day], enabled: !staffMember.normalSchedule[day].enabled }
                    }
                  })}
                />
                {day}
              </label>
              {staffMember.normalSchedule[day].enabled && (
                <span className="day-times">
                  <input type="time" value={staffMember.normalSchedule[day].startTime} onChange={event => setStaffMember({ ...staffMember, normalSchedule: { ...staffMember.normalSchedule, [day]: { ...staffMember.normalSchedule[day], startTime: event.target.value } } })} required />
                  <span>to</span>
                  <input type="time" value={staffMember.normalSchedule[day].endTime} onChange={event => setStaffMember({ ...staffMember, normalSchedule: { ...staffMember.normalSchedule, [day]: { ...staffMember.normalSchedule[day], endTime: event.target.value } } })} required />
                </span>
              )}
              </div>
            ))}
          </fieldset>
          <p>Address:<br /><textarea rows="4" value={staffMember.address || ""} onChange={event => setStaffMember({ ...staffMember, address: event.target.value })} /></p>
          <p>Contact Details:<br /><textarea value={staffMember.contactDetails || ""} onChange={event => setStaffMember({ ...staffMember, contactDetails: event.target.value })} /></p>
          <p>Qualification Level: <select value={staffMember.qualificationLevel || ""} onChange={event => setStaffMember({ ...staffMember, qualificationLevel: event.target.value })}>
            <option value="">Select level</option>
            <option value="U">U</option>
            <option value="Level 2">Level 2</option>
            <option value="Level 3">Level 3</option>
            <option value="Level 4">Level 4</option>
            <option value="Level 5">Level 5</option>
            <option value="Level 6">Level 6</option>
          </select></p>
          <p>Emergency Contact Name: <input value={staffMember.emergencyContactName || ""} onChange={event => setStaffMember({ ...staffMember, emergencyContactName: event.target.value })} /></p>
          <p>Emergency Contact Phone: <input type="tel" value={staffMember.emergencyContactPhone || ""} onChange={event => setStaffMember({ ...staffMember, emergencyContactPhone: event.target.value })} /></p>
          <p>Emergency Contact Relationship: <input value={staffMember.emergencyContactRelationship || ""} onChange={event => setStaffMember({ ...staffMember, emergencyContactRelationship: event.target.value })} /></p>
          <div><button type="submit">Save</button>{" "}<button type="button" onClick={() => setEditing(false)}>Cancel</button></div>
        </form>
      ) : (
        <>
          <div className="details-grid">
            <p>Name: {staffMember.name}</p>
            <p>Role: {staffMember.role}</p>
            <p>Hourly Rate: £{staffMember.hourlyRate}/hr</p>
            <p>Normal Setting Days: {settingDays.filter(day => staffMember.normalSchedule?.[day]?.enabled).join(", ") || "Not set"}</p>
            {settingDays.filter(day => staffMember.normalSchedule?.[day]?.enabled).map(day => (
              <p key={day}>{day}: {staffMember.normalSchedule[day].startTime} - {staffMember.normalSchedule[day].endTime}</p>
            ))}
            <p>Address: {staffMember.address || "Not provided"}</p>
            <p>Contact Details: {staffMember.contactDetails || "Not provided"}</p>
            <p>Qualification Level: {staffMember.qualificationLevel || "Not provided"}</p>
            <p>Emergency Contact Name: {staffMember.emergencyContactName || "Not provided"}</p>
            <p>Emergency Contact Phone: {staffMember.emergencyContactPhone || "Not provided"}</p>
            <p>Emergency Contact Relationship: {staffMember.emergencyContactRelationship || "Not provided"}</p>
          </div>
          <button type="button" onClick={() => setEditing(true)}>Edit Staff Information</button>
        </>
      )}
    </div>
  );
}

export default StaffDetails;
