import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

function Staff() {
  const [staff, setStaff] = useState([]);
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedStaffIds, setSelectedStaffIds] = useState([]);

  useEffect(() => {
    axios.get("http://localhost:4000/staff")
      .then(res => setStaff(res.data))
      .catch(err => console.error(err));
  }, []);

  const toggleStaff = (staffId) => {
    setSelectedStaffIds(currentIds => currentIds.includes(staffId)
      ? currentIds.filter(id => id !== staffId)
      : [...currentIds, staffId]
    );
  };

  const deleteSelected = async () => {
    if (!selectedStaffIds.length) return;
    if (!window.confirm(`Delete ${selectedStaffIds.length} selected staff member${selectedStaffIds.length === 1 ? "" : "s"}?`)) return;

    await Promise.all(selectedStaffIds.map(staffId => (
      axios.delete(`http://localhost:4000/staff/${staffId}`)
    )));
    setStaff(currentStaff => currentStaff.filter(staffMember => !selectedStaffIds.includes(staffMember._id)));
    setSelectedStaffIds([]);
    setSelectionMode(false);
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>Staff</h1>
      <div className="action-toolbar">
        <Link className="button-link action-button" to="/add-staff">Add</Link>
        <button
          className="action-button"
          type="button"
          onClick={() => {
            setSelectionMode(currentMode => !currentMode);
            setSelectedStaffIds([]);
          }}
        >
          {selectionMode ? "Cancel" : "Edit"}
        </button>{" "}
        {selectionMode && (
          <button type="button" onClick={deleteSelected} disabled={!selectedStaffIds.length}>
            Delete Selected
          </button>
        )}
      </div>
      <ul>
        {staff.map(s => (
          <li key={s._id}>
            {selectionMode && (
              <input
                type="checkbox"
                checked={selectedStaffIds.includes(s._id)}
                onChange={() => toggleStaff(s._id)}
                aria-label={`Select ${s.name}`}
              />
            )}{" "}
            <Link to={`/staff/${s._id}`}>{s.name}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Staff;
