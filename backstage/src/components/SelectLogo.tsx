import React from "react";
import styled from "styled-components";
import { useDropzone } from "react-dropzone";
import { Colors, Loader, LoaderSizes } from "@sellout/ui";
import Label from "@sellout/ui/build/components/Label";
import ReactTooltip from "react-tooltip";
import useImageCrop from '../hooks/useImageCrop.hook';
import TextButton, { TextButtonSizes } from '@sellout/ui/build/components/TextButton';

const Container = styled.div`
  position: relative;
`;

const DropzoneContainer = styled.div`
  outline: none;
`;

type SelectLogoProps = {
  imageUrl?: string;
  setImageUrl: (url: string) => void;
  label?: string;
  tip?: string;
  UploadDisplay: React.ReactNode;
  uploadText: string;
};

const SelectLogo: React.FC<SelectLogoProps> = ({
  imageUrl,
  setImageUrl,
  label,
  tip,
  uploadText,
  UploadDisplay,
}) => {

  /* Hooks */
  const { cropImage, loading, error } = useImageCrop(
    {
      imageUrl: imageUrl,
      setImageUrl: setImageUrl,
      aspect: 1,
    }
  );

  /** Render */
  const { getRootProps, getInputProps } = useDropzone({
    onDrop: cropImage as any,
  });

  React.useLayoutEffect(() => {
    ReactTooltip.hide();
    ReactTooltip.rebuild();
  });

  return (
    <Container>
      {label && <Label text={label} tip={tip} />}
      {(() => {

        if (loading) {
          return (
            <Loader size={LoaderSizes.Large} color={Colors.Orange} />
          );
        }

        return (
          <>
            {UploadDisplay}
            <DropzoneContainer {...getRootProps()}>
              <input {...getInputProps()} />
              <TextButton
                size={TextButtonSizes.Small}
                margin="10px 0px 0px 0px"
              >
                {uploadText}
              </TextButton>
            </DropzoneContainer>
          </>
        );
      })()}
    </Container>
  );
};

export default SelectLogo;
