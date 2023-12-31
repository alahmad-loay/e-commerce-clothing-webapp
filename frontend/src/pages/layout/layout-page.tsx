import React from "react";
import { Outlet } from "react-router-dom";

// components
import Footer from "../../components/layout/footer/footer";
import Header from "../../components/layout/header/header";

function MainLayout() {
	return (
		<>
			<Header/>
			<div className="container">
				<Outlet/>
			</div>
			<br /><br /><br />
			<Footer/>
		</>
   
	);
}

export default MainLayout;
