import styled from "styled-components";
import { Colors } from "@sellout/ui";
import { media } from "@sellout/ui/build/utils/MediaQuery";

export const DetailsContainer = styled.div`
  height: 100%;
  width: 100%;
  position: relative;
  box-sizing: border-box;
  display: flex;
  ${media.mobile`
  left: 0px;
  display: block;
  width: 100%;
  `};
`;

export const DetailsPageContentContainer = styled.div`
  overflow: scroll;
  flex: 1;
`;

type PageProps = {
  marginBottom?: string;
};

export const Page = styled.div<PageProps>`
  height: 100%;
  width: 100%;
  overflow-y: auto;
  padding: 24px;
  margin-bottom: ${(props) => props.marginBottom};
`;

export const PageTitle = styled.div`
  color: ${Colors.Grey1};
  font-weight: 600;
  font-size: 2.4rem;
  margin-bottom: 24px;
`;

type PaddedPageProps = {
  maxWidth?: string;
};

export const PaddedPage = styled.div<PaddedPageProps>`
  height: 100%;
  width: 100%;
  padding:  24px;
  box-sizing: border-box;
  max-width: ${(props) => props.maxWidth};
  position: relative;
  ${media.mobile`
  width: 100%;
  left: 0px;
  `};
`;
export const TopLeftPaddedPage = styled.div`
  height: calc(100% - 60px);
  width: calc(100% - 60px);
  padding: 24px 0 0 24px;
  box-sizing: border-box;
  position: absolute;
  top: 50px;
  left: 60px;
  ${media.mobile`
    width: 100%;
    left: 0px;
    padding-right: 20px;
    height: calc(100% - 125px);
  `};
`;
