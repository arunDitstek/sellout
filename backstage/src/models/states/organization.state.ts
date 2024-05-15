import IOrganization from '@sellout/models/.dist/interfaces/IOrganization';
import addressState from './address.state';

export default function organizationState(): IOrganization {
  return {
    orgName: "",
    orgUrls: [],
    orgLogoUrl: "",
    address: addressState(),
  }; 
};
