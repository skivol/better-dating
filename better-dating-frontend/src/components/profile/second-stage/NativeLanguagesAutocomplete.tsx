import { useState, useEffect, useMemo } from "react";
import { Autocomplete } from "mui-rff";
import { debounce, getData } from "../../../utils";
import * as Messages from "./Messages";

type Language = {
  id: string;
  name: string;
};

const showLanguage = ({ name }: Language) => name;

// TODO generalize and extract common autocomplete functionality ?
export const NativeLanguagesAutocomplete = () => {
  const [value, setValue] = useState<Language[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [options, setOptions] = useState<Language[]>([]);
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
      required
      label={Messages.nativeLanguages}
      name="nativeLanguages"
      autoComplete
      options={options}
      value={value}
      onChange={(event: any, newValue: Language | null) => {
        setValue(newValue);
      }}
      onInputChange={(event, newInputValue) => {
        setInputValue(newInputValue);
      }}
      getOptionValue={({ id }: Language) => id}
      getOptionLabel={showLanguage}
      style={{ width: 500 }}
      renderOption={showLanguage}
    />
  );
};
