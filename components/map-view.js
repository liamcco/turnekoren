"use client";

import { MapContainer, TileLayer, CircleMarker, Popup } from "react-leaflet";

export function MapView({ places }) {
  const center = places.length
    ? [
        places.reduce((sum, place) => sum + place.latitude, 0) / places.length,
        places.reduce((sum, place) => sum + place.longitude, 0) / places.length,
      ]
    : [60.1699, 24.9384];

  return (
    <MapContainer
      center={center}
      className="map-frame"
      scrollWheelZoom={false}
      zoom={13}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {places.map((place) => (
        <CircleMarker
          center={[place.latitude, place.longitude]}
          fillOpacity={0.92}
          key={place.id}
          pathOptions={{ color: "#ff6a3d", fillColor: "#ff6a3d" }}
          radius={10}
        >
          <Popup>
            <strong>{place.name}</strong>
            <br />
            {place.address}
            <br />
            {place.description}
          </Popup>
        </CircleMarker>
      ))}
    </MapContainer>
  );
}
