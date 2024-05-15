import React from "react";
import styled from "styled-components";
import { Icon, Colors, Loader, LoaderSizes } from '@sellout/ui';
import { media } from "@sellout/ui/build/utils/MediaQuery";

type ContainerProps = {
  loading?: any;
}

const Container = styled.div<ContainerProps>`
  padding: 0px 16px;
  font-size: 1.6rem;
  font-weight: 500;
  /* color: ${Colors.Grey3}; */
  color: ${(props) => props.loading === "true" ? Colors.White : Colors.Grey3};
  border-radius: 8px;
  border: 1px solid ${Colors.Grey5};
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${Colors.White};
  /* transition: all 0.2s; */
  height: 48px;
  cursor: pointer;
  min-width: max-content;
  position: relative;
  ${media.mobile`
   width: 100%;
   max-width: 200px;
  `};

  &:hover {
    border: 1px solid ${Colors.Grey4};
  }
`;

const LoaderContainer = styled.div`
  position: absolute;
  background: ${Colors.White};
`;

type FilterButtonProps = {
  text: string;
  icon: any;
  onClick: Function;
  loading?: boolean;
};

const FilterButton: React.FC<FilterButtonProps> = ({
  text,
  icon,
  onClick,
  loading
}) => {
  return (
    <Container onClick={() => onClick()} loading={loading ? "true" : "false"}>
      {loading && (
        <LoaderContainer>
          <Loader size={LoaderSizes.Small} color={Colors.Orange} />
        </LoaderContainer>
      )}
      <Icon
        icon={icon}
        color={loading ? Colors.White : Colors.Grey3} // hack to preserve button size while loading
        size={16}
        margin="0px 8px 0px 0px"
        transitionDuration="0s"
      />
      <div>
        {text}
      </div>
    </Container>
  );
};
export default FilterButton;
