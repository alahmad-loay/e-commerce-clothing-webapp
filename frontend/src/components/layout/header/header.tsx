import React, { FC } from "react";

import { Container, Nav, Navbar } from "react-bootstrap";
import { Link } from "react-router-dom";

// helper
import { checkIfAdminUser, checkIfCustomerUser } from "../../../helper/function-helper";

import "./header.css";

const Header: FC = () => {
	const isAdmin = checkIfAdminUser();
	const isCustomer = checkIfCustomerUser();
	
	return (

		<Navbar bg="light" expand="lg">
			<Container fluid>
				<Navbar.Brand>Store</Navbar.Brand>
				<Navbar.Toggle aria-controls="navbarScroll" />
				<Navbar.Collapse id="navbarScroll">
					<Nav className="me-auto my-2 my-lg-0" style={{ maxHeight: "100px" }} navbarScroll>
						<Link className="nav-link" to="/home">Home</Link>
						<Link className="nav-link" to="/products">Products</Link>
						<Link className="nav-link" to="/account">Account</Link>
						{isCustomer && <Link className="nav-link" to="/cart">Cart</Link> }
						{isAdmin && <Link className="nav-link" to="/admin">Manage</Link> }
					</Nav>
				</Navbar.Collapse>
			</Container>
		</Navbar>
	);
};

export default Header;