import { useState, useEffect, useMemo } from "react";
import { PaperGrid } from "../../common";
import { Autocomplete } from "mui-rff";
import { debounce, getData, required } from "../../../utils";
import * as Messages from "./Messages";

type PopulatedLocality = {
  id: string;
  name: string;
  region: string;
  country: string;
};

const showPopulatedLocality = ({ name, region, country }: PopulatedLocality) =>
  `${name}, ${region}, ${country}`;

type Props = {
  initialValue: PopulatedLocality;
  nameAdjuster: (name: string) => string;
};
export const PopulatedLocalityAutocomplete = ({
  initialValue,
  nameAdjuster,
}: Props) => {
  const [value, setValue] = useState<PopulatedLocality | undefined>(
    initialValue
  );
  const [inputValue, setInputValue] = useState("");
  const [options, setOptions] = useState<PopulatedLocality[]>([initialValue]);
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
    <PaperGrid>
      <Autocomplete
        fieldProps={{ validate: required }}
        label={Messages.populatedLocalityWhereOneLives}
        name={nameAdjuster("populatedLocality")}
        autoComplete
        options={options}
        value={value}
        onChange={(event: any, newValue: PopulatedLocality | null) => {
          setValue(newValue);
        }}
        onInputChange={(event, newInputValue) => {
          setInputValue(newInputValue);
        }}
        getOptionValue={(locality: PopulatedLocality) => locality}
        getOptionLabel={showPopulatedLocality}
        renderOption={showPopulatedLocality}
      />
    </PaperGrid>
  );
};
