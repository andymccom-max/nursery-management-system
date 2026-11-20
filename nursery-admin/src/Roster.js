import React, { useEffect, useState } from "react";
import axios from "axios";

const formatDate = date => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};
const startOfWeek = date => {
  const result = new Date(date);
  result.setDate(result.getDate() - result.getDay());
  return result;
};
const addDays = (date, amount) => {
  const result = new Date(date);
  result.setDate(result.getDate() + amount);
  return result;
};
const sameMonth = (date, month) => date.getMonth() === month.getMonth();
const dayName = date => date.toLocaleDateString("en-US", { weekday: "long" });
const childCategories = [
  { key: "under2", label: "Under 2", ratio: 3 },
  { key: "age2", label: "Age 2", ratio: 5 },
  { key: "age3plus", label: "Age 3+", ratio: 8 }
];
const ageOnDate = (dob, date) => {
  const birthDate = new Date(dob);
  let age = date.getFullYear() - birthDate.getFullYear();
  const birthdayNotReached = date.getMonth() < birthDate.getMonth()
    || (date.getMonth() === birthDate.getMonth() && date.getDate() < birthDate.getDate());
  if (birthdayNotReached) age -= 1;
  return age;
};
const categoryForChild = (child, date) => {
  const age = ageOnDate(child.dob, date);
  if (age < 2) return "under2";
  if (age === 2) return "age2";
  return "age3plus";
};
const attendanceForChild = (child, date) => {
  const day = dayName(date);
  return child.normalSchedule?.[day] || {
    enabled: child.normalDays?.includes(day) || (!child.normalDays && !child.normalSchedule),
    startTime: child.normalStartTime || "08:00",
    endTime: child.normalEndTime || "17:00"
  };
};
const scheduleFor = (staffMember, date) => {
  const day = dayName(new Date(`${date}T12:00:00`));
  return staffMember.normalSchedule?.[day] || {
    enabled: staffMember.normalDays?.includes(day),
    startTime: staffMember.normalStartTime || "09:00",
    endTime: staffMember.normalEndTime || "17:00"
  };
};

function Roster() {
  const [staff, setStaff] = useState([]);
  const [children, setChildren] = useState([]);
  const [view, setView] = useState("month");
  const [currentDate, setCurrentDate] = useState(new Date());
  const [shifts, setShifts] = useState([]);
  const [savedShifts, setSavedShifts] = useState([]);
  const [draggedShiftId, setDraggedShiftId] = useState(null);
  const [editingShift, setEditingShift] = useState(null);
  const [editingRatios, setEditingRatios] = useState(false);
  const [categoryRatios, setCategoryRatios] = useState({ under2: 3, age2: 5, age3plus: 8 });

  useEffect(() => {
    axios.get("http://localhost:4000/staff")
      .then(response => setStaff(response.data))
      .catch(error => console.error(error));
    axios.get("http://localhost:4000/children")
      .then(response => setChildren(response.data))
      .catch(error => console.error(error));
    axios.get("http://localhost:4000/roster")
      .then(response => setSavedShifts(response.data))
      .catch(error => console.error(error));
  }, []);

  useEffect(() => {
    const dates = view === "day"
      ? [currentDate]
      : view === "week"
        ? Array.from({ length: 7 }, (_, index) => addDays(startOfWeek(currentDate), index))
        : view === "year"
          ? Array.from({ length: 12 }, (_, index) => new Date(currentDate.getFullYear(), index, 1))
          : Array.from({ length: 42 }, (_, index) => addDays(new Date(currentDate.getFullYear(), currentDate.getMonth(), 1 - new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay()), index));

    const savedById = new Map(savedShifts.map(shift => [shift.id, shift]));
    setShifts([...savedById.values()].filter(shift => dates.some(date => shift.date === formatDate(date))));
  }, [staff, currentDate, view, savedShifts]);

  const displayedDates = view === "day"
    ? [currentDate]
    : view === "week"
      ? Array.from({ length: 7 }, (_, index) => addDays(startOfWeek(currentDate), index))
      : view === "year"
        ? Array.from({ length: 12 }, (_, index) => new Date(currentDate.getFullYear(), index, 1))
        : Array.from({ length: 42 }, (_, index) => addDays(new Date(currentDate.getFullYear(), currentDate.getMonth(), 1 - new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay()), index));

  const movePeriod = amount => {
    const nextDate = new Date(currentDate);
    if (view === "day") nextDate.setDate(nextDate.getDate() + amount);
    if (view === "week") nextDate.setDate(nextDate.getDate() + amount * 7);
    if (view === "month") nextDate.setMonth(nextDate.getMonth() + amount);
    if (view === "year") nextDate.setFullYear(nextDate.getFullYear() + amount);
    setCurrentDate(nextDate);
  };

  const moveShift = (shiftId, date) => {
    const movingShift = shifts.find(shift => shift.id === shiftId);
    if (!movingShift) return;
    if (shifts.some(shift => shift.staffId === movingShift.staffId && shift.date === date && shift.id !== shiftId)) {
      window.alert(`${movingShift.staffName} already has a shift on this day.`);
      setDraggedShiftId(null);
      return;
    }

    setShifts(currentShifts => currentShifts.map(shift => {
      if (shift.id !== shiftId) return shift;
      const movedShift = { ...shift, date };
      axios.put(`http://localhost:4000/roster/${shiftId}`, movedShift)
        .then(response => setSavedShifts(currentSaved => [
          ...currentSaved.filter(savedShift => savedShift.id !== shiftId),
          response.data
        ]))
        .catch(error => console.error(error));
      return movedShift;
    }));
    setDraggedShiftId(null);
  };

  const addStaffShift = (staffMember, date) => {
    const schedule = scheduleFor(staffMember, date);
    if (shifts.some(shift => shift.staffId === staffMember._id && shift.date === date)) {
      window.alert(`${staffMember.name} already has a shift on this day.`);
      return;
    }

    const shift = {
      id: `${staffMember._id}-${date}`,
      staffId: staffMember._id,
      staffName: staffMember.name,
      qualificationLevel: staffMember.qualificationLevel,
      date,
      startTime: schedule.startTime,
      endTime: schedule.endTime
    };
    setShifts(currentShifts => [...currentShifts, shift]);
    axios.put(`http://localhost:4000/roster/${shift.id}`, shift)
      .then(response => setSavedShifts(currentSaved => [
        ...currentSaved.filter(savedShift => savedShift.id !== shift.id),
        response.data
      ]))
      .catch(error => console.error(error));
  };

  const addAllStaffSchedules = async () => {
    const periodDates = displayedDates.filter(date => view !== "month" || sameMonth(date, currentDate));
    const newShifts = staff.flatMap(staffMember => periodDates.reduce((addedShifts, date) => {
      const dateString = formatDate(date);
      const schedule = scheduleFor(staffMember, dateString);
      const alreadyAssigned = shifts.some(shift => shift.staffId === staffMember._id && shift.date === dateString)
        || addedShifts.some(shift => shift.staffId === staffMember._id && shift.date === dateString);

      if (!schedule.enabled || alreadyAssigned) return addedShifts;
      return [...addedShifts, {
        id: `${staffMember._id}-${dateString}`,
        staffId: staffMember._id,
        staffName: staffMember.name,
        qualificationLevel: staffMember.qualificationLevel,
        date: dateString,
        startTime: schedule.startTime,
        endTime: schedule.endTime
      }];
    }, []));

    if (!newShifts.length) return;
    setShifts(currentShifts => [...currentShifts, ...newShifts]);
    const saved = await Promise.all(newShifts.map(shift => axios.put(`http://localhost:4000/roster/${shift.id}`, shift)));
    setSavedShifts(currentSaved => [...currentSaved, ...saved.map(response => response.data)]);
  };

  const saveShiftTimes = async (event) => {
    event.preventDefault();
    const response = await axios.put(`http://localhost:4000/roster/${editingShift.id}`, editingShift);
    setShifts(currentShifts => currentShifts.map(shift => (
      shift.id === response.data.id ? response.data : shift
    )));
    setSavedShifts(currentSaved => [
      ...currentSaved.filter(shift => shift.id !== response.data.id),
      response.data
    ]);
    setEditingShift(null);
  };

  const removeShift = async () => {
    if (!draggedShiftId || draggedShiftId.startsWith("new-")) return;
    await axios.delete(`http://localhost:4000/roster/${draggedShiftId}`);
    setShifts(currentShifts => currentShifts.filter(shift => shift.id !== draggedShiftId));
    setSavedShifts(currentSaved => currentSaved.filter(shift => shift.id !== draggedShiftId));
    setDraggedShiftId(null);
  };

  const shiftsForDate = date => shifts.filter(shift => shift.date === formatDate(date));
  const childrenForCategory = (date, categoryKey) => children.filter(child => (
    categoryForChild(child, date) === categoryKey && attendanceForChild(child, date).enabled
  ));
  const qualificationForShift = shift => staff.find(staffMember => staffMember._id === shift.staffId)?.qualificationLevel || shift.qualificationLevel;
  const staffingSafety = date => {
    const dayShifts = shiftsForDate(date);
    const dayChildren = childCategories.map(category => ({
      ...category,
      ratio: categoryRatios[category.key],
      children: childrenForCategory(date, category.key)
    }));
    const requiredStaff = Math.max(...dayChildren.map(category => Math.ceil(category.children.length / category.ratio)), 0);
    const hasUnqualifiedStaff = dayShifts.some(shift => !qualificationForShift(shift) || qualificationForShift(shift) === "U");
    if (dayShifts.length < requiredStaff) return { label: "Unsafe staffing", color: "red" };
    if (hasUnqualifiedStaff) return { label: "Check qualifications", color: "amber" };
    return { label: "Staffing safe", color: "green" };
  };
  const title = view === "year"
    ? String(currentDate.getFullYear())
    : currentDate.toLocaleDateString(undefined, { month: "long", year: "numeric" });

  return (
    <div className="roster-page" style={{ padding: 20 }}>
      <h1>Staff Roster</h1>
      <div className="roster-toolbar">
        <button type="button" onClick={addAllStaffSchedules}>Add All Staff</button>
        <button type="button" onClick={() => movePeriod(-1)}>Previous</button>
        <strong>{title}</strong>
        <button type="button" onClick={() => movePeriod(1)}>Next</button>
        <select value={view} onChange={event => setView(event.target.value)} aria-label="Roster view">
          <option value="day">Day</option>
          <option value="week">Week</option>
          <option value="month">Month</option>
          <option value="year">Year</option>
        </select>
      </div>
      <button type="button" onClick={() => setEditingRatios(current => !current)}>
        {editingRatios ? "Done" : "Edit Age Group Limits"}
      </button>
      {editingRatios && (
        <div className="roster-ratio-settings">
          {childCategories.map(category => (
            <label key={category.key}>
              {category.label}: children per staff
              <input
                type="number"
                min="1"
                value={categoryRatios[category.key]}
                onChange={event => setCategoryRatios({ ...categoryRatios, [category.key]: Number(event.target.value) || 1 })}
              />
            </label>
          ))}
        </div>
      )}

      {view !== "year" && (
        <div className="roster-layout">
          <aside className="staff-palette">
            <h2>Staff</h2>
            <p>Drag a name onto a day</p>
            {staff.map(staffMember => (
              <div
                className="staff-palette-box"
                draggable
                key={staffMember._id}
                onDragStart={() => setDraggedShiftId(`new-${staffMember._id}`)}
                onDragEnd={() => setDraggedShiftId(null)}
                data-staff-id={staffMember._id}
              >
                <strong>{staffMember.name}</strong>
                <span>{staffMember.normalSchedule ? "Per-day schedule" : "Drop on a scheduled day"}</span>
              </div>
            ))}
            <div
              className="roster-remove-zone"
              onDragOver={event => event.preventDefault()}
              onDrop={removeShift}
            >
              Drag a shift here to remove it
            </div>
          </aside>
          <div className={`roster-calendar roster-${view}`}>
          {view === "month" && ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(day => (
            <div className="roster-day-heading" key={day}>{day}</div>
          ))}
          {displayedDates.map(date => (
            <div
              className={`roster-cell ${view === "month" && !sameMonth(date, currentDate) ? "outside-month" : ""}`}
              key={formatDate(date)}
              onDragOver={event => event.preventDefault()}
              onDrop={() => {
                if (!draggedShiftId) return;
                if (draggedShiftId.startsWith("new-")) {
                  const staffMember = staff.find(item => item._id === draggedShiftId.slice(4));
                  if (staffMember) addStaffShift(staffMember, formatDate(date));
                  setDraggedShiftId(null);
                } else {
                  moveShift(draggedShiftId, formatDate(date));
                }
              }}
            >
              <strong>{date.toLocaleDateString(undefined, { weekday: "short", day: "numeric", month: view === "month" ? undefined : "short" })}</strong>
              <div className={`safety-light safety-${staffingSafety(date).color}`} title={staffingSafety(date).label}>
                {staffingSafety(date).label}
              </div>
              <div className="roster-category-sections">
                {childCategories.map(category => {
                  const categoryChildren = childrenForCategory(date, category.key);
                  return (
                    <details key={category.key} className="roster-category-section">
                      <summary>{category.label} ({categoryChildren.length}, 1:{categoryRatios[category.key]})</summary>
                      {categoryChildren.length ? (
                        <ul>
                          {categoryChildren.map(child => <li key={child._id}>{child.name} ({ageOnDate(child.dob, date)})</li>)}
                        </ul>
                      ) : <p>No children</p>}
                    </details>
                  );
                })}
              </div>
              {shiftsForDate(date).map(shift => (
                editingShift?.id === shift.id ? (
                  <form className="shift-box shift-edit-form" key={shift.id} onSubmit={saveShiftTimes}>
                    <strong>{shift.staffName}</strong>
                    <label>
                      Start
                      <input
                        type="time"
                        value={editingShift.startTime}
                        onChange={event => setEditingShift({ ...editingShift, startTime: event.target.value })}
                        required
                      />
                    </label>
                    <label>
                      End
                      <input
                        type="time"
                        value={editingShift.endTime}
                        onChange={event => setEditingShift({ ...editingShift, endTime: event.target.value })}
                        required
                      />
                    </label>
                    <button type="submit">Save</button>
                    <button type="button" onClick={() => setEditingShift(null)}>Cancel</button>
                  </form>
                ) : (
                  <div
                    className="shift-box"
                    draggable
                    key={shift.id}
                    onDragStart={() => setDraggedShiftId(shift.id)}
                    onContextMenu={event => {
                      event.preventDefault();
                      setEditingShift({ ...shift });
                    }}
                    title="Drag to move. Right-click to edit times."
                  >
                    <strong>{shift.staffName}</strong>
                    <span>{qualificationForShift(shift) || "Qualification not set"}</span>
                    <span>{shift.startTime} - {shift.endTime}</span>
                  </div>
                )
              ))}
            </div>
          ))}
          </div>
        </div>
      )}

      {view === "year" && (
        <div className="roster-year-grid">
          {displayedDates.map(month => (
            <div className="roster-month" key={month.getMonth()}>
              <h2>{month.toLocaleDateString(undefined, { month: "long" })}</h2>
              {shiftsForDate(month).length === 0 ? (
                <p>No shifts</p>
              ) : shiftsForDate(month).map(shift => (
                <div className="shift-box" key={shift.id}>
                  <strong>{shift.staffName}</strong>
                  <span>{shift.startTime} - {shift.endTime}</span>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Roster;
