import { MapContainer } from "react-leaflet";
import { MyTileLayer } from "../location/MyTileLayer";

const ukraineCenter = {
  lat: 49.47954694610455,
  lng: 31.482421606779102,
};
export const MapTest = ({ mapboxToken }: any) => {
  return (
    <MapContainer zoom={5} center={ukraineCenter} style={{ height: 360 }}>
      <MyTileLayer mapboxToken={mapboxToken} />
    </MapContainer>
  );
};
