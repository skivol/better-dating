import { useState, useEffect, useMemo } from "react";
import { Autocomplete } from "mui-rff";
import { debounce, getData, required } from "../../../utils";
import { PaperGrid } from "../../common";
import * as Messages from "./Messages";

type Interest = {
  id: string;
  name: string;
};

const showInterest = ({ name }: Interest) => name;

type Props = {
  readonly: boolean;
  initialValues?: Interest[];
  nameAdjuster: (name: string) => string;
};
export const InterestsAutocomplete = ({
  nameAdjuster,
  initialValues = [],
  readonly,
}: Props) => {
  const [value, setValue] = useState<Interest[]>(initialValues);
  const [inputValue, setInputValue] = useState("");
  const [options, setOptions] = useState<Interest[]>(initialValues);
  const debouncedInterestsAutocomplete = useMemo(
    () =>
      debounce(
        (input: string, callback: (results?: Interest[]) => void) =>
          getData(`/api/interests/autocomplete?q=${input}`).then(callback),
        200,
        true
      ),
    []
  );

  useEffect(() => {
    let active = true;
    debouncedInterestsAutocomplete(inputValue, (interests?: Interest[]) => {
      if (active && interests) {
        setOptions(interests);
      }
    });
    return () => {
      active = false;
    };
  }, [inputValue, debouncedInterestsAutocomplete]);

  return (
    <PaperGrid>
      <Autocomplete
        disabled={readonly}
        multiple
        label={Messages.interests}
        helperText={Messages.interestsHelp}
        fieldProps={{ validate: required }}
        name={nameAdjuster("interests")}
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
        getOptionValue={(interest: Interest) => interest}
        getOptionSelected={({ id: optionId }, { id: valueId }) =>
          optionId === valueId
        }
        getOptionLabel={showInterest}
        renderOption={showInterest}
      />
    </PaperGrid>
  );
};
