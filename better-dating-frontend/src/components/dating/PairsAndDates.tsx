import { useState } from "react";
import { useDispatch } from "react-redux";
import { parseISO, formatISO } from "date-fns";
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  IconButton,
  Collapse,
} from "@material-ui/core";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEllipsisV } from "@fortawesome/free-solid-svg-icons";

import KeyboardArrowDownIcon from "@material-ui/icons/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@material-ui/icons/KeyboardArrowUp";

import { useDialog, useMenu, truncate } from "../../utils";
import * as actions from "../../actions";
import * as Messages from "../Messages";
import * as SecondStageMessages from "../profile/second-stage/Messages";
import { ViewOtherUserProfileConfirm } from "../profile";
import { PairMenu, DatesTable, DecisionDialog } from ".";

const toDate = (date: string) =>
  formatISO(parseISO(date), { representation: "date" });

export const PairsAndDates = ({
  datingData,
  user,
  setPairActive,
  setDate,
}: any) => {
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

  const [targetPairId, setTargetPairId] = useState<string | null>(null);
  const onDecide = ({ decision }: any) => {
    setLoading(true);
    dispatch(actions.submitPairDecision({ decision, pairId: targetPairId }))
      .then((response: any) => {
        const { pairActive } = response || {};
        pairActive !== undefined && setPairActive(targetPairId, pairActive);
        closeDialog();
      })
      .finally(() => setLoading(false));
  };
  const [decision, setDecision] = useState<string | null>(null);
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
    ) : dialogType === "decisionDialog" ? (
      <DecisionDialog
        data={{ decision }}
        closeDialog={closeDialog}
        onDecide={onDecide}
        loading={loading}
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
              <TableCell style={{ width: "10px" }} />
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
              <TableCell style={{ minWidth: "110px" }}>
                {Messages.goal}
              </TableCell>
              <TableCell style={{ minWidth: "110px" }}>
                {Messages.whenMatched}
              </TableCell>
              <TableCell style={{ width: "10px" }} />
            </TableRow>
          </TableHead>
          <TableBody>
            {datingData.pairs
              .slice(page * rowsPerPage, (page + 1) * rowsPerPage)
              .map(
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
                    pairDecision,
                  }: any,
                  i: number
                ) => {
                  const currentUserIsFirstInPair = user.id === firstProfileId;
                  const otherUserNickname = currentUserIsFirstInPair
                    ? secondProfileNickname
                    : firstProfileNickname;
                  const viewMatchedUserProfile =
                    Messages.viewMatchedUserProfile(
                      truncate(otherUserNickname)
                    );
                  const [open, setOpen] = useState<boolean>(active);
                  const { anchorEl, menuIsOpen, openMenu, closeMenu } =
                    useMenu();
                  const visibleDates = datingData.dates.filter(
                    (d: any) => d.dateInfo.pairId === pairId
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
                          {goal === "FindSoulMate"
                            ? SecondStageMessages.findSoulMate
                            : SecondStageMessages.unknown}
                        </TableCell>
                        <TableCell>{toDate(whenMatched)}</TableCell>
                        <TableCell>
                          <IconButton color="secondary" onClick={openMenu}>
                            <FontAwesomeIcon icon={faEllipsisV} size="lg" />
                          </IconButton>
                          <PairMenu
                            anchorEl={anchorEl}
                            menuIsOpen={menuIsOpen}
                            closeMenu={closeMenu}
                            viewOtherUserProfileTitle={viewMatchedUserProfile}
                            onViewOtherUserProfile={() => {
                              setTargetNicknameAndId({
                                id: currentUserIsFirstInPair
                                  ? secondProfileId
                                  : firstProfileId,
                                nickname: otherUserNickname,
                              });
                              setDialogType("viewOtherUserProfile");
                              openDialog();
                            }}
                            onDecisionDialog={() => {
                              setTargetPairId(pairId);
                              setDecision(pairDecision?.decision);
                              setDialogType("decisionDialog");
                              openDialog();
                            }}
                          />
                        </TableCell>
                      </TableRow>
                      {hasSomeDates && (
                        <TableRow>
                          <TableCell
                            style={{ paddingBottom: 0, paddingTop: 0 }}
                            colSpan={8}
                          >
                            <Collapse in={open} timeout="auto" unmountOnExit>
                              <DatesTable
                                currentUserIsFirstInPair={
                                  currentUserIsFirstInPair
                                }
                                user={user}
                                dates={visibleDates}
                                otherUserNickname={otherUserNickname}
                                setPairActive={(active: boolean) => {
                                  setPairActive(pairId, active);
                                }}
                                setDate={setDate}
                              />
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
