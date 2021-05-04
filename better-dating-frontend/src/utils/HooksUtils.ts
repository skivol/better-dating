import { useEffect, useState, MouseEvent } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useRouter } from "next/router";
import { firstValueIfArray } from ".";
import { BetterDatingStoreState } from "../configureStore";
import { fetchUser } from "../actions";
import { tokenName } from "../Messages";

export const useUser = () => {
  const user = useSelector((state: BetterDatingStoreState) => state.user);
  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(fetchUser());
  }, [dispatch]);
  return user;
};

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
