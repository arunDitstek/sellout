import IAppNotification, { AppNotificationTypeEnum }from '../interfaces/IAppNotification';

const appNotification = (): IAppNotification => {
  return {
    type: AppNotificationTypeEnum.Success,
    message: '',
    show: false,
  };
}

export default appNotification;
