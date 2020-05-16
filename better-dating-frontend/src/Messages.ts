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
