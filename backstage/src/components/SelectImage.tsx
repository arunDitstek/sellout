import React from "react";
import styled from "styled-components";
import { useDispatch } from "react-redux";
import { useDropzone } from "react-dropzone";
import * as AppActions from "../redux/actions/app.actions";
import { Colors, Icon, Icons, Loader, LoaderSizes } from "@sellout/ui";
import * as Polished from 'polished';
import Label from "@sellout/ui/build/components/Label";
import ReactTooltip from "react-tooltip";
import useImageCrop from '../hooks/useImageCrop.hook';
import { AppNotificationTypeEnum } from "../models/interfaces/IAppNotification";
import { media } from "@sellout/ui/build/utils/MediaQuery";

const Container = styled.div`
  position: relative;
`;

type DropzoneContainerProps = {
  hover: boolean;
  size: SelectImageSizes;
}

const DropzoneContainer = styled.div<DropzoneContainerProps>`
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: ${props => {
    if (props.size === SelectImageSizes.Large) {
      return '398px';
    }

    if (props.size === SelectImageSizes.Regular) {
      return '148px';
    }
  }};
  height: ${props => {
    if (props.size === SelectImageSizes.Large) {
      return '223px';
    }

    if (props.size === SelectImageSizes.Regular) {
      return '98px';
    }
  }};
  background-color: ${Polished.lighten(0.45, Colors.Orange)};
  border: 1px solid ${Polished.lighten(0.3, Colors.Orange)};
  transition: all 0.2s;
  border-radius: 10px;

  &:hover {
    cursor: ${(props) => (props.hover ? "pointer" : null)};
    background-color: ${Polished.lighten(0.435, Colors.Orange)};
    border: 1px solid ${Polished.lighten(0.2, Colors.Orange)};
  }

  &:focus {
    outline: none;
  }
`;

type DropzoneTextProps = {
  size: SelectImageSizes;
};

const DropzoneText = styled.div<DropzoneTextProps>`
  font-size: 1.2rem;
  font-weight: 600;
  color: ${Colors.Orange};
  margin-top: ${props => {
    if (props.size === SelectImageSizes.Large) {
      return '15px';
    }

    if (props.size === SelectImageSizes.Regular) {
      return '10px';
    }
  }};
`;

const Orange = styled.span`
  color: ${Colors.Orange};
`;

type PosterImageProps = {
  image?: string;
  size: SelectImageSizes;
}

const PosterImage = styled.div<PosterImageProps>`
  position: relative;
  background-image: url(${(props) => props.image});
  background-position: center;
  background-size: cover;
  width: ${props => {
    if (props.size === SelectImageSizes.Large) {
      return '400px';
    }

    if (props.size === SelectImageSizes.Regular) {
      return '150px';
    }
  }};
  height: ${props => {
    if (props.size === SelectImageSizes.Large) {
      return '225px';
    }

    if (props.size === SelectImageSizes.Regular) {
      return '100px';
    }
  }};
  border-radius: 10px;
  @media (max-width: 480px){
    width: 100%;
  }
`;

const Controls = styled.div`
  position: absolute;
  top: 10px;
  right: 10px;
  width: 61px;
  height: 28px;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content:space-around;
  background-color: ${Polished.rgba(Colors.Black, 0.50)};
  border-radius: 10px;
`;

const ChangeImage = styled.div`
  &:focus {
    outline: none;
  }
`;

// HANDLE ERROR

export enum SelectImageSizes {
  Regular = 'Regular',
  Large = 'Large',
}

type SelectImageProps = {
  imageUrl?: string;
  setImageUrl: (url: string) => void;
  size?: SelectImageSizes;
  label?: string;
  tip?: string;
  subLabel?: string;
};

const SelectImage: React.FC<SelectImageProps> = ({
  imageUrl,
  setImageUrl,
  size = SelectImageSizes.Regular,
  label,
  subLabel,
  tip,
}) => {
  const dispatch = useDispatch();
  /* State */
  const isLarge = size === SelectImageSizes.Large;

  /* Hooks */
  // HANDLE ERROR
  const { cropImage, loading, error } = useImageCrop(
    {
      imageUrl: imageUrl,
      setImageUrl: setImageUrl,
    }
  );

  React.useLayoutEffect(() => {
    ReactTooltip.hide();
    ReactTooltip.rebuild();
  });

  /** Render */
  const { getRootProps, getInputProps } = useDropzone({
    accept:"image/jpeg, image/png",
    maxSize:2097152,
    onDrop: (acceptedFiles, fileRejections) => {
      fileRejections.forEach((file) => {
        file.errors.forEach((err) => {
          if (err.code === "file-too-large") {
            console.log(`Error: ${err.message}`);
            dispatch(AppActions.showNotification(err.message, AppNotificationTypeEnum.Error));
          }
          if (err.code === "file-invalid-type") {
            console.log(`Error: ${err.message}`);
            dispatch(AppActions.showNotification(err.message, AppNotificationTypeEnum.Error));
          }
        });
      });
        if(acceptedFiles.length > 0)
        cropImage(acceptedFiles)
    }
  });

  return (
    <Container>
      {label && <Label text={label} subText={subLabel} tip={tip} />}
      {(() => {

        if (loading) {
          return (
            <DropzoneContainer hover={false} size={size}>
              <Loader size={isLarge ? LoaderSizes.Large : LoaderSizes.Small} color={Colors.Orange} />
            </DropzoneContainer>
          );
        }

        if (imageUrl) {
          return (
            <PosterImage image={imageUrl} size={size}>
              <Controls>
                <ChangeImage {...getRootProps()}>
                  <input {...getInputProps()} />
                  <Icon
                    icon={Icons.SyncRegular}
                    color={Polished.rgba(Colors.White, 0.5)}
                    size={14}
                    hoverColor={Colors.White}
                    onClick={() => {}}
                    tip="Change Image"
                  />
                </ChangeImage>
                <Icon
                  icon={Icons.DeleteRegular}
                  color={Polished.rgba(Colors.White, 0.5)}
                  size={14}
                  hoverColor={Colors.White}
                  onClick={() => setImageUrl("")}
                  tip="Remove Image"
                />
              </Controls>
            </PosterImage>
          );
        }

        return (
          <DropzoneContainer {...getRootProps()} hover={true} size={size}>
            <input {...getInputProps()} />
            <Icon icon={Icons.UploadLight} color={Colors.Orange} size={isLarge ? 36 : 24} />
            <DropzoneText size={size}>Drop file or <Orange>browse</Orange></DropzoneText>
          </DropzoneContainer>
        );
      })()}
    </Container>
  );
};

export default SelectImage;
