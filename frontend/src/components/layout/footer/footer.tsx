import React, { FC } from "react";
import { Container } from "react-bootstrap";

import "./footer.css";

const Footer: FC = () => {
	return (
		<div className="footer">
			<Container fluid>
				<div className="text-muted">
					&copy; {new Date().getFullYear()} Loay.com
				</div>
			</Container>
		</div>
	);
};

export default Footer;