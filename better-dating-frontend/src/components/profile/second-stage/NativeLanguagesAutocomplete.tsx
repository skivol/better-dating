import { useState, useEffect, useMemo } from "react";
import { Autocomplete } from "mui-rff";
import { debounce, getData, required } from "../../../utils";
import { PaperGrid } from "../../common";
import * as Messages from "./Messages";

type Language = {
  id: string;
  name: string;
};

const showLanguage = ({ name }: Language) => name;

// TODO generalize and extract common autocomplete functionality ?
type Props = {
  readonly: boolean;
  initialValues?: Language[];
  nameAdjuster: (name: string) => string;
};
export const NativeLanguagesAutocomplete = ({
  nameAdjuster,
  initialValues = [],
  readonly,
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
    <PaperGrid>
      <Autocomplete
        disabled={readonly}
        multiple
        label={Messages.nativeLanguages}
        name={nameAdjuster("nativeLanguages")}
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
        getOptionValue={(language: Language) => language}
        getOptionSelected={({ id: optionId }, { id: valueId }) =>
          optionId === valueId
        }
        getOptionLabel={showLanguage}
        renderOption={showLanguage}
      />
    </PaperGrid>
  );
};
