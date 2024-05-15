import React, { Fragment } from "react";
import styled from "styled-components";
import ReactTooltip from "react-tooltip";
import { useSelector, useDispatch } from "react-redux";
import { BackstageState } from "../../../redux/store";
import * as AppActions from "../../../redux/actions/app.actions";
import * as EventActions from "../../../redux/actions/event.actions";
import * as SeasonActions from "../../../redux/actions/season.actions";
import { Colors, Icon, Icons, Loader } from "@sellout/ui";
import Input from "@sellout/ui/build/components/Input";
import TextButton, {
  TextButtonSizes,
} from "@sellout/ui/build/components/TextButton";
import Flex from "@sellout/ui/build/components/Flex";
import Button, {
  ButtonTypes,
  ButtonStates,
} from "@sellout/ui/build/components/Button";
import Dropdown from "@sellout/ui/build/components/Dropdown";
import BooleanInput from "../../../elements/BooleanInput";
import Label from "@sellout/ui/build/components/Label";
import IEventCustomField from "@sellout/models/.dist/interfaces/IEventCustomField";
import { CustomFieldTypeEnum } from "@sellout/models/.dist/enums/CustomFieldTypeEnum";
import EventUtil from "@sellout/models/.dist/utils/EventUtil";
import SeasonUtil from "@sellout/models/.dist/utils/SeasonUtil";
import * as ChangeUtil from "../../../utils/ChangeUtil";

import {
  ModalContainer,
  ModalHeader,
  ModalContent,
  ModalFooter,
} from "../../modal/Modal";
import { AppNotificationTypeEnum } from "../../../models/interfaces/IAppNotification";
import ISeasonCustomField from "@sellout/models/.dist/interfaces/ISeasonCustomField";

const Container = styled.div`
  position: relative;
  // width: 700px;
`;

const Row = styled.div`
  display: flex;
  flex-direction: row;
  flex-flow: wrap;
  gap: 15px;
`;

const Spacer = styled.div`
  width: 15px;
  height: 15px;
`;

const IconContainer = styled.div`
  position: relative;
  height: 38px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 45px;
`;

const Warning = styled.div`
  font-size: 1.2rem;
  font-weight: 500;
  color: ${Colors.Grey2};
  margin-left: 7px;
`;

type CreateEventCustomFieldModalProps = {};

const CreateEventCustomFieldModal: React.FC<
  CreateEventCustomFieldModalProps
> = ({}) => {
  /* State */
  const eventState = useSelector((state: BackstageState) => state.event);
  const { eventId, customFieldId, eventsCache } = eventState;
  const event = eventsCache[eventId];

  const seasonState = useSelector((state: BackstageState) => state.season);
  const { seasonId, seasonCache } = seasonState;
  const season = seasonCache[seasonId];
  const seasonCustomFieldId = seasonState.customFieldId;

  const firstPath = window.location.pathname.split("/")[1];
  const isEvent = firstPath === "create-event";
  const isSeason = firstPath === "create-season";

  /* Actions */
  const dispatch = useDispatch();

  const popModal = () => dispatch(AppActions.popModal());
  const saveEvent = () => {
    if (isEvent) {
      dispatch(EventActions.saveEvent(false, false));
    } else if (isSeason) {
      dispatch(SeasonActions.saveSeason(false, false));
    }
  };
  const reCacheCustomField = () => {
    if (isEvent) {
      dispatch(EventActions.reCacheCustomField(eventId, customFieldId));
    } else if (isSeason) {
      dispatch(SeasonActions.reCacheCustomField(seasonId, seasonCustomFieldId));
    }
  };

  const closeCustomFieldModal = async () => {
    popModal();
    if (isEvent) {
      dispatch(EventActions.setCustomFieldId(""));
    } else if (isSeason) {
      dispatch(SeasonActions.setCustomFieldId(""));
    }
  };

  const saveChanges = async () => {
    const customField: IEventCustomField = isEvent
      ? (EventUtil.customField(event, customFieldId) as IEventCustomField)
      : (SeasonUtil.customField(
          season,
          seasonCustomFieldId
        ) as ISeasonCustomField);
    const validate = isEvent
      ? EventUtil.validateCustomField(customField as IEventCustomField)
      : SeasonUtil.validateCustomField(customField as ISeasonCustomField);
    const validationErrors =
      validate?.error?.details?.map((detail: any) => detail.message) ?? [];
    if (validationErrors.length > 0) {
      dispatch(
        AppActions.showNotification(
          validationErrors.join("\n"),
          AppNotificationTypeEnum.Error
        )
      );
      return;
    }
    const hasChanged = isEvent
      ? await ChangeUtil.hasCustomFieldChanged(event, customFieldId)
      : ChangeUtil.hasSeasonCustomFieldChanged(season, seasonCustomFieldId);
    // popModal();
    if (hasChanged) {
      saveEvent();
    }
    closeCustomFieldModal();
  };

  const discardChanges = async () => {
    const hasToRemoved = isEvent
      ? await ChangeUtil.hasToRemoveCustomField(event, customFieldId)
      : await ChangeUtil.hasSeasonToRemoveCustomField(
          season,
          seasonCustomFieldId
        );
    if (hasToRemoved) {
      if (isEvent) {
        dispatch(
          EventActions.removeCustomField(eventId, customFieldId as string)
        );
      } else if (isSeason) {
        dispatch(
          SeasonActions.removeSeasonCustomField(
            seasonId,
            seasonCustomFieldId as string
          )
        );
      }
    }
    reCacheCustomField();
    popModal();
  };

  const cancel = async () => {
    const hasChanged = isEvent
      ? await ChangeUtil.hasCustomFieldChanged(event, customFieldId)
      : await ChangeUtil.hasSeasonCustomFieldChanged(
          season,
          seasonCustomFieldId
        );
    const hasToRemoved = isEvent
      ? await ChangeUtil.hasToRemoveCustomField(event, customFieldId)
      : await ChangeUtil.hasSeasonToRemoveCustomField(
          season,
          seasonCustomFieldId
        );
    if (hasChanged && !hasToRemoved) {
      dispatch(
        AppActions.pushModalConfirmAction({
          title: "Unsaved Changes",
          message: `You have unsaved changes. What would you like to do?`,
          confirm: () => popModal(),
          confirmText: "SAVE CHANGES",
          cancel: () => discardChanges(),
          cancelText: "DISCARD CHANGES",
        })
      );
    } else {
      if (hasToRemoved) {
        if (isEvent) {
          dispatch(
            EventActions.removeCustomField(eventId, customFieldId as string)
          );
        } else if (isSeason) {
          dispatch(
            SeasonActions.removeSeasonCustomField(
              seasonId,
              seasonCustomFieldId as string
            )
          );
        }
      }
      closeCustomFieldModal();
    }
  };

  const setCustomField = (customField: Partial<IEventCustomField>) => {
    if (isEvent) {
      dispatch(
        EventActions.setCustomField(
          eventId,
          customFieldId as string,
          customField
        )
      );
    } else if (isSeason) {
      dispatch(
        SeasonActions.setCustomField(
          seasonId,
          seasonCustomFieldId as string,
          customField
        )
      );
    }
  };

  /** Render */
  const TitleIcon = (
    <Icon
      icon={Icons.KeySolid}
      color={Colors.Grey1}
      size={14}
      margin="0 7px 0 0"
    />
  );

  const types = Object.values(CustomFieldTypeEnum).map(
    (type: CustomFieldTypeEnum) => {
      return {
        text: type,
        value: type,
      };
    }
  );

  return (
    <ModalContainer>
      {(() => {
        if (!event && !season) {
          return (
            <Container>
              <Loader />
            </Container>
          );
        }

        const customField = isEvent
          ? (EventUtil.customField(event, customFieldId) as IEventCustomField)
          : (SeasonUtil.customField(
              season,
              seasonCustomFieldId
            ) as ISeasonCustomField);

        if (!customField) {
          return (
            <Fragment>
              <ModalHeader
                title="Invalid Survey Question"
                close={closeCustomFieldModal}
                icon={TitleIcon}
              />
              <ModalContent>
                <Container>
                  The requested survey question does not exist
                </Container>
              </ModalContent>
              <ModalFooter>
                <div />
                <Flex>
                  <Button
                    type={ButtonTypes.Thin}
                    text="CLOSE"
                    onClick={() => cancel()}
                  />
                </Flex>
              </ModalFooter>
            </Fragment>
          );
        }

        return (
          <Fragment>
            <ModalHeader
              title={customField.label as string}
              close={cancel}
              icon={TitleIcon}
            />
            <ModalContent>
              <Container>
                <Row>
                  <Input
                    autoFocus
                    label="Question"
                    placeholder="Camping Pass"
                    value={customField.label as string}
                    onChange={(e: React.FormEvent<HTMLInputElement>) =>
                      setCustomField({ label: e.currentTarget.value })
                    }
                    maxLength={80}
                  />
                  <Dropdown
                    label="Answer type"
                    value={`${customField.type}`}
                    width="116px"
                    items={types}
                    onChange={(type: CustomFieldTypeEnum) => {
                      setCustomField({
                        type,
                      });
                    }}
                  />
                  <Spacer />
                  <BooleanInput
                    active={customField.required}
                    onChange={() =>
                      setCustomField({ required: !customField.required })
                    }
                    label="Required?"
                  />
                </Row>
                <TypeRow
                  customField={customField}
                  setCustomField={setCustomField}
                />
              </Container>
            </ModalContent>
            <ModalFooter>
              <div />
              <Flex>
                <Button
                  type={ButtonTypes.Thin}
                  state={ButtonStates.Warning}
                  text="CANCEL"
                  margin="0 10px 0 0"
                  onClick={() => {
                    cancel();
                  }}
                />
                <Button
                  type={ButtonTypes.Thin}
                  text="SAVE QUESTION"
                  onClick={() => saveChanges()}
                />
              </Flex>
            </ModalFooter>
          </Fragment>
        );
      })()}
    </ModalContainer>
  );
};

export default CreateEventCustomFieldModal;

type TypeRowProps = {
  customField: IEventCustomField;
  setCustomField: (customField: Partial<IEventCustomField>) => void;
};

const TypeRow = React.memo(({ customField, setCustomField }: TypeRowProps) => {
  /* Render */
  switch (customField.type) {
    case CustomFieldTypeEnum.Text:
      return (
        <Fragment>
          <Spacer />
          <TextType customField={customField} setCustomField={setCustomField} />
        </Fragment>
      );

    case CustomFieldTypeEnum.Number:
      return (
        <Fragment>
          <Spacer />
          <NumberType
            customField={customField}
            setCustomField={setCustomField}
          />
        </Fragment>
      );

    case CustomFieldTypeEnum.Address:
      return null;

    case CustomFieldTypeEnum.Dropdown:
      return (
        <Fragment>
          <Spacer />
          <DropdownType
            customField={customField}
            setCustomField={setCustomField}
          />
        </Fragment>
      );

    default:
      return null;
  }
});

const TextType = React.memo(({ customField, setCustomField }: TypeRowProps) => {
  /* Render */
  return (
    <Row>
      <Input
        label="Min. Length"
        placeholder="none"
        width="116px"
        value={
          customField?.minLength === 0 ? "" : customField.minLength.toString()
        }
        onChange={(e: React.FormEvent<HTMLInputElement>) => {
          const minLength = parseInt(e.currentTarget.value);
          setCustomField({ minLength });
        }}
        type="number"
      />
      <Spacer />
      <Input
        label="Max. Length"
        placeholder="none"
        width="116px"
        value={
          customField?.maxLength === 0 ? "" : customField.maxLength.toString()
        }
        onChange={(e: React.FormEvent<HTMLInputElement>) => {
          const maxLength = parseInt(e.currentTarget.value);
          setCustomField({ maxLength });
        }}
        type="number"
      />
    </Row>
  );
});

const NumberType = React.memo(
  ({ customField, setCustomField }: TypeRowProps) => {
    /* Render */
    return (
      <Row>
        <Input
          label="Min. Value"
          placeholder="none"
          width="97px"
          value={
            customField?.minValue === 0 ? "" : customField.minValue.toString()
          }
          onChange={(e: React.FormEvent<HTMLInputElement>) => {
            const minValue = parseInt(e.currentTarget.value);
            setCustomField({ minValue });
          }}
          type="number"
        />
        <Spacer />
        <Input
          label="Max. Value"
          placeholder="none"
          width="97px"
          value={
            customField?.maxValue === 0 ? "" : customField.maxValue.toString()
          }
          onChange={(e: React.FormEvent<HTMLInputElement>) => {
            const maxValue = parseInt(e.currentTarget.value);
            setCustomField({ maxValue });
          }}
          type="number"
        />
      </Row>
    );
  }
);

const DropdownType = React.memo(
  ({ customField, setCustomField }: TypeRowProps) => {
    /* State */
    const eventState = useSelector((state: BackstageState) => state.event);
    const { eventId, customFieldId } = eventState;

    /* Actions */
    const dispatch = useDispatch();

    const addOption = () =>
      dispatch(EventActions.addCustomFieldOption(eventId, customFieldId));

    const removeOption = (index: number) =>
      dispatch(
        EventActions.removeCustomFieldOption(eventId, customFieldId, index)
      );

    const setOption = (index: number, option: string) =>
      dispatch(
        EventActions.setCustomFieldOption(eventId, customFieldId, index, option)
      );

    /* Hooks */
    React.useLayoutEffect(() => {
      ReactTooltip.hide();
      ReactTooltip.rebuild();
    });

    /* Render */
    return (
      <div>
        <Label text="Options" />
        {customField.options.map((option: string, index: number) => {
          return (
            <Flex direction="row" align="center">
              <Input
                autoFocus
                placeholder={`Option ${index + 1}`}
                width="270px"
                value={option}
                onChange={(e: React.FormEvent<HTMLInputElement>) => {
                  setOption(index, e.currentTarget.value);
                }}
                margin="0 0 10px"
              />
              <Icon
                icon={Icons.DeleteRegular}
                color={Colors.Red}
                onClick={() => removeOption(index)}
                size="1.4rem"
                margin="0 0 0 10px"
                top="-3px"
                tip="Delete Option"
              />
            </Flex>
          );
        })}
        <TextButton
          onClick={() => addOption()}
          icon={Icons.PlusCircleLight}
          size={TextButtonSizes.Small}
        >
          Add another option
        </TextButton>
      </div>
    );
  }
);
