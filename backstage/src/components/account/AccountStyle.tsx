import styled from "styled-components";
import { Colors } from "@sellout/ui";

export const Container = styled.div`
  background: ${Colors.White};
  display: flex;
  flex-direction: column;
  box-shadow: 0px 4px 16px rgba(0, 0, 0, 0.05);
  min-height: 500px;
  width: 440px;
  border-radius: 10px;
  text-align: center;

  @media screen and (max-width: 450px) {
    height: 100%;
    width: 100%;
    border-radius: 0px; 
  }
`;

export const LoaderContainer = styled.div`
  width: 100%;
  height: calc(100% - 60px);
  display: flex;
  align-items: center;
  justify-content: center;
`;

export const Logo = styled.img`
  height: auto;
  width: 100px;
`;

export const SelloutRep = styled.img`
  border-radius: 50%;
  width: 60px;
  height: 60px;
  position: absolute;
  top: 50%;
`;

export const CenterItems = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

export const LogoContainer = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 60px;
  border-radius: 10px 10px 0px 0px;
  background: ${Colors.Blue};
`;

type BodyProps = {
  showLogo?: boolean;
};

export const Body = styled.div<BodyProps>`
  display: flex;
  flex-direction: column;
  flex: 1;
  border-radius: 10px;
  padding: ${(props) => (props.showLogo ? "30px 30px 0px" : "40px 30px 0px")};

  @media screen and (max-width: 450px) {
    padding: 10px 20px 0px;
  }
`;

export const Footer = styled.div`
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 5px 30px 30px;

  @media screen and (max-width: 450px) {
    padding: 5px 20px 150px;
  }
`;

export const StepTitle = styled.div`
  font-weight: 600;
  color: ${Colors.Grey1};
  font-size: 1.8rem;
  margin-bottom: 5px;
`;

export const StepSubtitle = styled.div`
  font-weight: 500;
  color: ${Colors.Grey3};
  font-size: 1.4rem;
  margin-bottom: 15px;
`;

export const InfoText = styled.div`
  font-weight: 500;
  color: ${Colors.Grey2};
  font-size: 1.4rem;
  margin-bottom: 25px;
  text-align: left;
`;

export const ConfirmedContainer = styled.div`
  display: flex;
  width: 100%;
  height: 100%;
  justify-content: center;
  flex-direction: column;
  text-align: center;
`;
