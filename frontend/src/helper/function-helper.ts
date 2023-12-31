import { IUserDetails } from "../model/user-details";
import { UserRole } from "./enum-helper";

export function getLoggedInUserDetails(): IUserDetails {
    const userInfo = localStorage.getItem("userDetails");
    const userDetails = userInfo ? JSON.parse(userInfo) : undefined;
    return userDetails;
}

export function checkIfAdminUser() {
    const userDetails = getLoggedInUserDetails();
	return userDetails?.userRole === UserRole.Admin ? true : false;
}


export function checkIfCustomerUser() {
    const userDetails = getLoggedInUserDetails();
	return userDetails?.userRole === UserRole.Customer ? true : false;
}