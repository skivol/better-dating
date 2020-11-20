import { useState, useEffect, useMemo } from "react";
import { Autocomplete } from "mui-rff";
import { debounce, getData } from "../../../utils";
import * as Messages from "./Messages";

type Interest = {
  id: string;
  name: string;
};

const showInterest = ({ name }: Interest) => name;

export const InterestsAutocomplete = () => {
  const [value, setValue] = useState<Interest[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [options, setOptions] = useState<Interest[]>([]);
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
    <Autocomplete
      multiple
      required
      label={Messages.interests}
      helperText={Messages.interestsHelp}
      name="interests"
      autoComplete
      options={options}
      value={value}
      onChange={(event: any, newValue: Interest | null) => {
        setValue(newValue);
      }}
      onInputChange={(event, newInputValue) => {
        setInputValue(newInputValue);
      }}
      getOptionValue={({ id }: Interest) => id}
      getOptionLabel={showInterest}
      style={{ width: 500 }}
      renderOption={showInterest}
    />
  );
};
