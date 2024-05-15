import React, { useRef } from "react";
import styled from "styled-components";
import ReactDatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import Input from "@sellout/ui/build/components/Input";
import { Icons, Icon } from "@sellout/ui";
import { Colors } from "@sellout/ui";


type ContainerProps = {
  disabled?: boolean;
  minDate? : Date | null;
}

const Container = styled.div<ContainerProps>`
  position: relative;

  input {
    &:hover {
      cursor: ${(props) => (props.disabled ? null : "pointer")};
    }
  }

  * {
    font-family: "neue-haas-grotesk-display", sans-serif;

    &:focus {
      outline: none;
      border: none;
    }
  }

  .react-datepicker-popper {
    box-shadow: 4px 0px 20px rgba(0, 0, 0, 0.05);
    border-radius: 10px;
  }

  .react-datepicker {
    display: flex;
    border: 0px !important;
    border-radius: 10px;
    overflow: hidden;
  }

  .react-datepicker-wrapper {
    width: 100% !important;
  }

  .react-datepicker__input-container {
    width: 100% !important;
  }

  .react-datepicker__day-name,
  .react-datepicker__day,
  .react-datepicker__time-name {
    color: ${(props) => (props.minDate ? Colors.Grey5 : Colors.Grey1)};;
    border-radius: 10px;
    font-size: 1.4rem;
    font-weight: 600;
    line-height: 3rem;
    width: 3rem;
  }

  .react-datepicker__time-container {
    width: unset;
  }
  .react-datepicker__time-container .react-datepicker__time {
    width: unset;
  }

  .react-datepicker__day--selected,
  .react-datepicker__day--in-selecting-range,
  .react-datepicker__day--in-range,
  .react-datepicker__month-text--selected,
  .react-datepicker__month-text--in-selecting-range,
  .react-datepicker__month-text--in-range,
  .react-datepicker__quarter-text--selected,
  .react-datepicker__quarter-text--in-selecting-range,
  .react-datepicker__quarter-text--in-range {
    background-color: ${Colors.Orange} !important;
    color: ${Colors.White} !important;
    border-radius: 10px;
  }

  .react-datepicker__day--selected:hover
    .react-datepicker__day--in-selecting-range:hover
    .react-datepicker__day--in-range:hover
    .react-datepicker__month-text--selected:hover
    .react-datepicker__month-text--in-selecting-range:hover
    .react-datepicker__month-text--in-range:hover
    .react-datepicker__quarter-text--selected:hover
    .react-datepicker__quarter-text--in-selecting-range:hover
    .react-datepicker__quarter-text--in-range:hover {
    background-color: ${Colors.Orange};
    color: ${Colors.White};
    border-radius: 10px;
  }

  .react-datepicker__header {
    background-color: ${Colors.White};
    border-bottom: 0px;
    padding-top: 20px;
  }

  .react-datepicker__current-month {
    color: ${Colors.Grey1};
    font-size: 1.4rem;
    font-weight: 600;
    margin-bottom: 20px;
  }

  .react-datepicker__month {
    display: flex;
    flex-direction: column;
    justify-content: space-around;
    /* height: calc(100% - 78px); */
  }

  .react-datepicker__day:hover,
  .react-datepicker__month-text:hover,
  .react-datepicker__quarter-text:hover {
    background-color: ${(props) => (props.minDate ? null : "pointer")}${Colors.Grey6};
    color: ${Colors.Grey1};
  }

  .react-datepicker__day--keyboard-selected,
  .react-datepicker__month-text--keyboard-selected,
  .react-datepicker__quarter-text--keyboard-selected {
    background-color: ${Colors.Orange};
    color: ${Colors.White};
    border-radius: 10px;
  }

  .react-datepicker__day--keyboard-selected:hover,
  .react-datepicker__month-text--keyboard-selected:hover,
  .react-datepicker__quarter-text--keyboard-selected:hover {
    background-color: ${Colors.Orange} !important;
    color: ${Colors.White} !important;
    border-radius: 10px;
  }

  /* Month */

  .react-datepicker__day-names,
  .react-datepicker__week {
    display: flex;
    justify-content: space-around;
    height: 33px;
    width: 267px;
  }

  /* Time */

  .react-datepicker__time-container {
    border-left: 1px solid ${Colors.Grey6};
  }

  .react-datepicker__header--time {
    display: none;
  }

  .react-datepicker__time-list-item {
    position: relative;
    color: ${Colors.Grey1};
    font-size: 1.4rem;
    font-weight: 600;
    height: auto !important;
    margin-bottom: 10px;
    width: 80px;
    left: 13px;
    border-radius: 10px;
  }

  .react-datepicker__time-list-item:hover {
    color: ${Colors.Grey1};
    background-color: ${Colors.Grey6};
  }

  .react-datepicker__time-list-item--selected {
    color: ${Colors.White} !important;
    background-color: ${Colors.Orange} !important;

    &:hover {
      color: ${Colors.White} !important;
      background-color: ${Colors.Orange} !important;
    }
  }

  .react-datepicker__time-container
    .react-datepicker__time
    .react-datepicker__time-box {
    width: unset;
  }

  .react-datepicker__time-container
    .react-datepicker__time
    .react-datepicker__time-box
    ul.react-datepicker__time-list {
    width: 110px;
  }

  /* Buttons */

  .react-datepicker__navigation {
    border: 7px solid transparent;
    border-left-color: ${Colors.Grey4};
  }

  .react-datepicker__navigation--previous {
    left: 20px;
    top: 23px;
    border: 7px solid transparent;
    border-right-color: ${Colors.Grey4};
  }

  .react-datepicker__navigation--next--with-time:not(.react-datepicker__navigation--next--with-today-button) {
    right: 130px;
    top: 23px;
    font-size: 2rem;
    height: 14px;
    width: 14px;
  }
`;

type DatePickerProps = {
  value: Date | null;
  onChange: (
    date: Date | null,
    event: React.SyntheticEvent<any, Event> | undefined
  ) => void;
  onClear?: Function;
  width?: string;
  label?: string;
  tip?: string;
  timeOnly?: boolean;
  disabled?: boolean;
  minDate?: Date | null;
  maxDate?: Date | null;
};

const DatePicker: React.FC<DatePickerProps> = ({
  value,
  onChange,
  onClear,
  width,
  label,
  tip,
  timeOnly = false,
  disabled = false,
  minDate,
  maxDate
}) => {

  const inputRef = useRef(null);

  return (
    <Container disabled={disabled} minDate={minDate}>
      <ReactDatePicker
        disabled={disabled}
        customInput={
          <Input
          inputRef={inputRef}
            value={value ? value.toString() : "None"}
            icon={Icons.CalendarLight}
            onChange={(what: any, here: any) => {
              console.log(what, here);
            }}
            width={width}
            label={label}
            tip={tip}
            onClear={onClear}
          />
        }
        placeholderText={value ? undefined : "None"}
        selected={value}
        onChange={onChange}
        dateFormat={timeOnly ? "p" : "Pp"}
        showTimeSelect={true}
        showTimeSelectOnly={timeOnly}
        minDate={minDate}
        maxDate={maxDate}
      />
    </Container>
  );
};

const AltInput = styled.input`
  border: none;
  width: 81px;
  color: ${Colors.Grey3};
  font-size: 1.4rem;
`;

const AltInputContainer = styled.div`
  display: flex;
  align-items: center;
  width: fit-content;
`;

export const DatePickerAlt: React.FC<DatePickerProps> = ({
  value,
  onChange,
}) => {

  return (
    <Container>
      <AltInputContainer>
        <Icon
          icon={Icons.CalendarDayRegular}
          color={Colors.Grey3}
          size={14}
          margin="0px 5px 0px 0px"
        />
        <ReactDatePicker
          customInput={
            <AltInput value={value ? value.toString() : "none"} readOnly />
          }
          selected={value}
          onChange={onChange}
          dateFormat="P"
        />
      </AltInputContainer>
    </Container>
  );
};

export default DatePicker;
