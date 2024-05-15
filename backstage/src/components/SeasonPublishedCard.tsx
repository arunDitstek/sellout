import React from "react";
import styled from "styled-components";
import { useSelector, useDispatch } from "react-redux";
import { Colors, Icons } from "@sellout/ui";
import DetailsCard, { Title } from "../elements/DetailsCard";
import Button, {
  ButtonTypes,
  ButtonIconPosition,
} from "@sellout/ui/build/components/Button";
import * as SeasonActions from "../redux/actions/season.actions";
import * as AppActions from "../redux/actions/app.actions";
import ISeason from "@sellout/models/.dist/interfaces/ISeason";

const Text = styled.div`
  color: ${Colors.Grey1};
  font-weight: 500;
  font-size: 1.4rem;
  margin-bottom: 16px;
`;

type StatusColorProps = {
  color: Colors;
};

const StatusColor = styled.span<StatusColorProps>`
  color: ${(props) => props.color};
`;

type SeasonSalesToggleCardProps = {
  season: ISeason;
};
const SeasonSalesToggleCard: React.FC<SeasonSalesToggleCardProps> = ({
  season,
}) => {
  /* State */
  const published = season?.published;

  /* Actions */
  const dispatch = useDispatch();
  const popModal = () => dispatch(AppActions.popModal());
  const publishSeason = (published: boolean) =>
    dispatch(SeasonActions.publishSeasonRequest(published));

  const confirmToggleSeasonSales = () => {
    dispatch(
      AppActions.pushModalConfirmAction({
        title: published ? "Disable sales" : "Enable sales",
        message: published
          ? "Are you sure you want to re-enable sales for this season? This season will immediately be available for purchase."
          : `Are you sure you want to pause sales for this season? Your customers will not be able to purchase tickets until sales are re-enabled.`,
        confirmText: published ? "DISABLE SALES" : "ENABLE SALES",
        confirm: () => {
          publishSeason(published ? false : true);
          popModal();
        },
        cancel: popModal,
      })
    );
  };

  /* Render */
  return (
    <DetailsCard
      title={
        <Title>
          Online sales are&nbsp;
          <StatusColor color={published ? Colors.Green : Colors.Red}>
            {published ? "active" : "disabled"}
          </StatusColor>
        </Title>
      }
      headerIcon={Icons.CartLight}
      width="600px"
      padding="20px 20px"
    >
      <Text>
        {published
          ? "Anyone can currently purchase tickets to this season."
          : "Sales are paused. Your customers will not be able to purchase tickets until sales are re-enabled."}
      </Text>
      <Button
        type={ButtonTypes.Regular}
        text={published ? "PAUSE SALES" : "RE-ENABLE SALES"}
        icon={Icons.Warning}
        iconPosition={ButtonIconPosition.Left}
        onClick={() => confirmToggleSeasonSales()}
      />
    </DetailsCard>
  );
};

export default SeasonSalesToggleCard;
