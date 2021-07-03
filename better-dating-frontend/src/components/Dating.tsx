import { useState } from "react";
import { parseISO, formatISO, format, formatDistanceToNow } from "date-fns";
import { ru } from "date-fns/locale";
import { useDispatch } from "react-redux";
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
} from "@material-ui/core";
import { Alert } from "@material-ui/lab";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUserFriends,
  faBinoculars,
  faMapMarkedAlt,
} from "@fortawesome/free-solid-svg-icons";

import KeyboardArrowDownIcon from "@material-ui/icons/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@material-ui/icons/KeyboardArrowUp";

import { useUser, useDialog } from "../utils";
import * as actions from "../actions";
import * as Messages from "./Messages";
import { dateIdName } from "../Messages";
import { SpinnerAdornment as Spinner } from "./common";
import { ViewOtherUserProfileConfirm } from "./profile";
import * as SecondStageMessages from "./profile/second-stage/Messages";
import { checkLocation } from "./navigation/NavigationUrls";

const PairsAndDates = ({ datingData, user }: any) => {
  const router = useRouter();
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
                            <Box margin={1}>
                              <Typography
                                variant="h6"
                                gutterBottom
                                component="div"
                              >
                                {Messages.dates}
                              </Typography>
                              <TableContainer
                                component={Paper}
                                className="u-margin-top-bottom-10px"
                              >
                                <Table size="medium" className="c-dating-table">
                                  <TableHead>
                                    <TableRow>
                                      <TableCell />
                                      <TableCell style={{ width: "200px" }}>
                                        {Messages.dateStatus}
                                      </TableCell>
                                      <TableCell style={{ width: "110px" }}>
                                        {Messages.where}
                                      </TableCell>
                                      <TableCell style={{ width: "110px" }}>
                                        {Messages.whenScheduled}
                                      </TableCell>
                                    </TableRow>
                                  </TableHead>
                                  <TableBody>
                                    {visibleDates.map(
                                      (
                                        {
                                          dateInfo: {
                                            id: dateId,
                                            status: dateStatus,
                                            latitude,
                                            longitude,
                                            whenScheduled,
                                          },
                                          place: {
                                            status: placeStatus,
                                            suggestedBy,
                                          },
                                        }: any,
                                        i: number
                                      ) => {
                                        const waitingForApproval =
                                          dateStatus === "waitingForPlace" &&
                                          placeStatus === "waitingForApproval";
                                        const currentUserApproves =
                                          waitingForApproval &&
                                          suggestedBy !== user.id;
                                        return (
                                          <TableRow key={i}>
                                            <TableCell>{i + 1}</TableCell>
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
                                                    <div
                                                      style={{
                                                        width: "200px",
                                                        marginBottom: "10px",
                                                      }}
                                                    >
                                                      {
                                                        Messages.placeNeedsYourApproval
                                                      }
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
                                                      startIcon={
                                                        <FontAwesomeIcon
                                                          icon={faMapMarkedAlt}
                                                        />
                                                      }
                                                    >
                                                      {Messages.checkPlace}
                                                    </Button>
                                                  </>
                                                ) : waitingForApproval ? (
                                                  Messages.placeIsWaitingForApprovalByOtherUser
                                                ) : (
                                                  Messages.dateIsScheduled
                                                )}
                                              </Alert>
                                            </TableCell>
                                            <TableCell>
                                              {latitude
                                                ? `${latitude},${longitude}`
                                                : Messages.placeIsNotSettledYet}
                                            </TableCell>
                                            <TableCell>
                                              {whenScheduled
                                                ? `${toDateTime(
                                                    whenScheduled
                                                  )} (${formatDistanceToNow(
                                                    parseISO(whenScheduled),
                                                    {
                                                      locale: ru,
                                                      addSuffix: true,
                                                    }
                                                  )})`
                                                : Messages.notYetScheduled}
                                            </TableCell>
                                          </TableRow>
                                        );
                                      }
                                    )}
                                  </TableBody>
                                </Table>
                              </TableContainer>
                            </Box>
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
      {dialogIsOpen && (
        <ViewOtherUserProfileConfirm
          title={Messages.areYouSureThatWantToOtherUsersProfile(
            targetNicknameAndId.nickname
          )}
          loading={loading}
          dialogIsOpen
          closeDialog={closeDialog}
          onConfirm={onRequestViewOtherUserProfile}
        />
      )}
    </>
  );
};

type Props = {
  datingData: any;
};

const toDate = (date: string) =>
  formatISO(parseISO(date), { representation: "date" });
const toDateTime = (date: string) => format(parseISO(date), "yyyy-MM-dd hh:mm");

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
