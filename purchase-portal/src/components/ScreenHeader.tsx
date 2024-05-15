import React, { useState } from "react";
import styled from "styled-components";
import { useSelector } from "react-redux";
import { PurchasePortalState } from "../redux/store";
import { Colors } from "@sellout/ui/build/Colors";
import { Icons } from "@sellout/ui/build/components/Icon";
import PromotionCodeInput from "./PromotionCodeInput";
import BackButton from "./BackButton";
import { ScreenEnum } from "../redux/reducers/app.reducer";
import TextButton from "@sellout/ui/build/components/TextButton";

type LinePadding = {
  padding?: string;
};
const Container = styled.div`
  position: relative;
`;

const HeaderBar = styled.div<LinePadding>`
  display: flex;
  flex-direction: row;
  background-color: ${Colors.White};
  align-items: center;
  justify-content: space-between;
  padding: ${props => props.padding? props.padding :"24px 24px 8px"};

`;

const HeaderBarText = styled.div`
  font-size: 1.4rem;
  line-height: 2.4rem;
  font-weight: 500;
  color: ${Colors.Grey1};
`;

const Blank = styled.div`
  height: 24px;
  display: flex;
  flex-direction: row;
  background-color: ${Colors.White};
`;

const Row = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
`;

type ScreenHeaderProps = {
  title?: string;
  showPromotionButton?: boolean;
  showDiscountButton?: boolean;
  setShowDiscountCodeInput?: Function;
  showDiscountCodeInput?: boolean;
  blank?: boolean;
  padding?:string
};

const ScreenHeader: React.FC<ScreenHeaderProps> = ({
  title,
  showPromotionButton = false,
  blank = false,
  padding
}) => {
  /** State **/
  const { app } = useSelector((state: PurchasePortalState) => state);
  const { waitList } = app;
  const [showPromotionCodeInput, setShowPromotionCodeInput] = useState(false);
  const [showPromotionCodeButton, setShowPromotionCodeButton] = useState(false);
  const { screen } = useSelector((state: PurchasePortalState) => state.app);

  if (blank) {
    return (
      <Container>
        <Blank />
      </Container>
    );
  }

  /** Render **/
  return (
    <Container>
      <HeaderBar padding={padding}>
        <Row>
          {screen !== ScreenEnum.Tickets && <BackButton /> || screen == ScreenEnum.Tickets &&waitList && <BackButton />}
          <HeaderBarText>{title}</HeaderBarText>
        </Row>
        {showPromotionButton && !showPromotionCodeButton && (
          <TextButton
            icon={Icons.KeyRegular}
            onClick={() => setShowPromotionCodeInput(!showPromotionCodeInput)}
          >
            Enter a code
          </TextButton>
        )}
      </HeaderBar>
      <PromotionCodeInput
        open={showPromotionCodeInput}
        close={() => setShowPromotionCodeInput(false)}
        setShowPromotionCodeButton={setShowPromotionCodeButton}
      />
    </Container>
  );
};

export default ScreenHeader;
