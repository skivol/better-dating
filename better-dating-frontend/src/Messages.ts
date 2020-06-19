export const readyForOfflineUsage = 'Сайт загружен и будет частично работать без доступа к сети Интернет';
export const appUpdatedAndWillBeRefreshedOnNextVisit = 'Новая версия загружена и будет доступна после закрытия текущей страницы и последующем её открытии';
export const appWorksOffline = 'Сайт работает без подключения к Интернету';

export const successVerifyingEmailMessage = 'Спасибо за подтверждение почтового адреса!';
export const expiredTokenMessage = "Expired token";

export const tokenName = 'токен';
export const resolveTokenMessage = (message: string) => {
    switch (message) {
        case "Invalid token format":
            return "Неправильный формат токена проверки.";
        case "No such token":
            return "Токен не найден.";
        case expiredTokenMessage:
            return "Токен просрочен. Запросите еще один и проверьте его в течение 1 дня.";
        default:
            return "Неизвестная ошибка. Попробуйте еще раз позже.";
    }
};

export const requiredField = 'обязательное поле';
export const invalidFormat = 'неправильный формат';
export const alreadyPresentEmail = 'почта уже существует';
export const minValue = (minValue: number) => `наименьшее допустимое значение ${minValue}`;
export const maxValue = (maxValue: number) => `наибольшее допустимое значение ${maxValue}`;
export const shouldBeOlderThan12 = 'нужно быть старше 12 лет';

export const neverPurposefully = 'Целенаправленно не занимаюсь вообще';
export const coupleTimesInYear = 'Несколько раз в год';
export const coupleTimesInMonth = 'Несколько раз в месяц';
export const coupleTimesInWeek = 'Несколько раз в неделю';
export const everyDay = 'Каждый день';
export const severalTimesInDay = 'Несколько раз в день';

export const neverDidAndNotGoingInFuture = 'Никогда этого не делал(а) и не собираюсь'
export const neverDidButDoNotKnowIfGoingToDoInFuture = 'Никогда этого не делал(а), не знаю начну ли в будущем'
export const didBeforeButDoNotKnowIfGoingToDoInFuture = 'Делал(а) раньше, не знаю буду продолжать или нет';
export const didBeforeNotGoingInFuture = 'Делал(а) раньше, не собираюсь в будущем';
export const coupleTimesInYearOrMoreSeldom = 'Несколько раз в год или реже';

