import * as React from 'react';
import { getData, browser } from '.';

export const useUser = () => {
    const [user, setUser] = React.useState({ loading: true, loadError: null, id: null, authorities: null });

    React.useEffect(() => {
        if (browser()) {
            getData('/api/auth/me')
                .then((response) => setUser({ ...response, loading: false }))
                .catch((e) => setUser({ ...user, loading: false, loadError: e }));
        }
    }, []);

    return user;
};
