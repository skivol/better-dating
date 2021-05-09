import { useState, useEffect, useMemo } from "react";
import { Autocomplete } from "mui-rff";
import { debounce, getData, required } from "../../../utils";
import { PaperGrid } from "../../common";

type PersonalQuality = {
  id: string;
  name: string;
};

const showPersonalQuality = ({ name }: PersonalQuality) => name;

type Props = {
  readonly: boolean;
  name: string;
  label: string;
  initialValues?: PersonalQuality[];
};
export const PersonalQualityAutocomplete = ({
  name,
  label,
  initialValues = [],
  readonly,
}: Props) => {
  const [value, setValue] = useState<PersonalQuality[]>(initialValues);
  const [inputValue, setInputValue] = useState("");
  const [options, setOptions] = useState<PersonalQuality[]>(initialValues);
  const debouncedPersonalQualitiesAutocomplete = useMemo(
    () =>
      debounce(
        (input: string, callback: (results?: PersonalQuality[]) => void) =>
          getData(`/api/personal-qualities/autocomplete?q=${input}`).then(
            callback
          ),
        200,
        true
      ),
    []
  );

  useEffect(() => {
    let active = true;
    debouncedPersonalQualitiesAutocomplete(
      inputValue,
      (personalQuality?: PersonalQuality[]) => {
        if (active && personalQuality) {
          setOptions(personalQuality);
        }
      }
    );
    return () => {
      active = false;
    };
  }, [inputValue, debouncedPersonalQualitiesAutocomplete]);

  // https://github.com/mui-org/material-ui/issues/18514
  return (
    <PaperGrid>
      <Autocomplete
        disabled={readonly}
        multiple
        label={label}
        name={name}
        fieldProps={{ validate: required }}
        autoComplete
        options={[...value, ...options]}
        filterSelectedOptions
        value={value}
        onChange={(event: any, newValue: any) => {
          setValue(newValue);
        }}
        onInputChange={(event, newInputValue) => {
          setInputValue(newInputValue);
        }}
        getOptionValue={(personalQuality: PersonalQuality) => personalQuality}
        getOptionLabel={showPersonalQuality}
        getOptionSelected={({ id: optionId }, { id: valueId }) =>
          optionId === valueId
        }
        renderOption={showPersonalQuality}
      />
    </PaperGrid>
  );
};
