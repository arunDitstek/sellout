import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { BackstageState } from "../../redux/store";
import * as EventActions from "../../redux/actions/event.actions";
import Input from "@sellout/ui/build/components/Input";
import { Colors, Icon, Icons } from "@sellout/ui";
import ReactTooltip from "react-tooltip";
import { Container } from "./CreateEventSongLink";

enum HoverOverIcon {
  Text = "Enter a short name for the event that you want to use for directing customers to purchase tickets. No spaces or special characters other than hyphens are allowed."
}
enum UrlStubInput {
  label = "Url Stub",
  subLabel = "(optional)",
  baseUrlLink = `https://events.sellout.io/`
}


const CreateEventUrlStub: React.FC = () => {
  /* State */
  const eventState = useSelector((state: BackstageState) => state.event);
  const { eventId, eventsCache } = eventState;
  const event = eventsCache[eventId]
  const [copedUrl, setCopedUrl] = useState(false);
  const setEventName = (event?.name as string).replace(/[\s!@#$%^&*()_+=[\]{}|\\;:'",.<>/?]+/g, "-");
  const modifiedString = setEventName.replace(/\s+/g, "-"); 
  const [inputValue, setInputValue] = useState(event?.stub || modifiedString);
  const link = UrlStubInput.baseUrlLink
  const defaultLink = UrlStubInput.baseUrlLink + inputValue
  /* Actions */

  const dispatch = useDispatch();
  const eventStubLink = (stubLink: string) => {
    dispatch(
      EventActions.setEventStubLink(
        eventId,
        stubLink
      )
    );
  }
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
    if (inputValue) {
      eventStubLink(inputValue);
    }
  }, [copedUrl]);
  // /** Render */ 

  return (
    <Container>
      <div style={{ position: "absolute", left: "100px" }}>
        <Icon
          icon={Icons.QuestionSquareSolid}
          color={Colors.Grey4}
          hoverColor={Colors.Grey1}
          size={17}
          tip={HoverOverIcon.Text}
        />
      </div>
      <Input
        label={UrlStubInput.label}
        subLabel={UrlStubInput.subLabel}
        icon={Icons.LinkRegular}
        value={defaultLink}
        onChange={(e: React.FormEvent<HTMLInputElement>) => {
          if (link.includes(e.currentTarget.value)) {
            setInputValue("")
            eventStubLink(modifiedString)
          }
          else {
            const InputUrlLink = e.currentTarget.value
              .replace(link, "")
              .replace(/[^A-Za-z0-9-]/g, "");
            setInputValue(InputUrlLink)
            eventStubLink(InputUrlLink)
          }
        }
        }
      />
      {copedUrl ? <span style={{ display: "flex" }} >Copied! <Icon icon={Icons.CheckCircle} color={Colors.Green} size={15} /></span> :
        <Icon icon={Icons.CopyRegular} color={Colors.Grey4} hoverColor={Colors.Grey1} size={17} tip={"Copy"} onClick={() => copyToClipBoard(`${link + event?.stub}`)} />}
    </Container>
  );
};
export default CreateEventUrlStub;