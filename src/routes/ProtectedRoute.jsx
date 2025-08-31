import { useContext } from "react";
import { Navigate } from "react-router-dom";
import AuthContext from "@/context/AuthContext";

const ProtectedRoute = ({ children, allowedRole }) => {
  const { authTokens, role, authReady } = useContext(AuthContext);

  // Show loader while checking auth
  if (!authReady) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  // If not logged in
  if (!authTokens || !role) {
    // alert("no authtokens ");
    return <Navigate to="/" replace />;
  }

  // if(!allowedRole.includes(role)){
  //   return <Navigate to='/' replace/>;
  // }

  

  // Otherwise, allow access
  return children;
};

export default ProtectedRoute;
