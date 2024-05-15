import React from 'react';
import styled from "styled-components";
import PhoneInput from 'react-phone-input-2';
import "react-phone-input-2/lib/semantic-ui.css";
import { Colors } from '../Colors'
import ValidationError from './ValidationError';
import { useMobileMedia } from '../utils/MediaQuery';
import Label from './Label';

export enum PhoneNumberInputSizes {
  Large = "Large",
  Regular = "Regular",
}


type ContainerProps = {
  margin?: string;
};

const Container = styled.div<ContainerProps>`
  margin: ${props => props.margin};
`;

type InnerContainerProps = {
  isMobile: boolean;
  phoneNumberInputSize?: string;
};
// overwrite the preset style imports
const InnerContainer = styled.div<InnerContainerProps>`
  .react-tel-input {
    font-family: "neue-haas-grotesk-display", sans-serif;
    font-size: ${props => props.isMobile ? '1.6rem' : '1.4rem'};
    position: relative;
    width: 100%;
    :disabled {
      cursor: not-allowed;
    }

    .form-control {
      font-family: "neue-haas-grotesk-display", sans-serif;
      text-indent: 15px;
      transition: all 0.2s;
      color: ${Colors.Grey1};
      font-weight: 500;
      position: relative;
      font-size: ${props => props.isMobile ? '1.6rem' : '1.4rem'};
      margin-top: 0 !important;
      margin-bottom: 0 !important;
      margin-left: 50px;
      padding-left: 0;
      background: ${Colors.White};
      border: 1px solid ${Colors.Grey5};
      border-radius: 0px 10px 10px 0px;
      height: ${(props) => props.phoneNumberInputSize === PhoneNumberInputSizes.Regular ? '38px' : '48px'};
      width: calc(100% - 50px);
      z-index: 1;
      outline: none;
      &:hover {
        border: 1px solid ${Colors.Grey5};
      }
      &.invalid-number {
        border: 1px solid ${Colors.Grey5};
        background-color: ${Colors.White};
        border-left-color: ${Colors.Grey5};
        &:focus {
          border: 1px solid ${Colors.Grey4};
          border-left-color: ${Colors.Grey5};
          background-color: ${Colors.White};
        }
      }
      &.open {
        border-color: ${Colors.Grey5};
        border-radius: 0px 10px 0 0;
        /* border-bottom: none; */
        box-shadow: none;
      }
      ::placeholder {
        color: ${Colors.Grey4};
      }
      &:focus {
        border: 1px solid ${Colors.Grey4};
      }
    }

    .flag-dropdown {
      outline: none;
      position: absolute;
      width: 100%;
      top: 0;
      bottom: 0;
      padding: 0;
      background-color: ${Colors.Grey6};
      border: 1px solid ${Colors.Grey5};
      border-radius: 10px;
      &.open {
        background: ${Colors.Grey6};
        border-radius: 10px 10px 0 0;
        .selected-flag {
          background: ${Colors.Grey6};
          border-radius: 10px 0 0 0;
        }
      }
      &:hover, &:focus {
        cursor: pointer;
        .selected-flag {
          background-color: ${Colors.Grey5};
        }
      }
    }

    input[disabled] {
      &+.flag-dropdown {
        &:hover {
          cursor: default;
          .selected-flag {
            background-color: transparent;
          }
        }
      }
    }

    .selected-flag {
      transition: all 0.2s;
      background: ${Colors.Grey6};
      position: relative;
      width: 50px;
      height: 100%;
      padding: 0 0 0 10px;
      border-radius: 10px 0 0 10px;
      .flag {
        position: absolute;
        top: 50%;
        margin-top: -5px;
      }
      .arrow {
        position: relative;
        top: 50%;
        margin-top: -2px;
        left: 25px;
        width: 0;
        height: 0;
        border-left: 3px solid transparent;
        border-right: 3px solid transparent;
        border-top: 4px solid #555;
        &.up {
          border-top: none;
          border-bottom: 4px solid #555;
        }
      }
      &.open {
        z-index: 2;
      }
    }

    .country-list {
      z-index: 2;
      border-radius: 0 0 10px 10px;
      border: 1px solid ${Colors.Grey5};
      border-top: none;
      list-style: none;
      position: absolute;
      padding: 0;
      margin: 0px 0 10px -1px;
      box-shadow: unset;
      background-color: ${Colors.White};
      width: calc(100% + 2px);
      max-height: ${props => props.isMobile ? '180px' : '200px'};
      overflow-y: scroll;
      .flag {
        display: inline-block;
      }
      .divider {
        padding-bottom: 5px;
        margin-bottom: 5px;
        border-bottom: 1px solid #ccc;
      }
      .country {
        padding: 7px 9px;
        .dial-code {
          color: #6b6b6b;
        }
        &:hover {
          background-color: #f1f1f1;
        }
        &.highlight {
          background-color: #f1f1f1;
        }
      }
      .flag {
        margin-right: 7px;
        margin-top: 2px;
      }
      .country-name {
        margin-right: 6px;
      }
      .search {
        position: sticky;
        top: 0;
        background-color: #fff;
        padding: 5px 0 6px 10px;
      }
      .search-emoji {
        display: none;
        font-size: ${props => props.isMobile ? '1.6rem' : '1.4rem'};
      }
      .search-box {
        border: 1px solid #cacaca;
        border-radius: 3px;
        font-size: ${props => props.isMobile ? '1.6rem' : '1.4rem'};
        line-height: 15px;
        padding: 3px 8px 5px;
        outline: none;
      }
      .no-entries-message {
        padding: 7px 10px 11px;
        opacity: .7;
      }
      &::-webkit-scrollbar { width: 12px; }
      &::-webkit-scrollbar-track { background-color: #e6e6e6; }
      &::-webkit-scrollbar-thumb { background-color: #c5c5c4; border-radius: 5px; }
    }

    .invalid-number-message {
      position: absolute;
      z-index: 1;
      font-size: ${props => props.isMobile ? '1.6rem' : '1.4rem'};
      left: 46px;
      top: -8px;
      background: #fff;
      padding: 0 2px;
      color: #de0000;
    }
  }
`;

type PhoneNumberInputProps = {
  value: string;
  onChange: any;
  onEnter?: any;
  validationError?: string;
  subLabel?: string;
  tip?: string;
  placeholder?: string;
  label?: string;
  phoneNumberInputSize?: string;
  margin?: string;
  autoFocus?: boolean;
};
const PhoneNumberInput: React.FC<PhoneNumberInputProps> = ({ 
  value,
  onChange,
  onEnter,
  validationError,
  phoneNumberInputSize,
  subLabel,
  tip,
  label,
  margin,
  autoFocus,
}) => {
  return (
    <Container margin={margin}>
      {label && <Label text={label} subText={subLabel} tip={tip} />}
      <InnerContainer
        isMobile={useMobileMedia()}
        phoneNumberInputSize={phoneNumberInputSize}
      >
        <PhoneInput
          country="us"
          placeholder="Enter your mobile phone number"
          preferredCountries={["us", "ca"]}
          value={value} //TODO: fix issue where this causes a switch to US from CA when typing, doesn't happen when not there
          onKeyDown={(e) => {
            // quick fix for current issue -> https://github.com/bl00mber/react-phone-input-2/issues/222
            if ((e.which === 8 || e.which === 46) && value.length <= 1) {
              e.preventDefault();
            } else if (e.which === 13 && onEnter) {
              onEnter();
            }
          }}
          onChange={(value) => {
            onChange(value);
          }}
          countryCodeEditable={false}
          inputProps={{
            autoFocus,
          }}
        />
        {validationError && (
          <ValidationError validationError={validationError} />
        )}
      </InnerContainer>
    </Container>
  );
};

export default PhoneNumberInput;
