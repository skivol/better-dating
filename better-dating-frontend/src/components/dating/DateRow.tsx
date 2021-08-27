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
  CancelOrRescheduleDialog,
  DateMenu,
} from ".";
import { checkLocation, viewLocation } from "../navigation/NavigationUrls";
import { positionOptions } from "../administration/GeolocationDialog";
import { AddLocationButton } from "../location";

const toDateTime = (date: string) => format(parseISO(date), "yyyy-MM-dd HH:mm");

export const DateRow = ({
  otherUserNickname,
  user,
  currentUserIsFirstInPair,
  dateInfo: { id: dateId, status: dateStatus, whenScheduled, placeId },
  place,
  unsettledPlaces,
  credibility,
  improvement,
  otherCredibility,
  otherImprovement,
  index,
  setPairActive,
  setDate,
}: any) => {
  const relevantUnsettledPlace = () => {
    if (unsettledPlaces.length === 0) return {};
    if (unsettledPlaces.length === 1) return unsettledPlaces[0];
    const placeToApprove = unsettledPlaces.filter(
      (p: any) => p.suggestedBy !== user.id
    )[0];
    return placeToApprove;
  };
  const {
    name,
    status: placeStatus,
    latitude: placeLatitude,
    longitude: placeLongitude,
    suggestedBy,
  } = place || relevantUnsettledPlace();

  const router = useRouter();
  const { dialogIsOpen, openDialog, closeDialog } = useDialog();
  const [dialogType, setDialogType] = useState<string | null>(null);
  const dispatch = useDispatch();
  const { anchorEl, menuIsOpen, openMenu, closeMenu } = useMenu();

  const [loading, setLoading] = useState(false);
  const onVerify = ({ code }: any) => {
    setLoading(true);
    dispatch(actions.verifyDate({ code, dateId }))
      .then((status: string) => {
        closeDialog();
        closeMenu();
        status && setDate(dateId, { status });
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
    ) : dialogType === "cancelOrRescheduleDialog" ? (
      <CancelOrRescheduleDialog
        closeDialog={closeDialog}
        onCancelDate={() => {
          return dispatch(actions.cancelDate({ dateId })).then(
            (response: any) => {
              const { dateStatus, pairActive } = response || {};
              closeDialog();
              closeMenu();
              // think about error handling, currently we do not rethrow exception in from actions
              dateStatus && setDate(dateId, { status: dateStatus });
              pairActive !== undefined && setPairActive(pairActive);
            }
          );
        }}
        onRescheduleDate={() => {
          return dispatch(actions.rescheduleDate({ dateId }, placeId)).then(
            (response: any) => {
              const { date, place } = response || {};
              closeDialog();
              closeMenu();
              // think about error handling, currently we do not rethrow exception in from actions
              date && setDate(dateId, date, place);
            }
          );
        }}
      />
    ) : null);

  const waitingForPlace = dateStatus === "WaitingForPlace";
  const waitingForApproval =
    dateStatus === "WaitingForPlaceApproval" &&
    placeStatus === "WaitingForApproval";
  const currentUserApproves = waitingForApproval && suggestedBy !== user.id;
  const scheduled = dateStatus === "Scheduled";
  const partialCheckIn = dateStatus === "PartialCheckIn";
  const fullCheckIn = dateStatus === "FullCheckIn";
  const cancelled = dateStatus === "Cancelled";
  const rescheduled = dateStatus === "Rescheduled";

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
          // think about error handling, currently we do not rethrow exception in from actions
          status && setDate(dateId, { status });
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
            waitingForPlace
              ? currentUserIsFirstInPair
                ? "warning"
                : "info"
              : currentUserApproves
              ? "warning"
              : waitingForApproval
              ? "info"
              : cancelled
              ? "error"
              : rescheduled
              ? "warning"
              : "success"
          }
          variant="outlined"
        >
          {waitingForPlace ? (
            currentUserIsFirstInPair ? (
              <>
                <div className="u-margin-bottom-10px">
                  {Messages.youNeedToSuggestAPlace}
                </div>
                <AddLocationButton
                  dateId={dateId}
                  title={Messages.addPlace}
                  variant="contained"
                />
              </>
            ) : (
              Messages.otherUserShouldSuggestPlace
            )
          ) : currentUserApproves ? (
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
                  : cancelled
                  ? Messages.cancelled
                  : rescheduled
                  ? Messages.rescheduled
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
        {placeStatus === "Approved" ? (
          <Tooltip
            arrow
            placement="top"
            title={
              <>
                {<p>{name}</p>}
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
                if (!scheduled && !rescheduled && !partialCheckIn) {
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
            } else if (action === "cancel-or-reschedule") {
              setDialogType("cancelOrRescheduleDialog");
              openDialog();
            }
          }}
        />
      </TableCell>
      {dialog}
    </TableRow>
  );
};
