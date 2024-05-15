import React from "react";
import styled from "styled-components";
import { Colors, Icons } from "@sellout/ui";
import DetailsCard from "../elements/DetailsCard";
import * as Time from "@sellout/utils/.dist/time";

const Section = styled.div`
  margin: 30px 0px;
`;

const Subtitle = styled.div`
  color: ${Colors.Grey1};
  font-weight: 600;
  font-size: 1.4rem;
`;
const EventDays = styled.div``;

type TextProps = {
    margin?: boolean;
};

const Text = styled.div<TextProps>`
  color: ${Colors.Grey2};
  font-weight: 500;
  font-size: 1.5rem;
  margin-bottom: ${(props) => (props.margin ? "20px" : "0px")};
`;

type SeasonEventCardProps = {
    events: any;
};
const SeasonEventCard: React.FC<SeasonEventCardProps> = ({ events }) => {
    /* Hooks */

    /* Render */
    return (
        <DetailsCard
            title="Events"
            headerIcon={Icons.CalendarStarLight}
            width="360px"
            padding="0px 20px"
        >
            <Section>
                {events?.map((a: any, i: number) => {
                    return (
                        <div key={i}>
                            <Subtitle>{a.name}</Subtitle>
                            <EventDays>
                                <Text>
                                    {Time.format(
                                        a?.performances[0]?.schedule[0]?.startsAt,
                                        "ddd, MMM Do [at] h:mma",
                                        a.venue?.address?.timezone
                                    )}
                                </Text>
                                <Text margin>
                                    {" "}
                                    Doors at{" "}
                                    {Time.format(
                                        a?.performances[0]?.schedule[0]?.doorsAt,
                                        "ddd, MMM Do [at] h:mma",
                                        a.venue?.address?.timezone
                                    )}
                                </Text>{" "}
                            </EventDays>
                        </div>
                    );
                })}
            </Section>
        </DetailsCard>
    );
};

export default SeasonEventCard;
