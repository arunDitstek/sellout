import { CustomFieldTypeEnum } from '../enums/CustomFieldTypeEnum';
export default interface IOrderCustomField {
  _id?: string;
  label: string;
  value: string | number;
  customFieldId: string;
  type: CustomFieldTypeEnum,
};
