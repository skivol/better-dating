import {
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Box,
} from "@material-ui/core";

import * as Messages from "../Messages";
import { DateRow } from ".";

export const DatesTable = ({
  user,
  currentUserIsFirstInPair,
  dates,
  otherUserNickname,
  setPairActive,
  setDate,
}: any) => {
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
            {dates.map(
              (
                {
                  dateInfo,
                  place,
                  unsettledPlaces,
                  credibility,
                  improvement,
                  otherCredibility,
                  otherImprovement,
                }: any,
                i: number
              ) => (
                <DateRow
                  otherUserNickname={otherUserNickname}
                  currentUserIsFirstInPair={currentUserIsFirstInPair}
                  user={user}
                  dateInfo={dateInfo}
                  place={place}
                  unsettledPlaces={unsettledPlaces}
                  credibility={credibility}
                  improvement={improvement}
                  otherCredibility={otherCredibility}
                  otherImprovement={otherImprovement}
                  index={i}
                  setPairActive={setPairActive}
                  setDate={setDate}
                />
              )
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};
