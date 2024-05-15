import React from "react";
import styled from "styled-components";
import { Colors, Icon, Icons, Loader, LoaderSizes } from "@sellout/ui";
import Button, { ButtonStates, ButtonTypes } from "@sellout/ui/build/components/Button";
import TextButton from "@sellout/ui/build/components/TextButton";
import Flex from "@sellout/ui/build/components/Flex";
import { BackstageState } from "../../redux/store";
import { NEW_EVENT_ID } from "../../redux/reducers/event.reducer";
import { useSelector } from "react-redux";
import { media } from "@sellout/ui/build/utils/MediaQuery";

type ContainerProps = {};

const Container = styled.div<ContainerProps>`
  position: absolute;
  display: flex;
  align-items: center;
  justify-content: space-between;
  bottom: 0px;
  width: 100%;
  padding: 10px 70px;
  background-color: ${Colors.White};
  border-top: 1px solid ${Colors.Grey6};
  z-index: 200;    
  flex-flow: wrap;
  gap: 10px;

  ${media.mobile`
    position: fixed;
    padding: 10px 32px;
  `};
`;

const ButtonContainer = styled.div`
  display: flex;
  align-items: center;
  @media(max-width:767px){
    width: 100%;
    justify-content: flex-end;
  }
`;

const NavArrow = styled.div`
  height: 40px;
  overflow: hidden;
  width: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid ${Colors.Orange};
  border-radius: 10px;
  background: ${Colors.White};
  cursor: pointer;
  margin-right: 8px;
`;

const SavingContainer = styled.div`
  display: flex;
  align-items: center;
  margin-right: 24px;
`;

const SavingText = styled.div`
  color: ${Colors.Grey3};
  font-size: 1.2rem;
  margin-left: 8px;
`;

type CreateFlowControlsProps = {
  save: Function;
  previous: Function;
  exit: Function;
  cancel?: Function;
  saving: boolean;
  finalize?: Function;
  finalizeText: string;
  hideArrows?: boolean;
};

const CreateFlowControls: React.FC<CreateFlowControlsProps> = ({
  save,
  previous,
  exit,
  cancel,
  saving,
  hideArrows,
  finalizeText,
  finalize,
}) => {
  const eventState = useSelector((state: BackstageState) => state.event);
  const { eventId } = eventState;
  return (
    <Container>
      <Flex align="center">
        {Boolean(cancel) && eventId !== NEW_EVENT_ID && (
          <TextButton
            onClick={() => cancel && cancel()}
            color={Colors.Red}
            margin="0 16px 0 0"
          >
            Delete draft
          </TextButton>
        )}
        <TextButton onClick={() => exit()}>Exit</TextButton>
      </Flex>
      <ButtonContainer>
        {saving && (
          <SavingContainer>
            <Loader size={LoaderSizes.FuckingTiny} color={Colors.Orange} />
            <SavingText>
              Saving...
            </SavingText>
          </SavingContainer>
        )}
        {!hideArrows && (
          <>
            <NavArrow onClick={() => previous()}>
              <Icon
                size={18}
                color={Colors.Orange}
                icon={Icons.LeftArrowRegular}
              />
            </NavArrow>
            <NavArrow onClick={() => save()}>
              <Icon
                size={18}
                color={Colors.Orange}
                icon={Icons.RightArrowRegular}
              />
            </NavArrow>
          </>
        )}
        <Button
          onClick={() => finalize && finalize()}
          type={ButtonTypes.Regular}
          text={finalizeText}
          state={saving ? ButtonStates.Disabled : ButtonStates.Active}

        />
      </ButtonContainer>
    </Container>
  );
};

export default CreateFlowControls;
