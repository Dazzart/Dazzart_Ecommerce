import React from 'react';
import '../../css/CSS/Marcas.css';

const marcasOriginal = [
  { id: 1, img: '/img/MSI.webp', alt: 'MSI', url: 'https://latam.msi.com/' },
  { id: 2, img: '/img/FANTECH.webp', alt: 'Fantech', url: 'https://fantechworld.com/' },
  { id: 3, img: '/img/High_Resolution_PNG-LogitechG_horz_RGB_cyan_SM-1024x307.png', alt: 'Logitech', url: 'https://www.logitechstore.com.co/' },
  { id: 4, img: '/img/ASTRO-1.webp', alt: 'Astro', url: 'https://www.marca4.com' },
  { id: 5, img: '/img/LG-ULTRAGEAR-1.webp', alt: 'LG', url: 'https://www.marca5.com' },
  { id: 6, img: '/img/VSG.webp', alt: 'VSG', url: 'https://www.marca6.com' },
];

// Repetir marcas para carrusel infinito (20 veces)
const marcas = Array(20).fill(marcasOriginal).flat();

export default function Marcas() {
  return (
    <section className="marcas-section">
      <div className="marcas-carousel-container">
        <div className="marcas-carousel-track">
          {marcas.map(({ id, img, alt, url }, index) => (
            <div
              key={`${id}-${index}`}
              className="marca-item"
            >
              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="d-block text-center"
              >
                <img src={img} alt={alt} className="img-fluid" />
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
