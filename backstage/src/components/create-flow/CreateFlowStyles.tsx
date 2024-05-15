import styled from "styled-components";
import { Colors } from "@sellout/ui";
import { media } from "@sellout/ui/build/utils/MediaQuery";

export const Container = styled.div`
  padding: 32px 32px 0 32px;
  height: calc(100% - 70px);
  position: relative;
  overflow: scroll;
  padding-bottom: 61px;
  display: flex;
  flex-direction: row;
  justify-content: center;
  @media (max-width: 767px) {
    height: calc(100% - 110px);
  }

  @media (max-width: 576px){
    top: 10px;
  }
  @media (max-width: 343px){
    top: 50px;
  }
`;

export const Content = styled.div`
  width: 600px;
  ${media.mobile`
    width: 100%;
  `};
`;

export const TitleContainer = styled.div`
  margin-bottom: 32px;
`;

export const Title = styled.div`
  color: ${Colors.Grey1};
  font-size: 2.4rem;
  font-weight: 600;
`;

export const Subtitle = styled.div`
  margin-top: 8px;
  font-size: 1.8rem;
  font-weight: 500;
  color: ${Colors.Grey3};
`;

export const Spacer = styled.div`
  height: 30px;
`;

export const NoContent = styled.div`
  position: relative;
  height: 112px;
  width: 602px;
  border: 3px dashed ${Colors.Grey5};
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
  ${media.mobile`
      width: initial;
    `};
`;

export const NoContentText = styled.div`
  font-size: 1.8rem;
  font-weight: 600;
  color: ${Colors.Grey4};
`;

export const RowToColumn = styled.div`
  display: flex;
  padding: 0;
  column-gap: 10px;
  align-items: center;

  ${media.mobile`
    flex-flow: wrap;
    gap: 10px;

  `};

  ${media.desktop`
    flex-direction: row;
  `};
`;

export const RowToColumnSpacer = styled.div`
  ${media.mobile`
    height: 30px;
  `};

  ${media.desktop`
    width: 20px;
  `};
`;
