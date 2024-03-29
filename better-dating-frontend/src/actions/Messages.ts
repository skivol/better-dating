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
export const resolveViewOtherUserProfileError = (error: any) => {
  return (
    {
      "user is not found": "Пользователь не найден",
    }[error.message as string] || oopsSomethingWentWrong
  );
};
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

export const dateIsRescheduledAndOtherUserIsNotified =
  "Свидание перенесено и второй пользователь оповещен об этом!";
export const placeChanged = "Внимание! Место также изменилось!";
export const dateIsCancelledAndOtherUserIsNotified =
  "Свидание отменено и второй пользователь оповещен об этом!";

export const successCheckIn = "Успешное прибытие на свидание!";
export const secondUserHasAlreadyArrived =
  "А второй пользователь уже на месте!";

export const resolveCheckInError = (error: any) => {
  const { message, details } = error;
  const formatMinutes = (moreThan1MinutePrefix: string, minutes: number) =>
    minutes > 0
      ? `${moreThan1MinutePrefix} ${formatDuration({ minutes }, {
          locale: ru,
        } as any)}`
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

  return (
    {
      "too early to verify the date": "Слишком рано подтверждать свидание!",
      "other user should be verifying the date":
        "Другой пользователь должен подтвердить свидание с помощью кода!",
      "date is not in scheduled or partial/full check-in state":
        "Нельзя больше подтверждать это свидание!",
      "verification attempts limit exceeded":
        "Превышено количество попыток подтверждения свидания !",
    }[message as string] || errorVerifyingDate
  );
};

export const successEvaluatingProfile =
  "Оценка правдивости профиля и предложения по улучшению были успешно добавлены !";
const errorEvaluatingProfile =
  "Не получилось отправить оценку правдивости профиля и предложения по улучшению, попробуйте позже";
export const resolveEvaluateProfileError = (error: any) => {
  return (
    {
      "date is not in verified state":
        "Свидание должно быть в подтвержденном состоянии для этого действия",
      "Profile credibility already submitted": "Оценка уже добавлена!",
    }[error.message as string] || errorEvaluatingProfile
  );
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

const errorReschedullingDate =
  "Не получилось перенести свидание, попробуйте позже";
export const resolveRescheduleDateError = (error: any) => {
  const result =
    {
      "date is not in scheduled state":
        "Свидание должно быть запланированным для этого действия",
      "cannot reschedule when check in was already opened":
        "Нельзя перенести свидание когда уже была открыта возможность отметиться о прибытии на него",
      "you already rescheduled once":
        "Нельзя переносить свидание более одного раза",
      "no dating spots available at the moment":
        "Сейчас нет доступных мест и времени для переноса свидания",
    }[error.message as string] || errorReschedullingDate;
  return result;
};

const errorCancellingDate = "Не получилось отменить свидание, попробуйте позже";
export const resolveCancelDateError = (error: any) => {
  const { message } = error;
  if ("date is not in scheduled state" === message) {
    return "Свидание должно быть запланированным для этого действия";
  } else if ("cannot cancel when check in was already opened" === message) {
    return "Нельзя отменить свидание когда уже была открыта возможность отметиться о прибытии на него";
  }
  return errorCancellingDate;
};
