import {
  ProfileFormData,
  defaultValues as profileDefaultValues,
} from "../profile";

export interface RegistrationFormData extends ProfileFormData {
  acceptTerms?: boolean;
}

export const defaultValues = { ...profileDefaultValues, acceptTerms: false };
