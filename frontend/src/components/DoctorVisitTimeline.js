export default function DoctorVisitTimeline({ visits }) {
  return (
    <div>
      <h3>Doctor Visit History</h3>

      {visits.map((v, i) => (
        <div key={i} style={{ borderLeft: "3px solid #d4638a", padding: "10px", marginBottom: "10px" }}>
          <strong>{v.visit_date}</strong>
          <p>Doctor: {v.doctor_name}</p>
          <p>Notes: {v.notes}</p>
          <p>Medications: {v.medications}</p>
          {v.follow_up_date && <p>Next Visit: {v.follow_up_date}</p>}
        </div>
      ))}
    </div>
  );
}
