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

export const Container = styled.div`
  position: relative;
  display: flex;
  input{
    width:400px;
    ${media.mobile`
      width:100%;
    `};
  }
`;
enum HoverOverIcon {
  Text=" Enter the alpha-numeric code from the end of the Spotify sharing link: https://open.spotify.com/artist/123456789abcdefghi"
}

type CreateEventSongLinkProps = { type: string };

const CreateEventSongLink: React.FC<CreateEventSongLinkProps> = ({ type }) => {
  /* State */
  const eventState = useSelector((state: BackstageState) => state.event);
  const { eventId, eventsCache } = eventState;
  const { season, seasonId } = useSeason();
  const event = eventsCache[eventId];
  const [copedUrl, setCopedUrl] = useState(false);
  const eventPerformance = event?.performances?.[0];
  const seasonPerformance = season?.performances?.[0];
  const spotifyLink: string = type === VariantEnum.Event
    ? (eventPerformance?.songLink as string)
    : (seasonPerformance?.songLink as string)
  const link = `https://open.spotify.com/embed/`;

  /* Actions */
  const dispatch = useDispatch();
  const setEventPerformanceSongLink = (songLink: string) => {
    dispatch(
      EventActions.setEventPerformanceSongLink(
        eventId,
        eventPerformance?._id as string,
        songLink
      )
    );
  }
  const setSeasonPerformanceSongLink = (songLink: string) =>
    dispatch(
      SeasonActions.setSeasonPerformanceSongLink(
        seasonId,
        seasonPerformance?._id as string,
        songLink
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
      }, 2000)
    }
  }, [copedUrl]);
  /** Render */
  return (
    <Container>
        <div style={{ position: "absolute", left: "120px"}}>
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
        label="Spotify Link"
        subLabel="(optional)"
        icon={Icons.LinkRegular}
        placeholder="https://open.spotify.com/playlist/37i9dQZF1DZ06evO3dtnl6"
        value={`${link + spotifyLink}`}
        onChange={(e: React.FormEvent<HTMLInputElement>) => {
          if (link.match(e.currentTarget.value)) {
            type === VariantEnum.Event ? setEventPerformanceSongLink("") :
              setSeasonPerformanceSongLink("");
          } else {
            const spotifyLink = e.currentTarget.value.replace(link, "").replace(/\s+/g, '');
            type === VariantEnum.Event
              ? setEventPerformanceSongLink(spotifyLink)
              : setSeasonPerformanceSongLink(spotifyLink)
          }
        }}
      />
      {copedUrl ? <span style={{ display: "flex" }} >Copied! <Icon icon={Icons.CheckCircle} color={Colors.Green} size={15} /></span> :
        <Icon icon={Icons.CopyRegular} color={Colors.Grey4} hoverColor={Colors.Grey1} size={17} tip={"Copy"} onClick={() => copyToClipBoard(`${link + spotifyLink}`)} />}
    </Container>
  );
};

export default CreateEventSongLink;