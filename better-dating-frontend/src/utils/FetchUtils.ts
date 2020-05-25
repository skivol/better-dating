// https://developer.mozilla.org/ru/docs/Web/JavaScript/Reference/Global_Objects/Promise
// https://developer.mozilla.org/ru/docs/Web/API/Fetch_API/Using_Fetch

const ensureOkAndTryParseJson = async (response: Response) => {
	const responseJson = await response.json();
	if (!response.ok) {
		throw responseJson;
	}
	return responseJson;
}

export async function getData(url: string, params: { [key: string]: string; } = {}) {
	const urlSearchParams = new URLSearchParams();
	Object.keys(params).forEach(key => urlSearchParams.append(key, params[key]))
	const response = await fetch(`${url}?${urlSearchParams}`, {
		method: 'GET', // *GET, POST, PUT, DELETE, etc.
	});
	return ensureOkAndTryParseJson(response);
}

const requestWithBody = async (method: string, url: string, data: object) => {
	const response = await fetch(url, {
		method,
		cache: 'no-cache',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify(data), // тип данных в body должен соответвовать значению заголовка "Content-Type"
	});
	return ensureOkAndTryParseJson(response);
}

export const postData = async (url: string, data: object = {}) => requestWithBody('POST', url, data);
export const putData = async (url: string, data: object = {}) => requestWithBody('PUT', url, data);
