import { CustomFieldTypeEnum } from '../enums/CustomFieldTypeEnum';

export default interface IEventCustomField {
  _id?: string;
  label?: string;
  type: CustomFieldTypeEnum;
  minLength: number;
  maxLength: number;
  maxValue: number;
  minValue: number;
  required: boolean;
  options: string[];
  active: boolean;
}
