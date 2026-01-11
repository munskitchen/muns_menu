import { useEffect, useState } from "react";
import { db } from "../lib/firebase";
import {
  collection,
  onSnapshot,
  doc,
  updateDoc,
} from "firebase/firestore";

export default function Kitchen() {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, "orders"),
      (snapshot) => {
        const data = snapshot.docs
          .map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }))
          .filter((o) => o.status === "cooking"); // 조리중만

        setOrders(data);
      }
    );

    return () => unsubscribe();
  }, []);

  const updateStatus = async (id, status) => {
    await updateDoc(doc(db, "orders", id), {
      status,
    });
  };

  return (
    <div style={{ padding: 40 }}>
      <h1>주방 주문 화면</h1>

      {orders.length === 0 && <p>조리중 주문 없음</p>}

      {orders.map((order) => (
        <div
          key={order.id}
          style={{
            border: "2px solid #000",
            marginBottom: 16,
            padding: 16,
          }}
        >
          <h2>테이블 {order.table}</h2>

          {/* ✅ status 표시 */}
          <p>
            상태: <strong>{order.status}</strong>
          </p>

          <ul>
            {order.items.map((item, idx) => (
              <li key={idx}>
                {item.name} × {item.qty}
              </li>
            ))}
          </ul>

          {/* ✅ 완료 / 취소 버튼 */}
          <div style={{ marginTop: 10 }}>
            <button
              onClick={() => updateStatus(order.id, "done")}
            >
              완료
            </button>{" "}
            <button
              onClick={() => updateStatus(order.id, "cancelled")}
            >
              취소
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}