import { ReactElement, forwardRef, useState } from "react";
import { useRouter } from "next/router";
import Image from "next/image";
import {
  AppBar,
  Toolbar,
  IconButton,
  Button,
  Typography,
  Slide,
  SwipeableDrawer,
  useScrollTrigger,
  List,
  ListItem,
  ListItemProps,
  ListItemIcon,
  ListItemText,
} from "@material-ui/core";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faLightbulb,
  faUserPlus,
  faBars,
} from "@fortawesome/free-solid-svg-icons";
import { makeStyles } from "@material-ui/core/styles";
import Link from "next/link";

import { SpinnerAdornment as Spinner } from "../common";
import * as Messages from "../Messages";
import {
  fromPage,
  proposal,
  registerAccount,
  login,
} from "../navigation/NavigationUrls";
import { useUser } from "../../utils";
import { LoggedInUserMenu } from "./LoggedInUserMenu";

const useStyles = makeStyles((theme) => ({
  marginRight: {
    marginRight: theme.spacing(2),
  },
  title: {
    flexGrow: 1,
  },
}));

interface Props {
  children: React.ReactElement;
}

// https://material-ui.com/ru/components/app-bar/#hide-app-bar
function HideOnScroll(props: Props) {
  const { children } = props;
  const trigger = useScrollTrigger();

  return (
    <Slide appear={false} direction="down" in={!trigger}>
      {children}
    </Slide>
  );
}

// eslint-disable-next-line react/display-name
const ListItemLink = forwardRef(
  (props: ListItemProps<"a", { button?: true }>, ref) => {
    return <ListItem button component="a" {...props} />;
  }
);

const Header = (): ReactElement => {
  const classes = useStyles();

  const [drawerOpened, toggleDrawer] = useState(false);

  const router = useRouter();
  const userVisiblePath = fromPage(router.pathname);

  const user = useUser();
  let loadingOrLoginButtonOrUserMenu;
  if (user.loading) {
    loadingOrLoginButtonOrUserMenu = <Spinner />;
  } else if (!user.loading && user.id) {
    loadingOrLoginButtonOrUserMenu = <LoggedInUserMenu user={user} />;
  } else {
    loadingOrLoginButtonOrUserMenu = (
      <Link href={login}>
        <Button color="inherit">{Messages.login}</Button>
      </Link>
    );
  }

  return (
    <>
      {/** to beat z-index used for tabs */}
      <HideOnScroll>
        <AppBar style={{ zIndex: 1101 }}>
          <Toolbar>
            <IconButton
              className={classes.marginRight}
              edge="start"
              color="inherit"
              aria-label="menu"
              onClick={() => toggleDrawer(true)}
            >
              <FontAwesomeIcon icon={faBars} />
            </IconButton>
            <Image
              src="/img/logo.svg"
              alt={Messages.logoTooltip}
              width={50}
              height={50}
              className="logo"
            />
            <div className={classes.marginRight} />
            <Typography variant="h6" className={classes.title} color="inherit">
              {Messages.title}
            </Typography>
            {loadingOrLoginButtonOrUserMenu}
          </Toolbar>
        </AppBar>
      </HideOnScroll>

      <SwipeableDrawer
        anchor="left"
        open={drawerOpened}
        onClose={() => toggleDrawer(false)}
        onOpen={() => toggleDrawer(true)}
      >
        <List style={{ width: 250 }}>
          <Link href={proposal} passHref>
            <ListItemLink selected={userVisiblePath === proposal}>
              <ListItemIcon>
                <FontAwesomeIcon icon={faLightbulb} size="2x" />
              </ListItemIcon>
              <ListItemText primary={Messages.Idea} />
            </ListItemLink>
          </Link>
          <Link href={registerAccount} passHref>
            <ListItemLink selected={userVisiblePath === registerAccount}>
              <ListItemIcon>
                <FontAwesomeIcon icon={faUserPlus} size="2x" />
              </ListItemIcon>
              <ListItemText primary={Messages.Registration} />
            </ListItemLink>
          </Link>
        </List>
      </SwipeableDrawer>
    </>
  );
};

export default Header;
