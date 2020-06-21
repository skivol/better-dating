import * as React from "react";
import { Paper } from '@material-ui/core';
import Header from '../toplevel/Header';
// @ts-ignore
import fullTextOfUserAgreement from './UserAgreement.md';
import { ReactMarkdownMaterialUi } from '../../utils';

export const UserAgreementPage = () => (
    <>
        <Header />
        <Paper elevation={3} className="u-padding-15px">
            <ReactMarkdownMaterialUi source={fullTextOfUserAgreement} />
        </Paper>
    </>
);
