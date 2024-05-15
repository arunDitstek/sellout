import React from "react";
import styled from "styled-components";
import { Link, useLocation } from "react-router-dom";
import useHistory from '../hooks/useHistory.hook';
import { Colors } from "@sellout/ui";
import { AnyARecord } from "dns";

const StyledRRLink = styled.span<any>`
  position: ${(props) => props.position};
  color: ${(props) => props.color};
  font-size: ${(props) => props.size};
  width: ${(props) => props.width};
  top: ${(props) => props.top};
  left: ${(props) => props.left};
  right: ${(props) => props.right};
  text-decoration: none;
`;

const StyledLink = styled.a<any>`
  position: ${(props) => props.position};
  color: ${(props) => props.color};
  font-size: ${(props) => props.size};
  width: ${(props) => props.width};
  top: ${(props) => props.top};
  left: ${(props) => props.left};
  right: ${(props) => props.right};
  text-decoration: none;
`;

type SelloutLinkProps = {
  children: React.ReactNode;
  href?: string;
  to?: any;
  color?: Colors;
  position?: string;
  top?: string;
  left?: string;
  right?: string;
  width?: string;
  size?: string;
  onClick?: Function | null;
};

const SelloutLink: React.FC<SelloutLinkProps> = ({
  children,
  href,
  to,
  color = Colors.Orange,
  position = "relative",
  top = null,
  left = null,
  right = null,
  width = "auto",
  size = null,
  onClick = null,
}) => {

  const history = useHistory();
  
  if (href) {
    return (
      <StyledLink
        onClick={() => (onClick ? onClick() : null)}
        href={href}
        position={position}
        color={color}
        top={top}
        left={left}
        right={right}
        width={width}
        size={size}
      >
        {children}
      </StyledLink>
    );
  }

  return (
    <StyledRRLink
      onClick={() => {
        if(onClick) onClick();
        history.push(to);
      }}
      position={position}
      color={color}
      top={top}
      left={left}
      right={right}
      width={width}
      size={size}
    >
      {children}
    </StyledRRLink>
  );
};

export default SelloutLink;
