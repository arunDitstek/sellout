import React from "react";
import { Route } from "react-router-dom";
import styled from "styled-components";
import SubSideNavigation from "../components/SubSideNavigation";
import CustomerSideNavButtons from "../components/CustomerSideNavButtons";
import CustomerOrders from "../pages/CustomerOrders.page";
import CustomerOverview from "../pages/CustomerOverview.page";
import PageLoader from "../components/PageLoader";
import UserInfo, {
  UserInfoSizeEnum,
} from "@sellout/ui/build/components/UserInfo";
import useCustomer from "../hooks/useCustomer.hook";
import { DetailsContainer, Page } from "../components/PageLayout";

const CustomerInfoContainer = styled.div`
  margin-bottom: 40px;
  display: flex;
`;

type CustomerDetailsProps = {
  match: any;
};

const CustomerDetailsContainer: React.FC<CustomerDetailsProps> = ({
  match,
}) => {
  const { customer } = useCustomer();
  let userWithImage = {
    ...customer?.user,
    userProfile: {
      imageUrl: customer?.imageUrl,
    },
  };

  return (
    <>
      <PageLoader nav={true} fade={Boolean(customer)} />
      {customer && (
        <DetailsContainer>
          <SubSideNavigation>
            <CustomerInfoContainer>
              <UserInfo user={userWithImage} size={UserInfoSizeEnum.Large} />
            </CustomerInfoContainer>
            <CustomerSideNavButtons />
          </SubSideNavigation>
            <Route
              path={`${match.url}/overview`}
              component={CustomerOverview}
              />
              <Page>
            <Route path={`${match.url}/orders`} component={CustomerOrders} />
          </Page>
        </DetailsContainer>
      )}
    </>
  );
};

export default CustomerDetailsContainer;
