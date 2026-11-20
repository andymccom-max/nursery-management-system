import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

function Parents() {
  const [parents, setParents] = useState([]);
  const [editingParent, setEditingParent] = useState(null);

  useEffect(() => {
    axios.get("http://localhost:4000/parents")
      .then(res => setParents(res.data))
      .catch(err => console.error(err));
  }, []);

  const handleSave = async (event) => {
    event.preventDefault();
    const response = await axios.put(`http://localhost:4000/parents/${editingParent._id}`, editingParent);
    setParents(currentParents => currentParents.map(parent => (
      parent._id === response.data._id ? response.data : parent
    )));
    setEditingParent(null);
  };

  const handleDelete = async (parent) => {
    if (!window.confirm(`Delete ${parent.name}?`)) return;

    await axios.delete(`http://localhost:4000/parents/${parent._id}`);
    setParents(currentParents => currentParents.filter(item => item._id !== parent._id));
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>Parents/Guardians</h1>
      <Link className="button-link action-button" to="/add-parent">Add</Link>

      <ul>
        {parents.map(parent => (
          <li key={parent._id}>
            {editingParent?._id === parent._id ? (
              <form onSubmit={handleSave}>
                <input
                  value={editingParent.name}
                  onChange={event => setEditingParent({ ...editingParent, name: event.target.value })}
                  required
                />
                <input
                  placeholder="Relationship"
                  value={editingParent.relationship || ""}
                  onChange={event => setEditingParent({ ...editingParent, relationship: event.target.value })}
                  required
                />
                <input
                  type="email"
                  value={editingParent.email}
                  onChange={event => setEditingParent({ ...editingParent, email: event.target.value })}
                  required
                />
                <input
                  value={editingParent.phone}
                  onChange={event => setEditingParent({ ...editingParent, phone: event.target.value })}
                  required
                />
                <label>Address:</label><br />
                <textarea
                  rows="4"
                  style={{ width: "300px", boxSizing: "border-box" }}
                  value={editingParent.address || ""}
                  onChange={event => setEditingParent({ ...editingParent, address: event.target.value })}
                />
                <label>Postcode:</label><br />
                <input
                  style={{ width: "300px", boxSizing: "border-box" }}
                  value={editingParent.postcode || ""}
                  onChange={event => setEditingParent({ ...editingParent, postcode: event.target.value })}
                />
                <input
                  placeholder="Other"
                  value={editingParent.other || ""}
                  onChange={event => setEditingParent({ ...editingParent, other: event.target.value })}
                />
                <button type="submit">Save</button>
                <button type="button" onClick={() => setEditingParent(null)}>Cancel</button>
              </form>
            ) : (
              <div className="parent-row">
                <span>
                  {parent.name} — {parent.relationship || "Relationship not provided"} — {parent.email} — {parent.phone} — {parent.address || "Address not provided"} — {parent.postcode || "Postcode not provided"} — {parent.other || "Other not provided"}
                </span>
                <span className="parent-actions">
                  <button className="action-button" type="button" onClick={() => setEditingParent(parent)}>Edit</button>
                  <hr />
                  <button type="button" onClick={() => handleDelete(parent)}>Delete</button>
                </span>
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Parents;
