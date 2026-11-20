import React, { useEffect, useState } from "react";
import axios from "axios";

const currentMonth = () => new Date().toISOString().slice(0, 7);
const defaultTaxSettings = {
  personalAllowance: 12570,
  basicRate: 20,
  basicLimit: 50270,
  higherRate: 40,
  higherLimit: 125140,
  additionalRate: 45
};
const defaultNISettings = {
  threshold: 12570,
  upperLimit: 50270,
  mainRate: 8,
  upperRate: 2
};

const hoursBetween = (startTime, endTime) => {
  if (!startTime || !endTime) return 0;
  const [startHours, startMinutes] = startTime.split(":").map(Number);
  const [endHours, endMinutes] = endTime.split(":").map(Number);
  let minutes = (endHours * 60 + endMinutes) - (startHours * 60 + startMinutes);
  if (minutes < 0) minutes += 24 * 60;
  return minutes / 60;
};

const calculateTax = (grossPay, settings) => {
  const taxableIncome = Math.max(0, grossPay - Number(settings.personalAllowance));
  const basicBand = Math.min(taxableIncome, Number(settings.basicLimit) - Number(settings.personalAllowance));
  const higherBand = Math.min(
    Math.max(0, taxableIncome - (Number(settings.basicLimit) - Number(settings.personalAllowance))),
    Number(settings.higherLimit) - Number(settings.basicLimit)
  );
  const additionalBand = Math.max(0, taxableIncome - (Number(settings.higherLimit) - Number(settings.personalAllowance)));

  return (basicBand * Number(settings.basicRate) / 100)
    + (higherBand * Number(settings.higherRate) / 100)
    + (additionalBand * Number(settings.additionalRate) / 100);
};

const calculateNI = (grossPay, settings) => {
  const mainBand = Math.max(0, Math.min(grossPay, Number(settings.upperLimit)) - Number(settings.threshold));
  const upperBand = Math.max(0, grossPay - Number(settings.upperLimit));
  return (mainBand * Number(settings.mainRate) / 100) + (upperBand * Number(settings.upperRate) / 100);
};

const calculateMonthlyDeductions = (grossPay, taxSettings, niSettings) => {
  const annualGrossPay = grossPay * 12;
  return {
    tax: calculateTax(annualGrossPay, taxSettings) / 12,
    nationalInsurance: calculateNI(annualGrossPay, niSettings) / 12
  };
};

function Payroll() {
  const [staff, setStaff] = useState([]);
  const [shifts, setShifts] = useState([]);
  const [month, setMonth] = useState(currentMonth());
  const [notes, setNotes] = useState({});
  const [otherDeductions, setOtherDeductions] = useState({});
  const [editingPayroll, setEditingPayroll] = useState(false);
  const [pensionRate, setPensionRate] = useState(5);
  const [taxSettings, setTaxSettings] = useState(defaultTaxSettings);
  const [niSettings, setNISettings] = useState(defaultNISettings);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([
      axios.get("http://localhost:4000/staff"),
      axios.get("http://localhost:4000/roster")
    ])
      .then(([staffResponse, rosterResponse]) => {
        setStaff(staffResponse.data);
        setShifts(rosterResponse.data);
      })
      .catch(() => setError("Unable to load payroll information."));
  }, []);

  const payroll = staff.map(staffMember => {
    const staffShifts = shifts.filter(shift => (
      shift.staffId === staffMember._id && shift.date.startsWith(month)
    ));
    const totalHours = staffShifts.reduce((total, shift) => (
      total + hoursBetween(shift.startTime, shift.endTime)
    ), 0);
    const hourlyRate = Number(staffMember.hourlyRate) || 0;
    const grossPay = totalHours * hourlyRate;
    const { tax, nationalInsurance } = calculateMonthlyDeductions(grossPay, taxSettings, niSettings);
    const deductionKey = `${month}-${staffMember._id}`;
    const otherDeductionItems = otherDeductions[deductionKey] || [];
    const otherDeduction = otherDeductionItems.reduce((total, item) => total + (Number(item.amount) || 0), 0);
    const pension = grossPay * (Number(pensionRate) || 0) / 100;
    const totalDeductions = tax + nationalInsurance + otherDeduction + pension;

    return {
      staffMember,
      shifts: staffShifts,
      totalHours,
      hourlyRate,
      grossPay,
      tax,
      nationalInsurance,
      otherDeduction,
      otherDeductionItems,
      pension,
      totalDeductions,
      netPay: Math.max(0, grossPay - totalDeductions)
    };
  });

  if (error) return <p>{error}</p>;

  return (
    <div className="payroll-page" style={{ padding: 20 }}>
      <div className="payroll-header">
        <div>
          <h1>Payroll</h1>
          <p>Hours pulled from the staff roster</p>
        </div>
        <label>
          Payroll month
          <input type="month" value={month} onChange={event => setMonth(event.target.value)} />
        </label>
      </div>
      <button className="payroll-edit-button" type="button" onClick={() => setEditingPayroll(current => !current)}>
        {editingPayroll ? "Done" : "Edit Payroll"}
      </button>
      {editingPayroll && (
        <div className="payroll-settings">
          <label>
            Pension contribution (% of gross pay)
            <input type="number" min="0" max="100" step="0.1" value={pensionRate} onChange={event => setPensionRate(event.target.value)} />
          </label>
          <h3>Income Tax Formula</h3>
          <div className="payroll-formula-grid">
            <label>Tax-free allowance<input type="number" min="0" value={taxSettings.personalAllowance} onChange={event => setTaxSettings({ ...taxSettings, personalAllowance: event.target.value })} /></label>
            <label>Basic rate (%)<input type="number" min="0" max="100" step="0.1" value={taxSettings.basicRate} onChange={event => setTaxSettings({ ...taxSettings, basicRate: event.target.value })} /></label>
            <label>Basic band limit<input type="number" min="0" value={taxSettings.basicLimit} onChange={event => setTaxSettings({ ...taxSettings, basicLimit: event.target.value })} /></label>
            <label>Higher rate (%)<input type="number" min="0" max="100" step="0.1" value={taxSettings.higherRate} onChange={event => setTaxSettings({ ...taxSettings, higherRate: event.target.value })} /></label>
            <label>Higher band limit<input type="number" min="0" value={taxSettings.higherLimit} onChange={event => setTaxSettings({ ...taxSettings, higherLimit: event.target.value })} /></label>
            <label>Additional rate (%)<input type="number" min="0" max="100" step="0.1" value={taxSettings.additionalRate} onChange={event => setTaxSettings({ ...taxSettings, additionalRate: event.target.value })} /></label>
          </div>
          <h3>National Insurance Formula</h3>
          <div className="payroll-formula-grid">
            <label>NI threshold<input type="number" min="0" value={niSettings.threshold} onChange={event => setNISettings({ ...niSettings, threshold: event.target.value })} /></label>
            <label>Main rate (%)<input type="number" min="0" max="100" step="0.1" value={niSettings.mainRate} onChange={event => setNISettings({ ...niSettings, mainRate: event.target.value })} /></label>
            <label>Upper limit<input type="number" min="0" value={niSettings.upperLimit} onChange={event => setNISettings({ ...niSettings, upperLimit: event.target.value })} /></label>
            <label>Upper rate (%)<input type="number" min="0" max="100" step="0.1" value={niSettings.upperRate} onChange={event => setNISettings({ ...niSettings, upperRate: event.target.value })} /></label>
          </div>
          <p>Tax and NI continue to calculate automatically from gross pay.</p>
        </div>
      )}

      <div className="payslip-list">
        {payroll.map(({ staffMember, shifts: staffShifts, totalHours, hourlyRate, grossPay, tax, nationalInsurance, otherDeduction, otherDeductionItems, pension, totalDeductions, netPay }) => (
          <article className="payslip" key={staffMember._id}>
            <div className="payslip-heading">
              <h2>Payslip</h2>
              <span>{month}</span>
            </div>
            <h3>{staffMember.name}</h3>
            <div className="payslip-section">
              <h4>Earnings</h4>
              <p>Hours worked: <strong>{totalHours.toFixed(2)}</strong></p>
              <p>Hourly rate: <strong>£{hourlyRate.toFixed(2)}</strong></p>
              <p>Gross pay: <strong>£{grossPay.toFixed(2)}</strong></p>
            </div>
            <div className="payslip-section">
              <h4>Deductions</h4>
              <p>Income Tax: <strong>£{tax.toFixed(2)}</strong></p>
              <p>National Insurance: <strong>£{nationalInsurance.toFixed(2)}</strong></p>
              <p>Pension contribution ({Number(pensionRate).toFixed(1)}%): <strong>£{pension.toFixed(2)}</strong></p>
              <p>Total deductions: <strong>£{totalDeductions.toFixed(2)}</strong></p>
              <div className="other-deduction-entry">
                <strong>Other deductions (optional)</strong>
                {otherDeductionItems.map((item, index) => (
                  <div className="other-deduction-row" key={index}>
                    <input
                      type="text"
                      placeholder="Deduction title"
                      value={item.title}
                      onChange={event => setOtherDeductions(currentDeductions => ({
                        ...currentDeductions,
                        [`${month}-${staffMember._id}`]: currentDeductions[`${month}-${staffMember._id}`].map((deduction, itemIndex) => itemIndex === index ? { ...deduction, title: event.target.value } : deduction)
                      }))}
                    />
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="Amount"
                      value={item.amount}
                      onChange={event => setOtherDeductions(currentDeductions => ({
                        ...currentDeductions,
                        [`${month}-${staffMember._id}`]: currentDeductions[`${month}-${staffMember._id}`].map((deduction, itemIndex) => itemIndex === index ? { ...deduction, amount: event.target.value } : deduction)
                      }))}
                    />
                    <button type="button" onClick={() => setOtherDeductions(currentDeductions => ({
                      ...currentDeductions,
                      [`${month}-${staffMember._id}`]: currentDeductions[`${month}-${staffMember._id}`].filter((_, itemIndex) => itemIndex !== index)
                    }))}>Remove</button>
                  </div>
                ))}
                <button type="button" onClick={() => setOtherDeductions(currentDeductions => ({
                  ...currentDeductions,
                  [`${month}-${staffMember._id}`]: [...(currentDeductions[`${month}-${staffMember._id}`] || []), { title: "", amount: "" }]
                }))}>Add Other Deduction</button>
              </div>
            </div>
            {otherDeduction > 0 && (
              <div className="payslip-section other-deduction-section">
                <h4>Other Deductions</h4>
                {otherDeductionItems.filter(item => Number(item.amount) > 0).map((item, index) => (
                  <p key={index}>{item.title || "Other deduction"}: <strong>£{Number(item.amount).toFixed(2)}</strong></p>
                ))}
                <p><strong>£{otherDeduction.toFixed(2)}</strong></p>
              </div>
            )}
            <div className="payslip-section payslip-net">
              <h4>Net Pay</h4>
              <p><strong>£{netPay.toFixed(2)}</strong></p>
            </div>
            <div className="payslip-section payslip-notes">
              <label htmlFor={`notes-${staffMember._id}`}>Notes</label>
              <textarea
                id={`notes-${staffMember._id}`}
                rows="4"
                value={notes[`${month}-${staffMember._id}`] || ""}
                onChange={event => setNotes(currentNotes => ({
                  ...currentNotes,
                  [`${month}-${staffMember._id}`]: event.target.value
                }))}
                placeholder="Add notes to this payslip"
              />
            </div>
            <details>
              <summary>{staffShifts.length} roster shift{staffShifts.length === 1 ? "" : "s"}</summary>
              <ul>
                {staffShifts.map(shift => (
                  <li key={shift.id}>{shift.date}: {shift.startTime} - {shift.endTime}</li>
                ))}
              </ul>
            </details>
            <button type="button" onClick={() => window.print()}>Print Payslip</button>
          </article>
        ))}
      </div>
    </div>
  );
}

export default Payroll;
