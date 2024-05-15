import React, { Fragment } from "react";
import styled from "styled-components";
import { EventQueryEnum } from "../models/enums/EventQueryEnum";
import PageLoader from "../components/PageLoader";
import { PaddedPage } from "../components/PageLayout";
import { Colors, Icon, Icons } from '@sellout/ui';
import useListOrders from '../hooks/useListOrders.hook';
import UserOrderCard from "../../src/components/User/UserOrderCard";
import * as Time from '@sellout/utils/.dist/time';
import Masonry from "react-masonry-component";
import { useSelector } from "react-redux";
import { BackstageState } from "../redux/store";
import gql from 'graphql-tag';
import { useQuery } from '@apollo/react-hooks';

type UserDashboardProps = {};
const SubNavContainer = styled.div`
  display: flex;
  margin-bottom: 24px;
`;

type SubNavItemProps = {
    active: boolean;
};

const SubNavItem = styled.div<SubNavItemProps>`
  transition: all 0.2s;
  color: ${(props) => (props.active ? `${Colors.Grey1}` : `${Colors.Grey4}`)};
  font-weight: 600;
  font-size: 1.8rem;
  cursor: pointer;
  margin-right: 24px;
`;

const NoContentContainer = styled.div`
    width: 100%;
    height: calc(100% - 60px);
    padding: 20px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    background: ${Colors.Grey6};
    border-radius: 16px;
`;

const Text = styled.div`
    font-weight: 600;
    font-size: 1.5rem;
    line-height: 2rem;
    color: #828282;
    margin: 15px 0;
    text-align: center;
`;

const Button = styled.button`
    background: #FF6802;
    color: #FFFFFF;
    width: 200px;
    font-size: 1.4rem;
    line-height: 1.4rem;
    padding: 0 25px;
    border-radius: 5px;
    height: 40px;
    border:none;
    font-weight:600;
    cursor:pointer;
`;

export const Flex = styled.div`
  display: flex;
  flex-direction: row;
  width: 100%;
  flex-wrap:wrap;
  height:100%;
`;

const USER = gql`
    query user {
        user {
            _id
            }
    }
`;

const UserDashboard: React.FC<UserDashboardProps> = () => {


    const [queryKey, setQueryKey] = React.useState(
        EventQueryEnum.MainEventListUpComing
    );

    const app = useSelector((state: BackstageState) => state.app);

    const { data, loading, error } = useQuery(USER)
    const { orders, fetchMore, loading: ordersLoading } = useListOrders({
        variables: {
            query: { userIds: [data?.user?._id]}
           
        },
        context: {
            debounceKey: 'QUERY_ORDERS',
            debounceTimeout: 250,
        },
    });

    const orderList = orders && orders.filter((order: any) => {
        // if (!order.event) return false;
        if (EventQueryEnum.MainEventListUpComing === queryKey) {
            if ((order?.event?.schedule.startsAt + Time.HOUR * 3) > Time.now()) {
                return true;
            }
        } else if ((order?.event?.schedule.startsAt + Time.HOUR * 3) < Time.now()) {
            return true;
        }
        return false;
    });

    const text = EventQueryEnum.MainEventListUpComing === queryKey
        ? 'You don\'t have any upcoming orders. Purchase a ticket to populate your dashboard.'
        : 'You don\'t have any past orders. Purchase a ticket to populate your dashboard.';

    return (
        <Fragment>
            <PageLoader nav={true} fade={Boolean(!ordersLoading)} />
            <PaddedPage>
                <SubNavContainer>
                    <SubNavItem
                        onClick={() => {
                            setQueryKey(EventQueryEnum.MainEventListUpComing)
                        }}
                        active={EventQueryEnum.MainEventListUpComing === queryKey}
                    >
                        Upcoming
                    </SubNavItem>
                    <SubNavItem
                        onClick={() => {
                            setQueryKey(EventQueryEnum.MainEventListPast)
                        }}
                        active={EventQueryEnum.MainEventListPast === queryKey}
                    >
                        Past
                    </SubNavItem>
                </SubNavContainer>
                {!ordersLoading && orderList && orderList?.length > 0 ? <Masonry options={{ horizontalOrder: true }} enableResizableChildren>
                    {EventQueryEnum.MainEventListUpComing === queryKey &&
                        orderList.map((order, index) => {
                            return <UserOrderCard key={index} order={order} />
                        })}

                    {EventQueryEnum.MainEventListPast === queryKey &&
                        orderList.map((order, index) => {
                            return <UserOrderCard key={index} order={order} />
                        })}

                </Masonry> : <>{!ordersLoading &&
                    <NoContentContainer>
                        <Icon
                            color={Colors.Grey5}
                            size={80}
                            icon={Icons.TicketSolid}
                        />
                        <Text>{text}</Text>
                        <Button
                            onClick={() => {
                                window.open('https://events.sellout.io', '_blank');
                            }}
                        >
                            BROWSE EVENTS
                        </Button>
                    </NoContentContainer>} </>}
            </PaddedPage>
        </Fragment>

    )
};

export default UserDashboard;
