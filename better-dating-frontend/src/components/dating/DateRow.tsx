import { useState } from "react";
import { parseISO, formatISO, format, formatDistanceToNow } from "date-fns";
import { useDispatch } from "react-redux";
import { ru } from "date-fns/locale";
import { useRouter } from "next/router";
import {
  Typography,
  TableCell,
  TableRow,
  IconButton,
  Tooltip,
  Button,
} from "@material-ui/core";
import { Alert } from "@material-ui/lab";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faMapMarkedAlt,
  faInfoCircle,
  faEllipsisV,
} from "@fortawesome/free-solid-svg-icons";
import { SnackbarVariant } from "../../types";
import { useDialog, useMenu, showError, truncate } from "../../utils";
import * as actions from "../../actions";
import * as Messages from "../Messages";
import { dateIdName } from "../../Messages";
import {
  AdvicesDialog,
  VerifyDateDialog,
  EvaluateProfileDialog,
  DateMenu,
} from ".";
import { checkLocation, viewLocation } from "../navigation/NavigationUrls";
import { positionOptions } from "../administration/GeolocationDialog";

const toDateTime = (date: string) => format(parseISO(date), "yyyy-MM-dd HH:mm");

export const DateRow = ({
  otherUserNickname,
  user,
  dateInfo: {
    id: dateId,
    status: dateStatus,
    latitude,
    longitude,
    whenScheduled,
  },
  place: {
    name,
    status: placeStatus,
    latitude: placeLatitude,
    longitude: placeLongitude,
    suggestedBy,
  },
  credibility,
  improvement,
  otherCredibility,
  otherImprovement,
  index,
}: any) => {
  const router = useRouter();
  const { dialogIsOpen, openDialog, closeDialog } = useDialog();
  const [dialogType, setDialogType] = useState<string | null>(null);
  const dispatch = useDispatch();
  const { anchorEl, menuIsOpen, openMenu, closeMenu } = useMenu();

  const [dateStatusState, setDateStatus] = useState<string>(dateStatus);
  const [loading, setLoading] = useState(false);
  const onVerify = ({ code }: any) => {
    setLoading(true);
    dispatch(actions.verifyDate({ code, dateId }))
      .then((status: string) => {
        closeDialog();
        closeMenu();
        setDateStatus(status);
      })
      .finally(() => setLoading(false));
  };

  const onEvaluateProfile = (values: any) => {
    setLoading(true);
    dispatch(actions.evaluateProfile({ dateId, ...values }))
      .then(() => {
        closeDialog();
        closeMenu();
      })
      .finally(() => setLoading(false));
  };

  const dialog =
    dialogIsOpen &&
    (dialogType === "advicesDialog" ? (
      <AdvicesDialog closeDialog={closeDialog} />
    ) : dialogType === "verifyDateDialog" ? (
      <VerifyDateDialog
        closeDialog={closeDialog}
        onVerify={onVerify}
        verifying={loading}
      />
    ) : dialogType === "evaluateProfileDialog" ? (
      <EvaluateProfileDialog
        readonly={otherCredibility !== null}
        data={{ credibility: otherCredibility, improvement: otherImprovement }}
        closeDialog={closeDialog}
        onEvaluate={onEvaluateProfile}
        evaluating={loading}
      />
    ) : dialogType === "viewPofileEvaluationDialog" ? (
      <EvaluateProfileDialog
        readonly
        data={{ credibility, improvement }}
        closeDialog={closeDialog}
        onEvaluate={onEvaluateProfile}
        evaluating={loading}
      />
    ) : null);

  const waitingForApproval =
    dateStatusState === "PlaceSuggested" &&
    placeStatus === "WaitingForApproval";
  const currentUserApproves = waitingForApproval && suggestedBy !== user.id;
  const originalPlaceWasNotChanged =
    latitude === placeLatitude && longitude === placeLongitude;
  const scheduled = dateStatusState === "Scheduled";
  const partialCheckIn = dateStatusState === "PartialCheckIn";
  const fullCheckIn = dateStatusState === "FullCheckIn";

  const [checkingIn, setCheckingIn] = useState(false);
  const handleCheckInAttempt = () => {
    const showSnackbarError = (message = Messages.geolocationNeeded) =>
      dispatch(actions.openSnackbar(message, SnackbarVariant.error));
    if (!navigator.geolocation) {
      showSnackbarError();
      return;
    }
    const cleanupSubscriptions = () => {
      navigator.geolocation.clearWatch(watchPositionId);
      clearTimeout(timeoutId);
    };
    const peformCheckIn = (position: any) => {
      const {
        coords: { accuracy, latitude, longitude },
        timestamp,
      } = position;
      const accuracyThreshold = 10;
      if (accuracy > accuracyThreshold) {
        return;
      }
      cleanupSubscriptions(); // to avoid doing parallel check-in attempts / timeout handling

      dispatch(
        actions.checkIn({
          dateId,
          latitude,
          longitude,
          timestamp: formatISO(new Date(timestamp)),
        })
      )
        .then((status: string) => {
          closeMenu();
          setDateStatus(status);
        })
        .finally(() => setCheckingIn(false));
    };

    setCheckingIn(true);
    const watchPositionId = navigator.geolocation.watchPosition(
      peformCheckIn,
      () => {
        showSnackbarError();
        cleanupSubscriptions();
        setCheckingIn(false);
      },
      positionOptions
    );
    const timeoutId = setTimeout(() => {
      showSnackbarError(Messages.geolocationAccuracyIsPoor);
      cleanupSubscriptions();
      setCheckingIn(false);
    }, 10000);
  };
  return (
    <TableRow key={index}>
      <TableCell>{index + 1}</TableCell>
      <TableCell>
        <Alert
          severity={
            currentUserApproves
              ? "warning"
              : waitingForApproval
              ? "info"
              : "success"
          }
          variant="outlined"
        >
          {currentUserApproves ? (
            <>
              <div className="u-margin-bottom-10px">
                {Messages.placeNeedsYourApproval}
              </div>
              <Button
                color="secondary"
                onClick={() => {
                  router.push({
                    pathname: checkLocation,
                    query: {
                      [dateIdName]: dateId,
                    },
                  });
                }}
                variant="contained"
                startIcon={<FontAwesomeIcon icon={faMapMarkedAlt} />}
              >
                {Messages.checkPlace}
              </Button>
            </>
          ) : waitingForApproval ? (
            Messages.placeIsWaitingForApprovalByOtherUser
          ) : (
            <>
              <div className="u-margin-bottom-10px">
                {scheduled
                  ? Messages.dateIsScheduled
                  : partialCheckIn
                  ? Messages.partialCheckIn
                  : fullCheckIn
                  ? Messages.fullCheckIn
                  : Messages.verified}
              </div>
              <Button
                color="secondary"
                onClick={() => {
                  setDialogType("advicesDialog");
                  openDialog();
                }}
                variant="contained"
                startIcon={<FontAwesomeIcon icon={faInfoCircle} />}
              >
                <Typography
                  style={{
                    fontSize: "smaller",
                  }}
                >
                  {Messages.whatIsNext}
                </Typography>
              </Button>
            </>
          )}
        </Alert>
      </TableCell>
      <TableCell>
        {latitude ? (
          <Tooltip
            arrow
            placement="top"
            title={
              <>
                {originalPlaceWasNotChanged && <p>{name}</p>}
                <p>{`${placeLatitude},${placeLongitude}`}</p>
                <p>{`(${Messages.latitudeLongitude})`}</p>
              </>
            }
          >
            <IconButton
              color="secondary"
              aria-label={Messages.viewPlace}
              size="medium"
              onClick={() => {
                if (!scheduled && !partialCheckIn) {
                  showError(
                    dispatch,
                    Messages.canViewPlaceOnlyWhilePreparingToGoOnDate
                  );
                  return;
                }
                router.push({
                  pathname: viewLocation,
                  query: {
                    [dateIdName]: dateId,
                  },
                });
              }}
            >
              <FontAwesomeIcon icon={faMapMarkedAlt} />
            </IconButton>
          </Tooltip>
        ) : (
          Messages.placeIsNotSettledYet
        )}
      </TableCell>
      <TableCell>
        {whenScheduled
          ? `${toDateTime(whenScheduled)} (${formatDistanceToNow(
              parseISO(whenScheduled),
              {
                locale: ru,
                addSuffix: true,
              }
            )})`
          : Messages.notYetScheduled}
      </TableCell>
      <TableCell>
        <IconButton color="secondary" onClick={openMenu}>
          <FontAwesomeIcon icon={faEllipsisV} size="lg" />
        </IconButton>
        <DateMenu
          otherUserNickname={truncate(otherUserNickname)}
          anchorEl={anchorEl}
          menuIsOpen={menuIsOpen}
          closeMenu={closeMenu}
          checkingIn={checkingIn}
          onClick={(action: string) => {
            if (action === "check-in") {
              handleCheckInAttempt();
            } else if (action === "verify-date") {
              setDialogType("verifyDateDialog");
              openDialog();
            } else if (action === "evaluate-profile") {
              setDialogType("evaluateProfileDialog");
              openDialog();
            } else if (action === "view-profile-evaluation") {
              if (credibility === null) {
                showError(
                  dispatch,
                  Messages.evaluationIsNotYetAddedByOtherUser
                );
              } else {
                setDialogType("viewPofileEvaluationDialog");
                openDialog();
              }
            }
          }}
        />
      </TableCell>
      {dialog}
    </TableRow>
  );
};
