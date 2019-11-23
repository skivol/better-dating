import * as React from "react";
import * as Messages from './Messages';
import Typography from '@material-ui/core/Typography';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import Tooltip from '@material-ui/core/Tooltip';
import CardMedia from '@material-ui/core/CardMedia';
import PetrovSmotrinyNevesty from './img/Петров_Смотрины-невесты_1861.jpg';

const headerStyle: React.CSSProperties = {
	marginTop: '10px',
};

const imageStyle: React.CSSProperties = {
	height: 181,
	width: 260,
	borderRadius: '10px',
};

const titleWithDescriptionColumn: React.CSSProperties = {
	flexBasis: '67%',
	marginTop: '10px',
};
const titlePaperStyle: React.CSSProperties = {
	padding: '15px',
	margin: '10px',
}

/* TODO create a great Logo, describe the meaning of the name */
// import Icon from '@material-ui/core/Icon';
// <Icon className="far fa-eye" style={{width: '1.3em'}} />
const Header = () => (
	<Grid 
		container
		direction="row"
		justify="center"
		alignItems="center"
		style={ headerStyle }
	>
		<Grid item style={{flexBasis: '33%'}}>
			<Tooltip
				disableFocusListener
				title={ Messages.pictureTooltip }
			>
				<CardMedia
					image={PetrovSmotrinyNevesty}
					component="img"
					alt={Messages.pictureTooltip}
					style={imageStyle}
				/>
			</Tooltip>
		</Grid>
		<Grid
			item
			style={titleWithDescriptionColumn}
		>
			<Paper style={titlePaperStyle}>
				<Grid
					container
					direction="column"
					justify="center"
					alignItems="center"
				>
						<Grid item>
							<Typography variant="h2">
								{ Messages.title }
							</Typography>
						</Grid>
						<Grid item>
							<Typography variant="h5" style={{textAlign: 'center'}}>
								{ Messages.description }
							</Typography>
						</Grid>
				</Grid>
			</Paper>
		</Grid>
	</Grid>
);

export default Header;
