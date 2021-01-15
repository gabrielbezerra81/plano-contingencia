import { useAuth } from "context/Auth/authContext";
import React from "react";
import { Route } from "react-router-dom";
import Home from "screens/Home/Home";
import LoginRedirect from "./LoginRedirect";

const Routes: React.FC = () => {
  const { isLogged } = useAuth();

  return (
    <>
      <Route
        path="/"
        exact
        render={() => {
          if (isLogged) {
            return <Home />;
          }

          return null;
        }}
      />
      <Route path="/logged">
        <LoginRedirect />
      </Route>
    </>
  );
};

export default Routes;
