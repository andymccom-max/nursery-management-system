import React, { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";

function AddParent() {
  const [name, setName] = useState("");
  const [relationship, setRelationship] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [postcode, setPostcode] = useState("");
  const [other, setOther] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();

    await axios.post("http://localhost:4000/parents", {
      name,
      relationship,
      email,
      phone,
      address,
      postcode,
      other
    });

    navigate("/parents");
  };

  return (
    <div style={{ padding: 20 }}>
      <Link to="/parents">Back to Parents/Guardians</Link>
      <h1>Add New Parent</h1>

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: 10 }}>
          <label>Name:</label><br />
          <input
            type="text"
            value={name}
            onChange={event => setName(event.target.value)}
            required
          />
        </div>

        <div style={{ marginBottom: 10 }}>
          <label>Relationship:</label><br />
          <input
            type="text"
            value={relationship}
            onChange={event => setRelationship(event.target.value)}
            required
          />
        </div>

        <div style={{ marginBottom: 10 }}>
          <label>Email:</label><br />
          <input
            type="email"
            value={email}
            onChange={event => setEmail(event.target.value)}
            required
          />
        </div>

        <div style={{ marginBottom: 10 }}>
          <label>Address:</label><br />
          <textarea
            rows="4"
            style={{ width: "300px", boxSizing: "border-box" }}
            value={address}
            onChange={event => setAddress(event.target.value)}
          />
        </div>

        <div style={{ marginBottom: 10 }}>
          <label>Postcode:</label><br />
          <input
            type="text"
            style={{ width: "300px", boxSizing: "border-box" }}
            value={postcode}
            onChange={event => setPostcode(event.target.value)}
          />
        </div>

        <div style={{ marginBottom: 10 }}>
          <label>Other:</label><br />
          <textarea
            value={other}
            onChange={event => setOther(event.target.value)}
          />
        </div>

        <div style={{ marginBottom: 10 }}>
          <label>Phone:</label><br />
          <input
            type="tel"
            value={phone}
            onChange={event => setPhone(event.target.value)}
            required
          />
        </div>

        <button type="submit">Add Parent</button>
      </form>
    </div>
  );
}

export default AddParent;
