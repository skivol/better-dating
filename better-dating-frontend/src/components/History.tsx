import { useState, useMemo, useEffect } from "react";
import { useDispatch } from "react-redux";
import { utcToZonedTime, format } from "date-fns-tz";
import { Form } from "react-final-form";
import {
  Grid,
  Button,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
} from "@material-ui/core";
import { Select, Autocomplete } from "mui-rff";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHistory } from "@fortawesome/free-solid-svg-icons";
import { useUser, isAdmin, debounce, getData } from "../utils";
import { fetchHistory } from "../actions";
import { SpinnerAdornment as Spinner } from "./common";
import * as Messages from "./Messages";

enum EventType {
  EmailChanged = "EmailChanged",
  ProfileViewedByOtherUser = "ProfileViewedByOtherUser",
  TooCloseToOtherPlacesExceptionHappened = "TooCloseToOtherPlacesExceptionHappened",
}

const formatTimestamp = (timestamp: string) => {
  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone ?? "UTC"; // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/DateTimeFormat/resolvedOptions
  const zonedDate = utcToZonedTime(new Date(timestamp), timeZone); // https://date-fns.org/v2.23.0/docs/Time-Zones
  const pattern = "yyyy-MM-dd HH:mm:ss XXX"; // .SSS 'GMT' XXX (z)
  const output = format(zonedDate, pattern, { timeZone });
  return output;
};
const formatType = (type: EventType) =>
  ({
    EmailChanged: Messages.emailChanged,
    ProfileViewedByOtherUser: Messages.profileViewedByOtherUser,
    TooCloseToOtherPlacesExceptionHappened:
      Messages.tooCloseToOtherPlacesExceptionHappened,
    ProfileRemoved: Messages.profileRemoved,
  }[type]);
const formatPayload = (type: EventType, payload: any, relevantUsers: any) =>
  ({
    EmailChanged: Messages.formatEmailChangedPayload,
    ProfileViewedByOtherUser: Messages.formatProfileViewedByOtherUserPayload,
    TooCloseToOtherPlacesExceptionHappened:
      Messages.formatTooCloseToOtherPlacesExceptionHappenedPayload,
    ProfileRemoved: Messages.formatProfileRemoved,
  }[type](payload, relevantUsers));

const typeOptions = (isAdmin: boolean) => [
  {
    label: Messages.typeAll,
    value: "All",
  },
  {
    label: Messages.typeProfileViews,
    value: "ProfileViewedByOtherUser",
  },
  {
    label: Messages.typeEmailChange,
    value: "EmailChanged",
  },
  ...(isAdmin
    ? [
        {
          label: Messages.typeTooCloseToExistingPlacesException,
          value: "TooCloseToOtherPlacesExceptionHappened",
        },
        {
          label: Messages.profileRemoved,
          value: "ProfileRemoved",
        },
      ]
    : []),
];

type UserAutocomplete = {
  id: string;
  nickname: string;
  email: string;
};
const showUser = (option: any) => {
  const { nickname, email, id } = option;
  return nickname ? `${nickname} (${email}, ${id})` : ""; // without displaying all the data in the label it doesn't get displayed in autocomplete pop-up...
};
const UsersAutocomplete = () => {
  const [open, setOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [options, setOptions] = useState<UserAutocomplete[]>([]);
  const [loading, setLoading] = useState(false);

  const debouncedInterestsAutocomplete = useMemo(
    () =>
      debounce(
        (input: string, callback: (results?: UserAutocomplete[]) => void) => {
          setLoading(true);
          getData(`/api/users/autocomplete?q=${input}`).then(callback);
        },
        200,
        true
      ),
    []
  );

  useEffect(() => {
    let active = true;
    if (!options.map(showUser).includes(inputValue)) {
      debouncedInterestsAutocomplete(
        inputValue,
        (users?: UserAutocomplete[]) => {
          if (!active) {
            return;
          }
          setLoading(false);
          if (users) {
            setOptions(users);
          }
        }
      );
    }
    return () => {
      active = false;
    };
  }, [inputValue, debouncedInterestsAutocomplete]);

  useEffect(() => {
    if (!open) {
      setOptions([]);
    }
  }, [open]);

  return (
    <Autocomplete
      label={Messages.users}
      name="userId"
      className="u-min-width-300px"
      open={open}
      onOpen={() => {
        setOpen(true);
      }}
      onClose={() => {
        setOpen(false);
      }}
      loading={loading}
      autoComplete
      options={options}
      onInputChange={(event, newInputValue) => {
        setInputValue(newInputValue);
      }}
      getOptionLabel={showUser}
      getOptionValue={({ id }) => id}
    />
  );
};

export const parseHistoryData = (data: any) =>
  (data || []).map((d: any) => ({ ...d, payload: JSON.parse(d.payload) }));

export const History = ({ initialHistoryData, relevantUsers }: any) => {
  const [historyData, setHistoryData] = useState<any>(initialHistoryData || []);
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const handleChangePage = (event: any, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: any) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };
  return (
    <Form
      initialValues={{ type: "All" }}
      onSubmit={async (values: any) => {
        setLoading(true);
        try {
          const result = parseHistoryData(await dispatch(fetchHistory(values)));
          setHistoryData(result);
        } finally {
          setLoading(false);
        }
      }}
      render={({ handleSubmit, values }) => {
        const user = useUser();
        if (user.loading) {
          return <Spinner />;
        }
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
                        icon={faHistory}
                        size="sm"
                        className="u-right-margin-10px"
                      />
                      {Messages.history}
                    </Typography>
                  </Paper>
                </Grid>

                <Grid
                  container
                  direction="row"
                  className="u-max-width-800px"
                  style={{ marginLeft: "15px" }}
                  spacing={3}
                >
                  <Grid item>
                    <Select
                      className="u-min-width-300px"
                      name="type"
                      label={Messages.typeSelect}
                      data={typeOptions(isAdmin(user))}
                    />
                  </Grid>
                  {isAdmin(user) && (
                    <>
                      <Grid item>
                        <UsersAutocomplete />
                      </Grid>
                      <Grid item style={{ alignSelf: "center" }}>
                        <Button
                          type="submit"
                          variant="contained"
                          disabled={loading}
                        >
                          {loading ? <Spinner /> : Messages.search}
                        </Button>
                      </Grid>
                    </>
                  )}
                </Grid>

                <TableContainer className="u-margin-top-bottom-10px">
                  <Table
                    size="medium"
                    className="c-pairs-table"
                    aria-label={Messages.datingTableAria}
                  >
                    <TableHead>
                      <TableRow>
                        <TableCell style={{ width: "150px" }}>
                          {Messages.dateTime}
                        </TableCell>
                        {isAdmin(user) && (
                          <TableCell style={{ width: "150px" }}>
                            {Messages.user}
                          </TableCell>
                        )}
                        <TableCell style={{ width: "175px" }}>
                          {Messages.type}
                        </TableCell>
                        <TableCell style={{ minWidth: "100px" }}>
                          {Messages.details}
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {historyData
                        .filter(({ type }: any) =>
                          values.type === "All" ? true : type === values.type
                        )
                        .slice(page * rowsPerPage, (page + 1) * rowsPerPage)
                        .map(({ profileId, timestamp, type, payload }: any) => (
                          <TableRow>
                            <TableCell>{formatTimestamp(timestamp)}</TableCell>
                            {isAdmin(user) && (
                              <TableCell style={{ width: "150px" }}>
                                {profileId}
                              </TableCell>
                            )}
                            <TableCell>
                              {formatType(type as EventType)}
                            </TableCell>
                            <TableCell>
                              {formatPayload(
                                type as EventType,
                                payload,
                                relevantUsers
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                    </TableBody>
                  </Table>
                </TableContainer>
                <TablePagination
                  rowsPerPageOptions={[5, 10, 25, 50, 100]}
                  component="div"
                  count={historyData.length}
                  rowsPerPage={rowsPerPage}
                  page={page}
                  onChangePage={handleChangePage}
                  onChangeRowsPerPage={handleChangeRowsPerPage}
                />
              </Grid>
            </Paper>
          </form>
        );
      }}
    />
  );
};
