export const successVerifyingEmailMessage =
  "Спасибо за подтверждение почтового адреса!";
export const expiredTokenMessage = "Expired token";

export const dateIdName = "свидание";

export const tokenName = "токен";
export const resolveTokenMessage = (
  message: string,
  expirationDuration: number = 1,
  defaultMessage:
    | string
    | null = "Неизвестная ошибка. Попробуйте еще раз позже."
) => {
  switch (message) {
    case "No such token":
      return "Токен не найден.";
    case expiredTokenMessage:
      const days =
        expirationDuration == 1 ? "1 дня" : `${expirationDuration} дней`;
      return `Токен просрочен. Запросите еще один и используйте его в течение ${days}.`;
    default:
      return defaultMessage;
  }
};

export const requiredField = "обязательное поле";
export const invalidFormat = "неправильный формат";
export const minValue = (minValue: number) =>
  `наименьшее допустимое значение ${minValue}`;
export const maxValue = (maxValue: number) =>
  `наибольшее допустимое значение ${maxValue}`;
export const maxLength = (maxLength: number) =>
  `наибольшая допустимая длина ${maxLength}`;
export const shouldBeOlderThan12 = "нужно быть старше 12 лет";

export const neverPurposefully = "Целенаправленно не занимаюсь вообще";
export const coupleTimesInYear = "Несколько раз в год";
export const coupleTimesInMonth = "Несколько раз в месяц";
export const coupleTimesInWeek = "Несколько раз в неделю";
export const everyDay = "Каждый день";
export const severalTimesInDay = "Несколько раз в день";

export const neverDidAndNotGoingInFuture =
  "Никогда этого не делал(а) и не собираюсь";
export const neverDidButDoNotKnowIfGoingToDoInFuture =
  "Никогда этого не делал(а), не знаю начну ли в будущем";
export const didBeforeButDoNotKnowIfGoingToDoInFuture =
  "Делал(а) раньше, не знаю буду продолжать или нет";
export const didBeforeNotGoingInFuture =
  "Делал(а) раньше, не собираюсь в будущем";
export const coupleTimesInYearOrMoreSeldom = "Несколько раз в год или реже";

export const otherUserShouldBeAddingPlaceSuggestion =
  "Другой пользователь должен добавлять место встречи";
