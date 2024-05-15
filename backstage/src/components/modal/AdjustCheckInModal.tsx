import React, { Fragment } from "react";
import styled from "styled-components";
import { useDispatch, useSelector } from "react-redux";
import * as AppActions from "../../redux/actions/app.actions";
import Button, { ButtonTypes, ButtonStates } from '@sellout/ui/build/components/Button';
import {
    ModalContainer,
    ModalHeader,
    ModalContent,
    ModalFooter,
} from "./Modal";
import ScrollTable, { ScrollTableBody, ScrollTableBodyCell, ScrollTableBodyRow, ScrollTableHeader, ScrollTableHeaderCell, ScrollTableSpace } from "../ScrollableTable";
import { useMutation, useQuery } from "@apollo/react-hooks";
import GET_ORDER from '@sellout/models/.dist/graphql/queries/order.query';
import { BackstageState } from "../../redux/store";
import { Colors, Flex, Icon, Icons } from "@sellout/ui";
import { getErrorMessage } from "@sellout/ui/build/utils/ErrorUtil";
import { AppNotificationTypeEnum } from "../../models/interfaces/IAppNotification";
import UPDATE_ORDER from '@sellout/models/.dist/graphql/mutations/updateOrder.mutation';


const Container = styled.div`
  width: 375px;
`;

const ButtonContainer = styled.div`
  display: flex;
`;

const Content = styled.div`
overflow: scroll;
box-sizing: border-box;
border-radius: 0px 0px 10px 10px;
height: 420px;
`;

const CheckInModal: React.FC = () => {
    /* State */
    const orderState = useSelector((state: BackstageState) => state.order);
    const { orderId } = orderState;

    // Confirm
    const [showConfirm, setShowConfirm] = React.useState(false as boolean);
    const [index, setIndex] = React.useState(0);
    const [ticket, setTicket] = React.useState([] as any);

    /* Actions */
    const dispatch = useDispatch();
    const popModal = () => dispatch(AppActions.popModal());

    const onTicket = (ticket: any, index: number) => {
        setShowConfirm(true);
        setIndex(index);
        setTicket(ticket)
    }

    let title = "ADJUST CHECK-IN";

    const { data } = useQuery(GET_ORDER, {
        variables: {
            orderId
        },
        fetchPolicy: "network-only",
    });

    const tickets = data?.order?.tickets;

    const [updateOrder, { loading: checkInLoading }] = useMutation(UPDATE_ORDER, {
        refetchQueries: [{
            query: GET_ORDER, variables: {
                orderId
            }
        }],
        onError(error) {
            dispatch(AppActions.showNotification(getErrorMessage(error), AppNotificationTypeEnum.Error));
            console.error(getErrorMessage(error));
        },
        onCompleted(dataRefund) {
            dispatch(AppActions.showNotification("Your ticket has been updated successfully.", AppNotificationTypeEnum.Success));
            popModal();
        },
    });

    /* Render */
    return (
        <>
            <ModalContainer display={showConfirm ? "none" : "block"}>
                <ModalHeader title={title} close={popModal} />
                <ModalContent padding="15px">
                    <Container>
                        <Fragment>
                            <ScrollTable>
                                <ScrollTableBody>
                                    <ScrollTableHeader>
                                        <ScrollTableHeaderCell width="150px">Ticket</ScrollTableHeaderCell>
                                        <ScrollTableHeaderCell width="150px">Check-In</ScrollTableHeaderCell>
                                    </ScrollTableHeader>
                                </ScrollTableBody>
                                <Content>
                                    <ScrollTableBody>
                                        {tickets?.map((ticket: any, ind) => {
                                            return (
                                                ticket.scan.map((scan: any, index) =>
                                                    <div key={index}>
                                                        <ScrollTableBodyRow
                                                            key={ticket._id}
                                                            height="40px"
                                                        >
                                                            <ScrollTableBodyCell width="140px" style={true} >
                                                                {`${ticket.name} ${ticket.seat}`}</ScrollTableBodyCell>
                                                            <ScrollTableBodyCell width="150px">{scan.scanned ? "Scanned" : "Not scanned"}</ScrollTableBodyCell>
                                                            {scan.scanned && <ScrollTableBodyCell>
                                                                <Icon
                                                                    icon={Icons.Cancel}
                                                                    color={Colors.Red}
                                                                    hoverColor={Colors.Red}
                                                                    size={16}
                                                                    onClick={(e) => onTicket(ticket, index)}
                                                                />
                                                            </ScrollTableBodyCell>}
                                                        </ScrollTableBodyRow>
                                                    </div>)
                                            )
                                        })}
                                    </ScrollTableBody>
                                </Content>
                            </ScrollTable>
                        </Fragment>
                    </Container>
                </ModalContent>

                <ModalFooter>
                    <div />
                    <ButtonContainer>
                        <Button
                            type={ButtonTypes.Thin}
                            text={"Cancel"}
                            state={ButtonStates.Warning}
                            margin="0px 10px 0px 0px"
                            onClick={() => popModal()}
                        />
                    </ButtonContainer>
                </ModalFooter>
            </ModalContainer>
            {
                showConfirm &&
                <ConfirmActionModal
                    title="Unscanned Confirmation"
                    message="Are you sure you want to mark this ticket as unscanned?"
                    cancel={() => {
                        setShowConfirm(false)
                    }}
                    loading={checkInLoading || false}
                    confirm={() => {
                        const filtered = ticket?.scan.map((scan: any, ind: number) => {
                            if (index === ind) {
                                scan.scanned = false
                            }
                            return scan;
                        })
                        updateOrder({
                            variables: {
                                params: {
                                    orderId,
                                    ticketId: ticket._id,
                                    scan: filtered
                                }
                            },
                        })
                    }


                    }
                />
            }
        </>
    );
};
const ConfirmActionModal = ({
    title = 'Are you sure you want to mark this ticket as unscanned?',
    message,
    confirm,
    confirmText = 'CONFIRM',
    cancel,
    cancelText = 'CANCEL',
    loading = false
}) => {

    return (
        <ModalContainer display="block" position="absolute" left="40%" top="40%">
            <ModalHeader title={title} close={cancel} />
            <Container>
                <ModalContent padding="20px">{message}</ModalContent>
            </Container>
            <ModalFooter>
                <div />
                <Flex>
                    {cancel && (
                        <Button
                            type={ButtonTypes.Thin}
                            state={ButtonStates.Warning}
                            text={cancelText}
                            margin="0 10px 0 0"
                            onClick={() => {
                                if (cancel) cancel();
                            }}
                        />
                    )}
                    <Button
                        type={ButtonTypes.Thin}
                        text={confirmText}
                        onClick={() => {
                            if (confirm) confirm();
                        }}
                        loading={loading}
                    />
                </Flex>
            </ModalFooter>
        </ModalContainer>
    );
};

export default CheckInModal;