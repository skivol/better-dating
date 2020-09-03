import CircularProgress from '@material-ui/core/CircularProgress';
import { withStyles, Theme, withTheme } from '@material-ui/core/styles';

export interface SpinnerAdornmentProps {
    classes: any;
    theme: Theme;
    color?: string;
}
export const SpinnerAdornment = withTheme(withStyles({
    root: {
        marginLeft: 5
    }
})(({ classes, theme, color = theme.palette.primary.contrastText }: SpinnerAdornmentProps) => (
    <CircularProgress
        className={classes.spinner}
        style={{ color }}
        size={20}
    />
)));
