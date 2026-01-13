import { useEffect, useState } from "react";
import { db } from "../lib/firebase";
import {
  collection,
  query,
  orderBy,
  onSnapshot,
} from "firebase/firestore";

export default function KitchenHistory() {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    const q = query(
      collection(db, "orders"),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs
        .map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))
        .filter(
          (o) =>
            o.status === "completed" ||
            o.status === "canceled"
        );

      setOrders(data);
    });

    return () => unsubscribe();
  }, []);

  return (
    <div style={{ padding: 20 }}>
      <h1>📜 주문 히스토리</h1>

      {orders.length === 0 && <p>기록 없음</p>}

      {orders.map((order) => (
        <div
          key={order.id}
          style={{
            border: "1px solid #ccc",
            marginBottom: 12,
            padding: 12,
          }}
        >
          <strong>
            테이블 {order.table} (
            {order.status === "completed"
              ? "완료"
              : "취소"}
            )
          </strong>

          <ul>
            {order.items.map((item, idx) => (
              <li key={idx}>
                {item.name} × {item.qty}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}