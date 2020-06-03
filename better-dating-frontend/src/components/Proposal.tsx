import * as React from "react";
import Link from 'next/link';
import clsx from 'clsx';
import {
	Grid,
	Paper,
	ExpansionPanel,
	ExpansionPanelSummary,
	ExpansionPanelDetails,
	Typography,
	Divider,
	Button,
	Dialog,
	CardMedia,
} from '@material-ui/core';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faExclamationCircle } from '@fortawesome/free-solid-svg-icons';

import { toPage, registerAccount } from './navigation/NavigationUrls';
import Header from './toplevel/Header';
import { getData } from '../utils/FetchUtils';
import { updated } from '../constants';
import * as Messages from './Messages';
// @ts-ignore
import FirstStageFlow from './img/Первый_этап.png';


const useStyles = makeStyles((theme: Theme) =>
	createStyles({
		heading: {
			fontSize: theme.typography.pxToRem(15)
		},
		button: {
			margin: theme.spacing(1),
		},
	})
);

const onContactRequest = async () => {
	const { link } = await getData("/api/user/email/contact");
	window.location.href = atob(link);
};

const DialogWithFirstStageFlowImage = (handleClose: () => void) => (
	<Dialog
		open
		onClose={handleClose}
		aria-labelledby="max-width-dialog-title"
	>
		<img
			src={FirstStageFlow}
			alt={Messages.firstStageFlowAlt}
			className="c-first-stage-flow-image"
		/>
	</Dialog>
);

const Proposal = () => {
	const classes = useStyles();
	const [dialog, setDialog] = React.useState<any>(null);
	const closeDialog = () => setDialog(null);
	const openDialog = () => setDialog(DialogWithFirstStageFlowImage(closeDialog));

	return (
		<>
			<Header />
			<Grid
				container
				direction="column"
				className="u-margin-top-bottom-15px u-min-width-300px u-padding-10px"
			>
				<Grid item>
					<ExpansionPanel>
						<ExpansionPanelSummary
							expandIcon={<ExpandMoreIcon />}
						>
							<Typography className={clsx('c-heading', classes.heading)}>
								{Messages.Idea}
							</Typography>
						</ExpansionPanelSummary>
						<ExpansionPanelDetails>
							<Grid container direction="column">
								<Grid item>
									<Typography>
										{Messages.FirstStage}
									</Typography>
									<Divider className="u-margin-10px" />
								</Grid>
								<Grid item>
									<CardMedia
										src={FirstStageFlow}
										component="img"
										alt={Messages.firstStageFlowAlt}
										onClick={openDialog}
									/>
								</Grid>
								<Grid item>
									<Typography>
										{Messages.FirstStageFirstStep}
									</Typography>
									<Divider className="u-margin-10px" />
									<Typography>
										{Messages.FirstStageSecondStep}
									</Typography>
									<Divider className="u-margin-10px" />
									<Typography>
										{Messages.FirstStageThirdStep}
									</Typography>
									<Divider className="u-margin-10px" />
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
								<Divider className="u-margin-10px" />
								<Typography>
									{Messages.ButThereAreDifferences}
								</Typography>
								<ul>
									<li>{Messages.onlyActiveParticipants}</li>
									<li>{Messages.moreInvolvedSystem}</li>
									<li>{Messages.feedbackSystem}</li>
									<li>{Messages.fullFeaturedForFree}</li>
								</ul>
								<Divider className="u-margin-10px" />
								<Typography>
									{Messages.AboutSmotrinyRu}
								</Typography>
								<Divider className="u-margin-10px" />
								<Typography>
									{Messages.OtherAlternatives}
								</Typography>
							</Grid>
						</ExpansionPanelDetails>
					</ExpansionPanel>
				</Grid>
				<Grid item>
					<Paper elevation={3} className="u-max-width-650px u-center-horizontally">
						<Grid container direction="row" wrap="nowrap" className="u-padding-10px u-margin-10px">
							<Grid item xs={1} className="u-center-flex u-right-margin-10px">
								<FontAwesomeIcon color="red" size="2x" icon={faExclamationCircle} />
							</Grid>
							<Grid item xs={10}>
								<Typography>
									{Messages.spreadTheWordIfSeemsInteresting}
								</Typography>
							</Grid>
						</Grid>
					</Paper>
				</Grid>
				<Grid item>
					<Grid container justify="center" alignItems="center" className="u-height-120px">
						<Link href={toPage(registerAccount)} as={registerAccount}>
							<Button
								className={classes.button}
								variant="contained"
								color="primary"
							>
								<Typography variant="h5">
									{Messages.register}
								</Typography>
							</Button>
						</Link>
					</Grid>
				</Grid>
				<Grid item>
					<Paper className="u-max-width-650px u-center-horizontally">
						<Grid container direction="row" className="u-padding-10px u-margin-10px">
							<Grid item xs={6} className="u-center-flex">
								<Typography className="u-075-fontsize">
									{Messages.contactUs}
								</Typography>
							</Grid>
							<Grid item xs={4}>
								{/* https://www.ionos.com/digitalguide/e-mail/e-mail-security/protecting-your-email-address-how-to-do-it/ */}
								{/* https://www.quora.com/Should-you-pass-an-email-address-in-a-url */}
								<Button variant="outlined" onClick={onContactRequest} className={classes.button}>
									{Messages.contactUsButton}
								</Button>
							</Grid>
						</Grid>
					</Paper>
				</Grid>
				{dialog}
			</Grid>
			<Paper className="c-updated-time-paper u-center-horizontally">
				<Typography className="u-075-fontsize">
					{`${Messages.updated}: ${updated}`}
				</Typography>
			</Paper>
		</>
	);
};

export default Proposal;
