export const successSubmittingProfileMessage =
  "Регистрация успешна! На указанный адрес было выслано письмо для проверки.";
export const oopsSomethingWentWrong =
  "Ой, что-то пошло не так... Попробуйте еще раз немного позже!";
export const errorSubmittingProfileMessage = oopsSomethingWentWrong;
export const successTriggeringNewVerificationMessage =
  "Новое письмо для проверки почты было отправлено.";
export const successRequestingNewProfileViewMessage =
  "Новое письмо для просмотра профиля было отправлено.";

export const successUpdatingProfileMessage =
  "Обновление данных профиля успешно!";
export const successUpdatingProfileAndChangingEmailMessage =
  "Обновление данных профиля успешно! На указанный новый адрес было выслано письмо для проверки.";
export const errorUpdatingProfileMessage = oopsSomethingWentWrong;
export const linkForRemovingProfileWasSent =
  "Ссылка для удаления профиля была выслана на почту.";
export const profileWasRemoved =
  "Профиль был успешно удален! Надеемся на скорое возвращение :)";
export const linkForViewingAuthorsProfileWasSent =
  "Ссылка для просмотра профиля автора была выслана на почту.";
export const linkForViewingUsersProfileWasSent = (nickname: string) => `Ссылка для просмотра профиля пользователя "${nickname}" была выслана на почту.`;
export const secondStageEnabled = "Второй этап был активирован!";

export const alreadyPresentEmail = "Такая почта уже существует";
export const alreadyPresentNickname = "Такое имя/псевдоним уже существует";

export const loginLinkWasSent = "Ссылка для входа была отправлена на почту.";
export const errorLogin = "Ошибка при попытке входа";

export const successLogout = "Выход успешен!";
export const errorLogout = oopsSomethingWentWrong;

export const successAddingPlaceTheUserWasNotified = "Место встречи было создано и второй пользователь был оповещен об этом!";
export const successApprovingThePlace = "Место встречи было подтверждено и вскоре будет организовано свидание!";

export const successCheckIn = "Успешное прибытие на свидание!";
export const secondUserHasAlreadyArrived = "А второй пользователь уже на месте!";

export const resolveCheckInError = (error: any) => {
  const { message, details } = error;
  if ("too early to check in" === message) {
    return "Слишком рано отмечаться о прибытии на свидание!";
  } else if ("too late to check in" === message) {
    return "Слишком поздно отмечаться о прибытии на свидание!";
  } else if ("not close enough to check in" === message) {
    return `Текущее положение слишком далеко от точки встречи (${details.currentDistance} метров, при максимально приемлимом отдалении ${details.distanceThreshold} метров)`;
  } else if ("location data is too old" === message) {
    return "Данные о расположении устарели, обновите страницу и попробуйте снова";
  } else if ("already checked in" === message) {
    return "Уже отметились о прибытии ;)";
  } else if ("date is not in scheduled or partial check-in state" === message) {
    return "Больше нельзя отмечаться о прибытии на это свидание";
  }

  return oopsSomethingWentWrong;
}
