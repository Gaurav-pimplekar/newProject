import React from "react";

const CarItem = (props) => {
  const { category, type, rentPrice, imgUrl, carName, groupSize } = props.item;

  const styles = {
    carItem: {
      background: 'var(--primary-color)',
      borderRadius: '5px',
      padding: '15px',
      color: 'white',
    },
    carItemTop: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    carItemTitle: {
      display: 'flex',
      alignItems: 'center',
    },
    carName: {
      fontSize: '1.2rem',
      fontWeight: 'bold',
    },
    carCategory: {
      color: 'white',
    },
    carImg: {
      width: '100%',
      borderRadius: '5px',
    },
    carItemBottom: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginTop: '10px',
    },
    bottomLeft: {
      color: 'white',
    },
    carRent: {
      fontWeight: 'bold',
      color: 'white',
    },
  };

  return (
    <div style={styles.carItem}>
      <div style={styles.carItemTop}>
        <div style={styles.carItemTitle}>
          <h3 style={styles.carName}>{carName}</h3>
          <span>
            <i className="ri-heart-line"></i>
          </span>
        </div>
        <p style={styles.carCategory}>{category}</p>
      </div>

      <div className="car__img">
        <img src={imgUrl} alt={carName} style={styles.carImg} />
      </div>

      <div style={styles.carItemBottom}>
        <div style={styles.bottomLeft}>
          <p>
            <i className="ri-user-line"></i> {groupSize}
          </p>
          <p>
            <i className="ri-repeat-line"></i> {type}
          </p>
        </div>

        <p style={styles.carRent}>${rentPrice}/d</p>
      </div>
    </div>
  );
};

export default CarItem;
