import React from 'react';

const Loader = ({ text = "Cargando datos..." }) => {
    return (
        <div className="loader-container">
            <div className="spinner-premium"></div>
            <p className="loader-text">{text}</p>
        </div>
    );
};

export default Loader;
