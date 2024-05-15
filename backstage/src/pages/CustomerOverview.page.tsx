import React from "react";
import PageLoader from "../components/PageLoader";
import CustomerStatsCard from "../components/CustomerStatsCard";
import RecentOrdersCard from "../components/RecentOrdersCard";
import useCustomer from "../hooks/useCustomer.hook";
import { PageTitle, PaddedPage } from "../components/PageLayout";

type CusomterOverviewProps = {};
const CustomerOverview: React.FC<CusomterOverviewProps> = () => {
  /** Hooks */
  const { customer } = useCustomer();

  /* Render */
  return (
    <>
      <PageLoader nav sideNav fade={Boolean(customer)} />
      {customer && (
        <PaddedPage>
          <PageTitle>Overview</PageTitle>

          <CustomerStatsCard customer={customer} />
          <RecentOrdersCard customer={customer} />
        </PaddedPage>
      )}
    </>
  );
};

export default CustomerOverview;
