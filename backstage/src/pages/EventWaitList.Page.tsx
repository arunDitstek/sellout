import React, { useEffect } from "react";
import styled from "styled-components";
import PageLoader from "../components/PageLoader";
import { BackstageState } from "../redux/store";
import { useMutation,useQuery} from "@apollo/react-hooks";
import { useDispatch, useSelector } from "react-redux";
import WAIT_LIST_REPORT from "@sellout/models/.dist/graphql/mutations/waitListReport.mutation";
import FilterButton from "../elements/FilterButton";
import PageSearch from "../components/PageSearch";
import * as AppActions from "../redux/actions/app.actions";
import { AppNotificationTypeEnum } from "../models/interfaces/IAppNotification";
import { Icons } from "@sellout/ui/build/components/Icon";
import { media } from "@sellout/ui/build/utils/MediaQuery";
import { Page } from "../components/PageLayout";
import WaitListTable from "../components/WaitListTable";
import SEARCH_WAIT_LIST from "@sellout/models/.dist/graphql/queries/waitList.query";



export const Spacer = styled.div`
  width: 15px;
  padding: 5px;
`;

export const SearchContainer = styled.div`
  margin: 0px 24px 24px 0px;
  display: flex;
  ${media.mobile`
   display: block;
  `};
`;

export const ButtonContainer = styled.div`
  display: flex;
  gap: 15px;
  ${media.mobile`
  flex-direction: row;
  flex-flow: wrap;
`}
`;

export const TableContainer = styled.div`
  display: flex;
  height: calc(100% - 74px);
  ${media.mobile`
  height: calc(100% - 160px);
`};
`;

type EventOrdersProps = {};

const WaitList: React.FC<EventOrdersProps> = () => {
  const dispatch = useDispatch();
  const [searchQuery, setSearchQuery] = React.useState("");
  const [disable, setDisable] = React.useState("false");
 

  /** State */
  const eventState = useSelector((state: BackstageState) => state.event);
  const { eventId,eventsCache } = eventState;
  const event = eventsCache[eventId];


  /** GraphQL **/

  const [generateReport, { loading }] = useMutation(
    WAIT_LIST_REPORT,
    {
      onCompleted(data) {
        if (data?.generateWaitListReport.url.length > 0) {
          window.location.href = data?.generateWaitListReport.url;
          setDisable("false");
        } else if (data?.generateWaitListReport.message.length > 0) {
          dispatch(
            AppActions.showNotification(
              data?.generateWaitListReport.message,
              AppNotificationTypeEnum.Error
            )
          );
        }
      },
      onError(error) {
        console.error(error);
      },
    }
  );

const { data:waitListData,loading:listLoader,refetch,fetchMore } = useQuery(SEARCH_WAIT_LIST, {
  fetchPolicy: "network-only",
    variables: {
      query: {
        name:searchQuery
      },
      eventId: eventId,
    },
});
console.log(waitListData,"waitListData");

  useEffect(() => {
    if (!searchQuery) {
      refetch && refetch();
    }
  }, [searchQuery]);

  /* Render */
  return (
    <>
      <PageLoader  nav sideNav fade={Boolean(waitListData)}/>
        <Page>
          <SearchContainer>
            <PageSearch
              setSearchQuery={setSearchQuery}
              searchQuery={searchQuery}
              loading={listLoader}
              placeHolder="Search by Name, Email id"
            />
            <Spacer />
            <ButtonContainer>
              <FilterButton
                text="Export List"
                icon={Icons.DownloadReport}
                loading={loading}
                onClick={() => {
                  if (disable == "false") {
                    setDisable("true");
                    generateReport({
                      variables: {
                          eventId,
                      },
                    });
                  }
                }}
              />
            </ButtonContainer>
          </SearchContainer>
          <TableContainer>
            <WaitListTable
              timeZone={event?.venue?.address?.timezone}
              waitList={waitListData?.eventQuery}
            />
          </TableContainer>
        </Page>
    </>
  );
};

export default WaitList;
