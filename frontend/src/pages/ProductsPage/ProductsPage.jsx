import React, { useEffect, useState } from "react";
import "./ProductsPage.scss";
import ProductsList from "../../components/ProductsList";
import ProductModal from "../../components/ProductModal";
import { api } from "../../api/index";

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("create");
  const [editingProduct, setEditingProduct] = useState(null);

  const role = localStorage.getItem("role");
  const isAdmin = role === "admin";

  useEffect(() => {
    loadProducts();
  }, []);

  const logout = async () => {
    await api.logout();
    window.location.href = "/login";
  };

  const handleAuthError = (err) => {
    const status = err.response?.status;
    const message = err.response?.data?.message;

    if (
      status === 401 ||
      status === 403 ||
      message === "Нет токена" ||
      message === "Неверный токен"
    ) {
      logout();
      return true;
    }

    return false;
  };

  const loadProducts = async () => {
    try {
      setLoading(true);
      const data = await api.getProducts();
      setProducts(data);
    } catch (err) {
      console.error(err);

      if (handleAuthError(err)) return;

      alert("Ошибка загрузки товаров");
    } finally {
      setLoading(false);
    }
  };

  const openCreate = () => {
    if (!isAdmin) return;

    setModalMode("create");
    setEditingProduct(null);
    setModalOpen(true);
  };

  const openEdit = (product) => {
    if (!isAdmin) return;

    setModalMode("edit");
    setEditingProduct(product);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingProduct(null);
  };

  const handleDelete = async (id) => {
    if (!isAdmin) return;

    const ok = window.confirm("Удалить товар?");
    if (!ok) return;

    try {
      await api.deleteProduct(id);
      setProducts((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      console.error(err);

      if (handleAuthError(err)) return;

      alert("Ошибка удаления товара");
    }
  };

  const handleSubmitModal = async (payload) => {
    if (!isAdmin) return;

    try {
      if (modalMode === "create") {
        const created = await api.createProduct(payload);
        setProducts((prev) => [...prev, created]);
      } else {
        const updated = await api.updateProduct(payload.id, payload);
        setProducts((prev) =>
          prev.map((p) => (p.id === payload.id ? updated : p))
        );
      }

      closeModal();
    } catch (err) {
      console.error(err);

      if (handleAuthError(err)) return;

      alert("Ошибка сохранения товара");
    }
  };

  return (
    <div className="page">
      <header className="header">
        <div className="header__inner">
          <div className="brand">Tech Store</div>

          <div className="header__right">
            <span style={{ marginRight: "12px" }}>Роль: {role || "guest"}</span>
            <button className="btn" onClick={logout}>
              Выйти
            </button>
          </div>
        </div>
      </header>

      <main className="main">
        <div className="container">
          <div className="toolbar">
            <h1 className="title">Товары</h1>

            {isAdmin && (
              <button className="btn btn--primary" onClick={openCreate}>
                + Добавить
              </button>
            )}
          </div>

          {loading ? (
            <div className="empty">Загрузка...</div>
          ) : (
            <ProductsList
              products={products}
              onEdit={openEdit}
              onDelete={handleDelete}
              isAdmin={isAdmin}
            />
          )}
        </div>
      </main>

      <footer className="footer">
        <div className="footer__inner">
          © {new Date().getFullYear()} Tech Store
        </div>
      </footer>

      {isAdmin && (
        <ProductModal
          open={modalOpen}
          mode={modalMode}
          initialProduct={editingProduct}
          onClose={closeModal}
          onSubmit={handleSubmitModal}
        />
      )}
    </div>
  );
}