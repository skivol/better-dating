import { useEffect, useState, MouseEvent } from "react";
import { useSelector, useDispatch, useStore } from "react-redux";
import { useRouter } from "next/router";
import { firstValueIfArray } from ".";
import { BetterDatingStoreState } from "../configureStore";
import { fetchUser } from "../actions";
import { UserState } from "../types";
import { tokenName, dateIdName } from "../Messages";

export const useUser = (forceFetch = true) => {
  const user = useSelector((state: BetterDatingStoreState) => state.user);
  const dispatch = useDispatch();
  const store = useStore();
  useEffect(() => {
    const storedUser = store.getState().user;
    if (!storedUser.loading && (forceFetch || storedUser.id === null)) {
      dispatch(fetchUser());
    }
  }, [dispatch]);
  return user;
};

export const isAdmin = (user: UserState) =>
  user.roles?.includes("ROLE_ADMIN") ?? false;

export const useMenu = () => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const menuIsOpen = Boolean(anchorEl);
  const openMenu = (event: MouseEvent<HTMLElement>) =>
    setAnchorEl(event.currentTarget);
  const closeMenu = () => setAnchorEl(null);
  return { anchorEl, menuIsOpen, openMenu, closeMenu };
};

export const useDialog = () => {
  const [dialogIsOpen, setOpen] = useState(false);
  const openDialog = () => setOpen(true);
  const closeDialog = () => setOpen(false);

  return { dialogIsOpen, openDialog, closeDialog };
};

export const useToken = () => {
  const router = useRouter();
  const token = firstValueIfArray(router.query[tokenName]) as string;
  return token;
};

export const useDateId = () => {
  const router = useRouter();
  const dateId = firstValueIfArray(router.query[dateIdName]) as string;
  return dateId;
};

export const useForceUpdate = () => {
  const [state, setState] = useState<any>({});
  return () => setState({});
};
