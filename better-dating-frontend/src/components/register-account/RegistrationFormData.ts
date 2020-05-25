import ProfileFormData, { defaultValues as profileDefaultValues } from '../profile/ProfileFormData';

export default interface RegistrationFormData extends ProfileFormData {
    acceptTerms?: boolean;
}

export const defaultValues = { ...profileDefaultValues, acceptTerms: false };
