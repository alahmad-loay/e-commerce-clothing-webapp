import React, { FC } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Container from 'react-bootstrap/Container';
import { Button, Form } from "react-bootstrap";
import Alert from 'react-bootstrap/Alert';
import "./login.css";

import { Formik, ErrorMessage, FormikProps, Field } from "formik";
import * as Yup from "yup";

// services
import { getUserInfo, login } from "../../services/api-service";


export const LoginPage: FC = () => {
	const [invalidCredential, setInvalidCredential] = React.useState<boolean>(false);
	const navigate = useNavigate();
	const location = useLocation();

	const state = location.state as { from: Location };
	const from = state ? state.from.pathname : "/";

	const initialValues: any = {
		email: "",
		password: ""
	};

	const validationSchema = () => {
		const schema = Yup.object().shape({
			email: Yup.string().email("Please enter a valid email").required("Email is required"),
			password: Yup.string().required("Password is required")

		});
		return schema;
	};

	async function onSubmit(values: any) {
		setInvalidCredential(false);
		const loginResponseToken = await login(values.email, values.password);

		if (loginResponseToken) {
			const userDetails = await getUserInfo(values.email);

			localStorage.setItem("loginToken", loginResponseToken);
			localStorage.setItem("userDetails", JSON.stringify(userDetails));
			navigate(from, { replace: true });
		} else {
			setInvalidCredential(true);
		}
	};


	return (
		<Formik
			initialValues={initialValues}
			validateOnMount={true}
			validationSchema={validationSchema()}
			onSubmit={onSubmit}>
			{(formikProps: FormikProps<any>) =>
			<div className="login-container">
				<div className="trials">
					trials: <br />
					email: 1- customer@gmail.com <br />
					password: customer <br />
					2- admin@gmail.com <br />
					password: admin
				</div>
				<div className="wrapper">
					{
						invalidCredential && <Alert key="warning" variant="warning">
							Wrong username or password
						</Alert>
					}
					<Form>
						<Form.Group className="mb-3" controlId="email">
							<Form.Label>Email</Form.Label>
							<Field as={Form.Control} name="email" type="text" placeholder="Email" className="form-control" />
							<ErrorMessage name="email" component="div" className="text-danger" />
						</Form.Group>

						<Form.Group className="mb-3" controlId="password">
							<Form.Label>Password</Form.Label>
							<Field as={Form.Control} name="password" type="password" placeholder="Password" className="form-control" />
							<ErrorMessage name="password" component="div" className="text-danger" />
						</Form.Group>
						<Button className="login-btn" variant="dark" disabled={!formikProps.isValid} onClick={() => formikProps.handleSubmit()}>
						Login
						</Button>
						<Button className="register-btn" variant="link" onClick={() => navigate("/register")}>
						Dont have an account? Register
					</Button>
					<Button className="back-btn" variant="secondary" onClick={() => navigate("/home")}>
						Back to home
					</Button>
					</Form>
					</div>
					</div>
			}
		</Formik>
	);

};



