import { useState, useEffect, ChangeEvent } from "react";
import { parseISO, formatISO } from "date-fns";
import { useDispatch } from "react-redux";
import {
  AppBar,
  Tabs,
  Tab,
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
} from "@material-ui/core";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUserFriends, faBinoculars } from "@fortawesome/free-solid-svg-icons";
import { useUser, useDialog, TabPanel } from "../utils";
import * as actions from "../actions";
import * as Messages from "./Messages";
import { SpinnerAdornment as Spinner } from "./common";
import { ViewOtherUserProfileConfirm } from "./profile";
import * as SecondStageMessages from "./profile/second-stage/Messages";

type Props = {
  datingData: any;
};

const toDate = (date: string) =>
  formatISO(parseISO(date), { representation: "date" });

export const Dating = ({ datingData }: Props) => {
  const [selectedTab, setSelectedTab] = useState(0);

  const handleTabChange = (event: ChangeEvent<unknown>, newTab: number) => {
    setSelectedTab(newTab);
  };

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
              <FontAwesomeIcon icon={faUserFriends} /> {Messages.Dating}
            </Typography>
          </div>
        </Paper>
      </Grid>
      <AppBar position="static" color="default">
        <Tabs
          value={selectedTab}
          onChange={handleTabChange}
          variant="fullWidth"
          aria-label={Messages.datingTabsAria}
        >
          <Tab label={Messages.pairsTab} />
          <Tab label={Messages.dateTimePlaceTab} />
        </Tabs>
      </AppBar>
      <Grid container direction="column" spacing={2} className="u-padding-10px">
        <Paper className="u-padding-10px">
          <TabPanel value={selectedTab} index={0}>
            <TableContainer
              component={Paper}
              className="u-margin-top-bottom-10px"
            >
              <Table
                size="medium"
                className="c-pairs-table"
                aria-label={Messages.datingTableAria}
              >
                <TableHead>
                  <TableRow>
                    <TableCell style={{ width: "10px" }}>#</TableCell>
                    <TableCell style={{ minWidth: "50px" }}>
                      {Messages.user1}
                    </TableCell>
                    <TableCell style={{ minWidth: "50px" }}>
                      {Messages.user2}
                    </TableCell>
                    <TableCell style={{ width: "40px" }}>
                      {Messages.dateStatus}
                    </TableCell>
                    <TableCell style={{ width: "40px" }}>
                      {Messages.goal}
                    </TableCell>
                    <TableCell style={{ width: "110px" }}>
                      {Messages.whenMatched}
                    </TableCell>
                    <TableCell></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {datingData.pairs.map(
                    (
                      {
                        firstProfileNickname,
                        secondProfileNickname,
                        datingPair: {
                          firstProfileId,
                          secondProfileId,
                          active,
                          goal,
                          whenMatched,
                        },
                      }: any,
                      i: number
                    ) => {
                      const currentUserIsFirstInPair =
                        user.id === firstProfileId;
                      const message = Messages.viewMatchedUserProfile(
                        currentUserIsFirstInPair
                          ? secondProfileNickname
                          : firstProfileNickname
                      );
                      return (
                        <TableRow key={i}>
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
          </TabPanel>
          <TabPanel value={selectedTab} index={1}>
            Dates
          </TabPanel>
        </Paper>
      </Grid>
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
    </Grid>
  );
};
