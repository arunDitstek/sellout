import * as pb from '@sellout/models/.dist/sellout-proto';
import { IServiceProxy } from '../proxyProvider';
import {
  ApolloError,
  AuthenticationError,
  UserInputError,
  errorSpan,
} from './../graphqlError';

function streamToBuffer(stream) {
  return new Promise((resolve, reject) => {
    let buffers = [];
    stream.on('error', reject);
    stream.on('data', (data) => buffers.push(data));
    stream.on('end', () => resolve(Buffer.concat(buffers)));
  });
}

export const resolvers = {
  Mutation: {
    async uploadFiles(_, args, context) {
      let { req, proxy } = context;
      const span = req.tracer.startSpan('FileUpload.uploadFiles', req.span);
      const spanContext = span.context().toString();
      const { userId, orgId } = req.user;

      if (!userId) {
        throw new AuthenticationError("Authentication Required.");
      }

      const files = await Promise.all(args.files.map(async file => {
        const { createReadStream, filename, mimetype, encoding } = await file;
        const buffer = await streamToBuffer(createReadStream());

        return Object.assign(new pb.File(), {
          file: buffer,
          mimetype,
          filename,
          encoding,
        });
      }));

      const uploadRequest = pb.UploadFileRequest.create({
        spanContext,
        orgId,
        userId,
        files,
      });

      proxy = <IServiceProxy>proxy;

      let uploadResponse;

      try {
        uploadResponse = await proxy.fileUploadService.uploadFile(uploadRequest);

        if (uploadResponse.status == pb.StatusCode.UNPROCESSABLE_ENTITY) {
          throw new UserInputError('Invalid Fields', {
            invalidArgs: uploadResponse.errors.map(e => e.key),
          });
        }

        if (uploadResponse.status !== pb.StatusCode.OK) {
          throw new ApolloError(uploadResponse.errors[0].message, uploadResponse.status);
        }

      } catch (e) {
        errorSpan(span, e);
        throw e;
      }

      span.finish();
      return uploadResponse.files;
    },
  }
};
