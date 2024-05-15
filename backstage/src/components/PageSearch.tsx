import React from "react";
import {Icons} from '@sellout/ui';
import Input, { InputSizes } from "@sellout/ui/build/components/Input";

type PageSearchProps = {
  setSearchQuery: (arg: string) => void;
  searchQuery: string;
  loading?: boolean;
  placeHolder: string;
};

const PageSearch: React.FC<PageSearchProps> = ({
  setSearchQuery,
  searchQuery,
  placeHolder,
  loading,
}) => {
  return (
    <Input
      type="text"
      placeholder={placeHolder}
      loading={loading}
      size={InputSizes.Large}
      value={searchQuery}
      width="100%"
      onChange={(event: React.FormEvent<HTMLInputElement>) => {
        setSearchQuery(event.currentTarget.value);
      }}
      icon={Icons.SearchLight}
      onClear={() => {
        setSearchQuery('');
      }}
    />
  );
};

export default PageSearch;
