import * as Messages from "../Messages";

export const proposal = `/${Messages.proposal}`;
export const registerAccount = "/регистрация";
export const login = "/вход";
export const profile = "/профиль";
export const dating = "/свидания";
export const administration = "/администрирование";
export const acknowledgements = "/благодарности";
export const privacyPolicy = "/политика-конфиденциальности";
export const userAgreement = "/пользовательское-соглашение";
export const addLocation = "/добавление-места";
export const checkLocation = "/проверка-места";
export const viewLocation = "/просмотр-места";

export const fromPage = (actualPagePath: string) => {
  const mapping: { [index: string]: string } = {
    ["/"]: proposal,
    ["/proposal"]: proposal,
    ["/login"]: login,
    ["/register-account"]: registerAccount,
    ["/profile"]: profile,
    ["/dating"]: dating,
    ["/acknowledgements"]: acknowledgements,
    ["/privacy-policy"]: privacyPolicy,
    ["/user-agreement"]: userAgreement,
    ["/administration"]: administration,
  };
  return mapping[actualPagePath];
};

export const toPage = (userVisiblePath: string) => {
  const mapping: { [index: string]: string } = {
    ["/"]: "/proposal",
    [proposal]: "/proposal",
    [login]: "/login",
    [registerAccount]: "/register-account",
    [profile]: "/profile",
    [dating]: "/dating",
    [acknowledgements]: "/acknowledgements",
    [privacyPolicy]: "/privacy-policy",
    [userAgreement]: "/user-agreement",
    [administration]: "/administration",
  };
  return mapping[userVisiblePath];
};
