export const successSubmittingEmailMessage = 'Спасибо за проявленный интерес! На указанный адрес было выслано письмо для проверки.';
export const errorSubmittingEmailMessage = 'Ой, что-то пошло не так... Попробуйте еще раз немного позже!';
export const successVerifyingEmailMessage = 'Спасибо за подтверждение почтового адреса!';
export const successTriggeringNewVerificationMessage = 'Новое письмо для проверки почты было отправлено.';
// export const errorVerifyingEmailMessage = 'Что-то пошло не так...';
export const expiredTokenMessage = "Expired token";

export const resolveMessage = (message: string) => {
	switch(message) {
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

