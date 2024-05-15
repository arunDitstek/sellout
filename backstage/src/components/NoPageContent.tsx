import React from "react";
import styled from "styled-components";
import { Colors } from "@sellout/ui";
import CreateButton from "../elements/CreateButton";
import { RolesEnum } from "@sellout/models/.dist/interfaces/IRole";
import usePermission from "../hooks/usePermission.hook";

export const NoContentContainer = styled.div`
  width: 100%;
  height: calc(100% - 60px);
  padding: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: ${Colors.Grey6};
  border-radius: 16px;
`;

export const NoContentTitle = styled.div`
  color: ${Colors.Grey1};
  font-size: 1.8rem;
  font-weight: 600;
  margin-bottom: 10px;
`;

const Subtitle = styled.div`
  color: ${Colors.Grey3};
  font-size: 1.8rem;
  font-weight: 500;
  margin-bottom: 15px;
`;

const ButtonContainer = styled.div`
  width: 200px;
`;

export enum NoPageContentTypes {
  Event = "Event",
  Venue = "Venue",
  Artist = "Artist",
  Season = "Season",
}

interface INoContentObjectTypes {
  title: string;
}

type NoPageContentProps = {
  type: NoPageContentTypes;
};

const NoPageContent: React.FC<NoPageContentProps> = ({ type }) => {
  /** Hooks */
  const hasPermission = usePermission();

  /** Render */
  const types: Record<NoPageContentTypes, INoContentObjectTypes> = {
    [NoPageContentTypes.Event]: {
      title: "No events here",
    },
    [NoPageContentTypes.Venue]: {
      title: "No venues yet",
    },
    [NoPageContentTypes.Artist]: {
      title: "No performers yet",
    },
    [NoPageContentTypes.Season]: {
      title: "No Seasons here",
    },
  };

  const attributes = types[type];

  return (
    <NoContentContainer>
      <NoContentTitle>{attributes?.title}</NoContentTitle>
      {hasPermission(RolesEnum.ADMIN) && ( // Scanner and Box Office roles should not see create button.
        <>
          <ButtonContainer>
            <CreateButton open hideDropdown />
          </ButtonContainer>
        </>
      )}
    </NoContentContainer>
  );
};

export default NoPageContent;
