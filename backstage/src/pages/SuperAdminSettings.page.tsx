import React from "react";
import { Page, PageTitle } from "../components/PageLayout";
import { getErrorMessage } from "@sellout/ui/build/utils/ErrorUtil";
import { useQuery, useMutation } from "@apollo/react-hooks";
import { useDispatch, useSelector } from "react-redux";
import { AppNotificationTypeEnum } from "../models/interfaces/IAppNotification";
import * as AppActions from "../redux/actions/app.actions";
import styled from "styled-components";
import { PaginationTypes } from "@sellout/models/.dist/interfaces/IPagination";
import FeesTable from "./FeesTable";
import * as FeeActions from "../redux/actions/fee.actions";
import Button, {
  ButtonStates,
  ButtonTypes,
} from "@sellout/ui/build/components/Button";
import { ModalTypes } from "../components/modal/Modal";
import LIST_PLATFORM_FEES from "@sellout/models/.dist/graphql/queries/platformFees.query";
import APPLY_PLATFORM_FEES_TO_ALL_ORGANIZATIONS from "@sellout/models/.dist/graphql/mutations/applyPlatformFeesToAllOrganizations.mutation";
import UPDATE_PLATFORM_FEE from "@sellout/models/.dist/graphql/mutations/updatePlatformFee.mutation";
import CREATE_PLATFORM_FEE from "@sellout/models/.dist/graphql/mutations/createPlatformFee.mutation";
import DELETE_PLATFORM_FEE from "@sellout/models/.dist/graphql/mutations/deletePlatformFee.mutation";
import { BackstageState } from "../redux/store";
import { media } from "@sellout/ui/build/utils/MediaQuery";

export const Container = styled.div`
  margin-bottom: 15px;
  display: flex;
  ${media.mobile`
  display: block;
  margin-bottom: 30px;
`};
`;

const ButtonWrapper = styled.div`
  @media (max-width: 650px) {
   margin-bottom: 10px;
  }
`;

export const TableContainer = styled.div`
  display: flex;
`;

type SuperAdminSettingsProps = {};

const SuperAdminSettings: React.FC<SuperAdminSettingsProps> = () => {
  const feeState = useSelector((state: BackstageState) => state.fee);
  const { platformFee } = feeState;
  const [error, setError] = React.useState("");
  const dispatch = useDispatch();
  const { data, fetchMore } = useQuery(LIST_PLATFORM_FEES, {
    variables: {
      pagination: {
        pageSize: 9,
        pageNumber: 1,
      },
    },
    onCompleted: (data) => {
      const enableButton = data.platformFees.find(
        (x) => x.isApplyPlatformFee === false
      );
      enableButton && dispatch(FeeActions.SetPlatformFee(true));
    },
    onError: (error) => setError(getErrorMessage(error)),
  });

  const [applyPlatformFeesToAllOrganizations, { loading: feeLoading }] =
    useMutation(APPLY_PLATFORM_FEES_TO_ALL_ORGANIZATIONS, {
      onCompleted(data) {
        dispatch(FeeActions.SetPlatformFee(false));
        dispatch(
          AppActions.showNotification(
            "Platform fees applied successfully.",
            AppNotificationTypeEnum.Success
          )
        );
      },
      refetchQueries: [
        {
          query: LIST_PLATFORM_FEES,
        },
      ],
      awaitRefetchQueries: true,
    });

  const [createPlatformFee] = useMutation(CREATE_PLATFORM_FEE, {
    refetchQueries: [
      {
        query: LIST_PLATFORM_FEES,
      },
    ],
    awaitRefetchQueries: true,
    onCompleted: (data) => {
      dispatch(FeeActions.SetPlatformFee(true));
      dispatch(
        AppActions.showNotification(
          "Fee created successfully",
          AppNotificationTypeEnum.Success
        )
      );
    },
    onError: (error) => setError(getErrorMessage(error)),
  });

  const [updatePlatformFee] = useMutation(UPDATE_PLATFORM_FEE, {
    onCompleted: () =>
      dispatch(
        AppActions.showNotification(
          "Fee updated successfully",
          AppNotificationTypeEnum.Success
        )
      ),
    onError: (error) => setError(getErrorMessage(error)),
  });

  const [deletePlatformFee, { loading }] = useMutation(DELETE_PLATFORM_FEE, {
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
        query: LIST_PLATFORM_FEES,
      },
    ],
    onError: (error) => setError(getErrorMessage(error)),
  });

  /* Render */
  return (
    <>
      <Page>
        <PageTitle>Platform Settings</PageTitle>
        <Container>
          <ButtonWrapper>
            <Button
              type={ButtonTypes.Thin}
              text="Create New Fee"
              onClick={() => {
                dispatch(FeeActions.setFeeId("" as string));
                dispatch(
                  AppActions.pushModal(ModalTypes.FeeModal, {
                    createFee: createPlatformFee,
                  })
                );
              }}
              margin="0 10px 0 0"
            />
          </ButtonWrapper>
          <Button
            type={ButtonTypes.Thin}
            loading={feeLoading}
            state={ButtonStates.Active}
            text="Apply Platform Fees to All Organizations"
            onClick={() => {
              data?.platformFees.length > 0
                ? applyPlatformFeesToAllOrganizations()
                : dispatch(
                    AppActions.showNotification(
                      "No fees available.",
                      AppNotificationTypeEnum.Warning
                    )
                  );
            }}
          />
        </Container>
        <TableContainer>
          <FeesTable
            fees={data?.platformFees ?? []}
            fetchMore={fetchMore}
            paginationType={PaginationTypes.PlateformSettings}
            updateFee={updatePlatformFee}
            deleteFee={deletePlatformFee}
          />
        </TableContainer>
      </Page>
    </>
  );
};

export default SuperAdminSettings;
