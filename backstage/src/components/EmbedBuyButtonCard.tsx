import React, { useState, useRef } from "react";
import styled from "styled-components";
import { Colors, Icons } from "@sellout/ui";
import DetailsCard from "../elements/DetailsCard";
import Label from "@sellout/ui/build/components/Label";
import Flex from "@sellout/ui/build/components/Flex";
import ColorPicker from "./ColorPicker";
import Menu, { MenuEventTypes } from "../elements/Menu";
import { ISeasonGraphQL } from "@sellout/models/.dist/interfaces/ISeason";
import { IEventGraphQL } from "@sellout/models/.dist/interfaces/IEvent";
import { media } from "@sellout/ui/build/utils/MediaQuery";

const Section = styled.div`
  margin-right: 20px;
`;

const SelectColorContainer = styled.div`
  border: 1px solid ${Colors.Grey5};
  width: 100px;
  height: 40px;
  display: flex;
  align-items: center;
  border-radius: 5px;
  cursor: pointer;
`;

const SelectColorColor = styled.div`
  height: 26px;
  width: 26px;
  background-color: ${(props) => props.color};
  border-radius: 5px;
  margin: 0 7px;
  border: 1px solid ${Colors.Grey6};
`;

const SelectColorText = styled.div`
  font-size: 1.2rem;
  color: ${Colors.Blue};
  font-weight: 400;
`;

const ImmutableTextArea = styled.div`
  height: fit-content;
  width: 360px;
  padding: 10px 15px;
  border-radius: 10px;
  overflow: auto;
  word-wrap: break-word;
  border: 1px solid ${Colors.Grey5};
  ${media.mobile`
    width: 100%;
    box-sizing: border-box;

  `};
`;

const FlexContainer = styled.div`
  display:flex; 
  ${media.mobile`
    flex-direction:column;
    grid-gap: 15px;
  `};
`;

const Spacer = styled.div`
  height: 25px;
`;

function getEmbedHTML(
  eventId: string,
  seasonId: string,
  buttonColor: string,
  color: string,
) {
  return `
    <a href="javascript:void(0)" style="text-decoration:none;">
      <img src onerror="window.Sellout.preload('${eventId}','${seasonId}','checkout',false)" style="display:none;"> 
      <div style="
        background-color:${buttonColor}; 
        color:${color}; 
        font-family: sans-serif;
        border-radius: 10px; 
        height:40px; 
        width:150px; 
        display:inline-flex; 
        align-items:center; 
        justify-content:center; 
        font-weight: 600;
      "
      onClick="window.Sellout.open('${eventId}','${seasonId}','checkout',false)">GET TICKETS</div>
    </a>
  `;
}

type EmbedBuyButtonCardProps = {
  event?: IEventGraphQL;
  season?: ISeasonGraphQL;
};

// TODO: figure out how to click color picker items without menu closing
const EmbedBuyButtonCard: React.FC<EmbedBuyButtonCardProps> = ({
  event,
  season,
}) => {
  /** Hooks */
  const [color, setColor] = useState(Colors.White);
  const [buttonColor, setButtonColor] = useState(Colors.Orange);
  const fontAnchorElement = useRef<any>(null);
  const buttonAnchorElement = useRef<any>(null);

  /* Render */

  const HTML = getEmbedHTML(
    event?._id as string,
    season?._id as string,
    buttonColor,
    color,
  );
  return (
    <DetailsCard
      title="Embed Buy Button"
      headerIcon={Icons.Embed}
      width="600px"
      
    >
      <FlexContainer>        
        <Section>
          <Label text={"Button Preview"} />
          <div dangerouslySetInnerHTML={{ __html: HTML }} />
        </Section>
        <Section>
          <Label text={"Button Color"} />
          <SelectColorContainer ref={buttonAnchorElement}>
            <SelectColorColor color={buttonColor} />
            <SelectColorText>{buttonColor.toUpperCase()}</SelectColorText>
            <Menu
              menuHead={
                <ColorPicker
                  color={buttonColor}
                  onChange={({ hex }: { hex: any }) => setButtonColor(hex)}
                />
              }
              anchorElement={buttonAnchorElement}
              openEvent={MenuEventTypes.Click}
              closeEvent={MenuEventTypes.MouseLeave}
              width="fit-content"
            />
          </SelectColorContainer>
        </Section>
        <Section>
          <Label text={"Font Color"} />
          <SelectColorContainer ref={fontAnchorElement}>
            <SelectColorColor color={color} />
            <SelectColorText>{color.toUpperCase()}</SelectColorText>
            <Menu
              menuHead={
                <ColorPicker
                  color={color}
                  onChange={({ hex }: { hex: any }) => setColor(hex)}
                />
              }
              anchorElement={fontAnchorElement}
              openEvent={MenuEventTypes.Click}
              closeEvent={MenuEventTypes.MouseLeave}
              width="fit-content"
            />
          </SelectColorContainer>
        </Section>
      </FlexContainer>
      <Spacer />
      <Label
        text={"Paste this code snippet into the <head> of your entrire site:"}
      />
      <ImmutableTextArea>
        <div>{'<script src="https://js.stripe.com/v3/"></script>'}</div>
        <div>{'<script src="https://embed.sellout.io/embed.js"></script>'}</div>
      </ImmutableTextArea>
      <Spacer />
      <Label
        text={"Embed this HTML code where you want the button to show up:"}
      />
      <ImmutableTextArea>{HTML}</ImmutableTextArea>
    </DetailsCard>
  );
};

export default EmbedBuyButtonCard;
