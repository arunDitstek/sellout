export enum AppNotificationTypeEnum {
    Success = 'Success',
    Warning = 'Warning',
    Error = 'Error',
}

export default interface IAppNotification {
    type: AppNotificationTypeEnum;
    message: string;
    show: boolean;
}