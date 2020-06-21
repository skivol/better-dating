import * as React from 'react';
import clsx from 'clsx';
import {
    Button
} from '@material-ui/core';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUserPlus } from '@fortawesome/free-solid-svg-icons';
import { SpinnerAdornment } from '../common';

export const SubmitButton = ({ label, buttonClass, pristine, submitting }: any) => (
    <Button
        className={clsx(buttonClass, "u-center-horizontally")}
        variant="contained"
        color="primary"
        type="submit"
        disabled={pristine || submitting}
        startIcon={<FontAwesomeIcon icon={faUserPlus} />}
    >
        {submitting ? <SpinnerAdornment /> : label}
    </Button>
);
