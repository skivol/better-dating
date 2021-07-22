import { useState, CSSProperties } from "react";
import { parseISO, formatISO, format, formatDistanceToNow } from "date-fns";
import { ru } from "date-fns/locale";
import { useDispatch } from "react-redux";
import { Form } from "react-final-form";
import { useRouter } from "next/router";
import {
  Grid,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  IconButton,
  Tooltip,
  Collapse,
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
} from "@material-ui/core";
import { Close } from "@material-ui/icons";
import { Alert } from "@material-ui/lab";
import { TextField } from "mui-rff";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUserFriends,
  faBinoculars,
  faMapMarkedAlt,
  faInfoCircle,
  faEllipsisV,
  faCheckDouble,
} from "@fortawesome/free-solid-svg-icons";

import KeyboardArrowDownIcon from "@material-ui/icons/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@material-ui/icons/KeyboardArrowUp";

import { SnackbarVariant } from "../types";
import {
  useUser,
  useDialog,
  useMenu,
  ReactMarkdownMaterialUi,
  showError,
} from "../utils";
import * as actions from "../actions";
import * as Messages from "./Messages";
import { dateIdName } from "../Messages";
import * as SecondStageMessages from "./profile/second-stage/Messages";
import { SpinnerAdornment as Spinner } from "./common";
import { ViewOtherUserProfileConfirm } from "./profile";
import { DateMenu } from "./dating/DateMenu";
import { checkLocation, viewLocation } from "./navigation/NavigationUrls";

const topRightPosition: CSSProperties = {
  position: "absolute",
  right: "10px",
  top: "10px",
};

const DateRow = ({
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
  index,
}: any) => {
  const router = useRouter();
  const { dialogIsOpen, openDialog, closeDialog } = useDialog();
  const [dialogType, setDialogType] = useState<string | null>(null);
  const dispatch = useDispatch();
  const { anchorEl, menuIsOpen, openMenu, closeMenu } = useMenu();

  const [dateStatusState, setDateStatus] = useState<string>(dateStatus);
  const [verifying, setVerifying] = useState(false);
  const onVerify = ({ code }: any) => {
    setVerifying(true);
    dispatch(actions.verifyDate({ code, dateId }))
      .then((status: string) => {
        closeDialog();
        closeMenu();
        setDateStatus(status);
      })
      .finally(() => setVerifying(false));
  };

  const dialog =
    dialogIsOpen &&
    (dialogType === "advicesDialog" ? (
      <Dialog
        open
        onClose={closeDialog}
        scroll="body"
        aria-describedby="scroll-dialog-description"
        PaperProps={{ className: "u-max-width-800px" }}
      >
        <DialogContent dividers={false}>
          <DialogTitle>
            <Typography variant="h6">
              {Messages.dateIsOrganizedWhatIsNextTitle}
            </Typography>
            <IconButton
              aria-label="close"
              style={topRightPosition}
              onClick={closeDialog}
            >
              <Close />
            </IconButton>
          </DialogTitle>
          <ReactMarkdownMaterialUi>
            {Messages.dateIsOrganizedWhatIsNext}
          </ReactMarkdownMaterialUi>
        </DialogContent>
      </Dialog>
    ) : dialogType === "verifyDateDialog" ? (
      <Dialog
        open
        onClose={closeDialog}
        PaperProps={{ className: "u-min-width-450px" }}
      >
        <DialogContent dividers={false}>
          <DialogTitle>
            <IconButton
              aria-label="close"
              style={topRightPosition}
              onClick={closeDialog}
            >
              <Close />
            </IconButton>
          </DialogTitle>
          <Form
            onSubmit={onVerify}
            render={({ handleSubmit, pristine }) => {
              return (
                <form onSubmit={handleSubmit}>
                  <Grid container>
                    <TextField
                      style={{ display: "flex" }}
                      required
                      name="code"
                      label={Messages.code}
                      variant="outlined"
                      type="number"
                      inputProps={{
                        "aria-label": Messages.code,
                      }}
                    />
                    <Button
                      style={{ marginLeft: "auto" }}
                      color="primary"
                      type="submit"
                      disabled={pristine || verifying}
                      startIcon={
                        verifying ? (
                          <Spinner color="lightgray" />
                        ) : (
                          <FontAwesomeIcon icon={faCheckDouble} />
                        )
                      }
                    >
                      {Messages.verifyDate}
                    </Button>
                  </Grid>
                </form>
              );
            }}
          />
        </DialogContent>
      </Dialog>
    ) : null);

  const waitingForApproval =
    dateStatusState === "placeSuggested" &&
    placeStatus === "waitingForApproval";
  const currentUserApproves = waitingForApproval && suggestedBy !== user.id;
  const originalPlaceWasNotChanged =
    latitude === placeLatitude && longitude === placeLongitude;
  const scheduled = dateStatusState === "scheduled";
  const partialCheckIn = dateStatusState === "partialCheckIn";
  const fullCheckIn = dateStatusState === "fullCheckIn";

  const [checkingIn, setCheckingIn] = useState(false);
  const handleCheckInAttempt = () => {
    const showSnackbarError = () =>
      dispatch(
        actions.openSnackbar(Messages.geolocationNeeded, SnackbarVariant.error)
      );
    if (!navigator.geolocation) {
      showSnackbarError();
      return;
    }
    const peformCheckIn = (position: any) => {
      const {
        coords: { accuracy, latitude, longitude },
        timestamp,
      } = position;
      // TODO const accuracyThreshold = 10;
      const accuracyThreshold = 200;
      if (accuracy > accuracyThreshold) {
        dispatch(
          actions.openSnackbar(
            Messages.geolocationAccuracyIsPoor,
            SnackbarVariant.error
          )
        );
        return;
      }
      setCheckingIn(true);
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
    navigator.geolocation.getCurrentPosition(peformCheckIn, showSnackbarError);
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
                if (!scheduled) {
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
            }
          }}
        />
      </TableCell>
      {dialog}
    </TableRow>
  );
};

const DatesTable = ({ user, dates }: any) => {
  return (
    <Box margin={1}>
      <Typography variant="h6" gutterBottom component="div">
        {Messages.dates}
      </Typography>
      <TableContainer component={Paper} className="u-margin-top-bottom-10px">
        <Table size="medium" className="c-dating-table">
          <TableHead>
            <TableRow>
              <TableCell />
              <TableCell style={{ width: "300px" }}>
                {Messages.dateStatus}
              </TableCell>
              <TableCell>{Messages.where}</TableCell>
              <TableCell>{Messages.whenScheduled}</TableCell>
              <TableCell />
            </TableRow>
          </TableHead>
          <TableBody>
            {dates.map(({ dateInfo, place }: any, i: number) => (
              <DateRow
                user={user}
                dateInfo={dateInfo}
                place={place}
                index={i}
              />
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

const PairsAndDates = ({ datingData, user }: any) => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const handleChangePage = (event: any, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: any) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const { dialogIsOpen, openDialog, closeDialog } = useDialog();
  const [dialogType, setDialogType] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);
  const [targetNicknameAndId, setTargetNicknameAndId] = useState({
    id: "",
    nickname: "",
  });
  const dispatch = useDispatch();
  const onRequestViewOtherUserProfile = () => {
    setLoading(true);
    dispatch(actions.viewOtherUserProfile(targetNicknameAndId))
      .then(() => {
        closeDialog();
      })
      .finally(() => setLoading(false));
  };
  const dialog =
    dialogIsOpen &&
    (dialogType == "viewOtherUserProfile" ? (
      <ViewOtherUserProfileConfirm
        title={Messages.areYouSureThatWantToOtherUsersProfile(
          targetNicknameAndId.nickname
        )}
        loading={loading}
        dialogIsOpen
        closeDialog={closeDialog}
        onConfirm={onRequestViewOtherUserProfile}
      />
    ) : null);

  return (
    <>
      <TableContainer component={Paper} className="u-margin-top-bottom-10px">
        <Table
          size="medium"
          className="c-pairs-table"
          aria-label={Messages.datingTableAria}
        >
          <TableHead>
            <TableRow>
              <TableCell />
              <TableCell style={{ width: "10px" }} />
              <TableCell style={{ minWidth: "50px" }}>
                {Messages.user1}
              </TableCell>
              <TableCell style={{ minWidth: "50px" }}>
                {Messages.user2}
              </TableCell>
              <TableCell style={{ width: "40px" }}>
                {Messages.dateStatus}
              </TableCell>
              <TableCell style={{ width: "40px" }}>{Messages.goal}</TableCell>
              <TableCell style={{ width: "110px" }}>
                {Messages.whenMatched}
              </TableCell>
              <TableCell />
            </TableRow>
          </TableHead>
          <TableBody>
            {datingData.pairs.map(
              (
                {
                  firstProfileNickname,
                  secondProfileNickname,
                  datingPair: {
                    id: pairId,
                    firstProfileId,
                    secondProfileId,
                    active,
                    goal,
                    whenMatched,
                  },
                }: any,
                i: number
              ) => {
                const currentUserIsFirstInPair = user.id === firstProfileId;
                const message = Messages.viewMatchedUserProfile(
                  currentUserIsFirstInPair
                    ? secondProfileNickname
                    : firstProfileNickname
                );
                const [open, setOpen] = useState(active);
                const visibleDates = datingData.dates.filter(
                  (d: any) => d.dateInfo.pairId === pairId && d.place
                );
                const hasSomeDates = visibleDates.length > 0;
                return (
                  <>
                    <TableRow key={i}>
                      {hasSomeDates && (
                        <TableCell>
                          <IconButton
                            aria-label="expand row"
                            size="small"
                            onClick={() => setOpen(!open)}
                          >
                            {open ? (
                              <KeyboardArrowUpIcon />
                            ) : (
                              <KeyboardArrowDownIcon />
                            )}
                          </IconButton>
                        </TableCell>
                      )}
                      <TableCell>{i + 1}</TableCell>
                      <TableCell>{firstProfileNickname}</TableCell>
                      <TableCell>{secondProfileNickname}</TableCell>
                      <TableCell>
                        {active ? Messages.active : Messages.inactive}
                      </TableCell>
                      <TableCell>
                        {goal === "findSoulMate"
                          ? SecondStageMessages.findSoulMate
                          : SecondStageMessages.unknown}
                      </TableCell>
                      <TableCell>{toDate(whenMatched)}</TableCell>
                      <TableCell>
                        <Tooltip arrow title={message} placement="top">
                          <IconButton
                            color="primary"
                            aria-label={message}
                            component="span"
                            onClick={() => {
                              setTargetNicknameAndId({
                                id: currentUserIsFirstInPair
                                  ? secondProfileId
                                  : firstProfileId,
                                nickname: currentUserIsFirstInPair
                                  ? secondProfileNickname
                                  : firstProfileNickname,
                              });
                              setDialogType("viewOtherUserProfile");
                              openDialog();
                            }}
                          >
                            <FontAwesomeIcon icon={faBinoculars} />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                    {hasSomeDates && (
                      <TableRow>
                        <TableCell
                          style={{ paddingBottom: 0, paddingTop: 0 }}
                          colSpan={8}
                        >
                          <Collapse in={open} timeout="auto" unmountOnExit>
                            <DatesTable user={user} dates={visibleDates} />
                          </Collapse>
                        </TableCell>
                      </TableRow>
                    )}
                  </>
                );
              }
            )}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        rowsPerPageOptions={[5, 10, 25]}
        component="div"
        count={datingData.pairs.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onChangePage={handleChangePage}
        onChangeRowsPerPage={handleChangeRowsPerPage}
      />
      {dialog}
    </>
  );
};

type Props = {
  datingData: any;
};

const toDate = (date: string) =>
  formatISO(parseISO(date), { representation: "date" });
const toDateTime = (date: string) => format(parseISO(date), "yyyy-MM-dd HH:mm");

export const Dating = ({ datingData }: Props) => {
  const user = useUser();
  if (user.loading) {
    return <Spinner />;
  }

  return (
    <Grid
      container
      direction="column"
      className="u-margin-top-bottom-15px u-padding-10px"
      spacing={3}
    >
      <Grid item>
        <Paper elevation={3} className="u-padding-16px u-center-horizontally">
          <div className="u-center-horizontally u-margin-bottom-10px">
            <Typography variant="h3" className="u-bold u-text-align-center">
              <FontAwesomeIcon icon={faUserFriends} /> {Messages.PairsAndDates}
            </Typography>
          </div>
        </Paper>
      </Grid>
      <Grid container direction="column" spacing={2} className="u-padding-10px">
        <Paper className="u-padding-10px">
          <PairsAndDates datingData={datingData} user={user} />
        </Paper>
      </Grid>
    </Grid>
  );
};
