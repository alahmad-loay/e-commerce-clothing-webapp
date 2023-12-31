import React, { FC } from "react";
import { useNavigate } from "react-router-dom";
import Container from 'react-bootstrap/Container';
import { Button, Form } from "react-bootstrap";
import Alert from 'react-bootstrap/Alert';
import "./register.css"

import { Formik, ErrorMessage, FormikProps, Field } from "formik";
import * as Yup from "yup";

// services
import { register } from "../../services/api-service";


export const RegisterPage: FC = () => {
  const [registrationError, setRegistrationError] = React.useState<boolean>(false);
  const navigate = useNavigate();

  const initialValues: any = {
    email: "",
    password: "",
    userRole: ""
  };

  const validationSchema = () => {
    const schema = Yup.object().shape({
      email: Yup.string().email("Please enter a valid email").required("Email is required"),
      password: Yup.string().required("Password is required")
    });
    return schema;
  };

  async function onSubmit(values: any) {
    setRegistrationError(false);
    const { email, password, userRole } = values;
    const success = await register(email, password, userRole);
    if (success) {
      navigate("/login");
    } else {
      setRegistrationError(true);
    }
  }

  return (
    <Formik
      initialValues={initialValues}
      validateOnMount={true}
      validationSchema={validationSchema()}
      onSubmit={onSubmit}>
      {(formikProps: FormikProps<any>) => (
			<div className="registration-container">
			<div className="register-wrapper">
          {registrationError && (
            <Alert key="warning" variant="warning">
              Email already taken. Please try again
            </Alert>
          )}

          <Form>
            <Form.Group className="mb-3" controlId="email">
              <Form.Label>Email</Form.Label>
              <Field
                as={Form.Control}
                name="email"
                type="text"
                placeholder="Email"
                className="form-control"
              />
              <ErrorMessage name="email" component="div" className="text-danger" />
            </Form.Group>

            <Form.Group className="mb-3" controlId="password">
              <Form.Label>Password</Form.Label>
              <Field
                as={Form.Control}
                name="password"
                type="password"
                placeholder="Password"
                className="form-control"
              />
              <ErrorMessage name="password" component="div" className="text-danger" />
            </Form.Group>

            <Button className="account-register-btn" variant="primary" disabled={!formikProps.isValid} onClick={() => formikProps.handleSubmit()}>
              Register
            </Button>
			<Button className="back-login-btn" variant="link" onClick={() => navigate("/login")}>
			  Already have an account? Login
			</Button>
			<Button className="register-back-btn" variant="secondary" onClick={() => navigate("/home")}>
			  Back to home
			</Button>
          </Form>
        </div>
		</div>
      )}
    </Formik>
  );
};
