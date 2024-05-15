import React, { useState, useRef } from "react";
import styled from "styled-components";
import { rgba } from "polished";
import { Colors, Loader, LoaderSizes } from "@sellout/ui";
import { useDispatch, useSelector } from "react-redux";
import { BackstageState } from "../redux/store";
import IPagination, {
  PaginationTypes,
  PaginationMap,
} from "@sellout/models/.dist/interfaces/IPagination";
import * as AppActions from "../redux/actions/app.actions";
import { media } from "@sellout/ui/build/utils/MediaQuery";

export enum ScrollTableTypeEnum {
  Regular = "Regular",
  Small = "Small",
}

type ScrollTableContainerProps = {
  type?: ScrollTableTypeEnum;
  name?: string;
  minWidth?: string;
};

export const ScrollTableContainer = styled.div<ScrollTableContainerProps>`
  box-shadow: ${(props) =>
    props.type === ScrollTableTypeEnum.Small
      ? "0px 4px 16px rgba(17, 0, 40, 0.05)"
      : null};
  border-radius: ${(props) =>
    props.type === ScrollTableTypeEnum.Small ? "10px" : null};
  border: ${(props) =>
    props.type === ScrollTableTypeEnum.Small
      ? `1px solid ${Colors.Grey6}`
      : null};
  position: relative;
  width: 100%; 
  overflow: auto;
`;

const scrollTableHeaderHeight = (type: ScrollTableTypeEnum) =>
  type === ScrollTableTypeEnum.Small ? "40px" : "27px";

export const ScrollTableHeader = styled.div<ScrollTableContainerProps>`
  position: absolute;
  width: 100%;
  display: flex;
  flex-direction: row;
  padding: ${({ type = ScrollTableTypeEnum.Regular }) =>
    type === ScrollTableTypeEnum.Small ? "0 16px" : "0 8px"};
  box-sizing: border-box;
  /* background-color: ${Colors.White}; */
  height: ${({ type = ScrollTableTypeEnum.Regular }) =>
    scrollTableHeaderHeight(type)};
  border-bottom: 1px solid
    ${({ type = ScrollTableTypeEnum.Regular }) =>
      type === ScrollTableTypeEnum.Regular ? Colors.Grey5 : Colors.Grey6};
  /* border-radius: 10px 10px 0px 0px; */
  z-index: 99;
  overflow: auto;
  @media (max-width: 650px) {
    min-width: 1000px;
  }
`;

type ScrollTableHeaderCellProps = {
  flex?: string;
  justify?: string;
  width?: string;
} & ScrollTableContainerProps;

export const ScrollTableHeaderCell = styled.div<ScrollTableHeaderCellProps>`
  flex: ${(props) => props.flex};
  width: ${(props) => props.width};
  justify-content: ${(props) => props.justify};
  position: relative;
  display: flex;
  flex-direction: row;
  align-items: ${({ type = ScrollTableTypeEnum.Regular }) =>
    type === ScrollTableTypeEnum.Small ? "center" : "flex-start"};
  color: ${Colors.Grey1};
  font-size: 1.2rem;
  font-weight: 600;
  overflow: auto;
`;

export const ScrollTableBody = styled.div<ScrollTableContainerProps>`
  margin-top: ${({ type = ScrollTableTypeEnum.Regular }) =>
    scrollTableHeaderHeight(type)};
  overflow: auto;
  box-sizing: border-box;
  width: 100%;
  min-width: 640px;
  border-radius: 0px 0px 10px 10px;
  height: ${({ type = ScrollTableTypeEnum.Regular }) =>
    `calc(100% - ${scrollTableHeaderHeight(type)})`};
  @media (max-width: 650px) {
    min-width: ${(props) => (props.minWidth ? props.minWidth : "1000px")};
  }
`;

type ScrollTableBodyRowProps = {
  height?: string;
  padding?: string;
  onClick?: Function;
  flex?: boolean;
};

export const ScrollTableBodyRow = styled.div<ScrollTableBodyRowProps>`
  transition: all 0.2s;
  display: flex;
  align-items: center;
  border-bottom: 1px inset ${Colors.Grey6};
  /* background-color: ${Colors.White}; */
  height: ${(props) => props.height || "35px"};
  padding: ${(props) => props.padding || "0 8px"};
  flex-flow: ${(props) => props.flex && "wrap"};

  &:hover {
    cursor: ${(props) => (props.onClick ? "pointer" : null)};
    background-color: ${(props) =>
      props.onClick ? rgba(Colors.Grey1, 0.03) : null};
  }
`;

type ScrollTableBodyCellProps = {
  flex?: string;
  justify?: string;
  width?: string;
  style?: boolean;
};

const ScrollTableBodyCellInner = styled.div<ScrollTableBodyCellProps>`
  flex: ${(props) => props.flex};
  width: ${(props) => props.width};
  justify-content: ${(props) => props.justify};
  display: flex;
  flex-direction: row;
  align-items: center;
  color: ${Colors.Grey1};
  font-size: 1.2rem;
  font-weight: 500;
  overflow: visible;
  position: relative;
  padding-right: ${(props) => (props.style ? "10px" : "0px")};
`;

const Ellipsis = styled.div<any>`
  white-space: ${(props) => (props.style ? "" : "nowrap")};
  overflow: hidden;
  text-overflow: ellipsis;
  display: flex;
  align-items: center;
`;

export const ScrollTableBodyCell: React.FC<ScrollTableBodyCellProps> = ({
  children,
  flex,
  width,
  justify,
  style,
}) => {
  return (
    <ScrollTableBodyCellInner
      flex={flex}
      width={width}
      justify={justify}
      style={style}
    >
      <Ellipsis style={style}>{children}</Ellipsis>
    </ScrollTableBodyCellInner>
  );
};

export const ScrollTableNoContent = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
  margin: 48px 48px;
`;

export const ScrollTableSpace = styled.div`
  width: 20px;
`;

type ScrollTableProps = {
  children?: React.ReactNode;
  updateQuery?: Function;
  fetchMore?: Function;
  paginationType?: PaginationTypes;
  scrollContainer?: any;
  type?: ScrollTableTypeEnum;
  name?: string;
  minWidth?: string;
};

const ScrollTable: React.FC<ScrollTableProps> = ({
  children,
  updateQuery,
  fetchMore,
  paginationType,
  scrollContainer,
  type = ScrollTableTypeEnum.Regular,
  name,
  minWidth,
}) => {
  const [fetching, setFetching] = useState(false);
  const [isMore, setIsMore] = useState(true);
  const dispatch = useDispatch();
  const { paginationMap } = useSelector((state: BackstageState) => state.app);
  const setPaginationMap = (paginationMap: PaginationMap) =>
    dispatch(AppActions.setPaginationMap(paginationMap));
  const handleScroll = async () => {
    if (!fetchMore || !paginationType) return;
    let scrollPosition =
      scrollContainer?.current.offsetHeight +
      scrollContainer?.current.scrollTop;
    let scrollPositionMax = scrollContainer?.current.scrollHeight - 500;
    const { pageSize, pageNumber } = paginationMap.get(
      paginationType
    ) as IPagination;

    console.log("paginationType", pageSize, pageNumber);
    if (scrollPosition >= scrollPositionMax && !fetching && isMore) {
      if (paginationType) {
        setFetching(true);
        setPaginationMap(
          paginationMap.set(paginationType, {
            pageSize,
            pageNumber: pageNumber + 1,
          })
        );
        const { data } = await fetchMore({
          variables: {
            pagination: paginationMap.get(paginationType),
          },
          updateQuery,
        });
        console.log(data, "data");
        // TODO: Sit down and find better solution when time permits.
        if (data?.userProfiles?.length <= 0) {
          setIsMore(false);
        } else if (data?.orders?.length <= 0) {
          setIsMore(false);
        } else if (data?.userProfilesAdmin <= 0) {
          setIsMore(false);
        } else if (data?.organizations <= 0) {
          setIsMore(false);
        }
        setFetching(false);
      }
    }
  };

  return (
    <ScrollTableContainer
      onScroll={handleScroll}
      type={type}
      name={name}
      minWidth={minWidth}
    >
      {typeof children === "function" ? children(fetching) : children}
    </ScrollTableContainer>
  );
};

export default ScrollTable;
