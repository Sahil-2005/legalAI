const ResCard = ({ title, value }) => {
  return (
    <div className="info-card">
      <h3>{title}</h3>
      <p>{value || "No data yet"}</p>
    </div>
  );
};

export default ResCard;