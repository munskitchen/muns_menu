import { useEffect, useState } from "react";
import { db } from "../lib/firebase";
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  doc,
  updateDoc,
} from "firebase/firestore";

export default function Kitchen() {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    const q = query(
      collection(db, "orders"),
      orderBy("createdAt", "asc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data(),
      }));
      setOrders(data);
    });

    return () => unsubscribe();
  }, []);

  const completeOrder = async (id) => {
    await updateDoc(doc(db, "orders", id), {
      status: "completed",
    });
  };

  return (
    <div style={styles.page}>
      <h1 style={styles.title}>🍳 주방 주문 현황</h1>

      {orders.length === 0 && (
        <p style={styles.empty}>조리 중인 주문이 없습니다</p>
      )}

      <div style={styles.grid}>
        {orders
          .filter((o) => o.status === "cooking")
          .map((order) => (
            <div key={order.id} style={styles.card}>
              <div style={styles.header}>
                <span style={styles.table}>
                  테이블 {order.table}
                </span>
              </div>

              <ul style={styles.items}>
                {order.items.map((item, idx) => (
                  <li key={idx} style={styles.item}>
                    {item.name} × {item.qty}
                  </li>
                ))}
              </ul>

              <button
                style={styles.done}
                onClick={() => completeOrder(order.id)}
              >
                완료
              </button>
            </div>
          ))}
      </div>
    </div>
  );
}

const styles = {
  page: {
    padding: 20,
    backgroundColor: "#111",
    minHeight: "100vh",
    color: "white",
  },
  title: {
    fontSize: 32,
    textAlign: "center",
    marginBottom: 20,
  },
  empty: {
    textAlign: "center",
    fontSize: 24,
    opacity: 0.6,
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
    gap: 20,
  },
  card: {
    background: "#222",
    borderRadius: 12,
    padding: 20,
  },
  header: {
    marginBottom: 10,
  },
  table: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#00e0ff",
  },
  items: {
    listStyle: "none",
    padding: 0,
    fontSize: 20,
    marginBottom: 20,
  },
  item: {
    marginBottom: 6,
  },
  done: {
    width: "100%",
    padding: 16,
    fontSize: 22,
    backgroundColor: "#00c853",
    border: "none",
    borderRadius: 8,
    color: "black",
  },
};