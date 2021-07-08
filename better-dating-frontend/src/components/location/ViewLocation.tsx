import { Mode, LocationForm } from "../AddLocation";

type Place = {
  latitude: number;
  longitude: number;
  name: string;
};
type Props = { placeData: Place };
const ViewLocation = ({ placeData }: Props) => {
  const { name, latitude, longitude } = placeData;
  const center = { lat: latitude, lng: longitude };
  const initialValues = {
    ...center,
    name,
  };

  return (
    <LocationForm
      mode={Mode.view}
      initialValues={initialValues}
      center={center}
      zoom={17}
    />
  );
};

export default ViewLocation;
