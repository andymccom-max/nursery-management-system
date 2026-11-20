import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

function Children() {
  const [children, setChildren] = useState([]);
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedChildIds, setSelectedChildIds] = useState([]);
  const [filterType, setFilterType] = useState("name");
  const [filterValue, setFilterValue] = useState("");
  const [nameSort, setNameSort] = useState("az");
  const [dobSort, setDobSort] = useState("youngest");
  const [rooms, setRooms] = useState([]);

  useEffect(() => {
    axios.get("http://localhost:4000/children")
      .then(res => setChildren(res.data))
      .catch(err => console.error(err));
    axios.get("http://localhost:4000/rooms")
      .then(res => setRooms(Array.isArray(res.data) ? res.data : []))
      .catch(err => console.error(err));
  }, []);

  const toggleChild = (childId) => {
    setSelectedChildIds(currentIds => currentIds.includes(childId)
      ? currentIds.filter(id => id !== childId)
      : [...currentIds, childId]
    );
  };

  const deleteSelected = async () => {
    if (!selectedChildIds.length) return;
    if (!window.confirm(`Delete ${selectedChildIds.length} selected child${selectedChildIds.length === 1 ? "" : "ren"}?`)) return;

    await Promise.all(selectedChildIds.map(childId => (
      axios.delete(`http://localhost:4000/children/${childId}`)
    )));
    setChildren(currentChildren => currentChildren.filter(child => !selectedChildIds.includes(child._id)));
    setSelectedChildIds([]);
    setSelectionMode(false);
  };

  const filteredChildren = children.filter(child => {
    if (!filterValue) return true;
    if (filterType === "name") return child.name.toLowerCase().includes(filterValue.toLowerCase());
    if (filterType === "room") return child.room === filterValue;
    return child.dob?.substring(0, 10) === filterValue;
  }).sort((firstChild, secondChild) => {
    if (filterType === "name") {
      return firstChild.name.localeCompare(secondChild.name) * (nameSort === "az" ? 1 : -1);
    }
    if (filterType === "dob") {
      const firstDate = new Date(firstChild.dob).getTime();
      const secondDate = new Date(secondChild.dob).getTime();
      return (secondDate - firstDate) * (dobSort === "youngest" ? 1 : -1);
    }
    return 0;
  });

  return (
    <div style={{ padding: 20 }}>
      <h1>Children</h1>
      <div className="action-toolbar">
        <Link className="button-link action-button" to="/add-child">Add</Link>
        <button
        className="action-button"
        type="button"
        onClick={() => {
          setSelectionMode(currentMode => !currentMode);
          setSelectedChildIds([]);
        }}
      >
        {selectionMode ? "Cancel" : "Edit"}
        </button>{" "}
      {selectionMode && (
        <button type="button" onClick={deleteSelected} disabled={!selectedChildIds.length}>
          Delete Selected
        </button>
      )}
      </div>

      <div className="filter-toolbar">
        <label>
          Filter by
          <select value={filterType} onChange={event => {
            setFilterType(event.target.value);
            setFilterValue("");
          }}>
            <option value="name">Name</option>
            <option value="room">Room</option>
            <option value="dob">Date of Birth</option>
          </select>
        </label>
        {filterType === "room" ? (
          <label>
            Room
            <select value={filterValue} onChange={event => setFilterValue(event.target.value)}>
              <option value="">All rooms</option>
              {rooms.map(room => <option key={room._id} value={room.name}>{room.name}</option>)}
            </select>
          </label>
        ) : (
          <label>
            Search
            <input
              type={filterType === "dob" ? "date" : "search"}
              value={filterValue}
              onChange={event => setFilterValue(event.target.value)}
            />
          </label>
        )}
        {filterType === "name" && (
          <label>
            Sort
            <select value={nameSort} onChange={event => setNameSort(event.target.value)}>
              <option value="az">A-Z</option>
              <option value="za">Z-A</option>
            </select>
          </label>
        )}
        {filterType === "dob" && (
          <label>
            Sort by Age
            <select value={dobSort} onChange={event => setDobSort(event.target.value)}>
              <option value="youngest">Youngest to Oldest</option>
              <option value="oldest">Oldest to Youngest</option>
            </select>
          </label>
        )}
      </div>

      <ul>
        {filteredChildren.map(child => (
          <li key={child._id}>
            {selectionMode && (
              <input
                type="checkbox"
                checked={selectedChildIds.includes(child._id)}
                onChange={() => toggleChild(child._id)}
                aria-label={`Select ${child.name}`}
              />
            )}{" "}
            <Link to={`/children/${child._id}`}>{child.name}</Link> — {child.room} — {child.dob?.substring(0, 10)}{" "}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Children;
