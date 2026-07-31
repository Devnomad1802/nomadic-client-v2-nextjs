import { useSelector } from "react-redux";
import { selectCurrentUser, selectIsAuthenticated } from "../slices";
// Update this import if needed

const useAuth = () => {
  const currentUser = useSelector(selectCurrentUser);
  const isAuthenticated = useSelector(selectIsAuthenticated);

  return { currentUser, isAuthenticated };
};

export default useAuth;
