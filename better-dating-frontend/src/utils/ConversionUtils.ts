import { formatISO, parseISO } from 'date-fns';

export const fromBackendProfileValues = ({ birthday, ...restValues }: any) => ({
    ...restValues, bday: parseISO(birthday)
});

export const toBackendProfileValues = ({ bday, ...restValues }: any) => ({
    ...restValues, birthday: formatISO(bday, { representation: 'date' })
});

export const ensureBdayIsDate = ({ bday, ...restValues }: any) => ({
    ...restValues, bday: bday && parseISO(bday)
});
