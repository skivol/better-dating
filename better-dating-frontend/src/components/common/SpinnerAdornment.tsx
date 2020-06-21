import CircularProgress from '@material-ui/core/CircularProgress';
import { withStyles, Theme, withTheme } from '@material-ui/core/styles';

export interface SpinnerAdornmentProps {
    classes: any;
    theme: Theme;
}
export const SpinnerAdornment = withTheme(withStyles({
    root: {
        marginLeft: 5
    }
})(({ classes, theme }: SpinnerAdornmentProps) => (
    <CircularProgress
        className={classes.spinner}
        style={{ color: theme.palette.primary.contrastText }}
        size={20}
    />
)));
