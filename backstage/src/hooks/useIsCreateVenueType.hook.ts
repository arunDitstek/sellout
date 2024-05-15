import { useLocation } from "react-router-dom";

type IsCreateVenuetTypeHook = () => boolean;

const useIsCreateVenuetType: IsCreateVenuetTypeHook = () => {
  const { pathname } = useLocation();
  return pathname === '/admin/dashboard/venues/create/type';
};

export default useIsCreateVenuetType;
