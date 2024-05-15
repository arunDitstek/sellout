import React from "react";
import CreateOrganizationModal from '../components/account/CreateOrganizationModal';
import {
  Container,
} from '../components/account/AccountStyle';

type CreateOrganizationProps = {};
const CreateOrganization: React.FC<CreateOrganizationProps> = () => {
  return (
    <Container>
      <CreateOrganizationModal />
    </Container>
  )
};

export default CreateOrganization;