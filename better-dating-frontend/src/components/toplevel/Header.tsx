import * as React from "react";
import { Link as MuiLink } from '@material-ui/core';
import Link from 'next/link';
import * as Messages from '../Messages';
import Typography from '@material-ui/core/Typography';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
// @ts-ignore
import SmotrinyLogo from '../img/logo.svg';

const headerStyle: React.CSSProperties = {
	marginTop: '10px',
};

const logoStyle: React.CSSProperties = {
	height: 200,
	width: 200,
};

const titleWithDescriptionColumn: React.CSSProperties = {
	flexBasis: '75%',
	marginTop: '10px',
};

const Header = () => (
	<Grid
		container
		direction="row"
		justify="center"
		alignItems="center"
		style={headerStyle}
	>
		<Grid item style={{ flexBasis: '25%', cursor: 'pointer' }}>
			<Link href="/">
				<Paper>
					<img
						src={SmotrinyLogo}
						alt={Messages.logoTooltip}
						style={logoStyle}
					/>
				</Paper>
			</Link>
		</Grid>
		<Grid
			item
			style={titleWithDescriptionColumn}
		>
			<Paper style={{ height: 204, marginLeft: 10 }} className="u-padding-15px">
				<Grid
					container
					direction="column"
					justify="center"
					alignItems="center"
				>
					<Grid item>
						<Typography variant="h2">
							<Link href="/" passHref>
								<MuiLink>
									{Messages.title}
								</MuiLink>
							</Link>
						</Typography>
					</Grid>
					<Grid item>
						<Typography variant="h5" className="u-text-align-center">
							{Messages.description}
						</Typography>
					</Grid>
				</Grid>
			</Paper>
		</Grid>
	</Grid>
);

export default Header;
