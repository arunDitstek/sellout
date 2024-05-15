import React from "react";
import styled from "styled-components";
import { Colors } from "@sellout/ui";
import IAnalytics, {
  AnalyticsIntervalEnum
} from "@sellout/models/.dist/interfaces/IAnalytics";
import AnalyticsUtil from "@sellout/models/.dist/utils/AnalyticsUtil";
import AnalyticsGraph from "./AnalyticsGraph";

const Container = styled.div`
  width: fit-content;
  background: ${Colors.White};
  box-shadow: 0px 4px 16px rgba(0, 0, 0, 0.05);
  border-radius: 10px;
  border: 1px solid ${Colors.Grey5};
  margin: 0px 24px 24px 0px;
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
  margin-bottom: 20px;
`;

const CardStatsContainer = styled.div`
  padding: 20px;
`;

type LineItemProps = {
  color?: string;
};

const LineItemContainer = styled.div<LineItemProps>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 15px;
  color: ${(props) => props.color || `${Colors.Grey2}`};
  font-size: 1.4rem;
  font-weight: 500;
`;

const CardGraphContainer = styled.div``;

const CardFooterContainer = styled.div`
  padding: 0px 10px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: ${(props) => props.color || `${Colors.Grey2}`};
  font-size: 1.2rem;
  font-weight: 500;
`;

const LineItem = styled.div``;

type AnalyticsCardSmallProps = {
  data: IAnalytics;
  timezone?: string;
};

const AnalyticsCardSmall: React.FC<AnalyticsCardSmallProps> = ({
  data,
  timezone,
}) => {
  const [hoverIndex, setHoverIndex] = React.useState(undefined);

  return (
    <Container>
      <CardStatsContainer>
        <CardTitle>{data.label}</CardTitle>
        <CardHeaderNumber>
          {AnalyticsUtil.getDisplayMetric(data, hoverIndex)}
        </CardHeaderNumber>
        {data?.segments &&
          data.segments.map((segment, index) => {
            return (
              <LineItemContainer key={index} color={Colors.Grey2}>
                <LineItem>{segment.label}</LineItem>
                <LineItem>
                  {AnalyticsUtil.getDisplayMetric(segment, hoverIndex)}
                </LineItem>
              </LineItemContainer>
            );
          })}
      </CardStatsContainer>
      <CardGraphContainer>
        <AnalyticsGraph
          data={data}
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

export default AnalyticsCardSmall;