import React from "react";
import styled from "styled-components";
import CreateSeasonNavigation from "./CreateSeasonNavigation";
import { media } from "@sellout/ui/build/utils/MediaQuery";

const Container = styled.div`
  position: relative;
  display: flex;
  flex-direction: row;
  align-items: center;
`;

type CreateSeasonBreadCrumbProps = {};

const CreateSeasonBreadCrumb: React.FC<CreateSeasonBreadCrumbProps> = () => {
  return (
    <Container>
      <CreateSeasonNavigation />
    </Container>
  );
};

export default CreateSeasonBreadCrumb;
