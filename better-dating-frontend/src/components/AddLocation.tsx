import { useMemo, useRef, useState } from "react";
import { useDispatch } from "react-redux";
import { useRouter } from "next/router";
import { Grid, Typography, Button, Paper, Divider } from "@material-ui/core";
import { Alert } from "@material-ui/lab";
import { Form } from "react-final-form";
import { TextField } from "mui-rff";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSave,
  faCheck,
  faMapMarkedAlt,
  faMapMarkerAlt,
} from "@fortawesome/free-solid-svg-icons";

import "leaflet/dist/leaflet.css";
import * as L from "leaflet";
import {
  MapContainer,
  TileLayer,
  Marker,
  Circle,
  Popup,
  useMapEvents,
} from "react-leaflet";

import { dating } from "./navigation/NavigationUrls";
import { useDateId, ReactMarkdownMaterialUi, required } from "../utils";
import { mapboxToken } from "../constants";
import { addPlace } from "../actions";
import { SpinnerAdornment } from "./common";
import * as Messages from "./Messages";

const icon = L.icon({
  ...L.Icon.Default.prototype.options,
  // https://github.com/PaulLeCam/react-leaflet/issues/808#issuecomment-747719927
  iconUrl: "/img/marker-icon.png",
  iconRetinaUrl: "/img/marker-icon-2x.png",
  shadowUrl: "/img/marker-shadow.png",
});

const DraggableMarkerWithState = (props: any) => {
  const [position, setPosition] = useState({});
  return (
    <DraggableMarker position={position} setPosition={setPosition} {...props} />
  );
};
const DraggableMarker = ({
  position,
  setPosition,
  disabled,
  reactsToUserLocation = true,
  circleColor,
  circleRadius = 10,
  popupText,
}: any) => {
  const map = useMapEvents({
    click(e) {
      if (!disabled) {
        setPosition(e.latlng);
      }
    },
    locationfound(e) {
      if (reactsToUserLocation) {
        setPosition(e.latlng);
      }
      if (!disabled) {
        map.flyTo(e.latlng, map.getZoom());
      }
    },
  });
  const markerRef = useRef<L.Marker | null>(null);
  const eventHandlers = useMemo(
    () => ({
      dragend() {
        const marker = markerRef.current;
        if (marker != null) {
          setPosition(marker.getLatLng());
        }
      },
    }),
    []
  );

  return position.lng && position.lat ? (
    <>
      <Marker
        draggable={!disabled}
        eventHandlers={eventHandlers}
        position={position}
        ref={markerRef}
        icon={icon}
      >
        {popupText && <Popup>{popupText}</Popup>}
      </Marker>
      {circleColor && (
        <Circle
          pathOptions={{ color: circleColor }}
          center={position}
          radius={circleRadius}
        />
      )}
    </>
  ) : null;
};

export enum Mode {
  add,
  check,
  view,
}

export const LocationForm = ({
  initialValues = {},
  center,
  zoom,
  onSubmitProp,
  mode = Mode.add,
}: any) => {
  const [saving, setSaving] = useState(false);
  let map: L.Map | null = null;

  const onSubmit = (values: any) => {
    setSaving(true);
    onSubmitProp(values).finally(() => setSaving(false));
  };

  const adding = mode === Mode.add;
  const checking = mode === Mode.check;
  const viewing = mode === Mode.view;
  const title = adding
    ? Messages.addLocation
    : checking
    ? Messages.checkLocation
    : Messages.viewLocation;

  return (
    <Form
      initialValues={initialValues}
      onSubmit={onSubmit}
      render={({ handleSubmit, values, pristine, form }) => {
        const setPosition = (value: any) => {
          form.change("lat", value.lat);
          form.change("lng", value.lng);
        };
        return (
          <form onSubmit={handleSubmit}>
            <Paper elevation={1} className="u-padding-10px">
              <Grid
                direction="column"
                container
                spacing={3}
                style={{ marginTop: 10 }}
              >
                <Grid item>
                  <Paper elevation={2} className="u-padding-15px">
                    <Typography variant="h3" className="u-text-align-center">
                      <FontAwesomeIcon
                        icon={faMapMarkedAlt}
                        size="sm"
                        className="u-right-margin-10px"
                      />
                      {title}
                    </Typography>
                  </Paper>
                </Grid>
                {!viewing && (
                  <Grid item>
                    <Alert severity="info" variant="outlined">
                      <ReactMarkdownMaterialUi>
                        {Messages.addPlaceInformation}
                      </ReactMarkdownMaterialUi>
                    </Alert>
                  </Grid>
                )}
                {adding && (
                  <>
                    <Grid item>
                      <Alert severity="info" variant="outlined">
                        <ReactMarkdownMaterialUi>
                          {Messages.otherUserApproves}
                        </ReactMarkdownMaterialUi>
                      </Alert>
                    </Grid>
                    <Grid item>
                      <Alert severity="success" variant="outlined">
                        <ReactMarkdownMaterialUi>
                          {Messages.useTheMapAndTryToBeAccurate}
                        </ReactMarkdownMaterialUi>
                      </Alert>
                    </Grid>
                  </>
                )}

                <Grid item>
                  <MapContainer
                    dragging={!viewing}
                    doubleClickZoom={!viewing}
                    minZoom={!viewing ? undefined : zoom - 1}
                    maxZoom={!viewing ? undefined : zoom + 1}
                    scrollWheelZoom={!viewing}
                    center={center}
                    zoom={zoom}
                    style={{ height: 360 }}
                    whenCreated={(createdMap) => {
                      map = createdMap;
                    }}
                  >
                    <TileLayer
                      attribution='Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>'
                      url="https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}"
                      accessToken={mapboxToken}
                      tileSize={512}
                      zoomOffset={-1}
                      maxZoom={18}
                      id="skivol/ckpimp0lc0bme18pbwegnv6ih"
                    />
                    <DraggableMarker
                      disabled={!adding}
                      reactsToUserLocation={adding}
                      position={{ lng: values.lng, lat: values.lat }}
                      setPosition={setPosition}
                      circleColor={viewing ? "green" : undefined}
                      popupText={
                        viewing ? Messages.meetingPlacePopup : undefined
                      }
                    />
                    {viewing && (
                      <DraggableMarkerWithState
                        disabled
                        reactsToUserLocation
                        circleColor="blue"
                        circleRadius="3"
                        popupText={Messages.myLocationPopup}
                      />
                    )}
                  </MapContainer>
                </Grid>

                <Grid item>
                  <TextField
                    disabled={!adding}
                    name="name"
                    label={Messages.name}
                    variant="outlined"
                    type="text"
                    fieldProps={{ validate: required }}
                  />
                </Grid>
                <Grid item>
                  <TextField
                    disabled={!adding}
                    required
                    name="lng"
                    label={Messages.longitude}
                    variant="outlined"
                    type="number"
                    fieldProps={{ validate: required }}
                  />
                </Grid>
                <Grid item>
                  <TextField
                    disabled={!adding}
                    required
                    name="lat"
                    label={Messages.latitude}
                    variant="outlined"
                    type="number"
                    fieldProps={{ validate: required }}
                  />
                </Grid>
                {checking && (
                  <Grid item>
                    <Alert severity="info" variant="outlined">
                      <ReactMarkdownMaterialUi>
                        {Messages.approvalMeaning}
                      </ReactMarkdownMaterialUi>
                    </Alert>
                  </Grid>
                )}
                <Grid item style={{ alignSelf: "center" }}>
                  <Grid container>
                    {adding || viewing ? (
                      <Button
                        color="secondary"
                        variant="contained"
                        onClick={() => map && map.locate()}
                        startIcon={<FontAwesomeIcon icon={faMapMarkerAlt} />}
                      >
                        {Messages.myLocation}
                      </Button>
                    ) : (
                      <Button
                        color="secondary"
                        style={{ color: "red" }}
                        variant="outlined"
                        onClick={() =>
                          // TODO
                          alert("TODO: implement suggesting other place")
                        }
                        startIcon={<FontAwesomeIcon icon={faMapMarkerAlt} />}
                      >
                        {Messages.suggestOtherPlace}
                      </Button>
                    )}
                    {!viewing && (
                      <>
                        <Divider
                          orientation="vertical"
                          className="u-margin-10px"
                          style={{ height: 25 }}
                          flexItem
                        />
                        <Button
                          color="primary"
                          style={{ background: "green" }}
                          type="submit"
                          variant="contained"
                          disabled={(adding && pristine) || saving}
                          startIcon={
                            saving ? (
                              <SpinnerAdornment />
                            ) : (
                              <FontAwesomeIcon
                                icon={checking ? faCheck : faSave}
                              />
                            )
                          }
                        >
                          {checking ? Messages.approve : Messages.add}
                        </Button>
                      </>
                    )}
                  </Grid>
                </Grid>
              </Grid>
            </Paper>
          </form>
        );
      }}
    />
  );
};

type Props = {
  coordinates: { lat: number; lng: number; specific: boolean };
};
const AddLocation = ({ coordinates }: Props) => {
  const router = useRouter();
  const dispatch = useDispatch();
  const dateId = useDateId();

  const { lat, lng, specific } = coordinates;
  const zoom = specific ? 13 : 5; // zoom closer if could find specific place coordinates
  const center = { lat, lng };

  const onSubmit = (values: any) =>
    dispatch(addPlace({ dateId, ...values })).then(() => router.push(dating));

  return <LocationForm center={center} zoom={zoom} onSubmitProp={onSubmit} />;
};

export default AddLocation;
