import React, { Fragment } from "react";
import styled from "styled-components";
import { useSelector, useDispatch } from "react-redux";
import { BackstageState } from "../../redux/store";
import * as EventActions from "../../redux/actions/event.actions";
import Toggle from "../../elements/Toggle";
import IEventUpgrade, { UpgradeTypeComplimentaryWithEnum } from "@sellout/models/.dist/interfaces/IEventUpgrade";
import Input from "@sellout/ui/build/components/Input";
import Dropdown from '@sellout/ui/build/components/Dropdown';

const Container = styled.div`
  padding: 30px 0 0;
`;

const Spacer = styled.div`
  width: 20px;
  height: 20px;
`;

const Row = styled.div`
  display: flex;
  flex-direction: row;
  /* align-items: flex-end; */
`;

type CreateEventUpgradeTicketOptionsProps = {
  upgradeType: IEventUpgrade;
};

const CreateEventUpgradeTicketOptions: React.FC<CreateEventUpgradeTicketOptionsProps> = ({
  upgradeType,
}) => {
  /* State */
  const [isCompliementary, setIsComplimentary] = React.useState(upgradeType.complimentary);

  const eventState = useSelector((state: BackstageState) => state.event);
  const { eventId } = eventState;

  /* Actions */
  const dispatch = useDispatch();

  const setUpgradeType = (upgrade: Partial<IEventUpgrade>) =>
    dispatch(EventActions.setUpgradeType(
      eventId,
      upgradeType._id as string,
      upgrade,
    ));

  const items = Object.values(UpgradeTypeComplimentaryWithEnum).map((complimentaryWith: UpgradeTypeComplimentaryWithEnum) => {
    return {
      text: `Per ${complimentaryWith.toLowerCase()}`,
      value: complimentaryWith,
    };
  });

  /** Render */
  return (
    <Container>
      <Toggle
        active={isCompliementary}
        onChange={() => {
          setUpgradeType({ 
            complimentary: !isCompliementary,
            price: 0,
          });
          setIsComplimentary(!isCompliementary);
        }}
        title="Make complimentary"
      />

      {isCompliementary && (
        <Fragment>
          <Spacer />
          <Row>
            <Input
              label="Qty. to Comp"
              placeholder="0"
              width="100px"
              type="number"
              value={upgradeType.complimentaryQty.toString()}
              onChange={(e: React.FormEvent<HTMLInputElement>) => {
                const qty = parseInt(e.currentTarget.value);
                setUpgradeType({
                  complimentaryQty: qty,
                });
              }}
            />
            <Spacer />
            <Dropdown
              label=" "
              value={`Per ${upgradeType.complimentaryWith.toLowerCase()}`}
              items={items}
              onChange={(complimentaryWith: UpgradeTypeComplimentaryWithEnum) => {
                setUpgradeType({
                  complimentaryWith: complimentaryWith
                });
              }}
            />
          </Row>
        </Fragment>
      )}
    </Container>
  );
};

export default CreateEventUpgradeTicketOptions;
