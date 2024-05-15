import React, { createRef } from 'react';
import styled from 'styled-components';
import { useQuery, useMutation } from '@apollo/react-hooks';
import { Colors, Icon, Icons, Loader, LoaderSizes } from '@sellout/ui';
import { useDispatch } from "react-redux";
import { ModalTypes } from "../components/modal/Modal";
import Button, { ButtonTypes } from "@sellout/ui/build/components/Button";
import * as AppActions from "../redux/actions/app.actions";
import ScrollTable, {
  ScrollTableBody,
  ScrollTableBodyCell,
  ScrollTableBodyRow,
  ScrollTableTypeEnum,
  ScrollTableHeader,
  ScrollTableHeaderCell,
  ScrollTableNoContent,
  ScrollTableSpace,
} from '../components/ScrollableTable';
import Flex from '@sellout/ui/build/components/Flex';
import Menu, { MenuEventTypes } from "../elements/Menu";
import LIST_STRIPE_TERMINAL_READERS from '@sellout/models/.dist/graphql/queries/listStripeTerminalReaders.query'
import DELETE_STRIPE_TERMINAL_READER from '@sellout/models/.dist/graphql/mutations/deleteStripeTerminalReader.mutation'
import IStripeTerminalReader from '@sellout/models/.dist/interfaces/IStripeTerminalReader'
import StripeReaderSrc from '../assets/images/stripe-reader.png';
import * as StringUtil from '../utils/StringUtil';
import TextButton, { TextButtonSizes } from '@sellout/ui/build/components/TextButton';
import * as Intercom from '../utils/Intercom';
import { Page } from '../components/PageLayout';
import { Container, PageHeader } from './SettingsTeam.page';

const GreyText = styled.div`
  font-size: 1.2rem;
  color: ${Colors.Grey3};
  font-weight: 500;
  display: flex;
`;

const PageContainer = styled.div`
  height: 100%;
  width: 100%;
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
  align-items: baseline;

  &:hover {
    background: ${Colors.Grey7};
  }
`;

const DeviceLabel = styled.div`
  font-size: 1.4rem;
  font-weight: 600;
  color: ${Colors.Grey1};
`;


type DeviceStatusProps = {
  connected: boolean;
}

const DeviceStatus = styled.div<DeviceStatusProps>`
  font-size: 1.4rem;
  font-weight: ${props => props.connected ? '600' : '500'};
  color: ${props => props.connected ? Colors.Green : Colors.Grey1};
`;

const LoaderContainer = styled.div`
  height: calc(100% - 90px);
  width: 640px;
  align-items: center;
  justify-content: center;
  display: flex;
`;

const ReaderImage = styled.img`
  margin-right: 5px;
`;

const NoContentHead = styled.div`
  font-weight: 600;
  font-size: 1.8rem;
  color: ${Colors.Grey1};
  margin-bottom: 8px;
`;

const NoContentBody = styled.div`
  font-weight: 500;
  font-size: 1.8rem;
  color: ${Colors.Grey3};
  display: flex;
  align-items: center;
`;

const MenuContainer = styled.div`
  position: fixed;
  background: ${Colors.White};
  z-index: 999;
`;

const NoContentSpacer = styled.div`
  height: 16px;
`;

const TableHeader = () => (
  <ScrollTableHeader type={ScrollTableTypeEnum.Small}>
    <ScrollTableHeaderCell type={ScrollTableTypeEnum.Small} flex="1">Device</ScrollTableHeaderCell>
    <ScrollTableSpace />
    <ScrollTableHeaderCell type={ScrollTableTypeEnum.Small} flex="1" justify="flex-end">Status</ScrollTableHeaderCell>
  </ScrollTableHeader>
);

const NoContent = () => (
  <ScrollTableNoContent>
    <NoContentHead>
      No readers set up yet
    </NoContentHead>
    <NoContentBody>
      Click the 'Add card reader' button in the right corner to get started
    </NoContentBody>
    <NoContentSpacer />
    <NoContentBody>
      Need a card reader?
      &nbsp;<TextButton size={TextButtonSizes.Large} onClick={() => Intercom.toggle()}>Contact us</TextButton>&nbsp;
      to order one.
    </NoContentBody>
  </ScrollTableNoContent>
);

type SettingsDevicesProps = {};

const SettingsDevices: React.FC<SettingsDevicesProps> = () => {
  /** GraphQL */
  const { data, loading } = useQuery(LIST_STRIPE_TERMINAL_READERS);

  const [deleteStripeTerminalReader] = useMutation(DELETE_STRIPE_TERMINAL_READER, {
    refetchQueries: [{
      query: LIST_STRIPE_TERMINAL_READERS,
    }]
  });

  /** Actions */
  const dispatch = useDispatch();
  const popModal = () => dispatch(AppActions.popModal());
  const addReader = () => dispatch(AppActions.pushModal(ModalTypes.AddTerminalDevice));
  const confirmReaderDelete = (readerId: string, label: string) => {
    dispatch(AppActions.pushModalConfirmAction({
      title: 'Are you sure?',
      message: `Are you sure you want to delete reader ${label}? You wil have to re-add the reader to continue using it.`,
      confirm: () => deleteStripeTerminalReader({
        variables: {
          readerId
        },
      }),
      cancel: popModal,
    }));
  }

  /** Render */
  if (loading) {
    return (
      <LoaderContainer>
        <Loader size={LoaderSizes.Large} color={Colors.Orange} />
      </LoaderContainer>
    );
  }

  // mock data to help testing ui so you can see what scrolling looks like with the popper
  // for (let i = 0; i < 50; i++) {
  //   data.listStripeTerminalReaders.push(data.listStripeTerminalReaders[1]);
  // }

  const rows = !loading && data?.listStripeTerminalReaders?.map((reader: IStripeTerminalReader, index: number) => {
    const anchorElement = createRef<HTMLDivElement>();
    const menuItems: any = [
      {
        text: "Delete Reader",
        onClick: () => confirmReaderDelete(reader.id, reader.label),
      },
    ];

    return (
      <ScrollTableBodyRow height="60px" padding="0 8px 0 16px" key={index}>
        <ScrollTableBodyCell flex="1">
          <Flex>
            <ReaderImage src={StripeReaderSrc} />
            <Flex direction="column" justify="space-around">
              <DeviceLabel>{reader.label}</DeviceLabel>
              <GreyText>{reader.serialNumber}&nbsp;&nbsp;{reader.ipAddress}</GreyText>
            </Flex>
          </Flex>
        </ScrollTableBodyCell>
        <ScrollTableBodyCell flex="1" justify="flex-end">
          <TypeContainer ref={anchorElement}>
            <DeviceStatus connected={reader.status === 'connected'}>{StringUtil.capitalizeFirstLetter(reader.status)}</DeviceStatus>
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
                width="120px"
                justify="flex-end"
              />
            </MenuContainer>
          </TypeContainer>
        </ScrollTableBodyCell>
      </ScrollTableBodyRow>
    )
  });

  return (
    <Page>
    <PageContainer>
      <PageHeader>
        <PageTitle>
          Credit Card Readers
        </PageTitle>
        <Button
          type={ButtonTypes.Thin}
          icon={Icons.Plus}
          text="Add Card Reader"
          onClick={() => addReader()}
        />
      </PageHeader>
      <Spacer />
      <Container>
        <ScrollTable type={ScrollTableTypeEnum.Small} minWidth='100%'>
          <TableHeader />
          <ScrollTableBody id="CLOSE_MENU_ON_SCROLL_CONTAINER" type={ScrollTableTypeEnum.Small} minWidth='100%'>
            {(!loading && data?.listStripeTerminalReaders?.length > 0 )? rows : <NoContent />}
          </ScrollTableBody>
        </ScrollTable>
      </Container>
    </PageContainer>
    </Page>
  );
};

export default SettingsDevices;
