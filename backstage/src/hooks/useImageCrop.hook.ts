import React from 'react';
import { ApolloError } from '@apollo/client';
import { useMutation } from "@apollo/react-hooks";
import { useSelector, useDispatch } from "react-redux";
import { BackstageState } from "../redux/store";
import * as AppActions from "../redux/actions/app.actions";
import UPLOAD_FILES from "@sellout/models/.dist/graphql/mutations/uploadFiles.mutation";
import shortid from "shortid";
import mime from 'mime-types'; 

function convertObjectURLToFile(objectUrl: string, mimetype: string): Promise<File> {
  return new Promise((resolve) => {
    const xhr = new XMLHttpRequest();
    xhr.open("GET", objectUrl);
    // force the HTTP response, response-type header to be blob
    xhr.responseType = "blob";

    xhr.onload = function () {
      const blob = xhr.response;
      blob.lastModifiedDate = new Date();
      blob.name = "new";
      const finalFile = new File([blob], `image.${mime.extension(mimetype)}`, {
        type: mimetype,
      })
      resolve(finalFile);
    };
    xhr.send();
  });
}

type ImageCrop = {
  cropImage: Function;
  loading: boolean;
  error?: any;
};

type ImageCropParams = {
  imageUrl?: string;
  setImageUrl: (url: string) => void;
  aspect?: number;
};

type ImageCropHook = (params: ImageCropParams) => ImageCrop;

const useImageCrop: ImageCropHook = ({
  imageUrl,
  setImageUrl,
  aspect,
}) => {
  /* State */
  const [key] = React.useState(shortid.generate());
  const { fileUpload } = useSelector((state: BackstageState) => state.app);
  const { url, mimetype, keys } = fileUpload;

  /* Actions */
  const dispatch = useDispatch();

  const startFileUpload = (blob: string, mimetype: string, key: string, aspect?: number) =>
    dispatch(AppActions.startFileUpload(blob, mimetype, key, aspect));

  const finishFileUpload = (key: string) =>
    dispatch(AppActions.finishFileUpload(key));

  const cropImage = React.useCallback((files: File[]) => {
    const reader = new FileReader();
    const file = files[0];
    const mimetype = file.type;
    reader.addEventListener("load", async () => {
      const blob: string = reader.result as string;
      startFileUpload(blob, mimetype, key, aspect);
    });

    reader.readAsDataURL(file);
  }, []);

  /** Graphql */
  const [uploadFiles, { loading, error }] = useMutation(UPLOAD_FILES, {
    onCompleted: async (data) => {
      const posterImageUrl = data?.uploadFiles?.[0]?.url;
      setImageUrl(posterImageUrl);
    },
  });

  /** Effects */
  React.useLayoutEffect(() => {
    if (!url || key !== keys.slice(-1).pop()) return;
    async function doEffect() {
      finishFileUpload(key);
      const file = await convertObjectURLToFile(url, mimetype);
      uploadFiles({
        variables: {
          files: [file],
        },
      });
    }

    doEffect();
  }, [url]);

  /** Return */
  return {
    cropImage,
    loading,
    error,
  }

};

export default useImageCrop;