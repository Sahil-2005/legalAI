const Card = ({ image, number, title, description }) => {
  return (
    <div className="card">
      <div className="card-img">
        <img src={image} alt="" />
      </div>

      {number && <span className="card-number">{number}</span>}

      <h3>{title}</h3>
      <p>{description}</p>
    </div>
  );
};

export default Card;