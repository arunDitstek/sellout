import React from "react";
import usePlacesAutocomplete, { getGeocode } from "use-places-autocomplete";
import styled from "styled-components";
import SearchDropdown, { SearchDropdownTypes } from "./SearchDropdown";
import { IconEnum } from "./Icons";

interface IAddress {
  address1?: string;
  address2?: string;
  city?: string;
  state?: string;
  zip?: string;
  country?: string;
  phone?: string;
  lat?: number | null;
  lng?: number | null;
  placeId?: string;
  placeName?: string;
  timezone?: string;
}

interface ISearchDropdownItem {
  text: string;
  value: any;
}

const Container = styled.div`
  width: 100%;
  z-index: 100000;
`;

export type AddressSearchDropdownProps = {
  value: IAddress;
  onChange: (address: IAddress) => void;
  width?: string;
  label?: string;
  tip?: string;
};

export default function AddressSearchDropdown({
  value,
  onChange,
  width,
  label,
  tip,
}: AddressSearchDropdownProps) {
  /* Hooks */
  let {
    value: innerValue,
    suggestions: { data },
    setValue,
  } = usePlacesAutocomplete({
    requestOptions: {
      componentRestrictions: { country: "us" },
    },
    debounce: 300,
  });

  React.useEffect(() => {
    let placeName = value?.placeName ? value?.placeName : "";
    setValue(placeName);
    innerValue = placeName;
  }, []);

  const selectAddress = React.useCallback(
    (address) => {
      console.log(address, "address");

      setValue(address);
      const doEffect = async () => {
        try {
          const [result] = await getGeocode({
            address,
          });
          const {
            geometry: { location },
          } = result;

          console.log(result);
          const addressObject = {
            address1: "",
            address2: "",
            city: "",
            state: "",
            zip: "",
            country: "",
            lat: location.lat(),
            lng: location.lng(),
            placeId: result.place_id,
            placeName: address,
          };
          result.address_components.forEach((ac: any) => {
            if (ac.types.includes("street_number")) {
              addressObject.address1 = ac.short_name;
            }
            if (ac.types.includes("route")) {
              addressObject.address1 = `${addressObject.address1} ${ac.short_name}`;
            }
            if (ac.types.includes("subpremise")) {
              addressObject.address2 = ac.short_name;
            }
            if (
              ac.types.includes("locality") &&
              ac.types.includes("political")
            ) {
              addressObject.city = ac.short_name;
            }
            if (
              ac.types.includes("administrative_area_level_1") &&
              ac.types.includes("political")
            ) {
              addressObject.state = ac.short_name;
            }
            if (
              ac.types.includes("country") &&
              ac.types.includes("political")
            ) {
              addressObject.country = ac.short_name;
            }
            if (ac.types.includes("postal_code")) {
              addressObject.zip = ac.short_name;
            }
          });


          console.log(addressObject,"addressObject")
          onChange(addressObject);
        } catch (e) {
          // HANDLE ERROR
          console.error(e);
        }
      };
      doEffect();
    },
    [onChange, setValue]
  );

  React.useEffect(() => {
    let intialAddress: IAddress = {};
    if (!innerValue) onChange(intialAddress);
  }, [innerValue]);

  /* Render */
  let items: ISearchDropdownItem[] = [];

  if (data.length) {
    items = data.map(
      (suggestion): ISearchDropdownItem => ({
        text: suggestion.description,
        value: suggestion.description,
      })
    );
  }

  return (
    <Container>
      <SearchDropdown
        type={SearchDropdownTypes.SingleSelect}
        icon={IconEnum.MapPinLight}
        onChange={selectAddress}
        value={innerValue}
        searchQuery={innerValue}
        setSearchQuery={setValue}
        placeholder="Search for an address"
        items={items}
        width={width}
        label={label}
        tip={tip}
      />
    </Container>
  );
}
