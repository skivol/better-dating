import { FormApi } from "final-form";

export const emailHasChanged = (form: FormApi<any>) =>
  form.getState().dirtyFields["email"] === true;

export const currentTime = () => new Date().getTime();
