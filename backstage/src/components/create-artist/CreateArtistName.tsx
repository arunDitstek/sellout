import React from "react";
import styled from "styled-components";
import { useDispatch } from "react-redux";
import * as ArtistActions from "../../redux/actions/artist.actions";
import Input, { InputSizes } from "@sellout/ui/build/components/Input";
import Error from '../../elements/Error';
import * as Validation from '@sellout/ui/build/utils/Validation';
import useArtist from "../../hooks/useArtist.hook";

const Container = styled.div`
  position: relative;
`;

type CreateArtistNameProps = {
  width?: string;
};

const CreateArtistName: React.FC<CreateArtistNameProps> = ({
  width = '100%',
}) => {
  /* Hooks */
  const { artist, artistId } = useArtist();

  /* Actions */
  const dispatch = useDispatch();
  const setArtistName = (name: string) =>
    dispatch(ArtistActions.setArtistName(artistId, name));

  /** Render */
  return (
    <Container>
      <Input
        label="Performer name"
        type="text"
        placeholder="Ex. The Beatles"
        size={InputSizes.Regular}
        value={artist?.name as string}
        width={width}
        onChange={(event: React.FormEvent<HTMLInputElement>) => {
          setArtistName(event.currentTarget.value);
        }}
        // HANDLE ERROR
        // validationError={"This is an eror"}
        autoFocus
        maxLength={80}
      />
    </Container>
  );
};

export default CreateArtistName;
