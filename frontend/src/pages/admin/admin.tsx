import React, { FC, useEffect, useState } from "react";
import { Form, Button, Alert } from "react-bootstrap";
import { insertProduct, insertCategory, deleteCategory, deleteProduct, updateOrderStatus } from "../../services/api-service";
import { IProduct } from "../../model/product";
import { Icategory } from "../../model/category";
import { Formik, Field, ErrorMessage } from "formik";
import { getAllOrders } from "../../services/api-service";
import { IOrder } from "../../model/order";
import * as Yup from "yup";
import "./admin.css";


export const AdminPage: FC = () => {
  const [insertProductStatus, setInsertProductStatus] = useState<"success" | "failure" | null>(null);
  const [insertCategoryStatus, setInsertCategoryStatus] = useState<"success" | "failure" | null>(null);
  const [deleteCategoryStatus, setDeleteCategoryStatus] = useState<"success" | "failure" | null>(null);
  const [deleteProductStatus, setDeleteProductStatus] = useState<"success" | "failure" | null>(null);
  const [statusUpdateAlert, setStatusUpdateAlert] = useState<boolean>(false);
  const [orders, setOrders] = useState<IOrder[]>([]);

  const initialValues: IProduct = {
    name: "",
    description: "",
    quantityAvailable: 0,
    imageUrl: "",
    price: 0,
  };

  const productValidationSchema = Yup.object().shape({
    name: Yup.string().required("Name is required"),
    description: Yup.string().required("Description is required"),
    quantityAvailable: Yup.number().required("Quantity Available is required").positive("Quantity must be positive"),
    imageUrl: Yup.string().required("Image URL is required"),
    price: Yup.number().required("Price is required").positive("Price must be positive"),
  });

  const categoryValidationSchema = Yup.object().shape({
    name: Yup.string().required("Category Name is required").max(10, "Category Name must be at most 10 characters"),
  });

  const handleInsertProduct = async (values: IProduct) => {
    try {
      const insertedProduct = await insertProduct(values);
      if (insertedProduct) {
        setInsertProductStatus("success");
      } else {
        setInsertProductStatus("failure");
      }
    } catch (error) {
      console.error("Failed to insert product:", error);
      setInsertProductStatus("failure");
    }
  };

  const handleInsertCategory = async (values: Icategory) => {
    try {
      const category: Icategory = {
        categoryId: 0,
        name: values.name,
      };
      const insertedCategory = await insertCategory(category);
      if (insertedCategory) {
        setInsertCategoryStatus("success");
      } else {
        setInsertCategoryStatus("failure");
      }
    } catch (error) {
      console.error("Failed to insert category:", error);
      setInsertCategoryStatus("failure");
    }
  };

  const handleDeleteCategory = async (values: { categoryId: number }) => {
    try {
      if (!values.categoryId || isNaN(values.categoryId)) {
        setDeleteCategoryStatus("failure");
        return;
      }
  
      const responseStatus = await deleteCategory(values.categoryId);
      if (responseStatus === 200) {
        setDeleteCategoryStatus("success");
      } else if (responseStatus === 404) {
        setDeleteCategoryStatus("failure");
      } else {
        setDeleteCategoryStatus("failure");
      }
    } catch (error) {
      console.error("Failed to delete category:", error);
      setDeleteCategoryStatus("failure");
    }
  };

  const handleDeleteProduct = async (values: { productId: number }) => {
    try {
      if (!values.productId || isNaN(values.productId)) {
        setDeleteProductStatus("failure");
        return;
      }

      const responseStatus = await deleteProduct(values.productId);
      if (responseStatus === 200) {
        setDeleteProductStatus("success");
      } else if (responseStatus === 404) {
        setDeleteProductStatus("failure");
      } else {
        setDeleteProductStatus("failure");
      }
    } catch (error) {
      console.error("Failed to delete product:", error);
      setDeleteProductStatus("failure");
    }
  };


  const fetchOrders = async () => {
    try {
      const fetchedOrders = await getAllOrders();
      setOrders(fetchedOrders);
    } catch (error) {
      console.error("Failed to fetch orders:", error);
    }
  };
  
  useEffect(() => {
    fetchOrders();
  }, []);


  const handleOrderStatusChange = async (orderId: number, newStatus: string) => {
    try {
      const updatedOrder = await updateOrderStatus(orderId, newStatus);
      if (updatedOrder) {
        setOrders((prevOrders) =>
          prevOrders.map((order) =>
            order.orderId === orderId ? { ...order, status: newStatus } : order
          )
        );
        setStatusUpdateAlert(true); 
      } else {
        console.error("Failed to update order status.");
      }
    } catch (error) {
      console.error("Failed to update order status:", error);
    }
  };
  
  
  
  
  

  return (
    <>
      <div className="products-categories">
        <Formik
          initialValues={initialValues}
          validationSchema={productValidationSchema}
          onSubmit={handleInsertProduct}
        >
          {(formikProps) => (
            <Form className="add-products" onSubmit={formikProps.handleSubmit}>
              {insertProductStatus === "success" && (
                <Alert variant="success">Product inserted successfully!</Alert>
              )}
              {insertProductStatus === "failure" && (
                <Alert variant="danger">Failed to insert product.</Alert>
              )}
              <div className="add-products-div">Add products</div>
              <Form.Group controlId="name">
                <Form.Label>Name</Form.Label>
                <Field type="text" name="name" as={Form.Control} />
                <ErrorMessage name="name" component="div" className="text-danger" />
              </Form.Group>
              <Form.Group controlId="description">
                <Form.Label>Description</Form.Label>
                <Field type="text" name="description" as={Form.Control} />
                <ErrorMessage name="description" component="div" className="text-danger" />
              </Form.Group>
              <Form.Group controlId="quantityAvailable">
                <Form.Label>Quantity Available</Form.Label>
                <Field type="number" name="quantityAvailable" as={Form.Control} />
                <ErrorMessage name="quantityAvailable" component="div" className="text-danger" />
              </Form.Group>
              <Form.Group controlId="imageUrl">
                <Form.Label>Image URL</Form.Label>
                <Field type="text" name="imageUrl" as={Form.Control} />
                <ErrorMessage name="imageUrl" component="div" className="text-danger" />
              </Form.Group>
              <Form.Group controlId="price">
                <Form.Label>Price</Form.Label>
                <Field type="number" name="price" as={Form.Control} />
                <ErrorMessage name="price" component="div" className="text-danger" />
              </Form.Group>
              <Form.Group controlId="categoryId">
                <Form.Label>categoryId</Form.Label>
                <Field type="number" name="categoryId" as={Form.Control} />
                <ErrorMessage name="categoryId" component="div" className="text-danger" />
              </Form.Group>
              <Button
                className="insert-porduct-btn"
                variant="dark"
                type="submit"
                disabled={!formikProps.isValid || formikProps.isSubmitting || !formikProps.dirty}
              >
                Insert Product
              </Button>
            </Form>
          )}
        </Formik>

        <Formik
          initialValues={{ categoryId: 0, name: "" }}
          validationSchema={categoryValidationSchema}
          onSubmit={handleInsertCategory}
        >
          {(formikProps) => (
            <Form className="add-categories" onSubmit={formikProps.handleSubmit}>
              {insertCategoryStatus === "success" && (
                <Alert variant="success">Category inserted successfully!</Alert>
              )}
              {insertCategoryStatus === "failure" && (
                <Alert variant="danger">Failed to insert category.</Alert>
              )}
              <div className="add-categories-div">add categories</div>
              <Form.Group controlId="name">
                <Form.Label>Category Name</Form.Label>
                <Field type="text" name="name" as={Form.Control} />
                <ErrorMessage name="name" component="div" className="text-danger" />
              </Form.Group>
              <Button
                className="insert-porduct-btn"
                variant="dark"
                type="submit"
                disabled={!formikProps.isValid || formikProps.isSubmitting || !formikProps.dirty}
              >
                Insert Category
              </Button>
            </Form>
          )}
        </Formik>
      </div>
  
    <div className="delete-product-category">
      <Formik
        initialValues={{ categoryId: 0 }}
        onSubmit={(values) => handleDeleteCategory({ categoryId: values.categoryId })}
      >
        {(formikProps) => (
          <Form className="delete-category" onSubmit={formikProps.handleSubmit}>
            {deleteCategoryStatus === "success" && (
              <Alert variant="success">Category deleted successfully!</Alert>
            )}
            {deleteCategoryStatus === "failure" && (
              <Alert variant="danger">Failed to delete category.</Alert>
            )}
            <div className="delete-category-div">Delete Category</div>
            <Form.Group controlId="categoryId">
              <Form.Label>Category ID</Form.Label>
              <Field type="number" name="categoryId" as={Form.Control} />
            </Form.Group>
            <Button
              className="delete-category-btn"
              variant="danger"
              type="submit"
              disabled={formikProps.isSubmitting || !formikProps.values.categoryId}
            >
              Delete
            </Button>
          </Form>
        )}
      </Formik>

      <Formik
        initialValues={{ productId: 0 }}
        onSubmit={(values) => handleDeleteProduct({ productId: values.productId })}
      >
        {(formikProps) => (
          <Form className="delete-product" onSubmit={formikProps.handleSubmit}>
            {deleteProductStatus === "success" && (
              <Alert variant="success">Product deleted successfully!</Alert>
            )}
            {deleteProductStatus === "failure" && (
              <Alert variant="danger">Failed to delete product.</Alert>
            )}
            <div className="delete-product-div">Delete Product</div>
            <Form.Group controlId="productId">
              <Form.Label>Product ID</Form.Label>
              <Field type="number" name="productId" as={Form.Control} />
            </Form.Group>
            <Button
              className="delete-product-btn"
              variant="danger"
              type="submit"
              disabled={formikProps.isSubmitting || !formikProps.values.productId}
            >
              Delete
            </Button>
          </Form>
        )}
      </Formik>
    </div>
	<div className="orders">
        <h2>Orders</h2>
        {statusUpdateAlert && (
          <Alert variant="success" onClose={() => setStatusUpdateAlert(false)} dismissible>
            Status updated successfully!
          </Alert>
        )}
        {orders.map((order) => (
          <div key={order.orderItemId}>
            <p>Order ID: {order.orderItemId}</p>
            <p>Product ID: {order.productId}</p>
            <p>Quantity: {order.quantity}</p>
            <p>Customer ID: {order.customerId}</p>
            <p>Status: {order.status}</p>
            <Button className="order-btn" variant="dark" onClick={() => handleOrderStatusChange(order.orderId, "On the Way")}>
              Set On the Way
            </Button>
            <Button className="order-btn" variant="dark" onClick={() => handleOrderStatusChange(order.orderId, "Delivered")}>
              Set Delivered
            </Button>
            <Button className="order-btn" variant="dark" onClick={() => handleOrderStatusChange(order.orderId, "Pending")}>
              Set Pending
            </Button>
            <hr />
          </div>
        ))}
      </div>
    </>
  );
};