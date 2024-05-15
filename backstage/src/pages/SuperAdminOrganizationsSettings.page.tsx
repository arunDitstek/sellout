import React from "react";
import { Page, PageTitle } from "../components/PageLayout";
import DELETE_ORGANIZATION_FEE from "@sellout/models/.dist/graphql/mutations/deleteOrganizationFee.mutation";
import CREATE_ORGANIZATION_FEE from "@sellout/models/.dist/graphql/mutations/createOrganizationFee.mutation";
import UPDATE_ORGANIZATION_FEE from "@sellout/models/.dist/graphql/mutations/updateOrganizationFee.mutation";
import LIST_ORGANIZATION_FEES from "@sellout/models/.dist/graphql/queries/organizationFees.query";
import { getErrorMessage } from "@sellout/ui/build/utils/ErrorUtil";
import { useQuery, useMutation } from "@apollo/react-hooks";
import * as FeeActions from "../redux/actions/fee.actions";
import PageLoader from "../components/PageLoader";
import { BackstageState } from "../redux/store";
import { useSelector } from "react-redux";
import { useDispatch } from "react-redux";
import { AppNotificationTypeEnum } from "../models/interfaces/IAppNotification";
import * as AppActions from "../redux/actions/app.actions";
import { Container, TableContainer } from "./SuperAdminSettings.page";
import { Button } from "@sellout/ui";
import { ButtonTypes } from "@sellout/ui/build/components/Button";
import { ModalTypes } from "../components/modal/Modal";
import FeesTable from "./FeesTable";
import { PaginationTypes } from "@sellout/models/.dist/interfaces/IPagination";

type SuperAdminOrganizationSettings = {};

const SuperAdminOrganizationSettings: React.FC<
  SuperAdminOrganizationSettings
> = () => {
  const { orgId } = useSelector((state: BackstageState) => state.app);
  const [error, setError] = React.useState("");

  const { data } = useQuery(LIST_ORGANIZATION_FEES, {
    variables: {
      orgId,
    },
    fetchPolicy: "network-only",
    onError: (error) => setError(getErrorMessage(error)),
  });

  const [createOrganizationFee] = useMutation(CREATE_ORGANIZATION_FEE, {
    refetchQueries: [
      {
        query: LIST_ORGANIZATION_FEES,
        variables: {
          orgId,
        },
      },
    ],
    awaitRefetchQueries: true,
    onCompleted: () =>
      dispatch(
        AppActions.showNotification(
          "Fee created successfully",
          AppNotificationTypeEnum.Success
        )
      ),
    onError: (error) => setError(getErrorMessage(error)),
  });

  const [updateOrganizationFee] = useMutation(UPDATE_ORGANIZATION_FEE, {
    onCompleted: () =>
      dispatch(
        AppActions.showNotification(
          "Fee updated successfully",
          AppNotificationTypeEnum.Success
        )
      ),
    onError: (error) => setError(getErrorMessage(error)),
  });
  const dispatch = useDispatch();

  const [deleteOrganizationFee, { loading }] = useMutation(
    DELETE_ORGANIZATION_FEE,
    {
      onCompleted(data) {
        dispatch(
          AppActions.showNotification(
            "Fee deleted successfully.",
            AppNotificationTypeEnum.Success
          )
        );
      },
      refetchQueries: [
        {
          query: LIST_ORGANIZATION_FEES,
          variables: {
            orgId,
          },
        },
      ],
      onError: (error) => setError(getErrorMessage(error)),
    }
  );
  /* Render */
  return (
    <>
      {/* <PageLoader nav sideNav fade={Boolean(data?.organizationFees?.length)} />
      {data?.organizationFees?.length && ( */}
        <Page>
          <PageTitle>Organization Settings</PageTitle>
          <Container>
            <Button
              type={ButtonTypes.Thin}
              text="Create New Fee"
              onClick={() => {
                dispatch(FeeActions.setFeeId("" as string));
                dispatch(
                  AppActions.pushModal(ModalTypes.FeeModal, {
                    createFee: createOrganizationFee,
                    orgId,
                  })
                );
              }}
              margin="0 10px 0 0"
            />
          </Container>
          <TableContainer>
            <FeesTable
              fees={data?.organizationFees ?? []}
              // fetchMore={fetchMore}
              paginationType={PaginationTypes.OrganizationSettings}
              updateFee={updateOrganizationFee}
              deleteFee={deleteOrganizationFee}
              orgId={orgId}
            />
          </TableContainer>
        </Page>
      {/* )} */}
    </>
  );
};

export default SuperAdminOrganizationSettings;
