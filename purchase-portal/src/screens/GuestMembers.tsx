import React, { useEffect } from "react";
import styled from "styled-components";
import { useSelector, useDispatch } from "react-redux";
import { PurchasePortalState } from "../redux/store";
import { IEventGraphQL } from "@sellout/models/.dist/interfaces/IEvent";
import { Colors } from "@sellout/ui/build/Colors";
import Icon, { Icons } from "@sellout/ui/build/components/Icon";
import ScreenHeader from "../components/ScreenHeader";
import Input, { InputSizes } from "@sellout/ui/build/components/Input";
import * as OrderActions from "../redux/actions/order.actions";
import { ICreateOrderTicketParams } from "@sellout/models/.dist/interfaces/ICreateOrderParams";
import { ErrorKeyEnum } from "../redux/reducers/app.reducer";
import * as AppActions from "../redux/actions/app.actions";
import { ISeasonGraphQL } from "@sellout/models/.dist/interfaces/ISeason";

const Container = styled.div`
  position: relative;
  top: -50px;
  background-color: ${Colors.White};
  border-radius: 15px 15px 0 0;
  overflow: hidden;
  padding-bottom: 50px;
`;

const Title = styled.div`
  font-size: 1.4rem;
  font-weight: 500;
  color: ${Colors.Grey1};
  margin-right: 10px;
  width: 25%;
`;

const Content = styled.div`
  margin: 24px 0 30px;
  padding: 0 15px;
`;

const GuestText = styled.div`
  font-size: 1.4rem;
  font-weight: 500;
  margin: 0px 8px 0px 3px;
  text-align: right;
  line-height: 140%;
`;

const Text = styled.div`
  font-size: 1.4rem;
  font-weight: 400;
  color: ${Colors.Grey2};
  margin: 10px;
  text-align: left;
  line-height: 140%;
`;

const Row = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  padding: 6px 0;
`;
const InputBox = styled.div`
  width: 60%;
`;

const FormGroup = styled.div`
    display: flex;
    margin: 8px 0px 8px 8px;
`;

const Checkbox = styled.input`
    padding: 0;
    height: initial;
    width: initial;
    margin-bottom: 0;
    display: none;
    cursor: pointer;
`;
type CheckBox = {
  checked?: boolean;
  disabled?: boolean;
  id?: number;
}
const Label = styled.label<CheckBox>`
position: relative;
cursor: pointer;
&:before {
    content: '';
    -webkit-appearance: none;
    background-color: transparent;
    border: 2px solid #FF700F;
    box-shadow: 0 1px 2px rgb(0 0 0 / 5%), inset 0px -15px 10px -12px rgb(0 0 0 / 5%);
    padding: 8px;
    display: inline-block;
    position: relative;
    vertical-align: middle;
    cursor: pointer;
    border-radius: 3px;
}
&:after {
    content: '';
    display:  ${props => props.checked ? 'block' : 'none'};
    position: absolute;
    top: 2px;
    left: 8px;
    width: 2px;
    height: 10px;
    border: solid #FF700F;
    border-width: 0 3px 3px 0;
    -webkit-transform: rotate(45deg);
    -ms-transform: rotate(45deg);
    transform: rotate(45deg);
}
`;

type UserEmailProps = {
  event?: IEventGraphQL;
  season?: ISeasonGraphQL;
};

const GuestMembers: React.FC<UserEmailProps> = ({ event, season }) => {
  /** State **/
  const { order, app } = useSelector((state: PurchasePortalState) => state);
  const {
    createOrderParams: { tickets }, ticketRestriction
  } = order;
  const { errors: { ConFirmOrderError } } = app

  const ticketsCheckBoxes = tickets.map(t => t.guestTicket)

  const [isGuestCheckBox, setIsGuestCheckBox] = React.useState(new Array(tickets.length).fill(false));
  /** Actions **/
  const dispatch = useDispatch();
  let error = "" as string;

  const addMemberId = (value: string, index: number, guestTicket: boolean) => {
    dispatch(OrderActions.setMemberId(value, index, guestTicket));
  };

  let memberIds = [] as any;
  tickets.map((a) => a.teiMemberId && memberIds.push(a.teiMemberId));

  let uniqueChars = memberIds?.filter((element: any, index: any) => {
    return memberIds?.indexOf(element) === index;
  });

  useEffect(() => {
    const ticketsCheckBoxes = tickets.map(t => t.guestTicket)
    setIsGuestCheckBox(ticketsCheckBoxes);
    error = ""
      dispatch(AppActions.setError(ErrorKeyEnum.ConFirmOrderError, ""));
  }, []);


  useEffect(() => {
    let errorMsg = "Duplicate member IDs are not allowed.";
    if (event?.organization?.validateMemberId){
      if (memberIds?.length !== uniqueChars.length && !event?.isGuestTicketSale) {
        error = ""
        dispatch(AppActions.setError(ErrorKeyEnum.ConFirmOrderError, errorMsg));
      } else if (!event?.isGuestTicketSale) {
        errorMsg = "";
        dispatch(AppActions.setError(ErrorKeyEnum.ConFirmOrderError, errorMsg));
      }
    } 
  }, [memberIds?.length !== uniqueChars.length]);


  const ErrorMessage = styled.p`
  color: red;
  `;
  const memberId =
    tickets.length / (parseInt(event?.guestTicketPerMember as string) + 1);

  const memberIdReuired = !Number.isInteger(memberId)
    ? parseInt(memberId.toString()) + 1
    : parseInt(memberId.toString());


  const hasDuplicate = (tickets: any) => {
    let duplicate: any = {};
    let ind = 0;
    for (const ticket of tickets) { 
      const ticketsWithSameTEI = tickets.find(
        (x: any, i: number) =>
          x.teiMemberId !== undefined &&
          x.teiMemberId !== "" &&
          x.teiMemberId === ticket.teiMemberId &&
          i !== ind &&
          !x.guestTicket
      );
      if (ticketsWithSameTEI && !ticket.guestTicket) {
        duplicate[ticket.teiMemberId] = 1;
      }
      ind++;
    }
    return Object.keys(duplicate).length
  }

  useEffect(() => {
    if (event?.organization?.validateMemberId){
      if (hasDuplicate(tickets)) {
        error = ""
        const guestMemberError = event?.isGuestTicketSale ? "Duplicate member IDs must be marked as guests." : "Duplicate member IDs are not allowed.";
        dispatch(AppActions.setError(ErrorKeyEnum.ConFirmOrderError, guestMemberError));
      } else {
        if (!app.errors.ConFirmOrderError?.includes("Duplicate")) {
          const guestMemberError = "";
          dispatch(AppActions.setError(ErrorKeyEnum.ConFirmOrderError, guestMemberError));
        }
      }
    }

  }, [])

  const checkGuestTicket = (index: number) => {
    // if (event?.organization?.validateMemberId){

      if (hasDuplicate(tickets)) {
        error = "";
        const guestMemberError = event?.isGuestTicketSale ? "Duplicate member IDs must be marked as guests." : "Duplicate member IDs are not allowed.";
        dispatch(AppActions.setError(ErrorKeyEnum.ConFirmOrderError, guestMemberError));
      } else {
        const guestMemberError = "";
        dispatch(AppActions.setError(ErrorKeyEnum.ConFirmOrderError, guestMemberError));
      }

    // }
  
  }
  let invalidMemberIds = [] as any

  /** Render **/

  return (
    <Container>
      <ScreenHeader title="Member IDs" />
      {event?.isGuestTicketSale ? (
        <Text>
          Member IDs are required for all tickets. If you are purchasing a ticket for a guest, enter the member's ID and then check the Guest checkbox for the ticket.
        </Text>
      ) : (
        <Text>Please enter a valid member ID for each ticket selected.</Text>
      )}
      {season?.isGuestTicketSale && (
        <Text>Please enter a valid member ID for each ticket selected.</Text>
      )}
      <Content>
        {event?.isGuestTicketSale && <GuestText>Guest</GuestText>}
        {tickets &&
          tickets.map((ticket: ICreateOrderTicketParams, index) => {
            ticket.teiMemberId && ticket.isMemberIdValid === false && invalidMemberIds.push(ticket.teiMemberId && ticket.isMemberIdValid === false)
            if(invalidMemberIds.length && app.errors.ConFirmOrderError === "") {
             error = "Invalid memberId(s)"
            } else {
              error = ""
            }
            return (
              <Row key={index}>
                {event ? (
                  <Title>
                    {event?.seatingChartKey ? ticket.seat : ticket.name}:{" "}
                  </Title>
                ) : (
                  <Title>
                    {season?.seatingChartKey ? ticket.seat : ticket.name}:{" "}
                  </Title>
                )}
                <InputBox>
                  <Input
                    value={ticket.teiMemberId as string}
                    onChange={(e: React.FormEvent<HTMLInputElement>) => {
                      addMemberId(
                        e.currentTarget.value as string,
                        index as number,
                        isGuestCheckBox[index]
                      );
                      if (isGuestCheckBox[index] === true) {
                        const newArr = isGuestCheckBox.map((el: boolean, ind: number) => {
                          if (ind === index) {
                            dispatch(OrderActions.setMemberId(ticket.teiMemberId as string, index, !el));
                            return !el
                          } else {
                            dispatch(OrderActions.setMemberId(ticket.teiMemberId as string, index, el));
                            return el
                          }
                        })
                        setIsGuestCheckBox(newArr);
                      }
                      checkGuestTicket(index);
                    }}
                    placeholder="Enter member ID"
                    size={InputSizes.Regular}
                  />
                </InputBox>
                {event?.isGuestTicketSale && <FormGroup
                  onClick={() => {
                    if (ticket.teiMemberId !== undefined && ticket.teiMemberId !== "") {
                      const updatedCheckedState = isGuestCheckBox.map((item, ind) =>
                        (ind === index ? !item : item)
                      );
                      setIsGuestCheckBox(updatedCheckedState);
                      addMemberId(
                        memberIds[index] as string,
                        index as number,
                        updatedCheckedState[index]
                      );
                      checkGuestTicket(index);
                    } else {
                      let error = "Please enter a MemberId to mark it as a guest."
                      dispatch(AppActions.setError(ErrorKeyEnum.ConFirmOrderError, error));
                    }
                  }}
                >
                  <Checkbox type="checkbox" />
                  <Label checked={ticket.guestTicket as boolean}></Label>
                </FormGroup>}
                {/* {ticket.isMemberIdValid &&
                ticket.teiMemberId &&
                  ticket?.teiMemberInfo?.firstName && (
                      <Icon
                      icon={Icons.CheckCircle}
                      color={Colors.Green}
                      size={12}
                      margin="0px"
                    />
                  )} */}
                {ticket.isMemberIdValid === false && ticket.teiMemberId && (
                  <Icon
                    icon={Icons.CancelCircle}
                    color={Colors.Red}
                    size={12}
                    margin="0px 0 0 5px"
                  />
                )}
              </Row>
            );
          })}
        <ErrorMessage>{error || ConFirmOrderError}</ErrorMessage>

      </Content>
    </Container>
  );
};

export default GuestMembers;
