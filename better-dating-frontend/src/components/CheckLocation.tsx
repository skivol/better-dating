import { useDispatch } from "react-redux";
import { useRouter } from "next/router";
import { useDateId } from "../utils";
import { approvePlace } from "../actions";
import { Mode, LocationForm } from "./AddLocation";
import { dating } from "./navigation/NavigationUrls";

type Place = {
  latitude: number;
  longitude: number;
  name: string;
};
type Props = { placeData: Place; mapboxToken: string };
const CheckLocation = ({ placeData, mapboxToken }: Props) => {
  const router = useRouter();
  const dispatch = useDispatch();
  const dateId = useDateId();
  const { name, latitude, longitude } = placeData;
  const center = { lat: latitude, lng: longitude };
  const initialValues = {
    ...center,
    name,
  };

  const onSubmit = () =>
    dispatch(approvePlace({ dateId })).then(() => router.push(dating));

  return (
    <LocationForm
      mode={Mode.check}
      initialValues={initialValues}
      center={center}
      zoom={17}
      onSubmitProp={onSubmit}
      mapboxToken={mapboxToken}
    />
  );
};

export default CheckLocation;
