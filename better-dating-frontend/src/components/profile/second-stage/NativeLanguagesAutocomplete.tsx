import { useState, useEffect, useMemo } from "react";
import { Autocomplete } from "mui-rff";
import { debounce, getData, required } from "../../../utils";
import * as Messages from "./Messages";

type Language = {
  id: string;
  name: string;
};

const showLanguage = ({ name }: Language) => name;

// TODO generalize and extract common autocomplete functionality ?
type Props = {
  initialValues?: Language[];
  nameAdjuster: (name: string) => string;
};
export const NativeLanguagesAutocomplete = ({
  nameAdjuster,
  initialValues = [],
}: Props) => {
  const [value, setValue] = useState<Language[]>(initialValues);
  const [inputValue, setInputValue] = useState("");
  const [options, setOptions] = useState<Language[]>(initialValues);
  const debouncedLanguagesAutocomplete = useMemo(
    () =>
      debounce(
        (input: string, callback: (results?: Language[]) => void) =>
          getData(`/api/languages/autocomplete?q=${input}`).then(callback),
        200,
        true
      ),
    []
  );

  useEffect(() => {
    let active = true;
    debouncedLanguagesAutocomplete(inputValue, (languages?: Language[]) => {
      if (active && languages) {
        setOptions(languages);
      }
    });
    return () => {
      active = false;
    };
  }, [inputValue, debouncedLanguagesAutocomplete]);

  return (
    <Autocomplete
      multiple
      label={Messages.nativeLanguages}
      name={nameAdjuster("nativeLanguages")}
      fieldProps={{ validate: required }}
      autoComplete
      options={[...value, ...options]}
      filterSelectedOptions
      value={value}
      onChange={(event: any, newValue: Language | null) => {
        setValue(newValue);
      }}
      onInputChange={(event, newInputValue) => {
        setInputValue(newInputValue);
      }}
      getOptionValue={(language: Language) => language}
      getOptionSelected={({ id: optionId }, { id: valueId }) =>
        optionId === valueId
      }
      getOptionLabel={showLanguage}
      style={{ width: 500 }}
      renderOption={showLanguage}
    />
  );
};
