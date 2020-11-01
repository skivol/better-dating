import { createMuiTheme, responsiveFontSizes } from "@material-ui/core/styles";
import red from "@material-ui/core/colors/red";
import { ruRU } from "@material-ui/core/locale";

export const theme = responsiveFontSizes(
  createMuiTheme(
    {
      palette: {
        primary: {
          main: "#556cd6",
        },
        secondary: {
          main: "#19857b",
        },
        error: {
          main: red.A400,
        },
        background: {
          default: "#fff",
        },
      },
    },
    ruRU
  )
);

export default theme;
