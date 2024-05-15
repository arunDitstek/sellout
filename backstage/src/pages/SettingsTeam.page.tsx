import React, { createRef } from "react";
import styled from "styled-components";
import { useQuery } from "@apollo/react-hooks";
import { Colors, Icon, Icons, Loader, LoaderSizes } from "@sellout/ui";
import Button, { ButtonTypes } from "@sellout/ui/build/components/Button";
import { useDispatch } from "react-redux";
import { ModalTypes } from "../components/modal/Modal";
import * as AppActions from "../redux/actions/app.actions";
import ScrollTable, {
  ScrollTableBody,
  ScrollTableBodyCell,
  ScrollTableBodyRow,
  ScrollTableHeader,
  ScrollTableHeaderCell,
  ScrollTableSpace,
  ScrollTableTypeEnum,
} from "../components/ScrollableTable";
import gql from "graphql-tag";
import UserInfo, {
  UserInfoSizeEnum,
} from "@sellout/ui/build/components/UserInfo";
import Menu, { MenuEventTypes } from "../elements/Menu";
import QUERY_ROLES from "@sellout/models/.dist/graphql/queries/roles.query";
import * as StringUtil from "../utils/StringUtil";
import { RolesEnum } from "@sellout/models/.dist/interfaces/IRole";
import usePermission from "../hooks/usePermission.hook";
import { Page } from "../components/PageLayout";

const GET_CURRENT_USER_ID = gql`
  query userId {
    user {
      _id
    }
  }
`;

export const PageHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 640px;
  flex-flow: wrap;
  gap: 10px;
  @media (max-width: 650px) {
    width: 100%;
    padding: 0 20px;
  }
`;

const PageContainer = styled.div`
  height: 100%;
  width: 100%;
`;

export const Container = styled.div`
  display: flex;
  flex-direction: row;
  height: fit-content;
  max-height: calc(100% - 120px);
  width: 640px;
  @media (max-width: 650px) {
    width: 100%;
  }
`;

const PageTitle = styled.div`
  color: ${Colors.Grey1};
  font-weight: 600;
  font-size: 2.4rem;
  margin-right: 20px;
`;

const Spacer = styled.div`
  height: 24px;
`;

const TypeContainer = styled.div`
  transition: all 0.2s;
  display: flex;
  cursor: pointer;
  padding: 8px 16px;
  border-radius: 10px;
  align-items: end;

  &:hover {
    background: ${Colors.Grey7};
  }
`;

const MenuContainer = styled.div`
  position: fixed;
  background: ${Colors.White};
  z-index: 999;
`;

const LoaderContainer = styled.div`
  height: calc(100% - 90px);
  width: 640px;
  align-items: center;
  justify-content: center;
  display: flex;
  @media (max-width: 650px) {
    width: 100%;
    padding: 0 20px;
  }
`;

// Note: the popper thing is really finnicky so make sure you test thoroughly before
// changing anything
const SettingsTeam: React.FC = () => {
  const { data, loading, error } = useQuery(QUERY_ROLES);
  const {
    data: userData,
    loading: userLoading,
    error: userError,
  } = useQuery(GET_CURRENT_USER_ID);
  const dispatch = useDispatch();
  const pushModal = (modalType: ModalTypes) =>
    dispatch(AppActions.pushModal(modalType));
  const setRoleId = (roleId: string) => dispatch(AppActions.setRoleId(roleId));
  const hasPermission = usePermission();

  if (loading || userLoading) {
    return (
      <LoaderContainer>
        <Loader size={LoaderSizes.Large} color={Colors.Orange} />
      </LoaderContainer>
    );
  }

  // mock data to help testing ui so you can see what scrolling looks like with the popper
  // for (let i = 0; i < 50; i++) {
  //   data.roles.push(data.roles[1]);
  // }

  const TableHeader = () => (
    <ScrollTableHeader type={ScrollTableTypeEnum.Small}>
      <ScrollTableHeaderCell flex="1" type={ScrollTableTypeEnum.Small}>
        Team member
      </ScrollTableHeaderCell>
      <ScrollTableSpace />
      <ScrollTableHeaderCell
        flex="1"
        type={ScrollTableTypeEnum.Small}
        justify="flex-end"
      >
        Role
      </ScrollTableHeaderCell>
    </ScrollTableHeader>
  );

  const TableRows = () => {
    return data?.roles?.map((role: any, index: number) => {
      const anchorElement = createRef<HTMLDivElement>();

      const menuItems: any = [
        {
          text: "Change role",
          onClick: () => {
            pushModal(ModalTypes.ChangeRole);
            setRoleId(role._id);
          },
        },
      ];

      if (!(role.userId && userData.user._id === role.user._id)) {
        menuItems.push({
          text: "Remove team member",
          color: Colors.Red,
          onClick: () => {
            pushModal(ModalTypes.DeleteRole);
            setRoleId(role._id);
          },
        });
      }

      return (
        <ScrollTableBodyRow
          height="64px"
          padding="0px 8px 0px 16px"
          key={index}
          flex={true}
        >
          <ScrollTableBodyCell flex="1">
            <UserInfo
              user={role.user || { email: role.userEmail }}
              size={UserInfoSizeEnum.Regular}
            />
          </ScrollTableBodyCell>
          <ScrollTableSpace />
          <ScrollTableBodyCell flex="1" justify="flex-end">
            {hasPermission(role.role) && role.role !== RolesEnum.OWNER ? (
              <TypeContainer ref={anchorElement}>
                <div>
                  {role.acceptedAt
                    ? `${StringUtil.capitalizeFirstLetter(role.role).replace(
                        "_",
                        " "
                      )}`
                    : `${StringUtil.capitalizeFirstLetter(role.role).replace(
                        "_",
                        " "
                      )} invite pending`}
                </div>
                <Icon
                  icon={Icons.AngleDownRegular}
                  size={14}
                  color={Colors.Grey1}
                  margin="0px 0px 0px 10px"
                />
                <MenuContainer>
                  <Menu
                    anchorElement={anchorElement}
                    openEvent={MenuEventTypes.Click}
                    closeEvent={MenuEventTypes.MouseLeave}
                    menuItems={menuItems}
                    width={menuItems.length > 1 ? "165px" : "100px"} // popper has weird positioning behavior here without a fixed width
                    justify="flex-start"
                    margin={menuItems.length > 1 ? "0 70px 0 0" : "0 25px 0 0"}
                  />
                </MenuContainer>
              </TypeContainer>
            ) : (
              <TypeContainer>
                <div>
                  {role.acceptedAt
                    ? `${StringUtil.capitalizeFirstLetter(role.role).replace(
                        "_",
                        " "
                      )}`
                    : `${StringUtil.capitalizeFirstLetter(role.role).replace(
                        "_",
                        " "
                      )} invite pending`}
                </div>
              </TypeContainer>
            )}
          </ScrollTableBodyCell>
        </ScrollTableBodyRow>
      );
    });
  };

  return (
    <Page marginBottom={'70px'}>
      <PageContainer>
        <PageHeader>
          <PageTitle>Team</PageTitle>
          <Button
            type={ButtonTypes.Thin}
            icon={Icons.Plus}
            text="Add Team Member"
            onClick={() => pushModal(ModalTypes.AddRole)}
          />
        </PageHeader>
        <Spacer />
        <Container>
          <ScrollTable type={ScrollTableTypeEnum.Small} minWidth="100%">
            <TableHeader />
            <ScrollTableBody
              id="CLOSE_MENU_ON_SCROLL_CONTAINER"
              type={ScrollTableTypeEnum.Small}
              minWidth="100%"
            >
              {!error && <TableRows />}
            </ScrollTableBody>
          </ScrollTable>
        </Container>
      </PageContainer>
    </Page>
  );
};

export default SettingsTeam;
