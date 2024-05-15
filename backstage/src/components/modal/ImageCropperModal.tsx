import React from "react";
import styled from "styled-components";
import { useSelector, useDispatch } from "react-redux";
import { Colors } from '@sellout/ui';
import { BackstageState } from "../../redux/store";
import * as AppActions from "../../redux/actions/app.actions";
import ReactCrop, { Crop } from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";
import Button, { ButtonTypes } from '@sellout/ui/build/components/Button';
import IFileUpload from '../../models/interfaces/IFileUpload';
import * as Polished from 'polished';
import {
  ModalContainer,
  ModalHeader,
  ModalContent,
  ModalFooter,
} from "./Modal";

const Container = styled.div`
  overflow: hidden;

  .ReactCrop {
    /* overflow: initial !important; */
  }
  .ReactCrop__crop-selection {
    border-image: none !important;
    border: 2px solid ${Colors.Orange} !important;
    box-shadow: 0 0 0 9999em ${Polished.rgba(Colors.Black, 0.5)};
  }
  .ReactCrop__drag-handle {
    border-radius: 50% !important;
    border: 2px solid ${Colors.Orange} !important;
    background-color: ${Colors.Orange};
    height: 5px;
    width: 5px;
  }
  .ord-nw {
    margin-top: -5px;
    margin-left: -5px;
  }
  .ord-ne {
    margin-top: -5px;
    margin-right: -5px;
  }
  .ord-sw {
    margin-bottom: -5px;
    margin-left: -5px;
  }
  .ord-se {
    margin-bottom: -5px;
    margin-right: -5px;
  }
  .ReactCrop__image {
    max-height: 55vh;
  }
  
  .ReactCrop__drag-handle::after {
    display: none !important;
  }
`;

// HANDLE ERROR

type ImageCropperModalProps = {};

const ImageCropperModal: React.FC<ImageCropperModalProps> = () => {
  /* State */
  const { fileUpload } = useSelector((state: BackstageState) => state.app);
  const { blob, mimetype, aspect } = fileUpload;

  const [crop, setCrop] = React.useState<Crop>({
    unit: "%",
    width: 100,
    aspect: aspect || (16 / 9),
  });

  const [inputHTMLImage, setInputHTMLImage] = React.useState<HTMLImageElement>();
  const [cropHTMLImage, setCropHTMLImage] = React.useState<HTMLImageElement>();
  const [url, setUrl] = React.useState('');

  /* Actions */
  const dispatch = useDispatch();
  const popModal = () => dispatch(AppActions.popModal());
  const setFileUpload = (fileUpload: Partial<IFileUpload>) =>
    dispatch(AppActions.setFileUpload(fileUpload));

  /* Effects */
  async function cropImage(htmlImage: HTMLImageElement | undefined, cropImage: HTMLImageElement | undefined, crop: Crop) {
      if (htmlImage && cropImage && crop.width && crop.height) {
        const croppedImageUrl = await getCroppedImg(
          htmlImage,
          cropImage,
          crop,
          mimetype,
        );
        setUrl(croppedImageUrl);
      }
  }

  React.useEffect(() => {
    cropImage(inputHTMLImage, cropHTMLImage, crop);
  }, [inputHTMLImage, cropHTMLImage]);

  React.useEffect(() => {
    const inputHTMLImage = new Image();
    inputHTMLImage.onload = () => {
      setInputHTMLImage(inputHTMLImage);
    };
    inputHTMLImage.src = blob;
  }, []);

  /** Render */
  return (
    <ModalContainer>
      <ModalHeader title="Crop Image" close={popModal} />
      <ModalContent>
        {blob && (
          <Container>
            <ReactCrop
              src={blob}
              crop={crop}
              onImageLoaded={setCropHTMLImage}
              onComplete={(crop: Crop) => {
                cropImage(inputHTMLImage, cropHTMLImage, crop);
              }}
              onChange={setCrop}
            />
          </Container>
        )}
      </ModalContent>
      <ModalFooter>
        <div />
        <Button
          type={ButtonTypes.Thin}
          text="CROP IMAGE"
          onClick={() => {
            setFileUpload({ url });
            popModal();
          }}
        />
      </ModalFooter>
    </ModalContainer>
  );
};


function getCroppedImg(
  inputHTMLImage: HTMLImageElement,
  croppedHTMLImage: HTMLImageElement,
  crop: Crop,
  mimetype: string,
): Promise<string> {
  const maxWidth = 1800;
  const maxHeight = 1012.5;

  const width = crop.width as number;
  const height = crop.height as number;
  const X  = crop.x as number;
  const Y = crop.y as number;

  const canvas = document.createElement("canvas");
  let scaleX = croppedHTMLImage.naturalWidth / croppedHTMLImage.width;
  let scaleY = croppedHTMLImage.naturalHeight / croppedHTMLImage.height;

  canvas.width = width * scaleX;

  if (canvas.width > maxWidth) {
    canvas.width = maxWidth;
    scaleX = maxWidth / width;
  }

  canvas.height = height * scaleY;

  if (canvas.height > maxHeight) {
    canvas.height = maxHeight;
    scaleY = maxHeight / height;
  }

  const ctx = canvas.getContext("2d");

  if (!ctx) return Promise.reject();

  ctx.drawImage(
    inputHTMLImage,
    (X * croppedHTMLImage.naturalWidth) / croppedHTMLImage.width,
    (Y * croppedHTMLImage.naturalHeight) / croppedHTMLImage.height,
    (width * croppedHTMLImage.naturalWidth) / croppedHTMLImage.width,
    (height * croppedHTMLImage.naturalHeight) / croppedHTMLImage.height,
    0,
    0,
    width * scaleX,
    height * scaleY
  );

  // console.log(crop);
  // console.log('Image Width: ' + croppedHTMLImage.width);
  // console.log('Image Height: ' + croppedHTMLImage.height);

  // console.log('Image Natural Width: ' + croppedHTMLImage.naturalWidth);
  // console.log('Image Naturla Height: ' + croppedHTMLImage.naturalHeight);

  // console.log('Scale X: ' + scaleX);
  // console.log('Scale Y: ' + scaleY);

  // console.log('Canvas Width: ' + canvas.width);
  // console.log('Canvas Height: ' + canvas.height);

  return new Promise((resolve) => {
    canvas.toBlob((blob: any) => {
      if (!blob) {
        console.error("Canvas is empty");
        return;
      }
      // window.URL.revokeObjectURL(this.fileUrl);
      const fileUrl = window.URL.createObjectURL(blob);
      resolve(fileUrl);
    }, mimetype);
  });
}

export default ImageCropperModal;
