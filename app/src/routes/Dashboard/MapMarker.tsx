import React, { useState } from 'react';

type MarkerProps = {
  text: string,
  lat: number,
  lng: number,
};

const MapMarker: React.FC<MarkerProps> = ({ text }) => {
  const [hovering, setHovering] = useState<boolean>(false);

  return (
    <>
      {hovering ? <div className="Hint">{text}</div> : null}
      <div
        onMouseEnter={() => setHovering(true)}
        onMouseLeave={() => setHovering(false)}
        className="Marker"
      />
    </>
  );
};

export default MapMarker;