import React, { useState, useRef } from "react";
import * as Polished from "polished";
import styled from "styled-components";
import { useLocation } from "react-router-dom";
import { Colors, Icon, Icons } from "@sellout/ui";
import Menu, { MenuEventTypes } from "../elements/Menu";
import useNavigateToCreateEvent from "../hooks/useNavigateToCreateEvent.hook";
import useNavigateToCreateVenue from "../hooks/useNavigateToCreateVenue.hook";
import useNavigateToCreateArtist from "../hooks/useNavigateToCreateArtist.hook";
import useNavigateToCreateSeason from "../hooks/useNavigateToCreateSeason.hook";
import { useQuery } from "@apollo/react-hooks";
import GET_PROFILE from "@sellout/models/.dist/graphql/queries/profile.query";

type ContainerProps = {
  open: boolean;
};

const Container = styled.div`
  display: flex;
  border-radius: 10px;
  background: ${Colors.Orange};
`;

const Button = styled.div<ContainerProps>`
  transition: all 0.3s;
  width: fit-content;
  border-radius: 10px 0px 0px 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: ${(props) => (props.open ? "100%" : "40px")};
  height: 40px;
  white-space: nowrap;
  overflow: hidden;
  text-transform: uppercase;
  cursor: pointer;
`;

const Text = styled.div`
  font-size: 1.4rem;
  font-weight: 700;
  color: ${Colors.White};
  margin-left: 10px;
`;

const DropdownBox = styled.div`
  transition: all 0.2s;
  background: rgba(255, 255, 255, 0.1);
  height: 40px;
  width: 25px;
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 0px 10px 10px 0px;
  cursor: pointer;

  &:hover {
    background: ${Polished.lighten(0.1, Colors.Orange)};
  }
`;

type CreateButtonProps = {
  open: boolean;
  hideDropdown?: boolean;
};

const CreateButton: React.FC<CreateButtonProps> = ({ open, hideDropdown }) => {
  let { pathname } = useLocation();
  const anchorElement = useRef<any>(null);
  const navigateToCreateEvent = useNavigateToCreateEvent();
  const navigateToCreateVenue = useNavigateToCreateVenue();
  const navigateToCreateArtist = useNavigateToCreateArtist();
  const navigateToCreateSeason = useNavigateToCreateSeason();

  const { data: organizationData } = useQuery(GET_PROFILE);

  const menuItems = [
    {
      text: "Create event",
      onClick: () => navigateToCreateEvent(),
    },
    // {
    //   text: "Create performer",
    //   onClick: () => navigateToCreateArtist(),
    //   paths: [
    //     "/admin/dashboard/performers",
    //     "/admin/dashboard/performers/create",
    //     "/admin/dashboard/performers/details",
    //   ]
    // },
    {
      text: "Create venue",
      onClick: () => navigateToCreateVenue(),
      paths: [
        "/admin/dashboard/venues",
        "/admin/dashboard/venues/create",
        "/admin/dashboard/venues/details",
        "/admin/dashboard/venues/seating",
        "/admin/dashboard/venues/seating/create",
        "/admin/dashboard/venues/settings",
      ],
    },
  ];

  const createSeason = {
    text: "Create season",
    onClick: () => navigateToCreateSeason(),
    paths: [
      "/admin/dashboard/seasons",
      "/admin/dashboard/seasons/create",
      "/admin/dashboard/seasons/details",
      "/admin/dashboard/seasons/orders",
      "/admin/dashboard/seasons/audience",
      "/admin/dashboard/seasons/reports",
    ],
  };
  if (organizationData && organizationData?.organization?.isSeasonTickets) {
    menuItems.splice(2, 0, createSeason);
  }

  if (pathname.slice(pathname.length - 1) === "/") {
    pathname = pathname.slice(0, -1);
  }

  const createButton =
    menuItems.find((item) => item.paths && item.paths.includes(pathname)) ||
    menuItems[0];

  return (
    <Container>
      <Button open={open} onClick={createButton.onClick}>
        <Icon icon={Icons.Plus} size={14} color={Colors.White} />
        {open && <Text>{createButton.text}</Text>}
      </Button>
      {open && !hideDropdown && (
        <>
          <DropdownBox ref={anchorElement}>
            <Icon icon={Icons.CaretDown} size={14} color={Colors.White} />
          </DropdownBox>
          <Menu
            anchorElement={anchorElement}
            openEvent={MenuEventTypes.Click}
            closeEvent={MenuEventTypes.Click}
            menuItems={menuItems}
            width="170px"
          />
        </>
      )}
    </Container>
  );
};;

export default CreateButton;
