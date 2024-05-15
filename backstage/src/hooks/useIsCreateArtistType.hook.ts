import { useLocation } from "react-router-dom";

type IsCreateArtistTypeHook = () => boolean;

const useIsCreateArtistType: IsCreateArtistTypeHook = () => {
  const { pathname } = useLocation();
  return pathname === '/admin/dashboard/performers/create/type';
};

export default useIsCreateArtistType;
