import React from "react";
import styled from "styled-components";
import { Icon, Icons, Colors } from '@sellout/ui';
import * as Time from "@sellout/utils/.dist/time";
import IAnalytics, {
  AnalyticsDurationEnum,
} from '@sellout/models/.dist/interfaces/IAnalytics';
import AnalyticsUtil from '@sellout/models/.dist/utils/AnalyticsUtil';
import Menu, { MenuEventTypes, PopperPlacementTypes } from "../elements/Menu";
import { DatePickerAlt } from '../elements/DatePicker';
import { media } from "@sellout/ui/build/utils/MediaQuery";

const Container = styled.div`
  border-bottom: 1px solid ${Colors.Grey5};
  border-radius: 10px 10px 0px 0px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 20px;
  flex-direction: row;
@media(max-width:576px){
  flex-direction: column;
  padding: 10px 10px;
  align-items: start;
}
  
`;

const DropdownContainer = styled.div`
  cursor: pointer;
  font-weight: 600;
  font-size: 1.4rem;
  color: ${Colors.Orange};
  display: flex;
  transition: all 0.2s;
  border-radius: 10px;
  padding: 4px 8px;
  white-space: nowrap;

  &:hover {
    background: ${Colors.Grey7};
  }
`;

const IntervalOptionsContainer = styled.div`
  display: flex;
  align-items: center;
  ${media.mobile`
    margin-top: 5px;
  `}
`;

type IntervalOptionProps = {
  active: boolean
}
const IntervalOption = styled.div<IntervalOptionProps>`
  color: ${props => props.active ? `${Colors.Orange}` : `${Colors.Grey3}`};
  font-weight: ${props => props.active ? `600` : `500`};
  padding-left: 10px;
  cursor: pointer;
`;

const DatePickerContainer = styled.div`
  display: flex;
  align-items: center;
  margin-left: 30px;
  ${media.mobile`
    margin-left: 0;
  `};
`;

const LeftContainer = styled.div`
  display: flex;
  align-items: center;
`;

const DropdownText = styled.div``;

type AnalyticsQuerySelectorProps = {
  data: IAnalytics;
  setQuery: Function;
  query: any;
  showIntervals: boolean;
};

const AnalyticsQuerySelector: React.FC<AnalyticsQuerySelectorProps> = ({ data, setQuery, query, showIntervals = true }) => {
  const isDefaultToAllTime = query.eventId || query.venueId || query.artistId;
  const [dropdownText, setDropdownText] = React.useState(isDefaultToAllTime ? AnalyticsDurationEnum.AllTime : AnalyticsDurationEnum.Today);
  const anchorElement = React.useRef<any>(null);

  const dropdownItems = [
    {
      text: AnalyticsDurationEnum.AllTime,
      onClick: () => {
        const duration = AnalyticsUtil.durationToUnix(AnalyticsDurationEnum.AllTime);
        setQuery({ ...query, startDate: duration.startsAt, endDate: duration.endsAt });
        setDropdownText(AnalyticsDurationEnum.AllTime);
      },
    },
    {
      text: AnalyticsDurationEnum.Today,
      onClick: () => {
        const duration = AnalyticsUtil.durationToUnix(AnalyticsDurationEnum.Today);
        setQuery({ ...query, startDate: duration.startsAt, endDate: duration.endsAt });
        setDropdownText(AnalyticsDurationEnum.Today);
      },
    },
    {
      text: AnalyticsDurationEnum.OneWeek,
      onClick: () => {
        const duration = AnalyticsUtil.durationToUnix(AnalyticsDurationEnum.OneWeek);
        setQuery({ ...query, startDate: duration.startsAt, endDate: duration.endsAt });
        setDropdownText(AnalyticsDurationEnum.OneWeek);
      },
    },
    {
      text: AnalyticsDurationEnum.OneMonth,
      onClick: () => {
        const duration = AnalyticsUtil.durationToUnix(AnalyticsDurationEnum.OneMonth);
        setQuery({ ...query, startDate: duration.startsAt, endDate: duration.endsAt });
        setDropdownText(AnalyticsDurationEnum.OneMonth);
      },
    },
    {
      text: AnalyticsDurationEnum.MonthToDate,
      onClick: () => {
        const duration = AnalyticsUtil.durationToUnix(AnalyticsDurationEnum.MonthToDate);
        setQuery({ ...query, startDate: duration.startsAt, endDate: duration.endsAt });
        setDropdownText(AnalyticsDurationEnum.MonthToDate);
      },
    },
    {
      text: AnalyticsDurationEnum.YearToDate,
      onClick: () => {
        const duration = AnalyticsUtil.durationToUnix(AnalyticsDurationEnum.YearToDate);
        setQuery({ ...query, startDate: duration.startsAt, endDate: duration.endsAt });
        setDropdownText(AnalyticsDurationEnum.YearToDate);
      },
    },
  ];

  return (
    <>
      <Container>
        <LeftContainer>
          <DropdownContainer ref={anchorElement}>
            <DropdownText>
              {dropdownText}
            </DropdownText>
            <Icon
              icon={Icons.CaretDown}
              size={14}
              color={Colors.Orange}
              margin="0px 0px 0px 10px"
            />
          </DropdownContainer>
          <DatePickerContainer>
            <DatePickerAlt
              value={query.startDate ? Time.date(query.startDate) : data.coordinates ? Time.date(AnalyticsUtil.getMinXVal(data.coordinates)) : Time.date(undefined)}
              onChange={(value: any) => {
                const date = Time.fromDate(value);
                setDropdownText(AnalyticsDurationEnum.Custom);
                setQuery({ ...query, startDate: date })
              }}
            />
            <Icon
              size={14}
              icon={Icons.LongRightArrowRegular}
              color={Colors.Grey3}
              margin="0px 15px 0px 0px"
            />
            <DatePickerAlt
              value={query.endDate ? Time.date(query.endDate) : data.coordinates ? Time.date(AnalyticsUtil.getMaxXVal(data?.coordinates)) : Time.date(undefined)}
              onChange={(value: any) => {
                const date = Time.fromDate(value);
                setDropdownText(AnalyticsDurationEnum.Custom);
                setQuery({ ...query, endDate: date });
              }}
            />
          </DatePickerContainer>
        </LeftContainer>
        <div />
        {data.intervalOptions && showIntervals && (
          <IntervalOptionsContainer>
            {data.intervalOptions.map((interval, index) => {
              return (
                <IntervalOption
                  onClick={() => setQuery({ ...query, interval })}
                  key={index}
                  active={data?.interval === interval}
                >
                  {interval}
                </IntervalOption>
              )
            })}
          </IntervalOptionsContainer>
        )}
      </Container>
      <Menu
        anchorElement={anchorElement}
        openEvent={MenuEventTypes.Click}
        closeEvent={MenuEventTypes.Click}
        menuItems={dropdownItems}
        width="150px"
        placement={PopperPlacementTypes.BottomStart}
      />
    </>
  )
}

export default AnalyticsQuerySelector;