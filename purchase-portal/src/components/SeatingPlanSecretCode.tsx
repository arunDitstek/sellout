import React, { useState, useRef, useLayoutEffect } from 'react';
import styled from 'styled-components';
import { useSelector } from 'react-redux';
import { PurchasePortalState } from "../redux/store";
import { Colors } from "@sellout/ui/build/Colors";
import { Icons } from "@sellout/ui/build/components/Icon";
import PromotionCodeInput from "./PromotionCodeInput";
import BackButton from './BackButton';
import { ScreenEnum } from '../redux/reducers/app.reducer';
import TextButton from '@sellout/ui/build/components/TextButton';
import Input, { InputSizes } from '@sellout/ui/build/components/Input';
import * as OrderActions from '../redux/actions/order.actions';

const Container = styled.div`
  position: relative;
`;
type SubContainerProps = {
    // open?: boolean;
    height: string;
    padding: boolean;
};
const SubContainer = styled.div<SubContainerProps>`
  height: ${props => props.height};
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  width: calc(100% - 48px);
  background-color: ${Colors.White};
  transition: height 0.250s ease-out;
  overflow: hidden;
  padding-left: ${props => props.padding ? '24px' : '0'};
`;


const HeaderBar = styled.div`
  display: flex;
  flex-direction: row;
  background-color: ${Colors.White};
  align-items: center;
  justify-content: space-between;
  padding: 24px 24px 8px;
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
    blank?: boolean;
    checkPromotionCode: any;
    onChangePromotionCode: any;
    promotionCode?: any;
    showPromotionCodeInput?: boolean;
    setShowPromotionCodeInput?: any;
    loading?: boolean;
    showPromotionCodeButton?: boolean;
};

const SeatingPlanSecretCode: React.FC<ScreenHeaderProps> = ({
    title,
    showPromotionButton = false,
    blank = false,
    checkPromotionCode,
    onChangePromotionCode,
    promotionCode,
    showPromotionCodeInput,
    setShowPromotionCodeInput,
    loading,
    showPromotionCodeButton
}) => {
    /** State **/
    const { screen } = useSelector(
        (state: PurchasePortalState) => state.app
    );

    if (blank) {
        return (
            <Container>
                <Blank />
            </Container>
        );
    }

    const inputRef = useRef<HTMLInputElement>(null);

    useLayoutEffect(() => {
        if (showPromotionCodeInput && inputRef && inputRef.current) {
            inputRef.current.focus();
        }
    }, [showPromotionCodeInput]);

    /** Render **/
    return (
        <Container>
            <HeaderBar>
                <Row>
                    {screen !== ScreenEnum.Tickets && <BackButton />}
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
           <SubContainer
                height={showPromotionCodeInput ? "60px" : "0px"}
                // open={showPromotionCodeInput}
                padding={true}
            >
                <Input
                    autoFocus={showPromotionCodeInput}
                    inputRef={inputRef}
                    value={promotionCode}
                    placeholder="Enter a secret code"
                    icon={Icons.KeyRegular}
                    onChange={onChangePromotionCode}
                    onSubmit={checkPromotionCode}
                    canSubmit={promotionCode.length > 0}
                    size={InputSizes.Large}
                    loading={loading}
                    width="calc(100% - 2px)"
                />
            </SubContainer>
        </Container>
    );
};

export default SeatingPlanSecretCode;

