import { TileLayer } from "react-leaflet";

export const MyTileLayer = ({ mapboxToken }: any) => (
  <TileLayer
    attribution='Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>'
    url="https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}"
    accessToken={mapboxToken}
    tileSize={512}
    zoomOffset={-1}
    maxZoom={18}
    id="skivol/ckpimp0lc0bme18pbwegnv6ih"
  />
);
