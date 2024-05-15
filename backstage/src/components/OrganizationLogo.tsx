import React from "react";
import styled from "styled-components";
import { Colors, Icon, Icons } from "@sellout/ui";

type ContainerProps = {
  size?: number;
}

const Container = styled.div<ContainerProps>`
  display: flex;
  justify-content: center;
  align-items: center;
  background: ${Colors.White};
  border: 1px solid ${Colors.Grey6};
  box-sizing: border-box;
  border-radius: 10px;
  width: ${(props) => props.size ? `${props.size}px` : '90px'};
  height: ${(props) => props.size ? `${props.size}px` : '90px'};
`;

const OrganizationLogoImg = styled.img<ContainerProps>`
  height: auto;
  width: ${(props) => props.size ? `${props.size * 0.7}px` : '50px'};
`;

type OrganizationLogoProps = {
  logoUrl: string | undefined;
  size?: number;
};

const OrganizationLogo: React.FC<OrganizationLogoProps> = ({ logoUrl, size }) => {

  /** Render */
  return (
    <Container size={size}>
      {logoUrl? (
        <OrganizationLogoImg src={logoUrl} size={size} />
      ) : (
        <Icon
          icon={Icons.OrganizationSolid}
          color={Colors.Grey5}
          size={size ? (size * 0.7) : 50}
        />
      )}
    </Container>
  );
};

export default OrganizationLogo;
