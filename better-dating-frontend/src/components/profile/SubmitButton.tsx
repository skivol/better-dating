import clsx from 'clsx';
import {
    Button
} from '@material-ui/core';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUserPlus } from '@fortawesome/free-solid-svg-icons';
import { SpinnerAdornment } from '../common';

export const SubmitButton = ({ label, buttonClass, submitting }: any) => (
    <Button
        className={clsx(buttonClass, "u-center-horizontally")}
        variant="contained"
        color="primary"
        type="submit"
        disabled={submitting}
        startIcon={submitting ? <SpinnerAdornment /> : <FontAwesomeIcon icon={faUserPlus} />}
    >
        {label}
    </Button>
);
