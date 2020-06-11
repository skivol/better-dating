import * as React from 'react';
import {
    Grid,
    Paper,
} from '@material-ui/core';
import { analyze } from './Analysis';

enum AnalysisType { // use enum ?
    bmi
}

interface AnalyzedSectionProps {
    id?: string;
    values: any;
    visible: boolean;
    type: string;
    children: React.ReactNode | Array<React.ReactNode>;
}

const AnalyzedSection = ({ children, values, id, visible, type }: AnalyzedSectionProps) => {
    if (!visible) {
        return (
            <>
                {children}
            </>
        )
    }

    return (
        <Grid id={id} item>
            <Paper elevation={3} className="u-padding-15px u-min-width-450px u-max-width-500px u-center-horizontally">
                <Grid container direction="column" spacing={2}>
                    {children}
                    {analyze(type, values)}
                </Grid>
            </Paper>
        </Grid>
    )
};

export default AnalyzedSection;
