import React, { FC, useEffect, useState } from "react";
import CardGroup from 'react-bootstrap/CardGroup';
import Card from 'react-bootstrap/Card';
import "./home.css";
import Button from 'react-bootstrap/Button';
import {  useNavigate } from "react-router-dom";

// sevices
import { getTopProducts } from "../../services/api-service";

// models
import { IProduct } from "../../model/product";
import { Link } from "react-router-dom";

export const HomePage: FC = () => {
	const [topProducts, setTopProducts] = useState<IProduct[]>([]);
	const navigate = useNavigate();

	useEffect(() => {
		getMainProducts();
	}, []);

	async function getMainProducts() {
		const topProducts = await getTopProducts();
		setTopProducts(topProducts);
	}

	return (
		<>
		  <div className="hero-section">
        <div className="shop-hero">
            <div>Men Clothing</div>
			<Link to="/products">
          		<button className="call-to-action">Shop Now</button>
        	</Link>
        </div>
        </div>

			<div className="Arrivals">New Arrivals</div>
			{topProducts?.length > 0 && (
				<CardGroup>
					{topProducts.slice(-3).reverse().map((product, index) => {
						return (
							<Card key={index}>
								<Card.Img
									variant="top"
									src={product.imageUrl}
								/>
								<Card.Body>
									<Card.Title>{product.name}</Card.Title>
									<Card.Text>{product.description}</Card.Text>
								</Card.Body>
								<Card.Footer>
									<small className="text-muted">
										Quantity: {product.quantityAvailable}
									</small>
								</Card.Footer>
							</Card>
						);
					})}
				</CardGroup>
			)}
			<Button className="register-btn" variant="link" onClick={() => navigate("/products")}>
				See all products here
			</Button>
		</>
	);
};
