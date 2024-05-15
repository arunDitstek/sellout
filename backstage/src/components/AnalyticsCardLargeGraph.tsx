import React from "react";
import styled from "styled-components";
import { Colors, Icon, Icons } from '@sellout/ui';
import IAnalytics, {
  AnalyticsValueTypeEnum, AnalyticsIntervalEnum,
} from '@sellout/models/.dist/interfaces/IAnalytics';
import AnalyticsUtil from '@sellout/models/.dist/utils/AnalyticsUtil';
import * as Price from '@sellout/utils/.dist/price';
import AnalyticsGraph from "./AnalyticsGraph";

const CardTitleContainer = styled.div`
  margin-right: 60px;
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
`;

type LineItemProps = {
  color?: string;
};

const LineItemContainer = styled.div<LineItemProps>`
  color: ${props => props.color || `${Colors.Grey1}`};
  margin-right: 60px;
`;

const SegmentTitle = styled.div`
  font-size: 1.4rem;
  margin-bottom: 5px;
`;

const SegmentNumber = styled.div`
  color: ${Colors.Grey1};
  font-size: 2.4rem;
`;

const DisplaySelectorContainer = styled.div`
  background: rgba(0, 0, 0, 0.5);
  border-radius: 10px;
  display: flex;
  align-items: center;
  padding: 0px 10px;
  height: 30px;
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
  color: ${props => props.color || `${Colors.Grey2}`};
  font-size: 1.2rem;
  font-weight: 500;
  border-radius: 0px 0px 10px 10px;
`;

enum Display {
  Graph = 'Graph',
  Map = 'Map',
}

type AnalyticsCardLargeGraphProps = {
  data: IAnalytics;
  setDisplay: any;
  timezone?: string;
}

const AnalyticsCardLargeGraph: React.FC<AnalyticsCardLargeGraphProps> = ({ data, setDisplay, timezone = undefined  }) => {
  const [hoverIndex, setHoverIndex] = React.useState(undefined);

  return (
    <>
      <CardStatsContainer>
        <Left>
        <CardTitleContainer>
          <CardTitle>
            {data.label}
          </CardTitle>
          <CardHeaderNumber>
            {AnalyticsUtil.getDisplayMetric(data, hoverIndex)}
          </CardHeaderNumber>
        </CardTitleContainer>
        {data?.segments && (
          data.segments.map((segment, index) => {
            return (
              <LineItemContainer key={index} color={Colors.Grey1}>
                <SegmentTitle>
                  {segment.label}
                </SegmentTitle>
                <SegmentNumber>
                  {AnalyticsUtil.getDisplayMetric(segment, hoverIndex)}
                </SegmentNumber>
              </LineItemContainer>
            )
          })
        )}
        </Left>
        <DisplaySelectorContainer>
          <Icon
            icon={Icons.GraphGrowth}
            color={Colors.White}
            size={14}
            margin="0px 10px 0px 0px"
            onClick={() => setDisplay(Display.Graph)}
          />
          <Icon
            icon={Icons.FireRegular}
            color={Colors.Grey4}
            hoverColor={Colors.White}
            size={14}
            onClick={() => setDisplay(Display.Map)}
          />
        </DisplaySelectorContainer>
      </CardStatsContainer>
      <CardGraphContainer>

        <AnalyticsGraph className='analytics-graph-wrapper' data={data} width={990}  height={175} setHoverIndex={setHoverIndex} timezone={timezone} />
      
      </CardGraphContainer>
      {data.coordinates && (
        <CardFooterContainer>
          <LineItem>
            {AnalyticsUtil.getDateFormat(AnalyticsUtil.getMinXVal(data.coordinates), data.interval as AnalyticsIntervalEnum, timezone)}
          </LineItem>
          <LineItem>
          {AnalyticsUtil.getDateFormat(AnalyticsUtil.getMaxXVal(data.coordinates), data.interval as AnalyticsIntervalEnum,timezone)}
          </LineItem>
        </CardFooterContainer>
      )}
    </>
  )
};



export default AnalyticsCardLargeGraph;
