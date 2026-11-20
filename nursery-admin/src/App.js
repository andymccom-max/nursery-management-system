import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import Staff from "./Staff";
import Children from "./Children";
import Parents from "./Parents";
import AddStaff from "./AddStaff";
import AddChild from "./AddChild";
import ChildDetails from "./ChildDetails";
import AddParent from "./AddParent";
import StaffDetails from "./StaffDetails";
import Roster from "./Roster";
import Payroll from "./Payroll";

function App() {
  return (
    <Router>
      <div style={{ padding: 20 }}>
        <h1>Nursery Admin Dashboard</h1>

        <nav style={{ marginBottom: 20 }}>
          <Link to="/staff" style={{ marginRight: 20 }}>Staff</Link>
          <Link to="/children" style={{ marginRight: 20 }}>Children</Link>
          <Link to="/roster">Roster</Link>
          <Link to="/payroll" style={{ marginLeft: 20 }}>Payroll</Link>
        </nav>

        <Routes>
          <Route path="/staff" element={<Staff />} />
          <Route path="/staff/:staffId" element={<StaffDetails />} />
          <Route path="/children" element={<Children />} />
          <Route path="/children/:childId" element={<ChildDetails />} />
          <Route path="/roster" element={<Roster />} />
          <Route path="/payroll" element={<Payroll />} />
          <Route path="/parents" element={<Parents />} />
          <Route path="/add-staff" element={<AddStaff />} />
          <Route path="/add-child" element={<AddChild />} />
          <Route path="/add-parent" element={<AddParent />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
