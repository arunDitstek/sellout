//Fix
import React from "react";
import { EPurchasePortalStatus } from "@sellout/models/.dist/enums/EPurchasePortalStatus";
import styled from "styled-components";
import { motion } from "framer-motion";
import { useDispatch } from "react-redux";
import {
  setPurchasePortalStatus,
} from "./redux/actions/app.actions";
import PurchasePortal from "./containers/PurchasePortal";
import * as Intercom from "./utils/intercom";

const Container = styled(motion.div)<any>`
  position: absolute;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;
`;

export default function App(props: any) {
  const dispatch = useDispatch();

  React.useLayoutEffect(() => {
    dispatch(setPurchasePortalStatus(EPurchasePortalStatus.Ready));
  }, []);

  React.useEffect(() => {
    Intercom.connect();
  });

  React.useEffect(() => {
    window.addEventListener("message", (e) => {
      const action = e.data;
      // Ensure its a redux action
      if (action?.type) {
        dispatch(action);
      }
    });
  }, []);

  function close(e: any) {
    let target = e.target;

    if (!target) return;
    const parents = [] as any;
    while (target) {
      parents.unshift(target.id);
      target = target.parentNode;
    }
    if (parents.includes("SELLOUT_CHECKOUT_MODAL")) return;
  }

  return (
    <Container
      initial="hidden"
      animate="visible"
      variants={{
        hidden: { opacity: 0 },
        visible: { opacity: 1 },
      }}
      className="App"
      onClick={(e: React.MouseEvent<HTMLElement>) => close(e)}
    >
      <PurchasePortal {...props} />
    </Container>
  );
}
