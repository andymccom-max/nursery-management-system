import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link, useParams } from "react-router-dom";

const attendanceDays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const createSchedule = child => child.normalSchedule || attendanceDays.reduce((schedule, day) => ({
  ...schedule,
  [day]: { enabled: child.normalDays?.includes(day), startTime: child.normalStartTime || "08:00", endTime: child.normalEndTime || "17:00" }
}), {});

function ChildDetails() {
  const { childId } = useParams();
  const [child, setChild] = useState(null);
  const [parent, setParent] = useState(null);
  const [rooms, setRooms] = useState([]);
  const [editingChild, setEditingChild] = useState(false);
  const [editingParent, setEditingParent] = useState(false);
  const [addingContact, setAddingContact] = useState(false);
  const [newContact, setNewContact] = useState({ name: "", relationship: "", phone: "", email: "", address: "", postcode: "", other: "" });
  const [editingContactIndex, setEditingContactIndex] = useState(null);
  const [editingContact, setEditingContact] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadDetails = async () => {
      try {
        const [childResponse, parentsResponse, roomsResponse] = await Promise.all([
          axios.get(`http://localhost:4000/children/${childId}`),
          axios.get("http://localhost:4000/parents"),
          axios.get("http://localhost:4000/rooms")
        ]);
        const loadedChild = childResponse.data;
        setChild({ ...loadedChild, normalSchedule: createSchedule(loadedChild) });
        setParent(parentsResponse.data.find(item => (
          item._id === loadedChild.parentId || item._id === loadedChild._id
        )) || null);
        setRooms(Array.isArray(roomsResponse.data) ? roomsResponse.data : []);
      } catch (requestError) {
        setError("Unable to load this child's information.");
      }
    };

    loadDetails();
  }, [childId]);

  const saveChild = async (event) => {
    event.preventDefault();
    const response = await axios.put(`http://localhost:4000/children/${child._id}`, child);
    setChild(response.data);
    setEditingChild(false);
  };

  const saveParent = async (event) => {
    event.preventDefault();
    const response = await axios.put(`http://localhost:4000/parents/${parent._id}`, parent);
    setParent(response.data);
    setEditingParent(false);
  };

  const addContact = async (event) => {
    event.preventDefault();
    const response = await axios.put(`http://localhost:4000/parents/${parent._id}`, {
      contacts: [...(parent.contacts || []), newContact]
    });
    setParent(response.data);
    setNewContact({ name: "", relationship: "", phone: "", email: "", address: "", postcode: "", other: "" });
    setAddingContact(false);
  };

  const saveContact = async (event) => {
    event.preventDefault();
    const contacts = [...(parent.contacts || [])];
    contacts[editingContactIndex] = editingContact;
    const response = await axios.put(`http://localhost:4000/parents/${parent._id}`, { contacts });
    setParent(response.data);
    setEditingContactIndex(null);
    setEditingContact(null);
  };

  const deleteContact = async (contact) => {
    if (!window.confirm(`Delete ${contact.name}?`)) return;

    const contacts = (parent.contacts || []).filter(item => item !== contact);
    const response = await axios.put(`http://localhost:4000/parents/${parent._id}`, { contacts });
    setParent(response.data);
  };

  if (error) return <p>{error}</p>;
  if (!child) return <p>Loading...</p>;

  return (
    <div className="details-page" style={{ padding: 20 }}>
      <Link to="/children">Back to Children</Link>
      <h1>{child.name}</h1>

      <h2>Child Information</h2>
      {editingChild ? (
        <form className="details-grid" onSubmit={saveChild}>
          <p>
            Name: <input
              value={child.name}
              onChange={event => setChild({ ...child, name: event.target.value })}
              required
            />
          <fieldset className="staff-days-fieldset">
            <legend>Attendance Days and Times</legend>
            {attendanceDays.map(day => (
              <div className="setting-day-row" key={day}>
                <label className="day-option">
                  <input
                    type="checkbox"
                    checked={child.normalSchedule[day]?.enabled || false}
                    onChange={() => setChild({ ...child, normalSchedule: { ...child.normalSchedule, [day]: { ...child.normalSchedule[day], enabled: !child.normalSchedule[day]?.enabled } } })}
                  />
                  {day}
                </label>
                {child.normalSchedule[day]?.enabled && (
                  <span className="day-times">
                    <input type="time" value={child.normalSchedule[day].startTime} onChange={event => setChild({ ...child, normalSchedule: { ...child.normalSchedule, [day]: { ...child.normalSchedule[day], startTime: event.target.value } } })} required />
                    <span>to</span>
                    <input type="time" value={child.normalSchedule[day].endTime} onChange={event => setChild({ ...child, normalSchedule: { ...child.normalSchedule, [day]: { ...child.normalSchedule[day], endTime: event.target.value } } })} required />
                  </span>
                )}
              </div>
            ))}
          </fieldset>
              type="date"
              value={child.dob?.substring(0, 10) || ""}
              onChange={event => setChild({ ...child, dob: event.target.value })}
              required
            />
          </p>
          <p>
            Room: <select
              value={child.room}
              onChange={event => setChild({ ...child, room: event.target.value })}
              required
            >
              {!rooms.some(room => room.name === child.room) && <option value={child.room}>{child.room}</option>}
              {rooms.map(room => <option key={room._id} value={room.name}>{room.name}</option>)}
            </select>
          </p>
          <button type="submit">Save Child</button>{" "}
          <button type="button" onClick={() => setEditingChild(false)}>Cancel</button>
        </form>
      ) : (
        <div className="details-grid">
          <p>Name: {child.name}</p>
          <p>Date of Birth: {child.dob?.substring(0, 10)}</p>
          <p>Room: {child.room}</p>
          <p>Attendance Days: {attendanceDays.filter(day => child.normalSchedule?.[day]?.enabled).join(", ") || "Not set"}</p>
          {attendanceDays.filter(day => child.normalSchedule?.[day]?.enabled).map(day => (
            <p key={day}>{day}: {child.normalSchedule[day].startTime} - {child.normalSchedule[day].endTime}</p>
          ))}
          <button type="button" onClick={() => setEditingChild(true)}>Edit Child</button>
        </div>
      )}

      <h2>Parent/Guardian Information</h2>
      {parent ? (
        editingParent ? (
          <form className="details-grid" onSubmit={saveParent}>
            <p>
              Name: <input
                value={parent.name}
                onChange={event => setParent({ ...parent, name: event.target.value })}
                required
              />
            </p>
            <p>
              Relationship: <input
                value={parent.relationship || ""}
                onChange={event => setParent({ ...parent, relationship: event.target.value })}
                required
              />
            </p>
            <p>
              Email: <input
                type="email"
                value={parent.email}
                onChange={event => setParent({ ...parent, email: event.target.value })}
                required
              />
            </p>
            <p>
              Phone: <input
                value={parent.phone}
                onChange={event => setParent({ ...parent, phone: event.target.value })}
                required
              />
            </p>
            <p>
              <label>Address:</label><br />
              <textarea
                rows="4"
                style={{ width: "300px", boxSizing: "border-box" }}
                value={parent.address || ""}
                onChange={event => setParent({ ...parent, address: event.target.value })}
              />
            </p>
            <p>
              <label>Postcode:</label><br />
              <input
                style={{ width: "300px", boxSizing: "border-box" }}
                value={parent.postcode || ""}
                onChange={event => setParent({ ...parent, postcode: event.target.value })}
              />
            </p>
            <p>
              Other: <textarea
                value={parent.other || ""}
                onChange={event => setParent({ ...parent, other: event.target.value })}
              />
            </p>
            <button type="submit">Save Parent/Guardian</button>{" "}
            <button type="button" onClick={() => setEditingParent(false)}>Cancel</button>
          </form>
        ) : (
          <div className="details-grid">
            <p>Name: {parent.name}</p>
            <p>Relationship: {parent.relationship || "Not provided"}</p>
            <p>Email: {parent.email}</p>
            <p>Phone: {parent.phone}</p>
            <p>Address:<br />{parent.address || "Not provided"}</p>
            <p>Postcode: {parent.postcode || "Not provided"}</p>
            <p>Other: {parent.other || "Not provided"}</p>
            <button type="button" onClick={() => setEditingParent(true)}>Edit Parent/Guardian</button>
          </div>
        )
      ) : (
        <p>No parent or guardian information is linked to this child.</p>
      )}

      {parent && (
        <>
          {parent.contacts?.map((contact, index) => (
            <div className="contact-card" key={`${contact.name}-${index}`}>
              <h3>Additional Contact {index + 1}</h3>
              {editingContactIndex === index ? (
                <form className="details-grid" onSubmit={saveContact}>
                  <p>
                    Name: <input
                      value={editingContact.name}
                      onChange={event => setEditingContact({ ...editingContact, name: event.target.value })}
                      required
                    />
                  </p>
                  <p>
                    Relationship: <input
                      value={editingContact.relationship}
                      onChange={event => setEditingContact({ ...editingContact, relationship: event.target.value })}
                      required
                    />
                  </p>
                  <p>
                    Phone: <input
                      type="tel"
                      value={editingContact.phone}
                      onChange={event => setEditingContact({ ...editingContact, phone: event.target.value })}
                      required
                    />
                  </p>
                  <p>
                    Email: <input
                      type="email"
                      value={editingContact.email}
                      onChange={event => setEditingContact({ ...editingContact, email: event.target.value })}
                      required
                    />
                  </p>
                  <p>
                    <label>Address:</label><br />
                    <textarea
                      rows="4"
                      style={{ width: "300px", boxSizing: "border-box" }}
                      value={editingContact.address || ""}
                      onChange={event => setEditingContact({ ...editingContact, address: event.target.value })}
                    />
                  </p>
                  <p>
                    <label>Postcode:</label><br />
                    <input
                      style={{ width: "300px", boxSizing: "border-box" }}
                      value={editingContact.postcode || ""}
                      onChange={event => setEditingContact({ ...editingContact, postcode: event.target.value })}
                    />
                  </p>
                  <p>
                    Other: <textarea
                      value={editingContact.other || ""}
                      onChange={event => setEditingContact({ ...editingContact, other: event.target.value })}
                    />
                  </p>
                  <button type="submit">Save Contact</button>{" "}
                  <button type="button" onClick={() => setEditingContactIndex(null)}>Cancel</button>
                </form>
              ) : (
                <div className="details-grid">
                  <p>Name: {contact.name}</p>
                  <p>Relationship: {contact.relationship}</p>
                  <p>Phone: {contact.phone}</p>
                  <p>Email: {contact.email}</p>
                  <p>Address:<br />{contact.address || "Not provided"}</p>
                  <p>Postcode: {contact.postcode || "Not provided"}</p>
                  <p>Other: {contact.other || "Not provided"}</p>
                  <button type="button" onClick={() => {
                    setEditingContactIndex(index);
                    setEditingContact({ ...contact });
                  }}>Edit Contact</button>{" "}
                  <button type="button" onClick={() => deleteContact(contact)}>Delete Contact</button>
                </div>
              )}
            </div>
          ))}

          <button className="add-contact-button" type="button" onClick={() => setAddingContact(true)}>Add Another Contact</button>

          {addingContact && (
            <form className="details-grid" onSubmit={addContact}>
              <p>
                Name: <input
                  value={newContact.name}
                  onChange={event => setNewContact({ ...newContact, name: event.target.value })}
                  required
                />
              </p>
              <p>
                Relationship: <input
                  value={newContact.relationship}
                  onChange={event => setNewContact({ ...newContact, relationship: event.target.value })}
                  required
                />
              </p>
              <p>
                Phone: <input
                  type="tel"
                  value={newContact.phone}
                  onChange={event => setNewContact({ ...newContact, phone: event.target.value })}
                  required
                />
              </p>
              <p>
                Email: <input
                  type="email"
                  value={newContact.email}
                  onChange={event => setNewContact({ ...newContact, email: event.target.value })}
                  required
                />
              </p>
              <p>
                <label>Address:</label><br />
                <textarea
                  rows="4"
                  style={{ width: "300px", boxSizing: "border-box" }}
                  value={newContact.address}
                  onChange={event => setNewContact({ ...newContact, address: event.target.value })}
                />
              </p>
              <p>
                <label>Postcode:</label><br />
                <input
                  style={{ width: "300px", boxSizing: "border-box" }}
                  value={newContact.postcode}
                  onChange={event => setNewContact({ ...newContact, postcode: event.target.value })}
                />
              </p>
              <p>
                Other: <textarea
                  value={newContact.other}
                  onChange={event => setNewContact({ ...newContact, other: event.target.value })}
                />
              </p>
              <button type="submit">Save Contact</button>{" "}
              <button type="button" onClick={() => setAddingContact(false)}>Cancel</button>
            </form>
          )}
        </>
      )}
    </div>
  );
}

export default ChildDetails;
