import * as React from 'react';
import clsx from 'clsx';
import {
    Button
} from '@material-ui/core';
import SpinnerAdornment from '../SpinnerAdornment';

const SubmitButton = ({ label, buttonClass, pristine, submitting }: any) => (
    <Button
        className={clsx(buttonClass, "u-center-horizontally")}
        variant="contained"
        color="primary"
        type="submit"
        disabled={pristine || submitting}
    >
        {submitting ? <SpinnerAdornment /> : label}
    </Button>
);

export default SubmitButton;
