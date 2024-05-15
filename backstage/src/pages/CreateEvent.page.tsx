import React from 'react';
import styled from 'styled-components';
import ScrollableNavigation from '../components/ScrollableNavigation';

const Container = styled.div``;

type CreateEventProps = {};

export default function CreateEvent({}: CreateEventProps) {
  const navItems = [
    {
      text: "Details",
      active: true
    },
    {
      text: "Venue",
      active: false
    },
    {
      text: "Dates & Times",
      active: false
    },
    {
      text: "Tickets",
      active: false
    },
    {
      text: "Upgrades",
      active: false
    },
    {
      text: "Secret Codes",
      active: false
    },
    {
      text: "Custom Fields",
      active: false
    },
    {
      text: "Sales Reports",
      active: false
    },
        {
      text: "Additional Options",
      active: false
    }
  ];

  return (
    <Container>
      <ScrollableNavigation 
        items={navItems} 
        title="Create A Concert" 
      />
    </Container>
  );
};
