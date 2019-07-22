import * as React from "react";
import Grid from '@material-ui/core/Grid';
import ExpansionPanel from '@material-ui/core/ExpansionPanel';
import ExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary';
import ExpansionPanelDetails from '@material-ui/core/ExpansionPanelDetails';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import Typography from '@material-ui/core/Typography';
import Divider from '@material-ui/core/Divider';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import CardMedia from '@material-ui/core/CardMedia';

import Dialog from '@material-ui/core/Dialog';

import EmailForm from '../containers/EmailForm';
import FirstStageFlow from './img/Первый_этап.png';
import * as Messages from './Messages';


// <Icon>account_box</Icon> <Icon>star_rate</Icon> <Icon>supervisor_account</Icon> <Icon>star_rate</Icon>

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    heading: {
      fontSize: theme.typography.pxToRem(15),
      flexBasis: '90%',
      flexShrink: 0,
    },
  })
);

const boxStyle: React.CSSProperties = {
	padding: '10px',
	marginTop: '15px',
	marginBottom: '15px',
	minWidth: '395px'
};

const DialogWithFirstStageFlowImage = (open: boolean, handleClose: () => void) => (
	<Dialog
		open={open}
		onClose={handleClose}
		aria-labelledby="max-width-dialog-title"
	>
		<CardMedia
			image={FirstStageFlow}
			component="img"
			style={{width: '863px', height: '304px'}}
		/>
	</Dialog>
);

export interface Props {
  onEmailSubmit: () => void;
}

const Proposal = ({ onEmailSubmit }: Props) => {
	const classes = useStyles();
	const [open, setOpen] = React.useState(false);
	const closeDialog = () => setOpen(false);
	const openDialog = () => setOpen(true);
	const dialog = DialogWithFirstStageFlowImage(open, closeDialog);

	return (
		<Grid
			container
			direction="column"
			style={boxStyle}
		>
			<Grid item>
				<ExpansionPanel>
					<ExpansionPanelSummary
						expandIcon={<ExpandMoreIcon />}
					>
						<Typography className={classes.heading}>
							{Messages.Idea}	
						</Typography>
					</ExpansionPanelSummary>
					<ExpansionPanelDetails>
						<Grid container direction="column">
							<Grid item>
								<Typography>
									{Messages.FirstStage}
								</Typography>
								<Divider style={{margin: '10px'}} />
							</Grid>
							<Grid item>
								<CardMedia
									image={FirstStageFlow}
									component="img"
									onClick={openDialog}
								/>
							</Grid>
							<Grid item>
								<Typography>
									{Messages.FirstStageFirstStep}
								</Typography>
								<Divider style={{margin: '10px'}} />
								<Typography>
									{Messages.FirstStageSecondStep}
								</Typography>
								<Divider style={{margin: '10px'}} />
								<Typography>
									{Messages.FirstStageThirdStep}
								</Typography>
								<Divider style={{margin: '10px'}} />
								<Typography>
									{Messages.FirstStageFourthStep}
								</Typography>
							</Grid>
						</Grid>
					</ExpansionPanelDetails>
				</ExpansionPanel>
				<ExpansionPanel>
					<ExpansionPanelSummary
						expandIcon={<ExpandMoreIcon />}
					>
						<Typography className={classes.heading}>
							{Messages.AreDatingSitesNeeded}
						</Typography>
					</ExpansionPanelSummary>
					<ExpansionPanelDetails>
						<Grid container direction="column">
							<Grid item>
								<Typography>
									{Messages.MotivationOfNeedTitle}
								</Typography>
							</Grid>
							<Grid item>
								<ul>
									<li>{Messages.explicitIntention}</li>
									<li>{Messages.motivateSelfImprovement}</li>
								</ul>
							</Grid>
							<Grid item>
								<Typography>
									{Messages.WhyNot}<span aria-label="smiley" role="img">😊</span>.
								</Typography>
							</Grid>
						</Grid>
					</ExpansionPanelDetails>
				</ExpansionPanel>
				<ExpansionPanel>
					<ExpansionPanelSummary
						expandIcon={<ExpandMoreIcon />}
					>
						<Typography className={classes.heading}>
							{Messages.AnotherDatingSite}
						</Typography>
					</ExpansionPanelSummary>
					<ExpansionPanelDetails>
						<Grid container direction="column">
							<Typography>
								{Messages.YesOneOfGoalsIsDating}
							</Typography>
							<Divider style={{margin: '10px'}} />
							<Typography>
								{Messages.ButThereAreDifferences}
							</Typography>
							<ul>
								<li>{Messages.onlyActiveParticipants}</li>
								<li>{Messages.moreInvolvedSystem}</li>
								<li>{Messages.feedbackSystem}</li>
								<li>{Messages.fullFeaturedForFree}</li>
							</ul>
						</Grid>
					</ExpansionPanelDetails>
				</ExpansionPanel>
			</Grid>
			<Grid item>
				<EmailForm onSubmit={onEmailSubmit} />
			</Grid>
		{dialog}
		</Grid>
	);
};

export default Proposal;