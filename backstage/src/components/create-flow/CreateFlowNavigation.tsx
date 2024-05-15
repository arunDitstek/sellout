import React from "react";
import styled from "styled-components";
import { useLocation, useHistory } from "react-router-dom";
import { Colors } from "@sellout/ui";
import * as Polished from "polished";
import * as AppActions from "../../redux/actions/app.actions";
import IEventSchedule from "@sellout/models/.dist/interfaces/IEventSchedule";
import { useSelector, useDispatch } from "react-redux";
import { BackstageState } from "../../redux/store";
import { AppNotificationTypeEnum } from "../../models/interfaces/IAppNotification";
import EventUtil from "@sellout/models/.dist/utils/EventUtil";
import SeasonUtil from "@sellout/models/.dist/utils/SeasonUtil";
import { media } from "@sellout/ui/build/utils/MediaQuery";

const Container = styled.div`
  height: auto;
  position: relative;
  display: flex;
  flex-direction: row;
  align-items: center;
  overflow: scroll;
    width:'100px';
`;

const Scroll = styled.div`
  position: relative;
  display: flex;
  flex-direction: row;
  align-items: center;
  flex-flow: wrap;
  padding: 0px 10px;
  grid-gap: 2px;
`;

type ButtonProps = {
  active: number;
  width?: string;
};

const Button = styled.span<ButtonProps>`
  position: relative;
  height: 30px;
  width: ${(props) => props.width};
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  /* padding: 0px 10px; */
  margin-left: 10px;
  background-color: ${(props) =>
    props.active
      ? Polished.rgba(Colors.White, 0.15)
      : Polished.rgba(Colors.White, 0.0)};
  text-decoration: none;

  border-radius: 10px;
  color: ${(props) =>
    props.active ? Colors.White : Polished.rgba(Colors.White, 0.6)};

  &:first-of-type {
    margin-left: 0px;
  }

  &:last-of-type {
    margin-right: 0px;
  }

  &:hover {
    cursor: pointer;
    div {
      color: ${(props) =>
    props.active ? Colors.White : Polished.rgba(Colors.White, 0.8)};
    }
  }
  ${media.mobile`
  margin-left: 1px;
  `};
`;

type TextProps = {
  active: boolean;
};

const Text = styled.div<TextProps>`
  position: relative;
  font-size: 1.4rem;
  font-weight: ${(props) => (props.active ? 600 : 500)};
  /* font-weight: 600; */
  color: inherit;
  white-space: nowrap;
  padding: 0 10px;
  ${media.mobile`
  padding: 2px;
    `};
`;

export type CreateFlowNavigationButton = {
  text: string;
  link: string;
  active: string[];
  width?: any;
  search?: string;
};

type CreateFlowNavigationProps = {
  buttons: CreateFlowNavigationButton[];
};

const CreateFlowNavigation: React.FC<CreateFlowNavigationProps> = ({
  buttons,
}) => {
  const history = useHistory();
  let { pathname } = useLocation();
  if (pathname.slice(pathname.length - 1) === "/") {
    pathname = pathname.slice(0, -1);
  }

  const eventState = useSelector((state: BackstageState) => state.event);
  const { eventId, eventsCache } = eventState;
  const event = eventsCache[eventId];

  const seasonState = useSelector((state: BackstageState) => state.season);
  const { seasonId, seasonCache } = seasonState;
  const season = seasonCache[seasonId];
  const dispatch = useDispatch();

  let validation = false as boolean;
  const dateAndTimeTab =
    window.location.pathname.split("/")[2] === "dates-times";

  const dateValidate = () => {
    const validationMessage = eventId
      ? EventUtil.validateEventDates(event as any)
      : SeasonUtil.validateSeasonDates(season as any);
    if (validationMessage.length > 0) {
      dispatch(
        AppActions.showNotification(
          validationMessage,
          AppNotificationTypeEnum.Warning
        )
      );
      validation = true;
    } else {
      validation = false;
    }
  };

  return (
    <Container>
      <Scroll>
        {buttons.map((b, i) => {
          const active = b.active.includes(pathname);
          return (
            <Button
              key={i}
              onClick={() => {
                if (dateAndTimeTab) {
                  dateValidate();
                }
                if (!validation) {
                  history.push({
                    pathname: b.link,
                    search: b.search ? `?${b.search}` : undefined,
                  });
                }
              }}
              active={active ? 1 : 0}
              style={{ padding: "2px" }}
            >
              <Text active={active}>{b.text}</Text>
            </Button>
          );
        })}
      </Scroll>
    </Container>
  );
};

export default CreateFlowNavigation;
