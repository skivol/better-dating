import { formatDuration } from "date-fns";
import { ru } from "date-fns/locale";
import { resolveTokenMessage } from "../Messages";

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
export const linkForViewingUsersProfileWasSent = (nickname: string) =>
  `Ссылка для просмотра профиля пользователя "${nickname}" была выслана на почту.`;
export const secondStageEnabled = "Второй этап был активирован!";

export const alreadyPresentEmail = "Такая почта уже существует";
export const alreadyPresentNickname = "Такое имя/псевдоним уже существует";

export const loginLinkWasSent = "Ссылка для входа была отправлена на почту.";
export const errorLogin = "Ошибка при попытке входа";

export const successLogout = "Выход успешен!";
export const errorLogout = oopsSomethingWentWrong;

export const successAddingPlaceTheUserWasNotified =
  "Место встречи было создано и второй пользователь был оповещен об этом!";
export const successApprovingThePlace =
  "Место встречи было подтверждено и вскоре будет организовано свидание!";
export const resolveAddPlaceError = (error: any) => {
  const { message } = error;
  if ("Too close to other existing points" === message) {
    return "Предложение слишком близко к существующим точкам, предложите другое";
  }
  return oopsSomethingWentWrong;
};

export const successCheckIn = "Успешное прибытие на свидание!";
export const secondUserHasAlreadyArrived =
  "А второй пользователь уже на месте!";

export const resolveCheckInError = (error: any) => {
  const { message, details } = error;
  const formatMinutes = (moreThan1MinutePrefix: string, minutes: number) =>
    minutes > 0
      ? `${moreThan1MinutePrefix} ${formatDuration(
          { minutes },
          { locale: ru }
        )}`
      : "меньше минуты";
  if ("too early to check in" === message) {
    return `Слишком рано отмечаться о прибытии на свидание! (${formatMinutes(
      "еще",
      details.minutesToGo
    )} до открытия)`;
  } else if ("too late to check in" === message) {
    return `Слишком поздно отмечаться о прибытии на свидание! (${formatMinutes(
      "уже",
      details.minutesOverdue
    )} как функция закрылась)`;
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
};

export const successVerifyingDate = "Свидание успешно подтверждено !";
export const errorVerifyingDate =
  "Не получилось подтвердить свидание, попробуйте позже";
export const resolveVerifyDateError = (error: any) => {
  const { message } = error;
  const resolvedMessage = resolveTokenMessage(message, 2, null);

  if (resolvedMessage) {
    return resolvedMessage;
  }

  if ("too early to verify the date" === message) {
    return "Слишком рано подтверждать свидание!";
  } else if ("other user should be verifying the date" === message) {
    return "Другой пользователь должен подтвердить свидание с помощью кода!";
  } else if (
    "date is not in scheduled or partial/full check-in state" === message
  ) {
    return "Нельзя больше подтверждать это свидание!";
  }

  return errorVerifyingDate;
};

export const successEvaluatingProfile =
  "Оценка правдивости профиля и предложения по улучшению были успешно добавлены !";
const errorEvaluatingProfile =
  "Не получилось отправить оценку правдивости профиля и предложения по улучшению, попробуйте позже";
export const resolveEvaluateProfileError = (error: any) => {
  const { message } = error;
  if ("date is not in verified state" === message) {
    return "Свидание должно быть в подтвержденном состоянии для этого действия";
  }
  return errorEvaluatingProfile;
};

export const successSubmittingPairDecision = "Решение по паре было сохранено !";
export const secondUserAlsoWantsToContinueRelationships =
  "А второй пользователь тоже выразил стремление продолжить отношения ! :)";
const errorSubmittingPairDecision =
  "Не получилось отправить решение по паре, попробуйте позже";
export const resolvePairDecisionSubmitError = (error: any) => {
  const { message } = error;
  if (
    "pair should have at least one verified date to submit a decision" ===
    message
  ) {
    return "Нужно хоть одно подтвержденное свидание для этого действия";
  } else if ("already submitted a decision" === message) {
    return "Решение уже отправлено";
  }
  return errorSubmittingPairDecision;
};
