import { useLocation } from "react-router-dom";

type IsCreateEventTypeHook = () => boolean;

const useIsCreateEventType: IsCreateEventTypeHook = () => {
  const { pathname } = useLocation();
  return pathname === '/create-event/type';
};

export default useIsCreateEventType;
