import React from "react";
import styled from "styled-components";
import ReactTooltip from "react-tooltip";
import { Icon, Icons, Colors } from '@sellout/ui';

const Container = styled.div`
  position: absolute;
  right: 20px;
  top: 20px;
  display: flex;
  align-items: center;
  z-index: 100;
`;

type EventItemControlsProps = {
  active?: boolean;
  toggleActive?: () => void;
  moveUp?: () => void;
  moveDown?: () => void;
  remove?: () => void;
  itemCount: number;
};

const EventItemControls: React.FC<EventItemControlsProps> = ({
  active,
  toggleActive,
  moveUp,
  moveDown,
  remove,
  itemCount,
}) => {
  /** Hooks */
  React.useLayoutEffect(() => {
    ReactTooltip.hide();
    ReactTooltip.rebuild();
  });

  /** Render */
  return (
    <Container>
      {toggleActive && (
        <Icon
          icon={active ? Icons.EyeRegular : Icons.EyeSlashRegular}
          color={active ? Colors.Grey4 : Colors.Red}
          hoverColor={active ? Colors.Grey1 : Colors.Red}
          size={14}
          onClick={() => toggleActive()}
          margin={moveUp || moveDown || remove ? "0 15px 0 0" : undefined}
          tip={active ? 'This item is available to customers. Click to make inactive.' : 'This item is not available to customers. Click to make active.'}
        />
      )}
      {moveUp && itemCount > 1 && (
        <Icon
          icon={Icons.AngleUpRegular}
          color={Colors.Grey4}
          hoverColor={Colors.Grey1}
          size={14}
          onClick={() => moveUp()}
          margin={moveDown || remove ? "0 15px 0 0" : undefined}
          tip="Move Up"
        />
      )}
      {moveDown && itemCount > 1 && (
        <Icon
          icon={Icons.AngleDownRegular}
          color={Colors.Grey4}
          hoverColor={Colors.Grey1}
          size={14}
          onClick={() => moveDown()}
          margin={remove ? "0 15px 0 0" : undefined}
          tip="Move Down"
        />
      )}
      {remove && (
        <Icon
          icon={Icons.DeleteRegular}
          color={Colors.Grey4}
          hoverColor={Colors.Red}
          size={14}
          onClick={() => remove()}
          tip="Delete"
        />
      )}
    </Container>
  );
};

export default EventItemControls;
