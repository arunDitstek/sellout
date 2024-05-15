import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { useSelector, useDispatch } from "react-redux";
import { BackstageState } from "../../redux/store";
import * as EventActions from "../../redux/actions/event.actions";
import Input from "@sellout/ui/build/components/Input";
import { Colors, Icon, Icons } from "@sellout/ui";
import useSeason from "../../hooks/useSeason.hook";
import { VariantEnum } from "../../../src/models/enums/VariantEnum";
import * as SeasonActions from "../../redux/actions/season.actions";
import { media } from "@sellout/ui/build/utils/MediaQuery";
import ReactTooltip from "react-tooltip";

const Container = styled.div`
  position: relative;
  display: flex;
  input {
    width: 400px;
    ${media.mobile`
      width:100%;
    `};
  }
`;


enum HoverOverIcon {
  Text = " Enter the alpha-numeric code from the end of the YouTube url: https://www.youtube.com/watch?v=123XYZ",
}

type CreateEventVideoLinkProps = { type: string };

const CreateEventVideoLink: React.FC<CreateEventVideoLinkProps> = ({
  type,
}) => {
  /* State */
  const eventState = useSelector((state: BackstageState) => state.event);
  const { eventId, eventsCache } = eventState;
  const { season, seasonId } = useSeason();
  const event = eventsCache[eventId];
  const eventPerformance = event?.performances?.[0];
  const seasonPerformance = season?.performances?.[0];
  const videoLink: string =
    type === VariantEnum.Event
      ? (eventPerformance?.videoLink as string)
      : (seasonPerformance?.videoLink as string);
  const link = `https://www.youtube.com/embed/`;
  const [copedUrl, setCopedUrl] = useState(false);

  /* Actions */
  const dispatch = useDispatch();
  const setEventPerformanceVideoLink = (videoLink: string) =>
    dispatch(
      EventActions.setEventPerformanceVideoLink(
        eventId,
        eventPerformance?._id as string,
        videoLink
      )
    );
  const setSeasonPerformanceVideoLink = (videoLink: string) =>
    dispatch(
      SeasonActions.setSeasonPerformanceVideoLink(
        seasonId,
        seasonPerformance?._id as string,
        videoLink
      )
    );

  const copyToClipBoard = (copyMe) => {
    try {
      navigator.clipboard.writeText(copyMe);
      setCopedUrl(true);
    } catch (err) {
      setCopedUrl(false);
    }
  };
  useEffect(() => {
    if (copedUrl) {
      setTimeout(() => {
        setCopedUrl(!copedUrl);
        ReactTooltip.rebuild();
      }, 2000);
    }
  }, [copedUrl]);

  /** Render */
  return (
    <Container>
      <div style={{ position: "absolute", left: "125px"}}>
        {" "}
        <Icon
          icon={Icons.QuestionSquareSolid}
          color={Colors.Grey4}
          hoverColor={Colors.Grey1}
          size={17}
          tip={HoverOverIcon.Text}
        />
      </div>
      <Input
        label="Promo Video"
        type="url"
        subLabel="(optional)"
        icon={Icons.LinkRegular}
        placeholder="https://www.youtube.com/watch?v=dQw4w9WgXcQ"
        value={`${link + videoLink}`}
        onChange={(e: React.FormEvent<HTMLInputElement>) => {
          if (link.match(e.currentTarget.value)) {
            type === VariantEnum.Event
              ? setEventPerformanceVideoLink("")
              : setSeasonPerformanceVideoLink("");
          } else {
            const videoLink = e.currentTarget.value
              .replace(link, "")
              .replace(/\s+/g, "");
            type === VariantEnum.Event
              ? setEventPerformanceVideoLink(videoLink)
              : setSeasonPerformanceVideoLink(videoLink);
          }
        }}
      />
      {copedUrl ? (
        <span style={{ display: "flex" }}>
          Copied!{" "}
          <Icon icon={Icons.CheckCircle} color={Colors.Green} size={15} />
        </span>
      ) : (
        <Icon
          icon={Icons.CopyRegular}
          color={Colors.Grey4}
          hoverColor={Colors.Grey1}
          size={17}
          tip={"Copy"}
          onClick={() => copyToClipBoard(`${link + videoLink}`)}
        />
      )}
    </Container>
  );
};

export default CreateEventVideoLink;
