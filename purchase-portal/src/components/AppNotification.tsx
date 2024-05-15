import React from "react";
import styled from "styled-components";
import { useSelector } from "react-redux";
import { Colors, Icon, Icons } from "@sellout/ui";
import { PurchasePortalState } from "../redux/store";
import { ErrorPop } from "@sellout/ui/build/components/Motion";
import { AppNotificationTypeEnum } from "../models/interfaces/IAppNotification";

type ContainerProps = {};

const Container = styled(ErrorPop) <ContainerProps>`
  position: fixed;
  width: fit-content;
  align-items: center;
  max-width: 300px;
  top: 15px;
  right: 15px;
  padding: 20px 20px 16px;
  display: flex;
  box-shadow: 0px 4px 12px rgba(0, 0, 0, 0.05);
  border-radius: 10px;
  background: ${Colors.Grey1};
  z-index: 100000;
  white-space: pre-line;
`;

const Text = styled.div`
  font-size: 1.2rem;
  font-weight: 500;
  color: ${Colors.White};
  line-height: 1.6rem;
  margin-left: 10px;
  margin-top: -4px;
`;

type AppNotificationProps = {};

const AppNotification: React.FC<AppNotificationProps> = () => {
    /* State */
    const appState = useSelector((state: PurchasePortalState) => state.app);
    const {
        notification: {
            type,
            message,
            show,
        }
    } = appState;

    /** Render */
    if (!show) return null;
    return (
        <Container duration={0.1}>
            {(() => {
                switch (type) {
                    case AppNotificationTypeEnum.Success:
                        return <Icon icon={Icons.CheckCircle} color={Colors.Green} size={16} />;
                    case AppNotificationTypeEnum.Warning:
                        return <Icon icon={Icons.Warning} color={Colors.Yellow} size={16} />;
                    case AppNotificationTypeEnum.Error:
                        return <Icon icon={Icons.Cancel} color={Colors.Red} size={16} />;
                    default:
                        return <Icon icon={Icons.Warning} color={Colors.Yellow} size={16} />;
                }
            })()}
            <Text>{message}</Text>
        </Container>
    );
};

export default AppNotification;
