import React from "react";
import styled from "styled-components";
import { Colors, Icon, Icons } from "@sellout/ui";
import IAnalytics, {
  AnalyticsDurationEnum,
  AnalyticsIntervalEnum,
} from "@sellout/models/.dist/interfaces/IAnalytics";
import AnalyticsUtil from "@sellout/models/.dist/utils/AnalyticsUtil";
import AnalyticsGraph from "./AnalyticsGraph";
import { RolesEnum } from "@sellout/models/.dist/interfaces/IRole";
import usePermission from "../hooks/usePermission.hook";
import { media } from "@sellout/ui/build/utils/MediaQuery";

const Container = styled.div`
  width: fit-content;
  background: ${Colors.White};
  box-shadow: 0px 4px 16px rgba(0, 0, 0, 0.05);
  border-radius: 10px;
  border: 1px solid ${Colors.Grey5};
  margin: 0px 24px 24px 0px;
  &.svgGraphWrapper{
    ${media.mobile`
      width: 100%;
      box-sizing: border-box;
    `};
  }
`;

const CardTitleContainer = styled.div`
  margin-right: 10px;
  min-width: 120px;
`;

const CardTitle = styled.div`
  color: ${Colors.Grey1};
  font-size: 1.4rem;
  font-weight: 600;
  margin-bottom: 5px;
`;

const CardHeaderNumber = styled.div`
  color: ${Colors.Grey1};
  font-size: 2.4rem;
  font-weight: 600;
`;

const CardStatsContainer = styled.div`
  padding: 20px;
  margin-bottom: 20px;
  display: flex;
  justify-content: space-between;
`;

const Left = styled.div`
  display: flex;
  gap: 20px;
`;

type LineItemProps = {
  color?: string;
};

const LineItemContainer = styled.div<LineItemProps>`
  color: ${(props) => props.color || `${Colors.Grey1}`};
  /* margin-right: 10px;
  min-width: 120px; */
`;

const CardGraphContainer = styled.div`
  overflow: auto;
`;

const LineItem = styled.div``;

const CardFooterContainer = styled.div`
  padding: 0px 10px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: ${(props) => props.color || `${Colors.Grey2}`};
  font-size: 1.2rem;
  font-weight: 500;
  border-radius: 0px 0px 10px 10px;
`;

const CardHeader = styled.div`
  font-size: 1.4rem;
  font-weight: 600;
  color: ${Colors.Grey1};
  padding: 15px;
  display: flex;
  align-items: center;
  border-bottom: 1px solid ${Colors.Grey6};
  justify-content: space-between;
`;

const CardHeaderTitle = styled.div`
  display: flex;
`;

const IntervalOptionsContainer = styled.div`
  display: flex;
  align-items: center;
`;

type IntervalOptionProps = {
  active: boolean;
};
const IntervalOption = styled.div<IntervalOptionProps>`
  color: ${(props) => (props.active ? `${Colors.Orange}` : `${Colors.Grey3}`)};
  font-weight: ${(props) => (props.active ? `600` : `500`)};
  margin-left: 15px;
  cursor: pointer;
`;

type AnalyticsCardMediumProps = {
  data: IAnalytics;
  setQuery: Function;
  query: any;
  timezone?: string;
};

const AnalyticsCardMedium: React.FC<AnalyticsCardMediumProps> = ({
  data,
  setQuery,
  query,
  timezone = undefined,
}) => {
  /** Hooks */
  const hasPermission = usePermission();
  const [queryDurationText, setQueryDurationText] = React.useState(
    AnalyticsDurationEnum.AllTime
  );
  const [hoverIndex, setHoverIndex] = React.useState(undefined);

  /** Render */
  const allowDurationChange = query.eventId || query.venueId || query.artistId;
  return (
    <Container className="svgGraphWrapper">
      <CardHeader>
        <CardHeaderTitle>
          <Icon
            size={14}
            color={Colors.Grey1}
            icon={Icons.GraphGrowth}
            margin="0px 10px 0px 0px"
          />
          {(() => {
            if (query.eventId) {
              return <div>Event Stats</div>;
            } else if (query.venueId) {
              return <div>Venue Stats</div>;
            } else if (query.artistId) {
              return <div>Performer Stats</div>;
            } else {
              return <div>Today's Stats</div>;
            }
          })()}
        </CardHeaderTitle>
        {allowDurationChange && (
          <IntervalOptionsContainer>
            <IntervalOption
              onClick={() => {
                const duration = AnalyticsUtil.durationToUnix(
                  AnalyticsDurationEnum.AllTime
                );
                setQuery({
                  ...query,
                  startDate: duration.startsAt,
                  endDate: duration.endsAt,
                });
                setQueryDurationText(AnalyticsDurationEnum.AllTime);
              }}
              active={queryDurationText === AnalyticsDurationEnum.AllTime}
            >
              All Time
            </IntervalOption>
            <IntervalOption
              onClick={() => {
                const duration = AnalyticsUtil.durationToUnix(
                  AnalyticsDurationEnum.Today
                );
                setQuery({
                  ...query,
                  startDate: duration.startsAt,
                  endDate: duration.endsAt,
                });
                setQueryDurationText(AnalyticsDurationEnum.Today);
              }}
              active={queryDurationText === AnalyticsDurationEnum.Today}
            >
              Today
            </IntervalOption>
          </IntervalOptionsContainer>
        )}
      </CardHeader>
      <CardStatsContainer>
        <Left>
          {hasPermission(RolesEnum.ADMIN) && (
            <CardTitleContainer>
              <CardTitle>{data.label}</CardTitle>
              <CardHeaderNumber>
                {AnalyticsUtil.getDisplayMetric(data, hoverIndex)}
              </CardHeaderNumber>
            </CardTitleContainer>
          )}
          {data?.segments?.map((segment, index) => {
            return (
              <LineItemContainer key={index} color={Colors.Grey1}>
                {" "}
                {/* change to red on negative */}
                <CardTitle>{segment.label}</CardTitle>
                <CardHeaderNumber>
                  {AnalyticsUtil.getDisplayMetric(segment, hoverIndex)}
                </CardHeaderNumber>
              </LineItemContainer>
            );
          })}
        </Left>
      </CardStatsContainer>
      <CardGraphContainer>
        <AnalyticsGraph
          data={data}
          width={600}
          setHoverIndex={setHoverIndex}
          timezone={timezone}
        />
      </CardGraphContainer>
      {data.coordinates && (
        <CardFooterContainer>
          <LineItem>
            {AnalyticsUtil.getDateFormat(
              AnalyticsUtil.getMinXVal(data.coordinates),
              data.interval as AnalyticsIntervalEnum,
              timezone
            )}
          </LineItem>
          <LineItem>
            {AnalyticsUtil.getDateFormat(
              AnalyticsUtil.getMaxXVal(data.coordinates),
              data.interval as AnalyticsIntervalEnum,
              timezone
            )}
          </LineItem>
        </CardFooterContainer>
      )}
    </Container>
  );
};

export default AnalyticsCardMedium;
