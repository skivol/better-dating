// https://developer.mozilla.org/ru/docs/Web/JavaScript/Reference/Global_Objects/Promise
// https://developer.mozilla.org/ru/docs/Web/API/Fetch_API/Using_Fetch

export function getData(url: string, params: { [key: string]: string; }) {
	const urlSearchParams = new URLSearchParams();
	Object.keys(params).forEach(key => urlSearchParams.append(key, params[key]))
	return new Promise((resolve, reject) => fetch(`${url}?${urlSearchParams}`, {
		method: 'GET', // *GET, POST, PUT, DELETE, etc.
	}).then(response => {
		if (response.ok) {
			resolve(response.json());
		} else {
			reject(response);
		}
	}));
}

export function postData(url: string, data: object = {}) {
	return new Promise((resolve, reject) => fetch(url, {
		method: 'POST', // *GET, POST, PUT, DELETE, etc.
		cache: 'no-cache',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify(data), // тип данных в body должен соответвовать значению заголовка "Content-Type"
	}).then(response => {
		if (response.ok) {
			resolve(response);
		} else {
			reject(response);
		}
	}));
}
