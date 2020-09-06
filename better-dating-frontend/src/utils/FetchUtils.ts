// https://developer.mozilla.org/ru/docs/Web/JavaScript/Reference/Global_Objects/Promise
// https://developer.mozilla.org/ru/docs/Web/API/Fetch_API/Using_Fetch

export const unauthorized = (response: any) => [401, 403].includes(response.status);

const ensureOkAndTryParseJson = async (response: Response) => {
	if (unauthorized(response)) { // not logged in
		throw response;
	}

	let responseJson = null;
	try {
		responseJson = await response.json();
	} catch (error) {
		if (response.ok) { // non json, but ok response
			return response;
		}
		throw response;
	}

	if (!response.ok) { // non ok, but with json error description
		throw responseJson;
	}
	return responseJson; // ok, json
}

export const getData = async (url: string, params: { [key: string]: string; } = {}, headers: any = {}) => {
	const urlSearchParams = new URLSearchParams();
	Object.keys(params).forEach(key => urlSearchParams.append(key, params[key]))
	const queryPart = !urlSearchParams.keys().next().done ? `?${urlSearchParams}` : '';
	const response = await fetch(`${url}${queryPart}`, {
		method: 'GET', // *GET, POST, PUT, DELETE, etc.
		credentials: 'same-origin', // include, same-origin, omit
		headers
	});
	return ensureOkAndTryParseJson(response);
};

export const getCsrf = async () => {
	await getData('/api/support/csrf');
};
const getCookie = (name: string) => {
	const match = document.cookie.match(new RegExp(`(^| )${name}=([^;]+)`));
	return match ? match[2] : '';
};

const requestWithBody = async (method: string, url: string, data: object) => {
	await getCsrf();
	const csrf = getCookie('XSRF-TOKEN');
	const response = await fetch(url, {
		method,
		cache: 'no-cache',
		headers: {
			'Content-Type': 'application/json',
			'X-XSRF-TOKEN': csrf,
		},
		body: JSON.stringify(data), // тип данных в body должен соответвовать значению заголовка "Content-Type"
	});
	return ensureOkAndTryParseJson(response);
};

export const postData = async (url: string, data: object = {}) => requestWithBody('POST', url, data);
export const putData = async (url: string, data: object = {}) => requestWithBody('PUT', url, data);
export const deleteData = async (url: string, data: object = {}) => requestWithBody('DELETE', url, data);

export const firstValueIfArray = (target: string[] | string) => (target instanceof Array ? target[0] : target);

export const headers = (req: any) => req.rawHeaders.reduce((acc: { [key: string]: string }, curr: string, index: number, arr: string[]) => {
	if (index % 2 == 0) {
		acc[arr[index]] = arr[index + 1];
	}
	return acc;
}, {});

export const handleUnauthorized = (error: any, res: any) => {
	if (unauthorized(error)) {
		if (res) {
			res.writeHead(301, { Location: '/' });
			res.end();
		}

		return { props: {} };
	}
	return null;
}

