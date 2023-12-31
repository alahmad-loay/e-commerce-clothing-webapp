import React from "react";

import { Route, Routes } from "react-router-dom";

// pages
import { RegisterPage } from "../pages/register/register";
import { HomePage } from "../pages/home/home";
import  { LoginPage }  from "../pages/login/login";
import Page404 from "../pages/404/404Page";

// providers
import { MyAccount } from "../pages/account/account-page";
import MainLayout from "../pages/layout/layout-page";
import { AdminGuardedRoute } from "./AdminGuardedRoute";
import { AdminPage } from "../pages/admin/admin";

// service
import UnauthorizePage from "../pages/unauthorize-page/Unauthorize-Page";
import { GuardedRoute } from "./GuardedRoute";
import { ProductPage } from "../pages/products/products";
import { CartPage } from "../pages/cart/cart";
import { ProductDetailPage } from "../pages/products/productDetail";

const AppRoutes = () => (
  <Routes>
    <Route element={<MainLayout />}>
      <Route path="/" element={<HomePage />} />
      <Route path="/home" element={<HomePage />} />
      <Route path="/products" element={<ProductPage />} /> 
      <Route path="/products/:productId" element={<ProductDetailPage />} />
      <Route path="/cart" element={<CartPage />} />

      <Route element={<GuardedRoute />}>
        <Route path="/account" element={<MyAccount />} />
      </Route>

      <Route element={<AdminGuardedRoute />}>
        <Route path="/admin" element={<AdminPage />} />
      </Route>
    </Route>
    <Route path="/login" element={<LoginPage />} />
    <Route path="/register" element={<RegisterPage />} />
    <Route path="/unauthorize" element={<UnauthorizePage />} />
    <Route path="*" element={<Page404 />} />
  </Routes>
);

export default AppRoutes;
