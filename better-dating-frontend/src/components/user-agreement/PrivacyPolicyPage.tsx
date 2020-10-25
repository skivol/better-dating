import { Paper } from '@material-ui/core';
import Header from '../toplevel/Header';
// @ts-ignore
import fullTextOfPrivacyPolicy from './PrivacyPolicy.md';
import { ReactMarkdownMaterialUi } from '../../utils';

export const PrivacyPolicyPage = () => (
    <>
        <Header />
        <Paper elevation={3} className="u-padding-15px">
            <ReactMarkdownMaterialUi source={fullTextOfPrivacyPolicy} />
        </Paper>
    </>
);
