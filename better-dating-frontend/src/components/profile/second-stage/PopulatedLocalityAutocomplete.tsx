import { useState, useEffect, useMemo } from "react";
import { Autocomplete } from "mui-rff";
import { debounce, getData } from "../../../utils";
import * as Messages from "./Messages";

type PopulatedLocality = {
  id: string;
  name: string;
  region: string;
  country: string;
};

const showPopulatedLocality = ({ name, region, country }: PopulatedLocality) =>
  `${name}, ${region}, ${country}`;

export const PopulatedLocalityAutocomplete = () => {
  const [value, setValue] = useState<PopulatedLocality | null>(null);
  const [inputValue, setInputValue] = useState("");
  const [options, setOptions] = useState<PopulatedLocality[]>([]);
  const debouncedPopulatedLocalitiesAutocomplete = useMemo(
    () =>
      debounce(
        (input: string, callback: (results?: PopulatedLocality[]) => void) =>
          getData(`/api/populated-localities/autocomplete?q=${input}`).then(
            callback
          ),
        300,
        true
      ),
    []
  );

  useEffect(() => {
    let active = true;
    debouncedPopulatedLocalitiesAutocomplete(
      inputValue,
      (populatedLocalities?: PopulatedLocality[]) => {
        if (active && populatedLocalities) {
          setOptions(populatedLocalities);
        }
      }
    );
    return () => {
      active = false;
    };
  }, [inputValue, debouncedPopulatedLocalitiesAutocomplete]);

  return (
    <Autocomplete
      required
      label={Messages.populatedLocalityWhereOneLives}
      name="populatedLocality"
      autoComplete
      options={options}
      value={value}
      onChange={(event: any, newValue: PopulatedLocality | null) => {
        setValue(newValue);
      }}
      onInputChange={(event, newInputValue) => {
        setInputValue(newInputValue);
      }}
      getOptionValue={({ id }: PopulatedLocality) => id}
      getOptionLabel={showPopulatedLocality}
      style={{ width: 500 }}
      renderOption={showPopulatedLocality}
    />
  );
};
