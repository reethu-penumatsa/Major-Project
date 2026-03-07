import { useState } from "react";

export default function DoctorVisitForm({ onAdd }) {
  const [form, setForm] = useState({
    visit_date: "",
    doctor_name: "",
    notes: "",
    medications: "",
    follow_up_date: "",
  });

  const handleSubmit = async () => {
    await fetch("http://127.0.0.1:5000/doctor-visits", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    onAdd();
    setForm({});
  };

  return (
    <div>
      <h3>Add Doctor Visit</h3>

      <input type="date" onChange={e => setForm({ ...form, visit_date: e.target.value })} />
      <input placeholder="Doctor Name" onChange={e => setForm({ ...form, doctor_name: e.target.value })} />
      <textarea placeholder="Notes" onChange={e => setForm({ ...form, notes: e.target.value })} />
      <input placeholder="Medications" onChange={e => setForm({ ...form, medications: e.target.value })} />
      <input type="date" onChange={e => setForm({ ...form, follow_up_date: e.target.value })} />

      <button onClick={handleSubmit}>Save Visit</button>
    </div>
  );
}
