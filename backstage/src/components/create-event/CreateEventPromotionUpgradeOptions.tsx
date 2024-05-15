import React, { Fragment } from "react";
import styled from "styled-components";
import { useSelector, useDispatch } from "react-redux";
import { BackstageState } from "../../redux/store";
import * as EventActions from "../../redux/actions/event.actions";
import Toggle from "../../elements/Toggle";
import IEventPromotion from "@sellout/models/.dist/interfaces/IEventPromotion";
import SelectTicketTypes from "./SelectTicketTypes";
import Label from "@sellout/ui/build/components/Label";

type ContainerProps = {
    hasPadding: boolean;
};

const Container = styled.div<ContainerProps>`
  padding: ${(props) => (props.hasPadding ? "30px 0 0" : null)};
`;

const Spacer = styled.div`
  width: 20px;
  height: 20px;
`;

type CreateEventPromotionTicketOptionsProps = {
    promotion: IEventPromotion;
    showOnOffToggle?: boolean;
    label?: string;
    tip?: string;
};

const CreateEventPromotionUpgradeOptions: React.FC<
    CreateEventPromotionTicketOptionsProps
> = ({ promotion, showOnOffToggle = true, label, tip }) => {
    /* State */
    const [limitTickets, setLimitTickets] = React.useState(
        promotion.upgradeIds.length > 0
    );
    const eventState = useSelector((state: BackstageState) => state.event);
    const { eventId } = eventState;
    /* Actions */
    const dispatch = useDispatch();

    const addPromotionUpgradeTypeId = (upgradeIds: string) => {
        dispatch(
            EventActions.addPromotionUpgradeTypeId(
                eventId,
                promotion._id as string,
                upgradeIds,
            )
        );

    }

    const removePromotionUpgradeTypeId = (upgradeIds: string) =>
        dispatch(
            EventActions.removePromotionUpgradeTypeId(
                eventId,
                promotion._id as string,
                upgradeIds
            )
        );

    const clearTicketTypes = () => {
        dispatch(
            EventActions.setPromotion(eventId, promotion._id as string, {
                upgradeIds: [],
            })
        );
    };


    /** Render */
    return (
        <Container hasPadding={showOnOffToggle}>
            {showOnOffToggle && (
                <Toggle
                    active={limitTickets}
                    onChange={() => {
                        if (limitTickets) {
                            clearTicketTypes()
                        }
                        setLimitTickets(!limitTickets);
                    }}
                    title="Limit to specific upgrade"
                    tip="Choose which tickets this upgrade can be applied to"
                />
            )}
            {(!showOnOffToggle || limitTickets) && (
                <Fragment>
                    <Spacer />
                    {label && <Label text={label} tip={tip} />}
                    <SelectTicketTypes
                        selected={promotion.upgradeIds}
                        upgrade={"true"}
                        add={
                            addPromotionUpgradeTypeId
                        }
                        remove={
                            removePromotionUpgradeTypeId

                        }
                    />
                </Fragment>
            )}
        </Container>
    );
};

export default CreateEventPromotionUpgradeOptions;
