import { useRouter } from "next/router";
import { Button } from "@material-ui/core";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMapMarkerAlt } from "@fortawesome/free-solid-svg-icons";
import { addLocation } from "../navigation/NavigationUrls";
import { dateIdName } from "../../Messages";

export const AddLocationButton = ({ title, dateId, variant, color }: any) => {
  const router = useRouter();

  return (
    <Button
      color="secondary"
      style={color && { color: "red" }}
      variant={variant}
      onClick={() =>
        router.push({
          pathname: addLocation,
          query: { [dateIdName]: dateId },
        })
      }
      startIcon={<FontAwesomeIcon icon={faMapMarkerAlt} />}
    >
      {title}
    </Button>
  );
};
