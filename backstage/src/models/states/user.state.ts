import IUser from '@sellout/models/.dist/interfaces/IUser';

export default function userState(): IUser {
  return {
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    phoneNumber: '',
  };
};
