import React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { checkIfAdminUser } from "../helper/function-helper";

// provider
// import { useAuthContext } from "../providers/AuthProvider";

export function AdminGuardedRoute() {
	// const auth = useAuthContext();
	const location = useLocation();
	const token = localStorage.getItem("loginToken");
	const isUserAdmin = checkIfAdminUser();

	if (!token || !isUserAdmin) 
		// Redirect them to the /login page, but save the current location they were
		// trying to go to when they were redirected. This allows us to send them
		// along to that page after they login, which is a nicer user experience
		// than dropping them off on the home page.
		return <Navigate to="/unauthorize" state={{ from: location }} />;
	
	return <Outlet />;
}